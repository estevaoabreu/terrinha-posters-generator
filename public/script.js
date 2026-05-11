document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt =
    "Cria uma imagem de uma escultura de corpo inteiro de São/Santo/Santa " +
    document.getElementById("promptInputSanto").value +
    ", feita em madeira policromada com tons coloridos. Baseia-te em representações já existentes e histórias desse santo, para utilizar símbolos e imagens associados a esse santo. A foto deve ser tirada de frente, a uma distância média, capturando a figura inteira do santo. A iluminação deve ser fraca, e a escultura deve estar ligeiramente desgastada. A composição deve ser simples e direta, sem elementos distrativos, simulando uma foto tirada por um amador.";
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
      imgElement.src = `data:image/png;base64,${result.data}`;
      imgElement.style.display = "block";
      status.innerText = "";
    }
  } catch (err) {
    status.innerText = "Erro na comunicação com o servidor.";
  }
});
