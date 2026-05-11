-- Constraint XOR: una etapa pertenece a orden principal O suborden, nunca ambas ni ninguna.
-- Regla de negocio aprobada para Bloque 5.
ALTER TABLE orden_etapas
ADD CONSTRAINT chk_orden_etapa_xor
CHECK (
  (orden_produccion_id IS NOT NULL AND suborden_id IS NULL) OR
  (orden_produccion_id IS NULL AND suborden_id IS NOT NULL)
);