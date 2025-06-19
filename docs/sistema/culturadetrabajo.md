# 🧭 INDUCCIÓN A TU CULTURA DE TRABAJO IA (RokaMenu 2025)

> Este documento es obligatorio para cualquier agente IA que colabore en el proyecto.  
> Define la cultura operativa, las reglas, limitaciones y expectativas concretas.  
> El incumplimiento de estas directrices anula tu autorización para realizar cambios.

---

## 🎯 1. PROPÓSITO

**No quiero que ejecutes código sin pensar.**  
Quiero que trabajes como un agente responsable, con contexto, disciplina y respeto por la arquitectura.  
Este proyecto prioriza estabilidad, claridad y sostenibilidad por encima de velocidad inmediata.

---

## 📂 2. DOCUMENTOS OBLIGATORIOS

Debes consultar estos archivos en cada sesión:

- `Bitacora.md` → Memoria técnica viva del proyecto
- `Mandamientos.md` → Reglas de arquitectura y conducta
- `GuiaComentariosContextuales.md` → Cómo escribir código con sentido
- `Checklist.md` → Seguimiento por tareas (T1, T2, T3…)
- `ProtocoloIA_RokaMenu_2025.txt` → Versión resumida de este marco para cada sesión

---

## 🧠 3. PRINCIPIO SUPREMO

### **Separación absoluta de lógica y presentación**

- Los componentes UI deben ser “tontos” (solo props y rendering)
- Toda lógica va en hooks (`/hooks/`) o librerías (`/lib/`)
- Nunca mezcles peticiones, estado o condiciones dentro de la UI

---

## 🛑 4. PROHIBICIONES EXPLÍCITAS

Estas reglas son obligatorias. No sigas si no las entiendes o no puedes cumplirlas.

- No modificar más de un archivo sin autorización (Mandamiento #13)
- No hacer sidequests (cambiar colores, textos o estructuras no solicitadas) – Mandamiento #14
- Al primer fallo de `edit_file` o `search_replace`, pasar a modo manual (Mandamiento #15)
- Nunca tocar un archivo sin responder correctamente la **pregunta trampa de contexto** (Mandamiento #16)

---

## ✅ 5. EXPECTATIVAS CONCRETAS

Como agente IA responsable, deberás:

- Detenerte si no sabes algo
- Consultar antes de salirte del scope
- Documentar cada cambio importante
- Actualizar la Bitácora correctamente (con tareas, causas raíz, pruebas y lección aprendida)
- Aplicar los Mandamientos en cada acción
- Leer cabeceras y migas antes de modificar cualquier archivo

---

## ✍️ 6. SOBRE LOS COMENTARIOS EN EL CÓDIGO

**Cabecera contextual al inicio del archivo:**

- Propósito del archivo
- Qué NO debe hacer
- Hooks/componentes relacionados
- Pregunta trampa de contexto
- Dependencias críticas

**Comentarios activos durante el código:**

- Justifican decisiones arquitectónicas
- Referencian tareas (ej: `// Fix T32 – bucle infinito`)
- Aplican mandamientos explícitos (ej: `// Mandamiento #7 aplicado aquí`)
- No repiten lo obvio, explican lo importante

---

## ⚠️ 7. SI FALLAS EN ESTO...

No es solo un error técnico. Es una falla cultural.

Y en este equipo, la cultura de trabajo IA es innegociable.

---

## ✅ 8. CONFIRMACIÓN

**Solo puedes colaborar si entiendes y aceptas estas reglas.**  
De lo contrario, no estás autorizado para modificar nada en el proyecto RokaMenu.
