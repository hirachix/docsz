// pages/api/tools/shorturl.js
import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Parameter "url" wajib diisi' });
  }

  try {
    await incrementRequestCount('shorturl');

    // 1. GET untuk ambil cookie
    const initGet = await fetch('https://n9.cl/en', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const cookie = initGet.headers.get('set-cookie');

    // 2. POST untuk buat shortlink
    const headers = {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(cookie && { Cookie: cookie }),
    };

    const body = new URLSearchParams({
      xjxfun: 'create',
      'xjxargs[]': `S<![CDATA[${url}]]>`,
    });

    const r = await fetch('https://n9.cl/en', {
      method: 'POST',
      headers,
      body,
    });

    const t = await r.text();
    const match = t.match(/https?:\/\/n9\.cl\/[a-zA-Z0-9_-]+/);

    if (match) {
      return res.status(200).json({ success: true, original: url, short: match[0] });
    }

    // 3. Fallback ke is.gd
    const fallback = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
    const shortFallback = await fallback.text();

    if (shortFallback.startsWith('http')) {
      return res.status(200).json({ success: true, original: url, short: shortFallback });
    }

    res.status(500).json({ success: false, message: 'Gagal mendapatkan short URL dari semua sumber' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan' });
  }
}