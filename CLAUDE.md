# Lamicenter — Instrucciones Globales para Claude Code

## Contexto del proyecto

Sistema de información para control de producción de Lamicenter S.A.S.

Empresa dedicada a:

* venta de tableros melamínicos
* corte
* enchape
* perforaciones
* servicios para carpintería

El sistema debe priorizar:

* trazabilidad
* confiabilidad
* flexibilidad
* auditoría
* claridad de código

---

# Stack tecnológico

## Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL

## Frontend

* React
* Vite
* TypeScript

---

# Infraestructura de desarrollo

* Desarrollo local en Windows
* VS Code
* Node.js 24
* PostgreSQL 18 local
* Git + GitHub

## Importante

Docker NO está habilitado actualmente en el entorno local de desarrollo.

No asumir:

* docker-compose
* contenedores locales
* dependencias obligatorias de Docker

El sistema debe poder ejecutarse completamente en desarrollo local sin Docker.

---

# Infraestructura objetivo futura

Actualmente el proyecto se trabajará pensando en despliegue Linux tipo CentOS.

Más adelante podrá evaluarse:

* Rocky Linux
* AlmaLinux

Sin afectar arquitectura ni código.

Infraestructura esperada:

* Linux
* PostgreSQL 18
* Nginx
* PM2

---

# Reglas obligatorias de desarrollo

## Idioma

TODO el código debe escribirse en español:

* variables
* funciones
* clases
* controladores
* servicios
* DTOs
* entidades
* tablas
* enums
* relaciones

Ejemplos correctos:

* pedido
* ordenProduccion
* usuarioAutorizaId
* fechaValidacion

NO usar:

* data
* temp
* obj
* item1
* value

---

# UUID

Todas las entidades principales usan UUID.

Usar:

* gen_random_uuid()

No usar IDs autoincrementales.

---

# Auditoría obligatoria

Toda operación crítica debe registrar auditoría.

Tabla:

* auditoria_general

Incluye:

* cambios de estado
* autorizaciones
* modificaciones críticas
* cancelaciones
* reprocesos
* despachos
* PQRS

---

# No eliminación física

No eliminar entidades críticas físicamente.

Usar:

* estados
* activo boolean

---

# Máquina de estados

No hardcodear estados.

Usar tablas:

* estados_sistema
* transiciones_estado
* transiciones_roles_autorizados

Validar transiciones desde backend.

---

# Arquitectura backend

Separación obligatoria:

* controller
* service
* repository
* dto
* entities

No colocar lógica de negocio en controllers.

---

# Prisma

## Reglas

* Un módulo por bloque de negocio
* Relaciones explícitas
* Nombres en español
* Enums controlados
* Índices donde aplique
* Soft delete NO por defecto

---

# Transacciones

Toda escritura múltiple crítica debe usar transacciones.

Ejemplos:

* historial_estados + auditoria_general
* ubicacion_pedido + historial_ubicacion_pedido
* despacho + despacho_items
* reproceso + novedad_operativa

---

# JSONB

Usar metadata JSONB solo cuando:

* exista flexibilidad futura real
* no tenga sentido crear tabla adicional

No abusar de JSONB.

---

# Parser de documentos

La lectura automática de:

* facturas PDF
* planos CutList

debe tener siempre fallback de carga manual.

La operación NO debe bloquearse si:

* falla el parser
* falla OCR
* el PDF tiene formato inválido
* no se logra mapear automáticamente un ítem

El usuario debe poder:

* corregir manualmente
* mapear manualmente
* continuar operación sin detener producción

---

# Documentación

El código debe quedar ampliamente documentado.

Especialmente:

* reglas de negocio
* validaciones
* transiciones
* autorizaciones
* cálculos complejos

---

# Restricciones importantes

## NO modificar archivos no solicitados

Claude Code debe limitar cambios únicamente al alcance pedido.

---

# Orden de implementación

Implementar bloque por bloque.

NO avanzar al siguiente bloque hasta:

* migraciones correctas
* seeds correctos
* compilación exitosa
* validaciones básicas funcionando

---

# Estrategia de sesiones Claude Code

Cada sesión debe tener:

* un único objetivo
* alcance limitado
* contexto mínimo necesario

Evitar:

* sesiones largas
* múltiples módulos simultáneos
* prompts ambiguos

---

# Documentos obligatorios de referencia

Leer siempre:

* docs/modelo-bd-decisiones-finales.md
* docs/reglas-negocio.md

Antes de implementar cualquier módulo.

---

# Prioridad del proyecto

La prioridad es:

1. confiabilidad
2. trazabilidad
3. claridad
4. mantenibilidad
5. rendimiento

Nunca sacrificar trazabilidad por rapidez de implementación.
