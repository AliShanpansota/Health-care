const express = require("express");
const axios = require("axios");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/chat", authenticate, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message is required" });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/devstral-small:free", // Free, fast, and good model
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            "https://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/", // replace with your frontend domain in production
          "X-Title": "ai chatbot", // custom name for your app
        },
      },
    );

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenRouter Error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Failed to get chatbot response", error });
  }
});

module.exports = router;
