const {app, BrowserWindow} = require('electron');
const http = require('http');

let mainWindow;
let ready = false;

function submitHtml(request, response) {
  const chunks = [];
  request.on('data', chunk => chunks.push(chunk));
  request.on('end', () => {
    const html = Buffer.concat(chunks).toString('utf8');
    const script = 'document.getElementById("script").value=' +
        JSON.stringify(html) +
        '; document.querySelector("input[type=button]").click();';
    mainWindow.webContents.executeJavaScript(script, true);
    response.writeHead(202);
    response.end('Submitted\n');
  });
}

function handleRequest(request, response) {
  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(ready ? 200 : 503, {'Content-Type': 'text/plain'});
    response.end(ready ? 'Electron ready\n' : 'Electron starting\n');
    return;
  }
  if (request.method === 'POST' && request.url === '/submit') {
    submitHtml(request, response);
    return;
  }
  response.writeHead(404);
  response.end();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {nodeIntegration: false, nativeWindowOpen: true},
  });
  mainWindow.webContents.on('did-finish-load', () => { ready = true; });
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  http.createServer(handleRequest).listen(80, '0.0.0.0');
}

app.on('ready', createWindow);
