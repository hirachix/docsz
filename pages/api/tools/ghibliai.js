import axios from "axios";
import { incrementRequestCount } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { url, prompt, size } = req.query;
    await incrementRequestCount("ghibliai");

    if (!url) {
      return res
        .status(400)
        .json({ success: false, error: "Image URL is required" });
    }

    const API_HOST =
      "ghibli-image-generator-api-open-ai-4o-image-generation-free.p.rapidapi.com";
    const API_KEY = "54e3852bd3msh27c27c29c524075p1198c0jsn1090b1059bcc";

    // STEP 1: Generate → dapatkan taskId
    const generateRes = await axios.post(
      `https://${API_HOST}/aaaaaaaaaaaaaaaaaiimagegenerator/ghibli/generate.php`,
      {
        prompt:
          prompt || "Transform this image in the style of Studio Ghibli.",
        filesUrl: [url],
        size: size || "1:1",
      },
      {
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": API_HOST,
          "Content-Type": "application/json",
        },
      }
    );

    const taskId = generateRes.data?.data?.taskId;
    if (!taskId) {
      return res.status(500).json({
        success: false,
        error: "Failed to get taskId",
        details: generateRes.data,
      });
    }

    // STEP 2: Polling get.php sampai status success
    let imageUrl = null;
    let status = null;

    for (let i = 0; i < 10; i++) {
      const getRes = await axios.get(
        `https://${API_HOST}/aaaaaaaaaaaaaaaaaiimagegenerator/ghibli/get.php`,
        {
          params: { taskId },
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": API_HOST,
          },
        }
      );

      status = getRes.data?.status;
      if (status === "success" && getRes.data?.imageUrl) {
        imageUrl = getRes.data.imageUrl;
        break;
      }

      // tunggu 3 detik sebelum cek lagi
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch final image after multiple attempts",
        lastStatus: status,
      });
    }

    // STEP 3: Return hasil final
    return res.status(200).json({
      success: true,
      taskId,
      imageUrl,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.response?.data || error.message,
    });
  }
}