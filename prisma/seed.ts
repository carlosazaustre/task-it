import { PrismaClient } from '../lib/generated/prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@taskit.dev' },
    update: {},
    create: {
      email: 'demo@taskit.dev',
      name: 'Demo User',
      password: hashedPassword,
      tags: {
        create: [
          { name: 'Trabajo', color: 'blue' },
          { name: 'Personal', color: 'green' },
          { name: 'Urgente', color: 'red' },
          { name: 'Reunión', color: 'purple' },
          { name: 'Idea', color: 'amber' },
        ],
      },
      settings: {
        create: {},
      },
    },
  })

  console.log(`Seeded user: ${user.email}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
