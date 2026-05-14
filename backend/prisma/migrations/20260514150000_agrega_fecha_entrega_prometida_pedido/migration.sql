-- Agrega columna fecha_entrega_prometida a la tabla pedidos
ALTER TABLE "pedidos" ADD COLUMN "fecha_entrega_prometida" TIMESTAMP(3);
