import React, { useState } from 'react';
import {
  Home, Receipt, Users, CreditCard, BarChart3, Activity, HardDrive,
  Settings, LogOut, Menu, X, Moon, Sun, TrendingUp, ChevronLeft,
  ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'receipts', label: 'Receipts', icon: Receipt },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'expenses', label: 'Expenses', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'smart-notifications', label: 'Notifications', icon: Bell },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'backup', label: 'Backup/Restore', icon: HardDrive },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [themeTransition, setThemeTransition] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleDarkMode = () => {
    setThemeTransition(true);
    setTimeout(() => {
      setDarkMode(!darkMode);
      setTimeout(() => setThemeTransition(false), 300);
    }, 150);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={clsx("flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500", themeTransition && "animate-pulse")}>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white transition-all duration-300 hover:scale-110"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={clsx(
        "z-40 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-500 ease-in-out h-screen overflow-y-auto",
        sidebarOpen ? "fixed inset-y-0 left-0" : "fixed inset-y-0 left-0 -translate-x-full",
        "lg:translate-x-0 lg:static",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={clsx("border-b border-gray-200 dark:border-gray-700", sidebarCollapsed ? "p-4" : "p-6")}>
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <img 
                    src="/ChatGPT Image Jul 15, 2025, 02_36_04 PM.png" 
                    alt="Arkive Logo" 
                    className="w-8 h-8 mr-3"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Arkive</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tax Management</p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <img 
                  src="/ChatGPT Image Jul 15, 2025, 02_36_04 PM.png" 
                  alt="Arkive Logo" 
                  className="w-8 h-8 mx-auto"
                />
              )}
              <button
                onClick={toggleSidebarCollapse}
                className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all duration-300 hover:scale-110"
              >
                <div className={clsx("transition-transform duration-500", sidebarCollapsed ? "rotate-180" : "rotate-0")}>
                  {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </div>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center text-left rounded-lg transition-all duration-300 hover:scale-105",
                    sidebarCollapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                    currentPage === item.id
                      ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400 shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={sidebarCollapsed ? 26 : 20} className={clsx(
                    "transition-all duration-300",
                    sidebarCollapsed ? "mx-auto" : "mr-3",
                    currentPage === item.id && "scale-110"
                  )} />
                  {!sidebarCollapsed && (
                    <span className="transition-all duration-300 opacity-100">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={clsx("border-t border-gray-200 dark:border-gray-700", sidebarCollapsed ? "p-3" : "p-4")}>
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110"
                    title="Logout"
                  >
                    <LogOut size={22} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-500 hover:scale-110 hover:rotate-12"
                  >
                    <div className={clsx("transition-all duration-500", themeTransition && "animate-spin")}>
                      {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600 dark:text-gray-400" />}
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <button onClick={toggleDarkMode} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-500 hover:scale-110 hover:rotate-12">
                  <div className={clsx("transition-all duration-500", themeTransition && "animate-spin")}>
                    {darkMode ? <Sun size={26} className="text-yellow-500" /> : <Moon size={26} className="text-gray-600 dark:text-gray-400" />}
                  </div>
                </button>
                <button onClick={handleLogout} className="p-3 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <LogOut size={26} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}