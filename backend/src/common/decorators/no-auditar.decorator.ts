import { SetMetadata } from '@nestjs/common';

export const NO_AUDITAR_KEY = 'noAuditar';

/** Excluye el endpoint del interceptor global de auditoría automática. */
export const NoAuditar = () => SetMetadata(NO_AUDITAR_KEY, true);
