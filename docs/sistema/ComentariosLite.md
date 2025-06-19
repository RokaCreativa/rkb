# 🧭 COMENTARIOS LITE - GUÍA PRÁCTICA PARA MIGAS DE PAN

> **Versión simplificada y práctica de la guía de comentarios contextuales para uso diario.**

---

## 🎯 **OBJETIVO**

Crear **migas de pan contextuales** que permitan a cualquier desarrollador (o IA) entender **QUÉ**, **POR QUÉ** y **CÓMO** funciona el código en menos de 2 minutos.

---

## 📋 **PLANTILLA BÁSICA (COPY-PASTE)**

### **Para Archivos Críticos (Stores, Hooks Principales, APIs):**

```typescript
/**
 * 🎯 MANDAMIENTO #7 - SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 *
 * 🧭 PREGUNTA TRAMPA: ¿Qué problema específico estoy resolviendo aquí?
 * RESPUESTA: [Si no sé → LEER BITÁCORA INMEDIATAMENTE]
 *
 * 📍 PROPÓSITO: [Una línea clara de qué hace este archivo]
 *
 * ⚠️ NO DEBE HACER: [Responsabilidades prohibidas]
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - [Hook/Store/API que usa] - [Para qué lo usa]
 * - [Componente que lo consume] - [Cómo lo consume]
 *
 * 🚨 ANTES DE CREAR ALGO NUEVO → REVISAR ESTA LISTA
 */
```

### **Para Componentes UI:**

```typescript
/**
 * 🎯 COMPONENTE TONTO - SOLO RENDERIZA Y EMITE EVENTOS
 *
 * 📍 PROPÓSITO: [Qué renderiza]
 * ⚠️ NO DEBE: Contener lógica de negocio, llamadas API, estado complejo
 * 🔗 CONSUME: [Props que recibe y de dónde vienen]
 * 🔗 EMITE: [Eventos que dispara y quién los escucha]
 */
```

### **Para Hooks Personalizados:**

```typescript
/**
 * 🎯 HOOK DE LÓGICA - SEPARA RESPONSABILIDADES
 *
 * 📍 PROPÓSITO: [Qué lógica maneja]
 * 🔄 FLUJO: [Entrada → Procesamiento → Salida]
 * 🔗 USADO POR: [Componentes que lo consumen]
 * ⚠️ CUIDADO: [Efectos secundarios o limitaciones]
 */
```

---

## 🚀 **REGLAS DE APLICACIÓN RÁPIDA**

### **1. PREGUNTA TRAMPA OBLIGATORIA**

- Cada archivo crítico DEBE tener una pregunta trampa
- Si no sabes la respuesta → LEER BITÁCORA
- Solo proceder si tienes contexto completo

### **2. INVENTARIO DE DEPENDENCIAS**

- Listar TODOS los hooks, stores, componentes relacionados
- Especificar la ruta exacta: `hooks/domain/reordering/`
- Explicar PARA QUÉ se usa cada dependencia

### **3. RESPONSABILIDADES PROHIBIDAS**

- Ser explícito sobre lo que NO debe hacer el archivo
- Evita mezclar responsabilidades accidentalmente
- Guía para futuras modificaciones

### **4. FLUJO DE DATOS SIMPLE**

- Entrada → Procesamiento → Salida
- ¿De dónde vienen los datos?
- ¿Cómo se transforman?
- ¿A dónde van?

---

## 🎯 **EJEMPLOS REALES**

### **Ejemplo 1: Store Principal**

```typescript
/**
 * 🎯 MANDAMIENTO #7 - SEPARACIÓN ABSOLUTA DE LÓGICA Y PRESENTACIÓN
 *
 * 🧭 PREGUNTA TRAMPA: ¿Cuál es el estado actual del reordenamiento y qué problema resolvemos?
 * RESPUESTA: Bucle infinito entre productos 2106-2107 por falta de sincronización BD-Frontend
 *
 * 📍 PROPÓSITO: Estado global único para dashboard (categorías, secciones, productos)
 *
 * ⚠️ NO DEBE HACER: Lógica de UI, validaciones de formulario, transformaciones visuales
 *
 * 🔗 DEPENDENCIAS CRÍTICAS:
 * - apiClient (services/) - Para todas las peticiones HTTP
 * - DashboardView (components/core/) - Consume todo el estado
 * - MobileView (views/) - Consume subconjuntos del estado
 *
 * 🚨 PROBLEMA RESUELTO: Recarga de datos post-reordenamiento para evitar bucles
 */
```

### **Ejemplo 2: Componente UI**

```typescript
/**
 * 🎯 COMPONENTE TONTO - SOLO RENDERIZA Y EMITE EVENTOS
 *
 * 📍 PROPÓSITO: Renderiza lista de categorías con acciones de reordenamiento
 * ⚠️ NO DEBE: Manejar estado, llamar APIs, contener lógica de negocio
 * 🔗 CONSUME: items[], onMoveItem(), onCategorySelect() desde DashboardView
 * 🔗 EMITE: Eventos de reordenamiento y selección hacia DashboardView
 */
```

---

## ⚡ **CUÁNDO USAR CADA TIPO**

| Tipo de Archivo            | Comentario Necesario         |
| -------------------------- | ---------------------------- |
| **Stores (Zustand)**       | Completo con pregunta trampa |
| **Hooks principales**      | Completo con flujo de datos  |
| **APIs críticas**          | Completo con dependencias    |
| **Componentes maestros**   | Completo con inventario      |
| **Componentes UI simples** | Lite con propósito           |
| **Utilidades**             | Mínimo con propósito         |

---

## 🔥 **ANTI-PATRONES A EVITAR**

❌ **NO HAGAS:**

- Comentarios que explican el "qué" (eso lo hace el código)
- Comentarios obsoletos que no se actualizan
- Comentarios genéricos sin contexto específico

✅ **SÍ HAZ:**

- Comentarios que explican el "porqué"
- Referencias específicas a otros archivos
- Contexto histórico de problemas resueltos

---

## 🎯 **CHECKLIST RÁPIDO**

Antes de hacer commit, verifica:

- [ ] ¿Tiene pregunta trampa si es archivo crítico?
- [ ] ¿Lista las dependencias específicas?
- [ ] ¿Explica qué NO debe hacer?
- [ ] ¿Incluye contexto de problemas resueltos?
- [ ] ¿Ayudaría a alguien que ve el código por primera vez?

---

**Esta guía es para uso diario. Para casos complejos, consultar `GuiaComentariosContextuales.md`**
