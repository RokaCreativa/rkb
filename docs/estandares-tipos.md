# Estándares de Tipos en RokaMenu

Este documento establece los estándares para el manejo de tipos en la aplicación RokaMenu, especialmente para campos que representan estados y visibilidad.

## Estándar para campos de visibilidad/estado

### Base de datos

En las tablas de la base de datos, los campos de estado como `status` se almacenan como:

- **Tipo**: `BOOLEAN` o `TINYINT(1)`
- **Valores**:
  - `true` o `1`: Visible/Activo
  - `false` o `0`: No visible/Inactivo

### API (Backend)

Al procesar datos en los endpoints de API, se debe convertir el tipo booleano a numérico:

```typescript
// Ejemplo de conversión en un endpoint
return {
  ...entity,
  status: entity.status ? 1 : 0  // Convertir booleano a numérico
};
```

### Frontend

En el frontend, los campos de visibilidad/estado siempre deben manejarse como valores numéricos:

- **Tipo**: `number`
- **Valores**:
  - `1`: Visible/Activo
  - `0`: No visible/Inactivo

## Implementación en Entidades

### Productos

```typescript
// En app/api/products/route.ts
return {
  ...product,
  status: product.status ? 1 : 0
};
```

### Secciones

```typescript
// En app/api/sections/route.ts
return {
  ...section,
  status: section.status ? 1 : 0
};
```

### Categorías

```typescript
// En app/api/categories/route.ts
return {
  category_id: category.category_id,
  name: category.name || '',
  image: category.image ? `${IMAGE_BASE_PATH}${category.image}` : null,
  status: category.status ? 1 : 0,
  // ...otros campos
};
```

## Campos de borrado lógico

Para el borrado lógico se utiliza el campo `deleted`:

### Base de datos

- **Productos**: `Boolean` - Usar `true`/`false`
- **Secciones y Categorías**: `TINYINT(1)` - Usar `0`/`1`

### API

Al filtrar en consultas Prisma:

- **Para productos**: `deleted: false`
- **Para secciones y categorías**: `deleted: 0` o `deleted: { not: 1 } as any`

## Recomendaciones

1. **Consistencia**: Mantener la consistencia en la conversión de tipos en todos los endpoints.
2. **Validación**: Validar siempre los tipos al recibir datos desde el frontend.
3. **Comentarios**: Documentar la conversión de tipos con comentarios claros.
4. **Refactorización**: En futuras versiones, considerar unificar el tipo de estos campos en la base de datos.

## Problemas conocidos

En la versión actual de la aplicación:

1. Hay inconsistencia en el tipo del campo `deleted` entre entidades:
   - Productos: `Boolean`
   - Secciones y Categorías: `TINYINT(1)`

2. Se usa el operador `as any` en algunos lugares para evitar errores de tipo:
   ```typescript
   deleted: { not: 1 } as any
   ```

Estas inconsistencias deberían resolverse en futuras actualizaciones de la estructura de base de datos. 