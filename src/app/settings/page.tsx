'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Palette, Bell, Shield, Tag, Download, Upload, Database, Plus, X } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { CategoryManager } from '@/components/categories';
import { useSettingsStore } from '@/stores/settings-store';
import { DatabaseService } from '@/lib/db';
import type { UpdateUserSettings } from '@/lib/types';

export default function SettingsPage() {
  const {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSettings,
    resetSettings,
    clearError
  } = useSettingsStore();

  const [formData, setFormData] = useState<UpdateUserSettings>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'data'>('general');
  const [newUnit, setNewUnit] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        lowStockThreshold: settings.lowStockThreshold,
        expirationWarningDays: settings.expirationWarningDays,
        defaultLocation: settings.defaultLocation,
        preferredUnits: settings.preferredUnits,
        theme: settings.theme,
        reducedMotion: settings.reducedMotion
      });
    }
  }, [settings]);

  // Apply theme changes immediately
  useEffect(() => {
    if (formData.theme) {
      const root = document.documentElement;
      if (formData.theme === 'dark') {
        root.classList.add('dark');
      } else if (formData.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  }, [formData.theme]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle form changes
  const handleChange = (field: keyof UpdateUserSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setHasChanges(false);
      setSuccessMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Handle reset
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }
    try {
      await resetSettings();
      setHasChanges(false);
      setSuccessMessage('Settings reset to defaults!');
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  // Handle adding a new unit
  const handleAddUnit = () => {
    if (!newUnit.trim()) return;
    const currentUnits = formData.preferredUnits || settings?.preferredUnits || [];
    if (currentUnits.includes(newUnit.trim())) {
      return; // Unit already exists
    }
    handleChange('preferredUnits', [...currentUnits, newUnit.trim()]);
    setNewUnit('');
  };

  // Handle removing a unit
  const handleRemoveUnit = (unit: string) => {
    const currentUnits = formData.preferredUnits || settings?.preferredUnits || [];
    handleChange('preferredUnits', currentUnits.filter(u => u !== unit));
  };

  // Handle data export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await DatabaseService.exportData();
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kitchen-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccessMessage('Data exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle data import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!confirm('Importing will replace all current data. Are you sure you want to continue?')) {
        return;
      }
      
      await DatabaseService.importData(data);
      
      // Reload settings and categories
      await loadSettings();
      
      setSuccessMessage('Data imported successfully!');
      
      // Refresh the page to reload all data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please ensure the file is a valid backup file.');
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Settings
          </h1>
          <p className="mt-2 text-gray-600">
            Customize your kitchen inventory experience
          </p>
        </div>
        
        {activeTab === 'general' && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <p className="text-green-800">{successMessage}</p>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Tag className="h-4 w-4 inline mr-2" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'data'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database className="h-4 w-4 inline mr-2" />
          Data Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? (
        <div className="space-y-6">
          {/* Inventory Settings */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Inventory Alerts</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.lowStockThreshold || 5}
                  onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Items with quantity at or below this number will be marked as low stock
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Warning (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.expirationWarningDays || 7}
                  onChange={(e) => handleChange('expirationWarningDays', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Show expiration warnings this many days in advance
                </p>
              </div>
            </div>
          </Card>

          {/* Default Preferences */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Default Preferences</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Storage Location
                </label>
                <select
                  value={formData.defaultLocation || 'pantry'}
                  onChange={(e) => handleChange('defaultLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fridge">Fridge</option>
                  <option value="freezer">Freezer</option>
                  <option value="pantry">Pantry</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  New items will default to this storage location
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Units
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formData.preferredUnits || settings?.preferredUnits || []).map((unit) => (
                    <span
                      key={unit}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {unit}
                      <button
                        onClick={() => handleRemoveUnit(unit)}
                        className="hover:text-blue-900"
                        aria-label={`Remove ${unit}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add new unit (e.g., kg, gallons)"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddUnit()}
                  />
                  <Button
                    onClick={handleAddUnit}
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  These units will be available when adding inventory items
                </p>
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={formData.theme || 'system'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.reducedMotion || false}
                    onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Reduce Motion
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Minimize animations and transitions for better accessibility
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : activeTab === 'categories' ? (
        <CategoryManager />
      ) : (
        /* Data Management Tab */
        <div className="space-y-6">
          {/* Export Data */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Download a backup of all your inventory data, shopping lists, categories, and settings.
              This file can be used to restore your data later or transfer it to another device.
            </p>
            
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </Card>

          {/* Import Data */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Import Data</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Restore your data from a previously exported backup file. 
              <strong className="text-red-600"> Warning: This will replace all current data.</strong>
            </p>
            
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {isImporting && (
              <p className="text-sm text-gray-600 mt-2">
                Importing data... Please wait.
              </p>
            )}
          </Card>

          {/* Database Statistics */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Database Information</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Database Name</span>
                <span className="font-medium text-gray-900">KitchenInventoryDB</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Storage Type</span>
                <span className="font-medium text-gray-900">IndexedDB (Browser)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Data Location</span>
                <span className="font-medium text-gray-900">Local Device Only</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              All data is stored locally on your device. Regular backups are recommended to prevent data loss.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}