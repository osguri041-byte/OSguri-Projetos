import { GoogleGenAI } from "@google/genai";
import { Transaction, Currency, Language } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFinancialAdvice = async (
  transactions: Transaction[],
  currency: Currency,
  language: Language
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare data summary for the prompt
    const recentTransactions = transactions.slice(0, 50); // Analyze last 50 for performance context
    const summary = JSON.stringify(recentTransactions.map(t => ({
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      desc: t.description
    })));

    const prompt = `
      Act as a personal financial advisor named "DinDin Advisor".
      Analyze the following recent transactions (JSON format) and provide insights, identify spending patterns, 
      and give 3 concrete tips to save money.
      
      The user's currency is ${currency}.
      Answer exclusively in the language code: "${language}".
      
      Transactions:
      ${summary}
      
      If there are no transactions, give general financial advice for beginners.
      Keep the tone friendly, encouraging, and professional.
      Format with clear headings and bullet points using Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Error generating advice:", error);
    return "Erro ao conectar com o serviço de IA. Verifique sua chave de API ou tente novamente mais tarde.";
  }
};
