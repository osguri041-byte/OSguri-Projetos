import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface AuthProps {
  pin: string;
  language: Language;
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ pin, language, onSuccess }) => {
  const t = TRANSLATIONS[language];
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === pin) {
      onSuccess();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">DinDin Protected</h2>
          <p className="mt-2 text-sm text-gray-400">{t.enterPin}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            type="password"
            maxLength={4}
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ''))}
            className={`block w-full text-center px-4 py-4 rounded-xl border-2 text-2xl font-bold tracking-[1em] bg-gray-800 text-white placeholder-gray-600 focus:outline-none transition-all
              ${error ? 'border-red-500 animate-pulse' : 'border-gray-700 focus:border-emerald-500'}`}
            placeholder="••••"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900"
          >
            {t.unlock}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
