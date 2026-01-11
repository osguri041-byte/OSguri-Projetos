import React, { useState } from 'react';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Transaction, Language, Currency } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateFinancialAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  transactions: Transaction[];
  language: Language;
  currency: Currency;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, language, currency }) => {
  const t = TRANSLATIONS[language];
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        // Fallback or demo mode message if API key isn't present
        setTimeout(() => {
          setAdvice(`
### Demo Mode
**API Key missing.** To use real AI analysis, please configure \`process.env.API_KEY\`.

However, based on standard financial wisdom:
* Track every penny.
* Categorize your expenses.
* Set a budget for "Needs" vs "Wants".
          `);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const result = await generateFinancialAdvice(transactions, currency, language);
      setAdvice(result);
    } catch (err) {
      setError("Failed to fetch advice.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          {t.aiAdvisor} <Sparkles className="text-yellow-400" />
        </h2>
        <p className="text-gray-500">{t.aiAnalysis}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
        <div className="p-8 text-center bg-gradient-to-b from-indigo-50 to-white">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Bot size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t.aiPrompt}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
            DinDin AI uses Gemini models to analyze your spending history and provide personalized saving tips.
          </p>
          
          <button
            onClick={handleGetAdvice}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                {t.loading}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {t.getAdvice}
              </>
            )}
          </button>
        </div>

        {error && (
           <div className="p-4 bg-red-50 text-red-600 text-center text-sm flex items-center justify-center gap-2">
             <AlertCircle size={16} /> {error}
           </div>
        )}

        {advice && (
          <div className="p-8 border-t border-gray-100 bg-white animate-fade-in">
             <div className="prose prose-indigo max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
                <ReactMarkdown>{advice}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
