-- Migración: agrega_acciones_auditoria
-- Agrega los valores ELIMINAR y CONSULTAR al enum TipoAccionAuditoria.
-- IF NOT EXISTS garantiza idempotencia en re-ejecuciones accidentales.
-- Los valores de enum en PostgreSQL son inmutables una vez creados — no requieren rollback manual.

ALTER TYPE "TipoAccionAuditoria" ADD VALUE IF NOT EXISTS 'ELIMINAR';
ALTER TYPE "TipoAccionAuditoria" ADD VALUE IF NOT EXISTS 'CONSULTAR';
