import React from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import { useGetRevenueVsExpensesQuery } from "../../redux/api/revenueApi";
import {
  useGetFeesByCurrencyQuery,
  useGetUpcomingFeeDuesQuery,
  useGetFeesByFeeTypeQuery, // 👈 NEW
} from "../../redux/api/feesApi";
import { useGetUnpaidSalariesQuery } from "../../redux/api/salaryApi";
import {
  useGetRecentFinanceActivityQuery,
  useGetPayrollOverviewQuery,
  useGetAcademicYearFinanceSummaryQuery, // 👈 NEW
} from "../../redux/api/financeDashboardApi";
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
  GlobeAltIcon,
  ClockIcon,
  UserGroupIcon,
  BriefcaseIcon,
  // 👇 NEW: one icon per fee type, for the "Fees by Type" breakdown
  UserPlusIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

// 👇 NEW: fixed order + icon/color per fee type, so the 5 boxes always
// appear in the same place regardless of which types have data.
const FEE_TYPE_META = {
  Admission: { icon: UserPlusIcon, color: "from-sky-600 to-blue-400" },
  Tuition: { icon: BookOpenIcon, color: "from-emerald-600 to-green-400" },
  Exam: { icon: ClipboardDocumentCheckIcon, color: "from-amber-500 to-orange-400" },
  // Transport called out in its own color on purpose — it may be run by
  // a third party the school doesn't actually keep this money from, so
  // finance should be able to eyeball it separately from the rest at a
  // glance, not just by reading the label.
  Transport: { icon: TruckIcon, color: "from-purple-600 to-violet-400" },
  Hostel: { icon: BuildingLibraryIcon, color: "from-rose-600 to-pink-400" },
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// e.g. [{currency:"USD",total:5000},{currency:"TRY",total:12000}] -> "USD 5,000, TRY 12,000"
const formatCurrencyList = (rows) =>
  rows && rows.length
    ? rows.map((r) => `${r.currency} ${r.total.toLocaleString()}`).join(", ")
    : "0";

// 👇 NEW: { USD: 1234.56, TRY: 42345.6 } -> "≈ $1,235 · ₺42,346" — the
// combined, live-converted view shown under each raw per-currency list,
// so mixed-currency fees + TRY salaries/expenses can actually be
// compared against each other.
const formatConverted = (converted) => {
  if (!converted) return null;
  return `≈ $${converted.USD.toLocaleString(undefined, { maximumFractionDigits: 0 })} · ₺${converted.TRY.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const FinanceDashboard = () => {
  const { t } = useTranslation();

  // Monthly revenue/expenses/profit series — real, from Revenue + Fees + Salary + Expense
  const { data, isLoading, error } = useGetRevenueVsExpensesQuery(undefined, { refetchOnMountOrArgChange: true });

  // Currency breakdown — real (layout stays "dummy" per design, data is live)
  const { data: currencyData, isLoading: currencyLoading } = useGetFeesByCurrencyQuery(undefined, { refetchOnMountOrArgChange: true });

  // NEW: fee installments due soon (real, already existed on the backend, just wasn't wired up)
  const { data: upcomingDuesData, isLoading: upcomingLoading } = useGetUpcomingFeeDuesQuery(7, { refetchOnMountOrArgChange: true });

  // NEW: staff/teachers whose salary hasn't been paid yet
  // NOTE: backend returns a 404 when the list is empty (by design, same as getOverdueFees),
  // so we treat an error here as "nothing pending" rather than a real failure.
  const { data: unpaidSalariesData, isLoading: unpaidSalariesLoading } = useGetUnpaidSalariesQuery(undefined, { refetchOnMountOrArgChange: true });

  // NEW: merged Fees/Expenses/Salaries feed powering "Recent Transactions"
  const { data: recentActivityData, isLoading: recentActivityLoading } = useGetRecentFinanceActivityQuery(8, { refetchOnMountOrArgChange: true });

  // NEW: projected/committed monthly payroll, sourced from active EmployeeContract.salary
  // (this is what finance is committed to pay, decided when each contract was created —
  // different from the Salary collection, which tracks what's already been paid out)
  const { data: payrollData, isLoading: payrollLoading } = useGetPayrollOverviewQuery(undefined, { refetchOnMountOrArgChange: true });

  // 👇 NEW: whole-academic-year collected / due / paid-out / payable-pending —
  // this is what actually answers "how much has come in, how much is
  // still owed to us, how much have we paid out, how much do we still
  // owe", instead of the always-zero-prone "this month vs last month"
  // comparison the top cards used to show.
  const { data: yearSummaryData, isLoading: yearSummaryLoading } = useGetAcademicYearFinanceSummaryQuery(undefined, { refetchOnMountOrArgChange: true });

  // 👇 NEW: per-fee-type breakdown (Admission/Tuition/Exam/Transport/
  // Hostel), each with its own Collected + Due totals — see the 5 cards
  // rendered further down.
  const { data: feesByTypeData, isLoading: feesByTypeLoading } = useGetFeesByFeeTypeQuery(undefined, { refetchOnMountOrArgChange: true });

  if (isLoading || currencyLoading || yearSummaryLoading || feesByTypeLoading) {
    return (
      <AdminLayout>
        <Loader />
      </AdminLayout>
    );
  }

  if (error) return <p className="text-red-500 p-8">Error loading financial data.</p>;

  // ── Real monthly series, sorted ascending (year, month) ──────────────
  const monthlySeries = [...(data?.data || [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const monthlyData = monthlySeries.map((m) => ({
    month: MONTH_NAMES[(m.month || 1) - 1] || m.month,
    revenue: m.totalRevenue || 0,
    expenses: m.totalExpenses || 0,
    profit: m.netProfit || 0,
  }));

  // Current month = latest entry in the series, previous = the one before it
  const currentMonth = monthlySeries[monthlySeries.length - 1];
  const previousMonth = monthlySeries[monthlySeries.length - 2];

  const financialData = {
    totalRevenue: currentMonth?.totalRevenue || 0,
    totalExpenses: currentMonth?.totalExpenses || 0,
    netProfit: currentMonth?.netProfit || 0,
    previousMonthRevenue: previousMonth?.totalRevenue || 0,
    previousMonthExpenses: previousMonth?.totalExpenses || 0,
  };

  const pieChartData = [
    { name: t("Revenue"), value: financialData.totalRevenue, color: "#4CAF50" },
    { name: t("Expenses"), value: financialData.totalExpenses, color: "#F44336" },
    { name: t("Net Profit"), value: financialData.netProfit, color: "#2196F3" },
  ];

  // ── Currency cards: layout stays as-is, data is live ─────────────────
  const availableCurrencies = [
    { code: "USD", name: "US Dollar", color: "from-green-600 to-emerald-400" },
    { code: "EUR", name: "Euro", color: "from-blue-600 to-cyan-400" },
    { code: "GBP", name: "British Pound", color: "from-red-600 to-pink-400" },
    { code: "TL", name: "Turkish Lira", color: "from-amber-600 to-yellow-400" },
    { code: "AUD", name: "Australian Dollar", color: "from-purple-600 to-violet-400" },
    { code: "CAD", name: "Canadian Dollar", color: "from-indigo-600 to-blue-400" },
    { code: "AED", name: "UAE Dirham", color: "from-rose-600 to-pink-400" },
  ];

  const currencyStats = currencyData?.currencyStats || [];

  const feesData = availableCurrencies.map((currency) => {
    const currencyInfo = currencyStats.find((stat) => stat._id === currency.code);
    return {
      ...currency,
      totalAmount: currencyInfo ? currencyInfo.totalAmount : 0,
      totalFees: currencyInfo ? currencyInfo.totalFees : 0,
      percentage:
        currencyInfo && financialData.totalRevenue
          ? ((currencyInfo.totalAmount / financialData.totalRevenue) * 100).toFixed(1)
          : "0.0",
    };
  });

  // ── NEW data sources ──────────────────────────────────────────────────
  const upcomingDues = upcomingDuesData?.dues || [];
  const unpaidSalaries = unpaidSalariesData?.unpaidSalaries || [];
  const transactions = recentActivityData?.transactions || [];
  const payrollByCurrency = payrollData?.payrollByCurrency || [];
  const totalActiveContracts = payrollData?.totalActiveContracts || 0;

  // 👇 NEW: whole-academic-year summary, per currency
  const yearSummary = yearSummaryData?.summary || { collected: [], due: [], paidOut: [], payablePending: [] };
  const academicYearName = yearSummaryData?.academicYear?.name;

  // 👇 NEW: per-fee-type breakdown, in the fixed FEE_TYPE_META order
  // (falls back to an empty collected/due pair for any type the backend
  // hasn't returned yet, so the 5 boxes are always all present).
  const byFeeType = Object.keys(FEE_TYPE_META).map((feeType) => {
    const found = feesByTypeData?.byFeeType?.find((f) => f.feeType === feeType);
    return found || { feeType, collected: [], due: [] };
  });

  // 👇 REPLACED: the old 4 cards showed "this month vs last month" and
  // were $0 whenever the current/previous month had no matched records
  // (see the getRevenueVsExpenses bug fix). These now answer exactly
  // what was asked for: how much has come in, how much is still owed to
  // us, how much has been paid out, and how much is still owed by us —
  // for the whole academic year, broken out per currency.
  const stats = [
    {
      label: t("Collected This Year"),
      value: formatCurrencyList(yearSummary.collected),
      converted: formatConverted(yearSummary.converted?.collected),
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      color: "from-emerald-600 to-green-400",
      shadow: "shadow-emerald-200",
    },
    {
      label: t("Still Due This Year"),
      value: formatCurrencyList(yearSummary.due),
      converted: formatConverted(yearSummary.converted?.due),
      icon: <ClockIcon className="w-8 h-8" />,
      color: "from-amber-500 to-orange-400",
      shadow: "shadow-amber-200",
    },
    {
      label: t("Paid Out This Year"),
      value: formatCurrencyList(yearSummary.paidOut),
      converted: formatConverted(yearSummary.converted?.paidOut),
      icon: <ReceiptPercentIcon className="w-8 h-8" />,
      color: "from-rose-600 to-red-400",
      shadow: "shadow-rose-200",
    },
    {
      label: t("Still Payable This Year"),
      value: formatCurrencyList(yearSummary.payablePending),
      converted: formatConverted(yearSummary.converted?.payablePending),
      icon: <BanknotesIcon className="w-8 h-8" />,
      color: "from-violet-600 to-purple-400",
      shadow: "shadow-violet-200",
    },
  ];

  // 👇 NEW: "Current Balance" — Collected minus Paid Out, converted (this
  // is the one figure above that can't be a raw per-currency list, since
  // it's a subtraction across currencies by nature). Turns red if the
  // school has paid out more than it's actually collected so far.
  const currentBalance = yearSummary.currentBalance;
  const isBalanceNegative = currentBalance && (currentBalance.USD < 0 || currentBalance.TRY < 0);
  if (currentBalance) {
    stats.push({
      label: t("Current Balance"),
      value: formatConverted(currentBalance) || "—",
      converted: null,
      icon: <WalletIcon className="w-8 h-8" />,
      color: isBalanceNegative ? "from-red-600 to-rose-500" : "from-blue-600 to-indigo-500",
      shadow: isBalanceNegative ? "shadow-red-200" : "shadow-blue-200",
      negative: isBalanceNegative,
    });
  }

  return (
    <AdminLayout>
      <MetaData title="Finance Dashboard" />

      <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            {t("Financial Overview")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {academicYearName
              ? t("Whole-year totals for {{year}} — updated in real-time.", { year: academicYearName })
              : t("Track your school's financial performance and activities in real-time.")}
          </p>
        </div>

        {/* Stats Grid — whole academic year, per currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
                  <h3 className={`text-xl font-black mb-2 break-words ${stat.negative ? "text-red-600" : "text-gray-800"}`}>
                    {stat.value}
                  </h3>
                  {stat.converted && (
                    <p className="text-xs font-semibold text-gray-400">{stat.converted}</p>
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform flex-shrink-0`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* 👇 NEW: Fees by Type — Admission / Tuition / Exam / Transport /
            Hostel each get their own box (Collected + Due, per
            currency). Transport especially benefits from being called
            out on its own since it may be a third-party service the
            school doesn't actually keep this revenue from. */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t("Fees by Type")}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("Collected and still-due amounts broken out per fee type, for the whole academic year")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {byFeeType.map((row) => {
              const meta = FEE_TYPE_META[row.feeType] || {};
              const Icon = meta.icon || CurrencyDollarIcon;
              return (
                <div
                  key={row.feeType}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${meta.color || "from-gray-600 to-gray-400"} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">{t(row.feeType)}</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("Collected")}</p>
                      <p className="text-sm font-black text-emerald-600 break-words">{formatCurrencyList(row.collected)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("Still Due")}</p>
                      <p className="text-sm font-black text-amber-600 break-words">{formatCurrencyList(row.due)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue vs Expenses Chart — real monthly series */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  {t("Monthly Financial Performance")}
                </h2>
                <p className="text-sm text-gray-500">Revenue, Expenses & Profit Trends</p>
              </div>
              <div className="h-80">
                {monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {t("No financial records for this campus/year yet.")}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Expenses" />
                      <Area type="monotone" dataKey="profit" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Net Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Financial Breakdown Pie */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">{t("Financial Breakdown")}</h2>
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
                        formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Currency Distribution — dummy layout, real data */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{t("Fees by Currency")}</h2>
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
              </div>
            </div>

            {/* NEW: Upcoming Fee Dues */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-800">{t("Upcoming Fee Dues")}</h2>
                </div>
                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded">
                  {t("Next 7 days")}
                </span>
              </div>
              <div className="p-6">
                {upcomingLoading ? (
                  <p className="text-sm text-gray-400">{t("Loading...")}</p>
                ) : upcomingDues.length === 0 ? (
                  <p className="text-sm text-gray-400">{t("No fee installments due in this window.")}</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingDues.slice(0, 6).map((due) => (
                      <div key={due._id} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {[due.student?.firstName, due.student?.lastName].filter(Boolean).join(" ") || t("Student")}
                            <span className="text-gray-400 font-normal"> — {due.feeType}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {t("Due")}: {due.dueDate ? new Date(due.dueDate).toLocaleDateString() : "-"}
                          </p>
                        </div>
                        <p className="font-bold text-amber-600">
                          {due.currency} {due.amount?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* NEW: Payroll Overview (from active EmployeeContract.salary) */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{t("Payroll Overview")}</h2>
                    <p className="text-xs text-gray-500">{t("Committed monthly payroll from active contracts")}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded">
                  {totalActiveContracts} {t("active")}
                </span>
              </div>
              <div className="p-6">
                {payrollLoading ? (
                  <p className="text-sm text-gray-400">{t("Loading...")}</p>
                ) : payrollByCurrency.length === 0 ? (
                  <p className="text-sm text-gray-400">{t("No active employee contracts found.")}</p>
                ) : (
                  <div className="space-y-3">
                    {payrollByCurrency.map((row) => (
                      <div key={row.currency} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs">
                            {row.currency}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{row.staffCount} {t("staff on contract")}</p>
                            <p className="text-xs text-gray-500">{t("Estimated monthly total")}</p>
                          </div>
                        </div>
                        <p className="font-bold text-indigo-600">
                          {row.currency} {row.estimatedMonthlyPayroll.toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <p className="text-[11px] text-gray-400 pt-1">
                      {t("Hourly/daily-paid contracts are estimated using a standard full-time assumption — treat as approximate.")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Transactions — real, merged feed */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">{t("Recent Transactions")}</h2>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded">
                  {t("Latest")}
                </span>
              </div>
              <div className="p-6">
                {recentActivityLoading ? (
                  <p className="text-sm text-gray-400">{t("Loading...")}</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-gray-400">{t("No recent transactions found.")}</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              transaction.type === "revenue" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            {transaction.type === "revenue" ? (
                              <ArrowTrendingUpIcon className="w-5 h-5" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {transaction.date ? new Date(transaction.date).toLocaleDateString() : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === "revenue" ? "text-emerald-600" : "text-rose-600"}`}>
                            {transaction.type === "revenue" ? "+" : "-"}
                            {transaction.currency || "$"} {transaction.amount?.toLocaleString()}
                          </p>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NEW: Unpaid Salaries */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg font-bold text-gray-800">{t("Unpaid Salaries")}</h2>
                </div>
                <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded">
                  {unpaidSalaries.length}
                </span>
              </div>
              <div className="p-6">
                {unpaidSalariesLoading ? (
                  <p className="text-sm text-gray-400">{t("Loading...")}</p>
                ) : unpaidSalaries.length === 0 ? (
                  <p className="text-sm text-gray-400">{t("All salaries are paid.")}</p>
                ) : (
                  <div className="space-y-3">
                    {unpaidSalaries.slice(0, 6).map((salary) => (
                      <div key={salary._id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {[salary.employeeId?.firstName, salary.employeeId?.lastName].filter(Boolean).join(" ") || t("Employee")}
                          </p>
                          <p className="text-xs text-gray-500">{salary.month}</p>
                        </div>
                        <p className="font-bold text-rose-600">
                          ${(salary.netSalary || salary.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Health */}
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
                      <p className="text-xs opacity-80">Current month</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">${financialData.netProfit.toLocaleString()}</span>
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
                    {financialData.totalRevenue
                      ? ((financialData.totalExpenses / financialData.totalRevenue) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      <BanknotesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pending Salaries</p>
                      <p className="text-xs opacity-80">Not yet paid</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{unpaidSalaries.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinanceDashboard;