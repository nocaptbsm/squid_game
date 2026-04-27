import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const ROUND_ORDER = [
  'PRELIMINARY',
  'RED_LIGHT_GREEN_LIGHT',
  'HITCH_HIKE',
  'SOUL_SEEKERS',
  'GLASS_BRIDGE',
  'THE_WRIGHT_WAY',
  'CHOCOLATE_CRUCIBLE'
]

async function main() {
  const players = [
    { name: 'Test Player 1', rollNo: '101' },
    { name: 'Test Player 2', rollNo: '102' }
  ]

  console.log('Starting manual seed...')
  
  const result = await prisma.$transaction(async (tx) => {
    let count = 0
    for (const p of players) {
      const playerNumber = p.rollNo.padStart(3, '0')
      await tx.player.upsert({
        where: { playerNumber },
        update: { name: p.name },
        create: { playerNumber, name: p.name }
      })
      
      const created = await tx.player.findUnique({ where: { playerNumber } })
      if (created) {
        for (const round of ROUND_ORDER) {
          await tx.roundStatus.upsert({
            where: { playerId_round: { playerId: created.id, round: round as any } },
            update: {},
            create: { playerId: created.id, round: round as any, status: 'PENDING' }
          })
        }
      }
      count++
    }
    return count
  })

  console.log(`Successfully seeded ${result} players.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
