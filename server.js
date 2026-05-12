require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { removeBackground } = require("@imgly/background-removal-node");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GEMINI_API_KEY;

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
          },
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const base64 = data.predictions[0].bytesBase64Encoded;

    const imageBuffer = Buffer.from(base64, "base64");

    const inputPath = path.join(__dirname, "temp-input.png");

    const outputPath = path.join(__dirname, "temp-output.png");

    await sharp(imageBuffer).png().toFile(inputPath);

    const fileUrl = `file:///${inputPath.replace(/\\/g, "/")}`;

    const blob = await removeBackground(fileUrl);

    const arrayBuffer = await blob.arrayBuffer();

    fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));

    const transparentBase64 = fs.readFileSync(outputPath).toString("base64");

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({
      success: true,
      data: transparentBase64,
    });
  } catch (error) {
    console.error("ERRO:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
