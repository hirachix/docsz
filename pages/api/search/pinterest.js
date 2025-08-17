import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

const CREATOR_NAME = "Hirako";
const BASE_URL = "https://api.siputzx.my.id/api/s/pinterest?query=";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: false,
      creator: CREATOR_NAME,
      message: "Only GET method allowed",
    });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      status: false,
      creator: CREATOR_NAME,
      message: "Parameter 'q' wajib diisi",
    });
  }

  try {
    await incrementRequestCount(); // untuk statistik

    const { data } = await axios.get(BASE_URL + encodeURIComponent(q));
    let resultData = data.result || data;

    if (typeof resultData === "object" && resultData !== null && Array.isArray(resultData.data)) {
      resultData = resultData.data;
    }

    if (typeof resultData === "object" && resultData !== null && "status" in resultData) {
      delete resultData.status;
    }

    res.json({
      status: true,
      creator: CREATOR_NAME,
      result: resultData,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      creator: CREATOR_NAME,
      message: "Gagal mengambil data dari API Pinterest",
      error: err.message,
    });
  }
}