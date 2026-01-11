
export type TransactionType = 'income' | 'expense';

export type Language = 'pt' | 'en' | 'es' | 'fr';

export type Currency = 'BRL' | 'USD' | 'EUR';

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  BUDGET = 'BUDGET',
  REPORTS = 'REPORTS',
  CATEGORIES = 'CATEGORIES', // New View
  SETTINGS = 'SETTINGS',
  AI_ADVISOR = 'AI_ADVISOR'
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string; // key for the icon map
  color: string; // tailwind color class
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string; // Storing the name for simplicity in migration
  date: string; // ISO string
  isRecurring: boolean;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface UserSettings {
  language: Language;
  currency: Currency;
  isPro: boolean;
  hasPasswordProtection: boolean;
  passwordPin: string;
  theme: 'light' | 'dark';
  lastBackupDate?: string;
}

export interface ExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
