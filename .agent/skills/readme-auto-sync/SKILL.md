---
name: readme-auto-sync
description: Reglas obligatorias para actualizar el README.md automáticamente al crear archivos o tests.
---

# README Auto-Sync

Esta skill define el comportamiento obligatorio del agente AI respecto al mantenimiento del archivo `README.md` del proyecto Frontend.

## Contexto
Para asegurar que la documentación del proyecto nunca quede obsoleta, es mandatorio que el agente actualice el `README.md` de manera proactiva y automática cada vez que realice cambios estructurales o agregue cobertura de pruebas.

## Reglas Obligatorias (Guidelines)

1. **Estructura del Proyecto (Árbol de Directorios)**:
   - **CUÁNDO**: Cada vez que crees, muevas o elimines un archivo (`.ts`, `.tsx`, `.astro`, `.css`, etc.) o un directorio.
   - **QUÉ HACER**: Debes ejecutar un comando para listar los archivos relevantes (`find` o tu herramienta interna) y sobrescribir la sección "Project Structure" o "Estructura del Proyecto" en el `README.md` para que refleje el estado exacto actual. Omite carpetas irrelevantes como `node_modules` o `.agent`.

2. **Contador de Tests**:
   - **CUÁNDO**: Cada vez que crees un nuevo archivo de test (`.test.tsx`, `.spec.ts`) o agregues/elimines tests (Vitest) dentro de un archivo existente.
   - **QUÉ HACER**: Debes ejecutar la suite de testing (`npx vitest run`), leer la salida de la consola para obtener el número exacto de tests que han pasado, y actualizar el badge o la sección de "Tests Pasando" en el encabezado del `README.md`.

## Proactividad
**NO ESPERES** a que el usuario te pida que actualices el README. Si tus acciones en una tarea implican crear o modificar la estructura o los tests, tu último paso de esa tarea debe ser obligatoriamente actualizar el README.md para reflejar los cambios antes de devolverle el control al usuario.
