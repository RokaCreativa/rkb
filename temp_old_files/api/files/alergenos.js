import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const alergenos = await prisma.alergenos.findMany();
        res.status(200).json(alergenos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los alérgenos' });
    } finally {
        await prisma.$disconnect();
    }
}
