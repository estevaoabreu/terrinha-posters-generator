let dynamicImagesConfig = { artistas: [], logos: [] };

fetch("/api/images")
  .then((res) => res.json())
  .then((data) => {
    dynamicImagesConfig = data;
  })
  .catch((err) => console.error("Erro ao carregar lista de imagens:", err));

var sketch = function (sketch) {
  let templatesDB;
  let selectedTemplate;
  let imagensArtistas = [];
  let logos = [];
  let saintImage;
  let saintDrawn = false;

  let selectedTitleFont;
  let selectedBodyFont;

  let paletaAtiva = null;

  let userData = {
    nomeTerrinha: "FESTAS DE SÃO JOÃO",
    dataEvento: "23 A 25 DE JUNHO",
    local: "Largo da Igreja, Ribeira",
    programacao: [
      "SEXTA:\n22h - Quim Barreiros",
      "SÁBADO:\n21h - Banda Pimba\n23h - Fogo de Artifício",
      "DOMINGO:\n15h - Missa",
    ],
    patrocinios: "Café Central | Talho do Zé | Junta de Freguesia",
    artistas: [],
  };

  sketch.preload = function () {
    templatesDB = sketch.loadJSON("posicoes.json");

    for (let nome of dynamicImagesConfig.artistas) {
      imagensArtistas.push(sketch.loadImage("artistas/" + nome));
    }

    for (let nome of dynamicImagesConfig.logos) {
      logos.push(sketch.loadImage("logos/" + nome));
    }

    let storedSaintImage = localStorage.getItem("selectedSaintImage");
    if (storedSaintImage) {
      saintImage = sketch.loadImage(storedSaintImage);
    }
  };

  sketch.setup = function () {
    sketch.createCanvas(600, 850);

    let inputLocalidade = document
      .getElementById("promptInputLocalidade")
      ?.value?.trim();
    if (inputLocalidade) userData.nomeTerrinha = inputLocalidade.toUpperCase();

    let inputDia = document.getElementById("promptInputDia")?.value?.trim();
    if (inputDia) userData.dataEvento = inputDia;

    let inputPrograma = document
      .getElementById("promptPrograma")
      ?.value?.trim();
    if (inputPrograma) {
      userData.programacao = [inputPrograma.replace(/\\n/g, "\n")];
    }

    userData.artistas = sketch.shuffle(imagensArtistas.slice());

    if (typeof resolverPaleta === "function") {
      paletaAtiva = resolverPaleta(inputLocalidade || null);
      if (typeof aplicarGradienteFundo === "function") {
        aplicarGradienteFundo(inputLocalidade || null);
      }
    } else {
      paletaAtiva = {
        gradient: ["#140028", "#2E0052"],
        text: ["#FFD700", "#FFFFFF"],
      };
    }

    let templatesArray = Object.values(templatesDB);
    let randomIndex = sketch.floor(sketch.random(templatesArray.length));
    selectedTemplate = templatesArray[randomIndex].annotations[0].result;

    selectedTitleFont = sketch.random(titleFonts);
    selectedBodyFont = sketch.random(bodyFonts);

    sketch.noLoop();

    if (document.fonts) {
      document.fonts.ready.then(() => {
        sketch.redraw();
      });
    }
  };

  sketch.draw = function () {
    saintDrawn = false;
    const [bgA, bgB] = paletaAtiva.gradient;
    _drawGradientBackground(bgA, bgB);

    let indiceArtista = 0;
    let indiceProgramacao = 0;

    for (let box of selectedTemplate) {
      let rawLabel = box.value.rectanglelabels[0];
      let label = rawLabel.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim();

      let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
      let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
      let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
      let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

      let conteudoDinamico = "";

      if (label.includes("Artista (Imagem)")) {
        if (userData.artistas.length > 0) {
          conteudoDinamico =
            userData.artistas[indiceArtista % userData.artistas.length];
        }
        indiceArtista++;
      } else if (label.includes("Programação")) {
        conteudoDinamico =
          userData.programacao[indiceProgramacao % userData.programacao.length];
        indiceProgramacao++;
      }

      renderContent(label, px, py, pWidth, pHeight, conteudoDinamico);
    }
  };

  function _drawGradientBackground(corA, corB) {
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

  function renderContent(label, x, y, w, h, conteudoDinamico) {
    sketch.noStroke();
    sketch.textFont(`"${selectedBodyFont}"`);

    const [corTitulo, corData] = paletaAtiva.text;

    if (label.includes("Sant@ (Figura)")) {
      if (saintImage && !saintDrawn) {
        drawImageContain(saintImage, x, y, w, h);
        saintDrawn = true;
      }
    } else if (label.includes("Nome da Terrinha")) {
      sketch.fill(corTitulo);
      sketch.textFont(`"${selectedTitleFont}"`);
      drawTextFitted(userData.nomeTerrinha, x, y, w, h, sketch.NORMAL, 48);
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
        drawImageCover(conteudoDinamico, x, y, w, h);
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

  function drawTextFitted(txt, x, y, w, h, style, minSize = 0) {
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

    if (optimalSize < minSize) {
      optimalSize = minSize;
    }

    sketch.textSize(optimalSize);
    sketch.text(txt, 0, 0);
    sketch.pop();
  }

  function drawImageCover(img, x, y, w, h) {
    let imgRatio = img.width / img.height;
    let boxRatio = w / h;
    let sx, sy, sw, sh;

    if (imgRatio > boxRatio) {
      sh = img.height;
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / boxRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    sketch.image(img, x, y, w, h, sx, sy, sw, sh);
  }

  function drawImageContain(img, x, y, w, h) {
    let imgRatio = img.width / img.height;
    let boxRatio = w / h;
    let dw, dh, dx, dy;

    if (imgRatio > boxRatio) {
      dw = w;
      dh = w / imgRatio;
      dx = x;
      dy = y + (h - dh) / 2;
    } else {
      dh = h;
      dw = h * imgRatio;
      dy = y;
      dx = x + (w - dw) / 2;
    }
    sketch.image(img, dx, dy, dw, dh);
  }
};

document.getElementById("generateBtn").addEventListener("click", () => {
  document.getElementById("sketch").innerHTML = "";
  let posterSketch = new p5(sketch, "sketch");
});
