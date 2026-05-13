import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'rolesRequeridos';

/** Restringe el endpoint a los roles indicados. Se evalúa en RolesGuarda. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
