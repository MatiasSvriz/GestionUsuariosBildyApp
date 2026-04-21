// src/validators/deliverynote.validator.js
import { z } from 'zod';

// Trabajadores para albaranes de horas
const workerValidator = z.object({
  name: z.string().min(1, 'El nombre del trabajador es obligatorio'),
  hours: z.number().positive('Las horas deben ser mayores que 0')
});

// Crear albarán
export const createDeliveryNoteValidator = z.object({
  body: z.object({
    client: z.string(),
    project: z.string(),
    format: z.enum(['material', 'hours']),
    description: z.string().optional(),
    workDate: z.string(),

    // Material
    material: z.string().optional(),
    quantity: z.number().optional(),
    unit: z.string().optional(),

    // Horas
    hours: z.number().optional(),
    workers: z.array(workerValidator).optional()
  })
});

// Listar albaranes
export const listDeliveryNotesValidator = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    project: z.string().optional(),
    client: z.string().optional(),
    format: z.string().optional(),
    signed: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    sort: z.string().optional()
  }).optional()
});

// Obtener albarán por id
export const getDeliveryNoteByIdValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

// Descargar PDF
export const getDeliveryNotePdfValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

// Borrar albarán
export const deleteDeliveryNoteValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

// Firmar albarán
export const signDeliveryNoteValidator = z.object({
  params: z.object({
    id: z.string()
  })
});