import axios from 'axios';
import FormData from 'form-data';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, message: 'Missing "q" query parameter' });
  }

  try {
    await incrementRequestCount(); // Statistik API

    const form = new FormData();
    form.append('keywords', q);
    form.append('count', 15);
    form.append('cursor', 0);
    form.append('web', 1);
    form.append('hd', 1);

    const response = await axios.post('https://tikwm.com/api/feed/search', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const baseURL = 'https://tikwm.com';
    const videos = (response.data?.data?.videos || []).map(video => ({
      ...video,
      play: baseURL + video.play,
      wmplay: baseURL + video.wmplay,
      music: baseURL + video.music,
      cover: baseURL + video.cover,
      avatar: baseURL + video.avatar,
    }));

    res.status(200).json({
      success: true,
      result: videos,
    });
  } catch (error) {
    console.error('TikTok search error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch from TikTok API' });
  }
}