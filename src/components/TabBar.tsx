import React from 'react';
import { LayoutDashboard, Calendar, CircleDot, Compass, BookOpen } from 'lucide-react';
import { TabType } from '../types';

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onChangeTab }) => {
  const tabs: Array<{ id: TabType; label: string; arabic: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', arabic: 'الرئيسية', icon: LayoutDashboard },
    { id: 'prayers', label: 'Prayers & Calendar', arabic: 'الصلوات', icon: Calendar },
    { id: 'tasbih', label: 'Tasbih Counter', arabic: 'المسبحة', icon: CircleDot },
    { id: 'qibla', label: 'Qibla Compass', arabic: 'القبلة', icon: Compass },
    { id: 'duas', label: 'Authentic Duas', arabic: 'الأدعية', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070D1E]/95 backdrop-blur-lg border-t border-amber-500/20 shadow-2xl shadow-black/80">
      <div className="max-w-3xl mx-auto px-2 flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-1 px-1 flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-[1px] w-10 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-amber-400/10 shadow-sm shadow-amber-500/20 text-amber-300 scale-105'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight leading-none mt-0.5 text-center truncate max-w-[80px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
