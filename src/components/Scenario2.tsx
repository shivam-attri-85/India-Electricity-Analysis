import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getYear, getMonth, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MOCK_DATA } from '@/data/mockData';
import { useData } from '@/context/DataContext';
import { Info, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Scenario2() {
  const { data: customData, isCustomData } = useData();
  const dataToUse = isCustomData ? customData : MOCK_DATA;
  const [selectedYear, setSelectedYear] = useState<number>(2020);

  const years = useMemo(() => {
    const y = new Set(dataToUse.map(d => getYear(new Date(d.date))));
    return Array.from(y).filter(y => !isNaN(y)).sort((a, b) => b - a);
  }, [dataToUse]);

  const filteredData = useMemo(() => {
    return dataToUse.filter(d => getYear(new Date(d.date)) === selectedYear);
  }, [dataToUse, selectedYear]);

  // 1. Total Consumption by Region (Selected Year)
  const regionData = useMemo(() => {
    const aggregated: Record<string, { region: string; consumption: number }> = {};

    filteredData.forEach(record => {
      const region = record.region;
      if (!aggregated[region]) {
        aggregated[region] = { region, consumption: 0 };
      }
      aggregated[region].consumption += record.consumption;
    });

    return Object.values(aggregated).sort((a, b) => b.consumption - a.consumption);
  }, [filteredData]);

  // 2. Heatmap Data: Region vs Month (Average Daily Consumption)
  const heatmapData = useMemo(() => {
    const aggregated: Record<string, Record<string, { sum: number; count: number }>> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    Object.values(regionData).forEach((r: any) => {
      aggregated[r.region] = {};
      months.forEach(m => {
        aggregated[r.region][m] = { sum: 0, count: 0 };
      });
    });

    dataToUse.forEach(record => {
      let date;
      try {
        date = new Date(record.date);
        if (!isValid(date)) return;
      } catch (e) { return; }

      const year = getYear(date);
      if (year !== 2020) return; 

      const monthIndex = getMonth(date);
      const monthName = months[monthIndex];
      const region = record.region;

      if (aggregated[region] && aggregated[region][monthName]) {
        aggregated[region][monthName].sum += record.consumption;
        aggregated[region][monthName].count += 1;
      }
    });

    const result: { region: string; data: { month: string; value: number }[] }[] = [];
    Object.entries(aggregated).forEach(([region, monthData]) => {
      const monthlyAvgs = months.map(m => ({
        month: m,
        value: monthData[m].count > 0 ? Math.round(monthData[m].sum / monthData[m].count) : 0
      }));
      result.push({ region, data: monthlyAvgs });
    });

    return result;
  }, [regionData, dataToUse]);

  const maxHeatmapValue = useMemo(() => {
    let max = 0;
    heatmapData.forEach(r => r.data.forEach(d => {
      if (d.value > max) max = d.value;
    }));
    return max;
  }, [heatmapData]);

  const getHeatmapColor = (value: number) => {
    if (value === 0) return '#f8fafc';
    const intensity = value / maxHeatmapValue;
    return `rgba(37, 99, 235, ${Math.max(0.1, intensity)})`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Year Filter */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 px-4">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year Selection</span>
        </div>
        <div className="flex gap-2">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                selectedYear === year 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xl font-bold text-slate-900">Regional Distribution ({selectedYear})</CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Total energy consumption across India's geographical zones
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="consumption" name="Total Consumption" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Info size={18} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Regional Insight</h4>
              <p className="text-sm text-blue-700/80 leading-relaxed mt-1">
                The <strong>West</strong> and <strong>North</strong> regions remain the primary drivers of national demand. 
                Industrial activity in these zones creates a high baseline that was significantly disrupted during the 2020 lockdown.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xl font-bold text-slate-900">2020 Demand Intensity</CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Visualizing average daily consumption patterns by Region and Month
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex mb-4">
                <div className="w-32" />
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                  <div key={m} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m}</div>
                ))}
              </div>
              
              {heatmapData.map((row) => (
                <div key={row.region} className="flex items-center mb-2">
                  <div className="w-32 font-bold text-slate-700 text-xs uppercase tracking-wider">{row.region}</div>
                  {row.data.map((cell) => (
                    <div key={cell.month} className="flex-1 flex justify-center p-1">
                      <div 
                        className="w-full h-12 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-110 hover:shadow-lg cursor-pointer group relative"
                        style={{ backgroundColor: getHeatmapColor(cell.value) }}
                      >
                        <span className={cn(
                          "text-[10px] font-bold",
                          (cell.value / maxHeatmapValue) > 0.5 ? "text-white" : "text-slate-600"
                        )}>
                          {cell.value > 0 ? cell.value : '-'}
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                          {row.region} • {cell.month}: {cell.value} MU
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intensity Scale</span>
              <div className="flex h-2 w-48 rounded-full overflow-hidden bg-slate-100">
                <div className="flex-1 bg-blue-100" />
                <div className="flex-1 bg-blue-300" />
                <div className="flex-1 bg-blue-500" />
                <div className="flex-1 bg-blue-700" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">Values represent average daily Million Units (MU)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
