import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Plus,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useReceipts, useClients, useExpenses } from '../hooks/useDatabase';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO, startOfYear, endOfYear, subYears } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { db } from '../services/database';
import { exportService } from '../services/export';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

// Advanced Analytics Component
export function AdvancedAnalytics() {
  const { receipts } = useReceipts();
  const { clients } = useClients();
  const { expenses } = useExpenses();
  
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [analyticsData, setAnalyticsData] = useState({
    monthlyTrends: [],
    clientPerformance: [],
    paymentMethodAnalysis: [],
    profitMargins: [],
    growthMetrics: {},
    yearlyComparison: [],
    topClients: [],
    expenseAnalysis: [],
    revenueForecasting: []
  });

  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonPeriod, setComparisonPeriod] = useState('month');

  useEffect(() => {
    generateAnalytics();
  }, [receipts, clients, expenses, dateRange]);

  const generateAnalytics = () => {
    const startDate = parseISO(dateRange.start);
    const endDate = parseISO(dateRange.end);
    
    // Filter data by date range
    const filteredReceipts = receipts.filter(r => 
      isWithinInterval(r.date, { start: startDate, end: endDate })
    );
    const filteredExpenses = expenses.filter(e => 
      isWithinInterval(e.date, { start: startDate, end: endDate })
    );

    // Monthly trends analysis
    const monthlyTrends = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const monthReceipts = filteredReceipts.filter(r => 
        isWithinInterval(r.date, { start: monthStart, end: monthEnd })
      );
      const monthExpenses = filteredExpenses.filter(e => 
        isWithinInterval(e.date, { start: monthStart, end: monthEnd })
      );
      
      const income = monthReceipts.reduce((sum, r) => sum + r.amount, 0);
      const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      monthlyTrends.push({
        month: format(currentDate, 'MMM yyyy'),
        income,
        expense,
        profit: income - expense,
        receiptCount: monthReceipts.length,
        clientCount: new Set(monthReceipts.map(r => r.clientCnic)).size,
        avgReceiptValue: monthReceipts.length > 0 ? income / monthReceipts.length : 0
      });
      
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Client performance analysis with advanced metrics
    const clientPerformance = clients.map(client => {
      const clientReceipts = filteredReceipts.filter(r => r.clientCnic === client.cnic);
      const totalAmount = clientReceipts.reduce((sum, r) => sum + r.amount, 0);
      const avgAmount = clientReceipts.length > 0 ? totalAmount / clientReceipts.length : 0;
      
      // Calculate client lifetime value and frequency
      const firstPayment = clientReceipts.length > 0 ? 
        Math.min(...clientReceipts.map(r => r.date.getTime())) : null;
      const lastPayment = clientReceipts.length > 0 ? 
        Math.max(...clientReceipts.map(r => r.date.getTime())) : null;
      
      const daysBetween = firstPayment && lastPayment ? 
        (lastPayment - firstPayment) / (1000 * 60 * 60 * 24) : 0;
      const frequency = daysBetween > 0 ? clientReceipts.length / (daysBetween / 30) : 0; // payments per month
      
      return {
        name: client.name,
        type: client.type,
        totalAmount,
        receiptCount: clientReceipts.length,
        avgAmount,
        frequency,
        lastPayment: lastPayment,
        lifetimeValue: totalAmount,
        riskScore: frequency < 0.5 ? 'High' : frequency < 1 ? 'Medium' : 'Low'
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    // Payment method analysis
    const paymentMethods = filteredReceipts.reduce((acc, receipt) => {
      acc[receipt.paymentMethod] = (acc[receipt.paymentMethod] || 0) + receipt.amount;
      return acc;
    }, {});
    
    const paymentMethodAnalysis = Object.entries(paymentMethods).map(([method, amount]) => ({
      method: method.replace('_', ' ').toUpperCase(),
      amount,
      percentage: (amount / filteredReceipts.reduce((sum, r) => sum + r.amount, 0)) * 100,
      count: filteredReceipts.filter(r => r.paymentMethod === method).length
    }));

    // Yearly comparison
    const currentYear = new Date().getFullYear();
    const yearlyComparison = [];
    for (let i = 2; i >= 0; i--) {
      const year = currentYear - i;
      const yearStart = startOfYear(new Date(year, 0, 1));
      const yearEnd = endOfYear(new Date(year, 11, 31));
      
      const yearReceipts = receipts.filter(r => 
        isWithinInterval(r.date, { start: yearStart, end: yearEnd })
      );
      const yearExpenses = expenses.filter(e => 
        isWithinInterval(e.date, { start: yearStart, end: yearEnd })
      );
      
      const income = yearReceipts.reduce((sum, r) => sum + r.amount, 0);
      const expense = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      yearlyComparison.push({
        year: year.toString(),
        income,
        expense,
        profit: income - expense,
        clientCount: new Set(yearReceipts.map(r => r.clientCnic)).size
      });
    }

    // Expense analysis by category
    const expenseCategories = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const expenseAnalysis = Object.entries(expenseCategories).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: (amount / filteredExpenses.reduce((sum, e) => sum + e.amount, 0)) * 100,
      count: filteredExpenses.filter(e => e.category === category).length
    })).sort((a, b) => b.amount - a.amount);

    // Growth metrics
    const currentMonthReceipts = filteredReceipts.filter(r => 
      isWithinInterval(r.date, { 
        start: startOfMonth(new Date()), 
        end: endOfMonth(new Date()) 
      })
    );
    const lastMonthReceipts = filteredReceipts.filter(r => 
      isWithinInterval(r.date, { 
        start: startOfMonth(subMonths(new Date(), 1)), 
        end: endOfMonth(subMonths(new Date(), 1)) 
      })
    );
    
    const currentMonthIncome = currentMonthReceipts.reduce((sum, r) => sum + r.amount, 0);
    const lastMonthIncome = lastMonthReceipts.reduce((sum, r) => sum + r.amount, 0);
    const growthRate = lastMonthIncome > 0 ? 
      ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;

    // Revenue forecasting (simple linear trend)
    const recentMonths = monthlyTrends.slice(-6);
    const avgGrowth = recentMonths.length > 1 ? 
      recentMonths.reduce((sum, month, index) => {
        if (index === 0) return 0;
        const prevMonth = recentMonths[index - 1];
        return sum + (prevMonth.income > 0 ? (month.income - prevMonth.income) / prevMonth.income : 0);
      }, 0) / (recentMonths.length - 1) : 0;

    const revenueForecasting = [];
    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    if (lastMonth) {
      for (let i = 1; i <= 6; i++) {
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);
        const forecastIncome = lastMonth.income * Math.pow(1 + avgGrowth, i);
        
        revenueForecasting.push({
          month: format(forecastDate, 'MMM yyyy'),
          forecastIncome: Math.max(0, forecastIncome),
          confidence: Math.max(0.3, 1 - (i * 0.1)) // Decreasing confidence over time
        });
      }
    }

    setAnalyticsData({
      monthlyTrends,
      clientPerformance: clientPerformance.slice(0, 10),
      paymentMethodAnalysis,
      profitMargins: monthlyTrends.map(m => ({
        month: m.month,
        margin: m.income > 0 ? ((m.profit / m.income) * 100) : 0
      })),
      growthMetrics: {
        currentMonthIncome,
        lastMonthIncome,
        growthRate,
        totalClients: clients.length,
        activeClients: clientPerformance.filter(c => c.receiptCount > 0).length,
        avgClientValue: clientPerformance.length > 0 ? 
          clientPerformance.reduce((sum, c) => sum + c.totalAmount, 0) / clientPerformance.length : 0,
        retentionRate: clientPerformance.filter(c => c.frequency > 0.5).length / Math.max(1, clientPerformance.length) * 100
      },
      yearlyComparison,
      topClients: clientPerformance.slice(0, 5),
      expenseAnalysis,
      revenueForecasting
    });
  };

  const handleExportAnalytics = async () => {
    try {
      const data = {
        generatedAt: new Date().toISOString(),
        dateRange,
        summary: analyticsData.growthMetrics,
        monthlyTrends: analyticsData.monthlyTrends,
        clientPerformance: analyticsData.clientPerformance,
        expenseAnalysis: analyticsData.expenseAnalysis,
        paymentMethods: analyticsData.paymentMethodAnalysis
      };
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arkive-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics for your business
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={generateAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleExportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.growthMetrics.growthRate?.toFixed(1)}%
              </p>
              <div className="flex items-center mt-1">
                {analyticsData.growthMetrics.growthRate >= 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${analyticsData.growthMetrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  vs last month
                </span>
              </div>
            </div>
            <TrendingUp className={`w-8 h-8 ${analyticsData.growthMetrics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Client Retention</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.growthMetrics.retentionRate?.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {analyticsData.growthMetrics.activeClients}/{analyticsData.growthMetrics.totalClients} active
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Client Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs. {analyticsData.growthMetrics.avgClientValue?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lifetime value per client
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs. {analyticsData.growthMetrics.currentMonthIncome?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Revenue this month
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends with Forecasting */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Trends & Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...analyticsData.monthlyTrends, ...analyticsData.revenueForecasting.map(f => ({ ...f, income: f.forecastIncome, forecast: true }))]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number, name: string) => {
                if (name === 'forecastIncome') return [`Rs. ${value.toLocaleString()} (Forecast)`, 'Revenue'];
                return [`Rs. ${value.toLocaleString()}`, name === 'income' ? 'Revenue' : name === 'expense' ? 'Expenses' : 'Profit'];
              }} />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} name="Revenue" />
              <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
              <Line type="monotone" dataKey="forecastIncome" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Expense Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expense Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.expenseAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Amount']} />
              <Bar dataKey="amount" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Yearly Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.yearlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, '']} />
            <Bar dataKey="income" fill="#10B981" name="Revenue" />
            <Bar dataKey="expense" fill="#EF4444" name="Expenses" />
            <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Client Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Performing Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Revenue</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transactions</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Frequency</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.clientPerformance.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{client.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {client.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
                    Rs. {client.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{client.receiptCount}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    Rs. {client.avgAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {client.frequency.toFixed(1)}/month
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.riskScore === 'Low' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      client.riskScore === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {client.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {client.lastPayment ? format(client.lastPayment, 'MMM dd, yyyy') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Smart Notifications Component
export function SmartNotifications() {
  const { receipts } = useReceipts();
  const { clients } = useClients();
  const { expenses } = useExpenses();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [customAlert, setCustomAlert] = useState({
    clientId: '',
    message: '',
    priority: 'medium' as const,
    type: 'warning' as const,
  });

  useEffect(() => {
    generateSmartNotifications();
  }, [receipts, clients, expenses]);

  const generateSmartNotifications = () => {
    const alerts = [];
    const now = new Date();
    const thirtyDaysAgo = subMonths(now, 1);
    const sixtyDaysAgo = subMonths(now, 2);

    // Inactive clients
    const inactiveClients = clients.filter(client => {
      const clientReceipts = receipts.filter(r => r.clientCnic === client.cnic);
      const lastPayment = clientReceipts.length > 0 ? 
        Math.max(...clientReceipts.map(r => r.date.getTime())) : null;
      return !lastPayment || lastPayment < thirtyDaysAgo.getTime();
    });

    if (inactiveClients.length > 0) {
      alerts.push({
        id: 'inactive-clients',
        type: 'warning',
        title: 'Inactive Clients Detected',
        message: `${inactiveClients.length} clients haven't made payments in the last 30 days`,
        action: 'View Clients',
        priority: 'medium',
        count: inactiveClients.length,
        details: inactiveClients.slice(0, 3).map(c => c.name).join(', ')
      });
    }

    // High expense months
    const currentMonthExpenses = expenses.filter(e => 
      isWithinInterval(e.date, { start: startOfMonth(now), end: endOfMonth(now) })
    ).reduce((sum, e) => sum + e.amount, 0);

    const avgMonthlyExpenses = expenses.length > 0 ? 
      expenses.reduce((sum, e) => sum + e.amount, 0) / 12 : 0;

    if (currentMonthExpenses > avgMonthlyExpenses * 1.5) {
      alerts.push({
        id: 'high-expenses',
        type: 'error',
        title: 'High Expenses Alert',
        message: `This month's expenses (Rs. ${currentMonthExpenses.toLocaleString()}) are 50% higher than average`,
        action: 'Review Expenses',
        priority: 'high',
        amount: currentMonthExpenses
      });
    }

    // Revenue milestones
    const totalRevenue = receipts.reduce((sum, r) => sum + r.amount, 0);
    const milestones = [100000, 500000, 1000000, 5000000, 10000000];
    const nextMilestone = milestones.find(m => m > totalRevenue);
    
    if (nextMilestone && totalRevenue > nextMilestone * 0.9) {
      alerts.push({
        id: 'milestone-approaching',
        type: 'success',
        title: 'Milestone Approaching!',
        message: `You're Rs. ${(nextMilestone - totalRevenue).toLocaleString()} away from Rs. ${(nextMilestone / 1000).toFixed(0)}K milestone`,
        action: 'View Progress',
        priority: 'low',
        progress: (totalRevenue / nextMilestone) * 100
      });
    }

    // Non-filer detection
    const nonFilers = clients.filter(client => {
      const clientReceipts = receipts.filter(r => r.clientCnic === client.cnic);
      const lastPayment = clientReceipts.length > 0 ? 
        Math.max(...clientReceipts.map(r => r.date.getTime())) : null;
      return !lastPayment || lastPayment < sixtyDaysAgo.getTime();
    });

    if (nonFilers.length > 0) {
      alerts.push({
        id: 'non-filers',
        type: 'error',
        title: 'Potential Non-Filers Detected',
        message: `${nonFilers.length} clients haven't filed/paid in the last 60 days`,
        action: 'Review Non-Filers',
        priority: 'high',
        clients: nonFilers.slice(0, 5).map(c => c.name).join(', ')
      });
    }

    // Cash flow analysis
    const currentMonthIncome = receipts.filter(r => 
      isWithinInterval(r.date, { start: startOfMonth(now), end: endOfMonth(now) })
    ).reduce((sum, r) => sum + r.amount, 0);

    if (currentMonthIncome < currentMonthExpenses) {
      alerts.push({
        id: 'negative-cashflow',
        type: 'error',
        title: 'Negative Cash Flow Warning',
        message: `Expenses (Rs. ${currentMonthExpenses.toLocaleString()}) exceed income (Rs. ${currentMonthIncome.toLocaleString()}) this month`,
        action: 'Review Finances',
        priority: 'high',
        deficit: currentMonthExpenses - currentMonthIncome
      });
    }

    // Top client dependency risk
    const clientRevenue = clients.map(client => {
      const clientReceipts = receipts.filter(r => r.clientCnic === client.cnic);
      return {
        name: client.name,
        revenue: clientReceipts.reduce((sum, r) => sum + r.amount, 0)
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const topClientRevenue = clientRevenue[0]?.revenue || 0;
    const dependencyRatio = totalRevenue > 0 ? (topClientRevenue / totalRevenue) * 100 : 0;

    if (dependencyRatio > 40) {
      alerts.push({
        id: 'client-dependency',
        type: 'warning',
        title: 'High Client Dependency Risk',
        message: `${clientRevenue[0]?.name} accounts for ${dependencyRatio.toFixed(1)}% of total revenue`,
        action: 'Diversify Client Base',
        priority: 'medium',
        percentage: dependencyRatio
      });
    }

    setNotifications(alerts);
  };

  const handleAddCustomAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const client = clients.find(c => c.id === customAlert.clientId);
    if (!client) return;

    const newAlert = {
      id: `custom-${Date.now()}`,
      type: customAlert.type,
      title: 'Custom Alert',
      message: `${client.name}: ${customAlert.message}`,
      action: 'Review Client',
      priority: customAlert.priority,
      custom: true
    };

    setNotifications(prev => [newAlert, ...prev]);
    
    // Also add to main notifications
    await db.createNotification({
      message: `Custom alert for ${client.name}: ${customAlert.message}`,
      type: customAlert.type,
      read: false,
      createdAt: new Date(),
    });

    setCustomAlert({
      clientId: '',
      message: '',
      priority: 'medium',
      type: 'warning',
    });
    setShowAddAlert(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered insights and alerts for your business
          </p>
        </div>
        <button
          onClick={() => setShowAddAlert(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Custom Alert
        </button>
      </div>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Good!</h3>
            <p className="text-gray-600 dark:text-gray-400">No alerts or notifications at this time.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-xl p-6 shadow-sm ${getPriorityColor(notification.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    {notification.details && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <strong>Details:</strong> {notification.details}
                      </p>
                    )}
                    {notification.clients && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <strong>Affected Clients:</strong> {notification.clients}
                      </p>
                    )}
                    {notification.progress && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress to milestone</span>
                          <span>{notification.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, notification.progress)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {notification.custom && (
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    {notification.action}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Custom Alert</h2>
            <form onSubmit={handleAddCustomAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client
                </label>
                <select
                  value={customAlert.clientId}
                  onChange={(e) => setCustomAlert({ ...customAlert, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.cnic})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alert Message
                </label>
                <textarea
                  value={customAlert.message}
                  onChange={(e) => setCustomAlert({ ...customAlert, message: e.target.value })}
                  placeholder="Enter alert message (e.g., 'Payment pending for tax filing')"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={customAlert.priority}
                  onChange={(e) => setCustomAlert({ ...customAlert, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={customAlert.type}
                  onChange={(e) => setCustomAlert({ ...customAlert, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAlert(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}