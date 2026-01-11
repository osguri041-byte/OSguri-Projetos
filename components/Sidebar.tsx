import React from 'react';
import { LayoutDashboard, Receipt, BarChart3, Settings, Bot, Wallet } from 'lucide-react';
import { AppView, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  language: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, language }) => {
  const t = TRANSLATIONS[language];

  const menuItems = [
    { id: AppView.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
    { id: AppView.TRANSACTIONS, label: t.transactions, icon: Receipt },
    { id: AppView.REPORTS, label: t.reports, icon: BarChart3 },
    { id: AppView.AI_ADVISOR, label: "AI", icon: Bot }, // Shortened label for mobile
    { id: AppView.SETTINGS, label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex bg-white border-r border-gray-200 w-64 flex-shrink-0 h-screen sticky top-0 z-30 flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">DinDin</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon 
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
                />
                <span>{item.id === AppView.AI_ADVISOR ? t.aiAdvisor : item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
            <p className="text-xs font-medium opacity-80 mb-1">PRO Status</p>
            <p className="text-sm font-bold">DinDin Free</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex justify-around items-center px-2 py-2">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[64px]
                  ${isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50' : ''}`}>
                  <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium mt-1 truncate max-w-[60px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
