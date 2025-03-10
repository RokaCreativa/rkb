import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alergenos = await prisma.alergenos.findMany();
  console.log(alergenos);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
