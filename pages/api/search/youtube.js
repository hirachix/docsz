import yts from 'yt-search';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, error: 'Only GET method allowed' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ status: false, error: 'Query is required' });
  }

  try {
    await incrementRequestCount(); // Statistik API
    const ytResults = await yts.search(q);
    
    const ytTracks = ytResults.videos.map(video => ({
      title: video.title,
      channel: video.author.name,
      duration: video.duration.timestamp,
      imageUrl: video.thumbnail,
      link: video.url
    }));

    res.status(200).json({
      status: true,
      result: ytTracks
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
}