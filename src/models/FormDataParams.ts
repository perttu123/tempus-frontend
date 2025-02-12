export interface FormDataParams {
  year: number;
  directiveFixedPrice: number;
  houseType: string;
  squareMeters: number;
  numberOfResidents: number;
  workShiftType: string;
  hasFloorHeating: boolean;
  floorHeatingSquareMeters?: number;
  heatingType: string;
  hasElectricCar: boolean;
  electricCarCount?: number;
  hasSauna: boolean;
  saunaHeatingFrequency?: number;
  hasFirePlace: boolean;
  firePlaceHeatingFrequency?: number;
  electricCarKwhUsagePerYear?: number;
  hasSolarPanels: boolean;
  solarPanelCount: number;
}

export interface CalculationResult {
  TotalFixedPriceCost: number;
  TotalSpotPriceCost: number;
  TotalDirectiveConsumption: number;
  EstimatedMinConsumption: number;
  EstimatedMaxConsumption: number;
  MinSpotPriceCost: number,
  MaxSpotPriceCost: number,
  MinFixedPriceCost: number,
  MaxFixedPriceCost: number,
  CheaperOption?: string;
  CostDifference: number;
  AverageHourlySpotPrice: number;
  CalculationYears: number;
  MonthlyData: MonthlyData[];
}

export interface MonthlyData {
  Month: number;
  Consumption: number;
  SpotPriceAverageOfMonth: number;
  FixedPriceAverageOfMonth: number;
  FixedPriceTotal: number;
  SpotPriceTotal: number;
  AverageConsumptionPerHour: number;
}

export default FormDataParams;