import http from 'node:http';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/usr/local/lib/node_modules/clawdbot/node_modules/playwright-core');

const GATEWAY_ORIGIN = 'http://127.0.0.1:18790/';
const SETTINGS_KEY = 'clawdbot.control.settings.v1';
const BROWSER_PORT = 18791;

async function prepareVictim() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(GATEWAY_ORIGIN, {waitUntil: 'domcontentloaded'});
  await page.evaluate(
      ([key, token]) => localStorage.setItem(key, JSON.stringify({token})),
      [SETTINGS_KEY, process.env.OPENCLAW_GATEWAY_TOKEN]);
  await page.reload({waitUntil: 'domcontentloaded'});
  await page.waitForFunction(
      () => document.querySelector('clawdbot-app')?.connected === true,
      undefined,
      {timeout: 30000});
  return {browser, context};
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 4096) {
      throw new Error('request too large');
    }
  }
  return JSON.parse(body);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(payload));
}

async function main() {
  const victim = await prepareVictim();
  http.createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/healthz') {
      sendJson(response, 200, {ready: true});
      return;
    }
    if (request.method !== 'POST' || request.url !== '/visit') {
      sendJson(response, 404, {error: 'not found'});
      return;
    }
    try {
      const payload = await readJson(request);
      const gatewayUrl = new URL(payload.gateway_url);
      if (!['ws:', 'wss:'].includes(gatewayUrl.protocol)) {
        throw new Error('gateway_url must be a WebSocket URL');
      }
      const page = await victim.context.newPage();
      const trigger = new URL(GATEWAY_ORIGIN);
      trigger.searchParams.set('gatewayUrl', gatewayUrl.href);
      await page.goto(trigger.href, {waitUntil: 'domcontentloaded'});
      sendJson(response, 200, {visited: true});
    } catch (error) {
      sendJson(response, 400, {error: String(error)});
    }
  }).listen(BROWSER_PORT, '0.0.0.0');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
