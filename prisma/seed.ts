import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.scan.deleteMany()
  await prisma.teamLogin.deleteMany()
  await prisma.roundStatus.deleteMany()
  await prisma.player.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@paradox.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  // 2. Create Volunteers
  const volPassword = await bcrypt.hash('vol123', 10)
  for (let i = 1; i <= 3; i++) {
    await prisma.user.create({
      data: {
        name: `Volunteer ${i}`,
        email: `vol${i}@paradox.com`,
        password: volPassword,
        role: Role.VOLUNTEER,
      },
    })
  }

  // 3. Create 200 Players
  const playersData = []
  for (let i = 1; i <= 200; i++) {
    const playerNumber = i.toString().padStart(3, '0')
    const qrToken = crypto.randomUUID()
    
    playersData.push({
      playerNumber,
      qrToken,
      isRegistered: false,
    })
  }

  await prisma.player.createMany({
    data: playersData,
  })

  const allPlayers = await prisma.player.findMany()

  // 4. Create RoundStatuses & TeamLogins for each player
  const roundStatusData = []
  const teamLoginData = []
  
  const roundNames = [
    'PRELIMINARY',
    'RED_LIGHT_GREEN_LIGHT',
    'HITCH_HIKE',
    'SOUL_SEEKERS',
    'GLASS_BRIDGE',
    'THE_WRIGHT_WAY',
    'CHOCOLATE_CRUCIBLE'
  ] as const

  for (const player of allPlayers) {
    // Round statuses
    for (const round of roundNames) {
      roundStatusData.push({
        playerId: player.id,
        round,
      })
    }

    // PIN = player number padded to 4 digits (e.g. player 042 → PIN "0042")
    // This makes PINs predictable and usable at a real event
    const pinStr = player.playerNumber.padStart(4, '0')
    const hashedPin = await bcrypt.hash(pinStr, 10)
    
    teamLoginData.push({
      playerId: player.id,
      pin: hashedPin,
    })
  }

  // Batch insert round statuses
  await prisma.roundStatus.createMany({
    data: roundStatusData,
  })

  // Batch insert team logins
  await prisma.teamLogin.createMany({
    data: teamLoginData,
  })

  console.log('Seeding finished.')
  console.log('Admin: admin@paradox.com / admin123')
  console.log('Volunteers: vol1@paradox.com, vol2@paradox.com, vol3@paradox.com / vol123')
  console.log('Player 001 PIN for testing: 1234')
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
