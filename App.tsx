import React, { useState, useEffect } from 'react';
import { Transaction, AppView, UserSettings } from './types';
import { getStoredTransactions, saveTransactions, getStoredSettings, saveSettings } from './services/storageService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Auth from './components/Auth';
import AIAdvisor from './components/AIAdvisor';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Auth State
  const [isLocked, setIsLocked] = useState(false); // Start unlocked, check effect below
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadedTransactions = getStoredTransactions();
    setTransactions(loadedTransactions);
    
    // Check if lock needed
    if (settings.hasPasswordProtection && settings.passwordPin) {
      setIsLocked(true);
    }
    setIsAuthChecked(true);
  }, []);

  // Save transactions when changed
  useEffect(() => {
    if (isAuthChecked) {
       saveTransactions(transactions);
    }
  }, [transactions, isAuthChecked]);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-gray-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        language={settings.language}
      />
      
      <main className="flex-1 w-full relative">
        <div className="h-full overflow-y-auto">
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              transactions={transactions}
              language={settings.language}
              currency={settings.currency}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}
          
          {currentView === AppView.TRANSACTIONS && (
             <Dashboard 
               transactions={transactions}
               language={settings.language}
               currency={settings.currency}
               onAddTransaction={handleAddTransaction}
               onDeleteTransaction={handleDeleteTransaction}
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
      </main>
    </div>
  );
}

export default App;
