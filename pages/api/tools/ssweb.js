// pages/api/tools/ssweb.js

import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Missing "url" parameter' });
  }

  try {
    const response = await axios.get(
      `https://apis.davidcyriltech.my.id/ssweb?url=${encodeURIComponent(url)}`,
      { responseType: 'arraybuffer' } // expecting image
    );

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/png');
    res.status(200).send(response.data);
  } catch (err) {
    console.error('ssweb API error:', err.message);
    res.status(500).json({ success: false, message: 'Failed capturing screenshot' });
  }
}