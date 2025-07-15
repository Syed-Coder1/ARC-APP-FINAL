import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  Bell, 
  Plus,
  X,
  Check,
  AlertCircle,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';

interface DashboardProps {
  onOpenForm: (formType: 'receipt' | 'client' | 'expense') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenForm }) => {
  const { 
    receipts, 
    clients, 
    expenses, 
    notifications, 
    markNotificationAsRead,
    markAllNotificationsAsRead 
  } = useDatabase();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Calculate stats
  const totalRevenue = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const unreadNotifications = notifications.filter(n => !n.read);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadNotifications.length === 0) return;
    
    setIsMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead();
      setTimeout(() => {
        setShowNotifications(false);
        setIsMarkingAllRead(false);
      }, 500);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setIsMarkingAllRead(false);
    }
  };

  // Quick Actions data
  const quickActions = [
    {
      title: 'New Receipt',
      description: 'Add a new receipt entry',
      icon: Receipt,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => onOpenForm('receipt')
    },
    {
      title: 'Add Client',
      description: 'Register a new client',
      icon: Users,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => onOpenForm('client')
    },
    {
      title: 'Add Expense',
      description: 'Record a new expense',
      icon: DollarSign,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: () => onOpenForm('expense')
    }
  ];

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Revenue',
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Total Clients',
      value: clients.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Total Expenses',
      value: `Rs. ${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Net Profit',
      value: `Rs. ${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Bell className="w-6 h-6" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-slideInRight">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <div className="flex items-center space-x-2">
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAllRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50 transition-colors duration-200"
                      >
                        {isMarkingAllRead ? 'Marking...' : 'Mark All as Read'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                          notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {notification.type === 'success' ? (
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          ) : notification.type === 'warning' ? (
                            <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <Bell className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={card.title}
            className={`${card.bgColor} p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover-lift transition-all duration-300`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.color} mt-2`}>
                  {card.value}
                </p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={action.action}
              className={`${action.color} ${action.hoverColor} text-white p-6 rounded-lg transition-all duration-300 hover-lift group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
                <Plus className="w-5 h-5 ml-auto group-hover:rotate-90 transition-transform duration-300" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Receipts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Receipts
            </h2>
            <Receipt className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {receipts.slice(0, 5).map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {receipt.clientName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(receipt.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  Rs. {receipt.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {receipts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No receipts yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Expenses
            </h2>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {expense.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  Rs. {expense.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No expenses yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};