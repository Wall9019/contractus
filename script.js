/*******************************************
 * script.js
 * Teste mínimo da API do ChatGPT
 *******************************************/

// API KEY ofuscada em Base64 (exemplo!):
const encodedApiKey =
  "c2stcHJvai1sMlZSUUZERjladkFUa3lnWklRcXNrc2xtdS1hQVE2Y3phUFUxUUZoNXM0alJDeHpTQ0tDV0stQ05tWVlMTnhnWEVEclZiaHBnSHNUM0JsYmtGSjQtajBVc0NCSG5qNC1kMFRhc3JyUFdmVC1jYW9XcHBqZTFieDRuUmFoNWhYbU5JSzBLa0Job3Rvb1RrVHVqM0FRMXZ6NHFLUDRB";

// Decodifica a chave
function getApiKey() {
  return atob(encodedApiKey);
}

// Seletores
const fileInput = document.getElementById("fileInput");
const manualText = document.getElementById("manualText");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultSection = document.getElementById("resultSection");
const resultText = document.getElementById("resultText");

// Ao clicar em "Enviar para Análise"
analyzeBtn.addEventListener("click", async () => {
  // Tenta ler texto do arquivo OU do campo manual
  let textToAnalyze = manualText.value.trim();

  // Se o textarea estiver vazio, mas houver arquivo:
  if (!textToAnalyze && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    // Ler o conteúdo do arquivo (texto puro)
    textToAnalyze = await file.text();
  }

  // Se ainda não tiver texto, avisa o usuário
  if (!textToAnalyze) {
    alert("Por favor, insira algum texto ou selecione um arquivo .txt!");
    return;
  }

  // Chama a API
  try {
    const response = await callChatGPT(textToAnalyze);
    // Exibe o resultado
    resultText.textContent = response;
    resultSection.classList.remove("d-none");
  } catch (error) {
    console.error(error);
    alert("Erro ao chamar a API do ChatGPT!");
  }
});

// Função que chama o ChatGPT
async function callChatGPT(inputText) {
  const myApiKey = getApiKey();

  // Prompt simples
  const prompt = `
Você é uma IA especializada em testes de análise de texto. Analise o conteúdo abaixo:
"${inputText}"
E retorne um breve resumo ou comentário.
`;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${myApiKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 100, // pequeno para teste
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha na API do ChatGPT: " + response.status);
  }

  const result = await response.json();
  return result.choices[0].text.trim();
}
