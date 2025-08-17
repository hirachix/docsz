// pages/api/tools/brat.js

import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db'; // Opsional, jika tidak pakai bisa dihapus

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET allowed' });
  }

  const { q, isAnimated = 'false' } = req.query;

  if (!q) {
    return res.status(400).json({ success: false, message: 'Missing "q" parameter' });
  }

  try {
    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(q)}&isAnimated=${isAnimated}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0', // Tambahan untuk jaga-jaga
      },
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
    res.status(200).send(response.data);

    // Jika pakai tracking
    if (typeof incrementRequestCount === 'function') {
      await incrementRequestCount('brat');
    }
  } catch (err) {
    console.error('Brat API error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch brat image' });
  }
}