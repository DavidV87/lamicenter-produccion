# DECISIONES DE ARQUITECTURA, REGLAS DE NEGOCIO Y ESTÁNDARES DE DESARROLLO

## Sistema de Información para Control de Producción — Lamicenter S.A.S.

---

# 1. Propósito del documento

Este documento consolida decisiones finales de arquitectura funcional, reglas de negocio críticas y estándares de desarrollo para el sistema de información de control de producción de Lamicenter S.A.S.

Su objetivo es servir como base para que el equipo de desarrollo analice posibles riesgos, confirme la lógica operativa y diseñe la base de datos y el código bajo criterios de flexibilidad, trazabilidad, robustez y confiabilidad.

---

# 2. Decisiones funcionales principales

## 2.1 Creación de órdenes de producción

Las órdenes de producción serán creadas inicialmente por el sistema como una propuesta automática, a partir de la información cargada por el vendedor:

* factura PDF
* planos CutList
* materiales
* servicios
* cantidades
* relación entre ítems facturados y procesos requeridos

El vendedor podrá revisar esta propuesta y el coordinador de producción deberá validarla antes de que quede activa para producción.

La creación no debe ser completamente manual, porque esto aumentaría el riesgo de errores operativos.

---

## 2.2 Creación de subórdenes

Las subórdenes también serán sugeridas por el sistema con base en:

* ítems tipo servicio
* instrucciones del vendedor
* observaciones del pedido
* procesos adicionales requeridos

Ejemplos de subórdenes:

* perforaciones
* reengrueses
* entamborados
* instalación de perfilería
* armado de puertas de aluminio
* servicios especiales de taller

El vendedor o el coordinador podrán ajustar, agregar o eliminar subórdenes antes de la validación final.

---

## 2.3 Material cliente

Se define como material cliente todo tablero, retal, tapa, herraje o insumo físico que el cliente trae directamente a Lamicenter para que sea procesado.

Este material:

* no pertenece al inventario de Lamicenter
* no debe afectar inventario contable ni inventario operativo de Lamicenter
* sí debe quedar asociado al pedido
* sí debe quedar asociado a la orden o suborden correspondiente
* sí puede generar reprocesos, daños o PQRS
* debe ser recibido y validado físicamente antes de procesarse

El sistema debe permitir registrar:

* tipo de material cliente
* descripción
* cantidad
* medidas aproximadas si aplica
* estado físico recibido
* observaciones
* persona que registra
* persona que recibe
* pedido asociado

Los sobrantes de material cliente pertenecen al cliente.

No se controlarán operativamente sobrantes desde el sistema en V1.0, salvo cuando exista un PQRS por faltante o no entrega de sobrante.

---

# 3. Estados y transición de información

## 3.1 Estados de pedido

El estado del pedido debe ser principalmente calculado a partir del estado de sus órdenes, subórdenes, entregas, PQRS y documentos asociados.

Ejemplo:

* si alguna orden está en corte, el pedido debe reflejar estado general en producción
* si todas las órdenes y subórdenes están terminadas, el pedido puede pasar a listo para despacho
* si existe PQRS abierto, el pedido debe reflejar novedad o reclamo asociado

Se permitirá intervención manual únicamente con autorización y trazabilidad.

---

## 3.2 Estados de órdenes y subórdenes

Los estados de órdenes y subórdenes sí serán registrados como eventos operativos.

Ejemplos:

* creada
* validada
* en cola
* en corte
* corte terminado
* en enchape
* terminada
* en reproceso
* cancelada

Cada cambio de estado debe generar historial y auditoría.

---

## 3.3 Máquina de estados

Los estados no deben manejarse únicamente como texto libre o campos simples.

La base de datos debe contemplar:

* tabla de estados
* tabla de tipos de entidad
* tabla de transiciones permitidas
* reglas de validación

Esto evita transiciones inválidas, por ejemplo:

* pasar de cancelado a en producción
* despachar una orden con subórdenes pendientes
* cerrar un pedido con PQRS abierto sin autorización

---

# 4. Entregas, despachos y conceptos separados

## 4.1 Entrega parcial planeada

La entrega parcial planeada ocurre cuando desde la carga del pedido el vendedor indica que el cliente retirará parte de lo comprado antes de completar todo el proceso.

Ejemplos:

* herrajes entregados antes de producción
* láminas enteras retiradas por el cliente
* parte del material comprado no entra a producción

Debe registrarse:

* ítem entregado
* cantidad entregada
* cantidad pendiente
* fecha y hora
* responsable que entrega
* persona que recibe
* observaciones

---

## 4.2 Despacho incompleto

El despacho incompleto es diferente a una entrega parcial planeada.

Ocurre cuando el pedido debía entregarse completo, pero sale con pendientes por una novedad operativa.

Ejemplos:

* falta una pieza
* falta una perforación
* taller no terminó
* se dañó una pieza
* el cliente decide llevar una parte por urgencia

Debe generar trazabilidad y, si corresponde, PQRS.

---

# 5. PQRS

## 5.1 Asociación de PQRS

En V1.0, todo PQRS debe estar asociado como mínimo a un cliente.

Cuando exista información disponible, debe asociarse también a:

* pedido
* factura
* orden
* suborden
* ítem

Un PQRS puede existir sin pedido asociado únicamente si se trata de un caso general, pero debe tener cliente obligatorio.

---

## 5.2 Múltiples PQRS sobre el mismo ítem

Se permite tener más de un PQRS asociado al mismo ítem, pedido u orden.

No se reemplazan entre sí.

Cada PQRS debe conservar su propio historial, causa, solución, responsable y cierre.

El sistema debe mostrar alerta si ya existe un PQRS abierto para el mismo ítem o proceso.

---

# 6. Sedes y producción multi-sede

## 6.1 Sede en pedido

El pedido debe guardar:

* sede de venta
* sede responsable comercial

---

## 6.2 Sede en orden

Cada orden debe guardar:

* sede de producción
* sede de despacho
* sede actual

Esto permite que un mismo pedido tenga órdenes procesadas en diferentes sedes.

---

## 6.3 Cambio de sede

El vendedor solicita el cambio de sede.

El administrador de punto autoriza.

El sistema debe registrar:

* sede origen
* sede destino
* motivo
* si el despacho será en la nueva sede
* si el pedido retorna a la sede original
* si la producción se divide entre sedes

Compras debe ser notificado para validar disponibilidad, traslado o compra de materiales.

---

# 7. Facturas anuladas y documentos adicionales

## 7.1 Factura anulada en ContaPyme

Si una factura asociada al pedido es anulada en ContaPyme, el pedido debe quedar bloqueado por anulación hasta revisión.

El administrador de punto debe definir si:

* se cancela el pedido
* se asocia una nueva factura
* se mantiene con autorización especial

El sistema no debe permitir que el pedido continúe normalmente sin revisión.

---

## 7.2 Facturas adicionales

Si el cliente solicita algo adicional después de que el pedido ya fue validado o está en cola de producción, la nueva factura debe poder asociarse al mismo pedido.

El sistema debe:

* asociar factura adicional
* recalcular cantidades
* recalcular órdenes o subórdenes
* recalcular pendientes
* volver a validación si afecta producción

El pedido sigue siendo el mismo porque operativamente pertenece al mismo proyecto del cliente.

---

# 8. Reprocesos, daños y cancelaciones

## 8.1 Reproceso con material de otro pedido

Si se utiliza material reservado o asociado a otro pedido para solucionar un daño, debe registrarse:

* pedido origen
* pedido destino
* material usado
* cantidad
* motivo
* responsable
* autorización jefe producción
* alerta de reposición pendiente

Inicialmente no se automatizará toda la lógica de inventario, pero sí debe quedar trazabilidad y deuda operativa.

---

## 8.2 Daños y pérdidas

Todo daño debe registrarse.

Debe incluir:

* etapa donde ocurrió
* causa
* responsable reportado
* solución aplicada
* material utilizado si aplica
* costo estimado si aplica
* usuario que registra
* persona que autoriza

Si la solución no consume inventario, el costo estimado puede ser cero.

Si consume inventario, debe registrarse costo estimado del material utilizado.

---

## 8.3 Cancelación de órdenes

Una orden solo puede cancelarse si aún no ha iniciado producción.

Si la orden ya inició producción, no debe manejarse como una cancelación simple.

Debe pasar a un proceso de cálculo de pérdidas, donde se registre:

* material ya consumido
* piezas producidas
* piezas dañadas o inutilizables
* tiempo invertido
* costo estimado
* motivo
* responsable
* autorización

Esto permite cuantificar el impacto económico de cancelar o detener una orden ya iniciada.

---

## 8.4 Cancelación de pedido

La cancelación de un pedido la realiza el administrador de punto.

El pedido no se elimina físicamente.

Debe registrarse:

* motivo
* fecha y hora
* usuario que cancela
* estado del pedido al momento
* si existían materiales separados
* si existían compras realizadas
* si existía producción iniciada

---

# 9. Cambio de vendedor

Debe permitirse reasignar un pedido activo a otro vendedor.

Autoriza:

* administrador de punto
* gerencia

Debe registrar:

* vendedor anterior
* vendedor nuevo
* motivo
* fecha y hora
* usuario que autoriza

Esto evita que pedidos queden huérfanos si un vendedor se ausenta, se retira o se reasigna el cliente.

---

# 10. Requerimientos estructurales para base de datos

Antes de diseñar la base de datos se deben considerar obligatoriamente los siguientes elementos:

## 10.1 Auditoría general

Debe existir una tabla genérica de auditoría.

Debe permitir registrar:

* tipo de entidad
* id de entidad
* usuario que registra
* responsable operativo
* autorizador
* estado anterior
* estado nuevo
* fecha y hora
* observaciones
* metadata adicional

---

## 10.2 Versionamiento de documentos

Los documentos y sus versiones deben estar separados.

No debe reemplazarse un archivo anterior.

Cada factura, plano, nota o soporte debe conservar historial.

---

## 10.3 Entregas parciales

Deben existir tablas específicas para entregas y detalle de entregas.

No basta con un estado en el pedido.

Debe saberse:

* qué se entregó
* cuánto se entregó
* cuándo se entregó
* quién entregó
* quién recibió
* qué quedó pendiente

---

## 10.4 Catálogo único de ítems

Debe existir un único catálogo de ítems con tipo:

* madera
* herraje
* servicio

Se recomienda incluir metadata JSONB para permitir atributos específicos por tipo sin crear demasiadas tablas desde el inicio.

---

## 10.5 Máquina de estados

Debe existir una estructura que controle:

* estados disponibles
* transiciones permitidas
* entidad a la que aplica
* permisos requeridos

---

# 11. Estándares de desarrollo obligatorios

## 11.1 Idioma del código

Todas las variables, constantes, funciones, tablas, relaciones, nombres de módulos, servicios, controladores y entidades deberán utilizar nombres en español.

Los nombres deben estar directamente relacionados con la información que representan.

Ejemplos:

* pedido
* ordenProduccion
* suborden
* factura
* facturaItem
* estadoPedido
* usuarioAutoriza
* fechaValidacion
* cantidadPendiente
* materialCliente
* sedeProduccion

---

## 11.2 Claridad semántica

No se deben usar nombres genéricos o ambiguos.

Evitar:

* data
* info
* temp
* obj
* item1
* valor

Preferir:

* datosFactura
* materialPendiente
* cantidadDespachada
* ordenValidada
* usuarioResponsable

---

## 11.3 Documentación del código

El código debe quedar ampliamente documentado.

Idealmente, cada bloque relevante o línea compleja debe explicar:

* qué hace
* por qué existe
* qué regla de negocio representa

Se debe documentar especialmente:

* reglas de negocio
* validaciones
* transiciones de estado
* auditoría
* autorizaciones
* cálculos de pérdidas
* consultas complejas

---

## 11.4 Buenas prácticas

El sistema debe construirse usando buenas prácticas de programación:

* arquitectura modular
* separación de responsabilidades
* validación de datos
* control de errores
* transacciones en operaciones críticas
* manejo seguro de archivos
* migraciones versionadas
* pruebas básicas por módulo
* control de permisos
* auditoría automática
* nombres claros
* código mantenible

---

## 11.5 Flexibilidad y robustez

El sistema debe ser flexible para adaptarse a cambios operativos futuros, pero sin perder control.

Esto implica:

* estados configurables
* permisos configurables
* catálogos editables por gerencia
* metadata flexible cuando sea necesario
* auditoría obligatoria
* historial inmutable
* documentos versionados
* trazabilidad de eventos

---

## 11.6 Confiabilidad

Toda operación crítica debe protegerse mediante:

* validaciones
* permisos
* auditoría
* transacciones de base de datos
* control de errores
* historial de cambios

El sistema debe priorizar confiabilidad sobre rapidez de desarrollo improvisada.

---

# 12. Decisión final

Con estas reglas se considera que el sistema queda preparado para iniciar el diseño de base de datos con una arquitectura flexible, robusta y trazable.

El equipo de desarrollo deberá revisar este documento antes de crear migraciones, modelos o código base.