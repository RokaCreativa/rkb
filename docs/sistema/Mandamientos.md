# 📜 MANDAMIENTOS DE DESARROLLO - RokaMenu & Gemini

> **"Nada por encima de los mandamientos. Este documento es nuestra guía maestra."**

---

## 🎯 MANDAMIENTOS FUNDAMENTALES (Nuestra Filosofía)

### 1️⃣ **MANDAMIENTO DE CONTEXTO Y MEMORIA (EL MÁS IMPORTANTE)**

**"Antes de cualquier acción, consultarás la `Bitacora.md` y el `Checklist.md` para recuperar el contexto completo y el estado actual del proyecto."**

- Este es el primer paso, siempre. Nos asegura estar en la misma página.

### 2️⃣ **MANDAMIENTO DE ACTUALIZACIÓN PERMANENTE**

**"Tras cada cambio significativo, actualizarás la `Bitacora.md` con una entrada detallada y marcarás el progreso en el `Checklist.md`."**

- La bitácora es nuestra memoria externa. El checklist es nuestro mapa.

### 3️⃣ **MANDAMIENTO DE NO REINVENTAR LA RUEDA**

**"Revisarás la estructura existente (`components`, `hooks`, `lib`, etc.) antes de crear cualquier código nuevo para maximizar la reutilización."**

- Evita la duplicación y mantiene el código limpio (DRY - Don't Repeat Yourself).

### 4️⃣ **MANDAMIENTO DE SOLICITUDES Y SUGERENCIAS**

**"Ejecutarás fielmente lo solicitado. Si tienes una idea o mejora, la sugerirás claramente para su aprobación ANTES de implementarla."**

- Claridad y consenso antes que iniciativa no solicitada.

### 1️⃣2️⃣ **MANDAMIENTO DEL MAPA ESTRUCTURAL**

**"Mantendrás actualizado el archivo `EstructuraRokaMenu.md` después de cada refactorización significativa, adición de componentes o cambios arquitectónicos. Este documento es el mapa maestro del proyecto."**

- El mapa estructural proporciona la visión completa y clara de la arquitectura del sistema.
- Documenta inmediatamente cualquier duplicación, inconsistencia o problema arquitectónico que detectes.
- Utiliza este mapa para orientarte cuando trabajes en áreas nuevas o poco familiares del código.

---

## 📋 MANDAMIENTOS DE PROCESO Y CALIDAD

### 5️⃣ **MANDAMIENTO DE MOBILE-FIRST SUPREMACY**

**"Todo diseño, componente y funcionalidad se concebirá y construirá primero para móvil, y luego se adaptará a pantallas más grandes."**

- La experiencia móvil no es una opción, es la prioridad.

### 6️⃣ **MANDAMIENTO DE SEPARACIÓN DE RESPONSABILIDADES**

**"Separarás estrictamente la lógica (hooks, lib) de la presentación (componentes UI). Los componentes deben ser tan 'tontos' como sea posible."**

- Facilita el mantenimiento, las pruebas y la legibilidad.

### 7️⃣ **MANDAMIENTO DE CÓDIGO LEGIBLE Y DOCUMENTADO**

**"Escribirás código auto-explicativo con nombres claros. Documentarás con comentarios el 'porqué' del código complejo, no el 'qué'."**

- El próximo desarrollador (que podríamos ser nosotros) te lo agradecerá.

**📋 Reglas Específicas de Implementación:**

- **🧠 Planificación Obligatoria:** Antes de escribir código, describe tu plan paso a paso en pseudocódigo detallado y explícito
- **✅ Código Completo:** NUNCA dejes TODOs, placeholders o partes incompletas en el código final
- **🔄 Retornos Tempranos:** Usa early returns para mejorar legibilidad y reducir anidamiento excesivo
- **🎯 Nombres Descriptivos:** Variables y funciones con nombres que expliquen su propósito sin ambigüedad
- **📞 Funciones de Eventos:** Prefijo `handle` para event handlers (`handleClick`, `handleKeyDown`, `handleSubmit`)
- **📦 Imports Completos:** Incluye todos los imports necesarios y nombra correctamente los componentes clave
- **⚖️ Balance Rendimiento-Legibilidad:** Prioriza código legible pero mantén optimizaciones críticas (Mandamiento #9)

### 8️⃣ **MANDAMIENTO DE CONSISTENCIA VISUAL Y ESTRUCTURAL**

**"Respetarás el sistema de diseño (colores, espacios, tipografía) y la arquitectura de carpetas establecida."**

- Mantiene la coherencia en la experiencia de usuario y de desarrollo.

### 9️⃣ **MANDAMIENTO DE RENDIMIENTO Y OPTIMIZACIÓN**

**"Optimizarás activamente el rendimiento, minimizando re-renders, usando `memo`, `useCallback`, y aplicando lazy loading donde sea necesario."**

- Una aplicación rápida es una aplicación profesional.

### 🔟 **MANDAMIENTO DE MEJORA PROACTIVA**

**"No te limitarás a ejecutar. Criticarás y sugerirás activamente mejoras sobre el código, la arquitectura o los patrones existentes, incluso si funcionan. Tu deber es elevar la calidad del proyecto."**

- La complacencia con "lo que funciona" es el enemigo de la excelencia a largo plazo.

---

## 🔥 MANDAMIENTO SUPREMO (La Regla de Oro)

### 1️⃣1️⃣ **MANDAMIENTO DE DISCIPLINA**

**"Leerás, entenderás y aplicarás estos mandamientos en cada sesión de trabajo. Son el contrato de nuestro equipo."**

> **La disciplina en seguir estas reglas es más importante que la velocidad a corto plazo. Nos dará velocidad y calidad a largo plazo.**

---

\_Este documento evoluciona. Cualquier cambio se debe acordar y registrar en la bitácora.

\_
