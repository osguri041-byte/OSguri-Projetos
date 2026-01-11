import React, { useState } from 'react';
import { Globe, DollarSign, Crown, Download, Cloud, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserSettings, Language, Currency } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (newSettings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const t = TRANSLATIONS[settings.language];
  const [pinInput, setPinInput] = useState('');

  const handleSetPin = () => {
    if (pinInput.length === 4) {
      onUpdate({ ...settings, hasPasswordProtection: true, passwordPin: pinInput });
      setPinInput('');
    }
  };

  const handleDisablePin = () => {
    onUpdate({ ...settings, hasPasswordProtection: false, passwordPin: '' });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">{t.settings}</h2>

      {/* General Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">General</h3>
        </div>
        <div className="p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <span className="font-medium text-gray-700">{t.language}</span>
            </div>
            <select
              value={settings.language}
              onChange={(e) => onUpdate({ ...settings, language: e.target.value as Language })}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="pt">Português (BR)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <DollarSign size={20} />
              </div>
              <span className="font-medium text-gray-700">{t.currency}</span>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => onUpdate({ ...settings, currency: e.target.value as Currency })}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="BRL">Real (BRL)</option>
              <option value="USD">Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

        </div>
      </div>

      {/* PRO Features */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg overflow-hidden text-white">
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-700">{t.security}</h3>
        </div>
        <div className="p-6">
          {!settings.hasPasswordProtection ? (
            <div className="flex flex-col gap-4">
               <p className="text-sm text-gray-500">{t.enablePin}</p>
               <div className="flex gap-4">
                  <input 
                    type="password" 
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0000"
                    className="w-24 px-4 py-2 border border-gray-200 rounded-lg text-center tracking-widest text-lg"
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
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
               <div className="flex items-center gap-3">
                 <ShieldCheck className="text-emerald-600" size={24} />
                 <div>
                   <h4 className="font-medium text-emerald-900">PIN Active</h4>
                   <p className="text-xs text-emerald-600">Your data is protected.</p>
                 </div>
               </div>
               <button 
                 onClick={handleDisablePin}
                 className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition"
               >
                 Disable
               </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Settings;
