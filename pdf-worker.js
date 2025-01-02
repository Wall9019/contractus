/* pdf-worker.js */
/********************************************************
 * Worker mínimo para PDF.js. Em produção, recomenda-se
 * usar a versão oficial do pdfjs-dist.
 ********************************************************/
self.importScripts(
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.13.216/build/pdf.js"
);

const { WorkerMessageHandler } = pdfjsLib;

self.onmessage = function (event) {
  WorkerMessageHandler.onmessage(event);
};
