/**************************************
 * script.js
 * Frontend Puro + PDF.js + Mammoth.js
 **************************************/

// API KEY "OFUSCADA" (Base64) => "sk-proj-l2VRQFDF9Z..."
const encodedApiKey = "YzJzdGtjanN5QXJnaG82UU1WOG9tQ2ZpY2lhbCENCiBza3AtcHJvai1sMlZSUUZERjladkFUa3lnWklRcXNrc2xtdS1hQVE2Y3phUFUxUUZoNXM0alJDeHpTQ0tDV0stQ05tWVlMTnhnWEVEclZiaHBnSHNUM0JsYmtGSjQtajBVc0NCSG5qNC1kMFRhc3JyUFdmVC1jYW9XcHBqZTFieDRuUmFoNWhYbU5JSzBLa0Job3Rvb1RrVHVqM0FRMXZ6NHFLUDRB";

// Decodifica a chave
function getApiKey() {
  // Remove quebras de linha e decode
  return atob(encodedApiKey.replace(/\s+/g, ''));
}

// Seletores de elementos
const fileInput = document.getElementById("fileInput");
const manualButton = document.getElementById("manualButton");
const manualSection = document.getElementById("manual-section");
const analyzeManualBtn = document.getElementById("analyzeManualBtn");
const manualTextArea = document.getElementById("manualTextArea");
const loadingSection = document.getElementById("loading-section");
const resultsSection = document.getElementById("results-section");
const analysisResultsDiv = document.getElementById("analysis-results");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const newAnalysisBtn = document.getElementById("newAnalysisBtn");

// ----------------------------------------
//  EXIBIR/OCULTAR SEÇÕES
// ----------------------------------------
function showSection(section) {
  [manualSection, loadingSection, resultsSection].forEach((sec) => {
    sec.classList.add("hidden");
  });
  if (section) section.classList.remove("hidden");
}

// ----------------------------------------
//  BOTÃO "INSERIR TEXTO MANUALMENTE"
// ----------------------------------------
manualButton.addEventListener("click", () => {
  showSection(manualSection);
});

// ----------------------------------------
//  UPLOAD DE ARQUIVO PDF/WORD
// ----------------------------------------
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Verifica formato
  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const fileName = file.name.toLowerCase();
  if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
    alert("Formato não suportado. Apenas PDF e Word são aceitos.");
    return;
  }

  // Exibe "Carregando..."
  showSection(loadingSection);

  try {
    let extractedText = "";
    if (fileName.endsWith(".pdf")) {
      extractedText = await convertPdfToText(file);
    } else {
      extractedText = await convertWordToText(file);
    }

    // Chama análise
    const analysis = await analyzeText(extractedText);
    showAnalysisResults(analysis);
  } catch (error) {
    console.error(error);
    alert("Erro ao processar o arquivo.");
    showSection(null);
  }
});

// ----------------------------------------
//  BOTÃO "INICIAR ANÁLISE" (TEXTO MANUAL)
// ----------------------------------------
analyzeManualBtn.addEventListener("click", async () => {
  const userInput = manualTextArea.value.trim();
  if (!userInput) {
    alert("Por favor, insira o texto do contrato.");
    return;
  }

  showSection(loadingSection);
  try {
    const analysis = await analyzeText(userInput);
    showAnalysisResults(analysis);
  } catch (error) {
    console.error(error);
    alert("Erro ao analisar o texto.");
    showSection(null);
  }
});

// ----------------------------------------
//  FUNÇÃO CONVERSÃO PDF -> TEXTO COM PDF.js
// ----------------------------------------
async function convertPdfToText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let extractedText = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    extractedText += pageText + "\n";
  }

  return extractedText;
}

// ----------------------------------------
//  FUNÇÃO CONVERSÃO WORD -> TEXTO COM MAMMOTH.js
// ----------------------------------------
async function convertWordToText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ----------------------------------------
//  CHAMADA À API DO CHATGPT
// ----------------------------------------
async function analyzeText(inputText) {
  const myApiKey = getApiKey();

  const prompt = `
Você é uma Inteligência Artificial especializada na análise de contratos sociais. 
Verifique lacunas, inconsistências ou ausência de cláusulas obrigatórias, 
baseando-se no Código Civil Brasileiro (Lei nº 10.406/2002) e especialmente no art. 997.

Texto do contrato a analisar:
"${inputText}"
`;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${myApiKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1000,
      temperature: 0.0,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha na chamada da API do ChatGPT");
  }

  const result = await response.json();
  return result.choices[0].text.trim();
}

// ----------------------------------------
//  EXIBE RESULTADOS NA TELA
// ----------------------------------------
function showAnalysisResults(analysisText) {
  analysisResultsDiv.textContent = analysisText;
  showSection(resultsSection);
}

// ----------------------------------------
//  DOWNLOAD DO RELATÓRIO (TEXTO PURO)
// ----------------------------------------
downloadReportBtn.addEventListener("click", () => {
  const blob = new Blob([analysisResultsDiv.textContent], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ----------------------------------------
//  NOVA ANÁLISE (RECARREGA PÁGINA)
// ----------------------------------------
newAnalysisBtn.addEventListener("click", () => {
  location.reload();
});
