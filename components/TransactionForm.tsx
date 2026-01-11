import React, { useState } from 'react';
import { X, Check, MoreHorizontal } from 'lucide-react';
import { Transaction, TransactionType, Language, CategoryItem } from '../types';
import { TRANSLATIONS, AVAILABLE_ICONS } from '../constants';
import * as Icons from 'lucide-react';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  language: Language;
  categories: CategoryItem[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onCancel, language, categories }) => {
  const t = TRANSLATIONS[language];
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const availableCategories = categories.filter(c => c.type === type || c.type === 'both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !categoryName) return;

    onSave({
      description,
      amount: parseFloat(amount),
      type,
      category: categoryName,
      date: new Date(date).toISOString(),
      isRecurring
    });
  };

  const getIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = Icons[iconName] || MoreHorizontal;
    return Icon;
  }

  const selectedCategoryObj = categories.find(c => c.name === categoryName);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onCancel}></div>
      
      <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up md:animate-fade-in relative z-10 max-h-[90vh] overflow-y-auto transition-colors">
        
        {/* Mobile Pull Indicator */}
        <div className="md:hidden flex justify-center pt-3 pb-1" onClick={onCancel}>
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t.addTransaction}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-8">
          
          {/* Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryName(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                type === 'expense' ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryName(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                type === 'income' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {t.income}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.amount}</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-4xl font-bold text-gray-800 dark:text-white border-b-2 border-gray-200 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none py-2 bg-transparent transition-colors placeholder-gray-300 dark:placeholder-slate-600"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.description}</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.category}</label>
              
              {/* Custom Category Dropdown Trigger */}
              <div 
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors min-h-[48px]"
              >
                {selectedCategoryObj ? (
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${selectedCategoryObj.color}`}></div>
                    <span>{selectedCategoryObj.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400"></span>
                )}
                <div className="text-gray-400 text-xs">▼</div>
              </div>

              {/* Custom Dropdown List */}
              {isCategoryDropdownOpen && (
                 <div className="absolute z-50 mt-1 w-[85%] md:w-[200px] bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {availableCategories.map(cat => {
                        const Icon = getIcon(cat.icon);
                        return (
                            <div 
                                key={cat.id}
                                onClick={() => {
                                    setCategoryName(cat.name);
                                    setIsCategoryDropdownOpen(false);
                                }}
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-slate-700 last:border-0"
                            >
                                <div className={`p-1.5 rounded-lg ${cat.color} text-white`}>
                                    <Icon size={14} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                            </div>
                        )
                    })}
                 </div>
              )}

              {/* Hidden select for html5 validation if needed, or just state management */}
              <input type="hidden" required value={categoryName} />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.date}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-gray-300 dark:border-slate-500 focus:ring-emerald-500 dark:focus:ring-emerald-400 dark:bg-slate-700"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.recurring} <span className="text-gray-400 dark:text-gray-500 font-normal">(Monthly)</span></label>
          </div>

          <div className="pt-2">
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
  );
};

export default TransactionForm;