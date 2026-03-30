import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: 'ImageStudio — Compress, Resize & Convert Images Free',
  description: 'Fast, browser-based image studio. Compress images without quality loss, resize to any dimension, and convert to PDF — all in seconds. No uploads to servers.',
  keywords: 'image compressor, resize image, image to pdf, free image tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2316a34a'/><path d='M6 22l6-6 4 4 4-5 6 7' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/></svg>" />
      </head>
      <body className={inter.className} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>

        {/* ── Header ────────────────────────────── */}
        <header style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 8h.01"/>
                  <rect width="16" height="16" x="4" y="4" rx="3"/>
                  <path d="m4 15 4-4a3 5 0 0 1 3 0l5 5"/>
                  <path d="m14 14 1-1a3 5 0 0 1 3 0l2 2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.4px', lineHeight: 1 }}>ImageStudio</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Image Processing Suite</div>
              </div>
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[
                { label: 'Features', href: '#features' },
                { label: 'Tools', href: '#tools' },
                { label: 'How it works', href: '#how' },
              ].map(n => (
                <a key={n.label} href={n.href} className="hover:text-green-600 hover:bg-green-100" style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', borderRadius: 8, textDecoration: 'none', transition: 'color 0.2s, background 0.2s' }}>
                  {n.label}
                </a>
              ))}
              <a href="#tools" className="btn-primary" style={{ padding: '9px 18px', fontSize: 14, marginLeft: 8, borderRadius: 10 }}>
                Try Free →
              </a>
            </nav>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 68px)' }}>
          {children}
        </main>

        {/* ── Footer ────────────────────────────── */}
        <footer style={{ background: 'var(--text-primary)', color: 'white', padding: '48px 28px 32px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 8h.01"/><rect width="16" height="16" x="4" y="4" rx="3"/>
                      <path d="m4 15 4-4a3 5 0 0 1 3 0l5 5"/><path d="m14 14 1-1a3 5 0 0 1 3 0l2 2"/>
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>ImageStudio</span>
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>Professional image tools in your browser. No signup, no limits, no data collection.</p>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Tools</div>
                {['Image Compressor', 'Image Resizer', 'Image to PDF', 'Batch Convert'].map(t => (
                  <div key={t} style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, cursor: 'pointer' }}>{t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Formats</div>
                {['JPEG / JPG', 'PNG', 'WebP', 'PDF'].map(f => (
                  <div key={f} style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{f}</div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#64748b' }}>© {new Date().getFullYear()} ImageStudio. Built for speed, designed for clarity.</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>100% client-side processing — your images never leave your device.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
