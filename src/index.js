import mongoose from 'mongoose';
import app from './app.js';
import { config, validateConfig } from './config/index.js';

const startServer = async () => {
  try {
    validateConfig();

    await mongoose.connect(config.dbUri);
    console.log('✅ MongoDB conectado');

    app.listen(config.port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error.message);
    process.exit(1);
  }
};

startServer();