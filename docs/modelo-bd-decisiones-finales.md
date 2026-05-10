# MODELO DE BASE DE DATOS — DECISIONES FINALES APROBADAS

## Sistema de Información para Control de Producción — Lamicenter S.A.S.

---

# 1. Propósito del documento

Este documento consolida las decisiones finales aprobadas durante la revisión funcional y técnica de los 8 bloques de base de datos del sistema de información para control de producción de Lamicenter.

Debe ser usado como referencia principal antes de que Claude Code implemente migraciones, modelos Prisma, relaciones, enums, seeds o lógica de backend.

El objetivo es evitar que se implemente una versión inicial incompleta, desactualizada o sin los ajustes aprobados durante la revisión técnica.

---

# 2. Principios generales de diseño

## 2.1 Idioma y nomenclatura

Todas las tablas, campos, variables, constantes, funciones, servicios, controladores, módulos y relaciones deben nombrarse en español.

Los nombres deben ser claros, semánticos y directamente relacionados con la información del negocio.

Ejemplos correctos:

* pedido
* ordenProduccion
* suborden
* facturaItem
* sedeProduccionId
* usuarioAutorizaId
* fechaValidacion
* cantidadPendiente

Evitar nombres genéricos como:

* data
* info
* temp
* obj
* item1

---

## 2.2 UUID

Todas las tablas principales deben usar UUID como identificador primario.

Recomendación PostgreSQL:

* usar `gen_random_uuid()`

---

## 2.3 Auditoría

Toda operación crítica debe generar auditoría.

Debe existir tabla `auditoria_general` desde el día 1.

Campos mínimos esperados:

* id
* tipoEntidad
* entidadId
* usuarioId
* responsableOperativoId nullable
* autorizadorId nullable
* estadoAnterior nullable
* estadoNuevo nullable
* accion
* observaciones nullable
* ipOrigen nullable
* userAgent nullable
* metadata JSONB
* fechaCreacion

Las escrituras en tablas específicas de historial deben realizarse de forma atómica junto con `auditoria_general` dentro de la misma transacción.

---

## 2.4 JSONB

Se usará `metadata JSONB` en tablas donde se requiera flexibilidad futura sin alterar el esquema constantemente.

Debe documentarse la estructura esperada de cada JSONB cuando se use para configuración funcional.

---

## 2.5 No eliminación física

Entidades críticas no deben eliminarse físicamente.

Para catálogos se usará campo `activo`.

Para entidades operativas se controlará mediante estados.

No se usará combinación redundante de `activo`, `eliminado` y `fechaEliminacion` en la misma tabla.

---

## 2.6 Máquina de estados

Los estados deben manejarse mediante tablas configurables:

* estados_sistema
* transiciones_estado
* transiciones_roles_autorizados

No se debe permitir transición libre sin validación.

---

# 3. Bloque 1 — Base, seguridad y auditoría

## Tablas aprobadas

* sedes
* roles
* usuarios
* permisos
* roles_permisos
* auditoria_general
* estados_sistema
* transiciones_estado
* transiciones_roles_autorizados

## Decisiones finales

### usuarios

V1.0 manejará un solo rol directo por usuario mediante `rolId`.

Limitación documentada:

* en el futuro puede requerirse tabla `usuarios_roles` si un usuario necesita múltiples roles.

### transiciones_estado

No debe tener un único `rolAutorizaId`.

Se usará tabla separada:

## transiciones_roles_autorizados

Campos:

* id
* transicionEstadoId
* rolId

Esto permite que una transición pueda ser autorizada por varios roles.

### auditoria_general

Debe incluir:

* ipOrigen
* userAgent

### notificaciones_config

Se elimina del bloque 1.

La configuración de notificaciones se manejará en el bloque 8 mediante `configuracion_notificacion`.

---

# 4. Bloque 2 — Catálogo operativo

## Tablas aprobadas

* tipos_item
* items
* clientes
* contactos_cliente
* proveedores
* maquinas
* ubicaciones
* tipos_novedad
* tipos_documento

## Decisiones finales

### tipos_item

Tabla separada para permitir crecimiento futuro.

Ejemplos:

* madera
* herraje
* servicio

### items

Campos críticos:

* id
* codigo
* nombre
* descripcion nullable
* tipoItemId
* unidadMedida
* precioVentaReferencia nullable
* costoReferencia nullable
* requiereCorte
* controlaInventario
* permiteFraccion
* metadata JSONB
* activo

No se usará campo `esServicio` separado.

La lógica de servicio se deduce desde `tipoItemId`.

Esa lógica debe quedar centralizada en backend, no dispersa en múltiples módulos.

### clientes

Debe tener `sedePrincipalId nullable`.

Un cliente puede comprar en múltiples sedes; eso se resuelve a nivel de pedido, no como restricción del cliente.

### contactos_cliente

Se agrega para evitar texto libre en entregas.

Campos mínimos:

* id
* clienteId
* nombre
* telefono nullable
* correo nullable
* cargo nullable
* esPrincipal
* activo
* metadata JSONB

### proveedores

Debe incluir `tipoProveedor`:

* material
* servicio
* transporte
* mixto

### maquinas

Debe tener `sedeId` obligatorio.

### ubicaciones

Representa ubicaciones físicas internas.

Debe tener `sedeId` obligatorio.

### tipos_novedad

Campo `aplicaA` no debe ser texto libre.

Debe controlarse mediante enum o validación estricta:

* pedido
* orden
* suborden
* despacho
* compra
* material
* general

---

# 5. Bloque 3 — Documentos, facturas y versionamiento

## Tablas aprobadas

* documentos
* documentos_versiones
* facturas
* factura_items
* factura_pedido
* documentos_relacionados
* lectura_documentos

## Decisiones finales

### documentos

Representa el documento lógico.

Ejemplos:

* factura
* plano CutList
* nota crédito
* factura adicional

### documentos_versiones

Cada archivo subido debe ser una versión inmutable.

Nunca se reemplaza un archivo anterior.

### facturas

Representa la factura comercial leída desde PDF/ContaPyme.

Debe guardar:

* documentoId
* sedeId
* clienteId
* vendedorId
* numeroFactura
* fechaFactura
* tipoPago
* estadoPago
* estadoFactura
* subtotal
* impuestos
* total
* saldoPendiente
* metadata JSONB

### factura_items

Debe permitir ítems no mapeados inicialmente.

Campos adicionales aprobados:

* estadoMapeo
* mapeadoPorUsuarioId nullable
* fechaMapeo nullable

Estados sugeridos para mapeo:

* pendiente
* mapeado_automatico
* mapeado_manual
* requiere_revision
* ignorado

### factura_pedido

Relación explícita entre facturas y pedidos.

Campos mínimos:

* id
* facturaId
* pedidoId
* tipoRelacion
* esPrincipal
* fechaRelacion
* relacionadoPorUsuarioId
* observaciones nullable

Tipos sugeridos:

* principal
* adicional
* reemplazo
* devolucion
* complemento

### lectura_documentos

Separar procesador humano de procesador automático.

Campos:

* procesadoPorUsuarioId nullable
* procesadoPorServicio nullable

Ejemplos de servicio:

* OCR_CONTPYME
* PARSER_CUTLIST
* IMPORTADOR_MANUAL

---

# 6. Bloque 4 — Pedidos y estructura operativa

## Tablas aprobadas

* pedidos
* pedido_items
* pedido_item_documentos
* material_cliente
* validaciones_pedido
* validacion_pedido_detalles
* entregas
* entrega_items
* historial_estados_pedido
* asignaciones_pedido
* bloqueos_pedido
* pedido_sedes

## Decisiones finales

### pedidos

Debe incluir:

* sedeVentaId
* sedeResponsableId
* sedeDespachoId nullable
* fechaListoDespacho nullable
* fechaDespachoCompleto nullable

`fechaListoDespacho` y `fechaDespachoCompleto` quedan desnormalizados en pedidos para consultas rápidas y métricas de tiempo terminado vs recogido.

### pedido_items

Debe incluir:

* cantidadTotal
* cantidadParaProduccion
* cantidadParaDespachoEntero
* cantidadPendiente
* destinoOperativo
* esMaterialCliente

`cantidadPendiente` debe documentarse como campo calculado e inmutable al momento del evento que lo genera.

### material_cliente

Material cliente significa material físico que el cliente trae a Lamicenter para procesar.

Puede ser:

* tablero
* tapa
* retal
* herraje
* insumo

No afecta inventario Lamicenter.

Debe quedar asociado a pedido y, si aplica, a orden/suborden.

### entregas

Debe incluir:

* contactoClienteId nullable

### entrega_items

`cantidadPendientePosterior` debe ser campo calculado e inmutable.

Fórmula:

cantidad pendiente antes de la entrega - cantidad entregada en ese evento.

### pedido_sedes

Tabla para historial de traslados o cambios de sede del pedido.

Debe registrar:

* pedidoId
* sedeOrigenId
* sedeDestinoId
* tipoMovimientoSede
* solicitadoPorUsuarioId
* autorizadoPorUsuarioId nullable
* fechaMovimiento
* observaciones
* metadata JSONB

### historial_estados_pedido

Debe escribirse junto con `auditoria_general` dentro de la misma transacción.

---

# 7. Bloque 5 — Producción y subórdenes

## Tablas aprobadas

* etapas_produccion
* ordenes_produccion
* subordenes
* orden_etapas
* orden_asignaciones
* eventos_operativos
* novedades_operativas
* reprocesos
* historial_estados_orden
* historial_estados_suborden
* calculo_perdidas

## Decisiones finales

### ordenes_produccion

Campos que no pueden faltar:

* sedeProduccionId
* sedeDespachoId
* sedeActualId
* maquinaPrincipalId nullable
* fechaInicioPlaneada nullable
* fechaFinPlaneada nullable
* fechaInicioReal nullable
* fechaFinReal nullable
* ordenPrioridad
* generadaAutomaticamente

`generadaAutomaticamente` es importante para medir en el futuro la confiabilidad del parser automático frente a intervención manual.

### subordenes

Debe incluir:

* sedeProduccionId
* sedeDespachoId nullable
* generadaAutomaticamente

### orden_etapas

Debe permitir etapas de orden principal o suborden usando la misma tabla.

Campos:

* ordenProduccionId nullable
* subordenId nullable

Debe implementarse check constraint en PostgreSQL:

* debe tener ordenProduccionId o subordenId
* no puede tener ambos

### orden_asignaciones

La asignación debe apuntar a `ordenEtapaId`.

Al reasignar no se sobrescribe.

Se cierra la asignación anterior con `fechaFinAsignacion` y se crea una nueva asignación.

### eventos_operativos

`tipoEvento` debe ser enum en Prisma, no texto libre.

Valores sugeridos:

* inicio_etapa
* fin_etapa
* novedad
* reproceso
* cambio_prioridad
* asignacion_maquina
* autorizacion
* pausa

### novedades_operativas

Debe incluir:

* generaReproceso boolean
* reprocesoId nullable

Una novedad puede existir sin reproceso.

Un reproceso siempre nace de una novedad.

### reprocesos

Debe incluir:

* novedadOperativaId
* pedidoOrigenMaterialId nullable
* itemOrigenId nullable
* cantidadTomada nullable
* itemId nullable
* cantidadUtilizada nullable
* costoEstimado nullable
* autorizadoPorUsuarioId nullable

Si el jefe usa material de otro pedido pero el pedido origen sigue quedando completo, no se crea deuda material en V1.0.

Solo se registra la novedad/reproceso y la trazabilidad del origen.

### historial_estados_orden e historial_estados_suborden

Ambos deben escribirse junto con `auditoria_general` en la misma transacción.

### calculo_perdidas

Una orden solo puede cancelarse si aún no ha iniciado producción.

Si ya inició, no se cancela como evento simple.

Debe pasar a cálculo de pérdidas y registrar:

* materialConsumido JSONB
* piezasProducidas
* piezasDaniadas
* tiempoInvertidoMinutos nullable
* costoEstimado nullable
* autorizadoPorUsuarioId
* motivoCancelacion

---

# 8. Bloque 6 — Abastecimiento, compras e inventario operativo

## Tablas aprobadas

* requerimientos_material
* solicitudes_compra
* solicitud_compra_items
* compras_material
* compra_material_items
* recepciones_material
* recepcion_material_items
* traslados_material
* traslado_material_items
* movimientos_material
* material_reservado
* abastecimiento_alertas
* inventario_operativo

## Decisiones finales

### movimientos_material

Debe incluir referencias opcionales:

* trasladoMaterialId nullable
* compraMaterialId nullable
* recepcionMaterialId nullable

### abastecimiento_alertas

Debe incluir:

* motivoCierre nullable

### traslado_material_items

Reglas:

* cantidadEnviada solo se registra cuando el traslado pasa a estado en_transito
* cantidadRecibida solo se registra cuando existe recepción asociada

### inventario_operativo

Tabla de saldo operativo running.

No reemplaza ContaPyme.

Campos mínimos:

* id
* itemId
* sedeId
* ubicacionId nullable
* cantidadDisponible
* cantidadReservada
* cantidadEnProduccion
* cantidadEnTransito
* ultimaActualizacion
* metadata JSONB

Regla:

* se actualiza por transacción desde movimientos_material
* no debe actualizarse manualmente salvo ajuste autorizado

### deuda_material

No se incluye en V1.0.

Motivo:

* operativamente, si se usa material de otro pedido para recuperar una pieza, el pedido origen normalmente queda completo.
* no existe deuda real que reponer.

Si en el futuro se detecta que sí quedan pendientes de reposición, se evaluará para V1.1.

---

# 9. Bloque 7 — Despacho y entregas

## Tablas aprobadas

* despachos
* despacho_items
* despacho_autorizaciones
* checklist_despacho
* checklist_despacho_items
* tipos_validacion_despacho
* ubicacion_pedido
* historial_ubicacion_pedido
* evidencias_despacho

## Decisiones finales

### despachos

Debe incluir:

* autorizadoPorUsuarioId nullable

### tipos_validacion_despacho

Tabla configurable para validaciones de checklist.

Campos mínimos:

* id
* codigo
* nombre
* descripcion
* activo
* ordenVisual
* metadata JSONB

### checklist_despacho_items

Debe usar:

* tipoValidacionDespachoId

No debe usar texto libre para tipo de validación.

### despacho_items

`cantidadPendientePosterior` debe documentarse como campo calculado e inmutable.

Fórmula:

cantidad pendiente antes del despacho - cantidad despachada en este evento.

### ubicacion_pedido e historial_ubicacion_pedido

Deben escribirse de forma atómica dentro de la misma transacción.

### fechaListoDespacho y fechaDespachoCompleto

Van desnormalizados en pedidos.

---

# 10. Bloque 8 — Notificaciones, alertas y dashboards

## Tablas aprobadas

* notificaciones_usuario
* alertas_sistema
* alerta_roles_destino
* eventos_notificacion
* configuracion_notificacion
* configuracion_dashboard
* configuracion_metricas
* historial_notificaciones

## Bloque 9 — PQRS

* pqrs
* pqrs_seguimientos
* pqrs_evidencias
* pqrs_responsables
* historial_estados_pqrs

## Decisiones finales

### notificaciones_config

Se elimina definitivamente.

La reemplaza:

* configuracion_notificacion

### notificaciones_usuario

Mensajes internos dirigidos a usuarios específicos.

### alertas_sistema

Alertas operativas genéricas fuera de abastecimiento.

No debe limitarse a un único rol.

La visibilidad multirol se manejará mediante tabla intermedia.

### alerta_roles_destino

Tabla intermedia para permitir que una alerta sea visible para múltiples roles simultáneamente.

Campos mínimos:

* id
* alertaSistemaId
* rolId
* fechaCreacion

### eventos_notificacion

Tabla de cola desacoplada para canales futuros.

Debe incluir:

* tipoEvento
* entidadTipo
* entidadId
* destinatarioUsuarioId nullable
* rolDestinoId nullable
* canal
* estadoEnvio
* intentos
* payload JSONB
* fechaProgramada nullable
* fechaEnvio nullable
* errorDetalle nullable
* metadata JSONB
* fechaCreacion
* fechaActualizacion

### entidadTipo + entidadId

Debe existir un resolvedor centralizado en backend que permita navegar desde `entidadTipo + entidadId` hacia la entidad real.

No se debe implementar esta lógica dispersa en cada módulo.

### configuracion_notificacion

Debe ser superconjunto de la antigua `notificaciones_config`.

Campos mínimos:

* id
* tipoEvento
* rolDestinoId nullable
* usuarioDestinoId nullable
* canal
* activo
* requiereConfirmacion
* plantillaMensaje nullable
* prioridadDefecto
* metadata JSONB
* fechaCreacion
* fechaActualizacion

### configuracion_dashboard

Define widgets visibles por rol.

No representa datos operativos.

### configuracion_metricas

Define métricas activas por rol.

El campo `configuracion JSONB` debe documentarse.

Estructura sugerida:

{
"filtros": ["sedeId", "fechaDesde"],
"agrupacion": "dia",
"umbralAlerta": 5
}

Las métricas V1.0 se calculan en tiempo real desde datos existentes.

No se crearán tablas de caché de reportes en V1.0.

---

# 11. Bloque 9 — PQRS

## Tablas aprobadas

* pqrs
* pqrs_seguimientos
* pqrs_evidencias
* pqrs_responsables
* historial_estados_pqrs

## Decisiones finales

### pqrs

Campos críticos:

* consecutivo
* clienteId obligatorio
* pedidoId nullable
* facturaId nullable
* ordenProduccionId nullable
* subordenId nullable
* pedidoItemId nullable
* tipoNovedadId
* estadoPqrsId
* creadoPorUsuarioId
* responsableSolucionId nullable
* cerradoPorUsuarioId nullable
* fechaCierre nullable
* generaReproceso
* novedadOperativaId nullable
* reprocesoId nullable
* costoEstimado nullable
* descripcion
* solucionAplicada nullable
* metadata JSONB

Estados sugeridos:

* abierta
* en_revision
* en_solucion
* solucion_aplicada
* cerrada
* anulada

### pqrs_seguimientos

Historial funcional del ciclo de vida del PQRS.

Tipos sugeridos:

* creacion
* asignacion
* actualizacion
* solucion
* cierre
* reapertura
* anulacion

### pqrs_evidencias

Preparada para V2 y V3 con fotos y documentos.

Tipos sugeridos:

* foto
* documento
* observacion

### pqrs_responsables

Permite múltiples responsables y reasignaciones.

Roles sugeridos:

* creador
* ejecutor
* autorizador
* supervisor

### historial_estados_pqrs

Debe escribirse junto con `auditoria_general` en la misma transacción.

### Reglas funcionales

* clienteId es obligatorio.
* múltiples PQRS sobre el mismo ítem son válidos.
* el sistema debe alertar si ya existe PQRS abierto sobre el mismo pedido o ítem.
* si `generaReproceso = true`, debe existir `novedadOperativaId` o `reprocesoId`.
* costo detallado no se maneja en V1.0.
* solo se registra `costoEstimado` como referencia operativa.

---

# 12. Tabla resumen por bloque

## Bloque 1 — Base y seguridad

* sedes
* roles
* usuarios
* permisos
* roles_permisos
* auditoria_general
* estados_sistema
* transiciones_estado
* transiciones_roles_autorizados

## Bloque 2 — Catálogo

* tipos_item
* items
* clientes
* contactos_cliente
* proveedores
* maquinas
* ubicaciones
* tipos_novedad
* tipos_documento

## Bloque 3 — Documentos

* documentos
* documentos_versiones
* facturas
* factura_items
* factura_pedido
* documentos_relacionados
* lectura_documentos

## Bloque 4 — Pedidos

* pedidos
* pedido_items
* pedido_item_documentos
* material_cliente
* validaciones_pedido
* validacion_pedido_detalles
* entregas
* entrega_items
* historial_estados_pedido
* asignaciones_pedido
* bloqueos_pedido
* pedido_sedes

## Bloque 5 — Producción

* etapas_produccion
* ordenes_produccion
* subordenes
* orden_etapas
* orden_asignaciones
* eventos_operativos
* novedades_operativas
* reprocesos
* historial_estados_orden
* historial_estados_suborden
* calculo_perdidas

## Bloque 6 — Abastecimiento

* requerimientos_material
* solicitudes_compra
* solicitud_compra_items
* compras_material
* compra_material_items
* recepciones_material
* recepcion_material_items
* traslados_material
* traslado_material_items
* movimientos_material
* material_reservado
* abastecimiento_alertas
* inventario_operativo

## Bloque 7 — Despacho

* despachos
* despacho_items
* despacho_autorizaciones
* checklist_despacho
* checklist_despacho_items
* tipos_validacion_despacho
* ubicacion_pedido
* historial_ubicacion_pedido
* evidencias_despacho

## Bloque 8 — Notificaciones

* notificaciones_usuario
* alertas_sistema
* alerta_roles_destino
* eventos_notificacion
* configuracion_notificacion
* configuracion_dashboard
* configuracion_metricas
* historial_notificaciones

---

# 13. Orden oficial de migraciones

Las migraciones deben ejecutarse en este orden:

1. Base y seguridad
2. Catálogo operativo
3. Documentos y facturas
4. Pedidos
5. Producción
6. Abastecimiento
7. Despacho
8. Notificaciones
9. PQRS

---

# 14. Próximo paso

Antes de implementar migraciones, Claude Code debe:

1. Leer este documento completo.
2. Confirmar entidades y relaciones.
3. Diseñar `schema.prisma` con nombres en español.
4. Crear enums controlados donde aplique.
5. Crear migraciones por bloques.
6. Crear seeds iniciales para roles, sedes, estados, tipos y catálogos mínimos.

Este documento reemplaza las versiones parciales o iniciales discutidas durante el diseño.