// File: pages/api/tools/ig-stalk.js
import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Parameter username wajib diisi' });
  }

  try {
    // Increment request count (wajib)
    await incrementRequestCount('ig-stalk');

    // Generate random IP
    const randomIP = Array(4)
      .fill(0)
      .map(() => Math.floor(Math.random() * 256))
      .join('.');

    // Request ke API giftedtech
    const response = await axios.get(`https://api.giftedtech.web.id/api/stalk/igstalk`, {
      params: {
        apikey: 'gifted',
        username
      },
      headers: {
        'X-Forwarded-For': randomIP
      }
    });

    // Hapus "creator" dari response
    const data = response.data;
    if (data.creator) delete data.creator;

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan'
    });
  }
}