const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();

  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

beforeEach(async () => {
  // clear db between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

