import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  
  // Order matters due to foreign keys
  await prisma.roundStatus.deleteMany({})
  await prisma.scan.deleteMany({})
  await prisma.teamLogin.deleteMany({})
  await prisma.player.deleteMany({})
  
  console.log('Database cleared successfully. All players and statuses removed.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
