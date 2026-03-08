import React, { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  BarChart2, 
  Table as TableIcon,
  PieChart as PieChartIcon,
  Search,
  Download,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  headers: string[];
  rows: any[];
  stats: Record<string, any>;
  cleaningLog: string[];
  columnTypes: Record<string, 'numeric' | 'categorical' | 'date'>;
}

const COLORS = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2', '#4F46E5', '#9333EA'];

export default function CsvAnalyzer() {
  const { setData } = useData();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const processFile = useCallback((file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Small timeout to ensure the loading state is visible and UI doesn't freeze immediately
    setTimeout(() => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const cleaningLog: string[] = [];
          let rows = results.data as any[];
          const headers = results.meta.fields || [];

          // 1. Basic Cleaning
          const initialCount = rows.length;
          rows = rows.filter(row => Object.values(row).some(val => val !== null && val !== ''));
          if (rows.length < initialCount) {
            cleaningLog.push(`Removed ${initialCount - rows.length} empty or null rows.`);
          }

          // 2. Column Type Inference & Analysis
          const columnTypes: Record<string, 'numeric' | 'categorical' | 'date'> = {};
          const stats: Record<string, any> = {};

          headers.forEach(header => {
            const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined);
            const numericValues = values.filter(v => typeof v === 'number');
            
            if (numericValues.length > values.length * 0.8) {
              columnTypes[header] = 'numeric';
              stats[header] = {
                mean: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2),
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                missing: rows.length - values.length
              };
            } else {
              // Check if it's a date
              const dateSample = values.find(v => typeof v === 'string' && !isNaN(Date.parse(v)));
              if (dateSample) {
                columnTypes[header] = 'date';
              } else {
                columnTypes[header] = 'categorical';
              }
              
              const uniqueValues = new Set(values);
              stats[header] = {
                unique: uniqueValues.size,
                missing: rows.length - values.length
              };
            }
          });

          cleaningLog.push(`Analyzed ${headers.length} columns and ${rows.length} rows.`);
          
          setAnalysis({ headers, rows, stats, cleaningLog, columnTypes });
          setIsLoading(false);

          // Map to ElectricityRecord format for the main dashboard if possible
          const mappedData = rows.map(row => ({
            date: row.Date || row.date || row.Month || row.month || '',
            state: row.State || row.state || row.Region || row.region || 'Unknown',
            region: row.Region || row.region || row.state || row.State || 'Unknown',
            consumption: Number(row.Consumption || row.consumption || row.Usage || row.usage || row.Value || row.value || 0)
          })).filter(r => r.date && r.consumption > 0);

          if (mappedData.length > 0) {
            setData(mappedData);
            cleaningLog.push(`Successfully mapped ${mappedData.length} records to dashboard format.`);
          }
        },
        error: (err) => {
          setError(`Error parsing CSV: ${err.message}`);
          setIsLoading(false);
        }
      });
    }, 800); // Artificial delay for better UX feedback
  }, [setData]);

  const handleExport = () => {
    if (!analysis) return;
    const csv = Papa.unparse(analysis.rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaned_data_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const filteredRows = useMemo(() => {
    if (!analysis) return [];
    if (!searchTerm) return analysis.rows.slice(0, 100);
    return analysis.rows.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).slice(0, 100);
  }, [analysis, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Upload Section */}
      <Card className={cn(
        "border-2 border-dashed transition-all duration-300 rounded-3xl overflow-hidden relative",
        isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-white",
        analysis || isLoading ? "h-auto" : "h-64 flex flex-col items-center justify-center"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      >
        <CardContent className={cn("p-8 text-center", (analysis || isLoading) ? "flex flex-row items-center justify-between gap-8" : "")}>
          <div className={cn("flex flex-col items-center", (analysis || isLoading) ? "flex-row gap-4" : "")}>
            <div className={cn(
              "p-4 rounded-2xl mb-4 transition-all duration-500",
              isLoading ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-blue-100 text-blue-600"
            )}>
              {isLoading ? <Activity className="animate-spin" size={32} /> : <Upload size={32} />}
            </div>
            <div className={(analysis || isLoading) ? "text-left" : ""}>
              <h3 className="text-lg font-bold text-slate-900">
                {isLoading ? "Processing Data..." : analysis ? "Data Loaded Successfully" : "Upload your CSV Data"}
              </h3>
              <p className="text-sm text-slate-500">
                {isLoading ? "Running automated cleaning and analysis..." : analysis ? `Currently analyzing ${analysis.rows.length} records` : "Drag and drop your file here or click to browse"}
              </p>
            </div>
          </div>
          
          {!analysis && !isLoading && (
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
          )}

          {analysis && !isLoading && (
            <div className="flex gap-3">
              <button 
                onClick={() => setAnalysis(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
              >
                Upload New
              </button>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-8 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-none shadow-lg bg-white rounded-3xl overflow-hidden animate-pulse">
              <div className="h-16 bg-slate-50 border-b border-slate-100" />
              <CardContent className="p-8 space-y-4">
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
                <div className="h-32 bg-slate-50 rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analysis && !isLoading && (
        <Tabs defaultValue="visuals" className="space-y-8">
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="visuals" className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
                <BarChart2 size={16} className="mr-2" /> Visuals
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
                <TableIcon size={16} className="mr-2" /> Data Table
              </TabsTrigger>
              <TabsTrigger value="cleaning" className="rounded-xl data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
                <CheckCircle2 size={16} className="mr-2" /> Cleaning Log
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visuals" className="space-y-8 outline-none">
            <div className="grid gap-8 md:grid-cols-2">
              {Object.entries(analysis.columnTypes).map(([col, type], idx) => {
                if (type === 'categorical') {
                  const counts: Record<string, number> = {};
                  analysis.rows.forEach(r => {
                    const val = String(r[col]);
                    counts[val] = (counts[val] || 0) + 1;
                  });
                  const chartData = Object.entries(counts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10);

                  return (
                    <Card key={col} className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                      <CardHeader className="p-6 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <PieChartIcon size={18} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">{col}</CardTitle>
                            <CardDescription>Top 10 Categories</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill={COLORS[idx % COLORS.length]} radius={[0, 4, 4, 0]} barSize={20} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                                  nameKey="name"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(idx + index) % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                if (type === 'numeric') {
                  return (
                    <Card key={col} className="border-none shadow-lg bg-white rounded-3xl overflow-hidden">
                      <CardHeader className="p-6 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <BarChart2 size={18} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">{col}</CardTitle>
                            <CardDescription>Distribution Analysis</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                         <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mean</p>
                               <p className="text-xl font-bold text-slate-900">{analysis.stats[col].mean}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Range</p>
                               <p className="text-xl font-bold text-slate-900">{analysis.stats[col].min} - {analysis.stats[col].max}</p>
                            </div>
                         </div>
                         <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={analysis.rows.slice(0, 20)}>
                                  <defs>
                                    <linearGradient id={`grad-${col}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                  <Area type="monotone" dataKey={col} stroke={COLORS[idx % COLORS.length]} fill={`url(#grad-${col})`} strokeWidth={2} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })}
            </div>
          </TabsContent>

          <TabsContent value="table" className="outline-none">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Raw Dataset</CardTitle>
                  <CardDescription>Showing first 100 records</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search data..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        {analysis.headers.map(h => (
                          <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          {analysis.headers.map(h => (
                            <td key={h} className="px-6 py-4 text-sm text-slate-600">{String(row[h])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleaning" className="outline-none">
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl font-bold">Data Processing Log</CardTitle>
                <CardDescription>Automated cleaning and transformation steps applied</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {analysis.cleaningLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="mt-0.5 text-emerald-500">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">{log}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
