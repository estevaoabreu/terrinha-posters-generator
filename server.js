require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1 },
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const base64Encoded = data.predictions[0].bytesBase64Encoded;

    res.json({ success: true, data: { bytesBase64Encoded: base64Encoded } });
  } catch (error) {
    console.error("ERRO NO SERVIDOR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Servidor em http://localhost:3000"));
