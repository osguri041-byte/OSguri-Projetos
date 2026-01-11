import React, { useState, useRef } from 'react';
import { Globe, DollarSign, Crown, Download, Cloud, Lock, ShieldCheck, Moon, Sun, Database, Upload, Save } from 'lucide-react';
import { UserSettings, Language, Currency } from '../types';
import { TRANSLATIONS } from '../constants';
import { getStoredTransactions, getStoredBudgets, getStoredCategories, saveTransactions, saveBudgets, saveCategories, saveSettings } from '../services/storageService';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (newSettings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const t = TRANSLATIONS[settings.language];
  const [pinInput, setPinInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetPin = () => {
    if (pinInput.length === 4) {
      onUpdate({ ...settings, hasPasswordProtection: true, passwordPin: pinInput });
      setPinInput('');
    }
  };

  const handleDisablePin = () => {
    onUpdate({ ...settings, hasPasswordProtection: false, passwordPin: '' });
  };

  const handleCreateBackup = () => {
    const backupData = {
      transactions: getStoredTransactions(),
      budgets: getStoredBudgets(),
      categories: getStoredCategories(),
      settings: settings,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dindin_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update last backup date
    const now = new Date().toLocaleString(settings.language === 'pt' ? 'pt-BR' : 'en-US');
    onUpdate({ ...settings, lastBackupDate: now });
    
    alert(t.backupCreated);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.transactions) saveTransactions(data.transactions);
        if (data.budgets) saveBudgets(data.budgets);
        if (data.categories) saveCategories(data.categories);
        if (data.settings) saveSettings(data.settings);

        alert(t.backupRestored);
        window.location.reload(); // Reload to apply changes
      } catch (error) {
        alert('Error restoring backup. Invalid file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{t.settings}</h2>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">General</h3>
        </div>
        <div className="p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Globe size={20} />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">{t.language}</span>
            </div>
            <select
              value={settings.language}
              onChange={(e) => onUpdate({ ...settings, language: e.target.value as Language })}
              className="px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="pt">Português (BR)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                <DollarSign size={20} />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">{t.currency}</span>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => onUpdate({ ...settings, currency: e.target.value as Currency })}
              className="px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">{t.theme}</span>
            </div>
            <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
              <button
                onClick={() => onUpdate({ ...settings, theme: 'light' })}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${settings.theme === 'light' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t.lightMode}
              </button>
              <button
                onClick={() => onUpdate({ ...settings, theme: 'dark' })}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${settings.theme === 'dark' ? 'bg-slate-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t.darkMode}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PRO Features */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden text-white transition-colors">
        <div className="px-6 py-4 border-b border-gray-700 bg-black/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <Crown className="text-yellow-400" size={20} />
             <h3 className="font-semibold">{t.proVersion}</h3>
          </div>
          <button 
            onClick={() => onUpdate({ ...settings, isPro: !settings.isPro })}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.isPro ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {settings.isPro ? 'ACTIVE' : t.upgradeToPro}
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm mb-4">
            {settings.isPro ? "You have access to all premium features." : "Unlock advanced features to take full control."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              disabled={!settings.isPro}
              onClick={() => alert('Simulated CSV Export')}
              className={`flex items-center justify-between p-4 rounded-xl border ${settings.isPro ? 'border-gray-600 hover:bg-white/5 cursor-pointer' : 'border-gray-700 opacity-50 cursor-not-allowed'}`}
            >
               <div className="flex items-center gap-3">
                 <Download size={20} className="text-blue-400"/>
                 <span>{t.export}</span>
               </div>
               {!settings.isPro && <Lock size={16} className="text-gray-500"/>}
            </button>

            <button 
              disabled={!settings.isPro}
              onClick={() => alert('Simulated Cloud Backup')}
              className={`flex items-center justify-between p-4 rounded-xl border ${settings.isPro ? 'border-gray-600 hover:bg-white/5 cursor-pointer' : 'border-gray-700 opacity-50 cursor-not-allowed'}`}
            >
               <div className="flex items-center gap-3">
                 <Cloud size={20} className="text-purple-400"/>
                 <span>{t.backup}</span>
               </div>
               {!settings.isPro && <Lock size={16} className="text-gray-500"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">{t.security}</h3>
        </div>
        <div className="p-6">
          {!settings.hasPasswordProtection ? (
            <div className="flex flex-col gap-4">
               <p className="text-sm text-gray-500 dark:text-gray-400">{t.enablePin}</p>
               <div className="flex gap-4">
                  <input 
                    type="password" 
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0000"
                    className="w-24 px-4 py-2 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-center tracking-widest text-lg focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button 
                    onClick={handleSetPin}
                    disabled={pinInput.length !== 4}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition"
                  >
                    {t.setPin}
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-xl">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={24} />
                 <div>
                   <h4 className="font-medium text-emerald-900 dark:text-emerald-300">PIN Active</h4>
                   <p className="text-xs text-emerald-600 dark:text-emerald-400">Your data is protected.</p>
                 </div>
               </div>
               <button 
                 onClick={handleDisablePin}
                 className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
               >
                 Disable
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Backup & Data Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">{t.backupSettings}</h3>
        </div>
        <div className="p-6 space-y-4">
          
          <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700/30">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                   <Database size={20} />
                </div>
                <div>
                   <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.createBackup}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                     {t.lastBackup} {settings.lastBackupDate || t.never}
                   </p>
                </div>
             </div>
             <button 
               onClick={handleCreateBackup}
               className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
               title={t.createBackup}
             >
                <Download size={20} />
             </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700/30">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                   <Upload size={20} />
                </div>
                <div>
                   <h4 className="font-medium text-gray-800 dark:text-gray-200">{t.restoreBackup}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400">JSON Format</p>
                </div>
             </div>
             <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreBackup}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-white rounded-lg transition-colors"
                  title={t.restoreBackup}
                >
                    <Save size={20} />
                </button>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Settings;