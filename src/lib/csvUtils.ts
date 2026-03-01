import Papa from 'papaparse';
import { format, parseISO, isValid } from 'date-fns';

export interface ColumnSummary {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  missing: number;
  unique: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  columns: ColumnSummary[];
  preview: any[];
  cleaningLog: string[];
}

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const cleanData = (data: any[]): { cleanedData: any[]; log: string[] } => {
  const log: string[] = [];
  let cleanedData = [...data];

  // 1. Remove duplicates
  const initialCount = cleanedData.length;
  cleanedData = Array.from(new Set(cleanedData.map(a => JSON.stringify(a)))).map(a => JSON.parse(a));
  if (cleanedData.length < initialCount) {
    log.push(`Removed ${initialCount - cleanedData.length} duplicate rows.`);
  }

  // 2. Handle missing values (simple strategy: drop rows with > 50% missing, fill numeric with mean?) 
  // For this demo, we will just identify them. Let's filter out completely empty rows if any slipped through
  const nonEmpty = cleanedData.filter(row => Object.values(row).some(v => v !== null && v !== ''));
  if (nonEmpty.length < cleanedData.length) {
    log.push(`Removed ${cleanedData.length - nonEmpty.length} empty rows.`);
  }
  cleanedData = nonEmpty;

  // 3. Type inference and conversion
  if (cleanedData.length > 0) {
    const keys = Object.keys(cleanedData[0]);
    keys.forEach(key => {
      // Check if looks like a date
      const sample = cleanedData.find(row => row[key])?.[key];
      if (typeof sample === 'string' && !isNaN(Date.parse(sample)) && sample.length > 5) {
        // It might be a date
        log.push(`Column '${key}' detected as Date type.`);
      }
    });
  }

  return { cleanedData, log };
};

export const analyzeData = (data: any[]): DatasetSummary => {
  if (!data || data.length === 0) {
    return { rowCount: 0, columnCount: 0, columns: [], preview: [], cleaningLog: [] };
  }

  const columns = Object.keys(data[0]);
  const rowCount = data.length;
  const columnSummaries: ColumnSummary[] = columns.map(col => {
    const values = data.map(row => row[col]);
    const definedValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const missing = rowCount - definedValues.length;
    const unique = new Set(definedValues).size;
    
    // Type detection
    let type: 'number' | 'string' | 'date' | 'boolean' = 'string';
    if (definedValues.length > 0) {
      const sample = definedValues[0];
      if (typeof sample === 'number') type = 'number';
      else if (typeof sample === 'boolean') type = 'boolean';
      else if (!isNaN(Date.parse(sample)) && sample.length > 8) type = 'date'; // Rough heuristic
    }

    let stats: any = {};
    if (type === 'number') {
      const nums = definedValues as number[];
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const sorted = [...nums].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const median = sorted[Math.floor(sorted.length / 2)];
      
      // Std Dev
      const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
      const stdDev = Math.sqrt(variance);

      stats = { min, max, mean, median, stdDev };
    }

    return {
      name: col,
      type,
      missing,
      unique,
      ...stats
    };
  });

  return {
    rowCount,
    columnCount: columns.length,
    columns: columnSummaries,
    preview: data.slice(0, 5),
    cleaningLog: [] // Populated by the caller usually
  };
};
