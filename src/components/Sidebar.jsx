import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, Truck, BarChart3, Settings, Box, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', name: 'Inventory', icon: PackageSearch },
    { path: '/logistics', name: 'Logistics', icon: Truck },
    { path: '/analytics', name: 'Analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="brand animate-fade-in">
        <div className="brand-icon">
          <Box size={24} />
        </div>
        <div className="brand-title">SupplyOptima</div>
      </div>
      
      <nav className="nav-links">
        {navItems.map((item, index) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({isActive}) => `nav-item stagger-${index + 1} animate-fade-in ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <NavLink to="/settings" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} style={{ width: '100%', textDecoration: 'none' }}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fca5a5', marginTop: '0.5rem' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
