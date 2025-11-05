export type CardData = {
  id: string
  set: Set
  name: string
  rules: string[]
  artist: string
  images: Images2
  number: string
  rarity: string
  subtypes: string[]
  supertype: string
  tcgplayer: Tcgplayer
  cardmarket: Cardmarket
  legalities: Legalities2
  regulationMark: string
}

export interface Set {
  id: string
  name: string
  total: number
  images: Images
  series: string
  ptcgoCode: string
  updatedAt: string
  legalities: Legalities
  releaseDate: string
  printedTotal: number
}

export interface Images {
  logo: string
  symbol: string
}

export interface Legalities {
  expanded: string
  standard: string
  unlimited: string
}

export interface Images2 {
  large: string
  small: string
}

export interface Tcgplayer {
  url: string
  prices: Prices
  updatedAt: string
}

export interface Prices {
  normal: Normal
  reverseHolofoil: ReverseHolofoil
}

export interface Normal {
  low: number
  mid: number
  high: number
  market: number
  directLow: any
}

export interface ReverseHolofoil {
  low: number
  mid: number
  high: number
  market: number
  directLow: number
}

export interface Cardmarket {
  url: string
  prices: Prices2
  updatedAt: string
}

export interface Prices2 {
  avg1: number
  avg7: number
  avg30: number
  lowPrice: number
  trendPrice: number
  germanProLow: number
  lowPriceExPlus: number
  reverseHoloLow: number
  suggestedPrice: number
  reverseHoloAvg1: number
  reverseHoloAvg7: number
  reverseHoloSell: number
  averageSellPrice: number
  reverseHoloAvg30: number
  reverseHoloTrend: number
}

export interface Legalities2 {
  expanded: string
  standard: string
  unlimited: string
}
