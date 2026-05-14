import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  FileText, Download, Filter, Calendar, Car, 
  Receipt, Wallet, Percent, ChevronRight, ArrowUpRight,
  ArrowDownRight, Building2, Calculator, Save, Plus, ShieldCheck,
  X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, PieChart as RePieChart, 
  Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface AccountingSuiteProps {
  financialSummary: any;
  monthlyStats: any[];
  carPerformance: any[];
  expenseBreakdown: any[];
  bookings: any[];
  expenses: any[];
  currency: string;
  onAddExpense: () => void;
  onViewReports: () => void;
}

const AccountingSuite: React.FC<AccountingSuiteProps> = ({
  financialSummary,
  monthlyStats,
  carPerformance,
  expenseBreakdown,
  bookings,
  expenses,
  currency,
  onAddExpense,
  onViewReports
}) => {
  const { t, isRTL } = useLanguage();
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(10);

  // Tax constants (Morocco) - Could be made dynamic
  const [taxRates, setTaxRates] = useState({
    tva: 0.20,
    professional: 0.05
  });

  // Comprehensive Filtering Logic
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const filterByDate = (itemDate: string | Date) => {
      const d = new Date(itemDate);
      if (dateFilter === 'month') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (dateFilter === 'year') {
        return d.getFullYear() === currentYear;
      }
      return true; // 'all'
    };

    const filteredBookings = bookings.filter(b => filterByDate(b.createdAt || b.startDate));
    const filteredExpenses = expenses.filter(e => {
      const matchesDate = filterByDate(e.date);
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesDate && matchesCategory;
    });

    const totalRev = filteredBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const totalExp = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const net = totalRev - totalExp;
    const margin = totalRev > 0 ? (net / totalRev) * 100 : 0;

    const estTVA = totalRev * (taxRates.tva / (1 + taxRates.tva));
    const estProfTax = totalRev * taxRates.professional;
    const netAfter = net - estProfTax;

    // Mixed Ledger
    const ledger = [
      ...filteredBookings.map(b => ({ 
        _id: b._id,
        type: 'revenue', 
        label: `${t("cars.title")} ${b.carInfo?.brand || t("admin.dashboard.available")}`, 
        amount: b.totalAmount, 
        date: b.createdAt || b.startDate,
        client: b.customerInfo?.name || t("common.client"),
        category: 'Location'
      })),
      ...filteredExpenses.map(e => ({ 
        _id: e._id,
        type: 'expense', 
        label: e.title, 
        amount: e.amount, 
        date: e.date,
        client: null,
        category: e.category
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Generate Dynamic Chart Data
    let dynamicChartData: any[] = [];
    if (dateFilter === 'month') {
      // Days of the month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dayRev = filteredBookings
          .filter(b => new Date(b.createdAt || b.startDate).getDate() === i)
          .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
        const dayExp = filteredExpenses
          .filter(e => new Date(e.date).getDate() === i)
          .reduce((acc, e) => acc + e.amount, 0);
        dynamicChartData.push({ 
          name: `${i}`, 
          revenue: dayRev, 
          expenses: dayExp 
        });
      }
    } else if (dateFilter === 'year') {
      // Months of the year
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        const mRev = filteredBookings
          .filter(b => new Date(b.createdAt || b.startDate).getMonth() === i)
          .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
        const mExp = filteredExpenses
          .filter(e => new Date(e.date).getMonth() === i)
          .reduce((acc, e) => acc + e.amount, 0);
        dynamicChartData.push({ 
          name: monthNames[i], 
          revenue: mRev, 
          expenses: mExp 
        });
      }
    } else {
      // Last 6 months (default 'all' view for better visualization)
      dynamicChartData = monthlyStats.map(m => ({
        name: m.month,
        revenue: m.revenue,
        expenses: m.expenses
      }));
    }

    return {
      totalRev,
      totalExp,
      net,
      margin,
      estTVA,
      estProfTax,
      netAfter,
      ledger,
      filteredBookings,
      filteredExpenses,
      dynamicChartData
    };
  }, [bookings, expenses, dateFilter, categoryFilter, taxRates, monthlyStats, t]);

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("AVENIR KAMIL CAR", 15, 20);
    doc.setFontSize(12);
    doc.text(`${t("admin.exports.pdf")} - ${t("admin.dashboard.period")}: ${t(`admin.accounting.${dateFilter}`).toUpperCase()}`, 15, 30);
    
    // Summary Stats
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(t("admin.accounting.taxation_details"), 15, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [[t("admin.inventory.designation"), t("common.amount")]],
      body: [
        [t("admin.accounting.revenue"), `${filteredData.totalRev.toLocaleString()} ${currency}`],
        [t("admin.accounting.total_expenses"), `${filteredData.totalExp.toLocaleString()} ${currency}`],
        [t("admin.charts.profitability_cat"), `${filteredData.net.toLocaleString()} ${currency}`],
        [t("admin.accounting.profit_margin"), `${filteredData.margin.toFixed(2)}%`],
        [`TVA (${taxRates.tva * 100}%)`, `${filteredData.estTVA.toLocaleString()} ${currency}`],
        [`Taxe Prof. (~${taxRates.professional * 100}%)`, `${filteredData.estProfTax.toLocaleString()} ${currency}`],
        [t("admin.accounting.real_net_profit"), `${filteredData.netAfter.toLocaleString()} ${currency}`],
      ],
      theme: 'striped',
      headStyles: { fillStyle: [220, 38, 38] } 
    });

    doc.text(t("admin.accounting.ledger_title"), 15, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [[t("common.date"), t("admin.inventory.designation"), t("admin.accounting.type"), t("common.amount")]],
      body: filteredData.ledger.slice(0, 10).map(item => [
        new Date(item.date).toLocaleDateString(),
        item.label,
        item.type === 'revenue' ? t("admin.accounting.credit") : t("admin.accounting.debit"),
        `${item.amount} ${currency}`
      ]),
      theme: 'grid'
    });

    doc.save(`Rapport_Comptabilite_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const summaryData = [
      { [t("admin.inventory.designation")]: t("admin.accounting.revenue"), [t("common.amount")]: filteredData.totalRev, "Devise": currency },
      { [t("admin.inventory.designation")]: t("admin.accounting.total_expenses"), [t("common.amount")]: filteredData.totalExp, "Devise": currency },
      { [t("admin.inventory.designation")]: t("admin.accounting.real_net_profit"), [t("common.amount")]: filteredData.net, "Devise": currency },
      { [t("admin.inventory.designation")]: "TVA Est.", [t("common.amount")]: filteredData.estTVA, "Devise": currency },
      { [t("admin.inventory.designation")]: "Taxe Prof. Est.", [t("common.amount")]: filteredData.estProfTax, "Devise": currency }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, t("admin.tabs.dashboard"));

    const wsExpenses = XLSX.utils.json_to_sheet(filteredData.filteredExpenses);
    XLSX.utils.book_append_sheet(wb, wsExpenses, t("admin.tabs.expenses"));

    const wsBookings = XLSX.utils.json_to_sheet(filteredData.filteredBookings);
    XLSX.utils.book_append_sheet(wb, wsBookings, t("admin.crm.reservations"));

    XLSX.writeFile(wb, `Comptabilite_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className={`space-y-8 pb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header with Luxury Branding */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {t("admin.accounting.suite_title").split(' ')[0]} <span className="text-red-600">{t("admin.accounting.suite_title").split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] mt-1">
            {t("admin.accounting.suite_subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-1 md:gap-2 bg-white dark:bg-gray-900 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm grow sm:grow-0 justify-center">
            <button 
              onClick={() => setDateFilter('all')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${dateFilter === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >{t("admin.accounting.all")}</button>
            <button 
              onClick={() => setDateFilter('month')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${dateFilter === 'month' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >{t("admin.accounting.month")}</button>
            <button 
              onClick={() => setDateFilter('year')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase transition-all ${dateFilter === 'year' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >{t("admin.accounting.year")}</button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={exportToExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-600/20"
            >
              <Download size={14} className="md:w-4 md:h-4" /> Excel
            </button>
            <button 
              onClick={exportToPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
            >
              <FileText size={14} className="md:w-4 md:h-4" /> {t("admin.accounting.pdf_report")}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={48} className="text-green-500 md:w-16 md:h-16" />
          </div>
          <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
            <DollarSign size={10} className="text-green-500 md:w-3 md:h-3" /> {t("admin.accounting.revenue")}
          </p>
          <div className="flex items-end gap-1 md:gap-2">
            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{filteredData.totalRev.toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">{currency}</p>
          </div>
          <div className="mt-4 flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black text-green-500 bg-green-500/10 px-2 md:px-3 py-1 rounded-full w-fit">
            <ArrowUpRight size={10} className="md:w-3 md:h-3" /> Live {t(`admin.accounting.${dateFilter}`)}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingDown size={48} className="text-red-500 md:w-16 md:h-16" />
          </div>
          <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
            <Receipt size={10} className="text-red-500 md:w-3 md:h-3" /> {t("admin.accounting.total_expenses")}
          </p>
          <div className="flex items-end gap-1 md:gap-2">
            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{filteredData.totalExp.toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">{currency}</p>
          </div>
          <div className="mt-4 flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black text-red-500 bg-red-500/10 px-2 md:px-3 py-1 rounded-full w-fit">
            <ArrowDownRight size={10} className="md:w-3 md:h-3" /> Live {t(`admin.accounting.${dateFilter}`)}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={48} className="text-blue-500 md:w-16 md:h-16" />
          </div>
          <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
            <Percent size={10} className="text-blue-500 md:w-3 md:h-3" /> {t("admin.accounting.profit_margin")}
          </p>
          <div className="flex items-end gap-1 md:gap-2">
            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{filteredData.margin.toFixed(1)}%</p>
          </div>
          <div className="mt-4 flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 md:px-3 py-1 rounded-full w-fit">
            <ShieldCheck size={10} className="md:w-3 md:h-3" /> {t("admin.accounting.optimal_performance")}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:scale-110 transition-transform">
            <Building2 size={48} className="text-purple-500 md:w-16 md:h-16" />
          </div>
          <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 flex items-center gap-2">
            <Calculator size={10} className="text-purple-500 md:w-3 md:h-3" /> {t("admin.accounting.est_taxation")}
          </p>
          <div className="flex items-end gap-1 md:gap-2">
            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{(filteredData.estTVA + filteredData.estProfTax).toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1">{currency}</p>
          </div>
          <div className="mt-4 flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black text-purple-500 bg-purple-500/10 px-2 md:px-3 py-1 rounded-full w-fit">
            <Building2 size={10} className="md:w-3 md:h-3" /> {t("admin.accounting.tva_tax_prof")}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Cash Flow Analysis Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t("admin.accounting.cash_flow")}</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("admin.accounting.monthly_analysis")}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onViewReports}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl text-gray-500 hover:text-red-600 transition-colors"
                title={t("admin.accounting.detailed_reports")}
              >
                <TrendingUp size={18} />
              </button>
              <button 
                onClick={() => setDateFilter(prev => prev === 'month' ? 'year' : 'month')}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl text-gray-500 hover:text-red-600 transition-colors"
                title={t("admin.accounting.toggle_period")}
              >
                <Calendar size={18} />
              </button>
              <button 
                onClick={() => setCategoryFilter('all')}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-xl text-gray-500 hover:text-red-600 transition-colors"
                title={t("admin.accounting.reset_filters")}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData.dynamicChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 'bold'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 8, fontWeight: 'bold'}} 
                  width={40}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', backgroundColor: '#0f172a', color: '#fff'}}
                  itemStyle={{fontSize: '10px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="revenue" name={t("admin.accounting.revenues")} stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="expenses" name={t("admin.accounting.expenses")} stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax & P/L Forecasting */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6 md:mb-8">{t("admin.accounting.tax_calculator")}</h3>
          
          <div className="space-y-4 md:space-y-6 flex-grow">
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700">
              <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">{t("admin.accounting.taxation_details")}</p>
              <div className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400">TVA ({taxRates.tva * 100}%)</span>
                  <span className="text-xs md:text-sm font-black text-gray-900 dark:text-white">-{filteredData.estTVA.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400">Taxe Prof. (~{taxRates.professional * 100}%)</span>
                  <span className="text-xs md:text-sm font-black text-gray-900 dark:text-white">-{filteredData.estProfTax.toLocaleString()} {currency}</span>
                </div>
                <div className="pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-[10px] md:text-xs font-black uppercase text-gray-900 dark:text-white tracking-widest">{t("admin.accounting.real_net_profit")}</span>
                  <span className="text-lg md:text-xl font-black text-green-500">{filteredData.netAfter.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-red-600 rounded-2xl md:rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 md:p-4 opacity-20 rotate-12 group-hover:rotate-0 transition-transform">
                <Calculator size={36} className="md:w-12 md:h-12" />
              </div>
              <h4 className="text-base md:text-lg font-black uppercase tracking-tighter mb-1">{t("admin.accounting.pl_forecast")}</h4>
              <p className="text-[8px] md:text-[10px] font-bold opacity-80 uppercase tracking-widest mb-4">{t("admin.accounting.next_month_projection")}</p>
              <div className="text-2xl md:text-3xl font-black">
                +{(filteredData.net * 1.05).toLocaleString()} <span className="text-xs md:text-sm">{currency}</span>
              </div>
              <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest mt-2 opacity-60">{t("admin.accounting.trend_based")}</p>
            </div>
          </div>

          <button 
            onClick={() => setShowTaxSettings(true)}
            className="mt-6 md:mt-8 w-full py-3 md:py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
          >
            {t("admin.accounting.config_tax_alerts")}
          </button>
        </div>
      </div>

      {/* Advanced Data Table with Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl md:rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t("admin.accounting.ledger_title")}</h3>
            <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("admin.accounting.ledger_subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex-1 md:flex-none">
              <Filter size={14} className="text-gray-400" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-[8px] md:text-[10px] font-black uppercase outline-none dark:text-white w-full"
              >
                <option value="all">{t("admin.accounting.all_categories")}</option>
                <option value="maintenance">{t("inventory.maintenance")}</option>
                <option value="fuel">{t("admin.fleet.fuel")}</option>
                <option value="insurance">{t("admin.dashboard.insurance_label").replace(':','')}</option>
                <option value="tax">{t("admin.settings.tax").replace('(%)','')}</option>
                <option value="staff">{t("admin.accounting.personnel")}</option>
                <option value="rent">{t("admin.accounting.rent")}</option>
                <option value="other">{t("admin.expenses.category")}</option>
              </select>
            </div>
            <button 
              onClick={onAddExpense}
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex-1 md:flex-none"
            >
              <Plus size={14} /> {t("admin.accounting.add_entry")}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("admin.accounting.date_ref")}</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">{t("admin.inventory.designation")}</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest text-center whitespace-nowrap">{t("admin.accounting.type")}</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest text-right whitespace-nowrap">{t("admin.accounting.amount")}</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-[8px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest text-right whitespace-nowrap">{t("admin.accounting.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredData.ledger
              .slice(0, historyLimit)
              .map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all group">
                  <td className="px-6 md:px-10 py-4 md:py-6">
                    <div className="text-xs md:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest">REF-{item._id?.slice(-6).toUpperCase() || 'NEW'}</div>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6">
                    <div className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight group-hover:text-red-600 transition-colors">
                      {item.label}
                    </div>
                    {item.type === 'revenue' && <div className="text-[7px] md:text-[8px] font-black text-blue-500 uppercase tracking-widest">{t("common.client")}: {item.client}</div>}
                    {item.type === 'expense' && <div className="text-[7px] md:text-[8px] font-black text-amber-500 uppercase tracking-widest">{t("common.category")}: {item.category}</div>}
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-center">
                    <span className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest ${
                      item.type === 'revenue' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {item.type === 'revenue' ? t("admin.accounting.credit") : t("admin.accounting.debit")}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                    <div className={`text-sm md:text-base font-black ${item.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'revenue' ? '+' : '-'}{item.amount.toLocaleString()} <span className="text-[8px] md:text-[10px]">{currency}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">{t("admin.accounting.recorded")}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
          <button 
            onClick={() => setHistoryLimit(prev => prev + 10)}
            className="text-[8px] md:text-[10px] font-black text-gray-500 hover:text-red-600 uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all flex items-center gap-2"
          >
            {historyLimit < filteredData.ledger.length ? t("admin.accounting.load_more") : t("admin.accounting.end_history")} <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>

      {/* Tax Settings Modal */}
      <AnimatePresence>
        {showTaxSettings && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTaxSettings(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-2xl md:rounded-[3rem] shadow-3xl overflow-hidden">
              <div className="p-6 md:p-10 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl md:text-2xl font-black dark:text-white uppercase tracking-tighter">{t("admin.accounting.tax_settings")}</h3>
                <button onClick={() => setShowTaxSettings(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl"><X size={18} /></button>
              </div>
              <div className="p-6 md:p-10 space-y-6">
                <div className="p-4 md:p-6 bg-blue-50 dark:bg-blue-500/5 rounded-2xl md:rounded-3xl border border-blue-100 dark:border-blue-500/20 flex gap-4">
                  <AlertCircle className="text-blue-600 shrink-0" />
                  <p className="text-[10px] md:text-xs font-bold text-blue-900 dark:text-blue-200">{t("admin.accounting.tax_settings_help")}</p>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.accounting.tva_rate")} (Actuel: {taxRates.tva * 100}%)</label>
                  <input 
                    type="range" min="0" max="0.30" step="0.01" 
                    value={taxRates.tva} 
                    onChange={(e) => setTaxRates({...taxRates, tva: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="block text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("admin.accounting.est_professional_tax")} (Actuel: {taxRates.professional * 100}%)</label>
                  <input 
                    type="range" min="0" max="0.15" step="0.01" 
                    value={taxRates.professional} 
                    onChange={(e) => setTaxRates({...taxRates, professional: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
                <button 
                  onClick={() => setShowTaxSettings(false)}
                  className="w-full py-3 md:py-4 bg-red-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-red-500/20 uppercase text-[8px] md:text-[10px] tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> {t("admin.accounting.save_settings")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountingSuite;
