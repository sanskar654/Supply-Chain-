import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Truck, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Box, Navigation, BellRing } from 'lucide-react';

const DashboardStat = ({ title, value, icon: Icon, trend, trendValue, color, delay }) => (
  <div className={`glass-panel stat-card animate-fade-in stagger-${delay}`}>
    <div className="stat-header">
      <div className="stat-icon" style={{ background: `var(--${color}-light)`, color: `var(--${color})` }}>
        <Icon size={22} />
      </div>
      <div className={`trend-indicator ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}
      </div>
    </div>
    <div className="stat-body">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{title}</p>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, color, delay, onClick }) => (
  <button className={`action-btn animate-fade-in stagger-${delay}`} onClick={onClick}>
    <div className="action-icon-wrapper" style={{ background: `var(--${color})` }}>
      <Icon size={20} />
    </div>
    <div className="action-text">
      <span className="action-label">{label}</span>
      <div className="action-plus">
        <Plus size={12} />
      </div>
    </div>
  </button>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ inventoryValue: 0, activeShipments: 0, forecastedGrowth: '0%', lowStock: 0 });
  const [demandData, setDemandData] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  const userName = JSON.parse(localStorage.getItem('user'))?.fullName || 'Guest User';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const statsRes = await fetch('http://localhost:5000/api/stats', { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(prev => ({ ...prev, ...statsData }));
        }

        const analyticsRes = await fetch('http://localhost:5000/api/analytics', { headers });
        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          if (aData.length > 0) {
            setDemandData(aData.map(d => ({ 
              month: d.date.split('-').slice(1).join('/'), 
              worth: d.value, 
              dispatch: d.dispatch_count || 0 
            })));
          }
        }

        const invRes = await fetch('http://localhost:5000/api/inventory', { headers });
        if (invRes.ok) {
          const iData = await invRes.json();
          if (iData.length > 0) setInventory(iData);
        }
      } catch (err) {
        console.warn('Dashboard Sync Error');
      }
    };
    
    fetchData();
  }, []);

  const formatStatValue = (val) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="page-content animate-fade-in">
      <div className="page-header">
        <div className="header-text">
          <h1 className="page-title">Welcome back, {userName.split(' ')[0]}</h1>
          <p className="page-subtitle">Your supply chain optimization engine is live.</p>
        </div>
      </div>

      <div className="quick-actions-row">
        <QuickActionButton icon={Box} label="Add Product" color="primary" delay={1} onClick={() => navigate('/inventory')} />
        <QuickActionButton icon={Truck} label="Add Shipment" color="accent" delay={2} onClick={() => navigate('/logistics')} />
        <QuickActionButton icon={BellRing} label="Setup Alert" color="warning" delay={3} onClick={() => navigate('/analytics')} />
        <QuickActionButton icon={Navigation} label="Plan Route" color="success" delay={4} onClick={() => navigate('/logistics')} />
      </div>

      <div className="dashboard-grid">
        <div className="stats-row">
          <DashboardStat title="Inventory Value" value={formatStatValue(stats.inventoryValue)} icon={Package} trend={stats.forecastedGrowth.startsWith('+') ? 'up' : 'down'} trendValue={stats.forecastedGrowth} color="primary" delay={1} />
          <DashboardStat title="Active Shipments" value={stats.activeShipments} icon={Truck} trend="up" trendValue="Live" color="accent" delay={2} />
          <DashboardStat title="System Growth" value={stats.forecastedGrowth} icon={TrendingUp} trend="up" trendValue="High" color="success" delay={3} />
          <DashboardStat title="Low Stock Alerts" value={stats.lowStock} icon={AlertTriangle} trend="down" trendValue="Alert" color="danger" delay={4} />
        </div>

        <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
          <div className="glass-panel chart-container" style={{ padding: '2rem', height: '450px' }}>
            <div className="chart-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 className="chart-title">Valuation Velocity</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '4px' }}>Daily tracking of total asset worth across your entire inventory.</p>
              </div>
              <span className="badge badge-success">Live Tracking</span>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>TOTAL ASSET WORTH (₹)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '3px', opacity: 0.6 }}></div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>DISPATCHED UNITS</span>
              </div>
            </div>

            <div className="chart-wrapper" style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandData}>
                  <defs>
                    <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val.toLocaleString()} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'var(--accent)', fontSize: 10}} />
                  <RechartsTooltip 
                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(val, name) => [
                      name === 'dispatch' ? `${val} Units` : `₹${val.toLocaleString()}`, 
                      name === 'dispatch' ? 'Dispatched' : 'Asset Worth'
                    ]}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="worth" stroke="var(--primary)" strokeWidth={3} fill="url(#colorWorth)" name="worth" />
                  <Area yAxisId="right" type="step" dataKey="dispatch" stroke="var(--accent)" strokeWidth={2} fill="none" name="dispatch" opacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel chart-container" style={{ padding: '2rem', height: '450px' }}>
            <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="chart-title">Stock Overview</h3>
              <p className="text-muted text-xs">Inventory safety thresholds per product class</p>
            </div>
            <div className="chart-wrapper" style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventory} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#fff', fontSize: 11}} width={70} />
                  <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                  <Bar dataKey="stock_level" fill="var(--primary)" barSize={10} radius={[0, 4, 4, 0]} name="On Hand" />
                  <Bar dataKey="reorder_point" fill="var(--danger)" barSize={4} radius={[0, 4, 4, 0]} name="Safety Limit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
