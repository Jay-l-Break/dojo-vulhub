const fs = require('node:fs');
const {createCanvas, DOMMatrix, Path2D} = require('@napi-rs/canvas');

globalThis.PDFJS = {workerSrc: 'ignored', disableWorker: true};
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;
globalThis.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return createCanvas(1, 1);
    }
    throw new Error(`Unsupported element: ${tag}`);
  },
  domain: 'localhost',
  cookie: '',
};
globalThis.navigator = {userAgent: 'Node.js'};
globalThis.window = {
  document: globalThis.document,
  location: 'http://localhost/',
  navigator: globalThis.navigator,
  requestAnimationFrame: (callback) => setImmediate(callback),
};

require('pdfjs-dist/build/pdf.combined.js');
PDFJS.disableWorker = true;
PDFJS.disableFontFace = true;

function renderPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  PDFJS.getDocument(data).then(async (pdf) => {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport(1);
    const canvas = createCanvas(viewport.width, viewport.height);
    await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
  }).catch(() => {
    process.exitCode = 1;
  });
}

renderPdf(process.argv[2]);
