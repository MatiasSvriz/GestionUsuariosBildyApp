import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.ACCESS_TOKEN_EXPIRES = '1h';
process.env.REFRESH_TOKEN_EXPIRES = '7d';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.PUBLIC_URL = 'http://localhost:3000';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  console.log('🧪 MongoDB Memory Server conectado');
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();

  console.log('🧪 MongoDB Memory Server cerrado');
});