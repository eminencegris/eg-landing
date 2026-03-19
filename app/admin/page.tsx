'use client';
import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_ADMIN_URL || '';

interface Stats { user_count: number; open_positions: number; total_notional: number; markets: number; ts: number }
interface User { user_id: string; balance: number; available: number; locked: number; unrealized_pnl: number; realized_pnl: number }
interface Position { user_id: string; symbol: string; side: string; size: number; entry_price: number; leverage: number; margin: number; unrealized_pnl: number }

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [logging, setLogging] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'risk' | 'markets'>('overview');
  const [markets, setMarkets] = useState<any[]>([]);
  const [markPrices, setMarkPrices] = useState<Record<string, number>>({});

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const login = async () => {
    setLogging(true);
    setLoginError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setLoginError('Invalid credentials'); return; }
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('eg_admin_token', data.token);
    } catch { setLoginError('Cannot reach admin API'); }
    finally { setLogging(false); }
  };

  const loadData = useCallback(async () => {
    if (!token || !API) return;
    try {
      const [sRes, uRes, pRes, mRes, mpRes] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
        fetch(`${API}/admin/risk/positions`, { headers }),
        fetch(`${API}/admin/markets`, { headers }),
        fetch(`${API}/admin/mark-prices`, { headers }),
      ]);
      if (sRes.status === 401) { setToken(''); localStorage.removeItem('eg_admin_token'); return; }
      setStats(await sRes.json());
      const ud = await uRes.json(); setUsers(ud.users || []);
      const pd = await pRes.json(); setPositions(pd.positions || []);
      setMarkets(await mRes.json());
      setMarkPrices(await mpRes.json());
    } catch {}
  }, [token]);

  useEffect(() => {
    const saved = localStorage.getItem('eg_admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) { loadData(); const iv = setInterval(loadData, 5000); return () => clearInterval(iv); }
  }, [token, loadData]);

  if (!token) {
    return (
      <main style={s.main}>
        <div style={s.loginBox}>
          <h1 style={s.loginTitle}>⚡ EG Admin</h1>
          <input style={s.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input style={s.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          {loginError && <p style={s.error}>{loginError}</p>}
          <button style={s.btn} onClick={login} disabled={logging}>{logging ? 'Logging in...' : 'Login'}</button>
        </div>
      </main>
    );
  }

  return (
    <main style={s.main}>
      <nav style={s.nav}>
        <span style={s.logo}>⚡ EG Admin</span>
        <div style={s.tabs}>
          {(['overview', 'users', 'risk', 'markets'] as const).map(t => (
            <button key={t} style={tab === t ? s.tabActive : s.tab} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button style={s.logout} onClick={() => { setToken(''); localStorage.removeItem('eg_admin_token'); }}>Logout</button>
      </nav>

      {tab === 'overview' && stats && (
        <div style={s.content}>
          <h2 style={s.h2}>Platform Overview</h2>
          <div style={s.statGrid}>
            <StatCard label="Users" value={stats.user_count} />
            <StatCard label="Open Positions" value={stats.open_positions} />
            <StatCard label="Total Notional" value={`$${Number(stats.total_notional).toLocaleString()}`} />
            <StatCard label="Markets" value={stats.markets} />
          </div>
          <h3 style={s.h3}>Mark Prices</h3>
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span style={s.cell}>Symbol</span><span style={s.cell}>Price</span>
            </div>
            {Object.entries(markPrices).map(([sym, price]) => (
              <div key={sym} style={s.tableRow}>
                <span style={s.cell}>{sym}</span>
                <span style={s.cell}>${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            {Object.keys(markPrices).length === 0 && <div style={s.empty}>No mark prices yet</div>}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div style={s.content}>
          <h2 style={s.h2}>Users ({users.length})</h2>
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span style={s.cell}>User ID</span><span style={s.cell}>Balance</span><span style={s.cell}>Available</span><span style={s.cell}>Locked</span><span style={s.cell}>Unrealized PnL</span>
            </div>
            {users.map(u => (
              <div key={u.user_id} style={s.tableRow}>
                <span style={s.cell}>{u.user_id.slice(0, 16)}...</span>
                <span style={s.cell}>${Number(u.balance).toFixed(2)}</span>
                <span style={s.cell}>${Number(u.available).toFixed(2)}</span>
                <span style={s.cell}>${Number(u.locked).toFixed(2)}</span>
                <span style={{ ...s.cell, color: Number(u.unrealized_pnl) >= 0 ? '#4CAF50' : '#FF5252' }}>
                  {Number(u.unrealized_pnl) >= 0 ? '+' : ''}{Number(u.unrealized_pnl).toFixed(2)}
                </span>
              </div>
            ))}
            {users.length === 0 && <div style={s.empty}>No users yet</div>}
          </div>
        </div>
      )}

      {tab === 'risk' && (
        <div style={s.content}>
          <h2 style={s.h2}>Risk Monitor — Open Positions ({positions.length})</h2>
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span style={s.cell}>User</span><span style={s.cell}>Symbol</span><span style={s.cell}>Side</span>
              <span style={s.cell}>Size</span><span style={s.cell}>Entry</span><span style={s.cell}>Leverage</span>
              <span style={s.cell}>Margin</span><span style={s.cell}>PnL</span>
            </div>
            {positions.map((p, i) => (
              <div key={i} style={s.tableRow}>
                <span style={s.cell}>{p.user_id.slice(0, 12)}...</span>
                <span style={s.cell}>{p.symbol}</span>
                <span style={{ ...s.cell, color: p.side === 'LONG' ? '#4CAF50' : '#FF5252' }}>{p.side}</span>
                <span style={s.cell}>{p.size.toFixed(4)}</span>
                <span style={s.cell}>${p.entry_price.toFixed(2)}</span>
                <span style={s.cell}>{p.leverage}×</span>
                <span style={s.cell}>${p.margin.toFixed(2)}</span>
                <span style={{ ...s.cell, color: p.unrealized_pnl >= 0 ? '#4CAF50' : '#FF5252' }}>
                  {p.unrealized_pnl >= 0 ? '+' : ''}{p.unrealized_pnl.toFixed(2)}
                </span>
              </div>
            ))}
            {positions.length === 0 && <div style={s.empty}>No open positions</div>}
          </div>
        </div>
      )}

      {tab === 'markets' && (
        <div style={s.content}>
          <h2 style={s.h2}>Markets ({markets.length})</h2>
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span style={s.cell}>Symbol</span><span style={s.cell}>Max Leverage</span><span style={s.cell}>Tick Size</span>
              <span style={s.cell}>Lot Size</span><span style={s.cell}>Maker Fee</span><span style={s.cell}>Taker Fee</span>
            </div>
            {markets.map((m: any) => (
              <div key={m.symbol} style={s.tableRow}>
                <span style={{ ...s.cell, fontWeight: 700 }}>{m.symbol}</span>
                <span style={s.cell}>{m.max_leverage}×</span>
                <span style={s.cell}>{m.tick_size}</span>
                <span style={s.cell}>{m.lot_size}</span>
                <span style={s.cell}>{(m.maker_fee * 100).toFixed(2)}%</span>
                <span style={s.cell}>{(m.taker_fee * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={s.statCard}>
      <span style={s.statValue}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  main: { minHeight: '100vh', backgroundColor: '#0A0A0F', color: '#E8E8F0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  loginBox: { maxWidth: 360, margin: '0 auto', paddingTop: 120, display: 'flex', flexDirection: 'column', gap: 12 },
  loginTitle: { fontSize: 28, fontWeight: 800, textAlign: 'center', color: '#7B61FF', marginBottom: 16 },
  input: { padding: '12px 16px', borderRadius: 10, border: '1px solid #1a1a2e', backgroundColor: '#0f0f1a', color: '#E8E8F0', fontSize: 15, outline: 'none' },
  btn: { padding: '14px', borderRadius: 10, backgroundColor: '#7B61FF', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer' },
  error: { color: '#FF5252', fontSize: 13, textAlign: 'center', margin: 0 },
  nav: { display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a2e', gap: 24 },
  logo: { fontSize: 18, fontWeight: 800, color: '#7B61FF' },
  tabs: { display: 'flex', gap: 4, flex: 1 },
  tab: { padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tabActive: { padding: '8px 16px', borderRadius: 8, border: 'none', backgroundColor: '#7B61FF20', color: '#7B61FF', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  logout: { padding: '8px 16px', borderRadius: 8, border: '1px solid #333', backgroundColor: 'transparent', color: '#888', fontSize: 12, cursor: 'pointer' },
  content: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  h2: { fontSize: 22, fontWeight: 800, marginBottom: 20 },
  h3: { fontSize: 16, fontWeight: 700, marginTop: 32, marginBottom: 12 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 },
  statCard: { padding: 20, borderRadius: 12, border: '1px solid #1a1a2e', backgroundColor: '#0f0f1a', display: 'flex', flexDirection: 'column', gap: 4 },
  statValue: { fontSize: 28, fontWeight: 800, color: '#7B61FF' },
  statLabel: { fontSize: 12, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  table: { borderRadius: 12, border: '1px solid #1a1a2e', overflow: 'hidden' },
  tableHeader: { display: 'flex', padding: '10px 16px', backgroundColor: '#0f0f1a', borderBottom: '1px solid #1a1a2e', gap: 8 },
  tableRow: { display: 'flex', padding: '10px 16px', borderBottom: '1px solid #0f0f1a', gap: 8 },
  cell: { flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  empty: { padding: 32, textAlign: 'center', color: '#444', fontSize: 14 },
};
