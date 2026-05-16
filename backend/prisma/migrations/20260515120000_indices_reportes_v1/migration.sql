CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_despacho_completo
ON pedidos(fecha_despacho_completo)
WHERE fecha_despacho_completo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_actualizado_en
ON pedidos(actualizado_en);

CREATE INDEX IF NOT EXISTS idx_pqrs_actualizado_en
ON pqrs(actualizado_en);

CREATE INDEX IF NOT EXISTS idx_despachos_actualizado_en
ON despachos(actualizado_en);

CREATE INDEX IF NOT EXISTS idx_ordenes_produccion_actualizado_en
ON ordenes_produccion(actualizado_en);
