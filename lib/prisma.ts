import { PrismaClient } from '@prisma/client';

// Singleton to avoid multiple PrismaClient instances in development

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  
  prisma = globalWithPrisma.prisma;
}

export { prisma }; 