const fs = require('fs');
const mongodb = require('mongodb');
const seedPublic = require('./seed_public/initdb.js');

const mongoAddress = process.env.MONGO_ADDR || 'localhost:27017';
const mongoHost = mongoAddress.split(':')[0];
const mongoPort = Number(mongoAddress.split(':')[1] || 27017);

function configureApplication() {
  const config = {
    port: '80',
    adminAccount: 'admin@local.invalid',
    closeRegister: true,
    db: {
      servername: mongoHost,
      DATABASE: 'yapi',
      port: mongoPort,
      user: '',
      pass: '',
      authSource: '',
    },
    mail: { enable: false },
  };
  fs.writeFileSync('/usr/config.json', JSON.stringify(config));
}

function connect() {
  return new Promise((resolve, reject) => {
    mongodb.MongoClient.connect(`mongodb://${mongoAddress}/yapi`, (error, db) => {
      if (error) {
        reject(error);
      } else {
        resolve(db);
      }
    });
  });
}

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      return await connect();
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error('MongoDB did not become ready');
}

async function main() {
  configureApplication();
  const db = await waitForDatabase();
  try {
    await seedPublic(db);
  } finally {
    db.close();
  }
  require('./server/app.js');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
