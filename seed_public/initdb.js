const crypto = require('crypto');

function findOne(collection, filter) {
  return new Promise((resolve, reject) => {
    collection.findOne(filter, (error, document) => {
      if (error) reject(error);
      else resolve(document);
    });
  });
}

function insertOne(collection, document) {
  return new Promise((resolve, reject) => {
    collection.insertOne(document, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function seedPublic(db) {
  const tokens = db.collection('token');
  if (await findOne(tokens, { project_id: 66 })) return;

  const now = Math.floor(Date.now() / 1000);
  await insertOne(db.collection('user'), {
    _id: 11,
    username: 'admin',
    email: 'admin@local.invalid',
    password: crypto.randomBytes(32).toString('hex'),
    passsalt: crypto.randomBytes(16).toString('hex'),
    role: 'admin',
    add_time: now,
    up_time: now,
  });
  await insertOne(db.collection('project'), {
    _id: 66,
    name: 'example',
    uid: 11,
    group_id: 66,
    project_type: 'private',
    basepath: '',
    env: [],
    add_time: now,
    up_time: now,
  });
  await insertOne(tokens, {
    _id: 66,
    project_id: 66,
    token: crypto.randomBytes(10).toString('hex'),
  });
}

module.exports = seedPublic;
