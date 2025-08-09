import axios from 'axios';
import * as cheerio from 'cheerio'; // ✅ ESM-style import
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Only GET method allowed' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ status: false, message: 'Query parameter \"q\" is required' });
  }

  try {
    await incrementRequestCount();

    const searchUrl = `https://sfile.mobi/search.php?q=${encodeURIComponent(q)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data); // ✅ pastikan cheerio tersedia

    const result = [];

    $('div.list').each((_, el) => {
      const title = $(el).find('a').text();
      const sizeText = $(el).text().trim().split(' (')[1];
      const size = sizeText ? sizeText.replace(')', '') : null;
      const link = $(el).find('a').attr('href');

      if (link) {
        result.push({
          title,
          size,
          link: link.startsWith('http') ? link : `https://sfile.mobi${link}`
        });
      }
    });

    res.status(200).json({
      status: true,
      result
    });
  } catch (error) {
    console.error('Sfile Search Error:', error.message);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch data from sfile.mobi',
      error: error.message
    });
  }
}