import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Transaction, TransactionType, Language } from '../types';
import { CATEGORIES, TRANSLATIONS } from '../constants';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
  language: Language;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onCancel, language }) => {
  const t = TRANSLATIONS[language];
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;

    onSave({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date(date).toISOString(),
      isRecurring
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onCancel}></div>
      
      <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up md:animate-fade-in relative z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Mobile Pull Indicator */}
        <div className="md:hidden flex justify-center pt-3 pb-1" onClick={onCancel}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">{t.addTransaction}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-8">
          
          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.income}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t.amount}</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-4xl font-bold text-gray-800 border-b-2 border-gray-200 focus:border-emerald-500 outline-none py-2 bg-transparent transition-colors placeholder-gray-300"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t.description}</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t.category}</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white appearance-none"
              >
                <option value="">Select...</option>
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{t.date}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 bg-gray-50 p-3 rounded-xl">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">{t.recurring} <span className="text-gray-400 font-normal">(Monthly)</span></label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg"
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
