import http from 'node:http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import app from './app.js';
import { config, validateConfig } from './config/index.js';
import connectDB from './config/database.js';
import User from './models/User.js';
import { setSocketIO } from './services/socket.service.js';

let server;
let io;

const startServer = async () => {
  try {
    validateConfig();

    await connectDB();

    server = http.createServer(app);

    io = new Server(server, {
      cors: {
        origin: true,
        credentials: true
      }
    });

    setSocketIO(io);

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;

        if (!token) {
          return next(new Error('Token no proporcionado'));
        }

        const payload = jwt.verify(token, config.jwtSecret);

        const user = await User.findById(payload.id);

        if (!user || !user.company) {
          return next(new Error('Usuario no autorizado'));
        }

        socket.user = user;

        // Room por compañía
        socket.join(user.company.toString());

        next();
      } catch (error) {
        next(new Error('Token inválido o expirado'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`Socket conectado: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Socket desconectado: ${socket.id}`);
      });
    });

    server.listen(config.port, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando aplicación...`);

  if (io) {
    io.close(() => {
      console.log('Socket.IO cerrado');
    });
  }

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