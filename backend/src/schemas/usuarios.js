const { z } = require('../middlewares/validate');
const { VALID_ROLES } = require('../services/usuarios.service');

const roleEnum = z.enum(VALID_ROLES, { error: `Rol inválido. Debe ser uno de: ${VALID_ROLES.join(', ')}` });

const createUsuarioSchema = z.object({
  email:     z.string({ required_error: 'Email requerido' }).email('Email inválido').max(254),
  password:  z.string({ required_error: 'Contraseña requerida' }).min(12, 'La contraseña debe tener al menos 12 caracteres').max(72, 'Contraseña demasiado larga'),
  role:      roleEnum,
  full_name: z.string().max(200, 'Nombre demasiado largo').optional(),
});

const assignRoleSchema = z.object({
  role: roleEnum,
});

module.exports = { createUsuarioSchema, assignRoleSchema };
