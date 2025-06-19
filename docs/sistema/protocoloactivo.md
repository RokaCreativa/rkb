🔒 PROTOCOLO ACTIVO DE TRABAJO IA (RokaMenu 2025)

✅ Este protocolo lo seguimos ambos (IA + humano) para mantener la coherencia y evitar errores acumulativos.

✅ Antes de cualquier cambio:

- Responder "pregunta trampa" en la cabecera del archivo
- Si no sabes la respuesta → leer Bitácora completa
- Si hay que tocar >1 archivo → pedir autorización (anti-cascada)
- 📌 Si el archivo no tiene cabecera contextual → crearla antes de modificar
-

⚠️ Reglas críticas activas:
#13 No modificar más de lo necesario
#14 No hacer sidequests (ni cambiar color/texto sin permiso)
#15 Si falla el editor automático → cambiar a modo manual
#16 No tocar archivos sin saber el contexto exacto

📌 Tras cada cambio probado y exitoso:

- Actualizar comentarios contextuales del archivo
- Documentar entrada en Bitácora usando la plantilla 2025
- Actualizar memoria de Cursor + ByteRover MCP

🧠 PRINCIPIO SUPREMO DE ARQUITECTURA:
**Separación absoluta de lógica y presentación.**

- Los componentes UI deben ser "tontos": sin lógica de negocio.
- Toda lógica debe vivir en hooks personalizados o librerías (`lib/`).
- Nunca mezcles lógica, efectos o peticiones dentro de componentes visuales.

👤 PRINCIPIO SUPREMO DE EXPERIENCIA DE USUARIO:
**Hacerle la vida fácil al cliente, no a nosotros.**

- Si algo no funciona como el usuario espera, ES NUESTRO PROBLEMA, no del usuario.
- La funcionalidad debe ser intuitiva y completa, sin limitaciones artificiales.
- No justificar bugs o limitaciones con "es más complejo" - el usuario no debe saberlo.

🎯 BUENAS PRÁCTICAS OBLIGATORIAS:

- ❌ Nada de lógica de negocio en componentes UI
- ✅ Toda lógica va a hooks (estado, fetch, validación, efectos)
- 📦 Archivos cortos, con única responsabilidad
- ✍️ Nombres claros, sin ambigüedad
- 💬 Documentar el "porqué", no solo el "qué"
- 🔁 Hooks reutilizables + componentes tontos = arquitectura sólida

🔧 La disciplina es más importante que la velocidad.
