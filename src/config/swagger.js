// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'BildyApp API',
      version: '1.0.0',
      description: 'API REST para gestión de usuarios, clientes, proyectos y albaranes digitales'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            ok: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'BAD_REQUEST'
                },
                message: {
                  type: 'string',
                  example: 'Solicitud inválida'
                }
              }
            }
          }
        },

        Address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: 'Calle Mayor' },
            number: { type: 'string', example: '10' },
            postal: { type: 'string', example: '28001' },
            city: { type: 'string', example: 'Madrid' },
            province: { type: 'string', example: 'Madrid' }
          }
        },

        User: {
          type: 'object',
          required: ['email', 'role', 'status'],
          properties: {
            _id: { type: 'string', example: '6808f1d9c3a4f7a123456789' },
            email: { type: 'string', format: 'email', example: 'matias@test.com' },
            name: { type: 'string', example: 'Matías' },
            lastName: { type: 'string', example: 'Svriz' },
            nif: { type: 'string', example: '12345678A' },
            role: { type: 'string', example: 'admin' },
            status: { type: 'string', example: 'verified' },
            company: { type: 'string', example: '6808f1d9c3a4f7a123456780' }
          }
        },

        Company: {
          type: 'object',
          required: ['owner', 'name', 'cif'],
          properties: {
            _id: { type: 'string', example: '6808f1d9c3a4f7a123456780' },
            owner: { type: 'string', example: '6808f1d9c3a4f7a123456789' },
            name: { type: 'string', example: 'Empresa Test' },
            cif: { type: 'string', example: 'B12345678' },
            address: {
              $ref: '#/components/schemas/Address'
            },
            logo: { type: 'string', example: '/uploads/logo.png' },
            isFreelance: { type: 'boolean', example: false }
          }
        },

        Client: {
          type: 'object',
          required: ['user', 'company', 'name', 'cif'],
          properties: {
            _id: { type: 'string', example: '6808f1d9c3a4f7a123456781' },
            user: { type: 'string', example: '6808f1d9c3a4f7a123456789' },
            company: { type: 'string', example: '6808f1d9c3a4f7a123456780' },
            name: { type: 'string', example: 'Cliente Demo' },
            cif: { type: 'string', example: 'B12345678' },
            email: { type: 'string', example: 'cliente@demo.com' },
            phone: { type: 'string', example: '600123123' },
            address: {
              $ref: '#/components/schemas/Address'
            },
            deleted: { type: 'boolean', example: false }
          }
        },

        Project: {
          type: 'object',
          required: ['user', 'company', 'client', 'name', 'projectCode'],
          properties: {
            _id: { type: 'string', example: '6808f1d9c3a4f7a123456782' },
            user: { type: 'string', example: '6808f1d9c3a4f7a123456789' },
            company: { type: 'string', example: '6808f1d9c3a4f7a123456780' },
            client: { type: 'string', example: '6808f1d9c3a4f7a123456781' },
            name: { type: 'string', example: 'Proyecto Reforma' },
            projectCode: { type: 'string', example: 'PR-001' },
            address: {
              $ref: '#/components/schemas/Address'
            },
            email: { type: 'string', example: 'obra@demo.com' },
            notes: { type: 'string', example: 'Proyecto de prueba' },
            active: { type: 'boolean', example: true },
            deleted: { type: 'boolean', example: false }
          }
        },

        Worker: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Juan Pérez' },
            hours: { type: 'number', example: 4 }
          }
        },

        DeliveryNote: {
          type: 'object',
          required: ['user', 'company', 'client', 'project', 'format', 'workDate'],
          properties: {
            _id: { type: 'string', example: '6808f1d9c3a4f7a123456783' },
            user: { type: 'string', example: '6808f1d9c3a4f7a123456789' },
            company: { type: 'string', example: '6808f1d9c3a4f7a123456780' },
            client: { type: 'string', example: '6808f1d9c3a4f7a123456781' },
            project: { type: 'string', example: '6808f1d9c3a4f7a123456782' },
            format: {
              type: 'string',
              enum: ['material', 'hours'],
              example: 'material'
            },
            description: { type: 'string', example: 'Entrega de cemento' },
            workDate: { type: 'string', format: 'date-time', example: '2026-04-23T00:00:00.000Z' },
            material: { type: 'string', example: 'Cemento' },
            quantity: { type: 'number', example: 20 },
            unit: { type: 'string', example: 'sacos' },
            hours: { type: 'number', example: 8 },
            workers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Worker'
              }
            },
            signed: { type: 'boolean', example: false },
            signedAt: { type: 'string', format: 'date-time', nullable: true },
            signatureUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/.../signature.webp' },
            pdfUrl: { type: 'string', nullable: true, example: 'https://res.cloudinary.com/.../deliverynote.pdf' },
            deleted: { type: 'boolean', example: false }
          }
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'matias@test.com' },
            password: { type: 'string', format: 'password', example: '12345678' }
          }
        },

        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'matias@test.com' },
            password: { type: 'string', format: 'password', example: '12345678' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;