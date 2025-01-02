/* pdf-worker.js */

// Versão reduzida/ilustrativa; pode não suportar PDFs muito complexos.
// Em projetos reais, use a versão oficial do pdfjs-dist (npm ou CDN).

self.importScripts("https://cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.js");

const { WorkerMessageHandler } = pdfjsLib;

self.onmessage = function (event) {
  WorkerMessageHandler.onmessage(event);
};
