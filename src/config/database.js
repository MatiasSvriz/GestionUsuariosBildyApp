import mongoose from 'mongoose';
import { config } from './index.js';

const connectDB = async () => {
  await mongoose.connect(config.dbUri);
  console.log('✅ MongoDB conectado');
};

export default connectDB;