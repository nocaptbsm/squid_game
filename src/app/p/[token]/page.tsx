import { prisma } from '@/lib/prisma'
import { ROUND_LABELS } from '@/lib/constants'
import SquidGameProfile from '@/components/squid/SquidGameProfile'

export const dynamic = 'force-dynamic'

export default async function PublicPlayerProfilePage({ params }: { params: { token: string } }) {
  const { token } = params

  // 1. Try to find player by token
  const player = await prisma.player.findUnique({
    where: { qrToken: token },
    include: { rounds: true }
  })

  // 2. If no player, check if it's a valid protocol token but not yet registered
  const protocolToken = !player ? await prisma.protocolToken.findUnique({
    where: { token }
  }) : null

  return (
    <SquidGameProfile 
      player={player} 
      protocolToken={protocolToken} 
      token={token} 
      roundLabels={ROUND_LABELS} 
    />
  )
}
