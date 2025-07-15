import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Plus
} from 'lucide-react';
import { useReceipts, useClients, useExpenses } from '../hooks/useDatabase';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { db } from '../services/database';

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
    growthMetrics: {}
  });

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
        receiptCount: monthReceipts.length
      });
      
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Client performance analysis
    const clientPerformance = clients.map(client => {
      const clientReceipts = filteredReceipts.filter(r => r.clientCnic === client.cnic);
      const totalAmount = clientReceipts.reduce((sum, r) => sum + r.amount, 0);
      const avgAmount = clientReceipts.length > 0 ? totalAmount / clientReceipts.length : 0;
      
      return {
        name: client.name,
        type: client.type,
        totalAmount,
        receiptCount: clientReceipts.length,
        avgAmount,
        lastPayment: clientReceipts.length > 0 ? 
          Math.max(...clientReceipts.map(r => r.date.getTime())) : null
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);

    // Payment method analysis
    const paymentMethods = filteredReceipts.reduce((acc, receipt) => {
      acc[receipt.paymentMethod] = (acc[receipt.paymentMethod] || 0) + receipt.amount;
      return acc;
    }, {});
    
    const paymentMethodAnalysis = Object.entries(paymentMethods).map(([method, amount]) => ({
      method: method.replace('_', ' ').toUpperCase(),
      amount,
      percentage: (amount / filteredReceipts.reduce((sum, r) => sum + r.amount, 0)) * 100
    }));

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

    setAnalyticsData({
      monthlyTrends,
      clientPerformance,
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
        activeClients: clientPerformance.filter(c => c.receiptCount > 0).length
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={generateAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.growthMetrics.growthRate?.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${analyticsData.growthMetrics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.growthMetrics.activeClients}/{analyticsData.growthMetrics.totalClients}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.profitMargins.length > 0 ? 
                  (analyticsData.profitMargins.reduce((sum, p) => sum + p.margin, 0) / analyticsData.profitMargins.length).toFixed(1) : 0}%
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
                ₨{analyticsData.growthMetrics.currentMonthIncome?.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₨${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.paymentMethodAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {analyticsData.paymentMethodAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₨${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Performing Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Receipts</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.clientPerformance.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{client.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{client.type}</td>
                  <td className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
                    ₨{client.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{client.receiptCount}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    ₨{client.avgAmount.toLocaleString()}
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
        priority: 'medium'
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
        message: `This month's expenses are 50% higher than average`,
        action: 'Review Expenses',
        priority: 'high'
      });
    }

    // Revenue milestones
    const totalRevenue = receipts.reduce((sum, r) => sum + r.amount, 0);
    const milestones = [100000, 500000, 1000000, 5000000];
    const nextMilestone = milestones.find(m => m > totalRevenue);
    
    if (nextMilestone && totalRevenue > nextMilestone * 0.9) {
      alerts.push({
        id: 'milestone-approaching',
        type: 'success',
        title: 'Milestone Approaching!',
        message: `You're ${((nextMilestone - totalRevenue) / 1000).toFixed(0)}K away from ₨${(nextMilestone / 1000).toFixed(0)}K milestone`,
        action: 'View Progress',
        priority: 'low'
      });
    }

    // Non-filer detection (clients with no payments in last 60 days)
    const nonFilers = clients.filter(client => {
      const clientReceipts = receipts.filter(r => r.clientCnic === client.cnic);
      const lastPayment = clientReceipts.length > 0 ? 
        Math.max(...clientReceipts.map(r => r.date.getTime())) : null;
      const sixtyDaysAgo = subMonths(now, 2);
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

    // Pending work alerts (clients with recent activity but no recent payments)
    const pendingWork = clients.filter(client => {
      const clientReceipts = receipts.filter(r => r.clientCnic === client.cnic);
      const recentReceipts = clientReceipts.filter(r => 
        isWithinInterval(r.date, { start: subMonths(now, 1), end: now })
      );
      return recentReceipts.length === 0 && clientReceipts.length > 0;
    });

    if (pendingWork.length > 0) {
      alerts.push({
        id: 'pending-work',
        type: 'warning',
        title: 'Pending Work Detected',
        message: `${pendingWork.length} clients may have pending work or payments`,
        action: 'Review Pending',
        priority: 'medium',
        clients: pendingWork.slice(0, 3).map(c => c.name).join(', ')
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getIcon = (type) => {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Notifications</h1>
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
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    {notification.clients && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <strong>Clients:</strong> {notification.clients}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
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

// Quick Actions Component
export function QuickActions() {
  const [recentActions, setRecentActions] = useState([]);

  const quickActionItems = [
    {
      id: 'new-receipt',
      title: 'New Receipt',
      description: 'Create a new payment receipt',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => console.log('New Receipt')
    },
    {
      id: 'new-client',
      title: 'Add Client',
      description: 'Register a new client',
      icon: Users,
      color: 'bg-green-500',
      action: () => console.log('New Client')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports and data',
      icon: Download,
      color: 'bg-purple-500',
      action: () => console.log('Export Data')
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      color: 'bg-orange-500',
      action: () => console.log('Analytics')
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Actions</h3>
        <div className="space-y-3">
          {recentActions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No recent actions to display
            </p>
          ) : (
            recentActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{action.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{action.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}