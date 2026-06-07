function generateAutonomousColors(seed) {
  const h1 = Math.floor(Math.random() * 360);
  const h2 = (h1 + 40) % 360;
  const grad1 = `hsl(${h1}, 65%, 22%)`;
  const grad2 = `hsl(${h2}, 70%, 32%)`;
  const txt1 = `hsl(${(h1 + 180) % 360}, 80%, 85%)`;
  const txt2 = `#FFFFFF`;

  return {
    gradient: [grad1, grad2],
    text: [txt1, txt2],
  };
}

function resolvePalette(cityName) {
  if (typeof getCityColors === "function" && cityName) {
    const culturalPalette = getCityColors(cityName);
    if (culturalPalette) return culturalPalette;
  }
  return generateAutonomousColors(cityName || "");
}

function applyBackgroundGradient(cityName) {
  const palette = resolvePalette(cityName);
  const [c1, c2] = palette.gradient;
  const useRadial = Math.random() > 0.5;

  document.body.style.background = useRadial
    ? `radial-gradient(ellipse at 50% 50%, ${c1}, ${c2})`
    : `linear-gradient(0deg, ${c1}, ${c2})`;

  window._activePalette = palette;
}

(function init() {
  const savedCity = null;
  applyBackgroundGradient(savedCity);
})();

function getRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 50;
  const l = Math.floor(Math.random() * 40) + 30;
  return `hsl(${h}, ${s}%, ${l}%)`;
}
