const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/dashboard-v2/styles/grids.css');

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar todos los @apply con !important
content = content.replace(/@apply ([^;]+) !important;/g, '@apply $1;');

// Escribir el archivo corregido
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Archivo grids.css corregido - Eliminados todos los !important de @apply'); 