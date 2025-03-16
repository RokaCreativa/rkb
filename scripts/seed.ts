import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Crear rol si no existe
  const role = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrador del sistema'
    }
  })

  // Crear usuario bakery si no existe
  const user = await prisma.user.upsert({
    where: { email: 'bakery@bakery.com' },
    update: {},
    create: {
      email: 'bakery@bakery.com',
      name: 'bakery',
      password: await hash('bakery', 10),
      roleId: role.id,
      active: true
    }
  })

  // Crear menú de ejemplo
  const menu = await prisma.menu.create({
    data: {
      name: 'Menú Principal',
      description: 'Nuestras especialidades',
      userId: user.id,
      active: true,
      sections: {
        create: [
          {
            name: 'Entrantes',
            description: 'Para compartir',
            order: 1,
            active: true,
            products: {
              create: [
                {
                  name: 'Ensalada César',
                  description: 'Lechuga, pollo, parmesano, picatostes y salsa césar',
                  price: 12.50,
                  order: 1,
                  active: true
                },
                {
                  name: 'Croquetas caseras',
                  description: 'De jamón ibérico',
                  price: 8.00,
                  order: 2,
                  active: true
                }
              ]
            }
          },
          {
            name: 'Principales',
            description: 'Platos principales',
            order: 2,
            active: true,
            products: {
              create: [
                {
                  name: 'Solomillo a la pimienta',
                  description: 'Con patatas y verduras',
                  price: 24.50,
                  order: 1,
                  active: true
                },
                {
                  name: 'Lubina al horno',
                  description: 'Con verduras salteadas',
                  price: 22.00,
                  order: 2,
                  active: true
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Datos creados:', { role, user, menu })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 