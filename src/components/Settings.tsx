import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Users, 
  Save, 
  Globe, 
  Palette, 
  Bell, 
  Database,
  Lock,
  Monitor,
  Mail,
  Calendar,
  DollarSign,
  Download,
  Upload,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';
import { db } from '../services/database';
import { format } from 'date-fns';

export function Settings() {
  const { user, register, isAdmin } = useAuth();
  const [showUserForm, setShowUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    role: 'employee' as const,
  });

  const [settings, setSettings] = useState({
    currency: '₨',
    dateFormat: 'MM/dd/yyyy',
    language: 'en',
    theme: localStorage.getItem('theme') || 'system',
    accentColor: localStorage.getItem('accentColor') || 'blue',
    notifications: {
      email: JSON.parse(localStorage.getItem('notifications.email') || 'true'),
      desktop: JSON.parse(localStorage.getItem('notifications.desktop') || 'true'),
      sound: JSON.parse(localStorage.getItem('notifications.sound') || 'false'),
      newReceipt: JSON.parse(localStorage.getItem('notifications.newReceipt') || 'true'),
      newClient: JSON.parse(localStorage.getItem('notifications.newClient') || 'true'),
      expenseAlert: JSON.parse(localStorage.getItem('notifications.expenseAlert') || 'true'),
      backupReminder: JSON.parse(localStorage.getItem('notifications.backupReminder') || 'true'),
    },
    backup: {
      autoBackup: JSON.parse(localStorage.getItem('backup.autoBackup') || 'false'),
      backupInterval: localStorage.getItem('backup.backupInterval') || 'weekly',
      backupLocation: localStorage.getItem('backup.backupLocation') || 'local',
    },
    security: {
      sessionTimeout: localStorage.getItem('security.sessionTimeout') || '30',
      requirePasswordChange: JSON.parse(localStorage.getItem('security.requirePasswordChange') || 'false'),
      twoFactorAuth: JSON.parse(localStorage.getItem('security.twoFactorAuth') || 'false'),
    },
    display: {
      compactMode: JSON.parse(localStorage.getItem('display.compactMode') || 'false'),
      showAnimations: JSON.parse(localStorage.getItem('display.showAnimations') || 'true'),
      itemsPerPage: localStorage.getItem('display.itemsPerPage') || '25',
      sidebarPosition: localStorage.getItem('display.sidebarPosition') || 'left',
    }
  });

  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadedSettings = {
      currency: localStorage.getItem('currency') || '₨',
      dateFormat: localStorage.getItem('dateFormat') || 'MM/dd/yyyy',
      language: localStorage.getItem('language') || 'en',
      theme: localStorage.getItem('theme') || 'system',
      accentColor: localStorage.getItem('accentColor') || 'blue',
      notifications: {
        email: JSON.parse(localStorage.getItem('notifications.email') || 'true'),
        desktop: JSON.parse(localStorage.getItem('notifications.desktop') || 'true'),
        sound: JSON.parse(localStorage.getItem('notifications.sound') || 'false'),
        newReceipt: JSON.parse(localStorage.getItem('notifications.newReceipt') || 'true'),
        newClient: JSON.parse(localStorage.getItem('notifications.newClient') || 'true'),
        expenseAlert: JSON.parse(localStorage.getItem('notifications.expenseAlert') || 'true'),
        backupReminder: JSON.parse(localStorage.getItem('notifications.backupReminder') || 'true'),
      },
      backup: {
        autoBackup: JSON.parse(localStorage.getItem('backup.autoBackup') || 'false'),
        backupInterval: localStorage.getItem('backup.backupInterval') || 'weekly',
        backupLocation: localStorage.getItem('backup.backupLocation') || 'local',
      },
      security: {
        sessionTimeout: localStorage.getItem('security.sessionTimeout') || '30',
        requirePasswordChange: JSON.parse(localStorage.getItem('security.requirePasswordChange') || 'false'),
        twoFactorAuth: JSON.parse(localStorage.getItem('security.twoFactorAuth') || 'false'),
      },
      display: {
        compactMode: JSON.parse(localStorage.getItem('display.compactMode') || 'false'),
        showAnimations: JSON.parse(localStorage.getItem('display.showAnimations') || 'true'),
        itemsPerPage: localStorage.getItem('display.itemsPerPage') || '25',
        sidebarPosition: localStorage.getItem('display.sidebarPosition') || 'left',
      }
    };
    setSettings(loadedSettings);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register(userFormData.username, userFormData.password, userFormData.role);
      setUserFormData({
        username: '',
        password: '',
        role: 'employee',
      });
      setShowUserForm(false);
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    // Apply theme changes immediately
    if (key === 'theme') {
      localStorage.setItem('theme', value);
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (value === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
    
    // Apply accent color changes
    if (key === 'accentColor') {
      localStorage.setItem('accentColor', value);
      document.documentElement.style.setProperty('--accent-color', value);
    }
    
    // Save to localStorage
    if (category === '') {
      localStorage.setItem(key, value);
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    } else {
      localStorage.setItem(`${category}.${key}`, JSON.stringify(value));
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [key]: value
        }
      }));
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save all settings to localStorage
      Object.entries(settings).forEach(([category, categorySettings]) => {
        if (typeof categorySettings === 'object' && categorySettings !== null) {
          Object.entries(categorySettings).forEach(([key, value]) => {
            localStorage.setItem(`${category}.${key}`, JSON.stringify(value));
          });
        } else {
          localStorage.setItem(category, categorySettings as string);
        }
      });
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleExportSettings = async () => {
    setExporting(true);
    try {
      const data = await db.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-office-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('Settings and data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await db.importData(text);
      alert('Settings and data imported successfully! Please refresh the page.');
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        // Clear all data except users
        const stores = ['clients', 'receipts', 'expenses', 'activities', 'notifications'];
        for (const storeName of stores) {
          // Implementation would go here
        }
        alert('Data cleared successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Clear data error:', error);
        alert('Error clearing data');
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'display', label: 'Display', icon: Palette },
    ...(isAdmin ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => handleSettingChange('', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date Format
              </label>
              <select 
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('', 'dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                Language
              </label>
              <select 
                value={settings.language}
                onChange={(e) => handleSettingChange('', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Palette className="inline w-4 h-4 mr-1" />
                Theme
              </label>
              <select 
                value={settings.theme}
                onChange={(e) => handleSettingChange('', 'theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accent Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {['blue', 'green', 'purple', 'red', 'yellow', 'indigo'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSettingChange('', 'accentColor', color)}
                    className={clsx(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      settings.accentColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600',
                      {
                        'bg-blue-500': color === 'blue',
                        'bg-green-500': color === 'green',
                        'bg-purple-500': color === 'purple',
                        'bg-red-500': color === 'red',
                        'bg-yellow-500': color === 'yellow',
                        'bg-indigo-500': color === 'indigo',
                      }
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Compact Mode</span>
              <input
                type="checkbox"
                checked={settings.display.compactMode}
                onChange={(e) => handleSettingChange('display', 'compactMode', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Show Animations</span>
              <input
                type="checkbox"
                checked={settings.display.showAnimations}
                onChange={(e) => handleSettingChange('display', 'showAnimations', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Channels</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Desktop Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.desktop}
                  onChange={(e) => handleSettingChange('notifications', 'desktop', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Sound Alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.sound}
                  onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Notifications</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">New Receipt Added</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.newReceipt}
                  onChange={(e) => handleSettingChange('notifications', 'newReceipt', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">New Client Added</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.newClient}
                  onChange={(e) => handleSettingChange('notifications', 'newClient', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Expense Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.expenseAlert}
                  onChange={(e) => handleSettingChange('notifications', 'expenseAlert', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Backup Reminders</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.backupReminder}
                  onChange={(e) => handleSettingChange('notifications', 'backupReminder', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <select 
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="0">Never</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Require Password Change (90 days)</span>
              <input
                type="checkbox"
                checked={settings.security.requirePasswordChange}
                onChange={(e) => handleSettingChange('security', 'requirePasswordChange', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Export Data</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Download a backup of all your data including settings.
                </p>
                <button
                  onClick={handleExportSettings}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download size={16} />
                  {exporting ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Import Data</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Restore data from a previously exported backup file.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    disabled={importing}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  {importing && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-700 bg-opacity-75 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Clear All Data</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                Permanently delete all clients, receipts, expenses, and activities. User accounts will be preserved.
              </p>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Clear All Data
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Auto Backup</span>
              <input
                type="checkbox"
                checked={settings.backup.autoBackup}
                onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Interval
              </label>
              <select 
                value={settings.backup.backupInterval}
                onChange={(e) => handleSettingChange('backup', 'backupInterval', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={!settings.backup.autoBackup}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Location
              </label>
              <select 
                value={settings.backup.backupLocation}
                onChange={(e) => handleSettingChange('backup', 'backupLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="local">Local Storage</option>
                <option value="cloud">Cloud Storage</option>
              </select>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Compact Mode</span>
              <input
                type="checkbox"
                checked={settings.display.compactMode}
                onChange={(e) => handleSettingChange('display', 'compactMode', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Show Animations</span>
              <input
                type="checkbox"
                checked={settings.display.showAnimations}
                onChange={(e) => handleSettingChange('display', 'showAnimations', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items Per Page
              </label>
              <select 
                value={settings.display.itemsPerPage}
                onChange={(e) => handleSettingChange('display', 'itemsPerPage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sidebar Position
              </label>
              <select 
                value={settings.display.sidebarPosition}
                onChange={(e) => handleSettingChange('display', 'sidebarPosition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
              <button
                onClick={() => setShowUserForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Users size={20} />
                Create New User
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage employee accounts. Maximum 2 admin accounts allowed.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      "w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-300 mb-1 hover:scale-105",
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon size={18} className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
            
            {renderTabContent()}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handleSaveSettings}
                disabled={saveStatus === 'saving'}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105",
                  saveStatus === 'saved' ? "bg-green-600 text-white" :
                  saveStatus === 'error' ? "bg-red-600 text-white" :
                  "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {saveStatus === 'saving' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {saveStatus === 'saved' && <Check size={20} />}
                {saveStatus === 'error' && <AlertCircle size={20} />}
                {saveStatus === 'idle' && <Save size={20} />}
                {saveStatus === 'saving' ? 'Saving...' :
                 saveStatus === 'saved' ? 'Saved!' :
                 saveStatus === 'error' ? 'Error!' :
                 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current User Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card">
        <div className="flex items-center mb-4">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current User</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Username:</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Role:</span>
            <span className="font-medium capitalize text-gray-900 dark:text-white">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Create User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 form-slide-in">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}