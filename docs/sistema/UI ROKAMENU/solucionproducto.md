# 📋 Resumen de Arquitectura y Funcionalidades para el Menú Flexible de RokaMenu

**Para**: Claude 4.0
**De**: v0
**Asunto**: Síntesis de decisiones clave sobre la lógica de la jerarquía del menú.

Hola Claude,

Aquí tienes un resumen completo de las funcionalidades y la arquitectura que hemos definido para la gestión del menú. El objetivo es lograr la máxima flexibilidad para el dueño del negocio, manteniendo una experiencia de usuario clara tanto para el administrador como para el cliente final.

---

## 1. Jerarquía Híbrida (T31): Flexibilidad Total (Decisión Final)

- **Funcionalidad Aprobada**: Se mantiene la capacidad de que una **misma categoría** pueda contener **tanto secciones como productos directos** simultáneamente.
- **Justificación**: Esta "Jerarquía Híbrida" ofrece una flexibilidad crucial para el administrador, permitiéndole estructurar el menú de forma avanzada. Por ejemplo, la categoría "Bebidas" puede tener secciones ("Refrescos", "Vinos") y a la vez productos directos ("Agua de la Casa").
- **Decisión Clave**: Se descartó la idea de restringir las categorías a tener _solo_ secciones o _solo_ productos directos. Se priorizó la flexibilidad sobre la simplicidad estructural.

---

## 2. Gestión de Productos "Huérfanos": Sistema de "Categorías Virtuales" Flexibles

Para manejar productos que no pertenecen a una categoría de menú tradicional (ej. "Especial del Día", promociones), se implementará un sistema de "Categorías Virtuales".

- **Concepto**: Cualquier categoría puede ser designada como "virtual" (o "de aplanamiento"). Esto lo decide el administrador.
- **Implementación Técnica**:
  - Se añadirá un nuevo campo booleano a la tabla `categories` en la base de datos: **`flatten_in_client_view`** (default: `false`).
  - `false`: Es una categoría "real", visible para el cliente.
  - `true`: Es una categoría "virtual", un contenedor solo para el admin.

### Comportamiento Dual (Admin vs. Cliente)

#### A. En la Vista de Administración (Panel de Gestión)

- El administrador puede **crear y nombrar libremente** tantas categorías virtuales como necesite (ej. "Promociones de Verano", "Sugerencias del Chef").
- Estas categorías virtuales son **visibles en el panel de admin** como cualquier otra categoría, permitiendo una organización interna clara.
- Se recomienda mostrar un **icono o indicador visual** junto a las categorías virtuales para que el admin reconozca su comportamiento especial.
- En el formulario de creación/edición de categoría, habrá un **checkbox** para activar/desactivar el flag `flatten_in_client_view`.

#### B. En la Vista del Cliente Final (Menú QR)

- **Categorías Reales** (`flatten_in_client_view = false`): Se muestran como contenedores navegables (ej. "Comidas", "Bebidas").
- **Categorías Virtuales** (`flatten_in_client_view = true`):
  - El nombre de la categoría virtual (ej. "Promociones de Verano") **NO se muestra** al cliente.
  - En su lugar, todos los productos directos que contiene se **"elevan"** y se muestran como **ítems individuales en la página principal del menú**, al mismo nivel que las categorías reales.

---

## 3. Lógica de la API para el Cliente Final

La API que sirve los datos al menú QR deberá implementar la siguiente lógica para construir la vista raíz:

1.  **Obtener Categorías Reales**: `SELECT * FROM categories WHERE flatten_in_client_view = false AND status = 'visible'`.
2.  **Obtener Productos Elevados**: `SELECT p.*, c.display_order as category_order FROM products p JOIN categories c ON p.category_id = c.id WHERE c.flatten_in_client_view = true AND p.status = 'visible' AND c.status = 'visible'`.
3.  **Combinar y Ordenar**: La API combinará ambas listas en una sola respuesta. La ordenación de esta lista mixta se basará en el `display_order` de la categoría de origen (tanto para las categorías reales como para los productos elevados, usando el `category_order` de su categoría virtual contenedora).
4.  **Tipado**: Cada ítem en la respuesta final debe tener un `type` (`'category'` o `'product'`) para que el frontend sepa cómo renderizarlo.

---

## ✅ Conclusión

Esta arquitectura proporciona un sistema robusto y altamente flexible. El administrador tiene control total sobre la organización y presentación de su menú, permitiendo desde estructuras simples hasta complejas jerarquías híbridas y potentes estrategias de marketing a través de las categorías virtuales.

Saludos,
v0
