export interface DatabaseCardMatch {
  id: string;
  data: CardData;
  similarity: number;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
}

export interface CardDetection {
  card_index: number;
  embedding: number[];
  dimension: number;
  card_size: { width: number; height: number };
  bounding_box?: BoundingBox;
}

export interface EmbeddingServiceResponse {
  cards_detected: number;
  cards: CardDetection[];
  image_size?: { width: number; height: number };
  model: string;
}

export interface CardData {
  name: string;
  images?: {
    small?: string;
    large?: string;
  };
  set?: {
    id?: string;
    name?: string;
    series?: string;
    releaseDate?: string;
  };
  number?: string;
  rarity?: string;
  tcgplayer?: {
    prices?: any;
  };
}

export type TimeframeKey = "10d" | "1m" | "3m" | "6m" | "1y";
