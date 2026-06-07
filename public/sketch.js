let dynamicImagesConfig = { artists: [], logos: [] };

fetch("/api/images")
  .then((res) => res.json())
  .then((data) => {
    dynamicImagesConfig = data;
  })
  .catch((err) => console.error("Erro ao carregar lista de imagens:", err));

let templatesDBGlobal = null;
let templatesArrayGlobal = [];
fetch("posicoes.json")
  .then((res) => res.json())
  .then((data) => {
    templatesDBGlobal = data;
    templatesArrayGlobal = Object.values(data);
  })
  .catch((err) => console.error("Erro ao carregar posicoes.json:", err));

class PosterDNA {
  constructor(
    templateIdx,
    titleFont,
    bodyFont,
    numArtists,
    textScales,
    baseHue,
    useDistrictColor,
    bgStyle,
    textColorMode
  ) {
    if (templateIdx !== undefined) {
      this.templateIdx = templateIdx;
      this.titleFont = titleFont;
      this.bodyFont = bodyFont;
      this.numArtists = numArtists;
      this.textScales = textScales;
      this.baseHue = baseHue;
      this.useDistrictColor = useDistrictColor;
      this.bgStyle = bgStyle;
      this.textColorMode = textColorMode;
    } else {
      this.templateIdx = Math.floor(Math.random() * templatesArrayGlobal.length);
      this.titleFont = titleFonts[Math.floor(Math.random() * titleFonts.length)];
      this.bodyFont = bodyFonts[Math.floor(Math.random() * bodyFonts.length)];
      this.numArtists = Math.floor(Math.random() * 5) + 1;
      this.textScales = [];
      for (let i = 0; i < 5; i++) {
        this.textScales.push(Math.random() * 0.2 + 0.9);
      }
      this.baseHue = Math.floor(Math.random() * 360);
      this.useDistrictColor = Math.random() > 0.5;
      this.bgStyle = Math.floor(Math.random() * 4);
      this.textColorMode = Math.floor(Math.random() * 3);
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
      child.textScales.push(
        Math.random() > 0.5 ? this.textScales[i] : partner.textScales[i]
      );
    }
    child.baseHue = Math.random() > 0.5 ? this.baseHue : partner.baseHue;
    child.useDistrictColor =
      Math.random() > 0.5 ? this.useDistrictColor : partner.useDistrictColor;
    child.bgStyle = Math.random() > 0.5 ? this.bgStyle : partner.bgStyle;
    child.textColorMode =
      Math.random() > 0.5 ? this.textColorMode : partner.textColorMode;
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
        this.textScales[i] = Math.random() * 0.2 + 0.9;
      }
    }
    if (Math.random() < mutationRate) {
      this.baseHue = Math.floor(Math.random() * 360);
    }
    if (Math.random() < mutationRate) {
      this.useDistrictColor = !this.useDistrictColor;
    }
    if (Math.random() < mutationRate) {
      this.bgStyle = Math.floor(Math.random() * 4);
    }
    if (Math.random() < mutationRate) {
      this.textColorMode = Math.floor(Math.random() * 3);
    }
  }

  getCopy() {
    return new PosterDNA(
      this.templateIdx,
      this.titleFont,
      this.bodyFont,
      this.numArtists,
      [...this.textScales],
      this.baseHue,
      this.useDistrictColor,
      this.bgStyle,
      this.textColorMode
    );
  }
}

class Population {
  constructor(size) {
    this.individuals = [];
    this.size = size;
    this.eliteIndex = -1;
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
      eliteDNA = this.individuals[0].getCopy();
    }

    newGeneration.push(eliteDNA);

    for (let i = 1; i < this.size; i++) {
      if (i === this.size - 1) {
        newGeneration.push(new PosterDNA());
      } else {
        let partner = new PosterDNA();
        let child = eliteDNA.crossover(partner);
        child.mutate(0.3);
        newGeneration.push(child);
      }
    }

    this.individuals = newGeneration;
    this.eliteIndex = 0;
  }
}

let globalPopulation = new Population(6);

var createSketch = function (dna, districtColor) {
  return function (sketch) {
    let selectedTemplate;
    let artistImages = [];
    let logos = [];
    let saintImage;
    let saintDrawn = false;

    let selectedTitleFont;
    let selectedBodyFont;
    let activePalette = null;

    let userData = {
      partyName: "FESTAS DE SÃO JOÃO",
      eventDate: "23 A 25 DE JUNHO",
      location: "Largo da Igreja, Ribeira",
      schedule: [],
      artists: [],
      sponsorImages: [],
    };

    sketch.preload = function () {
      for (let nome of dynamicImagesConfig.artists) {
        let img = sketch.loadImage("artists/" + nome);
        img.filename = nome;
        artistImages.push(img);
      }

      if (dynamicImagesConfig.logos && dynamicImagesConfig.logos.length > 0) {
        for (let nome of dynamicImagesConfig.logos) {
          logos.push(sketch.loadImage("patrocinios/" + nome));
        }
      } else {
        for (let i = 1; i <= 24; i++) {
          logos.push(sketch.loadImage("patrocinios/p" + i + ".png"));
        }
      }

      let storedSaintImage = localStorage.getItem("selectedSaintImage");
      if (storedSaintImage) {
        saintImage = sketch.loadImage(storedSaintImage);
      }
    };

    sketch.setup = function () {
      sketch.createCanvas(600, 850);

      let inputNomeFesta = document.getElementById("promptInputNomeFesta")?.value?.trim();
      if (inputNomeFesta) userData.partyName = inputNomeFesta.toUpperCase();

      let inputLocalidade = document.getElementById("promptInputLocalidade")?.value?.trim();
      if (inputLocalidade) userData.location = inputLocalidade;

      let inputDia = document.getElementById("promptInputDia")?.value?.trim();
      if (inputDia) userData.eventDate = inputDia;

      let inputPrograma = document.getElementById("promptPrograma")?.value?.trim();
      if (inputPrograma) {
        userData.schedule = [inputPrograma.replace(/\\n/g, "\n")];
      }

      userData.artists = sketch.shuffle(artistImages.slice());

      let inputNumLogosEl = document.getElementById("promptNúmeroPatrocinadores");
      let inputNumLogos = inputNumLogosEl ? inputNumLogosEl.value : "";
      let numLogos = 3;

      if (inputNumLogosEl) {
        inputNumLogosEl.max = logos.length;
      }

      if (inputNumLogos && inputNumLogos.trim() !== "") {
        let parsedNum = parseInt(inputNumLogos, 10);
        if (!isNaN(parsedNum)) numLogos = parsedNum;
      }

      numLogos = sketch.max(0, sketch.min(numLogos, logos.length));

      userData.sponsorImages = [];
      if (logos.length > 0 && numLogos > 0) {
        let shuffledLogos = sketch.shuffle(logos.slice());
        for (let i = 0; i < numLogos; i++) {
          userData.sponsorImages.push(shuffledLogos[i]);
        }
      }

      let h1 = dna.baseHue;
      let h2 = (h1 + 40) % 360;
      let baseGrad1 = `hsl(${h1}, 65%, 22%)`;
      let baseGrad2 = `hsl(${h2}, 70%, 32%)`;
      let txt1 = `hsl(${(h1 + 180) % 360}, 80%, 85%)`;
      let txt2 = "#FFFFFF";

      if (districtColor && dna.useDistrictColor) {
        baseGrad1 = districtColor.gradient[0];
        baseGrad2 = districtColor.gradient[1];
        txt1 = districtColor.text[0];
        txt2 = districtColor.text[1];
      }

      let finalBg1, finalBg2;
      if (dna.bgStyle === 0) {
        finalBg1 = baseGrad1;
        finalBg2 = baseGrad2;
      } else if (dna.bgStyle === 1) {
        finalBg1 = baseGrad1;
        finalBg2 = baseGrad1;
      } else if (dna.bgStyle === 2) {
        finalBg1 = baseGrad2;
        finalBg2 = baseGrad2;
      } else {
        finalBg1 = baseGrad2;
        finalBg2 = baseGrad1;
      }

      let finalTxt1, finalTxt2;
      if (dna.textColorMode === 0) {
        finalTxt1 = txt1;
        finalTxt2 = txt2;
      } else if (dna.textColorMode === 1) {
        finalTxt1 = "#222222";
        finalTxt2 = "#111111";
      } else {
        finalTxt1 = "#FFFFFF";
        finalTxt2 = "#EEEEEE";
      }

      activePalette = {
        gradient: [finalBg1, finalBg2],
        text: [finalTxt1, finalTxt2],
      };

      if (typeof window !== "undefined") {
        const [bg1, bg2] = activePalette.gradient;
        document.body.style.background = `linear-gradient(0deg, ${bg1}, ${bg2})`;
      }

      selectedTemplate = JSON.parse(
        JSON.stringify(
          templatesArrayGlobal[dna.templateIdx % templatesArrayGlobal.length]
            .annotations[0].result
        )
      );

      selectedTitleFont = dna.titleFont;
      selectedBodyFont = dna.bodyFont;

      let artistBoxesCountSetup = selectedTemplate.filter((b) =>
        b.value.rectanglelabels[0].includes("Artista (Imagem)")
      ).length;
      let numToRenderSetup = sketch.min(dna.numArtists, artistBoxesCountSetup);
      numToRenderSetup = sketch.min(numToRenderSetup, userData.artists.length);
      let chosenArtists = userData.artists.slice(0, numToRenderSetup);

      if (userData.schedule && userData.schedule.length > 0) {
        let progText = userData.schedule[0];

        progText = progText.replace(
          /^(SEGUNDA.*?|TERÇA.*?|QUARTA.*?|QUINTA.*?|SEXTA.*?|SÁBADO.*?|SABADO.*?|DOMINGO.*?):\s*$/gim,
          "$1"
        );

        let numTags = (progText.match(/{ARTISTAS}/g) || []).length;

        if (numTags > 0) {
          let artistNames = chosenArtists.map((img) => {
            return img.filename
              ? img.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
              : "Cantor Surpresa";
          });

          if (artistNames.length > 0) {
            let chunks = Array.from({ length: numTags }, () => []);
            let base = Math.floor(artistNames.length / numTags);
            let remainder = artistNames.length % numTags;
            let idx = 0;

            for (let i = 0; i < numTags; i++) {
              let count = base + (i < remainder ? 1 : 0);
              chunks[i] = artistNames.slice(idx, idx + count);
              idx += count;
            }

            let chunkIndex = 0;
            progText = progText.replace(/{ARTISTAS}/g, () => {
              let chunk = chunks[chunkIndex++];
              if (!chunk || chunk.length === 0) return "Animação Musical";
              if (chunk.length === 1) return chunk[0];
              return chunk.slice(0, -1).join(", ") + " e " + chunk[chunk.length - 1];
            });
          } else {
            progText = progText.replace(/{ARTISTAS}/g, "Música ao Vivo");
          }
        }

        userData.schedule = [progText];
      }

      sketch.noLoop();

      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (!document.fonts.check(`12px "${selectedTitleFont}"`)) {
            selectedTitleFont = sketch.random([
              "Arial",
              "Verdana",
              "Georgia",
              "Impact",
              "Comic Sans MS",
              "Trebuchet MS",
              "Arial Black",
            ]);
          }
          if (!document.fonts.check(`12px "${selectedBodyFont}"`)) {
            selectedBodyFont = sketch.random([
              "Arial",
              "Verdana",
              "Georgia",
              "Times New Roman",
              "Courier New",
              "Trebuchet MS",
            ]);
          }
          sketch.redraw();
        });
      }
    };

    sketch.draw = function () {
      saintDrawn = false;
      const [bgA, bgB] = activePalette.gradient;
      _drawGradientBackground(bgA, bgB);

      let filteredTemplate = [];
      let lowestElementY = 0;
      let allSponsorBoxes = [];

      for (let box of selectedTemplate) {
        let rawLabel = box.value.rectanglelabels[0];
        let label = rawLabel.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim();

        if (!label.includes("Patrocínios")) {
          filteredTemplate.push(box);
          if (!label.includes("Sant@ (Figura)")) {
            let boxBottom = box.value.y + box.value.height;
            if (boxBottom > lowestElementY) lowestElementY = boxBottom;
          }
        } else {
          allSponsorBoxes.push(box);
        }
      }

      let finalSponsorBox = null;
      if (userData.sponsorImages.length > 0) {
        if (allSponsorBoxes.length > 0) {
          finalSponsorBox = allSponsorBoxes.reduce((prev, current) => {
            let prevArea = prev.value.width * prev.value.height;
            let currArea = current.value.width * current.value.height;
            return currArea > prevArea ? current : prev;
          });
          filteredTemplate.push(finalSponsorBox);
        } else {
          let startY = Math.max(lowestElementY + 2, 80);
          if (startY > 90) startY = 88;

          finalSponsorBox = {
            value: {
              x: 5,
              y: startY,
              width: 90,
              height: 97 - startY,
              rectanglelabels: ["Patrocínios"],
            },
          };
          filteredTemplate.push(finalSponsorBox);
        }
      }

      if (finalSponsorBox) {
        let sponsorTop = finalSponsorBox.value.y;
        for (let box of filteredTemplate) {
          if (box !== finalSponsorBox) {
            let label = box.value.rectanglelabels[0]
              .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
              .trim();

            if (!label.includes("Sant@ (Figura)")) {
              let boxBottom = box.value.y + box.value.height;
              if (boxBottom > sponsorTop) {
                let overlap = boxBottom - sponsorTop;
                if (overlap > box.value.height * 0.3) {
                  box.value.y = Math.max(0, sponsorTop - box.value.height - 2);
                  if (box.value.y === 0) {
                    box.value.height = sponsorTop - 2;
                  }
                } else {
                  box.value.height = Math.max(2, sponsorTop - box.value.y - 2);
                }
              }
            }
          }
        }
      }

      selectedTemplate = filteredTemplate;

      let artistBoxesCount = selectedTemplate.filter((b) =>
        b.value.rectanglelabels[0].includes("Artista (Imagem)")
      ).length;
      let numToRender = sketch.min(dna.numArtists, artistBoxesCount);
      numToRender = sketch.min(numToRender, userData.artists.length);

      let progBoxesCount = selectedTemplate.filter((b) =>
        b.value.rectanglelabels[0].includes("Programação")
      ).length;
      let distributedProgramacao = [];

      if (progBoxesCount > 0) {
        let progText = userData.schedule[0] || "";
        let lines = progText
          .split(/\n/)
          .map((l) => l.trim())
          .filter((l) => l !== "");

        let days = [];
        let currentDay = [];

        for (let line of lines) {
          let upper = line.toUpperCase();
          if (
            (upper === line &&
              line.length > 3 &&
              !line.includes("H") &&
              !line.match(/^\d/)) ||
            upper.match(
              /^(SEGUNDA|TERÇA|QUARTA|QUINTA|SEXTA|SÁBADO|SABADO|DOMINGO)/
            )
          ) {
            if (currentDay.length > 0) days.push(currentDay.join("\n"));
            currentDay = [line];
          } else {
            currentDay.push(line);
          }
        }
        if (currentDay.length > 0) days.push(currentDay.join("\n"));

        if (progBoxesCount === 1) {
          distributedProgramacao = [progText];
        } else if (days.length > 1) {
          let chunks = Array.from({ length: progBoxesCount }, () => []);
          let base = Math.floor(days.length / progBoxesCount);
          let remainder = days.length % progBoxesCount;
          let idx = 0;
          for (let i = 0; i < progBoxesCount; i++) {
            let count = base + (i < remainder ? 1 : 0);
            chunks[i] = days.slice(idx, idx + count);
            idx += count;
          }
          distributedProgramacao = chunks.map((c) => c.join("\n\n"));
        } else {
          let chunks = Array.from({ length: progBoxesCount }, () => []);
          let base = Math.floor(lines.length / progBoxesCount);
          let remainder = lines.length % progBoxesCount;
          let idx = 0;
          for (let i = 0; i < progBoxesCount; i++) {
            let count = base + (i < remainder ? 1 : 0);
            chunks[i] = lines.slice(idx, idx + count);
            idx += count;
          }
          distributedProgramacao = chunks.map((c) => c.join("\n"));
        }
      }

      let textIndex = 0;
      let currentArtistBoxIndex = 0;
      let currentProgBoxIndex = 0;
      let hasRenderedDate = false;

      for (let box of selectedTemplate) {
        let label = box.value.rectanglelabels[0]
          .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
          .trim();
        let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
        let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
        let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
        let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

        if (label.includes("Sant@ (Figura)")) {
          renderContent(label, px, py, pWidth, pHeight, "", 1.0);
        }
      }

      for (let box of selectedTemplate) {
        let label = box.value.rectanglelabels[0]
          .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
          .trim();
        let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
        let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
        let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
        let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

        if (label.includes("Artista (Imagem)")) {
          if (currentArtistBoxIndex < numToRender) {
            let dynamicContent = userData.artists[currentArtistBoxIndex];
            renderContent(label, px, py, pWidth, pHeight, dynamicContent, 1.0);
          }
          currentArtistBoxIndex++;
        } else if (label.includes("Patrocínios")) {
          if (box === finalSponsorBox) {
            renderContent(
              label,
              px,
              py,
              pWidth,
              pHeight,
              userData.sponsorImages,
              1.0
            );
          }
        }
      }

      for (let box of selectedTemplate) {
        let label = box.value.rectanglelabels[0]
          .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "")
          .trim();
        let px = sketch.map(box.value.x, 0, 100, 0, sketch.width);
        let py = sketch.map(box.value.y, 0, 100, 0, sketch.height);
        let pWidth = sketch.map(box.value.width, 0, 100, 0, sketch.width);
        let pHeight = sketch.map(box.value.height, 0, 100, 0, sketch.height);

        if (
          label.includes("Nome da Terrinha") ||
          label.includes("Data do Evento") ||
          label.includes("Local") ||
          label.includes("Programação")
        ) {
          if (label.includes("Data do Evento")) {
            if (hasRenderedDate) continue;
            hasRenderedDate = true;
          }

          let dynamicContent = "";
          if (label.includes("Programação")) {
            dynamicContent = distributedProgramacao[currentProgBoxIndex] || "";
            currentProgBoxIndex++;
          }

          let scale = dna.textScales[textIndex % dna.textScales.length];
          renderContent(label, px, py, pWidth, pHeight, dynamicContent, scale);
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

    function renderContent(label, x, y, w, h, dynamicContent, scale) {
      sketch.noStroke();
      sketch.textFont(`"${selectedBodyFont}"`);

      const [titleColor, dateColor] = activePalette.text;

      if (label.includes("Sant@ (Figura)")) {
        if (saintImage && !saintDrawn) {
          drawImageContain(saintImage, x, y, w, h);
          saintDrawn = true;
        }
      } else if (label.includes("Nome da Terrinha")) {
        sketch.fill(titleColor);
        sketch.textFont(`"${selectedTitleFont}"`);
        drawTextFitted(userData.partyName, x, y, w, h, sketch.NORMAL, scale);
      } else if (label.includes("Data do Evento")) {
        sketch.fill(dateColor);
        drawTextFitted(userData.eventDate, x, y, w, h, sketch.BOLD, scale);
      } else if (label.includes("Local")) {
        sketch.fill(220, 220, 220);
        drawTextFitted(userData.location, x, y, w, h, sketch.NORMAL, scale);
      } else if (label.includes("Programação")) {
        sketch.fill(255);
        drawTextFitted(dynamicContent, x, y, w, h, sketch.NORMAL, scale);
      } else if (label.includes("Artista (Imagem)")) {
        if (dynamicContent) {
          drawImageContain(dynamicContent, x, y, w, h);
        } else {
          sketch.fill(255, 50, 100, 80);
          sketch.rect(x, y, w, h, 5);
          sketch.fill(255);
          sketch.textAlign(sketch.CENTER, sketch.CENTER);
          sketch.text("Falta Foto!", x + w / 2, y + h / 2);
        }
      } else if (label.includes("Patrocínios")) {
        if (dynamicContent && dynamicContent.length > 0) {
          drawSponsorsFlex(dynamicContent, x, y, w, h);
        }
      }
    }

    function drawSponsorsFlex(logosArray, bx, by, bw, bh) {
      if (!logosArray || logosArray.length === 0) return;

      let gap = 15;
      let lowH = 10;
      let highH = bh;
      let bestLayout = null;
      let iterations = 30;

      while (iterations-- > 0) {
        let midH = (lowH + highH) / 2;
        let layout = testFlexLayout(logosArray, bw, midH, gap);

        if (layout.totalHeight <= bh) {
          bestLayout = layout;
          lowH = midH;
        } else {
          highH = midH;
        }
      }

      if (!bestLayout) {
        bestLayout = testFlexLayout(logosArray, bw, 15, gap);
      }

      let startY = by + (bh - bestLayout.totalHeight) / 2;

      for (let row of bestLayout.rows) {
        let startX = bx + (bw - row.width) / 2;
        let currentX = startX;

        for (let item of row.items) {
          drawImageContain(item.img, currentX, startY, item.w, item.h);
          currentX += item.w + gap;
        }
        startY += bestLayout.rowHeight + gap;
      }
    }

    function testFlexLayout(logosArray, maxW, targetH, gap) {
      let rows = [];
      let currentRow = { width: 0, items: [] };

      for (let img of logosArray) {
        let aspect =
          img && img.width > 0 && img.height > 0 ? img.width / img.height : 1;
        let logoW = targetH * aspect;

        if (currentRow.width + logoW > maxW && currentRow.items.length > 0) {
          rows.push(currentRow);
          currentRow = { width: 0, items: [] };
        }

        currentRow.items.push({ img: img, w: logoW, h: targetH });
        currentRow.width += logoW + gap;
      }

      if (currentRow.items.length > 0) {
        rows.push(currentRow);
      }

      for (let r of rows) r.width -= gap;

      let totalHeight = rows.length * targetH + (rows.length - 1) * gap;
      return { rows: rows, totalHeight: totalHeight, rowHeight: targetH };
    }

    function getWrappedTextHeight(txt, boxWidth) {
      let paragraphs = txt.split("\n");
      let totalHeight = 0;
      let leading = sketch.textLeading();

      for (let p of paragraphs) {
        let words = p.split(" ");
        let currentLine = "";
        let lineCount = 1;

        for (let i = 0; i < words.length; i++) {
          let wordWidth = sketch.textWidth(words[i]);
          if (wordWidth > boxWidth) {
            return Infinity;
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
      sketch.textAlign(sketch.CENTER, sketch.CENTER);

      let minSize = 10;
      let maxSize = 400;
      let optimalSize = minSize;
      let low = minSize;
      let high = maxSize;

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

      optimalSize = optimalSize * scaleMultiplier;
      if (optimalSize < 5) optimalSize = 5;

      sketch.textSize(optimalSize);
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

document.getElementById("generateBtn").addEventListener("click", async () => {
  if (templatesArrayGlobal.length === 0) {
    alert("Aguarda o carregamento dos templates (posicoes.json) e tenta de novo.");
    return;
  }

  const container = document.getElementById("sketch");

  let inputNomeFesta = document.getElementById("promptInputNomeFesta")?.value?.trim();
  let inputLocalidade = document.getElementById("promptInputLocalidade")?.value?.trim();
  let inputDia = document.getElementById("promptInputDia")?.value?.trim();
  let inputPrograma = document.getElementById("promptPrograma")?.value?.trim();

  let districtColor = null;
  let isUserInsertedLocalidade = !!inputLocalidade;

  if (!inputNomeFesta || !inputLocalidade || !inputDia || !inputPrograma) {
    if (!inputLocalidade) isUserInsertedLocalidade = false;

    container.style.display = "block";
    container.innerHTML =
      "<h3 style='color: var(--neon-lime, #39ff14); width: 100%; text-align: center; padding: 40px 0; font-size: 1.5rem; text-shadow: 2px 2px 0px #000;'>A gerar informações... 🤖</h3>";

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyName: inputNomeFesta,
          location: inputLocalidade,
          eventDate: inputDia,
          schedule: inputPrograma,
        }),
      });

      if (!response.ok) {
        let errText = await response.text();
        try {
          errText = JSON.parse(errText).error;
        } catch (e) {}
        throw new Error(errText);
      }

      const data = await response.json();

      document.getElementById("promptInputNomeFesta").value =
        data.partyName || inputNomeFesta || "";
      document.getElementById("promptInputLocalidade").value =
        data.location || inputLocalidade || "";
      document.getElementById("promptInputDia").value =
        data.eventDate || inputDia || "";
      document.getElementById("promptPrograma").value =
        data.schedule || inputPrograma || "";

      inputLocalidade = document.getElementById("promptInputLocalidade").value;
    } catch (err) {
      console.error(err);
      alert(
        "Erro ao gerar texto com LLM: " +
          err.message +
          "\nPor favor preencha os campos manualmente."
      );
      container.innerHTML = "";
      return;
    }
  }

  if (isUserInsertedLocalidade) {
    try {
      container.style.display = "block";
      container.innerHTML =
        "<h3 style='color: var(--neon-lime, #39ff14); width: 100%; text-align: center; padding: 40px 0; font-size: 1.5rem; text-shadow: 2px 2px 0px #000;'>A procurar no mapa... 🗺️</h3>";

      const response = await fetch("/api/identify-district", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: inputLocalidade }),
      });

      const data = await response.json();
      if (data.distrito && typeof getCityColors === "function") {
        districtColor = getCityColors(data.distrito);
      }
    } catch (err) {
      console.error("Failed to identify district:", err);
    }
  }

  container.style.display = "block";
  container.innerHTML =
    "<h3 style='color: var(--neon-lime, #39ff14); width: 100%; text-align: center; padding: 40px 0; font-size: 1.5rem; text-shadow: 2px 2px 0px #000;'>A gerar cartazes, por favor aguarde... ⏳</h3>";

  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.style.display = "none";

  setTimeout(() => {
    container.innerHTML = "";
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

      new p5(createSketch(globalPopulation.individuals[i], districtColor), div.id);
    }

    if (globalPopulation.eliteIndex >= 0) {
      setTimeout(() => {
        selectElite(globalPopulation.eliteIndex);
        if (exportBtn) exportBtn.style.display = "block";
      }, 100);
    } else {
      if (exportBtn) exportBtn.style.display = "block";
    }

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
          top: 8px;
          left: 50%;
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

document.getElementById("exportBtn")?.addEventListener("click", () => {
  if (globalPopulation.eliteIndex >= 0) {
    const selectedCanvas = document.querySelector(
      `#poster-mini-${globalPopulation.eliteIndex} canvas`
    );
    if (selectedCanvas) {
      const link = document.createElement("a");
      link.download = "cartaz-terrinha.png";
      link.href = selectedCanvas.toDataURL("image/png");
      link.click();
    }
  } else {
    alert("Por favor, selecione um cartaz para exportar.");
  }
});