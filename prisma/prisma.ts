import { PrismaClient } from "@prisma/client";

// Declaramos un tipo global para almacenar la instancia de Prisma en modo dev
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Evitamos crear múltiples instancias de PrismaClient en desarrollo,
 * usando una variable global. En producción se crea siempre una nueva.
 */
const prisma = global.prisma || new PrismaClient({
  // Puedes configurar logs adicionales aquí si deseas
  log: ["query", "info", "warn", "error"],
});

// Si estamos en desarrollo, guardamos la instancia en la variable global
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
