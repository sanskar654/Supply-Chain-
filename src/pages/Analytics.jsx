import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Analytics() {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ inventoryValue: 0, forecastedGrowth: '0%' });
  const [loading, setLoading] = useState(true);
  const [activeStrategy, setActiveStrategy] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [invRes, statsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`, { headers }),
        fetch(`${API_BASE}/stats`, { headers }),
        fetch(`${API_BASE}/analytics`, { headers })
      ]);
      const invData = await invRes.json();
      const statsData = await statsRes.json();
      const anaData = await analyticsRes.json();
      
      setInventory(invData);
      setStats(statsData);
      
      // Transform daily snapshots for trend chart
      const mappedTrend = anaData.map(d => ({
        name: d.date.split('-').slice(1).join('/'),
        worth: d.value,
        dispatch: d.dispatch_count || 0
      }));
      setTrendData(mappedTrend);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CHART DATA GENERATION ---
  const [trendData, setTrendData] = useState([]);

  const distributionData = inventory.length > 0 
    ? inventory.map(item => ({ name: item.name, value: item.stock_level * item.price }))
    : [{ name: 'Empty', value: 0 }];

  const handleGenerateReport = () => {
    const totalValueFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(stats.inventoryValue);
    const date = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });
    
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
      <html>
        <head>
          <title>AI Strategic Intelligence Report - ${date}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #1e293b; line-height: 1.5; background: #fff; }
            .header { border-bottom: 3px solid #000; padding-bottom: 25px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-weight: 900; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .meta { text-align: right; font-size: 11px; color: #64748b; font-weight: bold; }
            h1 { font-size: 32px; font-weight: 900; margin-bottom: 10px; letter-spacing: -1px; }
            .subtitle { color: #6366f1; font-weight: 700; margin-bottom: 40px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .section { margin-bottom: 50px; }
            .section-title { font-size: 11px; font-weight: 950; color: #000; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px; }
            .ai-badge { display: inline-block; background: #eef2ff; color: #6366f1; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 800; margin-bottom: 15px; }
            .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 40px; }
            .stat-box { border-left: 4px solid #6366f1; padding-left: 20px; }
            .stat-val { font-size: 24px; font-weight: 800; color: #000; }
            .stat-lbl { font-size: 11px; color: #64748b; margin-top: 5px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 15px; background: #f8fafc; font-size: 10px; text-transform: uppercase; font-weight: 900; color: #475569; border-bottom: 2px solid #e2e8f0; }
            td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 500; }
            .risk-critical { color: #ef4444; font-weight: 800; }
            .risk-optimal { color: #10b981; font-weight: 800; }
            .ai-insight { background: #f8fafc; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 30px; position: relative; }
            .ai-insight:before { content: 'AI PREDICTIVE ANALYSIS'; position: absolute; top: -10px; left: 20px; background: #6366f1; color: #fff; padding: 2px 10px; font-size: 9px; font-weight: 900; border-radius: 4px; }
            .footer { margin-top: 100px; padding-top: 30px; border-top: 1px solid #e2e8f0; font-size: 10px; text-align: center; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Supply Chain AI <span style="color:#6366f1">●</span> Strategic Intelligence</div>
            <div class="meta">REF: AI-AUDIT-${Math.floor(Math.random() * 90000) + 10000}<br>DATE: ${date}</div>
          </div>
          
          <div class="section">
            <div class="ai-badge">AI CONFIDENCE: 99.4%</div>
            <h1>Executive Supply Audit</h1>
            <div class="subtitle">Predictive Structural Analysis & Financial Risk Exposure</div>
            <p style="font-size: 15px; color: #475569; max-width: 800px;">This automated diagnostic examines real-time inventory velocity, capital exposure, and logistics continuity. Our predictive models have identified the following structural state for your operation.</p>
          </div>

          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-val">${totalValueFormatted}</div>
              <div class="stat-lbl">Capital Exposure (Inventory)</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">${stats.forecastedGrowth}</div>
              <div class="stat-lbl">Next-Quarter Opportunity</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">${inventory.length}</div>
              <div class="stat-lbl">Monitored Asset Class</div>
            </div>
          </div>

          <div class="section">
            <span class="section-title">Asset Integrity Matrix</span>
            <table>
              <thead>
                <tr>
                  <th>Asset Classification</th>
                  <th>On-Hand</th>
                  <th>Unit Price</th>
                  <th>Financial Load</th>
                  <th>Stability Status</th>
                </tr>
              </thead>
              <tbody>
                ${inventory.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.stock_level} Units</td>
                    <td>₹${item.price.toLocaleString('en-IN')}</td>
                    <td>₹${(item.stock_level * item.price).toLocaleString('en-IN')}</td>
                    <td class="${item.stock_level <= item.reorder_point ? 'risk-critical' : 'risk-optimal'}">
                      ${item.stock_level <= item.reorder_point ? 'CRITICAL (UNDER THRESHOLD)' : 'OPTIMAL'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="ai-insight">
              <p style="margin: 0; font-size: 15px; line-height: 1.7; font-weight: 500;">
                <strong>STRATEGIC MITIGATION PROTOCOL:</strong> ${activeStrategy ? activeStrategy.desc : "Current structural data indicates high operational stability. Predictive modeling suggests a pivot toward warehouse optimization for Q4 to maximize margin retention. Continuity risks remain within acceptable deviation ranges."}
              </p>
            </div>
          </div>

          <div class="footer">
            Confidential Proprietary Document - Generated by Neural Supply Systems v4.2.0
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const handleApplyStrategy = () => {
    const lowStockItem = inventory.find(i => i.stock_level <= i.reorder_point);
    if (lowStockItem) {
      setActiveStrategy({
        title: "Aggressive Restocking",
        desc: `Your ${lowStockItem.name} stock is critical. AI suggests immediate bulk purchase to avoid 15% revenue loss.`,
        action: "Initiate PO #9921",
        type: "risk"
      });
    } else {
      setActiveStrategy({
        title: "Inventory Optimization",
        desc: "All stock levels healthy. AI suggests maintaining current buffer while optimizing warehouse costs.",
        action: "Generate Efficiency Report",
        type: "safe"
      });
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Intelligence Hub</h1>
          <p className="page-subtitle">Predictive modeling and supply chain risk assessment.</p>
        </div>
        <button className="btn btn-primary shadow-glow" onClick={handleApplyStrategy}>
          <BrainCircuit size={18} /> Apply Strategy
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
        {/* Left Column: Charts */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Growth Chart */}
          <div className="glass-panel crimson-glow" style={{ padding: '2rem', height: '450px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <TrendingUp size={24} className="text-primary" />
                  Valuation Forecast
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '4px' }}>Projected total inventory worth over the current operational cycle.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}>Growth Index</span>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{stats.forecastedGrowth}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>VALUATION TREND (₹)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '3px', opacity: 0.6 }}></div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-muted)' }}>DISPATCHED UNITS</span>
              </div>
            </div>
            
            <div style={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                    formatter={(val, name) => [
                      name === 'dispatch' ? `${val} Units` : `₹${val.toLocaleString()}`, 
                      name === 'dispatch' ? 'Dispatched' : 'Asset Worth'
                    ]}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="worth" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorWorth)" name="worth" />
                  <Area yAxisId="right" type="step" dataKey="dispatch" stroke="var(--accent)" strokeWidth={2} fill="none" name="dispatch" opacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Bar Chart */}
          <div className="glass-panel indigo-glow" style={{ padding: '2rem', height: '350px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart3 size={24} className="text-accent" />
                Asset Value Distribution
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '4px' }}>Breakdown of total capital tied up per product line.</p>
            </div>
            <div style={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Asset Worth']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Strategy & Risk */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* AI Advisor Panel */}
          <div className="glass-panel crimson-glow" style={{ padding: '2rem', minHeight: '300px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={24} className="text-warning" />
              Strategic Insight
            </h3>
            
            {activeStrategy ? (
              <div className="animate-slide-up">
                <div style={{ 
                  padding: '1.25rem', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem', 
                  background: activeStrategy.type === 'risk' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${activeStrategy.type === 'risk' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                }}>
                  <h4 style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'white' }}>
                    {activeStrategy.type === 'risk' ? <AlertTriangle size={16} style={{ color: '#ef4444' }} /> : <ShieldCheck size={16} style={{ color: '#10b981' }} />}
                    {activeStrategy.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {activeStrategy.desc}
                  </p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={handleGenerateReport}>
                  {activeStrategy.action}
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                  <Target size={32} style={{ opacity: 0.3 }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Click "Apply Strategy" to run AI diagnostics.</p>
              </div>
            )}
          </div>

          {/* Security Status */}
          <div className="glass-panel indigo-glow" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} style={{ color: '#10b981' }} />
              Security Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supply Continuity</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>98.2%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', background: '#10b981', borderRadius: '3px', width: '98%' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Market Volatility</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f59e0b' }}>Medium</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', background: '#f59e0b', borderRadius: '3px', width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
