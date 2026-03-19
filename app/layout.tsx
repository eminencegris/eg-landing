import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EG Exchange — Institutional-Grade Perpetual Futures',
  description: 'CLOB matching engine with sub-millisecond fills, 125× leverage, and multi-source oracle pricing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0A0A0F', color: '#E8E8F0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
