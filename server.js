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

        // Link corrigido de /p/ para /prompt/
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&enhance=true&seed=${randomSeed}`;

        const response = await fetch(url);
        
        // Tratamento de erro melhorado
        if (!response.ok) {
            console.error(`Falha no Pollinations: ${response.status} - ${response.statusText}`);
            throw new Error("Erro ao obter imagem da API.");
        const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
        if (!HF_API_TOKEN)
          throw new Error("HUGGINGFACE_API_TOKEN not set");

        const hfUrl =
          "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";
        const body = {
          inputs: prompt,
          parameters: { width: 512, height: 512, seed: randomSeed },
          options: { wait_for_model: true },
        };

        const placeholderBase64 =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="; // 1x1 PNG

        let response;
        try {
          response = await fetch(hfUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
        } catch (err) {
          console.error("Network error calling Hugging Face API:", err.message || err);
          return placeholderBase64;
        }

        let retries = 5;
        while (!response.ok && retries > 0) {
          console.log(`Hugging Face API busy/loading (status ${response.status}). Retrying in 5s...`);
          await new Promise((r) => setTimeout(r, 5000));
          response = await fetch(hfUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
          retries--;
        }

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(
            `Erro ao obter imagem da Hugging Face. Status: ${response.status} ${text}`,
          );
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await response.json();
          if (json.error) throw new Error(`Hugging Face error: ${json.error}`);
          throw new Error("Unexpected JSON response from Hugging Face Inference API");
        }

        const arrayBuffer = await response.arrayBuffer();
        const imageBlob = new Blob([arrayBuffer], {
          type: contentType || "image/jpeg",
        });

        const blob = await removeBackground(imageBlob);
        const resultBuffer = await blob.arrayBuffer();

        console.log(`Variação ${i + 1} concluída com sucesso!`);
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