const CITY_COLORS = {
  Coimbra: {
    gradient: ["#1A0000", "#4D0000"],
    text: ["#FFD700", "#FFFFFF"],
  },
  Lisboa: {
    gradient: ["#0A1628", "#1B3A6B"],
    text: ["#E8E8E8", "#C8102E"],
  },
  Porto: {
    gradient: ["#002D62", "#003DA5"],
    text: ["#FFFFFF", "#EFC050"],
  },
  Braga: {
    gradient: ["#2B0000", "#660000"],
    text: ["#F5E6C8", "#FFD700"],
  },
  Évora: {
    gradient: ["#8B4513", "#C68642"],
    text: ["#FFF8E7", "#1A3A5C"],
  },
  Aveiro: {
    gradient: ["#004C97", "#0070CC"],
    text: ["#FFFFFF", "#00A86B"],
  },
  Faro: {
    gradient: ["#E8A020", "#C06010"],
    text: ["#FFFFFF", "#006994"],
  },
  Viseu: {
    gradient: ["#1A3D1A", "#2E6B2E"],
    text: ["#FFE066", "#FFFFFF"],
  },
  Guimarães: {
    gradient: ["#004225", "#006837"],
    text: ["#FFFFFF", "#FFD700"],
  },
  Setúbal: {
    gradient: ["#1C3557", "#2A5298"],
    text: ["#FFFFFF", "#FF8C00"],
  },
  "Viana do Castelo": {
    gradient: ["#8B0000", "#CC0000"],
    text: ["#FFD700", "#FFFFFF"],
  },
  Beja: {
    gradient: ["#C8A415", "#8B7010"],
    text: ["#FFFFFF", "#1A2A4A"],
  },
  Leiria: {
    gradient: ["#1A3320", "#2D5C34"],
    text: ["#F0E6CC", "#FFD700"],
  },
  Portalegre: {
    gradient: ["#162D4E", "#1E4080"],
    text: ["#FFFFFF", "#CC2200"],
  },
  Santarém: {
    gradient: ["#004D25", "#006B35"],
    text: ["#FFFFFF", "#CC0000"],
  },
  "Castelo Branco": {
    gradient: ["#2C3E50", "#4A6274"],
    text: ["#ECF0F1", "#E8C060"],
  },
  Bragança: {
    gradient: ["#3D1C02", "#6B3010"],
    text: ["#FFD700", "#F5DEB3"],
  },
  "Figueira da Foz": {
    gradient: ["#003153", "#004F7C"],
    text: ["#FFFFFF", "#FFD700"],
  },
  Funchal: {
    gradient: ["#006400", "#1A7A1A"],
    text: ["#FFD700", "#FFFFFF"],
  },
  "Ponta Delgada": {
    gradient: ["#003087", "#0044CC"],
    text: ["#FFFFFF", "#00CC66"],
  },
};

function getCityColors(cityName) {
  if (!cityName) return null;

  const normalize = (s) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const normalizedKey = normalize(cityName);

  for (const [key, value] of Object.entries(CITY_COLORS)) {
    if (normalize(key) === normalizedKey) {
      return value;
    }
  }

  return null;
}
