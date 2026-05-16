import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AplicacionControlador } from './app.controlador';
import { AplicacionServicio } from './app.servicio';
import { PrismaModulo } from './prisma/prisma.modulo';
import configuracion from './config/configuracion';
import { JwtAuthGuarda } from './modules/seguridad/auth/guards/jwt-auth.guarda';
import { RolesGuarda } from './modules/seguridad/auth/guards/roles.guarda';
import { PermisosGuarda } from './modules/seguridad/auth/guards/permisos.guarda';
import { AuditoriaServicio } from './common/services/auditoria.servicio';

// Módulos de dominio — se habilitarán bloque por bloque
import { SeguridadModulo } from './modules/seguridad/seguridad.modulo';
import { CatalogoModulo } from './modules/catalogo/catalogo.modulo';
import { DocumentosModulo } from './modules/documentos/documentos.modulo';
import { PedidosModulo } from './modules/pedidos/pedidos.modulo';
import { ProduccionModulo } from './modules/produccion/produccion.modulo';
import { AbastecimientoModulo } from './modules/abastecimiento/abastecimiento.modulo';
import { DespachoModulo } from './modules/despacho/despacho.modulo';
import { NotificacionesModulo } from './modules/notificaciones/notificaciones.modulo';
import { PqrsModulo } from './modules/pqrs/pqrs.modulo';
import { ReportesModulo } from './modules/reportes/reportes.modulo';

@Module({
  imports: [
    // Configuración global — disponible en toda la aplicación via ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuracion],
      envFilePath: '.env',
    }),

    // Prisma global — PrismaServicio disponible sin importar el módulo explícitamente
    PrismaModulo,

    // Módulos de dominio
    SeguridadModulo,
    CatalogoModulo,
    DocumentosModulo,
    PedidosModulo,
    ProduccionModulo,
    AbastecimientoModulo,
    DespachoModulo,
    NotificacionesModulo,
    PqrsModulo,
    ReportesModulo,
  ],
  controllers: [AplicacionControlador],
  providers: [
    AplicacionServicio,
    // Servicio de auditoría — disponible para inyección en módulos de dominio y en main.ts
    AuditoriaServicio,
    // Guards globales — orden: JWT → Roles → Permisos
    { provide: APP_GUARD, useClass: JwtAuthGuarda },
    { provide: APP_GUARD, useClass: RolesGuarda },
    { provide: APP_GUARD, useClass: PermisosGuarda },
  ],
})
export class AplicacionModulo {}
