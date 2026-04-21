// src/config/database.js
import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  try {
    if (!config.DB_URI) {
      throw new Error('DB_URI no está definida en el .env');
    }

    await mongoose.connect(config.DB_URI);

    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Opcional pero MUY recomendable
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Conexión a MongoDB cerrada');
  process.exit(0);
});

export default connectDB;