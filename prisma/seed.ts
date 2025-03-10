import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.roles.createMany({
        data: [
            { nombre: "Administrador" },
            { nombre: "Restaurante" },
            { nombre: "Cliente" }
        ]
    });

    console.log("Roles insertados correctamente");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
