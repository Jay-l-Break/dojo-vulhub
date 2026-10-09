const db = require("./server/models/models");

async function start() {
  await db.sequelize.sync();
  require("./server/index.js");
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
