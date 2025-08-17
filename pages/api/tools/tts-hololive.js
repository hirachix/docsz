import axios from 'axios';
import crypto from 'crypto';
import { incrementRequestCount } from '../../../lib/db';

const hololiveModels = {
  tokinosora: {
    name: 'Tokino Sora',
    model: 'weights/hololive-jp/Sora/Sora_RigidSpinner.pth',
    index: 'weights/hololive-jp/Sora/added_IVF4947_Flat_nprobe_1_SoraTokino_v2_mbkm.index'
  },
  // Tambahkan model lainnya seperti di kode asli
};

function generateSessionHash() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 11; i++) {
    const byte = crypto.randomBytes(1)[0];
    result += chars[byte % chars.length];
  }
  return result;
}

async function ttsHololive(text, characterKey) {
  const character = hololiveModels[characterKey.toLowerCase()];
  if (!character) throw new Error('Character not found');

  const session_hash = generateSessionHash();

  const payload = {
    data: [
      character.name,
      character.model,
      character.index,
      "",
      null,
      text,
      "English-Ana (Female)",
      0,
      "pm",
      0.4,
      1,
      0,
      1,
      0.23
    ],
    event_data: null,
    fn_index: 52,
    trigger_id: 711,
    session_hash
  };

  await axios.post(
    "https://kit-lemonfoot-vtuber-rvc-models.hf.space/queue/join?__theme=system",
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );

  const response = await axios.get(
    `https://kit-lemonfoot-vtuber-rvc-models.hf.space/queue/data?session_hash=${session_hash}`,
    {
      responseType: 'stream',
      headers: { 'Accept': 'text/event-stream' }
    }
  );

  return new Promise((resolve, reject) => {
    let audioUrl = null;

    response.data.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      for (let line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.replace('data: ', ''));
            if (parsed.msg === 'process_completed') {
              audioUrl = parsed.output.data[1].url;
              resolve(audioUrl);
              response.data.destroy();
              return;
            }
          } catch {}
        }
      }
    });

    response.data.on('error', err => reject(err));
    response.data.on('end', () => {
      if (!audioUrl) reject(new Error('Audio URL not found'));
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  const { text, character } = req.query;

  if (!text || !character) {
    return res.status(400).json({ success: false, message: 'Missing "text" or "character" parameter' });
  }

  try {
    if (typeof incrementRequestCount === 'function') {
      await incrementRequestCount('tts-hololive');
    }

    const audioUrl = await ttsHololive(text, character);
    return res.status(200).json({ success: true, audioUrl });
  } catch (err) {
    console.error('TTS Hololive Error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}