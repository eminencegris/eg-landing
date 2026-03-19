'use client';
import { useEffect, useState } from 'react';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || '';

interface Stats {
  user_count: number;
  open_positions: number;
  total_notional: number;
  markets: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!ADMIN_URL) return;
    const load = async () => {
      try {
        const res = await fetch(`${ADMIN_URL}/health`);
        if (res.ok) {
          const data = await res.json();
          if (data.redis) setStats({ user_count: 0, open_positions: 0, total_notional: 0, markets: 10 });
        }
      } catch {}
    };
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <span style={styles.logo}>⚡ EG Exchange</span>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#architecture" style={styles.navLink}>Architecture</a>
          <a href="#download" style={styles.navLink}>Download</a>
        </div>
      </nav>

      <section style={styles.hero}>
        <div style={styles.badge}>PERPETUAL FUTURES · CLOB · 125× LEVERAGE</div>
        <h1 style={styles.h1}>
          Institutional-Grade<br />
          <span style={styles.accent}>Matching Engine</span>
        </h1>
        <p style={styles.subtitle}>
          Price-time priority CLOB with sub-millisecond matching, multi-source oracle pricing,
          automated liquidation engine, and real-time risk management.
        </p>
        <div style={styles.ctas}>
          <a href="#download" style={styles.primaryBtn}>Download App</a>
          <a href="#architecture" style={styles.secondaryBtn}>View Architecture →</a>
        </div>
      </section>

      {stats && (
        <section style={styles.statsBar}>
          <div style={styles.stat}>
            <span style={styles.statNum}>{stats.markets}</span>
            <span style={styles.statLabel}>Markets</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>125×</span>
            <span style={styles.statLabel}>Max Leverage</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>&lt;1ms</span>
            <span style={styles.statLabel}>Match Latency</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>3</span>
            <span style={styles.statLabel}>Oracle Sources</span>
          </div>
        </section>
      )}

      <section id="features" style={styles.features}>
        <h2 style={styles.h2}>Core Infrastructure</h2>
        <div style={styles.grid}>
          {[
            { icon: '📊', title: 'CLOB Matching Engine', desc: 'SortedDict-backed price-time priority order book. Limit, Market, IOC, FOK, POST_ONLY.' },
            { icon: '🛡️', title: 'Risk Manager', desc: 'Pre-trade IM/leverage/notional checks. Real-time margin monitoring with auto-liquidation.' },
            { icon: '⚡', title: 'Liquidation Engine', desc: '2s polling loop, force-close, insurance fund absorption, ADL ranking for counterparties.' },
            { icon: '🔮', title: 'Multi-Source Oracle', desc: 'Median of Binance + CoinGecko + Pyth Network. Manipulation resistant mark pricing.' },
            { icon: '🏦', title: 'Margin Ledger', desc: 'Double-entry SQLite accounting. Every deposit, fill, fee, and liquidation is tracked.' },
            { icon: '🔄', title: 'LP Router', desc: 'Smart order routing across AlphaPoint, B2Broker, and custom liquidity providers.' },
          ].map((f, i) => (
            <div key={i} style={styles.card}>
              <span style={styles.cardIcon}>{f.icon}</span>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="architecture" style={styles.arch}>
        <h2 style={styles.h2}>Architecture</h2>
        <div style={styles.archGrid}>
          <div style={styles.archCard}>
            <span style={styles.archPlatform}>Railway</span>
            <span style={styles.archRole}>Matching Engine + API</span>
            <p style={styles.archDesc}>FastAPI + WebSocket. CLOB, risk gate, liquidation engine. Source of truth.</p>
          </div>
          <div style={styles.archArrow}>→ Redis →</div>
          <div style={styles.archCard}>
            <span style={styles.archPlatform}>Render</span>
            <span style={styles.archRole}>Admin API</span>
            <p style={styles.archDesc}>Read-only dashboard. User management, risk monitoring, LP config.</p>
          </div>
          <div style={styles.archArrow}>← reads</div>
          <div style={styles.archCard}>
            <span style={styles.archPlatform}>Vercel</span>
            <span style={styles.archRole}>Web Dashboard</span>
            <p style={styles.archDesc}>Landing page + live stats. Marketing and web trading terminal.</p>
          </div>
        </div>
      </section>

      <section id="download" style={styles.download}>
        <h2 style={styles.h2}>Get Started</h2>
        <p style={styles.subtitle}>Download the mobile app and start trading perpetual futures.</p>
        <div style={styles.ctas}>
          <a href="#" style={styles.primaryBtn}>📱 iOS (TestFlight)</a>
          <a href="#" style={styles.secondaryBtn}>🤖 Android (APK)</a>
        </div>
      </section>

      <footer style={styles.footer}>
        <span>© {new Date().getFullYear()} Eminence Gris · EG Exchange</span>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid #1a1a2e' },
  logo: { fontSize: 20, fontWeight: 800, color: '#7B61FF' },
  navLinks: { display: 'flex', gap: 24 },
  navLink: { color: '#888', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  hero: { textAlign: 'center', padding: '80px 0 40px' },
  badge: { display: 'inline-block', padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#7B61FF', border: '1px solid #7B61FF40', marginBottom: 24 },
  h1: { fontSize: 56, fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px' },
  accent: { color: '#7B61FF' },
  subtitle: { fontSize: 18, color: '#888', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 },
  ctas: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { padding: '14px 32px', borderRadius: 12, backgroundColor: '#7B61FF', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: 'none', cursor: 'pointer' },
  secondaryBtn: { padding: '14px 32px', borderRadius: 12, backgroundColor: 'transparent', color: '#7B61FF', fontWeight: 700, fontSize: 16, textDecoration: 'none', border: '1px solid #7B61FF40', cursor: 'pointer' },
  statsBar: { display: 'flex', justifyContent: 'center', gap: 48, padding: '32px 0', borderTop: '1px solid #1a1a2e', borderBottom: '1px solid #1a1a2e', margin: '0 0 60px' },
  stat: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 },
  statNum: { fontSize: 28, fontWeight: 800, color: '#7B61FF' },
  statLabel: { fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  features: { padding: '60px 0' },
  h2: { fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
  card: { padding: 24, borderRadius: 16, border: '1px solid #1a1a2e', backgroundColor: '#0f0f1a' },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 16, fontWeight: 700, margin: '12px 0 8px' },
  cardDesc: { fontSize: 14, color: '#888', lineHeight: 1.5, margin: 0 },
  arch: { padding: '60px 0' },
  archGrid: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' },
  archCard: { padding: 24, borderRadius: 16, border: '1px solid #1a1a2e', backgroundColor: '#0f0f1a', textAlign: 'center', minWidth: 200 },
  archPlatform: { fontSize: 12, fontWeight: 700, color: '#7B61FF', textTransform: 'uppercase', letterSpacing: 1 },
  archRole: { display: 'block', fontSize: 16, fontWeight: 700, margin: '8px 0' },
  archDesc: { fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 },
  archArrow: { fontSize: 14, color: '#444', fontWeight: 600 },
  download: { textAlign: 'center', padding: '60px 0' },
  footer: { textAlign: 'center', padding: '40px 0', borderTop: '1px solid #1a1a2e', color: '#444', fontSize: 13 },
};
