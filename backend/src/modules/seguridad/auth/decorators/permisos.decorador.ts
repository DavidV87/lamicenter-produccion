import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'permisosRequeridos';

/** Restringe el endpoint a usuarios que posean TODOS los permisos indicados. Se evalúa en PermisosGuarda. */
export const Permisos = (...permisos: string[]) => SetMetadata(PERMISOS_KEY, permisos);
