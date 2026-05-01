import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const user = JSON.parse(localStorage.getItem('user')) || { fullName: 'User', email: 'user@example.com' };

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for IST Formatting
  const formatIST = (timestamp) => {
    // SQLite timestamps are UTC. Appending UTC ensures correct local conversion.
    const date = new Date(timestamp + ' UTC');
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      rawDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    };
  };

  // Calendar Logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedDate);
  const activityDates = logs.map(log => formatIST(log.timestamp).rawDate);

  const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">Command Center Settings</h1>
        <p className="page-subtitle">Personalize your optimization engine and audit terminal logs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'profile', name: 'User Profile', icon: User },
            { id: 'activity', name: 'System Activity', icon: Calendar },
            { id: 'security', name: 'Security & Auth', icon: Shield, disabled: true },
            { id: 'notifications', name: 'Alert Settings', icon: Bell, disabled: true },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.5rem',
                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                opacity: item.disabled ? 0.4 : 1
              }}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {activeTab === 'profile' && (
            <div className="glass-panel animate-slide-up" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={24} className="text-primary" />
                Verified Identity Matrix
              </h3>
              <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '24px', 
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '2.5rem', fontWeight: '900', color: 'white',
                  boxShadow: '0 10px 30px var(--primary-glow)'
                }}>
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'white' }}>{user.fullName}</h4>
                  <p style={{ color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '1rem' }}>{user.email}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <span className="badge badge-success shadow-glow">Primary Administrator</span>
                    <span className="badge badge-primary">Enterprise Instance</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Role Authority</p>
                  <p style={{ fontWeight: 'bold', color: 'white' }}>Super Admin / Root Access</p>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Status</p>
                  <p style={{ fontWeight: 'bold', color: 'var(--success)' }}>Active Operational</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={24} className="text-accent" />
                    System Activity Terminal
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={prevMonth} className="btn-icon-solid" style={{ width: '32px', height: '32px' }}>←</button>
                    <span style={{ fontWeight: 'bold', color: 'white', minWidth: '120px', textAlign: 'center' }}>
                      {selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="btn-icon-solid" style={{ width: '32px', height: '32px' }}>→</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    // Format as YYYY-MM-DD in local time to avoid UTC shift
                    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    
                    const hasActivity = activityDates.includes(dateStr);
                    
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const isToday = todayStr === dateStr;

                    return (
                      <div 
                        key={day} 
                        className="calendar-day"
                        style={{ 
                          height: '45px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          borderRadius: '10px',
                          background: hasActivity ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                          border: isToday ? '1px solid var(--primary)' : '1px solid transparent',
                          position: 'relative',
                          color: hasActivity ? 'white' : 'var(--text-muted)',
                          fontSize: '0.85rem',
                          fontWeight: hasActivity ? '800' : '500',
                          cursor: hasActivity ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                          boxShadow: hasActivity ? 'inset 0 0 10px rgba(99, 102, 241, 0.1)' : 'none'
                        }}
                        onMouseOver={e => {
                          if(hasActivity) {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.zIndex = '10';
                          }
                        }}
                        onMouseOut={e => {
                          if(hasActivity) {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.zIndex = '1';
                          }
                        }}
                      >
                        {day}
                        {hasActivity && <div style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent)' }} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 items-center mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Logged Event</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '8px', height: '8px', border: '1px solid var(--primary)', borderRadius: '50%' }} />
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Today</span>
                  </div>
                </div>
              </div>

              {/* Detailed Log Table */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 className="text-sm font-bold mb-6 text-white uppercase tracking-widest border-l-4 border-primary pl-4">Raw Telemetry Feed (IST)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loading ? (
                    <p className="text-center py-10 text-muted">Decoding telemetry...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-center py-10 text-muted">No activity streams found.</p>
                  ) : (
                    logs.slice(0, 15).map(log => {
                      const ist = formatIST(log.timestamp);
                      return (
                        <div key={log.id} style={{ 
                          display: 'flex', alignItems: 'center', gap: '1.5rem', 
                          padding: '1.25rem', background: 'rgba(255,255,255,0.02)', 
                          borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' 
                        }}>
                          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <p style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'white', marginBottom: '2px' }}>{log.action}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: Verified Execution</p>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <p style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '2px' }}>{ist.time}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{ist.date}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
