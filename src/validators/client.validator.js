// src/validators/client.validator.js
import { z } from 'zod';

const addressValidator = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  postal: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional()
});

export const createClientValidator = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    cif: z.string().min(1, 'El CIF es obligatorio'),
    email: z.string().email('Email no válido').optional(),
    phone: z.string().optional(),
    address: addressValidator.optional()
  })
});

export const updateClientValidator = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    cif: z.string().min(1).optional(),
    email: z.string().email('Email no válido').optional(),
    phone: z.string().optional(),
    address: addressValidator.optional()
  })
});

export const getClientByIdValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

export const deleteClientValidator = z.object({
  params: z.object({
    id: z.string()
  }),
  query: z.object({
    soft: z.string().optional()
  }).optional()
});

export const restoreClientValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

export const listClientsValidator = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    name: z.string().optional(),
    sort: z.string().optional()
  }).optional()
});

export const listArchivedClientsValidator = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    name: z.string().optional(),
    sort: z.string().optional()
  }).optional()
});