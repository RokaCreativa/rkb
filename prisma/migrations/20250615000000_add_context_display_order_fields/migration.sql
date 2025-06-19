-- Migration para agregar campos de ordenación contextual
-- Sin borrar ningún dato existente

-- Para categorías: orden en Grid 1 (categories)
ALTER TABLE categories ADD COLUMN categories_display_order INT DEFAULT NULL;

-- Para secciones: orden en Grid 2 (sections) 
ALTER TABLE sections ADD COLUMN sections_display_order INT DEFAULT NULL;

-- Para productos: orden en diferentes grids donde aparecen
ALTER TABLE products ADD COLUMN categories_display_order INT DEFAULT NULL;  -- Grid 1 (productos globales)
ALTER TABLE products ADD COLUMN sections_display_order INT DEFAULT NULL;    -- Grid 2 (productos locales)
ALTER TABLE products ADD COLUMN products_display_order INT DEFAULT NULL;    -- Grid 3 (productos normales)

-- Inicializar valores basados en display_order existente
UPDATE categories SET categories_display_order = display_order WHERE display_order IS NOT NULL;
UPDATE sections SET sections_display_order = display_order WHERE display_order IS NOT NULL;
UPDATE products SET products_display_order = display_order WHERE display_order IS NOT NULL; 