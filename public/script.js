document.getElementById("generateBtn").addEventListener("click", async () => {
  const promptInput = document.getElementById("promptInputSanto").value;
  if (!promptInput.trim()) {
    alert("Por favor, introduza o nome de um Santo.");
    return;
  }

  const prompt =
    "Fotografia amadora de uma escultura sacra de corpo inteiro de São/Santo/Santa " +
    promptInput +
    ", esculpida em madeira policromada com pintura antiga, cores suaves e tons coloridos. A estátua deve exibir sinais de desgaste natural. Incluir atributos iconográficos tradicionais e símbolos históricos do santo. Captura frontal, distância média, enquadramento simples e direto. Iluminação ambiente fraca e natural, sombras suaves, sem flash profissional. Fundo neutro de igreja ou nicho, sem distrações, simulando uma fotografia documental básica.";

  const status = document.getElementById("status");
  const imgElements = document.querySelectorAll(".outputImage");

  status.innerText = "A iniciar geração...";

  try {
    // Apaga as imagens antigas enquanto gera as novas
    imgElements.forEach((img) => {
      img.style.display = "none";
      img.src = "";
    });

    // Geramos uma imagem de cada vez para podermos dar feedback ao utilizador
    for (let i = 0; i < imgElements.length; i++) {
      status.innerText = `A gerar imagem ${i + 1} de ${imgElements.length}... Por favor, aguarde.`;

      const response = await fetch("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          count: 1, // Pede apenas 1 imagem de cada vez
        }),
      });

      const result = await response.json();

      if (result.success && result.images && result.images[0]) {
        imgElements[i].src = `data:image/png;base64,${result.images[0]}`;
        imgElements[i].style.display = "block";
      } else {
        console.error(`Erro ao gerar a imagem ${i + 1}`);
      }
    }

    status.innerText = "Geração concluída com sucesso!";
  } catch (err) {
    status.innerText = "Erro na comunicação com o servidor.";
  }
});

document.querySelectorAll(".outputImage").forEach((img) => {
  img.addEventListener("click", () => {
    if (
      !img.src ||
      img.src === window.location.href ||
      img.src.endsWith(".html")
    )
      return;

    document.querySelectorAll(".outputImage").forEach((el) => {
      el.classList.remove("selected");
    });

    img.classList.add("selected");

    localStorage.setItem("selectedSaintImage", img.src);
  });
});
