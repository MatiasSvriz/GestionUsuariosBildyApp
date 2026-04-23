// src/routes/index.js
import { Router } from 'express';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const router = Router();
const __dirname = import.meta.dirname;

// Buscar todos los archivos *.routes.js
const files = readdirSync(__dirname).filter(file =>
  file.endsWith('.routes.js')
);

// Cargar automáticamente cada ruta
for (const file of files) {
  const routeName = file.replace('.routes.js', '');

  try {
    console.log('Cargando ruta:', file);
    const routeModule = await import(join(__dirname, file));
    router.use(`/${routeName}`, routeModule.default);
  } catch (error) {
    console.error('Error cargando ruta:', file);
    throw error;
  }
}

export default router;