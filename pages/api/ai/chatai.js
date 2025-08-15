import fetch from 'node-fetch';
import axios from 'axios';
import { incrementRequestCount } from '../../../lib/db';

const listmodel = [
  "gpt-4.1-nano",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o4-mini",
  "deepseek-r1",
  "deepseek-v3",
  "claude-3.7",
  "gemini-2.0",
  "grok-3-mini",
  "qwen-qwq-32b",
  "gpt-4o",
  "o3",
  "gpt-4o-mini",
  "llama-3.3",
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { model: modelArg, prompt, system_prompt } = req.query;
  if (!modelArg || !prompt) {
    return res.status(400).json({
      success: false,
      message: `Usage: /api/tools/chatai?model=<model_id|model_name>&prompt=<your_prompt>&system_prompt=<optional>`,
      available_models: listmodel
    });
  }

  let model = listmodel[modelArg] || modelArg;
  if (!listmodel.includes(model)) {
    model = listmodel[0]; // default model
  }

  try {
    const response = await fetch('https://ai-interface.anisaofc.my.id/api/chat', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
        Referer: "https://ai-interface.anisaofc.my.id/"
      },
      body: JSON.stringify({
        question: prompt,
        model,
        system_prompt: system_prompt || undefined
      })
    });

    const data = await response.json();

    if (!response.ok || !data.response) {
      return res.status(500).json({
        success: false,
        message: data.message || `API request failed with status ${response.status}`
      });
    }

    // Increment counter
    await incrementRequestCount('multi-ai');

    return res.status(200).json({
      success: true,
      model,
      prompt,
      system_prompt: system_prompt || null,
      result: data.response
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request."
    });
  }
}