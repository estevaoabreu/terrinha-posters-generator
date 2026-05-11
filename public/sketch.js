// ==========================================
// 1. CONFIGURAÇÕES INICIAIS
// ==========================================
var sketch = function (sketch) {
  let templatesDB;
  let selectedTemplate;
  let imagensCarregadas = [];

  // -> Quantas imagens "Frame X" tens na pasta?
  let quantidadeDeImagens = 3;

  // Dados simulados do utilizador
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

  // ==========================================
  // 2. CARREGAR FICHEIROS (PRELOAD)
  // ==========================================
  sketch.preload = function () {
    templatesDB = sketch.loadJSON("posicoes.json");

    // DICA: Se quiseres uma fonte super parecida com cartazes reais,
    // faz upload de uma fonte (ex: impact.ttf) e descomenta a linha abaixo:
    // minhaFonte = sketch.loadFont('impact.ttf');

    for (let i = 1; i <= quantidadeDeImagens; i++) {
      let caminhoDaImagem = "ImagensArtistas/Frame " + i + ".png"; // muda para .jpg se necessário
      imagensCarregadas.push(sketch.loadImage(caminhoDaImagem));
    }
  };

  // ==========================================
  // 3. SETUP DO CARTAZ
  // ==========================================
  sketch.setup = function () {
    sketch.createCanvas(600, 850);

    userData.artistas = imagensCarregadas;

    let templatesArray = Object.values(templatesDB);
    let randomIndex = sketch.floor(sketch.random(templatesArray.length));
    selectedTemplate = templatesArray[randomIndex].annotations[0].result;

    sketch.noLoop();
  };

  // ==========================================
  // 4. DESENHAR O CARTAZ (DRAW)
  // ==========================================
  sketch.draw = function () {
    sketch.background(20, 20, 100);

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

  // ==========================================
  // 5. RENDERIZAR CAIXAS E TIPOGRAFIA
  // ==========================================
  function renderContent(label, x, y, w, h, conteudoDinamico) {
    sketch.noStroke();

    if (label.includes("Sant@ (Figura)")) {
      sketch.fill(255, 200, 0, 80);
      sketch.rect(x, y, w, h, 10);
      sketch.fill(255);
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(18);
      sketch.text("[SANTO]", x + w / 2, y + h / 2);
    } else if (label.includes("Nome da Terrinha")) {
      sketch.fill(255, 255, 0); // Amarelo clássico
      // Chama a função especial que estica o texto para caber no w e h!
      drawTextFitted(userData.nomeTerrinha, x, y, w, h, sketch.BOLD);
    } else if (label.includes("Data do Evento")) {
      sketch.fill(0, 255, 255); // Ciano
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

  // ==========================================
  // FUNÇÃO COM AVALIAÇÃO DE FITNESS E SEM DISTORÇÃO
  // ==========================================
  function drawTextFitted(txt, x, y, w, h, style) {
    sketch.push();
    // Movemos o ponto de desenho para o centro da bounding box
    sketch.translate(x + w / 2, y + h / 2);

    // 1. TAMANHO DE BASE PARA O TESTE DE FITNESS
    let baseSize = 100;
    sketch.textSize(baseSize);

    // Aqui no futuro vais aplicar a tua fonte vinda da API
    // sketch.textFont(fonteDaAPI);
    sketch.textStyle(style);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);

    // 2. MEDIR O TEXTO
    let tw = sketch.textWidth(txt);
    let th = sketch.textAscent() + sketch.textDescent();

    // 3. CALCULAR O FITNESS (O Fator Ótimo)
    // Ao contrário do código anterior onde separávamos o X e o Y (causando distorção),
    // aqui pegamos no fator de escala mais restritivo usando a função min()
    let scaleFactor = sketch.min(w / tw, h / th);

    // 4. APLICAR O TAMANHO IDEAL
    // Multiplicamos por 0.90 para deixar uma margem de segurança de 10%
    // para que as letras não fiquem a tocar nas bordas da caixa (dá legibilidade)
    let optimalSize = baseSize * scaleFactor * 0.9;

    // Definimos o textSize finalmente para o tamanho ideal calculado
    sketch.textSize(optimalSize);

    // 5. DESENHAR (Sem usar a função scale(), logo, sem distorção!)
    sketch.text(txt, 0, 0);

    // (Opcional) Debug: Podes descomentar a linha abaixo para ver a caixa gerada
    // e perceber como o texto se encaixa perfeitamente de forma orgânica.
    // sketch.noFill(); sketch.stroke(255, 0, 0); sketch.rectMode(sketch.CENTER); sketch.rect(0, 0, w, h);

    sketch.pop();
  }
};

let posterSketch = new p5(sketch, "sketch");
