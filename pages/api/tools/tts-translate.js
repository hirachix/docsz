import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET allowed' });
  }

  const { text, lang = 'en' } = req.query;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Missing "text" parameter' });
  }

  try {
    // Google Translate TTS
    const response = await axios.get('https://translate.google.com/translate_tts', {
      params: {
        ie: 'UTF-8',
        q: text,
        tl: lang,
        client: 'tw-ob'
      },
      headers: {
        'Referer': 'http://translate.google.com',
        'User-Agent': 'Mozilla/5.0'
      },
      responseType: 'arraybuffer',
    });

    // Tracking usage
    if (typeof incrementRequestCount === 'function') {
      await incrementRequestCount('tts-translate');
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(response.data);
  } catch (err) {
    console.error('TTS Translate Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch TTS audio',
      details: err.message,
    });
  }
}