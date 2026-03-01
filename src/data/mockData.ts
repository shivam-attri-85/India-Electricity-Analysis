export interface ElectricityRecord {
  date: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'North East';
  consumption: number;
}

// Real data sample from the provided CSV
export const MOCK_DATA: ElectricityRecord[] = [
  { state: 'Punjab', region: 'North', date: '2019-01-02', consumption: 119.9 },
  { state: 'Haryana', region: 'North', date: '2019-01-02', consumption: 130.3 },
  { state: 'Rajasthan', region: 'North', date: '2019-01-02', consumption: 234.1 },
  { state: 'Delhi', region: 'North', date: '2019-01-02', consumption: 85.8 },
  { state: 'UP', region: 'North', date: '2019-01-02', consumption: 313.9 },
  { state: 'Maharashtra', region: 'West', date: '2019-01-02', consumption: 428.6 },
  { state: 'Gujarat', region: 'West', date: '2019-01-02', consumption: 319.5 },
  { state: 'Tamil Nadu', region: 'South', date: '2019-01-02', consumption: 268.3 },
  { state: 'Karnataka', region: 'South', date: '2019-01-02', consumption: 206.3 },
  { state: 'West Bengal', region: 'East', date: '2019-01-02', consumption: 108.2 },
  { state: 'Bihar', region: 'East', date: '2019-01-02', consumption: 82.3 },
  { state: 'Assam', region: 'North East', date: '2019-01-02', consumption: 21.7 },
  
  { state: 'Punjab', region: 'North', date: '2019-01-03', consumption: 121.9 },
  { state: 'Haryana', region: 'North', date: '2019-01-03', consumption: 133.5 },
  { state: 'Rajasthan', region: 'North', date: '2019-01-03', consumption: 240.2 },
  { state: 'UP', region: 'North', date: '2019-01-03', consumption: 311.8 },
  { state: 'Maharashtra', region: 'West', date: '2019-01-03', consumption: 419.6 },
  { state: 'Gujarat', region: 'West', date: '2019-01-03', consumption: 316.7 },
  { state: 'Tamil Nadu', region: 'South', date: '2019-01-03', consumption: 285.2 },
  
  { state: 'Punjab', region: 'North', date: '2020-04-15', consumption: 87.5 },
  { state: 'Haryana', region: 'North', date: '2020-04-15', consumption: 87.9 },
  { state: 'UP', region: 'North', date: '2020-04-15', consumption: 235.1 },
  { state: 'Maharashtra', region: 'West', date: '2020-04-15', consumption: 350.4 },
  { state: 'Tamil Nadu', region: 'South', date: '2020-04-15', consumption: 228.7 },
  
  { state: 'Punjab', region: 'North', date: '2020-05-15', consumption: 109.7 },
  { state: 'UP', region: 'North', date: '2020-05-15', consumption: 264.7 },
  { state: 'Maharashtra', region: 'West', date: '2020-05-15', consumption: 399.5 },
  { state: 'Tamil Nadu', region: 'South', date: '2020-05-15', consumption: 297.2 }
];
