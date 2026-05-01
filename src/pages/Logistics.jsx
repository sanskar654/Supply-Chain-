import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Map as MapIcon, 
  Navigation, 
  X, 
  Plus,
  Box,
  PackageCheck,
  Clock,
  Trash2,
  ChevronRight,
  Info,
  Circle,
  LocateFixed,
  ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import 'leaflet/dist/leaflet.css';

const API_BASE = 'http://localhost:5000/api';

// --- DATA: INDIAN HUBS ---
const INDIAN_HUBS = {
  'Mumbai': [19.0760, 72.8777],
  'New Delhi': [28.6139, 77.2090],
  'Bangalore': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Ahmedabad': [23.0225, 72.5714],
  'Pune': [18.5204, 73.8567],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Kochi': [9.9312, 76.2673],
  'Guwahati': [26.1445, 91.7362],
  'Indore': [22.7196, 75.8577],
  'Bhopal': [23.2599, 77.4126],
  'Chandigarh': [30.7333, 76.7794],
  'Patna': [25.5941, 85.1376],
  'Nagpur': [21.1458, 79.0882],
  'Surat': [21.1702, 72.8311]
};

// Map Controller to fly to locations
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// --- CUSTOM MAP MARKER ---
const CustomMarker = ({ position, label, status }) => {
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="map-marker-pulse"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div style={{ background: '#1a1f2e', color: 'white', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <h4 style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{label} Hub</h4>
          </div>
          <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>STATUS: <span className="text-success">{status}</span></p>
        </div>
      </Popup>
    </Marker>
  );
};

export default function Logistics() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);

  const [products, setProducts] = useState([]);
  const [newShipment, setNewShipment] = useState({
    tracking_id: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
    origin: 'Mumbai',
    destination: 'New Delhi',
    status: 'Shipped',
    eta: '2024-05-10',
    product_id: '',
    quantity: ''
  });

  useEffect(() => {
    fetchShipments();
    fetchProducts();
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setShipments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddShipment = async (e) => {
    e.preventDefault();
    if (!newShipment.product_id) return alert('Select an asset for dispatch');
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/shipments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newShipment,
          quantity: parseInt(newShipment.quantity) || 1
        })
      });
      
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Failed to add shipment');
      
      await fetchShipments();
      await fetchProducts(); // Refresh stock levels
      setShowModal(false);
      setNewShipment({
        tracking_id: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
        origin: 'Mumbai',
        destination: 'New Delhi',
        status: 'Shipped',
        eta: '2024-05-15',
        product_id: '',
        quantity: ''
      });
    } catch (err) {
      alert(`Registration Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const openDetails = (shipment) => {
    if (!shipment) return;
    try {
      setSelectedShipment(shipment);
      setShowDetailsModal(true);
      
      const originName = shipment.origin || 'Mumbai';
      const destName = shipment.destination || 'New Delhi';
      
      const origin = INDIAN_HUBS[originName] || INDIAN_HUBS['Mumbai'];
      const dest = INDIAN_HUBS[destName] || INDIAN_HUBS['New Delhi'];
      
      if (origin && dest) {
        const midPoint = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];
        setMapCenter(midPoint);
        setMapZoom(6);
      }
    } catch (err) {
      console.error("Open Details Error:", err);
    }
  };

  const getRouteCoords = () => {
    if (!selectedShipment) return [];
    const origin = INDIAN_HUBS[selectedShipment.origin] || INDIAN_HUBS['Mumbai'];
    const dest = INDIAN_HUBS[selectedShipment.destination] || INDIAN_HUBS['New Delhi'];
    return [origin, dest];
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <style>{`
        .leaflet-container { width: 100%; height: 100%; border-radius: 16px; background: #0d1117 !important; z-index: 1; border: 1px solid rgba(255,255,255,0.1); }
        .leaflet-tile { filter: brightness(0.6) invert(1) contrast(1.2) hue-rotate(200deg) saturate(0.3) brightness(0.7); }
        .map-marker-pulse { width: 14px; height: 14px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 0 rgba(99, 102, 241, 0.4); animation: mapPulse 2s infinite; border: 2px solid white; }
        @keyframes mapPulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
        .leaflet-popup-content-wrapper { background: #1a1f2e !important; color: white !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; }
        .leaflet-popup-tip { background: #1a1f2e !important; }
        .shipment-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid rgba(255,255,255,0.05); }
        .shipment-card:hover { border-color: var(--primary); transform: translateX(8px); background: rgba(99, 102, 241, 0.12) !important; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .shipment-card.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.15) !important; box-shadow: 0 0 15px var(--primary-glow); }
        .route-path { stroke-dasharray: 8; animation: dash 20s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -1000; } }
      `}</style>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Fleet Command</h1>
          <p className="page-subtitle">Interactive domestic logistics engine for the Indian subcontinent.</p>
        </div>
        <div className="flex gap-4">
          {selectedShipment && (
            <button className="btn btn-outline" onClick={() => { setSelectedShipment(null); setMapCenter([20.5937, 78.9629]); setMapZoom(5); }}>
              <LocateFixed size={18} /> Reset View
            </button>
          )}
          <button className="btn btn-primary shadow-glow" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Shipment
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
        {/* Map View */}
        <div style={{ gridColumn: 'span 8' }}>
          <div className="glass-panel crimson-glow" style={{ height: '650px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'var(--primary)', padding: '0.6rem', borderRadius: '10px', color: 'white', boxShadow: '0 0 15px var(--primary-glow)' }}><MapIcon size={18} /></div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>Live Network Matrix</h3>
                  <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Satellite Telemetry Active</p>
                </div>
              </div>
              {selectedShipment && (
                <div className="badge badge-primary animate-pulse">
                  Routing: {selectedShipment.origin} → {selectedShipment.destination}
                </div>
              )}
            </div>
            <div style={{ flexGrow: 1, position: 'relative' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <MapController center={mapCenter} zoom={mapZoom} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* All Hubs */}
                {Object.entries(INDIAN_HUBS).map(([name, pos]) => (
                  <CustomMarker key={name} position={pos} label={name} status="OPERATIONAL" />
                ))}

                {/* Selected Route */}
                {selectedShipment && (
                  <Polyline 
                    positions={getRouteCoords()} 
                    color="var(--primary)" 
                    weight={4} 
                    opacity={0.8}
                    className="route-path"
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Shipment Tracker */}
        <div style={{ gridColumn: 'span 4' }}>
          <div className="glass-panel indigo-glow" style={{ height: '650px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-primary" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Active Fleet</h3>
              </div>
              <span className="badge badge-info shadow-sm">{shipments.length} Units</span>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '0.5rem', scrollbarWidth: 'none' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-xs font-bold uppercase tracking-widest">Syncing Data...</span>
                </div>
              ) : shipments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted opacity-50">
                  <Box size={48} className="mb-4" />
                  <p className="italic">No active missions.</p>
                </div>
              ) : (
                shipments.map((s) => (
                  <div 
                    key={s.id} 
                    className={`glass-panel shipment-card ${selectedShipment?.id === s.id ? 'selected' : ''}`} 
                    style={{ 
                      padding: '1.25rem', 
                      marginBottom: '1rem', 
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      position: 'relative',
                      border: selectedShipment?.id === s.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)'
                    }}
                    onClick={() => openDetails(s)}
                  >
                    {/* Header: Tracking ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{s.tracking_id}</span>
                      <span className="badge" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>{s.quantity} units</span>
                    </div>

                    {/* Product Name */}
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent)' }}>{s.product_name || 'Classified Asset'}</p>

                    {/* Route: Origin -> Destination */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '800', fontSize: '0.85rem' }}>
                      <span>{s.origin}</span>
                      <ChevronRight size={12} style={{ opacity: 0.3 }} />
                      <span>{s.destination}</span>
                    </div>
                    
                    {/* Progress Bar & Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Transit Progress</span>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ color: 'white', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{s.status}</span>
                          <span style={{ color: 'var(--primary)' }}>{s.eta}</span>
                        </div>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'var(--primary)', 
                          width: s.status === 'Delivered' ? '100%' : '45%', 
                          boxShadow: '0 0 10px var(--primary)',
                          transition: 'width 1s ease-in-out'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="glass-panel modal-content max-w-lg w-full p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl text-white font-bold tracking-tight">Deploy Shipment</h2>
                <p className="text-sm text-muted mt-2">Configure a new domestic route across the Indian network.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="action-icon-btn hover:bg-danger-light hover:text-danger">
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleAddShipment} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Asset Tracking Unit</label>
                <div className="relative">
                  <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    className="input-field pl-12 font-mono" 
                    value={newShipment.tracking_id} 
                    onChange={e => setNewShipment({...newShipment, tracking_id: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Asset for Dispatch</label>
                <div className="relative">
                  <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <select 
                    className="input-field pl-12" 
                    value={newShipment.product_id} 
                    onChange={e => setNewShipment({...newShipment, product_id: e.target.value})} 
                    required 
                  >
                    <option value="">Select an asset...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_level})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Dispatch Quantity</label>
                  <input 
                    type="number"
                    className="input-field" 
                    value={newShipment.quantity} 
                    onChange={e => setNewShipment({...newShipment, quantity: e.target.value})} 
                    min="1"
                    placeholder="Enter quantity"
                    required 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Arrival Window</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input 
                      type="date" 
                      className="input-field pl-11" 
                      value={newShipment.eta} 
                      onChange={e => setNewShipment({...newShipment, eta: e.target.value})} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Origin Hub</label>
                  <select 
                    className="input-field" 
                    value={newShipment.origin} 
                    onChange={e => setNewShipment({...newShipment, origin: e.target.value})} 
                    required 
                  >
                    {Object.keys(INDIAN_HUBS).sort().map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">Destination Hub</label>
                  <select 
                    className="input-field" 
                    value={newShipment.destination} 
                    onChange={e => setNewShipment({...newShipment, destination: e.target.value})} 
                    required 
                  >
                    {Object.keys(INDIAN_HUBS).sort().map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>

              <div className="modal-footer pt-4 border-t border-white/5">
                <button type="button" className="btn btn-outline flex-1" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1 shadow-glow" disabled={saving}>
                  {saving ? 'Initializing...' : 'Authorize Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedShipment && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setShowDetailsModal(false)}>
          <div 
            className="glass-panel animate-scale-in" 
            style={{ 
              maxWidth: '550px', 
              width: '100%', 
              maxHeight: '90vh', 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: '24px', 
              overflow: 'hidden', 
              background: '#11131f', 
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Header (Fixed) */}
            <div style={{ position: 'relative', height: '120px', minHeight: '120px', background: 'var(--primary)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 10 }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', transform: 'rotate(2deg)' }}>
                  <Truck size={32} color="white" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.75rem', color: 'white', fontWeight: '900', margin: 0, letterSpacing: '-0.03em' }}>{selectedShipment.tracking_id}</h2>
                  <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Domestic Mission Registry</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', zIndex: 20 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', scrollbarWidth: 'none' }}>
              <style>{`.modal-body::-webkit-scrollbar { display: none; }`}</style>
              
              {/* Progress Pipeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Transit Pipeline</span>
                  <span style={{ fontSize: '9px', fontWeight: '900', padding: '4px 12px', borderRadius: '99px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', textTransform: 'uppercase' }}>
                    {selectedShipment.status}
                  </span>
                </div>

                <div style={{ position: 'relative', height: '70px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                  <div style={{ position: 'absolute', left: '20px', right: '20px', height: '2px', background: 'rgba(255,255,255,0.05)' }}></div>
                  <div style={{ position: 'absolute', left: '20px', height: '2px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)', width: selectedShipment.status === 'Delivered' ? 'calc(100% - 40px)' : 'calc(50% - 20px)', transition: 'width 1s' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 5 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '28px', height: '28px', background: '#11131f', border: '2px solid var(--primary)', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={12} color="var(--primary)" />
                      </div>
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: 'white' }}>{selectedShipment.origin}</p>
                    </div>

                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                      <div style={{ width: '28px', height: '28px', background: '#11131f', border: `2px solid ${selectedShipment.status !== 'Shipped' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedShipment.status !== 'Shipped' ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
                      </div>
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: 'white' }}>GATEWAY</p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '28px', height: '28px', background: '#11131f', border: `2px solid ${selectedShipment.status === 'Delivered' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PackageCheck size={12} color={selectedShipment.status === 'Delivered' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'} />
                      </div>
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: 'white' }}>{selectedShipment.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ETA Window</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 'bold' }}>{selectedShipment.eta}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Navigation size={14} color="var(--primary)" />
                    <span style={{ fontSize: '9px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Node</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: 'bold' }}>{selectedShipment.destination}</p>
                </div>
              </div>

              {/* Insight Box */}
              <div style={{ position: 'relative', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '24px', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }}>
                  <Info size={80} color="var(--primary)" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Info size={16} color="var(--primary)" />
                  <span style={{ fontSize: '10px', fontWeight: '900', color: 'white', textTransform: 'uppercase' }}>Manifest Intelligence</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                  Mission confirmed: Dispatched <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedShipment.quantity} units</span> of <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedShipment.product_name || 'Classified Asset'}</span>. 
                  Unit is currently navigating the corridor between <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedShipment.origin}</span> and <span style={{ color: 'white', fontWeight: 'bold' }}>{selectedShipment.destination}</span>. 
                  Satellite tracking confirms optimal transit parameters.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button 
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                  onClick={() => setShowDetailsModal(false)}
                >
                  Dismiss
                </button>
                <button style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                  <ExternalLink size={16} /> Track Unit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
