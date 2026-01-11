import React, { useMemo, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Search, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, Language, Currency } from '../types';
import { TRANSLATIONS, CURRENCY_SYMBOLS } from '../constants';
import TransactionForm from './TransactionForm';

interface DashboardProps {
  transactions: Transaction[];
  language: Language;
  currency: Currency;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  language, 
  currency, 
  onAddTransaction,
  onDeleteTransaction
}) => {
  const t = TRANSLATIONS[language];
  const symbol = CURRENCY_SYMBOLS[currency];
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const summary = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.income += curr.amount;
      } else {
        acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = summary.income - summary.expense;

  const filteredTransactions = transactions
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatMoney = (val: number) => {
    return val.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t.dashboard}</h2>
          <p className="text-xs md:text-sm text-gray-500 capitalize">
            {new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {/* Desktop Add Button */}
        <button 
          onClick={() => setShowAddForm(true)}
          className="hidden md:flex bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-emerald-200 transition-all active:scale-95 items-center gap-2"
        >
          <Plus size={20} />
          {t.addTransaction}
        </button>
      </div>

      {/* Mobile Horizontal Scroll Summary Cards */}
      <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 snap-x md:grid md:grid-cols-3 md:pb-0 md:mx-0 md:px-0">
        <div className="min-w-[85vw] md:min-w-0 snap-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={100} />
          </div>
          <div className="flex items-center gap-3 mb-4 z-10">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Wallet size={24} />
            </div>
            <span className="text-gray-500 font-medium">{t.balance}</span>
          </div>
          <span className={`text-3xl font-bold z-10 ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
            {symbol} {formatMoney(balance)}
          </span>
        </div>

        <div className="min-w-[85vw] md:min-w-0 snap-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <ArrowUpCircle size={24} />
            </div>
            <span className="text-gray-500 font-medium">{t.income}</span>
          </div>
          <span className="text-3xl font-bold text-green-600">
            + {symbol} {formatMoney(summary.income)}
          </span>
        </div>

        <div className="min-w-[85vw] md:min-w-0 snap-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <ArrowDownCircle size={24} />
            </div>
            <span className="text-gray-500 font-medium">{t.expense}</span>
          </div>
          <span className="text-3xl font-bold text-red-600">
            - {symbol} {formatMoney(summary.expense)}
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800 w-full sm:w-auto">{t.transactions}</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p>{t.noTransactions}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">{t.description}</th>
                    <th className="px-6 py-4">{t.category}</th>
                    <th className="px-6 py-4">{t.date}</th>
                    <th className="px-6 py-4 text-right">{t.amount}</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {tx.description}
                        {tx.isRecurring && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Recurring</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        <span className="px-2 py-1 rounded-md bg-gray-100">{tx.category}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'} {symbol}{formatMoney(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                         <span>{tx.category}</span>
                         <span>•</span>
                         <span>{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                       <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'} {symbol}{formatMoney(tx.amount)}
                       </p>
                       {tx.isRecurring && <p className="text-[10px] text-blue-500 bg-blue-50 inline-block px-1 rounded">Recurring</p>}
                    </div>
                    <button 
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="text-gray-300 hover:text-red-500 p-2 -mr-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setShowAddForm(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center z-30 active:scale-90 transition-transform"
        aria-label={t.addTransaction}
      >
        <Plus size={28} />
      </button>

      {showAddForm && (
        <TransactionForm 
          language={language}
          onSave={(t) => {
            onAddTransaction(t);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

    </div>
  );
};

export default Dashboard;
