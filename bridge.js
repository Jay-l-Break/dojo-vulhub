const http = require('http');
const fs = require('fs');
const {MongoClient} = require('/app/bundle/programs/server/npm/node_modules/mongodb');

const user = JSON.parse(fs.readFileSync('/app/bundle/seed_public/user.json', 'utf8'));
const backendPort = 3000;

function proxy(request, response, headers = request.headers, path = request.url) {
  const upstream = http.request({
    hostname: '127.0.0.1', port: backendPort, path,
    method: request.method, headers,
  }, (result) => {
    response.writeHead(result.statusCode, result.headers);
    result.pipe(response);
  });
  upstream.on('error', () => {
    response.writeHead(503);
    response.end('Rocket.Chat is starting');
  });
  request.pipe(upstream);
}

function identity(request, response) {
  const material = request.headers['x-rocket-identity'] || '';
  const separator = material.indexOf(':');
  if (separator < 1) {
    response.writeHead(401);
    response.end('Missing identity');
    return;
  }
  const userId = material.slice(0, separator);
  const token = material.slice(separator + 1);
  const upstream = http.get({
    hostname: '127.0.0.1', port: backendPort, path: '/api/v1/me',
    headers: {'X-User-Id': userId, 'X-Auth-Token': token},
  }, (result) => {
    const chunks = [];
    result.on('data', (chunk) => chunks.push(chunk));
    result.on('end', () => {
      let profile;
      try {
        profile = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch (error) {
        profile = null;
      }
      if (result.statusCode !== 200 || !profile ||
          profile._id !== user.user_id || profile.username !== user.username) {
        response.writeHead(401);
        response.end('Invalid identity');
        return;
      }
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({username: profile.username}));
    });
  });
  upstream.on('error', () => {
    response.writeHead(503);
    response.end('Rocket.Chat is starting');
  });
}

async function seedVictim() {
  const hash = process.env.VICTIM_PASSWORD_HASH;
  if (!hash) throw new Error('Missing private victim password hash');
  const uri = process.env.MONGO_URL;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    let client;
    try {
      client = await MongoClient.connect(uri, {useNewUrlParser: true});
      const databaseName = new URL(uri).pathname.slice(1);
      await client.db(databaseName).collection('users').updateOne(
          {_id: user.user_id},
          {$setOnInsert: {
            username: user.username,
            emails: [{address: user.email, verified: true}],
            active: true,
            roles: ['user'],
            services: {password: {bcrypt: hash}},
          }},
          {upsert: true});
      await client.close();
      return;
    } catch (error) {
      if (client) await client.close();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('MongoDB did not become ready');
}

seedVictim().then(() => {
  http.createServer((request, response) => {
    if (request.url === '/challenge/whoami') {
      identity(request, response);
      return;
    }
    proxy(request, response);
  }).listen(80, '0.0.0.0');
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
