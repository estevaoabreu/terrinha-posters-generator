require("dotenv").config();

const express = require("express");
const { removeBackground } = require("@imgly/background-removal-node");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt, count } = req.body;
    const numImages = count || 1;

    const imagePromises = Array.from({ length: numImages }).map(
      async (_, i) => {
        const randomSeed = Math.floor(Math.random() * 9999999);
        const encodedPrompt = encodeURIComponent(prompt);

        const url = `https://image.pollinations.ai/p/${encodedPrompt}?width=512&height=512&nologo=true&enhance=true&seed=${randomSeed}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao obter imagem.");

        const arrayBuffer = await response.arrayBuffer();
        const imageBlob = new Blob([arrayBuffer], { type: "image/jpeg" });

        const blob = await removeBackground(imageBlob);
        const resultBuffer = await blob.arrayBuffer();

        console.log(`Variação ${i + 1} concluída.`);
        return Buffer.from(resultBuffer).toString("base64");
      },
    );

    const outputImagesBase64 = await Promise.all(imagePromises);

    res.json({
      success: true,
      images: outputImagesBase64,
    });
  } catch (error) {
    console.error("ERRO:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
