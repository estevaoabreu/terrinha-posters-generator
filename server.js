require("dotenv").config();

const express = require("express");
const { removeBackground } = require("@imgly/background-removal-node");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

app.use(express.json());
app.use(express.static("public"));

app.post("/api/generate-text", async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY not configured. Please add it to your .env file.",
      );
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Prompt para o LLM gerar dados criativos de uma festa de aldeia
    const prompt = `Gera detalhes criativos e humorísticos para uma festa popular fictícia típica de aldeia portuguesa ("festa da terrinha"). É importante que a festa e localidade não existam, mas pareçam reais.
Deves devolver APENAS um objeto JSON válido com as seguintes 3 chaves:
- "nomeTerrinha": O nome da festa ou aldeia em maiúsculas (ex: FESTAS DA NOSSA SENHORA DA AGONIA).
- "dataEvento": Uma data típica, durante o verão, fim da primavera ou início do outono (ex: 12 A 15 DE AGOSTO)
- "programacao": O programa da festa. Deve ter 3 a 5 dias. Usa quebras de linha reais. IMPORTANTE: Não inventes nomes de artistas musicais/cantores/bandas! Em vez disso, usa OBRIGATORIAMENTE as palavras exatas '{ARTISTAS}' como placeholder onde eles atuariam. Não dês detalhes ou comentários sobre o programa, apenas datas, horas e títulos breves. Divide os artistas pelos vários dias. Exemplo: "SEXTA:\\n21h - Abertura da Quermesse\\n22h - Grande Baile com {ARTISTAS}\\nSÁBADO:\\n15h - Torneio da Malha"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text;
    res.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Erro no Gemini:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/images", (req, res) => {
  try {
    const artistasDir = path.join(__dirname, "public", "artistas");
    const logosDir = path.join(__dirname, "public", "logos");

    const artistas = fs.existsSync(artistasDir)
      ? fs.readdirSync(artistasDir).filter((f) => !f.startsWith("."))
      : [];
    const logos = fs.existsSync(logosDir)
      ? fs.readdirSync(logosDir).filter((f) => !f.startsWith("."))
      : [];

    res.json({ artistas, logos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt, count } = req.body;
    const numImages = count || 1;

    const imagePromises = Array.from({ length: numImages }).map(
      async (_, i) => {
        const randomSeed = Math.floor(Math.random() * 9999999);

        const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
        if (!HF_API_TOKEN) throw new Error("HUGGINGFACE_API_TOKEN not set");

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
          console.error(
            "Network error calling Hugging Face API:",
            err.message || err,
          );
          return placeholderBase64;
        }

        let retries = 5;
        while (!response.ok && retries > 0) {
          console.log(
            `Hugging Face API busy/loading (status ${response.status}). Retrying in 5s...`,
          );
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
          throw new Error(
            "Unexpected JSON response from Hugging Face Inference API",
          );
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
