---
name: sileo-notifications
description: Reglas obligatorias para el uso de notificaciones visuales usando la librería Sileo en el frontend.
---

# 🔔 Sileo Notifications

Esta skill define el estándar obligatorio para mostrar notificaciones al usuario en el frontend de MarketFlex. El uso de `alert()`, `console.log()` para errores de usuario, o librerías alternativas de toast está **PROHIBIDO**.

## 🏗️ Implementación Centralizada

Todas las notificaciones deben pasar por el sistema unificado definido en:
`c:\Users\Agus\Documents\MarketFlex\MarketFlex-FrontEnd\src\components\common\Notifications.tsx`

### 1. Uso en Componentes Astro (Declarativo)

Para mostrar una notificación basada en un parámetro de URL (patrón común en redirecciones):

```astro
---
import Notifications from "../components/common/Notifications";
---

<Notifications 
    client:only="react"
    message="¡Operación exitosa!"
    type="success"
    requiredQueryParam="success"
/>
```

### 2. Uso en Scripts Vanilla JS / TypeScript (Imperativo)

Para disparar notificaciones desde lógica de negocio o eventos de DOM, utiliza la función global `window.triggerSileo`:

```typescript
try {
    const result = await someAction();
    window.triggerSileo('success', '¡Guardado correctamente!');
} catch (error) {
    window.triggerSileo('error', 'Error al guardar los cambios');
}
```

## 🛠️ Reglas OBLIGATORIAS

1. **Prioridad Visual**: Las notificaciones deben ser claras y no obstructivas.
2. **Contexto**: Usa siempre el `type` adecuado:
   - `success`: Operaciones terminadas con éxito.
   - `error`: Fallos críticos o validaciones denegadas.
   - `warning`: Advertencias que no detienen el flujo.
   - `info`: Información general relevante.
3. **Persistencia**: No abuses de las notificaciones para eventos triviales.
4. **Z-Index**: Asegúrate de que el contenedor Sileo esté por encima de modales o headers (manejado automáticamente en `Notifications.tsx`).

## 🚫 Prácticas Prohibidas

- Usar `alert()` nativo del navegador.
- Implementar sistemas de toast personalizados ad-hoc.
- Mezclar múltiples librerías de notificaciones (ej: react-toastify).
- Mostrar mensajes de error técnicos (stack traces) al usuario final; usa mensajes amigables y deja el detalle técnico solo en el `console.error` para desarrolladores.
