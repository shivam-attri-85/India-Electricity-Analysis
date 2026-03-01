import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ElectricityRecord {
  date: string;
  state: string;
  region: 'North' | 'South' | 'East' | 'West' | 'North East';
  consumption: number;
}

interface DataContextType {
  data: ElectricityRecord[];
  setData: (data: ElectricityRecord[]) => void;
  isCustomData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ElectricityRecord[]>([]);

  return (
    <DataContext.Provider value={{ data, setData, isCustomData: data.length > 0 }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
