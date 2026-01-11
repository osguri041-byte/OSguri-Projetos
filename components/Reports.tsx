import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { Transaction, Language, Currency } from '../types';
import { TRANSLATIONS, CURRENCY_SYMBOLS } from '../constants';

interface ReportsProps {
  transactions: Transaction[];
  language: Language;
  currency: Currency;
}

const RED_COLORS = ['#ef4444', '#f87171', '#fca5a5', '#b91c1c', '#dc2626', '#991b1b', '#7f1d1d'];
const GREEN_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#065f46', '#064e3b'];
const MIXED_COLORS = ['#10b981', '#ef4444'];

type PeriodType = 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
type ChartView = 'expense' | 'income' | 'period';

const Reports: React.FC<ReportsProps> = ({ transactions, language, currency }) => {
  const t = TRANSLATIONS[language];
  const symbol = CURRENCY_SYMBOLS[currency];
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('thisMonth');
  const [activeChartTab, setActiveChartTab] = useState<ChartView>('expense');

  // Filter Transactions based on Period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      switch (selectedPeriod) {
        case 'thisMonth':
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        case 'lastMonth':
          const lastMonthDate = new Date(now);
          lastMonthDate.setMonth(now.getMonth() - 1);
          return txDate.getMonth() === lastMonthDate.getMonth() && txDate.getFullYear() === lastMonthDate.getFullYear();
        case 'thisYear':
          return txDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  }, [transactions, selectedPeriod]);

  // Calculate Summaries
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });

    return { income, expense };
  }, [filteredTransactions]);

  // Prepare Data for Sparklines (Small area charts)
  const getSparklineData = (type: 'income' | 'expense') => {
    // Group by day for smooth line
    const grouped = filteredTransactions
      .filter(t => t.type === type)
      .reduce((acc, curr) => {
        const dateKey = new Date(curr.date).toLocaleDateString();
        const existing = acc.find(i => i.date === dateKey);
        if (existing) existing.value += curr.amount;
        else acc.push({ date: dateKey, value: curr.amount, rawDate: new Date(curr.date) });
        return acc;
      }, [] as { date: string, value: number, rawDate: Date }[])
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    
    // If no data, return flat line
    if (grouped.length === 0) return [{ value: 0 }, { value: 0 }];
    return grouped;
  };

  // Prepare Pie Chart Data (Category breakdown)
  const pieData = useMemo(() => {
    if (activeChartTab === 'period') return [];
    
    const targetType = activeChartTab; // 'expense' or 'income'
    
    return filteredTransactions
      .filter(tx => tx.type === targetType)
      .reduce((acc, curr) => {
        const existing = acc.find(i => i.name === curr.category);
        if (existing) {
          existing.value += curr.amount;
        } else {
          acc.push({ name: curr.category, value: curr.amount });
        }
        return acc;
      }, [] as { name: string; value: number }[])
      .sort((a, b) => b.value - a.value);

  }, [filteredTransactions, activeChartTab]);

  // Prepare Bar Chart Data (Jan-Dec for "By Period")
  const barData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
       const d = new Date();
       d.setMonth(i);
       return d.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'short' });
    });

    // Initialize all months
    const data = months.map(m => ({ name: m, income: 0, expense: 0 }));

    // If period is "thisYear" or "custom", we map to Jan-Dec of the transaction year.
    // If "thisMonth", it will populate only that month, which is fine.
    
    filteredTransactions.forEach(tx => {
       const txDate = new Date(tx.date);
       const monthIndex = txDate.getMonth();
       if (tx.type === 'income') {
         data[monthIndex].income += tx.amount;
       } else {
         data[monthIndex].expense += tx.amount;
       }
    });

    return data;
  }, [filteredTransactions, language]);

  const activeColors = activeChartTab === 'income' ? GREEN_COLORS : RED_COLORS;

  const formatMoney = (val: number) => {
    return val.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      
      {/* 1. Top Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{t.reports}</h2>
        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
           {(['thisMonth', 'lastMonth', 'thisYear'] as const).map((period) => (
             <button
               key={period}
               onClick={() => setSelectedPeriod(period)}
               className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                 selectedPeriod === period 
                 ? 'bg-white dark:bg-slate-600 text-gray-800 dark:text-white shadow-sm' 
                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
               }`}
             >
               {t[period]}
             </button>
           ))}
        </div>
      </div>

      {/* 2. Summary Cards with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Card */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/20 relative overflow-hidden transition-colors">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight size={18} />
                   </div>
                   <span className="text-emerald-800 dark:text-emerald-300 font-medium text-sm uppercase tracking-wide">{t.income}</span>
                </div>
                <h3 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{symbol} {formatMoney(summary.income)}</h3>
              </div>
           </div>
           {/* Mini Chart */}
           <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getSparklineData('income')}>
                   <defs>
                     <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Expense Card */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/20 relative overflow-hidden transition-colors">
           <div className="flex justify-between items-start z-10 relative">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                      <ArrowDownRight size={18} />
                   </div>
                   <span className="text-red-800 dark:text-red-300 font-medium text-sm uppercase tracking-wide">{t.expense}</span>
                </div>
                <h3 className="text-3xl font-bold text-red-900 dark:text-red-100">{symbol} {formatMoney(summary.expense)}</h3>
              </div>
           </div>
           {/* Mini Chart */}
           <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getSparklineData('expense')}>
                   <defs>
                     <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 3. Main Chart Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors">
         
         {/* Sub Tabs */}
         <div className="flex justify-center mb-8">
            <div className="flex bg-gray-50 dark:bg-slate-700/50 p-1 rounded-xl w-full max-w-lg">
                <button 
                   onClick={() => setActiveChartTab('expense')}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeChartTab === 'expense' ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                   {t.expense}
                </button>
                <button 
                   onClick={() => setActiveChartTab('income')}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeChartTab === 'income' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                   {t.income}
                </button>
                <button 
                   onClick={() => setActiveChartTab('period')}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeChartTab === 'period' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                   {t.byPeriod}
                </button>
            </div>
         </div>

         {/* Chart Rendering */}
         <div className="h-[350px] w-full">
            {(activeChartTab === 'expense' || activeChartTab === 'income') && (
               pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80} // Donut style
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip 
                         formatter={(value: number) => `${symbol} ${value.toFixed(2)}`}
                         contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                         itemStyle={{color: '#374151', fontWeight: 600}}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieChart size={48} className="mb-2 opacity-20" />
                    <p>{t.noTransactions}</p>
                  </div>
               )
            )}

            {activeChartTab === 'period' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc', opacity: 0.4}}
                      formatter={(value: number) => `${symbol} ${value.toFixed(2)}`}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                    <Bar dataKey="income" name={t.income} fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="expense" name={t.expense} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
            )}
         </div>

      </div>
    </div>
  );
};

export default Reports;