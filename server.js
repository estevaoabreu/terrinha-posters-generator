require("dotenv").config();

const express = require("express");
const sharp = require("sharp"); // fs e path já não são necessários!
const { removeBackground } = require("@imgly/background-removal-node");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(express.json());
app.use(express.static("public"));

// A API Key estava declarada mas não estava a ser usada no Pollinations
// const API_KEY = process.env.GEMINI_API_KEY;

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt, count } = req.body;
    const numImages = count || 1;

    console.log(
      `Pedido recebido para gerar ${numImages} variações em paralelo.`,
    );

    // Criamos um array de "Promessas" para executar tudo ao mesmo tempo
    const imagePromises = Array.from({ length: numImages }).map(
      async (_, i) => {
        const randomSeed = Math.floor(Math.random() * 9999999);
        const encodedPrompt = encodeURIComponent(prompt);

        // Resolução reduzida para 512x512 para gerar imagens de forma mais rápida
        const url = `https://image.pollinations.ai/p/${encodedPrompt}?width=512&height=512&nologo=true&enhance=true&seed=${randomSeed}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao obter imagem.");

        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const pngBuffer = await sharp(imageBuffer).png().toBuffer();

        const blob = await removeBackground(pngBuffer);
        const arrayBuffer = await blob.arrayBuffer();

        console.log(`Variação ${i + 1} concluída.`);
        return Buffer.from(arrayBuffer).toString("base64");
      },
    );

    // O servidor vai executar todas as funções de cima ao mesmo tempo e esperar que TODAS terminem
    const outputImagesBase64 = await Promise.all(imagePromises);

    res.json({
      success: true,
      images: outputImagesBase64,
    });
  } catch (error) {
    console.error("ERRO NA GERAÇÃO:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
