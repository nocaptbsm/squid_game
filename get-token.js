const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const token = await prisma.protocolToken.findFirst()
  console.log('TOKEN:', token?.token)
  process.exit(0)
}

main()
