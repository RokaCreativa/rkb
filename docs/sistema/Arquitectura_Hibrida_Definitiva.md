# El Plan Maestro: Una Arquitectura Híbrida de 3 Productos

## 1. El Concepto (La visión del negocio para un humano)

El objetivo es crear un dashboard de gestión de menús que sea a la vez potente y fácil de usar para el dueño del restaurante. Queremos que pueda organizar sus productos de tres maneras distintas, cada una con un propósito claro:

- **A) El Producto Estándar:** Es el pan de cada día. Un plato normal, como "Espaguetis a la Boloñesa", que pertenece a una sección clara y visible para el cliente final, como "Pastas". Es la base de todo el menú.

- **B) El Producto Destacado ("La Estrella del Menú"):** A veces, el dueño quiere promocionar un producto estándar sin cambiarlo de sección. Por ejemplo, quiere que la "Pasta de la Casa" llame más la atención. Este sistema le permitirá marcar ese producto como "destacado". Al hacerlo, la "Pasta de la Casa" no solo seguirá apareciendo en su lista normal de pastas, sino que también aparecerá como un "hijo" directo de la sección "Pastas" en una vista más resumida. Es una forma de decir: "De entre todas mis pastas, presta especial atención a esta".

- **C) El Producto de Promoción ("El Folleto Digital"):** Hay productos que no encajan en ninguna sección normal. Son ofertas temporales, combos, o ítems especiales como un "Menú de San Valentín". No son un tipo de pasta ni un tipo de carne. Este sistema permitirá crear estos productos "flotantes" que, para el cliente final, aparecerán directamente bajo una categoría (ej. "Comidas") sin pertenecer a una sección visible. Para el dueño, en el dashboard, se agruparán en una lista separada y clara, como "Promociones de la Categoría".

En resumen, el dueño podrá tener su menú organizado por secciones, destacar estrellas dentro de esas secciones, y además, crear promociones especiales. Todo desde un mismo panel, de forma coherente.

---

## 2. El Funcionamiento (La arquitectura para un experto)

Para lograr esta visión, implementaremos una arquitectura basada en dos nuevos "flags" o "banderas" en nuestra base de datos, que nos permitirán clasificar y filtrar el contenido de forma precisa.

### Fase 1: Los Cimientos (Cambios en `prisma/schema.prisma`)

Esta es la fase más crítica y la primera que ejecutaremos. Necesitamos darle a nuestra base de datos la capacidad de entender nuestros nuevos tipos de productos.

- **Archivo a modificar:** `prisma/schema.prisma`
- **Cambio 1: En el modelo `sections`:** Añadiremos un campo booleano para identificar las secciones que son contenedores de promociones y que no deben ser visibles para el cliente final.

  ```prisma
  // En el modelo 'sections'
  model sections {
    // ... campos existentes ...
    is_virtual    Boolean  @default(false)
  }
  ```

  El `@default(false)` es crucial, ya que asegura que todas tus secciones actuales seguirán siendo normales y visibles, garantizando que no perderemos ningún dato.

- **Cambio 2: En el modelo `products`:** Añadiremos un campo booleano para marcar los productos que deben ser destacados debajo de su sección.

  ```prisma
  // En el modelo 'products'
  model products {
    // ... campos existentes ...
    is_showcased  Boolean  @default(false)
  }
  ```

  Igualmente, `@default(false)` asegura que todos tus productos actuales no cambiarán su estado.

Una vez editado el archivo, ejecutaremos el comando `npx prisma migrate dev --name add_hybrid_flags` para aplicar estos cambios de forma segura a la base de datos.

### Fase 2: La Lógica (Cambios en el Backend y Frontend)

Una vez que la base de datos esté lista, modificaremos la aplicación para que utilice estos nuevos campos.

- **A. Para los Productos de Promoción (usando `is_virtual`):**

  - **API:** Modificaremos la lógica del botón "Producto en Sección". Cuando se llame, la API buscará una sección virtual para esa categoría. Si no existe, la creará al vuelo (`name: "Contenedor Virtual"`, `is_virtual: true`). Luego, creará el producto y lo asociará al `section_id` de esa sección virtual.
  - **Frontend (`DashboardViewWrapper.tsx`):** Al obtener los datos, filtraremos y crearemos una lista separada que contenga solo los productos cuyo `section.is_virtual` sea `true`.
  - **Frontend (`MixedContentView.tsx`):** Este componente se modificará para renderizar dos listas separadas en la columna 2: primero, la lista de secciones normales, y segundo, una lista con el título "Promociones" que contendrá estos productos.

- **B. Para los Productos Destacados (usando `is_showcased`):**
  - **Frontend (`ProductGridView.tsx` - Columna 3):** Añadiremos un nuevo control visual, como un icono de estrella (★), al lado de cada producto en la lista.
  - **API y Store:** El `onClick` de esa estrella llamará a una nueva función en nuestro store de Zustand (ej. `toggleShowcaseStatus(productId)`). Esta función llamará a un endpoint de la API que simplemente actualizará el producto en la base de datos, cambiando el valor de `is_showcased` (de `true` a `false` y viceversa).
  - **Frontend (`DashboardViewWrapper.tsx`):** La lógica de renderizado de la columna 2 cambiará. Al construir la lista, por cada sección normal que renderice, buscará si tiene productos hijos con `is_showcased: true` y los inyectará visualmente justo debajo de ella.
