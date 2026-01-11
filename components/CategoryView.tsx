import React, { useState } from 'react';
import { Plus, X, Check, Edit2, Trash2, Briefcase, Laptop, TrendingUp, Gift, Utensils, Home, Car, Smile, Heart, GraduationCap, ShoppingBag, MoreHorizontal, Zap, Wifi, Smartphone, Coffee, Music, Plane, Gamepad, Dumbbell, Stethoscope, Book, Hammer, Dog } from 'lucide-react';
import { CategoryItem, Language } from '../types';
import { TRANSLATIONS, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';

// Mapping string keys to Components
const ICON_COMPONENTS: Record<string, any> = {
  Briefcase, Laptop, TrendingUp, Gift, Utensils, Home, Car, 
  Smile, Heart, GraduationCap, ShoppingBag, MoreHorizontal,
  Zap, Wifi, Smartphone, Coffee, Music, Plane, Gamepad, 
  Dumbbell, Stethoscope, Book, Hammer, Dog
};

interface CategoryViewProps {
  categories: CategoryItem[];
  onAddCategory: (cat: CategoryItem) => void;
  onUpdateCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  language: Language;
}

const CategoryView: React.FC<CategoryViewProps> = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory, language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<CategoryItem>>({
    name: '',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: 'bg-gray-500'
  });

  const openModal = (category?: CategoryItem) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: activeTab, // Default to current tab
        icon: 'MoreHorizontal',
        color: 'bg-gray-500'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      onUpdateCategory({ ...editingCategory, ...formData } as CategoryItem);
    } else {
      onAddCategory({
        ...formData,
        id: crypto.randomUUID(),
      } as CategoryItem);
    }
    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter(c => c.type === activeTab || c.type === 'both');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">{t.categories}</h2>
        <button
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">{t.addCategory}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-full max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'income' 
            ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {t.income}
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'expense' 
            ? 'bg-white dark:bg-slate-600 text-red-600 dark:text-red-400 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {t.expense}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => {
          const Icon = ICON_COMPONENTS[cat.icon] || MoreHorizontal;
          return (
            <div key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between group transition-colors h-full">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2.5 rounded-lg ${cat.color} text-white shadow-sm flex-shrink-0`}>
                  <Icon size={20} />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200 break-words leading-tight">{cat.name}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                <button 
                  onClick={() => openModal(cat)}
                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up md:animate-fade-in relative z-10 max-h-[90vh] overflow-y-auto">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingCategory ? t.editCategory : t.addCategory}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.categoryName}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Streaming"
                />
              </div>

              {/* Type */}
              <div>
                 <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-1">{t.type}</label>
                 <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                    {(['expense', 'income', 'both'] as const).map(type => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => setFormData({ ...formData, type })}
                         className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                           formData.type === type 
                           ? 'bg-white dark:bg-slate-600 text-gray-800 dark:text-white shadow-sm' 
                           : 'text-gray-500 dark:text-gray-400'
                         }`}
                       >
                         {type === 'both' ? t.both : t[type]}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">{t.icon}</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map(iconKey => {
                    const Icon = ICON_COMPONENTS[iconKey];
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconKey })}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                          formData.icon === iconKey 
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500' 
                          : 'bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">{t.color}</label>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
                  {AVAILABLE_COLORS.map(colorClass => (
                    <button
                      key={colorClass}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: colorClass })}
                      className={`w-8 h-8 rounded-full ${colorClass} transition-transform hover:scale-110 ${
                        formData.color === colorClass ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-slate-800 scale-110' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg"
                >
                  <Check size={24} />
                  {t.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryView;