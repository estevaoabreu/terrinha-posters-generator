let dynamicImagesConfig = { artistas: [], logos: [] };

fetch("/api/images")
  .then((res) => res.json())
  .then((data) => {
    dynamicImagesConfig = data;
  })
  .catch((err) => console.error("Erro ao carregar lista de imagens:", err));

// Globals for templates
let templatesDBGlobal = null;
let templatesArrayGlobal = [];
fetch("posicoes.json")
  .then(res => res.json())
  .then(data => {
    templatesDBGlobal = data;
    templatesArrayGlobal = Object.values(data);
  })
  .catch(err => console.error("Erro ao carregar posicoes.json:", err));

class PosterDNA {
  constructor(templateIdx, titleFont, bodyFont, numArtists, textScales) {
    if (templateIdx !== undefined) {
      this.templateIdx = templateIdx;
      this.titleFont = titleFont;
      this.bodyFont = bodyFont;
      this.numArtists = numArtists;
      this.textScales = textScales;
    } else {
      this.templateIdx = Math.floor(Math.random() * templatesArrayGlobal.length);
      this.titleFont = titleFonts[Math.floor(Math.random() * titleFonts.length)];
      this.bodyFont = bodyFonts[Math.floor(Math.random() * bodyFonts.length)];
      // Number of unique artists to use (1 to 5)
      this.numArtists = Math.floor(Math.random() * 5) + 1;
      this.textScales = [];
      for (let i = 0; i < 5; i++) {
        this.textScales.push(Math.random() * 0.4 + 0.6); // 0.6 to 1.0
      }
    }
  }

  crossover(partner) {
    let child = new PosterDNA();
    child.templateIdx = Math.random() > 0.5 ? this.templateIdx : partner.templateIdx;
    child.titleFont = Math.random() > 0.5 ? this.titleFont : partner.titleFont;
    child.bodyFont = Math.random() > 0.5 ? this.bodyFont : partner.bodyFont;
    child.numArtists = Math.random() > 0.5 ? this.numArtists : partner.numArtists;
    child.textScales = [];
    for (let i = 0; i < 5; i++) {
      child.textScales.push(Math.random() > 0.5 ? this.textScales[i] : partner.textScales[i]);
    }
    return child;
  }

  mutate(mutationRate = 0.2) {
    if (Math.random() < mutationRate) {
       this.templateIdx = Math.floor(Math.random() * templatesArrayGlobal.length);
    }
    if (Math.random() < mutationRate) {
       this.titleFont = titleFonts[Math.floor(Math.random() * titleFonts.length)];
    }
    if (Math.random() < mutationRate) {
       this.bodyFont = bodyFonts[Math.floor(Math.random() * bodyFonts.length)];
    }
    if (Math.random() < mutationRate) {
       this.numArtists = Math.floor(Math.random() * 5) + 1;
    }
    for (let i = 0; i < 5; i++) {
      if (Math.random() < mutationRate) {
        this.textScales[i] = Math.random() * 0.4 + 0.6;
      }
    }
  }

  getCopy() {
    return new PosterDNA(this.templateIdx, this.titleFont, this.bodyFont, this.numArtists, [...this.textScales]);
  }
}

class Population {
  constructor(size) {
    this.individuals = [];
    this.size = size;
    this.eliteIndex = -1; // -1 means none selected
  }

  initialize() {
    this.individuals = [];
    for (let i = 0; i < this.size; i++) {
      this.individuals.push(new PosterDNA());
    }
    this.eliteIndex = -1;
  }

  evolve() {
    let newGeneration = [];
    let eliteDNA = null;

    if (this.eliteIndex >= 0 && this.eliteIndex < this.size) {
      eliteDNA = this.individuals[this.eliteIndex].getCopy();
    } else {
      // If user didn't pick an elite, we fallback to picking the first one
      eliteDNA = this.individuals[0].getCopy();
    }

    // Elitism: carry over the chosen poster
    newGeneration.push(eliteDNA);

    // Fill the rest by crossover and mutation from the elite 
    for (let i = 1; i < this.size; i++) {
      let partner = new PosterDNA();
      let child = eliteDNA.crossover(partner);
      child.mutate(0.3); // 30% mutation chance per gene
      newGeneration.push(child);
    }

    this.individuals = newGeneration;
    
    // As the new generation is drawn, the elite is at index 0. 
    this.eliteIndex = 0; 
  }
}

let globalPopulation = new Population(6);

// Sketch generator function factory
var createSketch = function (dna) {
  return function (sketch) {
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

      // We shuffle all dynamic images and keep them in userData.artistas
      // The rendering logic will only use up to dna.numArtists of them, WITHOUT repeating.
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

      // Assign DNA genes
      selectedTemplate = templatesArrayGlobal[dna.templateIdx % templatesArrayGlobal.length].annotations[0].result;
      selectedTitleFont = dna.titleFont;
      selectedBodyFont = dna.bodyFont;

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

      // Pre-calculate the maximum artists we can draw without repetition
      let artistBoxesCount = selectedTemplate.filter(b => b.value.rectanglelabels[0].includes("Artista (Imagem)")).length;
      let numToRender = sketch.min(dna.numArtists, artistBoxesCount);
      // Ensure we don't draw more artists than we actually have images for
      numToRender = sketch.min(numToRender, userData.artistas.length);

      let textIndex = 0;
      let currentArtistBoxIndex = 0;

      // PASS 1: Saint Background
      for (let box of selectedTemplate) {
        let label = box.value.rectanglelabels[0].replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim();
        let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
        let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
        let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
        let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

        if (label.includes("Sant@ (Figura)")) {
          renderContent(label, px, py, pWidth, pHeight, "", 1.0);
        }
      }

      // PASS 2: Artist Images & Patrocínios
      for (let box of selectedTemplate) {
        let label = box.value.rectanglelabels[0].replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim();
        let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
        let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
        let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
        let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

        if (label.includes("Artista (Imagem)")) {
          if (currentArtistBoxIndex < numToRender) {
            let conteudoDinamico = userData.artistas[currentArtistBoxIndex];
            renderContent(label, px, py, pWidth, pHeight, conteudoDinamico, 1.0);
          }
          currentArtistBoxIndex++;
        } else if (label.includes("Patrocínios")) {
          renderContent(label, px, py, pWidth, pHeight, "", 1.0);
        }
      }

      // PASS 3: Texts (always on top)
      for (let box of selectedTemplate) {
        let label = box.value.rectanglelabels[0].replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim();
        let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
        let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
        let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
        let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

        if (label.includes("Nome da Terrinha") || label.includes("Data do Evento") || label.includes("Local") || label.includes("Programação")) {
          let conteudoDinamico = label.includes("Programação") ? userData.programacao[0] : "";
          let scale = dna.textScales[textIndex % dna.textScales.length];
          renderContent(label, px, py, pWidth, pHeight, conteudoDinamico, scale);
          textIndex++;
        }
      }
    };

    function _drawGradientBackground(corA, corB) {
      const toRGB = (cssColor) => {
        const el = document.createElement("div");
        el.style.color = cssColor;
        document.body.appendChild(el);
        const computed = getComputedStyle(el).color;
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

    function renderContent(label, x, y, w, h, conteudoDinamico, scale) {
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
        drawTextFitted(userData.nomeTerrinha, x, y, w, h, sketch.NORMAL, scale);
      } else if (label.includes("Data do Evento")) {
        sketch.fill(corData);
        drawTextFitted(userData.dataEvento, x, y, w, h, sketch.BOLD, scale);
      } else if (label.includes("Local")) {
        sketch.fill(220, 220, 220);
        drawTextFitted("Local: " + userData.local, x, y, w, h, sketch.NORMAL, scale);
      } else if (label.includes("Programação")) {
        sketch.fill(255);
        drawTextFitted(conteudoDinamico, x, y, w, h, sketch.NORMAL, scale);
      } else if (label.includes("Artista (Imagem)")) {
        if (conteudoDinamico) {
          drawImageCover(conteudoDinamico, x, y, w, h);
        } else {
          // Fallback box won't be drawn anymore due to rendering logic skipping it, 
          // but kept here for safety.
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
        drawTextFitted("COM O APOIO DE:\n" + userData.patrocinios, x, y, w, h, sketch.NORMAL, scale);
      }
    }

    function getWrappedTextHeight(txt, boxWidth) {
      let paragraphs = txt.split('\n');
      let totalHeight = 0;
      let leading = sketch.textLeading();
      
      for (let p of paragraphs) {
        let words = p.split(' ');
        let currentLine = "";
        let lineCount = 1;
        
        for (let i = 0; i < words.length; i++) {
          let wordWidth = sketch.textWidth(words[i]);
          if (wordWidth > boxWidth) {
             return Infinity; // This font size is invalid, a single word is too wide
          }

          let testLine = currentLine + words[i] + " ";
          if (sketch.textWidth(testLine) > boxWidth && i > 0) {
            lineCount++;
            currentLine = words[i] + " ";
          } else {
            currentLine = testLine;
          }
        }
        totalHeight += lineCount * leading;
      }
      return totalHeight;
    }

    function drawTextFitted(txt, x, y, w, h, style, scaleMultiplier = 1.0) {
      sketch.push();
      sketch.textStyle(style);
      // We align text vertically and horizontally within the bounding box
      sketch.textAlign(sketch.CENTER, sketch.CENTER);

      let minSize = 10;
      let maxSize = 200;
      let optimalSize = minSize;

      let low = minSize;
      let high = maxSize;

      // Safe boundaries to avoid pixel-edge overflow issues
      let safeW = w * 0.95;
      let safeH = h * 0.95;

      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        sketch.textSize(mid);
        let textH = getWrappedTextHeight(txt, safeW);
        if (textH <= safeH) {
          optimalSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      // Apply the dynamic scale multiplier from the DNA
      optimalSize = optimalSize * scaleMultiplier;
      if (optimalSize < 5) optimalSize = 5; // Safeguard
      
      sketch.textSize(optimalSize);
      
      // By passing width and height, p5.js automatically wraps the text
      sketch.text(txt, x, y, w, h);
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
};

function selectElite(index) {
  globalPopulation.eliteIndex = index;
  for (let i = 0; i < globalPopulation.size; i++) {
    const el = document.getElementById("poster-mini-" + i);
    if (el) {
      if (i === index) {
        el.classList.add("selected-poster");
      } else {
        el.classList.remove("selected-poster");
      }
    }
  }
}

document.getElementById("generateBtn").addEventListener("click", () => {
  if (templatesArrayGlobal.length === 0) {
    alert("Aguarda o carregamento dos templates (posicoes.json) e tenta de novo.");
    return;
  }

  const container = document.getElementById("sketch");
  
  // Exibir a mensagem de carregamento
  container.style.display = "block";
  container.innerHTML = "<h3 style='color: var(--neon-lime, #39ff14); width: 100%; text-align: center; padding: 40px 0; font-size: 1.5rem; text-shadow: 2px 2px 0px #000;'>A gerar cartazes, por favor aguarde... ⏳</h3>";
  
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.style.display = 'none';

  // Timeout para permitir a renderização da UI de loading
  setTimeout(() => {
    container.innerHTML = "";
    
    // Configurar grid para 6 cartazes
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)";
    container.style.gap = "15px";
    container.style.width = "100%";
    container.style.padding = "10px";

    if (globalPopulation.individuals.length === 0) {
      globalPopulation.initialize();
    } else {
      globalPopulation.evolve();
    }

    // Gerar 6 cartazes em miniatura
    for (let i = 0; i < globalPopulation.size; i++) {
      const div = document.createElement("div");
      div.id = "poster-mini-" + i;
      div.className = "poster-wrapper";
      div.style.width = "100%";
      div.style.display = "flex";
      div.style.justifyContent = "center";
      div.style.position = "relative"; 
      div.style.cursor = "pointer";
      div.onclick = () => selectElite(i);
      container.appendChild(div);

      new p5(createSketch(globalPopulation.individuals[i]), div.id);
    }

    // Auto-selecionar o elite na interface caso já exista
    if (globalPopulation.eliteIndex >= 0) {
      setTimeout(() => {
        selectElite(globalPopulation.eliteIndex);
        if (exportBtn) exportBtn.style.display = 'block';
      }, 100);
    } else {
      if (exportBtn) exportBtn.style.display = 'block';
    }

    // Adicionar CSS para o highlight idêntico ao dos santos, mas para os cartazes
    if (!document.getElementById("miniature-style")) {
      const style = document.createElement("style");
      style.id = "miniature-style";
      style.innerHTML = `
        #sketch canvas { 
          width: 100% !important; 
          height: auto !important; 
          object-fit: contain; 
          border: 2px solid var(--win95-light, #dfdfdf); 
          box-shadow: 4px 4px 0px #000; 
          transition: all 0.2s ease-in-out;
        }
        
        .selected-poster canvas {
          border: 5px solid var(--neon-lime) !important;
          box-shadow: 0 0 20px var(--neon-lime), 6px 6px 0px #000 !important;
        }
        
        .selected-poster::after {
          content: "✔ SELECIONADO";
          position: absolute;
          top: 8px; left: 50%;
          transform: translateX(-50%);
          background: var(--neon-lime);
          color: #000;
          font-size: 0.7em;
          font-weight: bold;
          padding: 3px 8px;
          border: 2px solid #000;
          white-space: nowrap;
          box-shadow: 2px 2px 0px #000;
          z-index: 10;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, 50);
});

// Listener para exportar o cartaz
document.getElementById("exportBtn")?.addEventListener("click", () => {
  if (globalPopulation.eliteIndex >= 0) {
    const selectedCanvas = document.querySelector(\`#poster-mini-\${globalPopulation.eliteIndex} canvas\`);
    if (selectedCanvas) {
      const link = document.createElement('a');
      link.download = 'cartaz-terrinha.png';
      link.href = selectedCanvas.toDataURL('image/png');
      link.click();
    }
  } else {
    alert("Por favor, selecione um cartaz para exportar.");
  }
});
