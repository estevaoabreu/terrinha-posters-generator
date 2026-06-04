// ============================================================
// CORES DAS CIDADES — Base de Conhecimento Cultural
// Formato: { gradient: [cor1, cor2], text: [corTítulo, corData] }
//
// As paletas refletem o contexto histórico/institucional de
// cada localidade: cores das universidades, associações
// académicas, clubes desportivos, bandeiras municipais, etc.
// ============================================================

const CORES_CIDADES = {

  // Coimbra — Associação Académica de Coimbra (preto e vermelho)
  // + dourado da Universidade de Coimbra (fundada 1290)
  "Coimbra": {
    gradient: ["#1A0000", "#4D0000"],
    text:     ["#FFD700", "#FFFFFF"]
  },

  // Lisboa — azul/branco do Sport Lisboa e Benfica e da bandeira municipal
  // Azul profundo do brasão lisboeta + vermelho benfiquista
  "Lisboa": {
    gradient: ["#0A1628", "#1B3A6B"],
    text:     ["#E8E8E8", "#C8102E"]
  },

  // Porto — azul e branco do F.C. Porto, granito cinzento das ribanceiras
  "Porto": {
    gradient: ["#002D62", "#003DA5"],
    text:     ["#FFFFFF", "#EFC050"]
  },

  // Braga — vermelho episcopal (Arquidiocese de Braga, primaz de Espanha)
  // + granito cinzento das igrejas barrocas
  "Braga": {
    gradient: ["#2B0000", "#660000"],
    text:     ["#F5E6C8", "#FFD700"]
  },

  // Évora — ocre/terracota das paredes alentejanas, azul do céu planáltico
  // UNESCO World Heritage City desde 1986
  "Évora": {
    gradient: ["#8B4513", "#C68642"],
    text:     ["#FFF8E7", "#1A3A5C"]
  },

  // Aveiro — azul e branco dos azulejos e moliceiros
  // + verde esmeralda das lagoas da Ria
  "Aveiro": {
    gradient: ["#004C97", "#0070CC"],
    text:     ["#FFFFFF", "#00A86B"]
  },

  // Faro — dourado das praias do Algarve, azul turquesa do Atlântico
  // + terracota árabe (herança moura)
  "Faro": {
    gradient: ["#E8A020", "#C06010"],
    text:     ["#FFFFFF", "#006994"]
  },

  // Viseu — verde Dão (vinhos), castanho das serras beirãs
  // + amarelo solar do planalto
  "Viseu": {
    gradient: ["#1A3D1A", "#2E6B2E"],
    text:     ["#FFE066", "#FFFFFF"]
  },

  // Guimarães — verde e branco do Vitória S.C.
  // Berço da nação (D. Afonso Henriques, 1128)
  "Guimarães": {
    gradient: ["#004225", "#006837"],
    text:     ["#FFFFFF", "#FFD700"]
  },

  // Setúbal — azul índigo do Atlântico, branco das salinas
  // + laranja dos arrozais da arrábida
  "Setúbal": {
    gradient: ["#1C3557", "#2A5298"],
    text:     ["#FFFFFF", "#FF8C00"]
  },

  // Viana do Castelo — verde/vermelho do folclore minhoto
  // + dourado dos bordados de Viana
  "Viana do Castelo": {
    gradient: ["#8B0000", "#CC0000"],
    text:     ["#FFD700", "#FFFFFF"]
  },

  // Beja — amarelo alentejano / ocre profundo da planície
  // + azul do Regimento de Cavalaria de Beja
  "Beja": {
    gradient: ["#C8A415", "#8B7010"],
    text:     ["#FFFFFF", "#1A2A4A"]
  },

  // Leiria — verde pinheiro (Pinhal de Leiria, plantado por D. Dinis)
  // + cinzento pedra do castelo
  "Leiria": {
    gradient: ["#1A3320", "#2D5C34"],
    text:     ["#F0E6CC", "#FFD700"]
  },

  // Portalegre — azul/branco da Real Fábrica de Tapeçarias (1737)
  // + vermelho das fronteiras alentejanas
  "Portalegre": {
    gradient: ["#162D4E", "#1E4080"],
    text:     ["#FFFFFF", "#CC2200"]
  },

  // Santarém — verde/branco do Sporting CP (epicentro da rivalidade ribatejana)
  // + vermelho sangue-de-touro da capital da tauromaquia
  "Santarém": {
    gradient: ["#004D25", "#006B35"],
    text:     ["#FFFFFF", "#CC0000"]
  },

  // Castelo Branco — azul-ardósia das serras da Beira Baixa
  // + branco/prata dos famosos colchas bordadas
  "Castelo Branco": {
    gradient: ["#2C3E50", "#4A6274"],
    text:     ["#ECF0F1", "#E8C060"]
  },

  // Bragança — castanho terra-fria transmontana + amarelo castanheiro
  // Brasão da Casa de Bragança, última dinastia real portuguesa
  "Bragança": {
    gradient: ["#3D1C02", "#6B3010"],
    text:     ["#FFD700", "#F5DEB3"]
  },

  // Figueira da Foz — azul marinho das praias, branco das espumas
  // + amarelo das areias da maior praia da Europa
  "Figueira da Foz": {
    gradient: ["#003153", "#004F7C"],
    text:     ["#FFFFFF", "#FFD700"]
  },

  // Funchal — verde/vermelho da bandeira da Madeira
  // + dourado das bananas e vinhos da Madeira
  "Funchal": {
    gradient: ["#006400", "#1A7A1A"],
    text:     ["#FFD700", "#FFFFFF"]
  },

  // Ponta Delgada — azul açoriano (bandeira dos Açores)
  // + branco das Furnas, verde esmeralda das caldeiras
  "Ponta Delgada": {
    gradient: ["#003087", "#0044CC"],
    text:     ["#FFFFFF", "#00CC66"]
  }

};

// ============================================================
// Utilitário: obtém a paleta de uma cidade (case-insensitive,
// com normalização de acentos).
// Retorna null se a cidade não existir na base de dados.
// ============================================================
function obterCoresCidade(nomeCidade) {
  if (!nomeCidade) return null;

  // Normalizar: trim + lower + remover diacríticos
  const normalizar = (s) =>
    s.trim().toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "");

  const chaveNormalizada = normalizar(nomeCidade);

  for (const [chave, valor] of Object.entries(CORES_CIDADES)) {
    if (normalizar(chave) === chaveNormalizada) {
      return valor;
    }
  }

  return null; // Cidade não encontrada → fallback generativo
}