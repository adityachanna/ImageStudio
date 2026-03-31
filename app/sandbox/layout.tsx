import React from 'react';
import Link from 'next/link';

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <header style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(40px)',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 48px', height: 128, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img src="/logo.png" alt="Mamba RCA" style={{ height: 84, width: 'auto' }} />
              </Link>
              <div style={{ borderLeft: '3px solid #f1f5f9', height: 60 }}></div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 24, color: '#0f172a', letterSpacing: '-0.8px', lineHeight: 1.1 }}>ImageStudio</div>
                <div style={{ fontSize: 13, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Bug-Infested Sandbox</div>
              </div>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/" style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, color: '#0058be', background: '#eff6ff', borderRadius: 8, textDecoration: 'none', transition: 'all 0.2s', border: '1px solid #bfdbfe' }}>
                Return to Mamba RCA
              </Link>
              <a href="#tools" className="btn-primary" style={{ padding: '9px 20px', fontSize: 14, borderRadius: 10, textDecoration: 'none' }}>
                Submit Sandbox Output →
              </a>
            </nav>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 68px)' }}>
          {children}
        </main>

        <footer style={{ background: '#0f172a', color: 'white', padding: '48px 28px 32px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#64748b' }}>© {new Date().getFullYear()} ImageStudio / Mamba RCA Sandbox.</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>This is a vulnerable testing environment.</p>
            </div>
          </div>
        </footer>
    </>
  );
}
