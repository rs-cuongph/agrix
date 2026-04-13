export class SeasonSuggestionProductDto {
  id: string;
  name: string;
  sku: string;
  baseSellPrice: number;
  baseUnit: string;
  currentStockBase: number;
  reason: string | null;
  dosageNote: string | null;
  priority: number;
}

export class SeasonSuggestionDto {
  context: {
    zone: string;
    crop: string;
    stage: string;
    month: number;
  };
  explanation: string;
  products: SeasonSuggestionProductDto[];
}
