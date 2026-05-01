import React from 'react';
import { Link } from 'react-router-dom';
import { Database, TrendingUp, Truck, Shield, LayoutDashboard, Cpu, ArrowRight, ChevronRight, BarChart3 } from 'lucide-react';

export default function Home() {
    return (
        <div className="home-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#050505',
            color: '#fff',
            overflowX: 'hidden'
        }}>
            {/* Visual Background Elements */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                background: `
          radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)
        `,
                pointerEvents: 'none'
            }} />

            {/* Navigation */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 8%',
                background: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(20px)',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
                borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '6px', borderRadius: '8px' }}>
                        <Cpu color="white" size={20} />
                    </div>
                    <span>Supply<span style={{ color: '#6366f1' }}>Optima</span></span>
                </div>

                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <a href="#workflow" className="nav-link">Process</a>
                    <a href="#features" className="nav-link">Features</a>
                    <Link to="/login" style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500' }}>Log in</Link>
                    <Link to="/signup" style={{
                        background: 'white',
                        color: 'black',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '100px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'transform 0.2s ease'
                    }} onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                marginTop: '120px',
                padding: '6rem 5% 8rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 1rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    borderRadius: '100px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    marginBottom: '2.5rem'
                }}>
                    <span style={{ width: '6px', height: '6px', background: '#6366f1', borderRadius: '50%' }}></span>
                    V2.0 is now live
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    fontWeight: '800',
                    maxWidth: '1000px',
                    margin: '0 auto 2rem',
                    lineHeight: '1.1',
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(to bottom, #fff 60%, rgba(255,255,255,0.5))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    The Operating System for <br /> Modern Supply Chains
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    color: '#94a3b8',
                    maxWidth: '650px',
                    margin: '0 auto 3.5rem',
                    lineHeight: '1.6'
                }}>
                    Harness predictive AI to automate inventory, forecast demand with 99% accuracy, and manage global logistics on one unified platform.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/login" style={{
                        background: '#6366f1',
                        color: 'white',
                        padding: '1rem 2.5rem',
                        fontSize: '1rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.4)'
                    }}>
                        Launch Dashboard <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Bento-style Workflow */}
            <section id="workflow" style={{ padding: '8rem 8%', position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Engineered for Precision</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Four steps to total supply chain visibility.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[
                        { title: 'Data Aggregation', desc: 'Ingest data from ERPs, IoT sensors, and legacy systems seamlessly.', icon: Database, color: '#6366f1' },
                        { title: 'AI Prediction', desc: 'Proprietary models identify trends before they hit your bottom line.', icon: TrendingUp, color: '#a855f7' },
                        { title: 'Smart Adjustment', desc: 'Auto-pilot your stock levels based on real-time volatility.', icon: Shield, color: '#10b981' },
                        { title: 'Logistics Core', desc: 'Real-time GPS and port data for every single SKU in transit.', icon: Truck, color: '#f59e0b' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: '2.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px',
                            transition: 'all 0.3s ease',
                            cursor: 'default'
                        }}
                            className="feature-card"
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${item.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <item.icon size={24} color={item.color} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600' }}>{item.title}</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Highlight */}
            <section id="features" style={{ padding: '8rem 8%', position: 'relative', zIndex: 1 }}>
                <div style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
                    borderRadius: '32px',
                    padding: '4rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                            Everything you need <br /><span style={{ color: '#6366f1' }}>to scale globally.</span>
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.7' }}>
                            Stop reacting to supply chain disruptions. Start anticipating them with our unified intelligence layer.
                        </p>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {[
                                { t: 'Unified Analytics', d: 'Interactive charts with sub-second latency.', icon: BarChart3 },
                                { t: 'Enterprise Security', d: 'AES-256 encryption at rest and in transit.', icon: Shield }
                            ].map((feat, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' }}>
                                        <feat.icon size={20} color="#6366f1" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{feat.t}</h4>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{feat.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: '20px',
                        padding: '1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)'
                    }}>
                        {/* Abstract Dashboard Placeholder */}
                        <div style={{ background: '#111', borderRadius: '12px', height: '300px', width: '100%', overflow: 'hidden', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div style={{ height: '12px', width: '80px', background: '#333', borderRadius: '4px' }}></div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ height: '8px', width: '8px', background: '#ef4444', borderRadius: '50%' }}></div>
                                    <div style={{ height: '8px', width: '8px', background: '#eab308', borderRadius: '50%' }}></div>
                                    <div style={{ height: '8px', width: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                                </div>
                            </div>
                            <div style={{ height: '150px', width: '100%', background: 'linear-gradient(90deg, transparent 0%, #6366f110 50%, transparent 100%)', borderBottom: '1px solid #333', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', height: '2px', background: '#6366f1', boxShadow: '0 0 20px #6366f1' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                marginTop: 'auto',
                padding: '4rem 8% 3rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', opacity: 0.6 }}>
                    <Cpu size={18} />
                    <span style={{ fontWeight: 'bold' }}>SupplyOptima</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    &copy; 2024 Crafted by <span style={{ color: '#fff', fontWeight: '500' }}>Group 2</span> • FD Project
                </p>
            </footer>

            <style>{`
        .nav-link {
          color: #94a3b8;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: white;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        section {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
        </div>
    );
}