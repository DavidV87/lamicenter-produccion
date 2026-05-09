import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AplicacionControlador } from './app.controlador';
import { AplicacionServicio } from './app.servicio';
import { PrismaModulo } from './prisma/prisma.modulo';
import configuracion from './config/configuracion';

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
  ],
  controllers: [AplicacionControlador],
  providers: [AplicacionServicio],
})
export class AplicacionModulo {}
