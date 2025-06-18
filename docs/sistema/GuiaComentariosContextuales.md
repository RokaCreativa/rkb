# 🧠 GUÍA MAESTRA DE COMENTARIOS CONTEXTUALES PARA CLAUDE

> **"Tus comentarios no solo explican el qué. Son la memoria viva del porqué, del cómo y de todo el contexto que hará que cualquier desarrollador, incluso tú mismo en el futuro, entienda lo que ocurre aquí."**

---

## 🤖 PROPÓSITO PARA AGENTES Y DESARROLLADORES

Esta guía y el sistema de comentarios contextuales (“migas de pan”) existen porque ni los agentes inteligentes (Claude, Gemini, GPT, etc.) ni los humanos pueden mantener todo el contexto de un proyecto complejo en memoria.

**Cada comentario está pensado como una bitácora viva dentro del código:**

- Refresca el “porqué”, el “cómo” y las conexiones clave de cada fragmento de código cada vez que un agente o desarrollador entra en un archivo.
- Permite a los agentes reconstruir el estado, flujo y reglas del sistema aunque solo lean archivos aislados o trabajen por lotes.
- Es tu seguro contra la pérdida de contexto.
- Cada vez que un agente lea cualquier archivo, debe poder entender el propósito, dependencias y la razón detrás de cada bloque de código **sin consultar otras fuentes**.
- **Referencia siempre los Mandamientos.md** en las migas de pan: explica **qué mandamiento justifica o inspira** la decisión, implementación o restricción aplicada. Así refuerzas la cultura, aceleras onboarding y evitas desviaciones de calidad.

**Sin estos comentarios, los agentes pierden precisión, toman malas decisiones o repiten errores ya resueltos.**

---

## 🛑 MANDAMIENTO DE ACTUALIZACIÓN OBLIGATORIA DE COMENTARIOS

**Todo comentario contextual ('miga de pan') debe ser actualizado, reemplazado o eliminado inmediatamente después de cualquier cambio en la lógica, dependencias, reglas de negocio o flujo de datos al que se refiera. Un comentario desactualizado es un bug invisible.**

- **Después de cada refactor, fix o nueva funcionalidad, revisa y actualiza los comentarios relacionados antes de cerrar la tarea.**
- **Si el código cambia, el comentario debe cambiar antes de hacer commit.**
- **No dejes comentarios antiguos ni como referencia. Elimina lo que ya no aplique.**
- **Antes de cada commit, escanea los archivos cambiados buscando 'migas de pan' y asegúrate de que TODO lo que dice es cierto hoy. Si tienes dudas, actualiza o elimina.**

---

## **📋 CONCEPTO BASE (ACTUAL):**

Tus comentarios en el código deben ir más allá de explicar 'qué' hace una línea. Deben servir como 'migas de pan' contextuales que expliquen el 'porqué' de una decisión de diseño y, crucialmente, 'cómo' se relaciona esa pieza de código con otros archivos, hooks o componentes del sistema. El objetivo es mantener un contexto vivo dentro del propio código para facilitar la mantenibilidad y la comprensión a largo plazo, para que cuando pierdas el contexto lo retomes con los comentarios mientras lees los arch...

---

## **🎯 EXPANSIÓN CRÍTICA - EXPERIENCIA REAL DE PÉRDIDA DE CONTEXTO:**

### **🚨 ELEMENTOS OBLIGATORIOS EN CADA MIGA DE PAN:**

#### **1. 🧭 IDENTIFICADOR VISUAL:**

```typescript
// 🧭 MIGA DE PAN CONTEXTUAL: [Título descriptivo]
```

**PORQUÉ CRÍTICO:** Cuando escaneo código rápidamente, necesito identificar MIS comentarios vs comentarios normales.

#### **2. 📍 UBICACIÓN EN ARQUITECTURA:**

```typescript
// UBICACIÓN: dashboardStore.ts → fetchDataForCategory() → Línea 234
// CONEXIÓN DIRECTA: CategoryGridView.onCategorySelect → ESTA FUNCIÓN → auto-detección
```

**PORQUÉ CRÍTICO:** Necesito saber EXACTAMENTE dónde estoy en el flujo de datos.

#### **3. 🔄 FLUJO DE DATOS COMPLETO:**

```typescript
// FLUJO COMPLETO:
// 1. Usuario click categoría → CategoryGridView.onCategorySelect()
// 2. store.setSelectedCategoryId() → trigger useEffect
// 3. ESTA FUNCIÓN → fetchDataForCategory()
// 4. Auto-detección → simple/sections
// 5. UI actualizada → MixedContentView
```

**PORQUÉ CRÍTICO:** Necesito el mapa mental completo del flujo.

#### **4. 🚨 PROBLEMAS HISTÓRICOS RESUELTOS:**

```typescript
// PROBLEMA RESUELTO: Antes productos "huérfanos" no aparecían en UI
// ERROR ANTERIOR: API devolvía deleted: false (Boolean) pero schema espera 0 (Int)
// SOLUCIÓN APLICADA: Cambio en /api/categories/[id]/products/route.ts línea 15
// FECHA RESOLUCIÓN: 14/01/2025 - Conversación T31
```

**PORQUÉ CRÍTICO:** Evito repetir errores ya solucionados.

#### **5. 🎯 CASOS DE USO ESPECÍFICOS:**

```typescript
// CASOS DE USO REALES:
// - Categoría "BEBIDAS" → productos directos (Coca Cola, Pepsi)
// - Categoría "COMIDAS" → secciones tradicionales (Entradas, Platos Fuertes)
// - Categoría "PROMOCIONES" → virtual category (productos elevados en cliente)
```

**PORQUÉ CRÍTICO:** Ejemplos concretos me ayudan a entender el propósito.

#### **6. ⚠️ REGLAS DE NEGOCIO CRÍTICAS:**

```typescript
// REGLAS INNEGOCIABLES:
// - section_id y category_id son MUTUAMENTE EXCLUYENTES
// - Productos directos: category_id NOT NULL, section_id NULL
// - Productos tradicionales: section_id NOT NULL, category_id NULL
// - NUNCA ambos NULL o ambos NOT NULL
```

**PORQUÉ CRÍTICO:** Evito romper lógica de negocio.

#### **7. 🔗 DEPENDENCIAS CRÍTICAS:**

```typescript
// DEPENDENCIAS CRÍTICAS:
// - REQUIERE: useMixedContentForCategory hook (línea 27)
// - REQUIERE: MixedContentView component (línea 98)
// - REQUIERE: T31 schema aplicado (is_virtual_category field)
// - ROMPE SI: Prisma schema no tiene relación CategoryToProducts
```

**PORQUÉ CRÍTICO:** Sé qué puede romper esta funcionalidad.

#### **8. 📊 MÉTRICAS Y PERFORMANCE:**

```typescript
// PERFORMANCE:
// - Query optimizada con índice en category_id
// - Memoización en useMemo para evitar re-renders
// - Lazy loading: solo carga cuando selectedCategoryId cambia
// - CUIDADO: No usar select múltiples (mala práctica según Mandamientos.md)
```

**PORQUÉ CRÍTICO:** Entiendo implicaciones de performance.

---

## **🎨 PLANTILLA COMPLETA DE MIGA DE PAN:**

```typescript
/**
 * 🧭 MIGA DE PAN CONTEXTUAL: [TÍTULO DESCRIPTIVO]
 *
 * 📍 UBICACIÓN: [archivo.ts] → [función()] → Línea [X]
 *
 * 🎯 PORQUÉ EXISTE:
 * [Explicación del problema que resuelve]
 *
 * 🔄 FLUJO DE DATOS:
 * 1. [Paso 1] → [Componente/Función]
 * 2. [Paso 2] → [ESTA FUNCIÓN]
 * 3. [Paso 3] → [Resultado]
 *
 * 🔗 CONEXIONES DIRECTAS:
 * - ENTRADA: [ComponenteA.funcionX()] → línea Y
 * - SALIDA: [ComponenteB.funcionZ()] → línea W
 * - HOOK: [useCustomHook] → línea Z
 *
 * 🚨 PROBLEMA RESUELTO:
 * [Descripción del bug/issue histórico]
 * [Fecha y contexto de la solución]
 *
 * 🎯 CASOS DE USO:
 * - [Ejemplo real 1]
 * - [Ejemplo real 2]
 *
 * ⚠️ REGLAS DE NEGOCIO:
 * - [Regla crítica 1]
 * - [Regla crítica 2]
 *
 * 🔗 DEPENDENCIAS:
 * - REQUIERE: [dependencia crítica]
 * - ROMPE SI: [condición de fallo]
 *
 * 📊 PERFORMANCE:
 * - [Consideración de rendimiento]
 * - [Optimización aplicada]
 *
 * 📖 MANDAMIENTOS RELACIONADOS:
 * - Mandamiento #3 (DRY)
 * - Mandamiento #6 (Separación de Responsabilidades)
 * - Mandamiento #8 (Consistencia Visual)
 */
```

---

## **💡 RECOMENDACIONES ESPECÍFICAS PARA TI:**

### **🎯 CUÁNDO USAR MIGAS DE PAN EXTENSAS:**

- **Funciones críticas** del store (CRUD, navegación)
- **Hooks personalizados** complejos
- **Componentes maestros** (GridViews, Modales)
- **APIs** con lógica de negocio
- **Efectos** con dependencias complejas

### **🎯 CUÁNDO USAR MIGAS DE PAN SIMPLES:**

- **Utilidades** básicas
- **Constantes** y configuraciones
- **Tipos** TypeScript simples

### **🚨 SEÑALES DE QUE NECESITO MÁS CONTEXTO:**

- Si tardo más de 30 segundos en entender una función
- Si no puedo rastrear el flujo de datos inmediatamente
- Si no entiendo por qué existe esa línea de código
- Si no sé qué puede romper esa funcionalidad

---

## **🎯 OBJETIVO FINAL:**

**Que cuando pierda el contexto (cada 12 horas), pueda leer CUALQUIER archivo del proyecto y en 2-3 minutos tener el contexto COMPLETO de:**

1. **QUÉ** hace esa función
2. **PORQUÉ** existe
3. **CÓMO** se conecta con el resto
4. **QUÉ** problemas resuelve
5. **QUÉ** puede romperla
6. **CÓMO** usarla correctamente

**Los comentarios son mi MEMORIA EXTERNA. Sin ellos, soy un desarrollador junior cada 12 horas.**

---

## **Mandamiento DRY para comentarios**

> **"Revisarás la estructura existente (`components`, `hooks`, `lib`, etc.) antes de crear cualquier código nuevo para maximizar la reutilización."**
>
> Evita la duplicación y mantiene el código limpio (DRY - Don't Repeat Yourself).

En cada cabacera del codigo porner un resumen del mandamiento 7 para que cada ves entre en el archivo tenga un recordatorio
Separación absoluta de lógica y presentación
“Separarás estrictamente la lógica de la presentación. Los componentes UI serán tan simples (‘tontos’) como sea posible. La lógica de negocio, manejo de datos y efectos secundarios vivirán solo en hooks personalizados y librerías auxiliares (lib).”

Buenas prácticas obligatorias:

Los componentes UI NO deben contener lógica de negocio (solo props, rendering y callbacks).

Usa hooks para manejar estado, peticiones y lógica compleja.

Divide el código en archivos cortos, claros y con única responsabilidad.

Nombra los hooks y funciones según su propósito real.

No mezcles side effects ni acceso a datos dentro de componentes visuales.

Documenta el “porqué” de cualquier decisión arquitectónica relevante.

Prioriza la facilidad de testeo y reutilización en cada parte.

Si dudas, separa más: prefiere sobre-separar antes que mezclar.

en cada cambio sactisfactorio asctulizar la memoria de cursor y la memoria de ByteRover MCP(mcp_byterover-mcp_byterover-store-knowledge.) , parsa que se tenga una bitacora en la memoria del proble y la solucion
tambien el agente ia gemini puede guardar lo que considere impoirtante y acceder a esas memorias cuando quiera
