document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt =
    "Fotografia amadora de uma escultura sacra de corpo inteiro de São/Santo/Santa " +
    document.getElementById("promptInputSanto").value +
    ", esculpida em madeira policromada com pintura antiga, cores suaves e tons coloridos. A estátua deve exibir sinais de desgaste natural. Incluir atributos iconográficos tradicionais e símbolos históricos do santo. Captura frontal, distância média, enquadramento simples e direto. Iluminação ambiente fraca e natural, sombras suaves, sem flash profissional. Fundo neutro de igreja ou nicho, sem distrações, simulando uma fotografia documental básica.";
  const status = document.getElementById("status");
  const imgElement = document.querySelectorAll(".outputImage");

  status.innerText = "A gerar imagem...";

  imgElement.forEach(async (img) => {
    try {
      const response = await fetch("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });

      const result = await response.json();
      if (result.success) {
        img.src = `data:image/png;base64,${result.data}`;
        img.style.display = "block";
        status.innerText = "";
      }
    } catch (err) {
      status.innerText = "Erro na comunicação com o servidor.";
    }
  });
});
