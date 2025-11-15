import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
// @ts-ignore - recharts types issue
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Package,
  ArrowLeft,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Loader2,
  X,
  Check,
  Download,
  Filter
} from 'lucide-react';

interface InventoryItem {
  id: string;
  item_name: string;
  sku: string;
  category: string;
  quantity: number;
  reorder_level: number;
  unit_price: number;
  supplier_info: any;
  created_at: string;
  updated_at: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const CATEGORIES = [
  'Electronics',
  'Office Supplies',
  'Raw Materials',
  'Finished Goods',
  'Packaging',
  'Tools & Equipment',
  'Other'
];

export default function InventoryTrackerModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const [formData, setFormData] = useState({
    itemName: '',
    sku: '',
    category: '',
    quantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
    supplierName: '',
    supplierContact: ''
  });

  useEffect(() => {
    loadInventory();
    loadAnalytics();
    loadLowStock();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, stockFilter]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('inventory-tracker', {
        body: { action: 'get_all' }
      });

      if (error) throw error;
      if (data?.success && data.data?.items) {
        setItems(data.data.items);
      }
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      alert('Failed to load inventory: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('inventory-tracker', {
        body: { action: 'get_analytics' }
      });

      if (error) throw error;
      if (data?.success) {
        setAnalytics(data.data);
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadLowStock = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('inventory-tracker', {
        body: { action: 'get_low_stock' }
      });

      if (error) throw error;
      if (data?.success && data.data?.items) {
        setLowStockItems(data.data.items);
      }
    } catch (error: any) {
      console.error('Error loading low stock:', error);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Stock level filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.quantity <= item.reorder_level && item.quantity > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.quantity === 0);
    } else if (stockFilter === 'normal') {
      filtered = filtered.filter(item => item.quantity > item.reorder_level);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('inventory-tracker', {
        body: {
          action: 'create',
          itemName: formData.itemName,
          sku: formData.sku,
          category: formData.category,
          quantity: formData.quantity,
          reorderLevel: formData.reorderLevel,
          unitPrice: formData.unitPrice,
          supplierInfo: {
            name: formData.supplierName,
            contact: formData.supplierContact
          }
        }
      });

      if (error) throw error;
      
      setShowAddModal(false);
      resetForm();
      await loadInventory();
      await loadAnalytics();
      await loadLowStock();
    } catch (error: any) {
      console.error('Error adding item:', error);
      alert('Failed to add item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('inventory-tracker', {
        body: {
          action: 'update',
          itemId: selectedItem.id,
          itemName: formData.itemName,
          sku: formData.sku,
          category: formData.category,
          quantity: formData.quantity,
          reorderLevel: formData.reorderLevel,
          unitPrice: formData.unitPrice,
          supplierInfo: {
            name: formData.supplierName,
            contact: formData.supplierContact
          }
        }
      });

      if (error) throw error;
      
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      await loadInventory();
      await loadAnalytics();
      await loadLowStock();
    } catch (error: any) {
      console.error('Error updating item:', error);
      alert('Failed to update item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('inventory-tracker', {
        body: {
          action: 'delete',
          itemId: itemId
        }
      });

      if (error) throw error;
      
      await loadInventory();
      await loadAnalytics();
      await loadLowStock();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.item_name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      reorderLevel: item.reorder_level,
      unitPrice: item.unit_price,
      supplierName: item.supplier_info?.name || '',
      supplierContact: item.supplier_info?.contact || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      sku: '',
      category: '',
      quantity: 0,
      reorderLevel: 0,
      unitPrice: 0,
      supplierName: '',
      supplierContact: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Item Name', 'SKU', 'Category', 'Quantity', 'Reorder Level', 'Unit Price', 'Total Value', 'Status'];
    const csvData = filteredItems.map(item => [
      item.item_name,
      item.sku,
      item.category,
      item.quantity,
      item.reorder_level,
      item.unit_price,
      (item.quantity * item.unit_price).toFixed(2),
      item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.reorder_level ? 'Low Stock' : 'Normal'
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (item.quantity <= item.reorder_level) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Smart Inventory Tracker</h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
                <p className="text-sm text-orange-700">
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need{lowStockItems.length === 1 ? 's' : ''} restocking
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.overview.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${analytics.overview.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{analytics.overview.lowStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{analytics.overview.outOfStockCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              {/* @ts-ignore */}
              <ResponsiveContainer width="100%" height={250}>
                {/* @ts-ignore */}
                <PieChart>
                  {/* @ts-ignore */}
                  <Pie
                    data={Object.entries(analytics.categoryBreakdown).map(([name, data]: [string, any]) => ({
                      name,
                      value: data.count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.keys(analytics.categoryBreakdown).map((entry, index) => (
                      // @ts-ignore
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {/* @ts-ignore */}
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Items by Value</h3>
              {/* @ts-ignore */}
              <ResponsiveContainer width="100%" height={250}>
                {/* @ts-ignore */}
                <BarChart data={analytics.topItemsByValue}>
                  {/* @ts-ignore */}
                  <CartesianGrid strokeDasharray="3 3" />
                  {/* @ts-ignore */}
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  {/* @ts-ignore */}
                  <YAxis />
                  {/* @ts-ignore */}
                  <Tooltip />
                  {/* @ts-ignore */}
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="normal">Normal Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No inventory items found. Add your first item to get started!
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reorder_level}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.unit_price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level *</label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Contact</label>
                <input
                  type="text"
                  value={formData.supplierContact}
                  onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={loading || !formData.itemName || !formData.category}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                  <Check className="h-5 w-5 mr-2" />
                  Add Item
                </>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level *</label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Contact</label>
                <input
                  type="text"
                  value={formData.supplierContact}
                  onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                disabled={loading || !formData.itemName || !formData.category}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                  <Check className="h-5 w-5 mr-2" />
                  Save Changes
                </>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
