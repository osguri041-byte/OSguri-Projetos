import { Transaction, UserSettings, Budget, CategoryItem } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES_LIST } from '../constants';

const STORAGE_KEYS = {
  TRANSLATIONS: 'dindin_transactions', // Legacy key name kept to avoid data loss, though it stores transactions
  TRANSACTIONS: 'dindin_transactions',
  SETTINGS: 'dindin_settings',
  BUDGETS: 'dindin_budgets',
  CATEGORIES: 'dindin_categories'
};

export const getStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions', error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions', error);
  }
};

export const getStoredBudgets = (): Budget[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets', error);
    return [];
  }
};

export const saveBudgets = (budgets: Budget[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets', error);
  }
};

export const getStoredCategories = (): CategoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES_LIST;
  } catch (error) {
    console.error('Error loading categories', error);
    return DEFAULT_CATEGORIES_LIST;
  }
};

export const saveCategories = (categories: CategoryItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories', error);
  }
};

export const getStoredSettings = (): UserSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings', error);
  }
};