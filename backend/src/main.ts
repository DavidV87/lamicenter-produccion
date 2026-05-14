import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AplicacionModulo } from './app.modulo';
import { FiltroExcepcionesGlobal } from './common/filters/filtro-excepciones-global.filter';
import { AuditoriaServicio } from './common/services/auditoria.servicio';
import { AuditoriaInterceptor } from './common/interceptors/auditoria.interceptor';

/**
 * Punto de entrada de la API Lamicenter.
 * Configura pipes globales, prefijo de ruta y CORS antes de escuchar.
 */
async function iniciar(): Promise<void> {
  const aplicacion = await NestFactory.create(AplicacionModulo);

  // Prefijo global para todas las rutas: /api/v1/...
  aplicacion.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Filtro global de excepciones — respuesta homogénea en formato RespuestaApi
  aplicacion.useGlobalFilters(new FiltroExcepcionesGlobal());

  // Interceptor global de auditoría — registra automáticamente en auditoria_general.
  // Se resuelven las instancias desde el contenedor DI para que PrismaServicio esté disponible.
  const auditoriaServicio = aplicacion.get(AuditoriaServicio);
  const reflector = aplicacion.get(Reflector);
  aplicacion.useGlobalInterceptors(new AuditoriaInterceptor(auditoriaServicio, reflector));

  // Validación global de DTOs con class-validator
  aplicacion.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — en producción restringir al dominio del frontend
  aplicacion.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const puerto = parseInt(process.env.PORT || '3000', 10);
  await aplicacion.listen(puerto);

  console.log(`[Lamicenter] API iniciada en: http://localhost:${puerto}`);
  console.log(`[Lamicenter] Entorno: ${process.env.NODE_ENV || 'development'}`);
}

iniciar();
