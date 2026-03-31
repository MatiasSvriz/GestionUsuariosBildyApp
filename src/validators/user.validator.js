import { z } from 'zod';

const addressValidator = z.object({
  street: z.string().trim().optional(),
  number: z.string().trim().optional(),
  postal: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional()
});

export const registerUserValidator = z.object({
  body: z.object({
    email: z.string()
      .email('Email no válido')
      .trim()
      .transform((value) => value.toLowerCase()),
    password: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
  })
});

export const validateEmailCodeValidator = z.object({
  body: z.object({
    code: z.string()
      .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos')
  })
});

export const loginUserValidator = z.object({
  body: z.object({
    email: z.string()
      .email('Email no válido')
      .trim()
      .transform((value) => value.toLowerCase()),
    password: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
  })
});

export const updatePersonalDataValidator = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'El nombre es obligatorio'),
    lastName: z.string().trim().min(1, 'Los apellidos son obligatorios'),
    nif: z.string().trim().min(1, 'El NIF es obligatorio'),
    address: z.object({
      street: z.string().trim().min(1, 'La calle es obligatoria'),
      number: z.string().trim().min(1, 'El número es obligatorio'),
      postal: z.string().trim().min(1, 'El código postal es obligatorio'),
      city: z.string().trim().min(1, 'La ciudad es obligatoria'),
      province: z.string().trim().min(1, 'La provincia es obligatoria')
    }).optional()
  })
});

export const updateCompanyValidator = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    cif: z.string().trim().optional(),
    address: addressValidator.optional(),
    isFreelance: z.boolean()
  })
});

export const refreshTokenValidator = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token obligatorio')
  })
});

export const changePasswordValidator = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(8, 'La contraseña actual debe tener al menos 8 caracteres'),
    newPassword: z.string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
  }).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: 'La nueva contraseña debe ser diferente de la actual',
      path: ['newPassword']
    }
  )
});

export const inviteUserValidator = z.object({
  body: z.object({
    email: z.string()
      .email('Email no válido')
      .trim()
      .transform((value) => value.toLowerCase()),
    password: z.string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    name: z.string().trim().min(1, 'El nombre es obligatorio'),
    lastName: z.string().trim().min(1, 'Los apellidos son obligatorios'),
    nif: z.string().trim().min(1, 'El NIF es obligatorio')
  })
});