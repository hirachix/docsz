// /pages/api/downloader/igfb.js
import { incrementRequestCount } from "../../../lib/db";
import axios from "axios";

export default async function handler(req, res) {
  await incrementRequestCount("fb-ig"); // wajib tracking

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      success: false,
      error: "Parameter 'url' wajib diisi."
    });
  }

  try {
    // API cadangan (Instagram + Facebook)
    const apiUrl = `https://metaz-alpha.vercel.app/api/meta/download?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Gagal mengambil data."
      });
    }

    // Hapus field developer
    if (result.data?.developer) {
      delete result.data.developer;
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server.",
      details: error.message
    });
  }
}