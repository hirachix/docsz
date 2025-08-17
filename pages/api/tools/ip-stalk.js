// pages/api/tools/ip-stalk.js
import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: 'Parameter "address" wajib diisi' });
  }

  try {
    await incrementRequestCount('ip-stalk');

    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const response = await axios.get(`https://api.giftedtech.web.id/api/stalk/ipstalk`, {
      params: { apikey: 'gifted', address },
      headers: { 'X-Forwarded-For': randomIP }
    });

    const data = response.data;
    if (data.creator) delete data.creator;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data',
      error: error?.response?.data || error.message
    });
  }
}