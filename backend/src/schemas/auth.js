const { z } = require('../middlewares/validate');

const loginSchema = z.object({
  email:    z.string({ required_error: 'Email requerido' }).email('Email inválido').max(254),
  password: z.string({ required_error: 'Contraseña requerida' }).min(1, 'Contraseña requerida').max(72, 'Contraseña demasiado larga'),
});

const registerSchema = z.object({
  email:    z.string({ required_error: 'Email requerido' }).email('Email inválido').max(254),
  password: z.string({ required_error: 'Contraseña requerida' }).min(12, 'La contraseña debe tener al menos 12 caracteres').max(72, 'Contraseña demasiado larga'),
});

module.exports = { loginSchema, registerSchema };
