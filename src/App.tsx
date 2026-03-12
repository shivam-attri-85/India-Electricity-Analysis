import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Scenario1 from '@/components/Scenario1';
import Scenario2 from '@/components/Scenario2';
import CsvAnalyzer from '@/components/CsvAnalyzer';
import SnapshotGallery from '@/components/SnapshotGallery';
import { Zap, FileText, ImageIcon, LayoutDashboard, Map } from 'lucide-react';
import { DataProvider } from '@/context/DataContext';
import { cn } from '@/lib/utils';

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('scenario1');

  const navItems = [
    { id: 'scenario1', label: 'National Trends', icon: LayoutDashboard },
    { id: 'scenario2', label: 'Regional Analysis', icon: Map },
    { id: 'csv-analysis', label: 'Data Explorer', icon: FileText },
    { id: 'snapshots', label: 'Snapshots', icon: ImageIcon },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 bg-white border-r border-slate-200 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Zap size={20} fill="currentColor" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">EnergyPulse</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-medium text-slate-400 mb-1">Status</p>
              <p className="text-sm font-semibold">Live Monitoring</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider text-slate-300">System Active</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Zap size={80} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="lg:hidden flex items-center gap-2">
             <Zap size={20} className="text-blue-600" />
             <span className="font-bold">EnergyPulse</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              India Electricity Analysis
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Mobile Nav */}
            <div className="lg:hidden mb-6">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200 rounded-xl p-1 h-12">
                <TabsTrigger value="scenario1" className="rounded-lg">Trends</TabsTrigger>
                <TabsTrigger value="scenario2" className="rounded-lg">Regions</TabsTrigger>
                <TabsTrigger value="csv-analysis" className="rounded-lg">Data</TabsTrigger>
                <TabsTrigger value="snapshots" className="rounded-lg">Shots</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="scenario1" className="space-y-8 outline-none">
              <Scenario1 />
            </TabsContent>

            <TabsContent value="scenario2" className="space-y-8 outline-none">
              <Scenario2 />
            </TabsContent>

            <TabsContent value="csv-analysis" className="space-y-8 outline-none">
              <CsvAnalyzer />
            </TabsContent>

            <TabsContent value="snapshots" className="space-y-8 outline-none">
              <SnapshotGallery />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
