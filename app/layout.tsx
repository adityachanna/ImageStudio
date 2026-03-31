import type { Metadata } from 'next';
import { Space_Mono, Syne } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mono' });
const syne = Syne({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Mamba RCA — The Orchestrated Intelligence Layer',
  description: 'High-performance automated root cause analysis pipeline.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${syne.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23000000'/><path d='M6 22l6-6 4 4 4-5 6 7' stroke='white' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
      </head>
      <body className="min-h-screen font-mono text-[var(--text-main)] bg-[var(--bg-base)] selection:bg-[var(--accent)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
