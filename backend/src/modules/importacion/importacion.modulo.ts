import { Module } from '@nestjs/common';
import { ImportacionControlador } from './importacion.controlador';
import { ImportacionClientesServicio } from './importacion-clientes.servicio';

/**
 * ImportacionModulo — importación masiva desde Excel por entidad.
 * V1: solo clientes. Arquitectura preparada para agregar proveedores, ítems y usuarios.
 */
@Module({
  controllers: [ImportacionControlador],
  providers: [ImportacionClientesServicio],
})
export class ImportacionModulo {}
