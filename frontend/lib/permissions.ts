export const PERMISSIONS = {
  BIBLIOTECA_READ_PUBLIC: 'biblioteca.read.public',
  BIBLIOTECA_READ_INTERNAL: 'biblioteca.read.internal',
  BIBLIOTECA_UPLOAD_OWN: 'biblioteca.upload.own',
  BIBLIOTECA_REVIEW: 'biblioteca.review',
  BIBLIOTECA_APPROVE: 'biblioteca.approve',
  BIBLIOTECA_REJECT: 'biblioteca.reject',
  BIBLIOTECA_REQUEST_CHANGES: 'biblioteca.request_changes',
  BIBLIOTECA_ARCHIVE: 'biblioteca.archive',
  BIBLIOTECA_DELETE: 'biblioteca.delete',
  PROYECTOS_READ_PUBLIC: 'proyectos.read.public',
  PROYECTOS_READ_ASSIGNED: 'proyectos.read.assigned',
  PROYECTOS_READ_PRIVATE: 'proyectos.read.private',
  PROYECTOS_CREATE: 'proyectos.create',
  PROYECTOS_UPDATE_ASSIGNED: 'proyectos.update.assigned',
  PROYECTOS_UPDATE_ALL: 'proyectos.update.all',
  PROYECTOS_OPERATE_ASSIGNED: 'proyectos.operate.assigned',
  PROYECTOS_REVIEW_ASSIGNED: 'proyectos.review.assigned',
  PROYECTOS_DELETE: 'proyectos.delete',
  NOTICIAS_READ_PUBLIC: 'noticias.read.public',
  NOTICIAS_CREATE: 'noticias.create',
  NOTICIAS_UPDATE: 'noticias.update',
  NOTICIAS_PUBLISH: 'noticias.publish',
  NOTICIAS_DELETE: 'noticias.delete',
  USUARIOS_READ: 'usuarios.read',
  USUARIOS_CREATE: 'usuarios.create',
  USUARIOS_UPDATE: 'usuarios.update',
  USUARIOS_DISABLE: 'usuarios.disable',
  USUARIOS_ASSIGN_ROLES: 'usuarios.assign_roles',
  CONFIGURACION_MANAGE: 'configuracion.manage',
  SOCIOS_READ: 'socios.read',
  SOCIOS_CREATE: 'socios.create',
  SOCIOS_UPDATE: 'socios.update',
  SOCIOS_DELETE: 'socios.delete',
  TECNICOS_READ: 'tecnicos.read',
  TECNICOS_CREATE: 'tecnicos.create',
  TECNICOS_UPDATE: 'tecnicos.update',
  TECNICOS_ASSIGN: 'tecnicos.assign',
  TECNICOS_DELETE: 'tecnicos.delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function hasAnyPermission(
  permissions: readonly string[] | undefined,
  required: readonly string[]
) {
  return required.some(permission => permissions?.includes(permission));
}
