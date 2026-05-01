import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  ArrowDownToLine, 
  MoreVertical, 
  X, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  ShieldAlert, 
  CheckCircle2 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Inventory() {
  // --- STATE ---
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Electronics', stock_level: 0, reorder_point: 10, price: 0, supplier: ''
  });

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchInventory();
    
    // Close menu when clicking outside
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Logic
  useEffect(() => {
    const results = inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredInventory(results);
  }, [searchQuery, inventory]);

  // --- ACTIONS ---
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/inventory`, { 
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInventory(data);
      setFilteredInventory(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const isEdit = !!editingProduct;
    // Use the ID directly from the product object
    const targetId = isEdit ? editingProduct.id : null;
    
    const url = isEdit ? `${API_BASE}/inventory/${targetId}` : `${API_BASE}/inventory`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      name: formData.name,
      category: formData.category,
      stock_level: parseInt(formData.stock_level) || 0,
      reorder_point: parseInt(formData.reorder_point) || 0,
      price: parseFloat(formData.price) || 0,
      supplier: formData.supplier
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      let responseData = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      }

      if (!res.ok) {
        throw new Error(responseData.error || `Server Error (${res.status})`);
      }
      
      await fetchInventory();
      closeModal();
    } catch (err) {
      console.error("Save Error:", err);
      alert(`Update Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/inventory/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let responseData = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      }

      if (!res.ok) {
        throw new Error(responseData.error || `Delete failed (${res.status})`);
      }
      
      await fetchInventory();
    } catch (err) {
      console.error("Delete Error:", err);
      alert(`Delete Error: ${err.message}`);
    }
  };

  const handleExportCSV = () => {
    if (inventory.length === 0) return;
    const headers = ['ID', 'Product Name', 'Category', 'Stock', 'Threshold', 'Price (INR)', 'Supplier'];
    const rows = inventory.map(i => [i.id, `"${i.name}"`, i.category, i.stock_level, i.reorder_point, i.price, `"${i.supplier}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // --- HELPERS ---
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Electronics', stock_level: 0, reorder_point: 10, price: 0, supplier: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingProduct(item);
    setFormData({ ...item });
    setShowModal(true);
    setActiveMenuId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const getStockStatus = (item) => {
    if (item.stock_level === 0) return { label: 'Out of Stock', color: 'bg-danger', icon: ShieldAlert };
    if (item.stock_level <= item.reorder_point) return { label: 'Low Stock', color: 'bg-warning', icon: ShieldAlert };
    return { label: 'Healthy', color: 'bg-success', icon: CheckCircle2 };
  };

  // --- RENDER ---
  return (
    <div className="page-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-text">
          <h1 className="page-title">Inventory Control</h1>
          <p className="page-subtitle">Centralized asset management and automated reordering engine.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-primary shadow-glow" onClick={openAddModal}>
            <Plus size={18} /> Add Product
          </button>
          <button className="btn btn-export" onClick={handleExportCSV}>
            <ArrowDownToLine size={18} /> Export Ledger
          </button>
        </div>
      </div>

      {/* Utilities Section */}
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="search-container flex-1 max-w-md">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, category or supplier..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tighter">
          <span>Total SKU: {inventory.length}</span>
          <span className="w-1 h-1 bg-muted rounded-full"></span>
          <span>Alerts: {inventory.filter(i => i.stock_level <= i.reorder_point).length}</span>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="glass-panel data-table-wrapper crimson-glow stagger-1" style={{ overflow: 'visible' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset Information</th>
              <th>Classification</th>
              <th>Current Stock</th>
              <th>Threshold</th>
              <th>Price (INR)</th>
              <th>Supplier</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-muted font-medium">Synchronizing Global Ledger...</span>
                  </div>
                </td>
              </tr>
            ) : filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-muted italic">
                  No assets matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item, idx) => {
                const status = getStockStatus(item);
                const StatusIcon = status.icon;
                return (
                  <tr key={item.id} className={`animate-fade-in stagger-${(idx % 5) + 1}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-2 rounded-lg text-primary shadow-sm">
                          <Package size={16} />
                        </div>
                        <span className="font-bold text-white">{item.name}</span>
                      </div>
                    </td>
                    <td><span className="text-muted text-sm">{item.category}</span></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${status.color} transition-all duration-700`}
                            style={{ width: `${Math.min(100, (item.stock_level / 100) * 100)}%`, boxShadow: '0 0 10px currentColor' }}
                          />
                        </div>
                        <span className="font-bold">{item.stock_level}</span>
                      </div>
                    </td>
                    <td><span className="font-medium text-muted">{item.reorder_point}</span></td>
                    <td><span className="text-success font-bold">₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></td>
                    <td><span className="text-muted text-sm">{item.supplier}</span></td>
                    <td>
                      <span className={`badge ${status.color.replace('bg-', 'badge-')} shadow-sm`}>
                        <StatusIcon size={12} className="mr-1" /> {status.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-2 pr-4">
                        <button 
                          className="btn-icon-solid edit"
                          onClick={() => openEditModal(item)}
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="btn-icon-solid delete"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="glass-panel modal-content max-w-2xl w-full animate-scale-in" style={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ 
              background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), transparent)', 
              padding: '2rem 2.5rem', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 className="text-2xl text-white font-bold tracking-tight">
                  {editingProduct ? 'Update Asset Ledger' : 'Register New Inventory'}
                </h2>
                <p className="text-xs text-muted mt-1 uppercase tracking-widest font-bold">
                  {editingProduct ? 'System SKU: #' + editingProduct.id : 'Onboarding Phase 1: Classification'}
                </p>
              </div>
              <button onClick={closeModal} className="action-icon-btn" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSave} style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {/* Full Width Asset Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', marginLeft: '4px' }}>Asset Nomenclature</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                      className="input-field" 
                      style={{ paddingLeft: '3.2rem' }}
                      placeholder="e.g. Enterprise GPU Cluster v2" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Classification & Valuation */}
                <div className="flex flex-col gap-2">
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0', marginLeft: '4px' }}>Classification</label>
                  <select 
                    className="input-field"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Electronics</option>
                    <option>Hardware</option>
                    <option>Furniture</option>
                    <option>Materials</option>
                    <option>Office</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0', marginLeft: '4px' }}>Unit Value (INR)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00" 
                    required 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                {/* Inventory Levels */}
                <div className="flex flex-col gap-2">
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0', marginLeft: '4px' }}>Initial Stock</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value={formData.stock_level}
                    onChange={e => setFormData({...formData, stock_level: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0', marginLeft: '4px' }}>Reorder Point</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    required 
                    value={formData.reorder_point}
                    onChange={e => setFormData({...formData, reorder_point: e.target.value})}
                  />
                </div>

                {/* Supplier - Full Width */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', marginLeft: '4px' }}>Verified Strategic Supplier</label>
                  <input 
                    className="input-field" 
                    placeholder="Partner Organization Name" 
                    required 
                    value={formData.supplier}
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? 'Processing...' : (editingProduct ? 'Commit Changes' : 'Register Asset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
