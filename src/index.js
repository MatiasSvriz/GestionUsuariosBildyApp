import mongoose from 'mongoose';
import app from './app.js';
import { config, validateConfig } from './config/index.js';
import connectDB from './config/database.js';

let server;

const startServer = async () => {
  try {
    validateConfig();

    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando aplicación...`);

  if (server) {
    server.close(() => {
      console.log('Servidor HTTP cerrado');
    });
  }

  await mongoose.connection.close();
  console.log('Conexión a MongoDB cerrada');

  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();