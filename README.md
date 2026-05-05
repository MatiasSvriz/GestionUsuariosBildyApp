# BildyApp API

API REST para la gestión de usuarios, clientes, proyectos y albaranes digitales.

---

## Descripción

BildyApp API es un backend desarrollado con Node.js, Express y MongoDB para gestionar usuarios, clientes, proyectos y albaranes digitales.

El proyecto incluye autenticación, gestión de entidades principales, documentación Swagger, ejecución con Docker y tests automatizados.

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/bildyapp-api.git
cd bildyapp-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
NODE_ENV=development
PORT=3000
PUBLIC_URL=http://localhost:3000

DB_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/bildyapp?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=tu_jwt_secret_seguro
ACCESS_TOKEN_EXPIRES=2h

REFRESH_TOKEN_EXPIRES_IN=7d

SLACK_WEBHOOK=https://hooks.slack.com/services/tu/webhook/url

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_SECURE=false

SMTP_USER=tu_smtp_user
SMTP_PASS=tu_smtp_password

SMTP_FROM="BildyApp <tu-correo@gmail.com>"
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La API estará disponible en:

```txt
http://localhost:3000
```

---

## Ejecución con Docker

Para ejecutar la aplicación con Docker Compose:

```bash
docker compose up --build
```

---

## Documentación Swagger

La documentación Swagger está disponible en:

```txt
http://localhost:3000/api-docs/
```

---

## Tests

### Ejecutar tests

```bash
npm test
```

### Ejecutar tests con cobertura

```bash
npm run test:coverage
```

---

## Funcionalidades principales

- Registro y autenticación de usuarios.
- Gestión de clientes.
- Gestión de proyectos.
- Gestión de albaranes digitales.
- Subida de archivos con Cloudinary.
- Documentación Swagger.
- Tests automatizados.
- Ejecución con Docker.

---