import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Missing "q" (query) parameter' });
  }

  try {
    await incrementRequestCount(); // ✅ Tambahkan pencatatan request di awal

    const { data } = await axios.get(
      `https://spotifyapi.caliphdev.com/api/search/tracks?q=${encodeURIComponent(q)}`
    );

    res.status(200).json(data); // Kirim respons langsung dari API eksternal
  } catch (err) {
    console.error('Spotify Search Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch from Spotify API' });
  }
}