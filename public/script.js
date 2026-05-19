document.getElementById("generateBtn").addEventListener("click", async () => {
  const promptInput = document.getElementById("promptInputSanto").value;
  if (!promptInput.trim()) {
    alert("Por favor, introduza o nome de um Santo.");
    return;
  }

  const prompt = `Amateur documentary photograph of a full-body sacred wooden sculpture of Saint ${promptInput}, antique polychrome carved wood, faded pastel colors, natural signs of aging, cracked paint and weathered wood textures. Holding traditional iconographic attributes and holy symbols. Medium shot, frontal view, simple direct framing, 50mm lens. Dim natural church ambient lighting, soft shadows, unedited, no flash. Neutral dark church niche background, photorealistic, high resolution.`;
  const status = document.getElementById("status");
  const imgElements = document.querySelectorAll(".outputImage");
  let loadingInterval;

  try {
    imgElements.forEach((img) => {
      img.style.display = "none";
      img.src = "";
    });

    for (let i = 0; i < imgElements.length; i++) {
      let dotCount = 0;
      status.innerText = `A gerar imagem ${i + 1}/${imgElements.length}`;
      loadingInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        status.innerText = `A gerar imagem ${i + 1}/${imgElements.length}${".".repeat(dotCount)}`;
      }, 500);

      const response = await fetch("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          count: 1,
        }),
      });

      clearInterval(loadingInterval);

      const result = await response.json();

      if (result.success && result.images && result.images[0]) {
        imgElements[i].src = `data:image/png;base64,${result.images[0]}`;
        imgElements[i].style.display = "block";
      } else {
        console.error(`Erro ao gerar a imagem ${i + 1}`);
      }
    }

    status.innerText = "Imagens geradas com sucesso!";
  } catch (err) {
    if (loadingInterval) clearInterval(loadingInterval);
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
