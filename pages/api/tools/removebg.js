// pages/api/tools/removebg.js
import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db'; // Opsional tracking

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Missing "url" parameter' });
  }

  try {
    const response = await axios.get(`https://apis.davidcyriltech.my.id/removebg?url=${encodeURIComponent(url)}`, {
      responseType: 'arraybuffer',
    });

    // Optional tracking
    if (typeof incrementRequestCount === 'function') {
      await incrementRequestCount('removebg'); // atau ganti ke nama fitur apa pun
    }

    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(response.data);
  } catch (err) {
    console.error('RemoveBG API Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Request gagal dijalankan.',
      details: err.message,
    });
  }
}