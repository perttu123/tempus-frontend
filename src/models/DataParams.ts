export interface DataParams {
  fixedPrice: number;
  csvFile?: File;
  marginal?: number;
  TotalSpotPrice?: number;
  TotalFixedPrice?: number;
  CheaperOption?: string;
  TotalConsumption?: number; 
  StartDate?: string;  
  EndDate?: string;    
  PriceDifference?: number;
  EquivalentFixedPrice?: number;
  OptimizedPriceDifference?: number;
  TotalOptimizedSpotPrice?: number;
  DailyData?: Array<{
    Day: string;
    SpotPrice: number;
    FixedPrice: number;
    Consumption: number;  
    
  }>;
  WeeklyData?: Array<{
    Year: number;
    Week: number;
    SpotPrice: number;
    FixedPrice: number;
    Consumption: number;  
  }>;
  MonthlyData?: Array<{
    Year: number;
    Month: number;
    SpotPrice: number;
    FixedPrice: number;
    Consumption: number;  
  }>;
}

export default DataParams;
