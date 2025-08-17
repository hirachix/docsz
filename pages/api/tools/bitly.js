import fetch from 'node-fetch';
import { incrementRequestCount } from '../../../lib/db'; // Opsional tracking

const BITLY_TOKEN = 'cd71e818e79886690a83caf456895c64fd0ea62d';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  const { url, domain = 'bit.ly' } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Missing "url" parameter' });
  }

  try {
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITLY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        long_url: url,
        domain: domain
        // kamu bisa tambahkan "group_guid" kalau punya
      })
    });

    const data = await response.json();

    if (!response.ok || !data?.link) {
      throw new Error(data?.message || 'Failed to shorten URL');
    }

    // Opsional tracking
    await incrementRequestCount('bitly');

    res.status(200).json({
      success: true,
      result: {
        shortUrl: data.link,
        longUrl: data.long_url
      }
    });
  } catch (err) {
    console.error('Bitly API error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to shorten URL' });
  }
}