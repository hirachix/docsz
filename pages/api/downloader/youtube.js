// pages/api/downloader/youtube.js
import { incrementRequestCount } from "../../../lib/db";
import axios from "axios";

async function fetchYouTubeData(url) {
  try {
    const res = await axios.get(
      "https://api.vidfly.ai/api/media/youtube/download",
      {
        params: { url },
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          "x-app-name": "vidfly-web",
          "x-app-version": "1.0.0",
          Referer: "https://vidfly.ai/",
        },
      }
    );

    const data = res.data?.data;
    if (!data || !data.items || !data.title) {
      throw new Error("Invalid or empty response from YouTube downloader API");
    }

    return {
      title: data.title,
      thumbnail: data.cover,
      duration: data.duration,
      formats: data.items.map((item) => ({
        type: item.type,
        quality: item.label || "unknown",
        extension: item.ext || item.extension || "unknown",
        url: item.url,
      })),
    };
  } catch (err) {
    throw new Error(`YouTube downloader request failed: ${err.message}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { url } = req.query;
  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: 'Parameter "url" diperlukan' });
  }

  try {
    const data = await fetchYouTubeData(url);

    // increment counter wajib
    await incrementRequestCount("youtube");

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}