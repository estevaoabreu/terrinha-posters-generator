// ============================================================
// randomBg.js — Fundo da Interface
// Integra o dicionário cultural (cores-cidades.js).
// Se a cidade existir, usa a sua paleta histórica.
// Se não existir, invoca gerarCoresAutonomas() (fallback criativo).
// ============================================================

// ── 1. FALLBACK CRIATIVO — Sistema Autónomo ─────────────────
/**
 * gerarCoresAutonomas(semente)
 *
 * FUTURO: Esta função será o "motor criativo" do sistema quando a
 * cidade inserida não pertencer à base de dados cultural.
 * Em vez de cor aleatória pura, aplicará matemática de cor para
 * garantir resultados esteticamente válidos e com contraste legível.
 *
 * ALGORITMO PREVISTO:
 *
 *  1. GERAÇÃO DA COR BASE
 *     - Usar a semente (string da cidade) para derivar um ângulo Hue (0–360°)
 *       via hash numérico (ex: somar charCodes e usar módulo 360).
 *     - Definir Saturação entre 55%–80% (evita tons acinzentados e "néon")
 *       e Luminosidade entre 25%–40% para a cor escura do gradiente.
 *
 *  2. COR COMPLEMENTAR / ANÁLOGA
 *     - Calcular a cor secundária usando harmonia de cor:
 *       a) Análoga: Hue ± 30° (harmonia suave, festiva)
 *       b) Complementar: Hue + 180° (contraste dramático, impacto visual)
 *     - Escolher entre os dois modos com base na paridade do hash.
 *
 *  3. VALIDAÇÃO DE LUMINOSIDADE (WCAG)
 *     - Converter HSL → RGB → luminância relativa (fórmula WCAG 2.1).
 *     - Garantir rácio de contraste ≥ 3:1 entre o fundo e o texto branco.
 *     - Se o rácio falhar, deslocar a Luminosidade da cor base até passar.
 *
 *  4. GERAÇÃO DAS CORES DE TEXTO
 *     - Cor de título: derivada em HSL com Hue da cor base, S≥80%, L=80–95%
 *       (tom claro e saturado que "canta" sobre fundo escuro).
 *     - Cor de data: complementar ao título, garantindo diferenciação.
 *
 *  5. OUTPUT
 *     - Retorna objeto no mesmo formato de CORES_CIDADES:
 *       { gradient: ["#HEX1", "#HEX2"], text: ["#HEX1", "#HEX2"] }
 *
 * @param {string} semente - Nome da cidade (usado como seed determinística)
 * @returns {{ gradient: string[], text: string[] }}
 */
function gerarCoresAutonomas(semente) {
  // TODO: Implementar algoritmo acima.
  // Por agora, fallback puramente aleatório (provisório):
  const h1 = Math.floor(Math.random() * 360);
  const h2 = (h1 + 40) % 360;
  const grad1 = `hsl(${h1}, 65%, 22%)`;
  const grad2 = `hsl(${h2}, 70%, 32%)`;
  const txt1  = `hsl(${(h1 + 180) % 360}, 80%, 85%)`;
  const txt2  = `#FFFFFF`;

  return {
    gradient: [grad1, grad2],
    text:     [txt1, txt2]
  };
}

// ── 2. RESOLUÇÃO DE PALETA ───────────────────────────────────
/**
 * Obtém a paleta para o nome da cidade dado.
 * Prioridade: base cultural → sistema autónomo.
 *
 * @param {string|null} nomeCidade
 * @returns {{ gradient: string[], text: string[] }}
 */
function resolverPaleta(nomeCidade) {
  // obterCoresCidade é definido em cores-cidades.js
  if (typeof obterCoresCidade === "function" && nomeCidade) {
    const paletaCultural = obterCoresCidade(nomeCidade);
    if (paletaCultural) return paletaCultural;
  }
  // Cidade não encontrada → criatividade autónoma
  return gerarCoresAutonomas(nomeCidade || "");
}

// ── 3. APLICAÇÃO AO FUNDO DA PÁGINA ─────────────────────────
function aplicarGradienteFundo(nomeCidade) {
  const paleta = resolverPaleta(nomeCidade);
  const [c1, c2] = paleta.gradient;
  const usarRadial = Math.random() > 0.5;

  document.body.style.background = usarRadial
    ? `radial-gradient(ellipse at 60% 40%, ${c1}, ${c2})`
    : `linear-gradient(135deg, ${c1}, ${c2})`;

  // Expor paleta globalmente para sketch.js consumir
  window._paletaAtiva = paleta;
}

// ── 4. INICIALIZAÇÃO ─────────────────────────────────────────
(function init() {
  // Tentar ler a cidade já guardada (pode vir do localStorage no futuro)
  const cidadeGuardada = null; // placeholder — poster-generator.js preencherá
  aplicarGradienteFundo(cidadeGuardada);
})();