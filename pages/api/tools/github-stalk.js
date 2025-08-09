import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method is allowed' });
  }

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing "username" parameter' });
  }

  // Generate random IP
  const randomIP = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');

  try {
    const apiUrl = `https://api.giftedtech.web.id/api/stalk/gitstalk`;
    const response = await axios.get(apiUrl, {
      params: { apikey: 'gifted', username },
      headers: {
        'X-Forwarded-For': randomIP,
        'Client-IP': randomIP,
        'User-Agent': 'Mozilla/5.0 (compatible; GitHubStalkBot/1.0)'
      }
    });

    // Hapus field creator
    const { creator, ...filteredData } = response.data;

    // Tracking request
    if (typeof incrementRequestCount === 'function') {
      await incrementRequestCount('github-stalk');
    }

    return res.status(200).json(filteredData);
  } catch (err) {
    console.error('GitHub Stalk Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub stalk data',
      details: err.message
    });
  }
}