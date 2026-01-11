import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Transaction, Language, Currency } from '../types';
import { TRANSLATIONS, CURRENCY_SYMBOLS } from '../constants';

interface ReportsProps {
  transactions: Transaction[];
  language: Language;
  currency: Currency;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#64748b'];

const Reports: React.FC<ReportsProps> = ({ transactions, language, currency }) => {
  const t = TRANSLATIONS[language];
  const symbol = CURRENCY_SYMBOLS[currency];

  // Prepare data for Category Pie Chart (Expenses only)
  const expenseData = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, curr) => {
      const existing = acc.find(i => i.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  // Prepare data for Monthly Bar Chart
  const monthlyData = transactions.reduce((acc, curr) => {
    const date = new Date(curr.date);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // e.g. "10/2023"
    
    let existing = acc.find(i => i.name === key);
    if (!existing) {
      existing = { name: key, income: 0, expense: 0 };
      acc.push(existing);
    }

    if (curr.type === 'income') {
      existing.income += curr.amount;
    } else {
      existing.expense += curr.amount;
    }
    return acc;
  }, [] as { name: string; income: number; expense: number }[])
  .sort((a, b) => {
    const [ma, ya] = a.name.split('/').map(Number);
    const [mb, yb] = b.name.split('/').map(Number);
    return new Date(ya, ma).getTime() - new Date(yb, mb).getTime();
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">{t.reports}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">{t.expense} - {t.category}</h3>
          {expenseData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${symbol} ${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-gray-400">
                {t.noTransactions}
             </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">{t.transactions} - Monthly</h3>
          {monthlyData.length > 0 ? (
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value: number) => `${symbol} ${value.toFixed(2)}`}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="income" name={t.income} fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" name={t.expense} fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
               {t.noTransactions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
