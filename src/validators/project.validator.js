// src/validators/project.validator.js
import { z } from 'zod';

const addressValidator = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  postal: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional()
});

export const createProjectValidator = z.object({
  body: z.object({
    client: z.string(),
    name: z.string().min(1, 'El nombre es obligatorio'),
    projectCode: z.string().min(1, 'El código del proyecto es obligatorio'),
    address: addressValidator.optional(),
    email: z.string().email('Email no válido').optional(),
    notes: z.string().optional(),
    active: z.boolean().optional()
  })
});

export const updateProjectValidator = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    client: z.string().optional(),
    name: z.string().min(1).optional(),
    projectCode: z.string().min(1).optional(),
    address: addressValidator.optional(),
    email: z.string().email('Email no válido').optional(),
    notes: z.string().optional(),
    active: z.boolean().optional()
  })
});

export const getProjectByIdValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

export const deleteProjectValidator = z.object({
  params: z.object({
    id: z.string()
  }),
  query: z.object({
    soft: z.string().optional()
  }).optional()
});

export const restoreProjectValidator = z.object({
  params: z.object({
    id: z.string()
  })
});

export const listProjectsValidator = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    client: z.string().optional(),
    name: z.string().optional(),
    active: z.string().optional(),
    sort: z.string().optional()
  }).optional()
});

export const listArchivedProjectsValidator = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    client: z.string().optional(),
    name: z.string().optional(),
    active: z.string().optional(),
    sort: z.string().optional()
  }).optional()
});