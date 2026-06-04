function gerarCoresAutonomas(semente) {
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

function resolverPaleta(nomeCidade) {
  if (typeof obterCoresCidade === "function" && nomeCidade) {
    const paletaCultural = obterCoresCidade(nomeCidade);
    if (paletaCultural) return paletaCultural;
  }
  return gerarCoresAutonomas(nomeCidade || "");
}

function aplicarGradienteFundo(nomeCidade) {
  const paleta = resolverPaleta(nomeCidade);
  const [c1, c2] = paleta.gradient;
  const usarRadial = Math.random() > 0.5;

  document.body.style.background = usarRadial
    ? `radial-gradient(ellipse at 50% 50%, ${c1}, ${c2})`
    : `linear-gradient(0deg, ${c1}, ${c2})`;

  window._paletaAtiva = paleta;
}

(function init() {
  const cidadeGuardada = null;
  aplicarGradienteFundo(cidadeGuardada);
})();

function getRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 50;
  const l = Math.floor(Math.random() * 40) + 30;
  return `hsl(${h}, ${s}%, ${l}%)`;
}
