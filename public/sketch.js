// ============================================================
// sketch.js — Motor Generativo p5.js
// Integra paleta cultural via window._paletaAtiva (resolverPaleta)
// ============================================================

var sketch = function (sketch) {
  let templatesDB;
  let selectedTemplate;
  let imagensCarregadas = [];
  let saintImage;

  let selectedTitleFont;
  let selectedBodyFont;

  // Quantidade de imagens "Frame X" na pasta
  let quantidadeDeImagens = 3;

  // Paleta resolvida — preenchida em setup() após randomBg.js correr
  let paletaAtiva = null;

  let userData = {
    nomeTerrinha: "JOÃO",
    dataEvento: "23 A 25 DE JUNHO",
    local: "Largo da Igreja, Ribeira",
    programacao: [
      "SEXTA:\n22h - Quim Barreiros",
      "SÁBADO:\n21h - Banda X\n23h - Fogo",
      "DOMINGO:\n15h - Missa",
    ],
    patrocinios: "Café Central | Talho do Zé | Junta de Freguesia",
    artistas: [],
  };

  // ── PRELOAD ──────────────────────────────────────────────
  sketch.preload = function () {
    templatesDB = sketch.loadJSON("posicoes.json");

    for (let i = 1; i <= quantidadeDeImagens; i++) {
      let caminhoDaImagem = "ImagensArtistas/Frame " + i + ".png";
      imagensCarregadas.push(sketch.loadImage(caminhoDaImagem));
    }

    let storedSaintImage = localStorage.getItem("selectedSaintImage");
    if (storedSaintImage) {
      saintImage = sketch.loadImage(storedSaintImage);
    }
  };

  // ── SETUP ────────────────────────────────────────────────
  sketch.setup = function () {
    sketch.createCanvas(600, 850);

    // ── Ler inputs do formulário ──────────────────────────
    let inputLocalidade = document.getElementById("promptInputLocalidade")?.value?.trim();
    if (inputLocalidade) userData.nomeTerrinha = inputLocalidade;

    let inputDia = document.getElementById("promptInputDia")?.value?.trim();
    if (inputDia) userData.dataEvento = inputDia;

    let inputPrograma = document.getElementById("promptPrograma")?.value?.trim();
    if (inputPrograma) {
      userData.programacao = [inputPrograma.replace(/\\n/g, "\n")];
    }

    userData.artistas = imagensCarregadas;

    // ── Resolver paleta cultural ──────────────────────────
    // resolverPaleta() está disponível via randomBg.js
    // window._paletaAtiva já foi definido em randomBg.js init,
    // mas aqui forçamos a re-resolução com o nome real da cidade.
    if (typeof resolverPaleta === "function") {
      paletaAtiva = resolverPaleta(inputLocalidade || null);
      // Actualizar também o fundo da página com a cidade correta
      if (typeof aplicarGradienteFundo === "function") {
        aplicarGradienteFundo(inputLocalidade || null);
      }
    } else {
      // Fallback de segurança se randomBg.js ainda não carregou
      paletaAtiva = {
        gradient: ["#140028", "#2E0052"],
        text:     ["#FFD700", "#FFFFFF"]
      };
    }

    // ── Seleccionar template e fontes ────────────────────
    let templatesArray = Object.values(templatesDB);
    let randomIndex = sketch.floor(sketch.random(templatesArray.length));
    selectedTemplate = templatesArray[randomIndex].annotations[0].result;

    selectedTitleFont = sketch.random(titleFonts);
    selectedBodyFont  = sketch.random(bodyFonts);

    sketch.noLoop();

    if (document.fonts) {
      document.fonts.ready.then(() => { sketch.redraw(); });
    }
  };

  // ── DRAW ─────────────────────────────────────────────────
  sketch.draw = function () {
    // Fundo baseado na paleta cultural
    const [bgA, bgB] = paletaAtiva.gradient;
    _drawGradientBackground(bgA, bgB);

    let indiceArtista    = 0;
    let indiceProgramacao = 0;

    for (let box of selectedTemplate) {
      let rawLabel = box.value.rectanglelabels[0];
      let label    = rawLabel.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim();

      let px     = sketch.map(box.value.x,      0, 100, 0, sketch.width);
      let py     = sketch.map(box.value.y,      0, 100, 0, sketch.height);
      let pWidth = sketch.map(box.value.width,  0, 100, 0, sketch.width);
      let pHeight= sketch.map(box.value.height, 0, 100, 0, sketch.height);

      let conteudoDinamico = "";

      if (label.includes("Artista (Imagem)")) {
        if (userData.artistas.length > 0) {
          conteudoDinamico = userData.artistas[indiceArtista % userData.artistas.length];
        }
        indiceArtista++;
      } else if (label.includes("Programação")) {
        conteudoDinamico = userData.programacao[indiceProgramacao % userData.programacao.length];
        indiceProgramacao++;
      }

      renderContent(label, px, py, pWidth, pHeight, conteudoDinamico);
    }
  };

  // ── GRADIENT BACKGROUND HELPER ───────────────────────────
  /**
   * Desenha um gradiente vertical simples no canvas p5.
   * Aceita strings CSS "hsl(...)" ou "#HEX".
   */
  function _drawGradientBackground(corA, corB) {
    // Converter string CSS → cor p5
    // p5 não lê "hsl()" directamente; criamos um elemento DOM auxiliar
    // para extrair RGB via computed style.
    const toRGB = (cssColor) => {
      const el = document.createElement("div");
      el.style.color = cssColor;
      document.body.appendChild(el);
      const computed = getComputedStyle(el).color; // "rgb(r, g, b)"
      document.body.removeChild(el);
      const m = computed.match(/\d+/g);
      return m ? m.map(Number) : [0, 0, 0];
    };

    const [r1, g1, b1] = toRGB(corA);
    const [r2, g2, b2] = toRGB(corB);

    sketch.noFill();
    for (let y = 0; y < sketch.height; y++) {
      const t = y / sketch.height;
      const r = sketch.lerp(r1, r2, t);
      const g = sketch.lerp(g1, g2, t);
      const b = sketch.lerp(b1, b2, t);
      sketch.stroke(r, g, b);
      sketch.line(0, y, sketch.width, y);
    }
    sketch.noStroke();
  }

  // ── RENDERIZAR CAIXAS ────────────────────────────────────
  function renderContent(label, x, y, w, h, conteudoDinamico) {
    sketch.noStroke();
    sketch.textFont(`"${selectedBodyFont}"`);

    const [corTitulo, corData] = paletaAtiva.text;

    if (label.includes("Sant@ (Figura)")) {
      if (saintImage) {
        sketch.image(saintImage, x, y, w, h);
      }

    } else if (label.includes("Nome da Terrinha")) {
      sketch.fill(corTitulo);
      sketch.textFont(`"${selectedTitleFont}"`);
      drawTextFitted(userData.nomeTerrinha, x, y, w, h, sketch.NORMAL);

    } else if (label.includes("Data do Evento")) {
      sketch.fill(corData);
      drawTextFitted(userData.dataEvento, x, y, w, h, sketch.BOLD);

    } else if (label.includes("Local")) {
      sketch.fill(220, 220, 220);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(16);
      sketch.text("Local: " + userData.local, x, y, w, h);

    } else if (label.includes("Programação")) {
      sketch.fill(255);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(16);
      sketch.text(conteudoDinamico, x, y, w, h);

    } else if (label.includes("Artista (Imagem)")) {
      if (conteudoDinamico) {
        sketch.image(conteudoDinamico, x, y, w, h);
      } else {
        sketch.fill(255, 50, 100, 80);
        sketch.rect(x, y, w, h, 5);
        sketch.fill(255);
        sketch.textAlign(sketch.CENTER, sketch.CENTER);
        sketch.text("Falta Foto!", x + w / 2, y + h / 2);
      }

    } else if (label.includes("Patrocínios")) {
      sketch.fill(255);
      sketch.rect(x, y, w, h);
      sketch.fill(0);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(12);
      sketch.text("COM O APOIO DE:\n" + userData.patrocinios, x, y, w, h);
    }
  }

  // ── TEXTO AJUSTADO SEM DISTORÇÃO ─────────────────────────
  function drawTextFitted(txt, x, y, w, h, style) {
    sketch.push();
    sketch.translate(x + w / 2, y + h / 2);

    let baseSize = 100;
    sketch.textSize(baseSize);
    sketch.textStyle(style);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);

    let tw = sketch.textWidth(txt);
    let th = sketch.textAscent() + sketch.textDescent();

    let scaleFactor = sketch.min(w / tw, h / th);
    let optimalSize = baseSize * scaleFactor * 0.9;

    sketch.textSize(optimalSize);
    sketch.text(txt, 0, 0);
    sketch.pop();
  }
};

// ── TRIGGER ──────────────────────────────────────────────────
document.getElementById("generateBtn").addEventListener("click", () => {
  document.getElementById("sketch").innerHTML = "";
  let posterSketch = new p5(sketch, "sketch");
});