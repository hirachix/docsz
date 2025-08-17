// pages/api/tools/spotify.js
import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Parameter "url" Spotify diperlukan' });
  }

  try {
    // script spotify downloader
    const s = {
      tools: {
        async hit(description, url, options, returnType = "text") {
          const response = await fetch(url, options);
          if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text() || `(response body kosong)`}`);
          if (returnType === "text") {
            return { data: await response.text(), response };
          } else if (returnType === "json") {
            return { data: await response.json(), response };
          } else {
            throw Error(`invalid returnType param.`);
          }
        }
      },
      get baseUrl() {
        return "https://spotisongdownloader.to";
      },
      get baseHeaders() {
        return {
          "accept-encoding": "gzip, deflate, br, zstd",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0"
        };
      },
      async getCookie() {
        const { response } = await this.tools.hit(`homepage`, this.baseUrl, { headers: this.baseHeaders });
        let cookie = response?.headers?.getSetCookie()?.[0]?.split("; ")?.[0];
        if (!cookie?.length) throw Error(`gagal mendapatkan kuki`);
        cookie += "; _ga=GA1.1.2675401.1754827078";
        return { cookie };
      },
      async ifCaptcha(gcObject) {
        const url = new URL('/ifCaptcha.php', this.baseUrl);
        const headers = { referer: this.baseUrl, ...gcObject, ...this.baseHeaders };
        await this.tools.hit(`ifCaptcha`, url, { headers });
        return headers;
      },
      async singleTrack(spotifyTrackUrl, icObject) {
        const url = new URL('/api/composer/spotify/xsingle_track.php', this.baseUrl);
        url.search = new URLSearchParams({ url: spotifyTrackUrl });
        const { data } = await this.tools.hit(`single track`, url, { headers: icObject }, 'json');
        return data;
      },
      async singleTrackHtml(stObject, icObj) {
        const payload = [
          stObject.song_name,
          stObject.duration,
          stObject.img,
          stObject.artist,
          stObject.url,
          stObject.album_name,
          stObject.released
        ];
        const url = new URL('/track.php', this.baseUrl);
        const body = new URLSearchParams({ data: JSON.stringify(payload) });
        await this.tools.hit(`track html`, url, { headers: icObj, body, method: 'post' });
      },
      async downloadUrl(spotifyTrackUrl, icObj, stObj) {
        const url = new URL('/api/composer/spotify/ssdw23456ytrfds.php', this.baseUrl);
        const body = new URLSearchParams({
          song_name: "",
          artist_name: "",
          url: spotifyTrackUrl,
          zip_download: "false",
          quality: "m4a"
        });
        const { data } = await this.tools.hit(`get download url`, url, { headers: icObj, body, method: 'post' }, 'json');
        return { ...data, ...stObj };
      },
      async download(spotifyTrackUrl) {
        const gcObj = await this.getCookie();
        const icObj = await this.ifCaptcha(gcObj);
        const stObj = await this.singleTrack(spotifyTrackUrl, icObj);
        await this.singleTrackHtml(stObj, icObj);
        const dlObj = await this.downloadUrl(spotifyTrackUrl, icObj, stObj);
        return dlObj;
      }
    };

    // increment counter
    await incrementRequestCount("spotify");

    // jalankan downloader
    const result = await s.download(url);
    res.status(200).json({ success: true, ...result });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}