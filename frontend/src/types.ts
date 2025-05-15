export interface Card {
  id: string;
  name: string;
  image?: string;
  set?: string;
}

export type SetItem = {
  set_id: string;
  set_name: string;
  image: string;
  release_date: string;
};

export type DBCard = {
  id: string;
  data: CardData;
};

export type CardData = {
  hp: string;
  id: string;
  set: {
    id: string;
    name: string;
    total: number;
    images: {
      logo: string;
      symbol: string;
    };
    series: string;
    updatedAt: string;
    legalities: {
      expanded: string;
      standard?: string;
      unlimited: string;
    };
    releaseDate: string;
    printedTotal: number;
  };
  name: string;
  types: string[];
  artist: string;
  images: {
    large: string;
    small: string;
  };
  number: string;
  rarity: string;
  attacks: {
    cost: string[];
    name: string;
    text: string;
    damage: string;
    convertedEnergyCost: number;
  }[];
  subtypes: string[];
  supertype: string;
  tcgplayer: {
    url: string;
    prices: {
      normal?: TCGPriceDetails;
      reverseHolofoil?: TCGPriceDetails;
    };
    updatedAt: string;
  };
  cardmarket: {
    url: string;
    prices: {
      avg1: number;
      avg7: number;
      avg30: number;
      lowPrice: number;
      trendPrice: number;
      germanProLow: number;
      lowPriceExPlus: number;
      reverseHoloLow: number;
      suggestedPrice: number;
      reverseHoloAvg1: number;
      reverseHoloAvg7: number;
      reverseHoloSell: number;
      averageSellPrice: number;
      reverseHoloAvg30: number;
      reverseHoloTrend: number;
    };
    updatedAt: string;
  };
  flavorText: string;
  legalities: {
    expanded: string;
    standard?: string;
    unlimited: string;
  };
  weaknesses: {
    type: string;
    value: string;
  }[];
  retreatCost: string[];
  regulationMark: string;
  convertedRetreatCost: number;
  nationalPokedexNumbers: number[];
};

type TCGPriceDetails = {
  low: number;
  mid: number;
  high: number;
  market: number;
  directLow: number | null;
};

export type Label = "keep" | "remove" | null;

export interface SealedPriceEntry {
  id: string;
  sealedId: string;
  product: string; // from joined Sealed.product
  price: number;
  title: string;
  url: string;
  soldAt: string;
  label: Label;
}
