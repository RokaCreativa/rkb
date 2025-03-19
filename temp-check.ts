import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  // Imprimir los modelos disponibles
  console.log(Object.keys(prisma));
  
  // Intentar obtener un usuario
  try {
    const usuario = await prisma.users.findFirst();
    console.log('Usuario encontrado:', usuario);
  } catch (error) {
    console.error('Error buscando usuario:', error);
  }
  
  // Intentar obtener un cliente
  try {
    const cliente = await prisma.clients.findFirst();
    console.log('Cliente encontrado:', cliente);
  } catch (error) {
    console.error('Error buscando cliente:', error);
  }
  
  // Intentar obtener una categoría
  try {
    const categoria = await prisma.categories.findFirst();
    console.log('Categoría encontrada:', categoria);
  } catch (error) {
    console.error('Error buscando categoría:', error);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  }); 