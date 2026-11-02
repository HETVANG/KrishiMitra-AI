import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, IndianRupee, PieChart as ChartIcon, Coins, TrendingUp, TrendingDown, LayoutGrid, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalIncome: 0, totalExpense: 0, netProfit: 0, chartData: [] });
  const [loading, setLoading] = useState(false);

  // Form State
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('seeds');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.get('/expenses/list'),
        api.get('/expenses/summary')
      ]);

      if (listRes.data && listRes.data.success) {
        setExpenses(listRes.data.expenses);
      }
      if (sumRes.data && sumRes.data.success) {
        setSummary(sumRes.data.summary);
      }
    } catch (err) {
      console.error('Failed to load financials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError(t('expenses.amount_positive_err') || 'Amount must be a positive number.');
      return;
    }

    setError('');
    setInfo('');

    try {
      const res = await api.post('/expenses/add', {
        type,
        category,
        amount: Number(amount),
        date,
        description
      });

      if (res.data && res.data.success) {
        setInfo(t('expenses.success_msg') || 'Transaction logged successfully.');
        setAmount('');
        setDescription('');
        loadFinanceData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit transaction.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('expenses.delete_confirm') || 'Are you sure you want to delete this record?')) return;
    try {
      const res = await api.delete(`/expenses/delete/${id}`);
      if (res.data && res.data.success) {
        loadFinanceData();
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#6366F1', '#EC4899'];

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('expenses.title') || 'Farm Ledger Expense Manager'}
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1 font-medium">
          {t('expenses.subtitle') || 'Log your crop revenue income and seasonal production costs to keep healthy agricultural accounting.'}
        </p>
      </div>

      {/* Aggregate balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
            {t('expenses.revenue') || 'Total Farm Revenue'}
          </span>
          <span className="text-2xl md:text-3xl font-extrabold text-emerald-600 block mt-2">
            ₹{summary.totalIncome || 0}
          </span>
          <div className="absolute right-5 bottom-5 text-emerald-100 dark:text-emerald-950/20">
            <TrendingUp size={36} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
            {t('expenses.costs') || 'Total Production Costs'}
          </span>
          <span className="text-2xl md:text-3xl font-extrabold text-red-500 block mt-2">
            ₹{summary.totalExpense || 0}
          </span>
          <div className="absolute right-5 bottom-5 text-red-100 dark:text-red-950/20">
            <TrendingDown size={36} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800/50 p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden">
          <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">
            {t('expenses.net_profit') || 'Net Farm Profit'}
          </span>
          <span className={`text-2xl md:text-3xl font-extrabold block mt-2 ${summary.netProfit >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
            ₹{summary.netProfit || 0}
          </span>
          <div className="absolute right-5 bottom-5 text-brand-100 dark:text-brand-950/20">
            <Coins size={36} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ledger entry form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm">
          <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850">
            {t('expenses.log_transaction') || 'Log Transaction'}
          </h3>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs md:text-sm text-red-600 dark:text-red-400">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-brand-50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/10 rounded-xl text-xs md:text-sm text-brand-700 dark:text-brand-400">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">
                {t('expenses.transaction_type') || 'Transaction Type'}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-dark-800/50 p-1 border border-gray-150 dark:border-dark-850 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${type === 'expense' ? 'bg-white dark:bg-dark-800 text-red-600 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
                >
                  {t('expenses.cost_expense') || 'Cost (Expense)'}
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors ${type === 'income' ? 'bg-white dark:bg-dark-800 text-emerald-600 shadow-sm' : 'text-gray-500 dark:text-dark-400'}`}
                >
                  {t('expenses.revenue_income') || 'Revenue (Income)'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">
                  {t('expenses.amount') || 'Amount (₹)'}
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  className="custom-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">
                  {t('expenses.date') || 'Date'}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="custom-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">
                {t('expenses.category') || 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="custom-input text-sm"
              >
                <option value="seeds">{t('expenses.seeds') || 'Seeds'}</option>
                <option value="fertilizer">{t('expenses.fertilizer') || 'Fertilizer / Pesticides'}</option>
                <option value="labor">{t('expenses.labor') || 'Labor / Workforce'}</option>
                <option value="fuel">{t('expenses.fuel') || 'Fuel / Diesel'}</option>
                <option value="equipment">{t('expenses.equipment') || 'Equipment Rental/Purchase'}</option>
                <option value="other">{t('expenses.other') || 'Other Miscellaneous'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase mb-1.5">
                {t('expenses.description') || 'Description'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('expenses.desc_placeholder') || 'e.g. Bought 2 bags DAP fertilizer'}
                className="custom-input text-sm"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 mt-2"
            >
              {t('expenses.log_transaction') || 'Log Transaction'}
            </button>
          </form>
        </div>

        {/* Ledger Transaction History + Cost Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-dark-800/30 shadow-sm flex flex-col gap-6">
          
          {/* Cost chart pie */}
          <div>
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-4 pb-2 border-b border-gray-50 dark:border-dark-850 flex items-center gap-2">
              <ChartIcon className="text-brand-600 dark:text-brand-400" size={18} />
              <span>{t('expenses.cost_breakdown') || 'Cost Breakdown Category Chart'}</span>
            </h3>

            <div className="h-[180px] w-full flex items-center justify-center">
              {summary.chartData && summary.chartData.some((d: any) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.chartData.filter((d: any) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {summary.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-gray-400 italic">No production cost logs found to render charts.</p>
              )}
            </div>
          </div>

          {/* Ledger Lists with Mobile-First Scrollable Table */}
          <div>
            <h3 className="font-extrabold text-base text-gray-800 dark:text-dark-100 mb-3 pb-1 flex items-center gap-2">
              <LayoutGrid className="text-brand-600 dark:text-brand-400" size={18} />
              <span>{t('expenses.transaction_logs') || 'Transaction Logs List'}</span>
            </h3>
            
            <div className="max-h-[350px] overflow-y-auto overflow-x-auto border border-gray-100 dark:border-dark-800 rounded-2xl scrollbar-thin">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-dark-300 font-bold border-b border-gray-100 dark:border-dark-750">
                  <tr>
                    <th className="p-3 min-w-[85px]">{t('expenses.date_col') || 'Date'}</th>
                    <th className="p-3 min-w-[75px]">{t('expenses.type_col') || 'Type'}</th>
                    <th className="p-3 min-w-[110px]">{t('expenses.category_col') || 'Category'}</th>
                    <th className="p-3 text-right min-w-[100px]">{t('expenses.amount_col') || 'Amount (₹)'}</th>
                    <th className="p-3 text-center min-w-[60px]">{t('expenses.action_col') || 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-800/40 text-gray-700 dark:text-dark-200">
                  {expenses.length > 0 ? (
                    expenses.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-850/20 transition-colors">
                        <td className="p-3 text-gray-500 dark:text-dark-400 font-semibold">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'}`}>
                            {item.type === 'income' ? (t('expenses.revenue_income') || 'INCOME') : (t('expenses.cost_expense') || 'EXPENSE')}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 dark:text-dark-300 font-medium capitalize">
                          {t(`expenses.${item.category}`, item.category)}
                        </td>
                        <td className={`p-3 text-right font-extrabold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          ₹{item.amount}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete transaction log"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400 font-semibold italic">
                        {t('expenses.no_transactions') || 'No financial ledger transactions entered.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
