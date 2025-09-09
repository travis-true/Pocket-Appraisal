export interface ManualCardInput {
  player: string;
  year: string;
  set: string;
  cardNumber: string;
}

export interface IdentifiedCardInfo extends ManualCardInput {
  parallelDescription: string | null;
}

export interface PriceSource {
  name: string;
  url: string | null;
}

export interface PriceInfo {
  name: string;
  rawPrice: string;
  gradedPrice: string;
  rawSource: PriceSource;
  gradedSource: PriceSource;
  dateRange: string;
}

export interface PricingData {
  cardImageUrl: string | null;
  baseCard: PriceInfo;
  parallels: PriceInfo[];
}

export interface ImageFile {
  file: File;
  base64: string;
}