import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { format, getMonth, getYear, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MOCK_DATA } from '@/data/mockData';
import { useData } from '@/context/DataContext';
import { TrendingDown, Activity, Zap, LayoutDashboard, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Scenario1() {
  const { data: customData, isCustomData } = useData();
  const dataToUse = isCustomData ? customData : MOCK_DATA;
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = useMemo(() => {
    const r = new Set(dataToUse.map(d => d.region));
    return ['All', ...Array.from(r)];
  }, [dataToUse]);

  const filteredData = useMemo(() => {
    if (selectedRegion === 'All') return dataToUse;
    return dataToUse.filter(d => d.region === selectedRegion);
  }, [dataToUse, selectedRegion]);

  // Aggregate monthly consumption for India
  const monthlyData = useMemo(() => {
    const aggregated: Record<string, { month: string; year: number; monthIndex: number; consumption: number }> = {};

    filteredData.forEach(record => {
      let date;
      try {
        date = new Date(record.date);
        if (!isValid(date)) return;
      } catch (e) { return; }
      
      const monthKey = format(date, 'yyyy-MM');
      
      if (!aggregated[monthKey]) {
        aggregated[monthKey] = {
          month: format(date, 'MMM'),
          year: getYear(date),
          monthIndex: getMonth(date),
          consumption: 0
        };
      }
      aggregated[monthKey].consumption += record.consumption;
    });

    const chartDataMap: Record<string, any> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    months.forEach((m, i) => {
      chartDataMap[m] = { name: m, index: i };
    });

    Object.values(aggregated).forEach(entry => {
      if (chartDataMap[entry.month]) {
        chartDataMap[entry.month][entry.year] = Math.round(entry.consumption);
      }
    });

    return Object.values(chartDataMap).sort((a, b) => a.index - b.index);
  }, [filteredData]);

  const stats = useMemo(() => {
    const aprilData = monthlyData[3];
    const april2019 = aprilData ? (aprilData[2019] || 0) : 0;
    const april2020 = aprilData ? (aprilData[2020] || 0) : 0;
    const dropPercentage = april2019 > 0 ? ((april2019 - april2020) / april2019 * 100).toFixed(1) : '0.0';

    let min = { val: Infinity, month: '', year: 0 };
    let max = { val: -Infinity, month: '', year: 0 };

    monthlyData.forEach(d => {
      if (d[2019] > max.val) max = { val: d[2019], month: d.name, year: 2019 };
      if (d[2020] > max.val) max = { val: d[2020], month: d.name, year: 2020 };
      
      if (d[2019] < min.val && d[2019] > 0) min = { val: d[2019], month: d.name, year: 2019 };
      if (d[2020] < min.val && d[2020] > 0) min = { val: d[2020], month: d.name, year: 2020 };
    });

    return { dropPercentage, april2019, april2020, min, max };
  }, [monthlyData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 px-4">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region Filter</span>
        </div>
        <div className="flex gap-2">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                selectedRegion === region 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <TrendingDown size={20} />
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">Critical</span>
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">-{stats.dropPercentage}%</div>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">Lockdown Impact (Apr)</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Activity size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{stats.max.val.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">Peak Demand (MU)</p>
            <p className="text-[10px] text-blue-600 font-bold mt-1">{stats.max.month} {stats.max.year}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Zap size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{stats.min.val.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">Lowest Demand (MU)</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">{stats.min.month} {stats.min.year}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-800" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                <LayoutDashboard size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{stats.april2020.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">Apr 2020 Usage</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Million Units</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Consumption Comparison</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Analyzing Year-over-Year variance in national electricity demand
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-slate-600">2019</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-slate-600">2020</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="color2019" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="color2020" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                
                {/* @ts-ignore */}
                <ReferenceArea x1="Mar" x2="May" fill="#f1f5f9" fillOpacity={0.5} stroke="none" />
                
                <Area 
                  type="monotone" 
                  dataKey="2019" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#color2019)"
                  name="2019"
                />
                <Area 
                  type="monotone" 
                  dataKey="2020" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#color2020)"
                  name="2020"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6">
             <div className="flex items-center gap-2 text-xs text-slate-500 italic">
               <div className="w-4 h-4 bg-slate-100 rounded" />
               <span>Lockdown Period (Mar-May)</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
