import React, { useState, useEffect } from 'react';
import { Transaction, AppView, UserSettings, Budget, CategoryItem } from './types';
import { getStoredTransactions, saveTransactions, getStoredSettings, saveSettings, getStoredBudgets, saveBudgets, getStoredCategories, saveCategories } from './services/storageService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Auth from './components/Auth';
import AIAdvisor from './components/AIAdvisor';
import BudgetView from './components/BudgetView';
import CategoryView from './components/CategoryView';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Auth State
  const [isLocked, setIsLocked] = useState(false); // Start unlocked, check effect below
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadedTransactions = getStoredTransactions();
    const loadedBudgets = getStoredBudgets();
    const loadedCategories = getStoredCategories();
    
    setTransactions(loadedTransactions);
    setBudgets(loadedBudgets);
    setCategories(loadedCategories);
    
    // Check if lock needed
    if (settings.hasPasswordProtection && settings.passwordPin) {
      setIsLocked(true);
    }
    setIsAuthChecked(true);
  }, []);

  // Theme Effect
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Save transactions when changed
  useEffect(() => {
    if (isAuthChecked) {
       saveTransactions(transactions);
    }
  }, [transactions, isAuthChecked]);

  // Save budgets when changed
  useEffect(() => {
    if (isAuthChecked) {
       saveBudgets(budgets);
    }
  }, [budgets, isAuthChecked]);

   // Save categories when changed
  useEffect(() => {
    if (isAuthChecked) {
       saveCategories(categories);
    }
  }, [categories, isAuthChecked]);

  // Save settings when changed
  useEffect(() => {
    if (isAuthChecked) {
      saveSettings(settings);
    }
  }, [settings, isAuthChecked]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const budget: Budget = {
      ...newBudget,
      id: crypto.randomUUID()
    };
    setBudgets(prev => [...prev, budget]);
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm('Delete this budget?')) {
      setBudgets(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAddCategory = (newCat: CategoryItem) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleUpdateCategory = (updatedCat: CategoryItem) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this category?')) {
       setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  if (!isAuthChecked) return null;

  if (isLocked) {
    return (
      <Auth 
        pin={settings.passwordPin} 
        language={settings.language}
        onSuccess={() => setIsLocked(false)} 
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        language={settings.language}
      />
      
      <main className="flex-1 w-full relative">
        <div className="h-full overflow-y-auto">
          {/* Animation Wrapper: key={currentView} triggers the animation on switch */}
          <div key={currentView} className="animate-fade-in h-full">
            {currentView === AppView.DASHBOARD && (
              <Dashboard 
                transactions={transactions}
                language={settings.language}
                currency={settings.currency}
                categories={categories}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            )}
            
            {currentView === AppView.BUDGET && (
               <BudgetView 
                 transactions={transactions}
                 budgets={budgets}
                 onAddBudget={handleAddBudget}
                 onDeleteBudget={handleDeleteBudget}
                 language={settings.language}
                 currency={settings.currency}
               />
            )}

            {currentView === AppView.CATEGORIES && (
              <CategoryView 
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                language={settings.language}
              />
            )}

            {currentView === AppView.REPORTS && (
              <div className="pb-20 md:pb-0">
                <Reports 
                  transactions={transactions}
                  language={settings.language}
                  currency={settings.currency}
                />
              </div>
            )}

            {currentView === AppView.AI_ADVISOR && (
              <div className="pb-20 md:pb-0">
                <AIAdvisor 
                  transactions={transactions}
                  language={settings.language}
                  currency={settings.currency}
                />
              </div>
            )}

            {currentView === AppView.SETTINGS && (
              <div className="pb-20 md:pb-0">
                <Settings 
                  settings={settings}
                  onUpdate={setSettings}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;