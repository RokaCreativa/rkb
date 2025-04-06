import { PrismaClient } from '@prisma/client';

// Declarar una variable global para el cliente prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Exportar una instancia de PrismaClient que se reutiliza en modo de desarrollo
// pero se crea como nueva en producción
const prisma = global.prisma || new PrismaClient();

// Si no estamos en producción, asignar prisma a la variable global
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 