import https from 'https';
import { URL } from 'url';
import { incrementRequestCount } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET allowed' });
  }

  const requiredFields = [
    'provinsi', 'kota', 'nik', 'nama', 'ttl',
    'jenis_kelamin', 'golongan_darah', 'alamat', 'rt/rw',
    'kel/desa', 'kecamatan', 'agama', 'status',
    'pekerjaan', 'kewarganegaraan', 'masa_berlaku',
    'terbuat', 'pas_photo'
  ];

  const query = req.query;
  const missing = requiredFields.filter(field => !query[field]);

  if (missing.length > 0) {
    return res.status(400).json({ success: false, message: 'Missing fields', missing });
  }

  try {
    await incrementRequestCount(); // optional logging

    const apiUrl = new URL('https://api.siputzx.my.id/api/m/ektp');
    requiredFields.forEach(field => {
      apiUrl.searchParams.append(field, query[field]);
    });

    https.get(apiUrl.toString(), (apiRes) => {
      if (apiRes.statusCode !== 200) {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          message: 'Failed to fetch eKTP image',
          status: apiRes.statusCode
        }));
      }

      res.writeHead(200, {
        'Content-Type': apiRes.headers['content-type'] || 'image/png'
      });

      apiRes.pipe(res); // ✅ Stream langsung ke response
    }).on('error', (err) => {
      res.status(500).json({ success: false, message: 'Error fetching image', error: err.message });
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
}