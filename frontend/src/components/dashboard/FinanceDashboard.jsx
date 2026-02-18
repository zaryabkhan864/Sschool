import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import AdminLayout from "../GUI/AdminLayout";
import MetaData from "../layout/MetaData";
import { useGetRevenueVsExpensesQuery } from "../../redux/api/revenueApi";
import { useGetFeesByCurrencyQuery } from "../../redux/api/feesApi";
import { useTranslation } from "react-i18next";
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon,
  ReceiptPercentIcon,
  WalletIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const FinanceDashboard = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetRevenueVsExpensesQuery();
  const {
    data: currencyData,
    isLoading: currencyLoading,
    error: currencyError,
  } = useGetFeesByCurrencyQuery();

  if (isLoading || currencyLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) return <p className="text-red-500 p-8">Error loading financial data.</p>;

  // Default values agar data na ho
  const financialData = data?.data?.[0] || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    previousMonthRevenue: 0,
    previousMonthExpenses: 0
  };

  // Calculate percentages for growth
  const revenueGrowth = financialData.previousMonthRevenue 
    ? ((financialData.totalRevenue - financialData.previousMonthRevenue) / financialData.previousMonthRevenue * 100).toFixed(1)
    : 0;

  const expensesGrowth = financialData.previousMonthExpenses
    ? ((financialData.totalExpenses - financialData.previousMonthExpenses) / financialData.previousMonthExpenses * 100).toFixed(1)
    : 0;

  // Monthly Data for Charts
  const monthlyData = [
    { month: "Jan", revenue: 42000, expenses: 32000, profit: 10000 },
    { month: "Feb", revenue: 48000, expenses: 35000, profit: 13000 },
    { month: "Mar", revenue: 52000, expenses: 38000, profit: 14000 },
    { month: "Apr", revenue: 58000, expenses: 42000, profit: 16000 },
    { month: "May", revenue: 62000, expenses: 45000, profit: 17000 },
    { month: "Jun", revenue: 65000, expenses: 48000, profit: 17000 },
    { month: "Jul", revenue: 68000, expenses: 50000, profit: 18000 },
    { month: "Aug", revenue: 72000, expenses: 52000, profit: 20000 },
    { month: "Sep", revenue: 75000, expenses: 54000, profit: 21000 },
    { month: "Oct", revenue: 78000, expenses: 56000, profit: 22000 },
    { month: "Nov", revenue: 82000, expenses: 58000, profit: 24000 },
    { month: "Dec", revenue: 85000, expenses: 60000, profit: 25000 },
  ];

  const barChartData = [
    {
      name: t("Current Month"),
      revenue: financialData.totalRevenue,
      expenses: financialData.totalExpenses,
      profit: financialData.netProfit
    },
  ];

  const pieChartData = [
    { name: t("Revenue"), value: financialData.totalRevenue, color: "#4CAF50" },
    { name: t("Expenses"), value: financialData.totalExpenses, color: "#F44336" },
    { name: t("Net Profit"), value: financialData.netProfit, color: "#2196F3" },
  ];

  // Available currencies with colors
  const availableCurrencies = [
    { code: "USD", name: "US Dollar", color: "from-green-600 to-emerald-400" },
    { code: "EUR", name: "Euro", color: "from-blue-600 to-cyan-400" },
    { code: "GBP", name: "British Pound", color: "from-red-600 to-pink-400" },
    { code: "TL", name: "Turkish Lira", color: "from-amber-600 to-yellow-400" },
    { code: "AUD", name: "Australian Dollar", color: "from-purple-600 to-violet-400" },
    { code: "CAD", name: "Canadian Dollar", color: "from-indigo-600 to-blue-400" },
    { code: "AED", name: "UAE Dirham", color: "from-rose-600 to-pink-400" },
  ];

  // Currency data handle karna
  const currencyStats = currencyData?.currencyStats || [];
  
  const feesData = availableCurrencies.map((currency) => {
    const currencyInfo = currencyStats.find((stat) => stat._id === currency.code);
    return {
      ...currency,
      totalAmount: currencyInfo ? currencyInfo.totalAmount : 0,
      totalFees: currencyInfo ? currencyInfo.totalFees : 0,
      percentage: currencyInfo ? (currencyInfo.totalAmount / financialData.totalRevenue * 100).toFixed(1) : 0
    };
  });

  // Stats Cards Data
  const stats = [
    { 
      label: t("Total Revenue"), 
      value: `$${financialData.totalRevenue.toLocaleString()}`, 
      icon: <CurrencyDollarIcon className="w-8 h-8" />, 
      color: "from-emerald-600 to-green-400",
      shadow: "shadow-emerald-200",
      growth: revenueGrowth,
      trend: revenueGrowth >= 0 ? "up" : "down"
    },
    { 
      label: t("Total Expenses"), 
      value: `$${financialData.totalExpenses.toLocaleString()}`, 
      icon: <ReceiptPercentIcon className="w-8 h-8" />, 
      color: "from-rose-600 to-red-400",
      shadow: "shadow-rose-200",
      growth: expensesGrowth,
      trend: expensesGrowth >= 0 ? "up" : "down"
    },
    { 
      label: t("Net Profit"), 
      value: `$${financialData.netProfit.toLocaleString()}`, 
      icon: <ArrowTrendingUpIcon className="w-8 h-8" />, 
      color: "from-blue-600 to-cyan-400",
      shadow: "shadow-blue-200",
      growth: ((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1),
      trend: financialData.netProfit >= 0 ? "up" : "down"
    },
    { 
      label: t("Profit Margin"), 
      value: `${((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1)}%`, 
      icon: <ChartBarIcon className="w-8 h-8" />, 
      color: "from-violet-600 to-purple-400",
      shadow: "shadow-violet-200",
      growth: "2.5%",
      trend: "up"
    },
  ];

  // Recent Transactions
  const transactions = [
    { id: 1, description: "Tuition Fee - John Smith", amount: 1200, currency: "USD", date: "2024-01-15", status: "completed", type: "revenue" },
    { id: 2, description: "Staff Salary - January", amount: 45000, currency: "USD", date: "2024-01-10", status: "completed", type: "expense" },
    { id: 3, description: "Infrastructure Maintenance", amount: 8500, currency: "USD", date: "2024-01-05", status: "pending", type: "expense" },
    { id: 4, description: "Library Books Purchase", amount: 3200, currency: "USD", date: "2024-01-03", status: "completed", type: "expense" },
    { id: 5, description: "Sports Equipment", amount: 5600, currency: "USD", date: "2024-01-02", status: "completed", type: "expense" },
  ];

  return (
    <AdminLayout>
      <MetaData title="Finance Dashboard" />
      
      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        {/* Header Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {t("Financial Overview")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("Track your school's financial performance and activities in real-time.")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-2">
                    {stat.trend === "up" ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-rose-500" />
                    )}
                    <span className={`text-sm font-bold ${stat.trend === "up" ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stat.growth}%
                    </span>
                    <span className="text-xs text-gray-500">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue vs Expenses Chart */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {t("Monthly Financial Performance")}
                  </h2>
                  <p className="text-sm text-gray-500">Revenue, Expenses & Profit Trends</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Monthly
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Quarterly
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Yearly
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.2}
                      name="Expenses"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                      name="Net Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Financial Breakdown Pie Chart */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  {t("Financial Breakdown")}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{ 
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Currency Distribution */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {t("Fees by Currency")}
                    </h2>
                    <p className="text-sm text-gray-500">Distribution across currencies</p>
                  </div>
                  <GlobeAltIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {feesData.slice(0, 4).map((currency, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currency.color} flex items-center justify-center text-white font-bold`}>
                          {currency.code}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{currency.name}</p>
                          <p className="text-xs text-gray-500">{currency.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">${currency.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{currency.totalFees} fees</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                  View All Currencies
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions & Quick Stats */}
          <div className="space-y-8">
            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">{t("Recent Transactions")}</h2>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">
                  Last 30 days
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${transaction.type === 'revenue' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {transaction.type === 'revenue' ? (
                            <ArrowTrendingUpIcon className="w-5 h-5" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-xl transition-colors">
                  {t("View All Transactions")}
                </button>
              </div>
            </div>

            {/* Quick Financial Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-bold mb-6">{t("Financial Health")}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      <CreditCardIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cash Flow</p>
                      <p className="text-xs opacity-80">Monthly average</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">${(financialData.totalRevenue / 12).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      <WalletIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Operating Costs</p>
                      <p className="text-xs opacity-80">As % of revenue</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">
                    {((financialData.totalExpenses / financialData.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      <BanknotesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Collection Rate</p>
                      <p className="text-xs opacity-80">Fees collected</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">94.5%</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-xl transition-colors backdrop-blur-sm">
                {t("Generate Report")}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Generate Invoice', icon: <ReceiptPercentIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Fee Collection', icon: <BanknotesIcon className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { label: 'Expense Report', icon: <ArrowTrendingDownIcon className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600 border-rose-100' },
            { label: 'Budget Planning', icon: <ChartBarIcon className="w-5 h-5" />, color: 'bg-violet-50 text-violet-600 border-violet-100' },
          ].map((action, index) => (
            <button
              key={index}
              className={`p-4 border rounded-2xl text-sm font-bold hover:shadow-md transition-all flex items-center justify-center gap-2 ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinanceDashboard;