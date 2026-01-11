import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Search, Trash2, Calendar, Filter, X, MoreHorizontal, Mic, MicOff, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Transaction, Language, Currency, CategoryItem, TransactionType } from '../types';
import { TRANSLATIONS, CURRENCY_SYMBOLS, DEFAULT_CATEGORIES_LIST } from '../constants';
import TransactionForm from './TransactionForm';

interface DashboardProps {
  transactions: Transaction[];
  language: Language;
  currency: Currency;
  categories?: CategoryItem[]; 
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

type PeriodFilter = 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom' | 'all';
type TypeFilter = 'all' | 'income' | 'expense';

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  language, 
  currency, 
  categories = DEFAULT_CATEGORIES_LIST,
  onAddTransaction,
  onDeleteTransaction
}) => {
  const t = TRANSLATIONS[language];
  const symbol = CURRENCY_SYMBOLS[currency];
  
  // State
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceData, setVoiceData] = useState<{
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
  } | null>(null);
  const recognitionRef = useRef<any>(null);

  // Advanced Filters State
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('thisMonth');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // --- Voice Logic ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pt-BR'; // Forcing PT-BR as requested

        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const currentText = finalTranscript || interimTranscript;
            setVoiceTranscript(currentText);
            parseVoiceCommand(currentText);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
            if (isListening) {
                // Determine if we should restart or if it stopped naturally
                // For now, we rely on the user button to stop or "Salvar" command
                // recognitionRef.current.start(); 
            }
        };
    }
  }, [categories]); // Re-create if categories change to update parsing context

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        setVoiceData(null);
        setVoiceTranscript('');
    } else {
        try {
            recognitionRef.current?.start();
            setIsListening(true);
            setVoiceTranscript('Ouvindo... (Ex: "Despesa de 50 reais no mercado categoria alimentação")');
        } catch (e) {
            console.error(e);
            alert("Erro ao iniciar microfone. Verifique as permissões.");
        }
    }
  };

  const parseVoiceCommand = (text: string) => {
      const lower = text.toLowerCase();
      
      // 1. Detect "Salvar" command
      if (lower.includes('salvar') || lower.includes('confirmar') || lower.includes('enviar')) {
          if (voiceData && voiceData.amount > 0 && voiceData.description) {
              onAddTransaction({
                  ...voiceData,
                  date: new Date().toISOString(),
                  isRecurring: false
              });
              recognitionRef.current?.stop();
              setIsListening(false);
              setVoiceData(null);
              setVoiceTranscript('');
              // Play a success sound or vibrate could be added here
              if (navigator.vibrate) navigator.vibrate(200);
              return;
          }
      }

      // 2. Parse Type
      let type: TransactionType = 'expense';
      if (lower.includes('receita') || lower.includes('ganhei') || lower.includes('entrada') || lower.includes('recebi')) {
          type = 'income';
      }

      // 3. Parse Amount
      // Look for numbers. Handle patterns like "50 reais", "50,50", "cinquenta" (basic digits mainly)
      const numberPattern = /(\d+([.,]\d{1,2})?)/g;
      const matches = text.match(numberPattern);
      let amount = 0;
      if (matches) {
          // Take the last number found as likely the amount if multiple appear, or the first. usually first.
          // Let's assume the largest number or the one followed by 'reais' logic, but simple first match is okay for now.
          const numStr = matches[0].replace(',', '.');
          amount = parseFloat(numStr);
      }

      // 4. Parse Category
      let category = '';
      // Find the category name in the spoken text
      const foundCat = categories.find(c => lower.includes(c.name.toLowerCase()));
      if (foundCat) {
          category = foundCat.name;
      } else {
          // Default category fallback
          category = type === 'income' ? 'Salário' : 'Outros';
      }

      // 5. Parse Description
      // Everything else that isn't the command keywords. 
      // A simple heuristic: remove "despesa", "receita", "reais", category name, "de", "no", "na"
      let description = text;
      const removeWords = [
          'despesa', 'receita', 'gastei', 'ganhei', 'adicionar', 'nova', 'transação',
          'valor', 'de', 'do', 'da', 'no', 'na', 'em', 'reais', 'real', 'categoria',
          'salvar', 'confirmar', category.toLowerCase(), type === 'income' ? 'entrada' : 'saída'
      ];
      
      // Remove the specific amount string found
      if (matches) description = description.replace(matches[0], '');
      
      removeWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          description = description.replace(regex, '');
      });

      description = description.replace(/\s+/g, ' ').trim();
      // If description became empty, use a placeholder
      if (description.length < 2) description = "Nova Transação";
      
      // Capitalize first letter
      description = description.charAt(0).toUpperCase() + description.slice(1);

      setVoiceData({ type, amount, category, description });
  };

  // --- Filter Logic ---
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(tx => {
      // 1. Text Search
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Type Filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // 3. Category Filter
      if (categoryFilter && tx.category !== categoryFilter) return false;

      // 4. Period Filter
      const txDate = new Date(tx.date);
      
      switch (periodFilter) {
        case 'thisMonth':
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        case 'lastMonth':
          const lastMonthDate = new Date(now);
          lastMonthDate.setMonth(now.getMonth() - 1);
          // Handle edge case where month rollover changes year (e.g. Jan -> Dec prev year)
          // The Date object handles 'setMonth(-1)' correctly by rolling back year
          return txDate.getMonth() === lastMonthDate.getMonth() && txDate.getFullYear() === lastMonthDate.getFullYear();
        case 'thisYear':
          return txDate.getFullYear() === currentYear;
        case 'custom':
          if (customStartDate && customEndDate) {
            // Reset times to ensure inclusive comparison
            const start = new Date(customStartDate);
            start.setHours(0,0,0,0);
            const end = new Date(customEndDate);
            end.setHours(23,59,59,999);
            const target = new Date(tx.date);
            return target >= start && target <= end;
          }
          return true; // If dates not selected yet, show all or nothing? Showing all for now
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, periodFilter, typeFilter, categoryFilter, customStartDate, customEndDate]);

  // Calculate Summary based on FILTERED transactions (Dynamic Dashboard)
  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.income += curr.amount;
      } else {
        acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const balance = summary.income - summary.expense;

  const formatMoney = (val: number) => {
    return val.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getCategoryDetails = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return { color: 'bg-gray-100 text-gray-600', icon: MoreHorizontal };
    
    // @ts-ignore
    const Icon = Icons[cat.icon] || MoreHorizontal;
    return { color: cat.color, icon: Icon };
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-5 md:space-y-8 pb-24 md:pb-8 relative">
      
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white transition-colors">{t.dashboard}</h2>
          <p className="text-[10px] md:text-sm text-gray-500 dark:text-gray-400 capitalize">
            {new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Voice Command Button */}
            <button
                onClick={toggleListening}
                className={`p-2 md:p-2.5 rounded-xl font-medium shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                    isListening 
                    ? 'bg-red-500 animate-pulse text-white shadow-red-200' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                }`}
                title="Comando de Voz"
            >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Unified Button */}
            <button 
            onClick={() => setShowAddForm(true)}
            className="flex bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 items-center gap-2"
            >
            <Plus size={20} />
            <span className="hidden md:inline">{t.addTransaction}</span>
            </button>
        </div>
      </div>

      {/* Voice Recognition Modal / Overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative border border-white/10">
                 <button 
                   onClick={toggleListening}
                   className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                 >
                     <X size={24} />
                 </button>

                 <div className="flex flex-col items-center text-center space-y-4">
                     <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center animate-pulse">
                         <Mic size={32} />
                     </div>
                     
                     <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ouvindo...</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 italic min-h-[40px]">
                         "{voiceTranscript || 'Diga algo como: "Nova despesa de 50 reais no Mercado categoria Alimentação e depois diga Salvar"'}"
                     </p>

                     {/* Live Parsing Result Preview */}
                     <div className="w-full bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2 text-left">
                         <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-600 pb-2">
                             <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">{t.type}</span>
                             <span className={`text-sm font-bold capitalize ${voiceData?.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                 {voiceData?.type === 'income' ? t.income : t.expense}
                             </span>
                         </div>
                         <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-600 pb-2">
                             <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">{t.amount}</span>
                             <span className="text-lg font-bold text-gray-800 dark:text-white">
                                 {symbol} {formatMoney(voiceData?.amount || 0)}
                             </span>
                         </div>
                         <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-600 pb-2">
                             <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">{t.category}</span>
                             <div className="flex items-center gap-2">
                                 {voiceData?.category && (() => {
                                     const details = getCategoryDetails(voiceData.category);
                                     const Icon = details.icon;
                                     return (
                                        <div className={`p-1 rounded ${details.color} text-white`}>
                                            <Icon size={12} />
                                        </div>
                                     );
                                 })()}
                                 <span className="text-sm text-gray-800 dark:text-white">
                                    {voiceData?.category || '-'}
                                 </span>
                             </div>
                         </div>
                         <div className="flex justify-between items-center pt-1">
                             <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">{t.description}</span>
                             <span className="text-sm text-gray-800 dark:text-white truncate max-w-[150px]">
                                 {voiceData?.description || '-'}
                             </span>
                         </div>
                     </div>

                     <div className="w-full pt-2">
                         <button
                            onClick={() => parseVoiceCommand("salvar")}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                         >
                            <Check size={20} />
                            {t.save} (ou diga "Salvar")
                         </button>
                     </div>
                 </div>
             </div>
        </div>
      )}

      {/* MOBILE UNIFIED CARD */}
      <div className="md:hidden bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl p-4 text-white shadow-xl shadow-emerald-900/20 mb-3 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Wallet size={100} />
        </div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-0.5 opacity-90">
             <Wallet size={12} />
             <p className="text-[10px] font-medium tracking-wide">{t.balance}</p>
          </div>
          <h3 className="text-2xl font-bold mb-4 tracking-tight">{symbol} {formatMoney(balance)}</h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-xl p-2 backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-1 mb-0.5 text-emerald-300">
                 <ArrowUpCircle size={10} />
                 <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">{t.income}</span>
              </div>
              <p className="text-sm font-semibold">{symbol} {formatMoney(summary.income)}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-2 backdrop-blur-sm border border-white/5">
              <div className="flex items-center gap-1 mb-0.5 text-red-300">
                 <ArrowDownCircle size={10} />
                 <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">{t.expense}</span>
              </div>
              <p className="text-sm font-semibold">{symbol} {formatMoney(summary.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP CARDS */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Wallet size={24} />
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">{t.balance}</span>
          </div>
          <span className={`text-2xl md:text-3xl font-bold ${balance >= 0 ? 'text-gray-800 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
            {symbol} {formatMoney(balance)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <ArrowUpCircle size={24} />
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">{t.income}</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            + {symbol} {formatMoney(summary.income)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <ArrowDownCircle size={24} />
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">{t.expense}</span>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
            - {symbol} {formatMoney(summary.expense)}
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        
        {/* Top Controls Container */}
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-700 space-y-4">
            
            {/* Title & Integrated Search/Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white w-full sm:w-auto">{t.transactions}</h3>
                
                {/* Search Bar with Embedded Filter Button */}
                <div className="flex items-center w-full sm:w-auto bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 md:py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all shadow-sm">
                    <Search className="text-gray-400 w-4 h-4 mr-2 flex-shrink-0" />
                    <input 
                        type="text" 
                        placeholder={t.search} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs md:text-sm text-gray-700 dark:text-white placeholder-gray-400 w-full sm:min-w-[200px]"
                    />
                    
                    {/* Vertical Divider */}
                    <div className="h-4 w-px bg-gray-200 dark:bg-slate-600 mx-2 flex-shrink-0"></div>
                    
                    {/* Filter Toggle Button */}
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 text-xs md:text-sm font-medium transition-colors flex-shrink-0 px-2 py-0.5 rounded-md ${
                            showFilters 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600'
                        }`}
                    >
                        <Filter size={14} />
                        <span className="hidden xs:inline">{t.filters}</span>
                    </button>
                </div>
            </div>

            {/* Advanced Filters Section (Collapsible) */}
            {showFilters && (
                <div className="flex flex-col gap-3 pt-2 animate-fade-in bg-gray-50/50 dark:bg-slate-700/20 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50">
                    <div className="flex flex-wrap items-end gap-4">
                        
                        {/* 1. Period Tabs */}
                        <div className="flex-1 min-w-[280px]">
                           <label className="block text-[10px] uppercase text-gray-500 dark:text-slate-400 font-bold mb-2">{t.byPeriod}</label>
                           <div className="flex gap-2 overflow-x-auto no-scrollbar">
                               {(['thisMonth', 'lastMonth', 'thisYear', 'custom', 'all'] as const).map(period => (
                                   <button
                                     key={period}
                                     onClick={() => setPeriodFilter(period)}
                                     className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                         periodFilter === period
                                         ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                         : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
                                     }`}
                                   >
                                       {t[period] || period}
                                   </button>
                               ))}
                           </div>
                        </div>

                        {/* 2. Type Tabs */}
                        <div>
                            <label className="block text-[10px] uppercase text-gray-500 dark:text-slate-400 font-bold mb-2">{t.type}</label>
                            <div className="flex gap-2">
                                {(['all', 'income', 'expense'] as const).map(type => (
                                    <button
                                      key={type}
                                      onClick={() => setTypeFilter(type)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                                          typeFilter === type
                                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                          : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600'
                                      }`}
                                    >
                                        {t[type] || type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Category Dropdown */}
                        <div>
                            <label className="block text-[10px] uppercase text-gray-500 dark:text-slate-400 font-bold mb-2">{t.category}</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full md:w-auto min-w-[150px] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">{t.allCategories}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 4. Custom Date Range (Only if custom is selected) */}
                    {periodFilter === 'custom' && (
                        <div className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-slate-700/50 p-2 rounded-lg border border-gray-100 dark:border-slate-600/50 mt-1">
                            <div className="flex-1">
                                <label className="block text-[10px] uppercase text-gray-500 dark:text-slate-400 font-bold mb-1">{t.startDate}</label>
                                <input 
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] uppercase text-gray-500 dark:text-slate-400 font-bold mb-1">{t.endDate}</label>
                                <input 
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-2 py-1 rounded border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-xs outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center">
            <Calendar size={32} className="mb-3 opacity-50" />
            <p className="text-sm">{t.noTransactions}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">{t.description}</th>
                    <th className="px-6 py-4">{t.category}</th>
                    <th className="px-6 py-4">{t.date}</th>
                    <th className="px-6 py-4 text-right">{t.amount}</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredTransactions.map((tx) => {
                     const { color, icon: Icon } = getCategoryDetails(tx.category);
                     return (
                      <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                          {tx.description}
                          {tx.isRecurring && <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Recurring</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white ${color}`}>
                            <Icon size={12} />
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'} {symbol}{formatMoney(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View - Ultra Compact */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
              {filteredTransactions.map((tx) => {
                const { color, icon: Icon } = getCategoryDetails(tx.category);
                return (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/20 active:bg-gray-100 dark:active:bg-slate-700/40 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 text-white ${color}`}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{tx.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                           <span>{tx.category}</span>
                           <span>•</span>
                           <span>{new Date(tx.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                         <p className={`text-xs font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '-'} {symbol}{formatMoney(tx.amount)}
                         </p>
                         {tx.isRecurring && <p className="text-[8px] text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 inline-block px-1 rounded">R</p>}
                      </div>
                      <button 
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-1.5 -mr-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showAddForm && (
        <TransactionForm 
          language={language}
          categories={categories}
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