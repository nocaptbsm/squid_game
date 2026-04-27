import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const players = await prisma.player.findMany({
    take: 15,
    orderBy: { playerNumber: 'asc' }
  })
  console.log(JSON.stringify(players, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
