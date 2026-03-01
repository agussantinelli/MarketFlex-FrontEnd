# API Communication Skill

This skill enforces the use of the centralized API client for all HTTP communications in the MarketFlex Frontend.

## Core Rule
**TERMINANTEMENTE PROHIBIDO** el uso de `fetch` nativo o cualquier otro cliente HTTP que no sea el definido en `src/lib/api.ts`.

## Rationale
El cliente centralizado en `src/lib/api.ts` (basado en `Ky`) maneja automáticamente:
1.  **Inyección de JWT**: Agrega el token de acceso a los headers.
2.  **Auto-Refresh**: Gestiona la renovación de tokens cuando expiran (401).
3.  **Manejo de Errores Global**: Vinculado con Sileo para notificaciones automáticas.
4.  **Configuración de Base URL**: Centraliza la URL de la API.

## Implementation Guidelines
Al crear o modificar un servicio en `src/services/`:

1.  **Importar el cliente**:
    ```typescript
    import api from '../lib/api';
    ```

2.  **Usar los métodos de Ky**:
    ```typescript
    // GET
    const data = await api.get('endpoint').json<Type>();
    
    // POST
    const newRecord = await api.post('endpoint', { json: body }).json<Type>();
    
    // PATCH / PUT
    const updated = await api.patch(`endpoint/${id}`, { json: body }).json<Type>();
    
    // DELETE
    await api.delete(`endpoint/${id}`);
    ```

3.  **Formatos de Respuesta**:
    Extraer siempre los datos del envoltorio estándar si es necesario, o tipar la respuesta completa.

## Verification
Cualquier PR que incluya llamadas `fetch` directas será rechazado automáticamente.
