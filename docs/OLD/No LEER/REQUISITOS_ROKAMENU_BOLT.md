# 📘 REQUISITOS COMPLETOS PARA MAQUETA INICIAL EN BOLT – ROKAMENU

---

## 🧠 VISIÓN GENERAL

**RokaMenu** es una plataforma digital para restaurantes y negocios similares que permite crear, gestionar y mostrar menús online de forma visual, flexible y multilingüe. Está pensada para funcionar desde cualquier dispositivo, integrarse fácilmente con herramientas externas (QR, Stripe, estadísticas) y escalar desde un cliente con un solo restaurante hasta grandes grupos con múltiples ubicaciones y equipos.

---

## 🔍 VISTAS PRINCIPALES (4 MODOS)

| Vista                | Escritorio            | Móvil               |
|----------------------|------------------------|---------------------|
| **Dashboard**        | Vista completa de administración con preview móvil integrado | Interfaz adaptada con funciones clave |
| **Menú Cliente Final** | Menú online visible al público | Versión ultra limpia desde móvil vía QR |

---

## ⚙️ FUNCIONALIDADES CORE EN DASHBOARD

- Vista previa del menú móvil desde el dashboard escritorio.
- Configurador visual de apariencia (colores, logos, fuentes).
- Editor multilenguaje automático + edición manual persistente.
- Generador de QR con logo, colores, formato descargable.
- Módulo de estadísticas (visitas, idioma, productos más vistos).
- Subida de menú en formato PDF como alternativa temporal.
- Descarga de menú en formato A4 vertical visualmente atractivo.
- Soporte para múltiples menús por restaurante.
- Soporte multi-restaurante por cliente.
- Sistema de roles (admin, miembro).
- Notificaciones y logs de actividad (quién cambió qué).
- Sistema de reviews:
  - 5 estrellas: redirige a Google o TripAdvisor.
  - <5 estrellas: feedback interno gestionable.
- Configuración de redes sociales por cliente.
- Configuración completa dentro del dashboard (idiomas, QR, PDF, etc.).
- Chat de atención al cliente en la web pública.
- Apartado de FAQ accesible para clientes.
- Sistema de etiquetas (vegano, carnes, postres, etc.).
- Filtros por alérgenos/dietas (sin gluten, sin lactosa, etc.).
- Soporte para diferentes precios por tamaño (tamaño S/M/L).
- Página principal moderna (rokamenu.es) con:
  - Sección de funcionalidades
  - Precios y planes (Starter, Business, Premium)
  - Blog de contenido SEO
  - Preguntas frecuentes
  - Chat integrado

---

## 💳 SISTEMA DE PAGO

- Integración con **Stripe** para gestionar suscripciones por plan.
- Tres planes previstos:
  - Starter (funciones básicas)
  - Business (estadísticas, personalización)
  - Premium (multilingüe, PDF, estadísticas avanzadas, branding)

---

## 🌍 MULTI-IDIOMA

- Interfaz de menú en inglés y español por defecto.
- Se podrán agregar más idiomas en el futuro.
- Traducción automática + posibilidad de editar cualquier palabra y mantener esa versión.

---

## 📦 OPCIONES ADICIONALES QUE SE DEBEN INCLUIR

- 🌟 **Visibilidad programada** de categorías o productos (por horario o disponibilidad).
- 📅 **Soporte para “menú del día” o menús especiales temporales**.
- 🔍 **Buscador interno en el menú final** (por palabra clave o etiqueta).
- 🧪 **Sistema de alérgenos visual integrado en cada producto**.
- ✅ **Filtros por etiquetas** (veganos, sin gluten, carne, etc.).
- 📦 **Métricas para el cliente** (visitas, idiomas, productos más vistos).
- 🧾 **Versionado simple del menú** (poder volver atrás a una versión anterior).
- 🧠 **Panel de ayuda + guía interactiva para nuevos usuarios**.
- 💱 **Multimoneda prevista (ej: €, $, £)** si se expande internacionalmente.
- 💬 **Testimonios de clientes en web pública** (mostrar valor social real).

---

## 🔐 CONSIDERACIONES TÉCNICAS PARA BOLT

- Conexión directa a base de datos existente (MySQL).
- Almacenamiento externo de imágenes (ej: S3).
- Rutas separadas para:
  - Visitantes (rokamenu.es)
  - Clientes autenticados (dashboard)
  - Menús públicos (con subdominio o URL única)
- Todo editable desde interfaz sin tocar el código.
- Componentes reutilizables.
- Estructura modular y desacoplada.
- Preparado para escalar a múltiples países e idiomas.

---

## 🧭 RECOMENDACIONES PARA MAQUETA INICIAL

- Enfocar en diseño mobile-first (menú cliente y dashboard móvil).
- Montar todas las rutas clave aunque haya secciones vacías.
- Marcar claramente qué funciones serán futuras (con “coming soon”).
- Dejar visibles los 3 planes con diferencias entre ellos.
- Documentar bien el sistema de roles y menús por restaurante.

---

Este documento servirá como referencia total para construir la maqueta inicial y organizar el desarrollo de RokaMenu con Bolt. La arquitectura está pensada para funcionar desde el primer día, pero crecer de forma natural sin romper lo ya creado.
