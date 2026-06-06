require("dotenv").config();

const express = require("express");
const { removeBackground } = require("@imgly/background-removal-node");
const { GoogleGenAI } = require("@google/genai"); // Biblioteca correta e atualizada!

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(express.static("public"));

// Rota ÚNICA para o Gemini
app.post("/api/generate-text", async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY not configured. Please add it to your .env file.",
      );
    }

    const { nomeFesta, localidade, dataEvento, programacao } = req.body || {};

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    let contextText = "";
    if (nomeFesta) contextText += `\n- Nome da festa (fornecido, mantém isto ou adapta levemente): ${nomeFesta}`;
    if (localidade) contextText += `\n- Localidade (fornecida, mantém isto): ${localidade}`;
    if (dataEvento) contextText += `\n- Data do evento (fornecida, mantém isto): ${dataEvento}`;
    if (programacao) contextText += `\n- Programação (fornecida, mantém e formata se necessário, respeitando a regra dos artistas se '{ARTISTAS}' estiver presente): ${programacao}`;

    // Prompt para o LLM gerar dados criativos de uma festa de aldeia
    const prompt = `Gera detalhes criativos e humorísticos para uma festa popular fictícia típica de aldeia portuguesa ("festa da terrinha").
O utilizador já forneceu alguns dados. Deves gerar de forma criativa APENAS os campos que faltarem e integrar os campos que o utilizador já deu: ${contextText}
Se a localidade não tiver sido fornecida, cria uma que pareça real mas seja fictícia.
Deves devolver APENAS um objeto JSON válido com as seguintes 4 chaves (preenchidas com os teus dados ou com os que o utilizador forneceu):
- "nomeFesta": O nome da festa em maiúsculas (ex: FESTAS DE SÃO JOÃO).
- "localidade": O nome da aldeia ou localidade (ex: Aldeia de Cima, Viseu).
- "dataEvento": Uma data típica, durante o verão, fim da primavera ou início do outono (ex: 12 A 15 DE AGOSTO).
- "programacao": O programa da festa. Deve ter 3 a 5 dias. Usa quebras de linha reais. IMPORTANTE: Não inventes nomes de artistas musicais/cantores/bandas! Em vez disso, usa OBRIGATORIAMENTE '{ARTISTAS}', cada '{ARTISTAS}' representará um concerto num dia diferente. Não dês detalhes longos, apenas datas, horas e títulos breves, máximo 7 palavras por linha. Exemplo: "SEXTA:\n21h - Abertura da Quermesse\n22h - {ARTISTAS}\nSÁBADO:\n15h - Torneio da Malha"`;

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

app.post("/api/identify-district", async (req, res) => {
  try {
    const { localidade } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY not configured. Please add it to your .env file.",
      );
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `Analisa a seguinte localidade inserida pelo utilizador: "${localidade}".
Verifica a que região ou cidade principal de Portugal esta localidade pertence.
Deves devolver APENAS um objeto JSON válido com a chave "distrito".
O valor de "distrito" DEVE ser uma destas opções correspondentes (ou null se não for em Portugal ou for fictício):
"Coimbra", "Lisboa", "Porto", "Braga", "Évora", "Aveiro", "Faro", "Viseu", "Guimarães", "Setúbal", "Viana do Castelo", "Beja", "Leiria", "Portalegre", "Santarém", "Castelo Branco", "Bragança", "Figueira da Foz", "Funchal", "Ponta Delgada".
Exemplo: Se o utilizador inserir "Barcelos", pertence a "Braga". Se inserir "Cascais", pertence a "Lisboa".`;

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
    console.error("Erro no Gemini (identify-district):", error);
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
