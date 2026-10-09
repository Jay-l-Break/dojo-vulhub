const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const MAX_PDF_BYTES = 2 * 1024 * 1024;

function sendResponse(response, status, text) {
  response.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8'});
  response.end(text);
}

function renderPdf(data) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfjs-001-'));
  const filePath = path.join(directory, `${crypto.randomUUID()}.pdf`);
  fs.writeFileSync(filePath, data);
  const worker = spawn(process.execPath, ['render-worker.cjs', filePath], {
    stdio: 'ignore',
  });
  worker.on('close', () => fs.rmSync(directory, {recursive: true, force: true}));
}

function handleRequest(request, response) {
  if (request.method === 'GET' && request.url === '/') {
    sendResponse(response, 200, 'PDF.js render service\nPOST a PDF to /render\n');
    return;
  }
  if (request.method !== 'POST' || request.url !== '/render') {
    sendResponse(response, 404, 'Not found\n');
    return;
  }
  if (request.headers['content-type'] !== 'application/pdf') {
    sendResponse(response, 415, 'Expected application/pdf\n');
    return;
  }
  const chunks = [];
  let size = 0;
  request.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_PDF_BYTES) {
      request.destroy();
      return;
    }
    chunks.push(chunk);
  });
  request.on('end', () => {
    const data = Buffer.concat(chunks);
    if (!data.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      sendResponse(response, 400, 'Invalid PDF\n');
      return;
    }
    renderPdf(data);
    sendResponse(response, 202, 'Render queued\n');
  });
}

http.createServer(handleRequest).listen(80, '0.0.0.0');
