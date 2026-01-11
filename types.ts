export type TransactionType = 'income' | 'expense';

export type Language = 'pt' | 'en' | 'es' | 'fr';

export type Currency = 'BRL' | 'USD' | 'EUR';

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
  AI_ADVISOR = 'AI_ADVISOR'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string
  isRecurring: boolean;
}

export interface UserSettings {
  language: Language;
  currency: Currency;
  isPro: boolean;
  hasPasswordProtection: boolean;
  passwordPin: string;
  theme: 'light' | 'dark'; // Prepared for future use
}

export interface ExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
