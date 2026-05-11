document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt =
    "Cria uma imagem fotorrealista de uma escultura do Santo " +
    document.getElementById("promptInput").value +
    ". Baseia-te em imagens e historias desse santo. A imagem deve ter luz e composição pouco profissional.";
  const status = document.getElementById("status");
  const imgElement = document.getElementById("outputImage");

  status.innerText = "A solicitar ao servidor...";

  try {
    const response = await fetch("/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt }),
    });

    const result = await response.json();
    if (result.success) {
      imgElement.src = `data:image/png;base64,${result.data.bytesBase64Encoded}`;
      imgElement.style.display = "block";
    }
  } catch (err) {
    status.innerText = "Erro na comunicação com o servidor.";
  }
});
