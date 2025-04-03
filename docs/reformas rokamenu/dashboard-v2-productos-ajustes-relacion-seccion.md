
# Cambios en la Relación Productos → Secciones (Dashboard V2)

## 🧠 Contexto

Anteriormente, los productos estaban relacionados con las secciones mediante una **tabla intermedia `products_sections`**, lo cual permitía una relación de muchos a muchos. Sin embargo, esto complicaba la carga directa de productos por sección.

## ✅ Cambios Realizados

### 🗃️ En la Base de Datos:

1. **Se añadió la columna `section_id` directamente en la tabla `products`**:
   ```sql
   ALTER TABLE products ADD COLUMN section_id INT AFTER client_id;
   ```

2. **Se definió la relación foránea** entre `products.section_id` y `sections.section_id`:
   ```sql
   ALTER TABLE products ADD CONSTRAINT fk_products_section FOREIGN KEY (section_id) REFERENCES sections(section_id);
   ```

> 🎯 Resultado: ahora un producto **pertenece directamente a una única sección**, lo cual simplifica enormemente las consultas y la carga jerárquica.

---

### 🛠️ En el Código (Claude, aquí es donde tienes que actuar):

#### 1. **Actualizar el modelo Prisma**
Asegúrate de tener esto en `schema.prisma`:

```prisma
model products {
  product_id   Int       @id @default(autoincrement())
  name         String    @db.VarChar(100)
  price        Decimal   @db.Decimal(10, 2)
  section_id   Int
  sections     sections  @relation(fields: [section_id], references: [section_id], map: "fk_products_section")

  @@index([section_id], map: "fk_products_section")
}
```

Y en el modelo `sections`, agregar el campo inverso:

```prisma
model sections {
  section_id Int @id @default(autoincrement())
  name       String?

  products   products[]  // <-- Relación inversa
}
```

#### 2. **Actualizar el Hook `useProductManagement`**
Modificar las funciones que cargan productos para que usen:

```ts
GET /api/products?section_id={id}
```

Y no hagan ningún join con `products_sections`.

#### 3. **Actualizar `fetchProductsBySection`**
Revisar que el filtro sea:

```ts
where: {
  section_id: Number(sectionId)
}
```

#### 4. **Eliminar referencias a `products_sections`**
Todos los lugares donde antes se usaba `products_sections` ahora deben apuntar directamente al campo `section_id`.

---

## 📌 Beneficios

- ✅ Simplicidad en las queries
- ✅ Mejor rendimiento
- ✅ Relación más clara y fácil de mantener
- ✅ Compatibilidad con Prisma y lazy loading

---

## 📎 Notas Finales

- Ya no se usa `products_sections` en el dashboard-v2.
- Si en el futuro se quiere permitir productos en múltiples secciones, se podrá reactivar esa tabla.
- Este cambio permite cargar los productos directamente y renderizarlos sin transformaciones adicionales.

---

**¡Claude! Este es el único cambio que necesitas adaptar en la lógica de productos.**  
Todo lo demás sigue igual que en la arquitectura del dashboard-v2.
