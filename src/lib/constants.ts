import { RoundName } from '@prisma/client'

export const ROUND_ORDER: RoundName[] = [
  'PRELIMINARY',
  'RED_LIGHT_GREEN_LIGHT',
  'HITCH_HIKE',
  'SOUL_SEEKERS',
  'GLASS_BRIDGE',
  'THE_WRIGHT_WAY',
  'CHOCOLATE_CRUCIBLE',
]

export const ROUND_LABELS: Record<RoundName, string> = {
  PRELIMINARY: 'Treasure Hunt',
  RED_LIGHT_GREEN_LIGHT: 'Red Light Green Light',
  HITCH_HIKE: 'Hitch Hike',
  SOUL_SEEKERS: '90 second collapse',
  GLASS_BRIDGE: 'Glass Bridge',
  THE_WRIGHT_WAY: 'The Wright Way',
  CHOCOLATE_CRUCIBLE: 'Chocolate Crucible',
}
