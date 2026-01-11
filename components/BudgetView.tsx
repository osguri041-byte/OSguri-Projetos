import React, { useState, useMemo } from 'react';
import { Plus, X, Check, Trash2, AlertTriangle, PiggyBank } from 'lucide-react';
import { Transaction, Budget, Language, Currency } from '../types';
import { TRANSLATIONS, CURRENCY_SYMBOLS, CATEGORIES } from '../constants';

interface BudgetViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
  language: Language;
  currency: Currency;
}

const BudgetView: React.FC<BudgetViewProps> = ({ 
  transactions, 
  budgets, 
  onAddBudget, 
  onDeleteBudget, 
  language, 
  currency 
}) => {
  const t = TRANSLATIONS[language];
  const symbol = CURRENCY_SYMBOLS[currency];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // Calculate spending per budget for the current month
  const budgetStatus = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map(budget => {
      const spent = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return (
            tx.type === 'expense' &&
            tx.category === budget.category &&
            txDate.getMonth() === currentMonth &&
            txDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      const percentage = Math.min((spent / budget.limit) * 100, 100);
      const isOverBudget = spent > budget.limit;

      return { ...budget, spent, percentage, isOverBudget };
    });
  }, [budgets, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetCategory || !newBudgetLimit) return;
    
    // Prevent duplicate categories
    if (budgets.some(b => b.category === newBudgetCategory)) {
        alert("Category already exists in budget");
        return;
    }

    onAddBudget({
      category: newBudgetCategory,
      limit: parseFloat(newBudgetLimit),
    });
    setNewBudgetCategory('');
    setNewBudgetLimit('');
    setShowAddForm(false);
  };

  const formatMoney = (val: number) => {
    return val.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{t.budget}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">{t.addBudget}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetStatus.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
            <PiggyBank size={48} className="mb-4 opacity-50" />
            <p>{t.noBudgets}</p>
          </div>
        ) : (
          budgetStatus.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col transition-colors relative overflow-hidden group">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                   <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                     {item.category}
                   </span>
                   {item.isOverBudget && (
                       <div className="flex items-center gap-1 text-red-500 text-xs font-bold animate-pulse">
                           <AlertTriangle size={12} />
                           {t.overBudget}
                       </div>
                   )}
                </div>
                <button 
                  onClick={() => onDeleteBudget(item.id)}
                  className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-end">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">
                        {symbol} {formatMoney(item.spent)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        / {formatMoney(item.limit)}
                    </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-4 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${getProgressBarColor(item.percentage)} transition-all duration-500`} 
                        style={{ width: `${item.percentage}%` }}
                    />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                  <span className={`${item.isOverBudget ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.percentage.toFixed(0)}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                      {t.remaining}: <span className="font-medium text-gray-800 dark:text-gray-200">{symbol} {formatMoney(Math.max(item.limit - item.spent, 0))}</span>
                  </span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add Budget Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0" onClick={() => setShowAddForm(false)}></div>
            <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up md:animate-fade-in relative z-10 transition-colors">
                
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t.addBudget}</h2>
                    <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.category}</label>
                        <select
                            required
                            value={newBudgetCategory}
                            onChange={(e) => setNewBudgetCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                        >
                            <option value=""></option>
                            {CATEGORIES.expense.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.limit}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-bold">{symbol}</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                required
                                value={newBudgetLimit}
                                onChange={(e) => setNewBudgetLimit(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg"
                        >
                            <Check size={24} />
                            {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default BudgetView;