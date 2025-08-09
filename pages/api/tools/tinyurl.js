import fetch from 'node-fetch';
import { incrementRequestCount } from '../../../lib/db'; // opsional tracking

const TINYURL_API_TOKEN = 'k1MtnMHy5UHetjWefOv8aWwpEPa3pIzXHpL5QNESyWvUkP3uXaxgtQfA3IeI';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET method allowed' });
  }

  const { url, alias } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Missing "url" parameter' });
  }

  try {
    const payload = {
      url,
      domain: 'tinyurl.com',
    };

    if (alias) payload.alias = alias;

    const response = await fetch('https://api.tinyurl.com/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TINYURL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data?.data?.tiny_url) {
      throw new Error(data?.errors?.[0]?.message || 'Unknown TinyURL API error');
    }

    // Optional: tracking
    await incrementRequestCount('tinyurl');

    res.status(200).json({
      success: true,
      result: {
        shortUrl: data.data.tiny_url,
        longUrl: data.data.url,
        alias: data.data.alias || null
      }
    });
  } catch (err) {
    console.error('TinyURL API Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to shorten URL' });
  }
}