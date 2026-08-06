// ===== Pages: Login + Dashboards + Employees + Branches + Transactions =====
const { useState: useStateP, useEffect: useEffectP, useMemo: useMemoP, useRef: useRefP } = React;

// ----- Login page -----
function LoginPage({ onLoggedIn }) {
  const [email, setEmail] = useStateP('');
  const [password, setPassword] = useStateP('');
  const [loading, setLoading] = useStateP(false);
  const [error, setError] = useStateP('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast('Selamat datang!', 'success');
      onLoggedIn();
    } catch (err) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">JBB</div>
        <div className="auth-sub">아름다움</div>
        <h2 className="auth-title">Management Program</h2>
        <p className="auth-desc">Anda keluarga besar JBB / VIALI? Silahkan Masuk</p>
        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <input className="form-input" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@jbb.local" required autoComplete="email"/>
          </Field>
          <Field label="Password" error={error}>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"/>
          </Field>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Masuk'}
          </button>
        </form>
        <div style={{textAlign:'center',marginTop:24,fontSize:12,color:'var(--muted)'}}>
          Lupa password? Hubungi admin JBB.
        </div>
      </div>
    </div>
  );
}

// ----- Admin Dashboard -----
// ===== Chart color palette (JBB design tokens) =====
const CHART_COLORS = ['#7a667e', '#c9a961', '#4a7c59', '#a85555', '#3d2e44', '#b8893d'];

// ----- Donut chart (SVG) -----
function DonutChart({ data, valueKey = 'count', size = 200 }) {
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
  if (total === 0) {
    return <div style={{textAlign:'center',color:'var(--muted)',fontSize:13,padding:'40px 0'}}>Belum ada data</div>;
  }
  const cx = size / 2, cy = size / 2;
  const r = size / 2 - 10;
  const inner = r * 0.58;
  let angle = -Math.PI / 2; // start at top
  const segs = data.map((d, i) => {
    const val = Number(d[valueKey]) || 0;
    const frac = val / total;
    const a0 = angle;
    const a1 = angle + frac * 2 * Math.PI;
    angle = a1;
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1), yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0), yi0 = cy + inner * Math.sin(a0);
    const path = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${inner} ${inner} 0 ${large} 0 ${xi0} ${yi0} Z`;
    return { path, color: CHART_COLORS[i % CHART_COLORS.length], pct: Math.round(frac * 100) };
  });
  return (
    <div style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segs.map((s, i) => <path key={i} d={s.path} fill={s.color}/>)}
        <text x={cx} y={cy - 6} textAnchor="middle" style={{fontFamily:"'Cormorant Garamond', serif",fontSize:28,fontWeight:600,fill:'var(--plum-deep)'}}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{fontSize:10,fill:'var(--muted)'}}>total treatment</text>
      </svg>
      <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:140}}>
        {data.map((d, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
            <span style={{width:12,height:12,borderRadius:3,background:CHART_COLORS[i % CHART_COLORS.length],flexShrink:0}}/>
            <span style={{flex:1,color:'var(--plum)'}}>{d.label}</span>
            <span style={{fontWeight:600,color:'var(--plum-deep)'}}>{d[valueKey]}</span>
            <span style={{color:'var(--muted)',fontSize:11,width:34,textAlign:'right'}}>{segs[i].pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Horizontal bar chart (SVG) -----
function BarChart({ data, isRupiah = true, color = '#c9a961' }) {
  if (!data.length || data.every(d => !d.value)) {
    return <div style={{textAlign:'center',color:'var(--muted)',fontSize:13,padding:'40px 0'}}>Belum ada data</div>;
  }
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
              <span style={{color:'var(--plum)',fontWeight:500}}>{d.label}</span>
              <span style={{color:'var(--plum-deep)',fontWeight:600,fontFamily:isRupiah?"'JetBrains Mono', monospace":'inherit',fontSize:12}}>
                {isRupiah ? fmtRp(d.value) : d.value}
              </span>
            </div>
            <div style={{height:14,background:'var(--mauve-tint)',borderRadius:7,overflow:'hidden'}}>
              <div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:7,transition:'width 0.4s ease'}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----- Line/area chart (SVG) -----
function LineChart({ data, height = 220 }) {
  if (!data.length) {
    return <div style={{textAlign:'center',color:'var(--muted)',fontSize:13,padding:'40px 0'}}>Belum ada data</div>;
  }
  const W = 760, H = height, padL = 44, padR = 16, padT = 20, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxOmset = Math.max(...data.map(d => d.omset), 1);
  // round max up to a nice number
  const niceMax = Math.ceil(maxOmset / 100000) * 100000 || 100000;
  const n = data.length;
  const xFor = i => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yFor = v => padT + plotH - (v / niceMax) * plotH;

  const pts = data.map((d, i) => ({ x: xFor(i), y: yFor(d.omset), d }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length-1].x.toFixed(1)} ${(padT+plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT+plotH).toFixed(1)} Z`;

  // y-axis ticks (4 steps)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ v: niceMax * f, y: yFor(niceMax * f) }));
  // x labels: show subset to avoid crowding
  const labelStep = Math.ceil(n / 12);

  return (
    <div style={{overflowX:'auto'}}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{minWidth:420}}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a667e" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#7a667e" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 3"/>
            <text x={padL - 6} y={t.y + 3} textAnchor="end" style={{fontSize:9,fill:'var(--muted)'}}>
              {t.v >= 1000000 ? (t.v/1000000).toFixed(t.v >= 10000000 ? 0 : 1) + 'jt' : t.v >= 1000 ? Math.round(t.v/1000) + 'rb' : Math.round(t.v)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill="url(#areaGrad)"/>
        <path d={linePath} fill="none" stroke="#7a667e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={n > 20 ? 2 : 3.5} fill="#c9a961" stroke="#fff" strokeWidth="1">
            <title>{`${p.d.label}: ${fmtRp(p.d.omset)} (${p.d.count} trx)`}</title>
          </circle>
        ))}
        {data.map((d, i) => (i % labelStep === 0 || i === n - 1) && (
          <text key={i} x={xFor(i)} y={H - 10} textAnchor="middle" style={{fontSize:9,fill:'var(--muted)'}}>{d.label}</text>
        ))}
      </svg>
    </div>
  );
}

function AdminDashboard({ profile, setPage, currentBranchId, branches }) {
  const isSuper = profile.role === 'super_admin';
  const [period, setPeriod] = useStateP('period');
  const [customFrom, setCustomFrom] = useStateP('');
  const [customTo, setCustomTo] = useStateP('');
  const [data, setData] = useStateP(null);
  const [loading, setLoading] = useStateP(true);

  const currentBranch = branches.find(b => b.id === currentBranchId);
  // employee/branch_admin always scoped to own branch; super can see all (null) or one
  const filterBranch = isSuper ? currentBranchId : profile.branch_id;
  const scopeLabel = filterBranch
    ? (branches.find(b => b.id === filterBranch)?.name || '')
    : 'Semua Cabang (JBB Group)';

  async function load() {
    setLoading(true);
    try {
      const range = getDashboardRange(period, customFrom, customTo);
      const d = await getDashboardData({
        branchId: filterBranch,
        from: range.from,
        to: range.to,
        grain: range.grain,
      });
      setData(d);
    } catch (err) {
      console.error('Dashboard load error:', err);
      toast('Gagal memuat dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { load(); }, [currentBranchId, period, customFrom, customTo]);

  const range = getDashboardRange(period, customFrom, customTo);
  const showBranchChart = !filterBranch; // only meaningful when viewing all branches

  return (
    <div className="page">
      <PageHeader
        title={isSuper ? 'Dashboard JBB Group' : 'Dashboard Cabang'}
        sub={`Halo, ${profile.full_name}`}
      />

      {/* SCOPE + PERIOD CONTROLS */}
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12,marginBottom:14}}>
          <div style={{fontSize:13,color:'var(--plum)'}}>
            <strong>Scope:</strong> {scopeLabel}
            {isSuper && (
              <span style={{color:'var(--muted)',fontSize:12}}> · ganti cabang dari dropdown pojok kanan atas</span>
            )}
          </div>
          <div style={{fontSize:12,color:'var(--muted)'}}>
            📅 {fmtDate(range.from)} — {fmtDate(range.to)}
          </div>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {[
            { value: 'today', label: 'Hari Ini' },
            { value: 'period', label: 'Periode (26–25)' },
            { value: 'month', label: 'Bulan Ini' },
            { value: 'year', label: 'Tahun Ini' },
            { value: 'custom', label: '📅 Custom' },
          ].map(p => (
            <button key={p.value} type="button"
              className={'btn btn-sm ' + (period === p.value ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setPeriod(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="form-row" style={{marginTop:12}}>
            <Field label="Dari Tanggal">
              <input type="date" className="form-input" value={customFrom} onChange={e => setCustomFrom(e.target.value)}/>
            </Field>
            <Field label="Sampai Tanggal">
              <input type="date" className="form-input" value={customTo} onChange={e => setCustomTo(e.target.value)}/>
            </Field>
          </div>
        )}
      </Card>

      {/* KPI CARDS */}
      <div className="metrics-grid">
        <Metric label="Total Transaksi" value={loading ? '...' : (data?.kpi.totalTransactions ?? 0)} sub={loading ? 'memuat...' : 'periode ini'}/>
        <Metric label="Total Omset" value={loading ? '...' : fmtRp(data?.kpi.totalOmset)} sub="periode ini"/>
        <Metric label="Total Komisi" value={loading ? '...' : fmtRp(data?.kpi.totalCommission)} sub="treatment + HS"/>
        <Metric label="Estimasi Payroll" value={loading ? '...' : fmtRp(data?.kpi.estPayroll)} sub="gaji pokok + komisi"/>
      </div>

      {loading ? (
        <Card><Loader text="Memuat grafik..."/></Card>
      ) : (
        <>
          {/* ROW: DONUT + BAR CATEGORY */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:16}}>
            <Card title="Jenis Treatment" sub="Distribusi treatment di periode ini">
              <DonutChart data={data.treatmentDist} valueKey="count"/>
            </Card>
            <Card title="Omset per Kategori" sub="Pendapatan per jenis layanan">
              <BarChart data={data.omsetByCategory} isRupiah={true} color="#c9a961"/>
            </Card>
          </div>

          {/* ROW: BRANCH BAR (only for all-branch view) */}
          {showBranchChart && (
            <Card title="Omset per Cabang" sub="Perbandingan antar cabang JBB Group">
              <BarChart data={data.omsetByBranch} isRupiah={true} color="#7a667e"/>
            </Card>
          )}

          {/* ROW: TREND LINE */}
          <Card title={range.grain === 'month' ? 'Tren Omset Bulanan' : 'Tren Omset Harian'} sub={range.grain === 'month' ? 'Per bulan sepanjang tahun' : 'Per hari di periode ini'}>
            <LineChart data={data.trend}/>
          </Card>
        </>
      )}

      {/* QUICK ACTIONS */}
      <Card title="Aksi Cepat">
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={() => setPage('newTransaction')}>+ Input Transaksi</button>
          <button className="btn btn-ghost" onClick={() => setPage('transactions')}>Lihat Transaksi</button>
          <button className="btn btn-ghost" onClick={() => setPage('employees')}>Karyawan</button>
          {isSuper && <button className="btn btn-ghost" onClick={() => setPage('branches')}>Lihat Semua Cabang</button>}
        </div>
      </Card>
    </div>
  );
}

// ----- Branches list page -----
function BranchesPage() {
  const [branches, setBranches] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  async function load() {
    setLoading(true);
    try { setBranches(await listBranches()); }
    catch (err) { toast('Gagal: ' + err.message, 'error'); }
    finally { setLoading(false); }
  }
  useEffectP(() => { load(); }, []);

  return (
    <div className="page">
      <PageHeader title="Cabang" sub="JBB Group"/>
      <Card>
        {loading ? <Loader text="Memuat..."/> : !branches.length ? <Empty title="Belum ada cabang"/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Kode</th><th>Nama</th><th>Kota</th><th>Status</th>
                  <th className="table-numeric">Profit Sharing</th><th>WhatsApp</th><th>Berdiri</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(b => (
                  <tr key={b.id}>
                    <td><span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>{b.id}</span></td>
                    <td style={{fontWeight:500}}>{b.name}</td>
                    <td>{b.city}</td>
                    <td>{b.status === 'inhouse' ? <span className="badge badge-mauve">In-house</span> : <span className="badge badge-gold">Franchise</span>}</td>
                    <td className="table-numeric">{b.status === 'franchise' ? `${b.profit_sharing_pct}%` : '—'}</td>
                    <td style={{fontSize:12,fontFamily:'JetBrains Mono, monospace',color:'var(--muted)'}}>{b.whatsapp}</td>
                    <td>{b.established_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// =====================================================
// NEW TRANSACTION PAGE
// =====================================================
function NewTransactionPage({ profile, currentBranchId, branches, setPage }) {
  const isSuper = profile.role === 'super_admin';

  const effectiveBranchId = useMemoP(() => {
    if (profile.role === 'super_admin') {
      return currentBranchId || profile.branch_id;
    }
    return profile.branch_id;
  }, [profile, currentBranchId]);

  const effectiveBranch = branches.find(b => b.id === effectiveBranchId);

  const [date, setDate] = useStateP(todayStr());
  const [startTime, setStartTime] = useStateP(nowTimeStr());
  const [clientName, setClientName] = useStateP('');
  const [clientPhone, setClientPhone] = useStateP('');
  const [foundClient, setFoundClient] = useStateP(null);
  const [isHomeService, setIsHomeService] = useStateP(false);
  const [homeServiceFee, setHomeServiceFee] = useStateP('');
  const [notes, setNotes] = useStateP('');
  const [paymentMethod, setPaymentMethod] = useStateP('cash');
  // DP states
  const [hasDp, setHasDp] = useStateP(false);
  const [dpAmount, setDpAmount] = useStateP('');
  const [dpMethod, setDpMethod] = useStateP('qris');
  const [dpDate, setDpDate] = useStateP(todayStr());
  // Tips states (Tahap 2) — tips per beautician (transfer/qris only)
  const [hasTips, setHasTips] = useStateP(false);
  const [tips, setTips] = useStateP([{ employee_id: '', amount: '', payment_method: 'qris' }]);
  // shareWith: array of additional employee_ids (multi-employee support)
  // share_percents: parallel array of percentages [main, ...sharedWith]
  const [items, setItems] = useStateP([{ employee_id: '', service_name: '', price: '', fixed_commission: '', notes: '', share_with: [], share_percents: [100], discount_type: 'none', discount_value: '', has_complaint: false, complaint_note: '' }]);
  const [employees, setEmployees] = useStateP([]);
  const [loadingEmployees, setLoadingEmployees] = useStateP(true);
  const [submitting, setSubmitting] = useStateP(false);
  const [savedTransactionId, setSavedTransactionId] = useStateP(null);
  const [showPhotoUploadAfter, setShowPhotoUploadAfter] = useStateP(false);
  const [showInvoicePrompt, setShowInvoicePrompt] = useStateP(false);

  const isOT = isOvertime(startTime);

  useEffectP(() => {
    if (!effectiveBranchId) return;
    setLoadingEmployees(true);
    listEmployees(effectiveBranchId, true)
      .then(setEmployees)
      .catch(err => toast('Gagal: ' + err.message, 'error'))
      .finally(() => setLoadingEmployees(false));
  }, [effectiveBranchId]);

  useEffectP(() => {
    if (!clientPhone || clientPhone.length < 8) {
      setFoundClient(null);
      return;
    }
    const timer = setTimeout(async () => {
      const c = await findClientByPhone(effectiveBranchId, clientPhone);
      if (c) {
        setFoundClient(c);
        if (!clientName) setClientName(c.full_name);
      } else {
        setFoundClient(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [clientPhone, effectiveBranchId]);

  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }
  function addItem() {
    setItems(prev => [...prev, { employee_id: '', service_name: '', price: '', fixed_commission: '', notes: '', share_with: [], share_percents: [100], discount_type: 'none', discount_value: '', has_complaint: false, complaint_note: '' }]);
  }
  function removeItem(idx) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  }

  // Compute discount amount for an item based on type (percent/nominal) and original price
  function getItemDiscount(item) {
    const orig = Number(item.price) || 0;
    if (!item.discount_type || item.discount_type === 'none' || !item.discount_value) return 0;
    const val = Number(item.discount_value) || 0;
    if (val <= 0) return 0;
    if (item.discount_type === 'percent') {
      return Math.round(orig * Math.min(val, 100) / 100);
    }
    // nominal
    return Math.min(Math.round(val), orig);  // can't discount more than price
  }

  // Effective (discounted) price — this is what commission & omset use
  function getItemEffectivePrice(item) {
    const orig = Number(item.price) || 0;
    return Math.max(0, orig - getItemDiscount(item));
  }

  function getItemCommission(item) {
    if (!item.service_name) return { rate: 0, amount: 0, type: 'percent' };

    // Client complaint: commission is forfeited for this treatment.
    // Revenue (omset) is unaffected — the client still paid.
    if (item.has_complaint) {
      return { rate: 0, amount: 0, type: 'percent' };
    }

    const svc = getServiceDef(item.service_name);
    const effectivePrice = getItemEffectivePrice(item);

    // If commission_override has value (HS mode), use it directly (for percent type only)
    // For fixed_amount (Sulam Alis), always use fixed_commission as before
    if (svc?.commission_type === 'percent' && item.commission_override !== undefined && item.commission_override !== null && item.commission_override !== '') {
      return {
        rate: 0,
        amount: Number(item.commission_override) || 0,
        type: 'percent_manual',
      };
    }

    return calcCommission({
      serviceName: item.service_name,
      price: effectivePrice,
      fixedAmount: Number(item.fixed_commission) || 0,
      isOT,
      branchId: effectiveBranchId,
    });
  }

  const totalAmount = items.reduce((sum, it) => sum + getItemEffectivePrice(it), 0);
  const totalDiscount = items.reduce((sum, it) => sum + getItemDiscount(it), 0);
  const totalCommission = items.reduce((sum, it) => sum + getItemCommission(it).amount, 0);
  // Distinct beauticians on this transaction (main + join partners).
  // The home service fee is shared equally between them.
  const distinctWorkers = (() => {
    const ids = new Set();
    for (const it of items) {
      if (it.employee_id) ids.add(it.employee_id);
      for (const sid of (it.share_with || [])) if (sid) ids.add(sid);
    }
    return Math.max(1, ids.size);
  })();
  const hsPerWorker = isHomeService ? Math.round((Number(homeServiceFee) || 0) / distinctWorkers) : 0;
  const totalForEmployee = totalCommission + (isHomeService ? (Number(homeServiceFee) || 0) : 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!effectiveBranchId) { toast('Cabang belum ditentukan', 'error'); return; }
    if (!clientName.trim()) { toast('Nama pelanggan wajib diisi', 'error'); return; }
    if (!items.length || items.some(it => !it.employee_id || !it.service_name || !it.price)) {
      toast('Lengkapi semua item', 'error'); return;
    }
    // Validate: shared_with all picked, percents sum to 100
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const allEmps = [it.employee_id, ...(it.share_with || [])];
      if (new Set(allEmps).size !== allEmps.length) {
        toast(`Treatment #${i+1}: karyawan tidak boleh sama`, 'error'); return;
      }
      if (allEmps.some(e => !e)) {
        toast(`Treatment #${i+1}: semua karyawan harus dipilih`, 'error'); return;
      }
      if (allEmps.length > 1) {
        const total = (it.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
        if (Math.abs(total - 100) > 0.01) {
          toast(`Treatment #${i+1}: total persentase harus 100% (sekarang ${total}%)`, 'error'); return;
        }
      }
    }
    for (const it of items) {
      const svc = getServiceDef(it.service_name);
      if (svc?.commission_type === 'fixed_amount' && !it.fixed_commission) {
        toast(`Komisi sulam alis wajib diisi`, 'error'); return;
      }
    }
    if (isHomeService && !homeServiceFee) { toast('Biaya home service wajib diisi', 'error'); return; }

    setSubmitting(true);
    try {
      // Expand items: shared treatments become multiple rows with same share_group_id
      const itemsPayload = [];
      for (const it of items) {
        const allEmps = [it.employee_id, ...(it.share_with || [])];
        const isShared = allEmps.length > 1;
        const originalPrice = Number(it.price) || 0;
        const itemDiscount = getItemDiscount(it);
        const effectivePrice = getItemEffectivePrice(it);  // price after discount
        const totalPrice = effectivePrice;  // commission & omset use discounted price
        const com = getItemCommission(it);
        const dbCommissionType = com.type === 'percent_manual' ? 'percent' : com.type;
        const hasDiscount = it.discount_type && it.discount_type !== 'none' && itemDiscount > 0;

        // Generate share_group_id once per treatment (only used if shared)
        const shareGroupId = isShared ? (crypto.randomUUID ? crypto.randomUUID() : ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c==='x' ? r : (r&0x3|0x8)).toString(16); }))) : null;

        allEmps.forEach((empId, idx) => {
          const sharePercent = isShared ? Number(it.share_percents[idx] || 0) : 100;
          const splitPrice = Math.round(totalPrice * sharePercent / 100);
          // Split original price & discount proportionally too (for invoice display)
          const splitOriginal = Math.round(originalPrice * sharePercent / 100);
          const splitDiscount = Math.round(itemDiscount * sharePercent / 100);

          // For shared: recalculate commission based on split price
          let splitCommissionAmount;
          if (isShared) {
            if (com.type === 'fixed_amount') {
              splitCommissionAmount = Math.round(com.amount * sharePercent / 100);
            } else {
              splitCommissionAmount = Math.round(splitPrice * com.rate / 100);
            }
          } else {
            splitCommissionAmount = com.amount;
          }

          itemsPayload.push({
            employee_id: empId,
            service_name: it.service_name,
            price: splitPrice,
            commission_type: dbCommissionType,
            commission_rate: com.rate,
            commission_amount: splitCommissionAmount,
            notes: it.notes || null,
            share_group_id: shareGroupId,
            share_percent: sharePercent,
            original_price: hasDiscount ? splitOriginal : splitPrice,
            discount_type: hasDiscount ? it.discount_type : null,
            discount_value: hasDiscount ? (Number(it.discount_value) || 0) : null,
            discount_amount: hasDiscount ? splitDiscount : 0,
            has_complaint: !!it.has_complaint,
            complaint_note: it.has_complaint ? (it.complaint_note || null) : null,
          });
        });
      }

      // Build payments array based on hasDp (use discounted prices)
      const grandTotal = items.reduce((sum, it) => sum + getItemEffectivePrice(it), 0)
        + (isHomeService ? (Number(homeServiceFee) || 0) : 0);

      let paymentsArr = null;
      if (hasDp) {
        const dp = Number(dpAmount) || 0;
        const sisa = grandTotal - dp;
        if (dp <= 0) { toast('Jumlah DP wajib diisi (> 0)', 'error'); setSubmitting(false); return; }
        if (dp >= grandTotal) { toast('DP tidak boleh ≥ total transaksi', 'error'); setSubmitting(false); return; }
        if (!dpDate) { toast('Tanggal DP wajib diisi', 'error'); setSubmitting(false); return; }
        paymentsArr = [
          { method: dpMethod, amount: dp, is_dp: true, paid_at: dpDate },
          { method: paymentMethod, amount: sisa, is_dp: false, paid_at: date },
        ];
      }

      // Build tips array (only if hasTips). Validate each tip.
      let tipsArr = null;
      if (hasTips) {
        const validTips = tips.filter(t => t.employee_id && Number(t.amount) > 0);
        // Check: if user toggled tips on but filled nothing meaningful
        for (const t of tips) {
          if ((t.employee_id && (!t.amount || Number(t.amount) <= 0)) ||
              (!t.employee_id && Number(t.amount) > 0)) {
            toast('Tips: pastikan setiap baris ada beautician DAN jumlah > 0', 'error');
            setSubmitting(false); return;
          }
        }
        if (validTips.length > 0) {
          tipsArr = validTips.map(t => ({
            employee_id: t.employee_id,
            amount: Number(t.amount),
            payment_method: t.payment_method || 'qris',
          }));
        }
      }

      const newTrx = await createTransaction({
        branchId: effectiveBranchId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date, startTime, isHomeService,
        homeServiceFee: Number(homeServiceFee) || 0,
        notes,
        items: itemsPayload,
        createdBy: profile.id,
        paymentMethod,
        payments: paymentsArr,
        tips: tipsArr,
      });

      toast('Transaksi tersimpan! 🎉 Sekarang upload foto.', 'success');
      setSavedTransactionId(newTrx.id);
      setShowPhotoUploadAfter(true);
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageHeader title="Input Transaksi" sub={effectiveBranch?.name || 'Cabang'}/>
      {!effectiveBranchId && (
        <Card>
          <div style={{padding:'16px',background:'#f0dada',color:'var(--red)',borderRadius:8,fontSize:13}}>
            <strong>⚠️ Pilih cabang dulu</strong> dari dropdown di pojok kanan atas.
          </div>
        </Card>
      )}
      {effectiveBranchId && (
        <form onSubmit={handleSubmit}>
          <Card title="Info Transaksi" sub="Tanggal, jam, pelanggan">
            <div className="form-row-3">
              <Field label="Tanggal">
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required/>
              </Field>
              <Field label="Jam Mulai" hint={isOT ? '⚠️ Lembur — komisi +5%' : 'Jam masuk treatment'}>
                <input type="time" className="form-input" value={startTime}
                  onChange={e => setStartTime(e.target.value)} required
                  style={isOT ? {borderColor:'var(--amber)',background:'#fdf6e3'} : {}}/>
              </Field>
              <Field label="Cabang">
                <input type="text" className="form-input" value={effectiveBranch?.name || ''} disabled/>
              </Field>
            </div>
            <div className="form-row">
              <Field label="No. HP Pelanggan" hint={foundClient ? `✓ Pelanggan kembali: ${foundClient.total_visits || 0}x` : 'Format: 08xxxxxxx (opsional)'}>
                <input type="tel" className="form-input" value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="08xxxxxxxxx"
                  style={foundClient ? {borderColor:'var(--green)',background:'#f0f9f3'} : {}}/>
              </Field>
              <Field label="Nama Pelanggan *">
                <input type="text" className="form-input" value={clientName}
                  onChange={e => setClientName(e.target.value)} placeholder="Nama lengkap" required/>
              </Field>
            </div>
          </Card>

          <Card title="Treatment" sub={`${items.length} item • Total ${fmtRp(totalAmount)}`}
            action={<button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Tambah Treatment</button>}>
            {loadingEmployees ? <Loader text="Memuat..."/> : (
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {items.map((item, idx) => {
                  const svc = getServiceDef(item.service_name);
                  const com = getItemCommission(item);
                  const isFixedComm = svc?.commission_type === 'fixed_amount';
                  return (
                    <div key={idx} style={{padding:16,border:'1px solid var(--line)',borderRadius:12,background:'var(--cream)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                        <span className="eyebrow" style={{fontSize:10}}>Treatment #{idx+1}</span>
                        {items.length > 1 && (
                          <button type="button" className="btn btn-danger btn-sm"
                            onClick={() => removeItem(idx)} style={{padding:'4px 10px',fontSize:11}}>Hapus</button>
                        )}
                      </div>
                      <div className="form-row">
                        <Field label="Karyawan *">
                          <select className="form-select" value={item.employee_id}
                            onChange={e => updateItem(idx, { employee_id: e.target.value })} required>
                            <option value="">— pilih karyawan —</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.full_name} {emp.job_title ? `· ${emp.job_title}` : ''}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Treatment *">
                          <select className="form-select" value={item.service_name}
                            onChange={e => {
                              const newSvcName = e.target.value;
                              const newSvc = getServiceDef(newSvcName);
                              // Reset fixed_commission saat service ganti
                              // Set commission_override = '0' kalau HS aktif & service baru itu percent type
                              const patch = {
                                service_name: newSvcName,
                                fixed_commission: '',
                              };
                              if (isHomeService && newSvc?.commission_type === 'percent') {
                                patch.commission_override = '0';
                              } else {
                                patch.commission_override = '';
                              }
                              updateItem(idx, patch);
                            }} required>
                            <option value="">— pilih treatment —</option>
                            {SERVICES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                          </select>
                        </Field>
                      </div>
                      <div className="form-row">
                        <Field label="Harga (Rp) *">
                          <input type="number" className="form-input" value={item.price}
                            onChange={e => updateItem(idx, { price: e.target.value })}
                            placeholder="200000" min="0" required/>
                        </Field>
                        {isFixedComm ? (
                          <Field label="Komisi Karyawan (Rp) *"
                            hint={`Input manual. ${isOT && effectiveBranchId !== 'bdg' ? '+Rp 5.000 lembur' : isOT && effectiveBranchId === 'bdg' ? 'Tidak ada bonus lembur (Bandung)' : ''}`}>
                            <input type="number" className="form-input" value={item.fixed_commission}
                              onChange={e => updateItem(idx, { fixed_commission: e.target.value })}
                              placeholder="50000" min="0" step="1000" required/>
                          </Field>
                        ) : item.service_name && isHomeService ? (
                          <Field
                            label="Komisi Treatment (Rp)"
                            hint="Default Rp 0 (sudah include di HS). Edit kalau perlu kasih komisi tambahan."
                          >
                            <input type="number" className="form-input"
                              value={item.commission_override ?? '0'}
                              onChange={e => updateItem(idx, { commission_override: e.target.value })}
                              min="0" step="1000" placeholder="0"
                              style={{borderColor:'var(--amber)',background:'#fdf6e3'}}/>
                          </Field>
                        ) : item.service_name ? (
                          <Field label="Komisi Otomatis" hint={`${com.rate}% dari harga`}>
                            <input type="text" className="form-input" value={fmtRp(com.amount)} disabled
                              style={{background:'var(--mauve-tint)',color:'var(--plum)',fontWeight:500}}/>
                          </Field>
                        ) : (
                          <Field label="Komisi" hint="Pilih treatment dulu">
                            <input type="text" className="form-input" value="—" disabled/>
                          </Field>
                        )}
                      </div>

                      {/* Diskon per treatment */}
                      {Number(item.price) > 0 && (
                        <div style={{marginTop:10,padding:'10px 12px',background:'var(--cream)',borderRadius:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:(item.discount_type && item.discount_type !== 'none')?10:0,flexWrap:'wrap'}}>
                            <span style={{fontSize:12,fontWeight:500,color:'var(--plum)'}}>🏷️ Diskon:</span>
                            <div style={{display:'flex',gap:4}}>
                              <button type="button"
                                className={'btn btn-sm ' + ((!item.discount_type || item.discount_type === 'none') ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => updateItem(idx, { discount_type: 'none', discount_value: '' })}>
                                Tanpa Diskon
                              </button>
                              <button type="button"
                                className={'btn btn-sm ' + (item.discount_type === 'percent' ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => updateItem(idx, { discount_type: 'percent' })}>
                                Persen (%)
                              </button>
                              <button type="button"
                                className={'btn btn-sm ' + (item.discount_type === 'nominal' ? 'btn-primary' : 'btn-ghost')}
                                onClick={() => updateItem(idx, { discount_type: 'nominal' })}>
                                Nominal (Rp)
                              </button>
                            </div>
                          </div>
                          {item.discount_type && item.discount_type !== 'none' && (
                            <div>
                              <div className="form-row">
                                <Field label={item.discount_type === 'percent' ? 'Diskon (%)' : 'Diskon (Rp)'}>
                                  <input type="number" className="form-input" value={item.discount_value}
                                    onChange={e => updateItem(idx, { discount_value: e.target.value })}
                                    placeholder={item.discount_type === 'percent' ? '10' : '50000'}
                                    min="0" step="any" max={item.discount_type === 'percent' ? '100' : undefined}/>
                                </Field>
                                <Field label="Harga Setelah Diskon">
                                  <input type="text" className="form-input" disabled
                                    value={fmtRp(getItemEffectivePrice(item))}
                                    style={{background:'var(--mauve-tint)',color:'var(--plum)',fontWeight:600}}/>
                                </Field>
                              </div>
                              {getItemDiscount(item) > 0 && (
                                <div style={{fontSize:12,color:'var(--hijau)',marginTop:-4}}>
                                  Hemat {fmtRp(getItemDiscount(item))} · Komisi & omset dihitung dari harga setelah diskon
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Komplain client — komisi tidak dihitung */}
                      {item.service_name && (
                        <div style={{marginTop:10,padding:'10px 12px',background:item.has_complaint?'#fdf2f2':'var(--cream)',borderRadius:8,border:item.has_complaint?'1px solid var(--red)':'1px solid transparent'}}>
                          <label style={{display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer'}}>
                            <input type="checkbox" checked={!!item.has_complaint}
                              onChange={e => updateItem(idx, { has_complaint: e.target.checked, complaint_note: e.target.checked ? (item.complaint_note || '') : '' })}
                              style={{accentColor:'var(--red)',width:17,height:17,marginTop:1}}/>
                            <div>
                              <div style={{fontSize:13,fontWeight:500,color:item.has_complaint?'var(--red)':'var(--plum)'}}>
                                Client mengajukan komplain (komisi tidak dihitung)
                              </div>
                              <div style={{fontSize:11,color:'var(--muted)'}}>
                                Omset tetap penuh. Hanya komisi beautician untuk treatment ini yang jadi Rp 0.
                              </div>
                            </div>
                          </label>
                          {item.has_complaint && (
                            <div style={{marginTop:10}}>
                              <Field label="Catatan komplain (opsional, internal)">
                                <textarea className="form-textarea" rows="2" value={item.complaint_note || ''}
                                  onChange={e => updateItem(idx, { complaint_note: e.target.value })}
                                  placeholder="Contoh: bentuk alis tidak simetris, client minta perbaikan"/>
                              </Field>
                            </div>
                          )}
                        </div>
                      )}

                      {svc && (
                        <div style={{marginTop:8,padding:'8px 12px',background:'var(--paper)',borderRadius:6,fontSize:12,color:'var(--muted)',display:'flex',justifyContent:'space-between'}}>
                          <span>
                            <strong>Kategori:</strong> {svc.category} ·
                            <strong> Tipe komisi:</strong>{' '}
                            {svc.commission_type === 'percent'
                              ? (isHomeService ? 'Manual (HS mode)' : `${svc.baseRate}% (base)`)
                              : 'Manual Rp'}
                            {isOT && !isHomeService && ' · ⚠️ Lembur'}
                            {isHomeService && ' · 🏠 HS'}
                          </span>
                          <span style={{fontWeight:500,color:'var(--plum)'}}>Komisi: {fmtRp(com.amount)}</span>
                        </div>
                      )}

                      {/* Multi-employee sharing */}
                      <div style={{marginTop:12,paddingTop:12,borderTop:'1px dashed var(--line)'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,gap:8,flexWrap:'wrap'}}>
                          <span className="eyebrow" style={{fontSize:10}}>
                            👥 Kerjasama: {(item.share_with?.length || 0) + 1} karyawan
                          </span>
                          <div style={{display:'flex',gap:6}}>
                            <button type="button" className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const currentShareWith = item.share_with || [];
                                const newShareWith = [...currentShareWith, ''];
                                const newCount = newShareWith.length + 1; // +1 for main employee
                                // Recalculate equal percentages
                                const eqPercent = Math.floor(100 / newCount * 100) / 100;
                                const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
                                const newPercents = Array(newCount).fill(eqPercent);
                                newPercents[newCount - 1] = remainder;
                                updateItem(idx, { share_with: newShareWith, share_percents: newPercents });
                              }}
                              style={{padding:'4px 10px',fontSize:11}}>
                              + Tambah Karyawan
                            </button>
                          </div>
                        </div>

                        {/* Show share editor only if shared */}
                        {(item.share_with?.length || 0) > 0 && (
                          <div style={{padding:12,background:'#fef9f2',borderRadius:8,border:'1px solid #f0e0c0'}}>
                            <div style={{fontSize:11,color:'var(--muted)',marginBottom:10,lineHeight:1.5}}>
                              💡 <strong>Treatment dikerjakan bersama.</strong> Harga & komisi akan dibagi sesuai persentase. Total harus = 100%.
                            </div>

                            {/* Main employee row (already selected above) */}
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:8,background:'var(--paper)',borderRadius:6}}>
                              <div style={{flex:1,fontSize:13,fontWeight:500,color:'var(--plum)'}}>
                                👤 {employees.find(e => e.id === item.employee_id)?.full_name || '(belum pilih)'}
                                <div style={{fontSize:10,color:'var(--muted)'}}>Karyawan utama</div>
                              </div>
                              <input type="number" className="form-input"
                                value={item.share_percents?.[0] || 0}
                                onChange={e => {
                                  const newPercents = [...(item.share_percents || [])];
                                  newPercents[0] = Number(e.target.value);
                                  updateItem(idx, { share_percents: newPercents });
                                }}
                                min="1" max="100" step="0.01"
                                style={{width:80,textAlign:'center'}}/>
                              <span style={{fontSize:12,color:'var(--muted)'}}>%</span>
                            </div>

                            {/* Shared employees rows */}
                            {(item.share_with || []).map((empId, sidx) => (
                              <div key={sidx} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:8,background:'var(--paper)',borderRadius:6}}>
                                <select className="form-select"
                                  value={empId}
                                  onChange={e => {
                                    const newShareWith = [...(item.share_with || [])];
                                    newShareWith[sidx] = e.target.value;
                                    updateItem(idx, { share_with: newShareWith });
                                  }}
                                  style={{flex:1,fontSize:12}}>
                                  <option value="">— pilih karyawan partner —</option>
                                  {employees
                                    .filter(emp => emp.id !== item.employee_id && !(item.share_with || []).some((id, i) => i !== sidx && id === emp.id))
                                    .map(emp => (
                                      <option key={emp.id} value={emp.id}>
                                        {emp.full_name} {emp.job_title ? `· ${emp.job_title}` : ''}
                                      </option>
                                    ))}
                                </select>
                                <input type="number" className="form-input"
                                  value={item.share_percents?.[sidx + 1] || 0}
                                  onChange={e => {
                                    const newPercents = [...(item.share_percents || [])];
                                    newPercents[sidx + 1] = Number(e.target.value);
                                    updateItem(idx, { share_percents: newPercents });
                                  }}
                                  min="1" max="100" step="0.01"
                                  style={{width:80,textAlign:'center'}}/>
                                <span style={{fontSize:12,color:'var(--muted)'}}>%</span>
                                <button type="button"
                                  onClick={() => {
                                    const newShareWith = (item.share_with || []).filter((_, i) => i !== sidx);
                                    const newCount = newShareWith.length + 1;
                                    const eqPercent = Math.floor(100 / newCount * 100) / 100;
                                    const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
                                    const newPercents = Array(newCount).fill(eqPercent);
                                    newPercents[newCount - 1] = remainder;
                                    updateItem(idx, { share_with: newShareWith, share_percents: newPercents });
                                  }}
                                  className="btn btn-ghost btn-sm"
                                  style={{padding:'4px 8px',fontSize:11,color:'var(--red)'}}>
                                  ✕
                                </button>
                              </div>
                            ))}

                            {/* Total percentage indicator */}
                            {(() => {
                              const total = (item.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
                              const isValid = Math.abs(total - 100) < 0.01;
                              return (
                                <div style={{
                                  marginTop:8,padding:'6px 10px',borderRadius:6,
                                  background: isValid ? '#ecf5ef' : '#fdf0f0',
                                  fontSize:12,
                                  color: isValid ? 'var(--green)' : 'var(--red)',
                                  display:'flex',justifyContent:'space-between',alignItems:'center',
                                }}>
                                  <span>Total persentase</span>
                                  <span style={{fontWeight:600}}>
                                    {isValid ? '✓ ' : '⚠️ '}{total.toFixed(2)}% {!isValid && '(harus 100%)'}
                                  </span>
                                </div>
                              );
                            })()}

                            {/* Preview per-employee split */}
                            {item.price && (
                              <div style={{marginTop:10,padding:10,background:'var(--cream)',borderRadius:6,fontSize:11}}>
                                <div className="eyebrow" style={{fontSize:9,marginBottom:6}}>Pembagian harga & komisi:</div>
                                {[item.employee_id, ...(item.share_with || [])].map((empId, i) => {
                                  const pct = Number(item.share_percents?.[i] || 0);
                                  const splitPrice = Math.round(Number(item.price) * pct / 100);
                                  const splitCom = isFixedComm
                                    ? Math.round(com.amount * pct / 100)
                                    : Math.round(splitPrice * com.rate / 100);
                                  const empName = employees.find(e => e.id === empId)?.full_name || '(belum pilih)';
                                  return (
                                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontFamily:'JetBrains Mono, monospace'}}>
                                      <span>{empName} ({pct}%)</span>
                                      <span style={{color:'var(--plum)'}}>{fmtRp(splitPrice)} → komisi {fmtRp(splitCom)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Pembayaran" sub={hasDp ? "Klien sudah bayar DP — input metode DP & pelunasan" : "Pilih metode pembayaran dari klien"}>
            {/* DP Toggle */}
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:14,padding:'10px 12px',background:'var(--cream)',borderRadius:10}}>
              <input type="checkbox" checked={hasDp}
                onChange={e => {
                  const checked = e.target.checked;
                  setHasDp(checked);
                  if (!checked) {
                    setDpAmount('');
                  }
                }}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>💰 Klien sudah bayar DP</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>Centang jika ada DP yang sudah dibayar sebelumnya/awal</div>
              </div>
            </label>

            {!hasDp ? (
              <>
                <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>METODE PEMBAYARAN (FULL)</div>
                <Field>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:8}}>
                    {PAYMENT_METHODS.map(pm => (
                      <label key={pm.value}
                        style={{
                          display:'flex',alignItems:'center',gap:10,
                          padding:'12px 14px',
                          border:'2px solid',
                          borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
                          borderRadius:10,
                          background: paymentMethod === pm.value ? 'var(--mauve-tint)' : 'var(--paper)',
                          cursor:'pointer',
                          transition:'all 0.15s',
                        }}>
                        <input type="radio" name="paymentMethod"
                          value={pm.value}
                          checked={paymentMethod === pm.value}
                          onChange={() => setPaymentMethod(pm.value)}
                          style={{accentColor:'var(--mauve)'}}/>
                        <span style={{fontSize:18}}>{pm.icon}</span>
                        <span style={{fontSize:13,fontWeight:500,color: paymentMethod === pm.value ? 'var(--plum)' : 'var(--text)'}}>
                          {pm.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            ) : (
              <>
                {/* DP Section */}
                <div style={{padding:14,background:'#fdf6e3',borderRadius:10,marginBottom:14,border:'1px solid #f0e0c0'}}>
                  <div className="eyebrow" style={{fontSize:9,marginBottom:10,color:'var(--amber)'}}>1. DP (UANG MUKA)</div>
                  <div className="form-row">
                    <Field label="Tanggal DP">
                      <input type="date" className="form-input" value={dpDate}
                        onChange={e => setDpDate(e.target.value)}/>
                    </Field>
                    <Field label="Jumlah DP (Rp) *">
                      <input type="number" className="form-input" value={dpAmount}
                        onChange={e => setDpAmount(e.target.value)}
                        placeholder="50000" min="0" step="1000" required/>
                    </Field>
                  </div>
                  <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>METODE DP</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))',gap:6}}>
                    {PAYMENT_METHODS.map(pm => (
                      <label key={pm.value}
                        style={{
                          display:'flex',alignItems:'center',gap:8,
                          padding:'8px 10px',
                          border:'2px solid',
                          borderColor: dpMethod === pm.value ? 'var(--amber)' : 'var(--line)',
                          borderRadius:8,
                          background: dpMethod === pm.value ? '#fef3d7' : 'var(--paper)',
                          cursor:'pointer',
                          fontSize:12,
                        }}>
                        <input type="radio" name="dpMethod"
                          value={pm.value}
                          checked={dpMethod === pm.value}
                          onChange={() => setDpMethod(pm.value)}
                          style={{accentColor:'var(--amber)'}}/>
                        <span>{pm.icon}</span>
                        <span style={{fontSize:12,fontWeight:500}}>{pm.label.replace('Transfer ', '')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sisa Section */}
                <div style={{padding:14,background:'var(--mauve-tint)',borderRadius:10,border:'1px solid var(--mauve)'}}>
                  <div className="eyebrow" style={{fontSize:9,marginBottom:10,color:'var(--mauve)'}}>2. PELUNASAN (SISA)</div>
                  {(() => {
                    const grandTotal = totalAmount + (isHomeService ? Number(homeServiceFee) || 0 : 0);
                    const dp = Number(dpAmount) || 0;
                    const sisa = grandTotal - dp;
                    return (
                      <>
                        <div style={{padding:10,background:'var(--paper)',borderRadius:8,marginBottom:10,fontSize:13}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{color:'var(--muted)'}}>Total Transaksi</span>
                            <span style={{fontWeight:500}}>{fmtRp(grandTotal)}</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{color:'var(--amber)'}}>− DP {dpMethod ? `(${getPaymentMethodLabel(dpMethod)})` : ''}</span>
                            <span style={{fontWeight:500,color:'var(--amber)'}}>−{fmtRp(dp)}</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',paddingTop:6,borderTop:'1px solid var(--line)'}}>
                            <span style={{fontWeight:600,color:'var(--plum)'}}>Sisa Pembayaran</span>
                            <span style={{fontWeight:600,color: sisa < 0 ? 'var(--red)' : 'var(--plum)',fontSize:15}}>
                              {fmtRp(sisa)}
                            </span>
                          </div>
                          {sisa < 0 && (
                            <div style={{marginTop:6,fontSize:11,color:'var(--red)'}}>
                              ⚠️ DP melebihi total transaksi
                            </div>
                          )}
                        </div>
                        <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>METODE PELUNASAN</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))',gap:6}}>
                          {PAYMENT_METHODS.map(pm => (
                            <label key={pm.value}
                              style={{
                                display:'flex',alignItems:'center',gap:8,
                                padding:'8px 10px',
                                border:'2px solid',
                                borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
                                borderRadius:8,
                                background: paymentMethod === pm.value ? 'var(--paper)' : 'var(--paper)',
                                cursor:'pointer',
                                fontSize:12,
                              }}>
                              <input type="radio" name="paymentMethodSisa"
                                value={pm.value}
                                checked={paymentMethod === pm.value}
                                onChange={() => setPaymentMethod(pm.value)}
                                style={{accentColor:'var(--mauve)'}}/>
                              <span>{pm.icon}</span>
                              <span style={{fontSize:12,fontWeight:500}}>{pm.label.replace('Transfer ', '')}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </Card>

          <Card title="Tips dari Client" sub="Opsional — tips transfer/QRIS untuk beautician (tips cash langsung diterima beautician)">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:hasTips?14:0,padding:'10px 12px',background:'var(--cream)',borderRadius:10}}>
              <input type="checkbox" checked={hasTips}
                onChange={e => {
                  const checked = e.target.checked;
                  setHasTips(checked);
                  if (!checked) setTips([{ employee_id: '', amount: '', payment_method: 'qris' }]);
                }}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>💝 Ada tips dari client (transfer/QRIS)</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>Tips masuk ke rekening kita, lalu diberikan ke beautician. Tercatat di gaji mereka.</div>
              </div>
            </label>

            {hasTips && (
              <div>
                {tips.map((tip, idx) => (
                  <div key={idx} style={{padding:12,background:'var(--mauve-tint)',borderRadius:10,marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span className="eyebrow" style={{fontSize:10}}>Tips #{idx + 1}</span>
                      {tips.length > 1 && (
                        <button type="button"
                          onClick={() => setTips(tips.filter((_, i) => i !== idx))}
                          className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:11,color:'var(--red)'}}>
                          ✕ Hapus
                        </button>
                      )}
                    </div>
                    <Field label="Beautician Penerima *">
                      <select className="form-select" value={tip.employee_id}
                        onChange={e => {
                          const next = [...tips]; next[idx] = { ...next[idx], employee_id: e.target.value }; setTips(next);
                        }}>
                        <option value="">— pilih beautician —</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.full_name}{emp.job_title ? ` · ${emp.job_title}` : ''}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="form-row">
                      <Field label="Jumlah Tips (Rp) *">
                        <input type="number" className="form-input" value={tip.amount}
                          onChange={e => { const next = [...tips]; next[idx] = { ...next[idx], amount: e.target.value }; setTips(next); }}
                          placeholder="20000" min="0" step="any"/>
                      </Field>
                      <Field label="Metode">
                        <select className="form-select" value={tip.payment_method}
                          onChange={e => { const next = [...tips]; next[idx] = { ...next[idx], payment_method: e.target.value }; setTips(next); }}>
                          {PAYMENT_METHODS.filter(pm => pm.value !== 'cash').map(pm => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm"
                  onClick={() => setTips([...tips, { employee_id: '', amount: '', payment_method: 'qris' }])}>
                  + Tambah Tips (beautician lain)
                </button>
                {(() => {
                  const totalTips = tips.reduce((s, t) => s + (Number(t.amount) || 0), 0);
                  return totalTips > 0 ? (
                    <div style={{marginTop:10,padding:'8px 12px',background:'var(--cream)',borderRadius:8,fontSize:13,display:'flex',justifyContent:'space-between'}}>
                      <span style={{color:'var(--muted)'}}>Total tips</span>
                      <span style={{fontWeight:600,color:'var(--plum)'}}>{fmtRp(totalTips)}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </Card>

          <Card title="Home Service" sub="Opsional — komisi treatment sudah termasuk dalam biaya HS">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={isHomeService}
                onChange={e => {
                  const checked = e.target.checked;
                  setIsHomeService(checked);
                  // When HS toggled, adjust commission_override for percent-based treatments
                  setItems(prev => prev.map(it => {
                    const svc = getServiceDef(it.service_name);
                    if (svc?.commission_type === 'percent') {
                      return { ...it, commission_override: checked ? '0' : '' };
                    }
                    // For fixed_amount (Sulam Alis), don't touch — admin handles
                    return it;
                  }));
                }}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <span style={{fontSize:14}}>Ini transaksi home service</span>
            </label>
            {isHomeService && (
              <>
                <div style={{padding:'10px 12px',background:'#fdf6e3',borderRadius:6,fontSize:12,color:'var(--plum)',marginBottom:12,lineHeight:1.5}}>
                  💡 <strong>Mode Home Service aktif</strong> — komisi treatment otomatis di-set ke <strong>Rp 0</strong> karena sudah include di biaya HS. Admin/Owner bisa edit komisi treatment kalau perlu, dan input biaya HS manual sesuai jarak.
                </div>
                <Field label="Biaya Home Service (Rp)" hint="100% masuk komisi karyawan">
                  <input type="number" className="form-input" value={homeServiceFee}
                    onChange={e => setHomeServiceFee(e.target.value)} placeholder="50000" min="0" step="5000"/>
                </Field>
              </>
            )}
          </Card>

          <Card title="Catatan" sub="Opsional">
            <Field>
              <textarea className="form-textarea" rows="2" value={notes}
                onChange={e => setNotes(e.target.value)} placeholder="Catatan tambahan..."/>
            </Field>
          </Card>

          <Card>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:18}}>
              <Metric label="Total Omset" value={fmtRp(totalAmount)} sub={totalDiscount > 0 ? `setelah diskon ${fmtRp(totalDiscount)}` : `${items.length} treatment`}/>
              <Metric label="Komisi Treatment" value={fmtRp(totalCommission)} sub={isOT ? '⚠️ termasuk lembur' : ''}/>
              {isHomeService && (
                <Metric
                  label="Komisi Home Service"
                  value={fmtRp(Number(homeServiceFee) || 0)}
                  sub={distinctWorkers > 1
                    ? `dibagi ${distinctWorkers} karyawan · ${fmtRp(hsPerWorker)} per orang`
                    : '100% untuk karyawan'}
                />
              )}
              <Metric label="Total ke Karyawan" value={fmtRp(totalForEmployee)} sub="komisi total"/>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap'}}>
              <button type="button" className="btn btn-ghost" onClick={() => setPage('dashboard')} disabled={submitting}>Batal</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Simpan Transaksi'}
              </button>
            </div>
          </Card>
        </form>
      )}

      {/* Photo upload modal after save */}
      <PhotoGalleryModal
        open={showPhotoUploadAfter}
        transactionId={savedTransactionId}
        profile={profile}
        onClose={() => {
          setShowPhotoUploadAfter(false);
          setShowInvoicePrompt(true);
        }}
      />

      {/* Invoice prompt after save (before leaving page) */}
      {showInvoicePrompt && savedTransactionId && (
        <div style={{
          position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',
          zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',
          padding:20,backdropFilter:'blur(3px)',
        }} onClick={() => { setShowInvoicePrompt(false); setPage('transactions'); }}>
          <div style={{
            background:'var(--paper)',borderRadius:16,padding:'24px 22px',maxWidth:340,width:'100%',
            boxShadow:'0 12px 40px rgba(0,0,0,0.2)',textAlign:'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{fontSize:36,marginBottom:8}}>🧾</div>
            <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:22,fontWeight:600,color:'var(--plum-deep)',marginBottom:6}}>
              Transaksi Tersimpan
            </div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:18,lineHeight:1.5}}>
              Mau cetak / download invoice untuk klien sekarang? Bisa juga dilakukan nanti dari tab Transaksi.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button className="btn btn-primary" onClick={() => printInvoice(savedTransactionId)}>
                🧾 Cetak / Download Invoice
              </button>
              <button className="btn btn-ghost" onClick={() => { setShowInvoicePrompt(false); setPage('transactions'); }}>
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// TRANSACTIONS LIST PAGE
// =====================================================
function TransactionsPage({ profile, currentBranchId, branches, setPage }) {
  const [trxs, setTrxs] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [editingId, setEditingId] = useStateP(null);
  const [deleteTarget, setDeleteTarget] = useStateP(null);
  const [deleting, setDeleting] = useStateP(false);
  const [editedIds, setEditedIds] = useStateP(new Set());
  const [photoTargetId, setPhotoTargetId] = useStateP(null);

  // Filter states — default 3 bulan ke belakang
  const [filterPreset, setFilterPreset] = useStateP('3months');
  const [searchQuery, setSearchQuery] = useStateP('');
  const [customFrom, setCustomFrom] = useStateP('');
  const [customTo, setCustomTo] = useStateP('');
  const [paymentFilter, setPaymentFilter] = useStateP('all');  // 'all' or a payment_method value
  const [beauticianFilter, setBeauticianFilter] = useStateP('all');  // 'all' or employee_id
  const [treatmentFilter, setTreatmentFilter] = useStateP('all');  // 'all' or service_name

  const isSuper = profile.role === 'super_admin';
  const isBranchAdmin = profile.role === 'branch_admin';
  const canEdit = isSuper || isBranchAdmin;
  // Branch admin may delete transactions in their own branch (data is already
  // scoped to their branch); super admin may delete anywhere.
  const canDelete = isSuper || isBranchAdmin;

  // Compute date range based on filter preset
  function getDateRange() {
    const today = new Date();
    const ymd = d => d.toISOString().split('T')[0];

    switch (filterPreset) {
      case 'today':
        return { from: ymd(today), to: ymd(today) };
      case 'week': {
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        return { from: ymd(start), to: ymd(today) };
      }
      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from: ymd(start), to: ymd(end) };
      }
      case '3months': {
        const start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        return { from: ymd(start), to: ymd(today) };
      }
      case 'all': {
        // 2 years back as practical upper bound
        const start = new Date(today);
        start.setFullYear(today.getFullYear() - 2);
        return { from: ymd(start), to: ymd(today) };
      }
      case 'custom':
        return {
          from: customFrom || ymd(new Date(today.getFullYear(), today.getMonth(), 1)),
          to: customTo || ymd(today),
        };
      default:
        return { from: ymd(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())), to: ymd(today) };
    }
  }

  async function load() {
    setLoading(true);
    try {
      const filterBranch = isSuper ? currentBranchId : profile.branch_id;
      const { from, to } = getDateRange();
      const data = await listTransactionsByDateRange({
        branchId: filterBranch,
        from, to,
        searchQuery,
      });
      setTrxs(data);
      const ids = data.map(t => t.id);
      const edited = await getEditedTransactionIds(ids);
      setEditedIds(edited);
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => { load(); }, [currentBranchId, filterPreset, customFrom, customTo]);

  // Debounce search query
  useEffectP(() => {
    const t = setTimeout(() => { load(); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const scopeLabel = isSuper
    ? (currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang')
    : branches.find(b => b.id === profile.branch_id)?.name;

  // Build dropdown options from loaded transactions
  const beauticianOptions = useMemoP(() => {
    const map = new Map();
    for (const t of trxs) {
      for (const it of (t.items || [])) {
        if (it.employee_id && it.employee?.full_name && !map.has(it.employee_id)) {
          map.set(it.employee_id, it.employee.full_name);
        }
      }
    }
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [trxs]);

  const treatmentOptions = useMemoP(() => {
    const set = new Set();
    // Always include all master treatments (so e.g. Sulam Alis shows even if none yet this period)
    if (typeof SERVICES !== 'undefined' && Array.isArray(SERVICES)) {
      for (const s of SERVICES) if (s.name) set.add(s.name);
    }
    // Also include any service names found in transactions (covers old/custom names)
    for (const t of trxs) {
      for (const it of (t.items || [])) {
        if (it.service_name) set.add(it.service_name);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [trxs]);

  // Apply all client-side filters: payment method, beautician, treatment
  const displayedTrxs = useMemoP(() => {
    return trxs.filter(t => {
      // Payment filter
      if (paymentFilter !== 'all') {
        const mainMatch = (t.payment_method || 'cash') === paymentFilter;
        const payMatch = (t.payments || []).some(p => (p.payment_method || '') === paymentFilter);
        if (!mainMatch && !payMatch) return false;
      }
      // Beautician filter — any item done by this employee
      if (beauticianFilter !== 'all') {
        if (!(t.items || []).some(it => it.employee_id === beauticianFilter)) return false;
      }
      // Treatment filter — any item with this service
      if (treatmentFilter !== 'all') {
        if (!(t.items || []).some(it => it.service_name === treatmentFilter)) return false;
      }
      return true;
    });
  }, [trxs, paymentFilter, beauticianFilter, treatmentFilter]);

  const anyFilterActive = paymentFilter !== 'all' || beauticianFilter !== 'all' || treatmentFilter !== 'all';

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      toast(`Transaksi tanggal ${fmtDate(deleteTarget.date)} dihapus`, 'success');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast('Gagal hapus: ' + (err.message || err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <PageHeader title="Transaksi" sub={scopeLabel}>
        <button className="btn btn-primary" onClick={() => setPage('newTransaction')}>+ Input Transaksi</button>
      </PageHeader>

      <div style={{marginBottom:16,padding:'10px 14px',background:'var(--mauve-tint)',borderRadius:8,fontSize:12,color:'var(--plum)',lineHeight:1.5}}>
        💡 <strong>Tips:</strong> Klik <strong>Edit</strong> untuk mengubah transaksi, atau <strong>Hapus</strong> untuk menghapus (super_admin only). Semua perubahan tercatat di <strong>Audit Log</strong>.
      </div>

      {/* FILTER */}
      <Card title="Filter & Pencarian" sub="Pilih periode atau cari nama klien">
        <Field label="Periode">
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {[
              { value: 'today', label: 'Hari Ini' },
              { value: 'week', label: '7 Hari' },
              { value: 'month', label: 'Bulan Ini' },
              { value: '3months', label: '3 Bulan' },
              { value: 'all', label: 'Semua (2 thn)' },
              { value: 'custom', label: '📅 Custom' },
            ].map(p => (
              <button key={p.value} type="button"
                className={'btn btn-sm ' + (filterPreset === p.value ? 'btn-primary' : 'btn-ghost')}
                onClick={() => setFilterPreset(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        {filterPreset === 'custom' && (
          <div className="form-row">
            <Field label="Dari Tanggal">
              <input type="date" className="form-input" value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}/>
            </Field>
            <Field label="Sampai Tanggal">
              <input type="date" className="form-input" value={customTo}
                onChange={e => setCustomTo(e.target.value)}/>
            </Field>
          </div>
        )}

        <Field label="🔍 Cari Klien" hint="Cari berdasarkan nama atau nomor HP">
          <input type="text" className="form-input" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Ketik nama klien atau no HP..."/>
        </Field>

        <Field label="💳 Filter Pembayaran" hint="Lihat transaksi berdasarkan metode pembayaran">
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            <button type="button"
              className={'btn btn-sm ' + (paymentFilter === 'all' ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setPaymentFilter('all')}>
              Semua
            </button>
            {PAYMENT_METHODS.map(pm => (
              <button type="button" key={pm.value}
                className={'btn btn-sm ' + (paymentFilter === pm.value ? 'btn-primary' : 'btn-ghost')}
                onClick={() => setPaymentFilter(pm.value)}>
                {pm.icon} {pm.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="form-row">
          <Field label="💇 Filter Beautician" hint="Transaksi yang dikerjakan beautician tertentu">
            <select className="form-select" value={beauticianFilter} onChange={e => setBeauticianFilter(e.target.value)}>
              <option value="all">— Semua Beautician —</option>
              {beauticianOptions.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label="✨ Filter Treatment" hint="Transaksi dengan treatment tertentu">
            <select className="form-select" value={treatmentFilter} onChange={e => setTreatmentFilter(e.target.value)}>
              <option value="all">— Semua Treatment —</option>
              {treatmentOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        {anyFilterActive && (
          <button type="button" className="btn btn-ghost btn-sm" style={{marginBottom:8}}
            onClick={() => { setPaymentFilter('all'); setBeauticianFilter('all'); setTreatmentFilter('all'); }}>
            ✕ Reset semua filter
          </button>
        )}

        <div style={{padding:'8px 12px',background:'var(--cream)',borderRadius:8,fontSize:12,color:'var(--muted)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <span>
            {(() => {
              const { from, to } = getDateRange();
              return `📅 ${fmtDate(from)} — ${fmtDate(to)}`;
            })()}
          </span>
          <span style={{color:'var(--plum)',fontWeight:500}}>
            {displayedTrxs.length}{anyFilterActive ? ` dari ${trxs.length}` : ''} transaksi
          </span>
        </div>
      </Card>

      <Card>
        {loading ? <Loader text="Memuat..."/> :
         !displayedTrxs.length ? <Empty title="Belum ada transaksi" sub={anyFilterActive ? 'Tidak ada transaksi yang cocok dengan filter ini di periode terpilih.' : 'Belum ada transaksi di periode ini, atau hasil pencarian kosong.'}/> : (
          <>
          {/* MOBILE CARD LAYOUT */}
          <div className="table-mobile-cards">
            {displayedTrxs.map(t => {
              const wasEdited = editedIds.has(t.id);
              return (
                <div key={t.id} className="row-card">
                  <div className="row-header">
                    <div>
                      <div style={{fontWeight:500,fontSize:14,color:'var(--plum-deep)'}}>
                        {t.client_name_snapshot || '—'}
                      </div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>
                        {fmtDate(t.date)} · <span style={{fontFamily:'JetBrains Mono, monospace'}}>{fmtTime(t.start_time)}</span>
                      </div>
                      {t.client_phone_snapshot && (
                        <div style={{fontSize:11,color:'var(--muted)',fontFamily:'JetBrains Mono, monospace'}}>
                          {t.client_phone_snapshot}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
                      {/* Show all payments (DP + Sisa or single) */}
                      {(t.payments && t.payments.length > 0) ? (
                        t.payments
                          .slice()
                          .sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0))
                          .map((p, pi) => (
                            <span key={pi} className="badge" style={{
                              fontSize:9,
                              background: p.is_dp ? '#fdf6e3' : 'var(--mauve-tint)',
                              color: p.is_dp ? '#b8893d' : 'var(--plum)',
                            }}>
                              {p.is_dp && '💰 DP '}
                              {getPaymentMethodIcon(p.payment_method)} {getPaymentMethodLabel(p.payment_method).replace('Transfer ', '')} {fmtRp(p.amount)}
                            </span>
                          ))
                      ) : t.payment_method && (
                        <span className="badge" style={{fontSize:9,background:'var(--mauve-tint)',color:'var(--plum)'}}>
                          {getPaymentMethodIcon(t.payment_method)} {getPaymentMethodLabel(t.payment_method).replace('Transfer ', '')}
                        </span>
                      )}
                      {t.is_overtime && <span className="badge badge-amber" style={{fontSize:9}}>lembur</span>}
                      {t.is_home_service && <span className="badge badge-gold" style={{fontSize:9}}>HS</span>}
                      {wasEdited && <span className="badge" style={{background:'#fdf6e3',color:'#b8893d',fontSize:9}}>edited</span>}
                    </div>
                  </div>

                  {isSuper && !currentBranchId && (
                    <div className="row-detail">
                      <span className="row-detail-label">Cabang</span>
                      <span><span className="badge badge-mauve" style={{fontSize:10}}>{t.branch?.name}</span></span>
                    </div>
                  )}

                  <div>
                    <div className="row-detail-label" style={{marginBottom:4}}>Treatment</div>
                    {(t.items || []).map((it, i) => {
                      const sharePercent = Number(it.share_percent || 100);
                      const isShared = it.share_group_id && sharePercent < 100;
                      return (
                        <div key={i} style={{fontSize:12,marginBottom:3,paddingLeft:8,borderLeft:'2px solid var(--mauve-tint)'}}>
                          <div style={{color:'var(--plum)',fontWeight:500}}>
                            {it.service_name}
                            {isShared && <span className="badge" style={{fontSize:8,background:'var(--mauve-tint)',color:'var(--mauve)',marginLeft:4}}>shared {sharePercent}%</span>}
                          </div>
                          <div style={{color:'var(--muted)',fontSize:11}}>
                            oleh {it.employee?.full_name || '—'}
                            {isShared && <span> · {fmtRp(it.price)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="row-detail">
                    <span className="row-detail-label">Omset</span>
                    <span style={{fontWeight:500}}>{fmtRp(t.total_amount)}</span>
                  </div>
                  <div className="row-detail">
                    <span className="row-detail-label">Komisi</span>
                    <span style={{color:'var(--mauve)',fontWeight:500}}>{fmtRp(t.total_commission)}</span>
                  </div>
                  {(t.tips || []).length > 0 && (() => {
                    const tipTotal = (t.tips || []).reduce((s, tp) => s + Number(tp.amount || 0), 0);
                    return (
                      <div className="row-detail">
                        <span className="row-detail-label">Tips 💝</span>
                        <span style={{color:'var(--plum)',fontWeight:500}}>+{fmtRp(tipTotal)}</span>
                      </div>
                    );
                  })()}
                  {(t.items || []).some(i => i.has_complaint) && (
                    <div className="row-detail">
                      <span className="row-detail-label">Komplain</span>
                      <span style={{color:'var(--red)',fontWeight:500,fontSize:12}}>
                        ⚠️ {(t.items || []).filter(i => i.has_complaint).length} treatment, komisi Rp 0
                      </span>
                    </div>
                  )}

                  <div className="row-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => printInvoice(t.id)}
                    >
                      🧾 Invoice
                    </button>
                    {canEdit && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPhotoTargetId(t.id)}
                        >
                          📸 Foto
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingId(t.id)}
                        >
                          ✏️ Edit
                        </button>
                        {canDelete && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteTarget(t)}
                            style={{color:'var(--red)'}}
                          >
                            🗑 Hapus
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE LAYOUT */}
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Jam</th>
                  {isSuper && !currentBranchId && <th>Cabang</th>}
                  <th>Pelanggan</th><th>Treatment</th>
                  <th className="table-numeric">Total Omset</th>
                  <th className="table-numeric">Komisi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayedTrxs.map(t => {
                  const wasEdited = editedIds.has(t.id);
                  return (
                  <tr key={t.id}>
                    <td style={{fontSize:13}}>
                      {fmtDate(t.date)}
                      {wasEdited && (
                        <div>
                          <span className="badge" style={{background:'#fdf6e3',color:'#b8893d',fontSize:9,marginTop:3,display:'inline-block'}} title="Transaksi ini pernah di-edit. Cek Audit Log untuk riwayat.">
                            edited
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12}}>{fmtTime(t.start_time)}</span>
                      {t.is_overtime && <span className="badge badge-amber" style={{marginLeft:6,fontSize:10}}>lembur</span>}
                      {t.is_home_service && <span className="badge badge-gold" style={{marginLeft:6,fontSize:10}}>HS</span>}
                      {(t.payments && t.payments.length > 0) ? (
                        <div style={{marginTop:4,display:'flex',flexDirection:'column',gap:3}}>
                          {t.payments
                            .slice()
                            .sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0))
                            .map((p, pi) => (
                              <span key={pi} className="badge" style={{
                                fontSize:9,
                                background: p.is_dp ? '#fdf6e3' : 'var(--mauve-tint)',
                                color: p.is_dp ? '#b8893d' : 'var(--plum)',
                              }}>
                                {p.is_dp && '💰 DP '}
                                {getPaymentMethodIcon(p.payment_method)} {getPaymentMethodLabel(p.payment_method).replace('Transfer ', '')} {fmtRp(p.amount)}
                              </span>
                            ))}
                        </div>
                      ) : t.payment_method && (
                        <div style={{marginTop:4}}>
                          <span className="badge" style={{fontSize:9,background:'var(--mauve-tint)',color:'var(--plum)'}}>
                            {getPaymentMethodIcon(t.payment_method)} {getPaymentMethodLabel(t.payment_method).replace('Transfer ', '')}
                          </span>
                        </div>
                      )}
                    </td>
                    {isSuper && !currentBranchId && <td><span className="badge badge-mauve" style={{fontSize:10}}>{t.branch?.name}</span></td>}
                    <td>
                      <div style={{fontWeight:500,fontSize:13}}>{t.client_name_snapshot || '—'}</div>
                      {t.client_phone_snapshot && <div style={{fontSize:11,color:'var(--muted)',fontFamily:'JetBrains Mono, monospace'}}>{t.client_phone_snapshot}</div>}
                    </td>
                    <td>
                      {(t.items || []).map((it, i) => {
                        const sharePercent = Number(it.share_percent || 100);
                        const isShared = it.share_group_id && sharePercent < 100;
                        return (
                          <div key={i} style={{fontSize:12,marginBottom:2}}>
                            <span style={{color:'var(--plum)',fontWeight:500}}>{it.service_name}</span>
                            <span style={{color:'var(--muted)'}}> • {it.employee?.full_name || '—'}</span>
                            {isShared && <span className="badge" style={{fontSize:9,background:'var(--mauve-tint)',color:'var(--mauve)',marginLeft:4}}>{sharePercent}%</span>}
                          </div>
                        );
                      })}
                    </td>
                    <td className="table-numeric" style={{fontWeight:500}}>{fmtRp(t.total_amount)}</td>
                    <td className="table-numeric" style={{color:'var(--mauve)',fontWeight:500}}>
                      {fmtRp(t.total_commission)}
                      {(t.tips || []).length > 0 && (
                        <div style={{fontSize:11,color:'var(--plum)',fontWeight:500,marginTop:2}}>
                          +{fmtRp((t.tips || []).reduce((s, tp) => s + Number(tp.amount || 0), 0))} tips 💝
                        </div>
                      )}
                      {(t.items || []).some(i => i.has_complaint) && (
                        <div style={{fontSize:11,color:'var(--red)',fontWeight:500,marginTop:2}}>
                          ⚠️ komplain ({(t.items || []).filter(i => i.has_complaint).length})
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => printInvoice(t.id)}
                          title="Cetak / download invoice"
                        >
                          🧾 Invoice
                        </button>
                        {canEdit && (
                          <>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setPhotoTargetId(t.id)}
                              title="Lihat & kelola foto treatment"
                            >
                              📸 Foto
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingId(t.id)}
                              title="Edit transaksi"
                            >
                              ✏️ Edit
                            </button>
                            {canDelete && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDeleteTarget(t)}
                                title="Hapus transaksi (super_admin only)"
                                style={{color:'var(--red)'}}
                              >
                                🗑 Hapus
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>

      {/* Edit Modal */}
      <EditTransactionModal
        open={!!editingId}
        transactionId={editingId}
        profile={profile}
        branches={branches}
        onClose={() => setEditingId(null)}
        onSuccess={() => { setEditingId(null); load(); }}
      />

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        open={!!photoTargetId}
        transactionId={photoTargetId}
        profile={profile}
        onClose={() => setPhotoTargetId(null)}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div style={{
          position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',
          display:'flex',alignItems:'center',justifyContent:'center',
          zIndex:1000,padding:20,backdropFilter:'blur(4px)',
        }} onClick={() => !deleting && setDeleteTarget(null)}>
          <div style={{
            background:'var(--paper)',borderRadius:20,padding:32,
            width:'100%',maxWidth:520,boxShadow:'var(--shadow-lg)',
          }} onClick={e => e.stopPropagation()}>
            <div className="eyebrow" style={{color:'var(--red)',marginBottom:6}}>⚠️ Hapus Transaksi</div>
            <h2 style={{fontFamily:'Cormorant Garamond, serif',fontSize:26,fontWeight:400,color:'var(--plum-deep)',marginBottom:14}}>
              Yakin hapus transaksi ini?
            </h2>

            <div style={{padding:14,background:'var(--cream)',borderRadius:8,marginBottom:14,fontSize:13,lineHeight:1.6}}>
              <div><strong>Tanggal:</strong> {fmtDate(deleteTarget.date)} · {fmtTime(deleteTarget.start_time)}</div>
              <div><strong>Pelanggan:</strong> {deleteTarget.client_name_snapshot || '—'}</div>
              <div><strong>Cabang:</strong> {deleteTarget.branch?.name || '—'}</div>
              <div><strong>Total Omset:</strong> <span style={{color:'var(--mauve)',fontWeight:500}}>{fmtRp(deleteTarget.total_amount)}</span></div>
              <div><strong>Komisi:</strong> {fmtRp(deleteTarget.total_commission)}</div>
              {(deleteTarget.items || []).length > 0 && (
                <div style={{marginTop:8}}>
                  <strong>Treatment:</strong>
                  <ul style={{margin:'4px 0 0 18px',padding:0}}>
                    {deleteTarget.items.map((it, i) => (
                      <li key={i} style={{fontSize:12}}>{it.service_name} ({it.employee?.full_name || '—'})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{padding:'10px 12px',background:'#fdf0f0',borderRadius:6,fontSize:12,color:'var(--red)',marginBottom:18,lineHeight:1.5}}>
              ⚠️ Aksi ini <strong>tidak bisa di-undo</strong>. Tapi data lengkap akan tercatat di Audit Log dan bisa dilihat kembali jika perlu.
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap'}}>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Batal</button>
              <button
                className="btn btn-primary"
                onClick={handleDelete}
                disabled={deleting}
                style={{background:'var(--red)'}}
              >
                {deleting ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : '🗑 Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// EDIT TRANSACTION MODAL
// =====================================================
function EditTransactionModal({ open, transactionId, profile, branches, onClose, onSuccess }) {
  const [loading, setLoading] = useStateP(true);
  const [submitting, setSubmitting] = useStateP(false);
  const [trx, setTrx] = useStateP(null);
  const [employees, setEmployees] = useStateP([]);

  // Form state
  const [date, setDate] = useStateP('');
  const [startTime, setStartTime] = useStateP('');
  const [clientName, setClientName] = useStateP('');
  const [clientPhone, setClientPhone] = useStateP('');
  const [isHomeService, setIsHomeService] = useStateP(false);
  const [homeServiceFee, setHomeServiceFee] = useStateP(0);
  const [notes, setNotes] = useStateP('');
  const [items, setItems] = useStateP([]);

  // Tahap F & G states
  const [paymentMethod, setPaymentMethod] = useStateP('cash');
  const [hasDp, setHasDp] = useStateP(false);
  const [dpAmount, setDpAmount] = useStateP('');
  const [dpMethod, setDpMethod] = useStateP('qris');
  const [dpDate, setDpDate] = useStateP('');

  // Tips states (edit support)
  const [hasTips, setHasTips] = useStateP(false);
  const [tips, setTips] = useStateP([{ employee_id: '', amount: '', payment_method: 'qris' }]);

  const isOT = useMemoP(() => isOvertime(startTime), [startTime]);

  useEffectP(() => {
    if (!open || !transactionId) return;
    loadTransaction();
  }, [open, transactionId]);

  async function loadTransaction() {
    setLoading(true);
    try {
      const data = await getTransactionDetail(transactionId);
      setTrx(data);
      setDate(data.date);
      setStartTime(data.start_time?.slice(0, 5) || '');
      setClientName(data.client_name_snapshot || '');
      setClientPhone(data.client_phone_snapshot || '');
      setIsHomeService(!!data.is_home_service);
      setHomeServiceFee(Number(data.home_service_fee) || 0);
      setNotes(data.notes || '');

      // Reconstruct items: group by share_group_id to recombine "shared treatments" into single rows
      const rawItems = data.items || [];
      const groupedItems = [];
      const seenGroups = new Set();

      for (const it of rawItems) {
        if (it.share_group_id) {
          if (seenGroups.has(it.share_group_id)) continue;
          seenGroups.add(it.share_group_id);

          // Find all siblings with same share_group_id
          const siblings = rawItems.filter(x => x.share_group_id === it.share_group_id);
          // First sibling is "main", rest are "share_with"
          const mainItem = siblings[0];
          const sharedItems = siblings.slice(1);

          // Sum prices to reconstruct original treatment price
          const totalPrice = siblings.reduce((s, x) => s + Number(x.price || 0), 0);

          groupedItems.push({
            employee_id: mainItem.employee_id,
            service_name: mainItem.service_name,
            price: String(totalPrice),
            fixed_commission: mainItem.commission_type === 'fixed_amount'
              ? String(siblings.reduce((s, x) => s + Number(x.commission_amount || 0), 0))
              : '',
            commission_override: data.is_home_service && mainItem.commission_type === 'percent'
              ? String(siblings.reduce((s, x) => s + Number(x.commission_amount || 0), 0))
              : '',
            notes: mainItem.notes || '',
            share_with: sharedItems.map(s => s.employee_id),
            share_percents: siblings.map(s => Number(s.share_percent || 0)),
            _existing_share_group_id: it.share_group_id, // preserve for re-save
            has_complaint: !!mainItem.has_complaint,
            complaint_note: mainItem.complaint_note || '',
          });
        } else {
          // Solo item (no sharing)
          groupedItems.push({
            employee_id: it.employee_id,
            service_name: it.service_name,
            price: String(it.price),
            fixed_commission: it.commission_type === 'fixed_amount' ? String(it.commission_amount) : '',
            commission_override: data.is_home_service && it.commission_type === 'percent' ? String(it.commission_amount) : '',
            notes: it.notes || '',
            share_with: [],
            share_percents: [100],
            has_complaint: !!it.has_complaint,
            complaint_note: it.complaint_note || '',
          });
        }
      }
      setItems(groupedItems);

      // Load payment info (Tahap G)
      const payments = data.payments || [];
      const dpPayment = payments.find(p => p.is_dp);
      const sisaPayment = payments.find(p => !p.is_dp);

      if (dpPayment) {
        // Has DP
        setHasDp(true);
        setDpAmount(String(dpPayment.amount));
        setDpMethod(dpPayment.payment_method || 'qris');
        setDpDate(dpPayment.paid_at || data.date);
        setPaymentMethod(sisaPayment?.payment_method || data.payment_method || 'cash');
      } else {
        // No DP - single payment
        setHasDp(false);
        setDpAmount('');
        setDpMethod('qris');
        setDpDate(data.date);
        setPaymentMethod(sisaPayment?.payment_method || data.payment_method || 'cash');
      }

      // Load tips (edit support)
      const existingTips = data.tips || [];
      if (existingTips.length > 0) {
        setHasTips(true);
        setTips(existingTips.map(t => ({
          employee_id: t.employee_id || '',
          amount: String(t.amount || ''),
          payment_method: t.payment_method || 'qris',
        })));
      } else {
        setHasTips(false);
        setTips([{ employee_id: '', amount: '', payment_method: 'qris' }]);
      }

      // Load employees for that branch
      const emps = await listEmployees(data.branch_id, false);
      setEmployees(emps);
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function addItem() {
    setItems(prev => [...prev, {
      employee_id: '',
      service_name: '',
      price: '',
      fixed_commission: '',
      commission_override: isHomeService ? '0' : '',
      notes: '',
      share_with: [],
      share_percents: [100],
    }]);
  }

  function getItemCommission(item) {
    if (!item.service_name) return { rate: 0, amount: 0, type: 'percent' };
    // Client complaint: commission forfeited for this treatment (omset unaffected)
    if (item.has_complaint) {
      return { rate: 0, amount: 0, type: 'percent' };
    }
    const svc = getServiceDef(item.service_name);
    if (svc?.commission_type === 'percent' && item.commission_override !== undefined && item.commission_override !== null && item.commission_override !== '') {
      return {
        rate: 0,
        amount: Number(item.commission_override) || 0,
        type: 'percent_manual',
      };
    }
    return calcCommission({
      serviceName: item.service_name,
      price: Number(item.price) || 0,
      fixedAmount: Number(item.fixed_commission) || 0,
      isOT,
      branchId: trx?.branch_id,
    });
  }

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + getItemCommission(it).amount, 0);
  const totalForEmployee = totalCommission + (isHomeService ? (Number(homeServiceFee) || 0) : 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!clientName.trim()) {
      toast('Nama pelanggan wajib diisi', 'error');
      return;
    }
    if (!items.length) {
      toast('Minimal 1 treatment', 'error');
      return;
    }
    // Validate items including share
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.employee_id) { toast(`Karyawan wajib dipilih untuk treatment #${i+1}`, 'error'); return; }
      if (!it.service_name) { toast(`Treatment #${i+1} wajib dipilih`, 'error'); return; }
      if (!it.price || Number(it.price) <= 0) { toast(`Harga treatment #${i+1} wajib diisi`, 'error'); return; }
      const svc = getServiceDef(it.service_name);
      if (svc?.commission_type === 'fixed_amount' && (!it.fixed_commission || Number(it.fixed_commission) <= 0)) {
        toast('Komisi sulam alis wajib diisi (> 0)', 'error');
        return;
      }
      // Share validation
      const allEmps = [it.employee_id, ...(it.share_with || [])];
      if (new Set(allEmps).size !== allEmps.length) {
        toast(`Treatment #${i+1}: karyawan tidak boleh sama`, 'error'); return;
      }
      if (allEmps.some(e => !e)) {
        toast(`Treatment #${i+1}: semua karyawan harus dipilih`, 'error'); return;
      }
      if (allEmps.length > 1) {
        const total = (it.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
        if (Math.abs(total - 100) > 0.01) {
          toast(`Treatment #${i+1}: total persentase harus 100% (sekarang ${total}%)`, 'error'); return;
        }
      }
    }

    setSubmitting(true);
    try {
      // Expand items with share logic (same as new transaction)
      const itemsPayload = [];
      for (const it of items) {
        const allEmps = [it.employee_id, ...(it.share_with || [])];
        const isShared = allEmps.length > 1;
        const totalPrice = Number(it.price);
        const com = getItemCommission(it);
        const svc = getServiceDef(it.service_name);
        const dbCommissionType = com.type === 'percent_manual' ? 'percent' : com.type;

        // Reuse existing share_group_id if available (for audit consistency), else generate new
        const shareGroupId = isShared
          ? (it._existing_share_group_id ||
             (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c==='x' ? r : (r&0x3|0x8)).toString(16); })))
          : null;

        allEmps.forEach((empId, idx) => {
          const sharePercent = isShared ? Number(it.share_percents[idx] || 0) : 100;
          const splitPrice = Math.round(totalPrice * sharePercent / 100);

          let splitCommissionAmount;
          if (isShared) {
            if (com.type === 'fixed_amount') {
              splitCommissionAmount = Math.round(com.amount * sharePercent / 100);
            } else {
              splitCommissionAmount = Math.round(splitPrice * com.rate / 100);
            }
          } else {
            splitCommissionAmount = com.amount;
          }

          itemsPayload.push({
            employee_id: empId,
            service_name: it.service_name,
            service_category: svc?.category || 'other',
            price: splitPrice,
            commission_type: dbCommissionType,
            commission_rate: com.rate,
            commission_amount: splitCommissionAmount,
            notes: it.notes || null,
            share_group_id: shareGroupId,
            share_percent: sharePercent,
            has_complaint: !!it.has_complaint,
            complaint_note: it.has_complaint ? (it.complaint_note || null) : null,
          });
        });
      }

      // Validate payments
      const grandTotal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
        + (isHomeService ? (Number(homeServiceFee) || 0) : 0);

      let paymentsArr;
      if (hasDp) {
        const dp = Number(dpAmount) || 0;
        const sisa = grandTotal - dp;
        if (dp <= 0) { toast('Jumlah DP wajib diisi (> 0)', 'error'); setSubmitting(false); return; }
        if (dp >= grandTotal) { toast('DP tidak boleh ≥ total transaksi', 'error'); setSubmitting(false); return; }
        if (!dpDate) { toast('Tanggal DP wajib diisi', 'error'); setSubmitting(false); return; }
        paymentsArr = [
          { method: dpMethod, amount: dp, is_dp: true, paid_at: dpDate },
          { method: paymentMethod, amount: sisa, is_dp: false, paid_at: date },
        ];
      } else {
        paymentsArr = [
          { method: paymentMethod, amount: grandTotal, is_dp: false, paid_at: date },
        ];
      }

      // Update transaction (will use direct ops since paymentMethod is set)
      await updateTransactionFull({
        transactionId,
        date,
        startTime,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        isOvertime: isOT,
        isHomeService,
        homeServiceFee: Number(homeServiceFee) || 0,
        notes,
        items: itemsPayload,
        paymentMethod,
      });

      // Replace payments (always run, to capture DP changes)
      await replaceTransactionPayments(transactionId, trx.branch_id, paymentsArr, profile.id);

      // Replace tips (edit support) — validate, then replace all tips for this transaction
      let tipsArr = [];
      if (hasTips) {
        for (const t of tips) {
          if ((t.employee_id && (!t.amount || Number(t.amount) <= 0)) ||
              (!t.employee_id && Number(t.amount) > 0)) {
            toast('Tips: pastikan setiap baris ada beautician DAN jumlah > 0', 'error');
            setSubmitting(false); return;
          }
        }
        tipsArr = tips
          .filter(t => t.employee_id && Number(t.amount) > 0)
          .map(t => ({
            employee_id: t.employee_id,
            amount: Number(t.amount),
            payment_method: t.payment_method || 'qris',
          }));
      }
      // Always replace (empties out tips if user unchecked / removed them)
      await replaceTransactionTips(transactionId, trx.branch_id, tipsArr, profile.id);

      toast('Transaksi berhasil diupdate ✓', 'success');
      onSuccess();
    } catch (err) {
      toast('Gagal update: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:20,backdropFilter:'blur(4px)',
    }} onClick={() => !submitting && onClose()}>
      <div style={{
        background:'var(--paper)',borderRadius:20,padding:28,
        width:'100%',maxWidth:920,maxHeight:'92vh',overflowY:'auto',
        boxShadow:'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
          <div>
            <div className="eyebrow" style={{marginBottom:6}}>Edit Transaksi</div>
            <h2 style={{fontFamily:'Cormorant Garamond, serif',fontSize:26,fontWeight:400,color:'var(--plum-deep)'}}>
              Ubah Data Transaksi
            </h2>
            {trx && <p style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Cabang: {trx.branch?.name || '—'} · ID: {trx.id?.slice(0, 8)}…</p>}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" disabled={submitting}>✕</button>
        </div>

        <div style={{padding:'10px 12px',background:'var(--mauve-tint)',borderRadius:8,fontSize:12,color:'var(--plum)',marginBottom:18,lineHeight:1.5}}>
          💡 Semua perubahan akan tercatat di <strong>Audit Log</strong> dengan timestamp dan before/after lengkap.
        </div>

        {loading ? <Loader text="Memuat data..."/> : (
        <form onSubmit={handleSubmit}>
          {/* INFO DASAR */}
          <Card title="Info Dasar">
            <div className="form-row">
              <Field label="Tanggal *">
                <input type="date" className="form-input" value={date}
                  onChange={e => setDate(e.target.value)} required/>
              </Field>
              <Field label="Jam Mulai *" hint={isOT ? '⚠️ Lembur (≥18:00)' : ''}>
                <input type="time" className="form-input" value={startTime}
                  onChange={e => setStartTime(e.target.value)} required/>
              </Field>
            </div>
            <div className="form-row">
              <Field label="Nama Pelanggan *">
                <input type="text" className="form-input" value={clientName}
                  onChange={e => setClientName(e.target.value)} required/>
              </Field>
              <Field label="No HP Pelanggan">
                <input type="tel" className="form-input" value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)} placeholder="08xxx"/>
              </Field>
            </div>
          </Card>

          {/* TREATMENT ITEMS */}
          <Card title="Treatment" sub={`${items.length} treatment · Total komisi: ${fmtRp(totalCommission)}`}>
            {items.map((item, idx) => {
              const svc = getServiceDef(item.service_name);
              const isFixedComm = svc?.commission_type === 'fixed_amount';
              const com = getItemCommission(item);

              return (
                <div key={idx} style={{padding:14,background:'var(--cream)',borderRadius:8,marginBottom:10,position:'relative'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span className="eyebrow" style={{fontSize:9}}>Treatment {idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm"
                        onClick={() => removeItem(idx)}
                        style={{color:'var(--red)',fontSize:11}}>✕ Hapus</button>
                    )}
                  </div>

                  <div className="form-row">
                    <Field label="Karyawan *">
                      <select className="form-select" value={item.employee_id}
                        onChange={e => updateItem(idx, { employee_id: e.target.value })} required>
                        <option value="">— Pilih —</option>
                        {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.full_name} ({e.job_title})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Treatment *">
                      <select className="form-select" value={item.service_name}
                        onChange={e => {
                          const newSvcName = e.target.value;
                          const newSvc = getServiceDef(newSvcName);
                          const patch = {
                            service_name: newSvcName,
                            fixed_commission: '',
                          };
                          if (isHomeService && newSvc?.commission_type === 'percent') {
                            patch.commission_override = '0';
                          } else {
                            patch.commission_override = '';
                          }
                          updateItem(idx, patch);
                        }} required>
                        <option value="">— Pilih —</option>
                        {SERVICES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </Field>
                  </div>

                  <div className="form-row">
                    <Field label="Harga (Rp) *">
                      <input type="number" className="form-input" value={item.price}
                        onChange={e => updateItem(idx, { price: e.target.value })}
                        placeholder="200000" min="0" step="1000" required/>
                    </Field>
                    {isFixedComm ? (
                      <Field label="Komisi Karyawan (Rp) *" hint="Input manual">
                        <input type="number" className="form-input" value={item.fixed_commission}
                          onChange={e => updateItem(idx, { fixed_commission: e.target.value })}
                          placeholder="50000" min="0" step="1000" required/>
                      </Field>
                    ) : item.service_name && isHomeService ? (
                      <Field label="Komisi Treatment (Rp)" hint="Default Rp 0 (HS mode)">
                        <input type="number" className="form-input"
                          value={item.commission_override ?? '0'}
                          onChange={e => updateItem(idx, { commission_override: e.target.value })}
                          min="0" step="1000" placeholder="0"
                          style={{borderColor:'var(--amber)',background:'#fdf6e3'}}/>
                      </Field>
                    ) : item.service_name ? (
                      <Field label="Komisi Otomatis" hint={`${com.rate}% dari harga`}>
                        <input type="text" className="form-input" value={fmtRp(com.amount)} disabled
                          style={{background:'var(--mauve-tint)',color:'var(--plum)',fontWeight:500}}/>
                      </Field>
                    ) : (
                      <Field label="Komisi">
                        <input type="text" className="form-input" value="—" disabled/>
                      </Field>
                    )}
                  </div>

                  {/* Komplain client — komisi tidak dihitung */}
                  {item.service_name && (
                    <div style={{marginTop:10,padding:'10px 12px',background:item.has_complaint?'#fdf2f2':'var(--cream)',borderRadius:8,border:item.has_complaint?'1px solid var(--red)':'1px solid transparent'}}>
                      <label style={{display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer'}}>
                        <input type="checkbox" checked={!!item.has_complaint}
                          onChange={e => updateItem(idx, { has_complaint: e.target.checked, complaint_note: e.target.checked ? (item.complaint_note || '') : '' })}
                          style={{accentColor:'var(--red)',width:17,height:17,marginTop:1}}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:500,color:item.has_complaint?'var(--red)':'var(--plum)'}}>
                            Client mengajukan komplain (komisi tidak dihitung)
                          </div>
                          <div style={{fontSize:11,color:'var(--muted)'}}>
                            Omset tetap penuh. Hanya komisi beautician untuk treatment ini yang jadi Rp 0.
                          </div>
                        </div>
                      </label>
                      {item.has_complaint && (
                        <div style={{marginTop:10}}>
                          <Field label="Catatan komplain (opsional, internal)">
                            <textarea className="form-textarea" rows="2" value={item.complaint_note || ''}
                              onChange={e => updateItem(idx, { complaint_note: e.target.value })}
                              placeholder="Contoh: bentuk alis tidak simetris, client minta perbaikan"/>
                          </Field>
                        </div>
                      )}
                    </div>
                  )}

                  {svc && (
                    <div style={{marginTop:8,padding:'8px 12px',background:'var(--paper)',borderRadius:6,fontSize:12,color:'var(--muted)',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:6}}>
                      <span>
                        <strong>Kategori:</strong> {svc.category} ·
                        <strong> Tipe komisi:</strong>{' '}
                        {svc.commission_type === 'percent'
                          ? (isHomeService ? 'Manual (HS mode)' : `${svc.baseRate}% (base)`)
                          : 'Manual Rp'}
                        {isOT && !isHomeService && ' · ⚠️ Lembur'}
                        {isHomeService && ' · 🏠 HS'}
                      </span>
                      <span style={{fontWeight:500,color:'var(--plum)'}}>Komisi: {fmtRp(com.amount)}</span>
                    </div>
                  )}

                  {/* Multi-employee sharing */}
                  <div style={{marginTop:12,paddingTop:12,borderTop:'1px dashed var(--line)'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,gap:8,flexWrap:'wrap'}}>
                      <span className="eyebrow" style={{fontSize:10}}>
                        👥 Kerjasama: {(item.share_with?.length || 0) + 1} karyawan
                      </span>
                      <button type="button" className="btn btn-ghost btn-sm"
                        onClick={() => {
                          const currentShareWith = item.share_with || [];
                          const newShareWith = [...currentShareWith, ''];
                          const newCount = newShareWith.length + 1;
                          const eqPercent = Math.floor(100 / newCount * 100) / 100;
                          const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
                          const newPercents = Array(newCount).fill(eqPercent);
                          newPercents[newCount - 1] = remainder;
                          updateItem(idx, { share_with: newShareWith, share_percents: newPercents });
                        }}
                        style={{padding:'4px 10px',fontSize:11}}>
                        + Tambah Karyawan
                      </button>
                    </div>

                    {(item.share_with?.length || 0) > 0 && (
                      <div style={{padding:12,background:'#fef9f2',borderRadius:8,border:'1px solid #f0e0c0'}}>
                        <div style={{fontSize:11,color:'var(--muted)',marginBottom:10,lineHeight:1.5}}>
                          💡 <strong>Treatment dikerjakan bersama.</strong> Harga & komisi akan dibagi sesuai persentase. Total harus = 100%.
                        </div>

                        {/* Main employee row */}
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:8,background:'var(--paper)',borderRadius:6}}>
                          <div style={{flex:1,fontSize:13,fontWeight:500,color:'var(--plum)'}}>
                            👤 {employees.find(e => e.id === item.employee_id)?.full_name || '(belum pilih)'}
                            <div style={{fontSize:10,color:'var(--muted)'}}>Karyawan utama</div>
                          </div>
                          <input type="number" className="form-input"
                            value={item.share_percents?.[0] || 0}
                            onChange={e => {
                              const newPercents = [...(item.share_percents || [])];
                              newPercents[0] = Number(e.target.value);
                              updateItem(idx, { share_percents: newPercents });
                            }}
                            min="1" max="100" step="0.01"
                            style={{width:80,textAlign:'center'}}/>
                          <span style={{fontSize:12,color:'var(--muted)'}}>%</span>
                        </div>

                        {/* Shared employees */}
                        {(item.share_with || []).map((empId, sidx) => (
                          <div key={sidx} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:8,background:'var(--paper)',borderRadius:6}}>
                            <select className="form-select"
                              value={empId}
                              onChange={e => {
                                const newShareWith = [...(item.share_with || [])];
                                newShareWith[sidx] = e.target.value;
                                updateItem(idx, { share_with: newShareWith });
                              }}
                              style={{flex:1,fontSize:12}}>
                              <option value="">— pilih karyawan partner —</option>
                              {employees
                                .filter(emp => emp.id !== item.employee_id && !(item.share_with || []).some((id, i) => i !== sidx && id === emp.id))
                                .map(emp => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.full_name} {emp.job_title ? `· ${emp.job_title}` : ''}
                                  </option>
                                ))}
                            </select>
                            <input type="number" className="form-input"
                              value={item.share_percents?.[sidx + 1] || 0}
                              onChange={e => {
                                const newPercents = [...(item.share_percents || [])];
                                newPercents[sidx + 1] = Number(e.target.value);
                                updateItem(idx, { share_percents: newPercents });
                              }}
                              min="1" max="100" step="0.01"
                              style={{width:80,textAlign:'center'}}/>
                            <span style={{fontSize:12,color:'var(--muted)'}}>%</span>
                            <button type="button"
                              onClick={() => {
                                const newShareWith = (item.share_with || []).filter((_, i) => i !== sidx);
                                const newCount = newShareWith.length + 1;
                                const eqPercent = Math.floor(100 / newCount * 100) / 100;
                                const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
                                const newPercents = Array(newCount).fill(eqPercent);
                                newPercents[newCount - 1] = remainder;
                                updateItem(idx, { share_with: newShareWith, share_percents: newPercents });
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{padding:'4px 8px',fontSize:11,color:'var(--red)'}}>
                              ✕
                            </button>
                          </div>
                        ))}

                        {/* Total percentage indicator */}
                        {(() => {
                          const total = (item.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
                          const isValid = Math.abs(total - 100) < 0.01;
                          return (
                            <div style={{
                              marginTop:8,padding:'6px 10px',borderRadius:6,
                              background: isValid ? '#ecf5ef' : '#fdf0f0',
                              fontSize:12,
                              color: isValid ? 'var(--green)' : 'var(--red)',
                              display:'flex',justifyContent:'space-between',alignItems:'center',
                            }}>
                              <span>Total persentase</span>
                              <span style={{fontWeight:600}}>
                                {isValid ? '✓ ' : '⚠️ '}{total.toFixed(2)}% {!isValid && '(harus 100%)'}
                              </span>
                            </div>
                          );
                        })()}

                        {/* Preview per-employee split */}
                        {item.price && (
                          <div style={{marginTop:10,padding:10,background:'var(--cream)',borderRadius:6,fontSize:11}}>
                            <div className="eyebrow" style={{fontSize:9,marginBottom:6}}>Pembagian harga & komisi:</div>
                            {[item.employee_id, ...(item.share_with || [])].map((empId, i) => {
                              const pct = Number(item.share_percents?.[i] || 0);
                              const splitPrice = Math.round(Number(item.price) * pct / 100);
                              const splitCom = isFixedComm
                                ? Math.round(com.amount * pct / 100)
                                : Math.round(splitPrice * com.rate / 100);
                              const empName = employees.find(e => e.id === empId)?.full_name || '(belum pilih)';
                              return (
                                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',fontFamily:'JetBrains Mono, monospace'}}>
                                  <span>{empName} ({pct}%)</span>
                                  <span style={{color:'var(--plum)'}}>{fmtRp(splitPrice)} → komisi {fmtRp(splitCom)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              + Tambah Treatment
            </button>
          </Card>

          {/* PEMBAYARAN */}
          <Card title="Pembayaran" sub={hasDp ? "Klien sudah bayar DP — input metode DP & pelunasan" : "Pilih metode pembayaran dari klien"}>
            {/* DP Toggle */}
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:14,padding:'10px 12px',background:'var(--cream)',borderRadius:10}}>
              <input type="checkbox" checked={hasDp}
                onChange={e => {
                  const checked = e.target.checked;
                  setHasDp(checked);
                  if (!checked) {
                    setDpAmount('');
                  } else if (!dpDate) {
                    setDpDate(date);
                  }
                }}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>💰 Klien sudah bayar DP</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>Centang jika ada DP yang sudah dibayar</div>
              </div>
            </label>

            {!hasDp ? (
              <>
                <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>METODE PEMBAYARAN (FULL)</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',gap:8}}>
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.value}
                      style={{
                        display:'flex',alignItems:'center',gap:10,
                        padding:'12px 14px',
                        border:'2px solid',
                        borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
                        borderRadius:10,
                        background: paymentMethod === pm.value ? 'var(--mauve-tint)' : 'var(--paper)',
                        cursor:'pointer',
                      }}>
                      <input type="radio" name="editPaymentMethod"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        style={{accentColor:'var(--mauve)'}}/>
                      <span style={{fontSize:18}}>{pm.icon}</span>
                      <span style={{fontSize:13,fontWeight:500,color: paymentMethod === pm.value ? 'var(--plum)' : 'var(--text)'}}>
                        {pm.label}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* DP Section */}
                <div style={{padding:14,background:'#fdf6e3',borderRadius:10,marginBottom:14,border:'1px solid #f0e0c0'}}>
                  <div className="eyebrow" style={{fontSize:9,marginBottom:10,color:'var(--amber)'}}>1. DP (UANG MUKA)</div>
                  <div className="form-row">
                    <Field label="Tanggal DP">
                      <input type="date" className="form-input" value={dpDate}
                        onChange={e => setDpDate(e.target.value)}/>
                    </Field>
                    <Field label="Jumlah DP (Rp) *">
                      <input type="number" className="form-input" value={dpAmount}
                        onChange={e => setDpAmount(e.target.value)}
                        placeholder="50000" min="0" step="1000" required/>
                    </Field>
                  </div>
                  <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>METODE DP</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))',gap:6}}>
                    {PAYMENT_METHODS.map(pm => (
                      <label key={pm.value}
                        style={{
                          display:'flex',alignItems:'center',gap:8,
                          padding:'8px 10px',
                          border:'2px solid',
                          borderColor: dpMethod === pm.value ? 'var(--amber)' : 'var(--line)',
                          borderRadius:8,
                          background: dpMethod === pm.value ? '#fef3d7' : 'var(--paper)',
                          cursor:'pointer',
                          fontSize:12,
                        }}>
                        <input type="radio" name="editDpMethod"
                          value={pm.value}
                          checked={dpMethod === pm.value}
                          onChange={() => setDpMethod(pm.value)}
                          style={{accentColor:'var(--amber)'}}/>
                        <span>{pm.icon}</span>
                        <span style={{fontSize:12,fontWeight:500}}>{pm.label.replace('Transfer ', '')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sisa Section */}
                <div style={{padding:14,background:'var(--mauve-tint)',borderRadius:10,border:'1px solid var(--mauve)'}}>
                  <div className="eyebrow" style={{fontSize:9,marginBottom:10,color:'var(--mauve)'}}>2. PELUNASAN (SISA)</div>
                  {(() => {
                    const grandTotal = totalAmount + (isHomeService ? Number(homeServiceFee) || 0 : 0);
                    const dp = Number(dpAmount) || 0;
                    const sisa = grandTotal - dp;
                    return (
                      <>
                        <div style={{padding:10,background:'var(--paper)',borderRadius:8,marginBottom:10,fontSize:13}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{color:'var(--muted)'}}>Total Transaksi</span>
                            <span style={{fontWeight:500}}>{fmtRp(grandTotal)}</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{color:'var(--amber)'}}>− DP {dpMethod ? `(${getPaymentMethodLabel(dpMethod)})` : ''}</span>
                            <span style={{fontWeight:500,color:'var(--amber)'}}>−{fmtRp(dp)}</span>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',paddingTop:6,borderTop:'1px solid var(--line)'}}>
                            <span style={{fontWeight:600,color:'var(--plum)'}}>Sisa Pembayaran</span>
                            <span style={{fontWeight:600,color: sisa < 0 ? 'var(--red)' : 'var(--plum)',fontSize:15}}>
                              {fmtRp(sisa)}
                            </span>
                          </div>
                          {sisa < 0 && (
                            <div style={{marginTop:6,fontSize:11,color:'var(--red)'}}>
                              ⚠️ DP melebihi total transaksi
                            </div>
                          )}
                        </div>
                        <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>METODE PELUNASAN</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))',gap:6}}>
                          {PAYMENT_METHODS.map(pm => (
                            <label key={pm.value}
                              style={{
                                display:'flex',alignItems:'center',gap:8,
                                padding:'8px 10px',
                                border:'2px solid',
                                borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
                                borderRadius:8,
                                background:'var(--paper)',
                                cursor:'pointer',
                                fontSize:12,
                              }}>
                              <input type="radio" name="editPaymentMethodSisa"
                                value={pm.value}
                                checked={paymentMethod === pm.value}
                                onChange={() => setPaymentMethod(pm.value)}
                                style={{accentColor:'var(--mauve)'}}/>
                              <span>{pm.icon}</span>
                              <span style={{fontSize:12,fontWeight:500}}>{pm.label.replace('Transfer ', '')}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </Card>

          {/* TIPS */}
          <Card title="Tips dari Client" sub="Tips transfer/QRIS untuk beautician (tips cash langsung diterima beautician)">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:hasTips?14:0,padding:'10px 12px',background:'var(--cream)',borderRadius:10}}>
              <input type="checkbox" checked={hasTips}
                onChange={e => {
                  const checked = e.target.checked;
                  setHasTips(checked);
                  if (!checked) setTips([{ employee_id: '', amount: '', payment_method: 'qris' }]);
                }}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <div>
                <div style={{fontSize:14,fontWeight:500}}>💝 Ada tips dari client (transfer/QRIS)</div>
                <div style={{fontSize:11,color:'var(--muted)'}}>Tips masuk ke rekening kita, lalu diberikan ke beautician. Tercatat di gaji mereka.</div>
              </div>
            </label>

            {hasTips && (
              <div>
                {tips.map((tip, idx) => (
                  <div key={idx} style={{padding:12,background:'var(--mauve-tint)',borderRadius:10,marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span className="eyebrow" style={{fontSize:10}}>Tips #{idx + 1}</span>
                      {tips.length > 1 && (
                        <button type="button"
                          onClick={() => setTips(tips.filter((_, i) => i !== idx))}
                          className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:11,color:'var(--red)'}}>
                          ✕ Hapus
                        </button>
                      )}
                    </div>
                    <Field label="Beautician Penerima *">
                      <select className="form-select" value={tip.employee_id}
                        onChange={e => { const next = [...tips]; next[idx] = { ...next[idx], employee_id: e.target.value }; setTips(next); }}>
                        <option value="">— pilih beautician —</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.full_name}{emp.job_title ? ` · ${emp.job_title}` : ''}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="form-row">
                      <Field label="Jumlah Tips (Rp) *">
                        <input type="number" className="form-input" value={tip.amount}
                          onChange={e => { const next = [...tips]; next[idx] = { ...next[idx], amount: e.target.value }; setTips(next); }}
                          placeholder="20000" min="0" step="any"/>
                      </Field>
                      <Field label="Metode">
                        <select className="form-select" value={tip.payment_method}
                          onChange={e => { const next = [...tips]; next[idx] = { ...next[idx], payment_method: e.target.value }; setTips(next); }}>
                          {PAYMENT_METHODS.filter(pm => pm.value !== 'cash').map(pm => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm"
                  onClick={() => setTips([...tips, { employee_id: '', amount: '', payment_method: 'qris' }])}>
                  + Tambah Tips (beautician lain)
                </button>
                {(() => {
                  const totalTips = tips.reduce((s, t) => s + (Number(t.amount) || 0), 0);
                  return totalTips > 0 ? (
                    <div style={{marginTop:10,padding:'8px 12px',background:'var(--cream)',borderRadius:8,fontSize:13,display:'flex',justifyContent:'space-between'}}>
                      <span style={{color:'var(--muted)'}}>Total tips</span>
                      <span style={{fontWeight:600,color:'var(--plum)'}}>{fmtRp(totalTips)}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </Card>

          {/* HOME SERVICE */}
          <Card title="Home Service" sub="Opsional — komisi treatment sudah termasuk dalam biaya HS">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={isHomeService}
                onChange={e => {
                  const checked = e.target.checked;
                  setIsHomeService(checked);
                  setItems(prev => prev.map(it => {
                    const svc = getServiceDef(it.service_name);
                    if (svc?.commission_type === 'percent') {
                      return { ...it, commission_override: checked ? '0' : '' };
                    }
                    return it;
                  }));
                }}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <span style={{fontSize:14}}>Ini transaksi home service</span>
            </label>
            {isHomeService && (
              <>
                <div style={{padding:'10px 12px',background:'#fdf6e3',borderRadius:6,fontSize:12,color:'var(--plum)',marginBottom:12,lineHeight:1.5}}>
                  💡 <strong>Mode Home Service aktif</strong> — komisi treatment otomatis di-set ke Rp 0.
                </div>
                <Field label="Biaya Home Service (Rp)" hint="100% masuk komisi karyawan">
                  <input type="number" className="form-input" value={homeServiceFee}
                    onChange={e => setHomeServiceFee(e.target.value)} placeholder="50000" min="0" step="5000"/>
                </Field>
              </>
            )}
          </Card>

          {/* CATATAN */}
          <Card title="Catatan" sub="Opsional">
            <textarea className="form-textarea" rows="2" value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."/>
          </Card>

          {/* SUMMARY */}
          <div style={{padding:'14px 16px',background:'var(--mauve-tint)',borderRadius:10,marginBottom:18}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}>
              <span>Total Omset:</span>
              <span style={{fontWeight:500}}>{fmtRp(totalAmount)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}>
              <span>Total Komisi Treatment:</span>
              <span style={{color:'var(--mauve)'}}>{fmtRp(totalCommission)}</span>
            </div>
            {isHomeService && Number(homeServiceFee) > 0 && (
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}>
                <span>Biaya Home Service (100% Karyawan):</span>
                <span style={{color:'var(--mauve)'}}>{fmtRp(Number(homeServiceFee))}</span>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--mauve)',fontSize:14,fontWeight:600}}>
              <span>Total ke Karyawan:</span>
              <span style={{color:'var(--plum-deep)'}}>{fmtRp(totalForEmployee)}</span>
            </div>
          </div>

          <div style={{display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

// =====================================================
// ADD EMPLOYEE MODAL (with relaxed salary for Owner/Manager)
// =====================================================
function AddEmployeeModal({ open, onClose, onSuccess, profile, branches, currentBranchId }) {
  const isSuper = profile.role === 'super_admin';
  const [submitting, setSubmitting] = useStateP(false);

  const defaultBranchId = useMemoP(() => {
    if (isSuper) return currentBranchId || profile.branch_id;
    return profile.branch_id;
  }, [profile, currentBranchId, isSuper]);

  const [form, setForm] = useStateP({
    email: '',
    password: '',
    full_name: '',
    username: '',
    job_title: 'Lash Technician',
    role: 'employee',
    base_salary: 1500000,
    meal_allowance: 0,
    skip_attendance: null,
    branch_id: defaultBranchId,
  });

  const salaryOptional = isSalaryOptional(form.job_title);

  useEffectP(() => {
    if (open) {
      setForm(f => ({ ...f, branch_id: defaultBranchId }));
    }
  }, [open, defaultBranchId]);

  function update(patch) {
    setForm(prev => ({ ...prev, ...patch }));
  }

  function generatePassword() {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    update({ password: pw });
  }

  // When job title changes, auto-clear salary fields for Owner/Manager
  function handleJobTitleChange(newTitle) {
    if (isSalaryOptional(newTitle)) {
      update({ job_title: newTitle, base_salary: '', meal_allowance: '' });
    } else {
      update({
        job_title: newTitle,
        base_salary: form.base_salary || 1500000,
        meal_allowance: form.meal_allowance || 0,
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim()) { toast('Email wajib diisi', 'error'); return; }
    if (!form.email.includes('@')) { toast('Format email tidak valid', 'error'); return; }
    if (form.password.length < 6) { toast('Password minimal 6 karakter', 'error'); return; }
    if (!form.full_name.trim()) { toast('Nama wajib diisi', 'error'); return; }
    if (!form.username.trim()) { toast('Username wajib diisi', 'error'); return; }
    if (!form.branch_id) { toast('Cabang wajib dipilih', 'error'); return; }

    // Salary validation: only required for non-Owner/Manager
    let salary = 0;
    let meal = 0;
    if (salaryOptional) {
      salary = Number(form.base_salary) || 0;
      meal = Number(form.meal_allowance) || 0;
    } else {
      salary = Number(form.base_salary);
      meal = Number(form.meal_allowance) || 0;
      if (isNaN(salary) || salary < 0) {
        toast('Gaji pokok tidak boleh negatif', 'error'); return;
      }
    }

    setSubmitting(true);
    try {
      const created = await createEmployee({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        job_title: form.job_title,
        role: form.role,
        base_salary: salary,
        meal_allowance: meal,
        branch_id: form.branch_id,
      });
      // Penanda absensi di-set terpisah (Edge Function tidak menangani kolom ini)
      if (form.skip_attendance && created?.id) {
        try { await updateEmployee(created.id, { skip_attendance: true }); } catch (e) {}
      }
      toast('Karyawan berhasil ditambahkan! 🎉', 'success');
      onSuccess();
      onClose();
      setForm({
        email: '', password: '', full_name: '', username: '',
        job_title: 'Lash Technician', role: 'employee',
        base_salary: 1500000, meal_allowance: 0, skip_attendance: null,
        branch_id: defaultBranchId,
      });
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:20,backdropFilter:'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background:'var(--paper)',borderRadius:20,padding:32,
        width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto',
        boxShadow:'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <div>
            <div className="eyebrow" style={{marginBottom:6}}>Onboarding</div>
            <h2 style={{fontFamily:'Cormorant Garamond, serif',fontSize:28,fontWeight:400,color:'var(--plum-deep)'}}>
              Tambah Karyawan
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{padding:'12px 14px',background:'var(--mauve-tint)',borderRadius:8,fontSize:12,color:'var(--plum)',marginBottom:18,lineHeight:1.6}}>
            <strong>Tips:</strong> Karyawan akan langsung bisa login. Kasih tahu email & password ke karyawan via WA.
          </div>

          <Field label="Email Login *" hint="Bisa pakai format desi@jbb.local kalau ga ada email asli.">
            <input type="email" className="form-input" value={form.email}
              onChange={e => update({ email: e.target.value })}
              placeholder="desi@jbb.local" required autoComplete="off"/>
          </Field>

          <Field label="Password *" hint="Minimal 6 karakter. Klik 'Generate' untuk password otomatis.">
            <div style={{display:'flex',gap:8}}>
              <input type="text" className="form-input" value={form.password}
                onChange={e => update({ password: e.target.value })}
                placeholder="••••••••" required minLength={6} style={{flex:1}}/>
              <button type="button" className="btn btn-ghost btn-sm" onClick={generatePassword}>Generate</button>
            </div>
          </Field>

          <div className="form-row">
            <Field label="Nama Lengkap *">
              <input type="text" className="form-input" value={form.full_name}
                onChange={e => update({ full_name: e.target.value })}
                placeholder="Desi Kurniawan" required/>
            </Field>
            <Field label="Username *" hint="Lowercase, no space">
              <input type="text" className="form-input" value={form.username}
                onChange={e => update({ username: e.target.value.toLowerCase().replace(/\s/g,'') })}
                placeholder="desi" required/>
            </Field>
          </div>

          <div className="form-row">
            <Field label="Cabang *">
              <select className="form-select" value={form.branch_id}
                onChange={e => update({ branch_id: e.target.value })} required
                disabled={!isSuper}>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Jabatan *">
              <select className="form-select" value={form.job_title}
                onChange={e => handleJobTitleChange(e.target.value)} required>
                {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Role / Tingkat Akses *">
            <select className="form-select" value={form.role}
              onChange={e => update({ role: e.target.value })} required>
              <option value="employee">Karyawan (akses transaksi sendiri)</option>
              <option value="branch_admin">Branch Admin (manage cabang)</option>
              {isSuper && <option value="super_admin">Super Admin (akses semua cabang)</option>}
            </select>
          </Field>

          {salaryOptional ? (
            <div style={{padding:'12px 14px',background:'var(--cream)',borderRadius:8,fontSize:12,color:'var(--muted)',lineHeight:1.6,marginBottom:14}}>
              💡 Untuk jabatan <strong>{form.job_title}</strong>, gaji pokok & uang makan biasanya tidak diisi (compensation lewat profit sharing atau tunjangan lain). Bisa dikosongkan atau diisi sesuai kebijakan internal.
            </div>
          ) : null}

          <div className="form-row">
            <Field label="Gaji Pokok (Rp)" hint="Isi bebas sesuai kebijakan. Boleh 0 (misal akun kiosk).">
              <input type="number" className="form-input" value={form.base_salary}
                onChange={e => update({ base_salary: e.target.value })}
                min="0" step="any"
                placeholder="1500000"/>
            </Field>
            <Field label="Uang Makan (Rp)" hint={salaryOptional ? 'Opsional' : 'Opsional, max Rp 500.000'}>
              <input type="number" className="form-input" value={form.meal_allowance}
                onChange={e => update({ meal_allowance: e.target.value })}
                min="0" max="500000" step="50000"
                placeholder="0"/>
            </Field>
          </div>

          {(() => {
            // Centang ini artinya "kebalikan dari aturan jabatan"
            const defaultExempt = isAttendanceExemptByTitle(form.job_title);
            const checked = defaultExempt
              ? form.skip_attendance === false   // Owner/Manager: centang = ikut absensi
              : form.skip_attendance === true;   // lainnya: centang = tidak ikut absensi
            return (
              <label style={{display:'flex',alignItems:'flex-start',gap:9,cursor:'pointer',padding:'10px 12px',background:'var(--cream)',borderRadius:8,marginTop:4}}>
                <input type="checkbox" checked={checked}
                  onChange={e => update({ skip_attendance: e.target.checked ? (defaultExempt ? false : true) : null })}
                  style={{accentColor:'var(--mauve)',width:17,height:17,marginTop:1}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>
                    {defaultExempt ? 'Ikut absensi harian' : 'Tidak ikut absensi harian'}
                  </div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>
                    {defaultExempt
                      ? `${form.job_title} secara bawaan tidak absen. Centang kalau tetap mau ikut absensi.`
                      : 'Untuk akun kiosk absensi atau staf yang tidak perlu absen.'}
                  </div>
                </div>
              </label>
            );
          })()}

          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20,flexWrap:'wrap'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Tambah Karyawan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// DELETE CONFIRM MODAL
// =====================================================
function DeleteConfirmModal({ open, employee, onClose, onConfirm, deleting }) {
  const [confirmText, setConfirmText] = useStateP('');
  const expected = employee?.full_name || '';
  const canDelete = confirmText.trim() === expected.trim();

  useEffectP(() => {
    if (open) setConfirmText('');
  }, [open]);

  if (!open || !employee) return null;

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1001,padding:20,backdropFilter:'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background:'var(--paper)',borderRadius:20,padding:32,
        width:'100%',maxWidth:480,
        boxShadow:'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{marginBottom:16}}>
          <div className="eyebrow" style={{marginBottom:6,color:'var(--red)'}}>⚠️ Konfirmasi Hapus</div>
          <h2 style={{fontFamily:'Cormorant Garamond, serif',fontSize:26,fontWeight:400,color:'var(--plum-deep)'}}>
            Hapus Karyawan Permanen?
          </h2>
        </div>

        <div style={{padding:'14px 16px',background:'#f0dada',color:'var(--red)',borderRadius:8,fontSize:13,marginBottom:16,lineHeight:1.6}}>
          <strong>Peringatan:</strong> Aksi ini akan menghapus permanen akun <strong>{employee.full_name}</strong> dari database & login. Tidak bisa di-undo.
          <br/><br/>
          <strong>Catatan:</strong> Kalau karyawan ini sudah punya transaksi tercatat, sistem akan menolak penghapusan untuk menjaga integritas laporan. Gunakan tombol <strong>Nonaktifkan</strong> saja.
        </div>

        <Field label={`Ketik nama lengkap "${expected}" untuk konfirmasi`}>
          <input
            type="text"
            className="form-input"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={expected}
            autoFocus
          />
        </Field>

        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20,flexWrap:'wrap'}}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={deleting}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={!canDelete || deleting}
            style={canDelete && !deleting ? {background:'var(--red)',color:'#fff',borderColor:'var(--red)'} : {}}
          >
            {deleting ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Hapus Permanen'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// EMPLOYEES PAGE
// =====================================================
function EmployeesPage({ profile, currentBranchId, branches }) {
  const [employees, setEmployees] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [editingId, setEditingId] = useStateP(null);
  const [editForm, setEditForm] = useStateP({});
  const [saving, setSaving] = useStateP(false);
  const [showInactive, setShowInactive] = useStateP(false);
  const [showAddModal, setShowAddModal] = useStateP(false);
  const [deleteTarget, setDeleteTarget] = useStateP(null);
  const [deleting, setDeleting] = useStateP(false);
  const [viewingEmployee, setViewingEmployee] = useStateP(null);

  const isSuper = profile.role === 'super_admin';

  async function load() {
    setLoading(true);
    try {
      const filterBranch = isSuper ? currentBranchId : null;
      const data = await listEmployees(filterBranch, false);
      setEmployees(data);
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { load(); }, [currentBranchId]);

  function startEdit(emp) {
    setEditingId(emp.id);
    setEditForm({
      full_name: emp.full_name,
      username: emp.username,
      job_title: emp.job_title,
      base_salary: emp.base_salary,
      meal_allowance: emp.meal_allowance,
      skip_attendance: emp.skip_attendance === null || emp.skip_attendance === undefined ? null : !!emp.skip_attendance,
      branch_id: emp.branch_id,
    });
  }

  function cancelEdit() { setEditingId(null); setEditForm({}); }

  async function saveEdit(id) {
    if (!editForm.full_name?.trim()) { toast('Nama wajib diisi', 'error'); return; }
    if (!editForm.username?.trim()) { toast('Username wajib diisi', 'error'); return; }

    const salaryOptional = isSalaryOptional(editForm.job_title);
    let salary = 0;
    let meal = 0;

    if (salaryOptional) {
      salary = Number(editForm.base_salary) || 0;
      meal = Number(editForm.meal_allowance) || 0;
    } else {
      salary = Number(editForm.base_salary);
      meal = Number(editForm.meal_allowance) || 0;
      if (isNaN(salary) || salary < 0) {
        toast('Gaji pokok tidak boleh negatif', 'error'); return;
      }
      if (meal < 0 || meal > 500000) {
        toast('Uang makan: Rp 0 – Rp 500.000', 'error'); return;
      }
    }

    setSaving(true);
    try {
      const patch = {
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim(),
        job_title: editForm.job_title,
        base_salary: salary,
        meal_allowance: meal,
        skip_attendance: editForm.skip_attendance === null || editForm.skip_attendance === undefined ? null : !!editForm.skip_attendance,
      };
      if (isSuper && editForm.branch_id) patch.branch_id = editForm.branch_id;
      await updateEmployee(id, patch);
      toast('Data tersimpan', 'success');
      cancelEdit();
      load();
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(emp) {
    if (!window.confirm(`Nonaktifkan ${emp.full_name}?`)) return;
    try { await deactivateEmployee(emp.id); toast('Karyawan dinonaktifkan', 'success'); load(); }
    catch (err) { toast('Gagal: ' + err.message, 'error'); }
  }
  async function handleReactivate(emp) {
    try { await reactivateEmployee(emp.id); toast('Karyawan diaktifkan kembali', 'success'); load(); }
    catch (err) { toast('Gagal: ' + err.message, 'error'); }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast('Karyawan dihapus permanen', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      if (err.hasTransactions) {
        toast(err.message, 'error');
      } else {
        toast('Gagal: ' + (err.message || err), 'error');
      }
    } finally {
      setDeleting(false);
    }
  }

  const visibleEmployees = showInactive ? employees : employees.filter(e => e.is_active !== false);
  const headerSub = isSuper
    ? (currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang')
    : 'Kelola Data';

  // If admin clicked an employee name, show their dashboard view
  if (viewingEmployee) {
    return (
      <AdminEmployeeView
        profile={profile}
        employee={viewingEmployee}
        branches={branches}
        onBack={() => setViewingEmployee(null)}
      />
    );
  }

  return (
    <div className="page">
      <PageHeader title="Karyawan" sub={headerSub}>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)',cursor:'pointer'}}>
          <input type="checkbox" checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            style={{accentColor:'var(--mauve)'}}/>
          Tampilkan yang nonaktif
        </label>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Tambah Karyawan
        </button>
      </PageHeader>

      <Card>
        {loading ? <Loader text="Memuat..."/> :
         !visibleEmployees.length ? <Empty title="Belum ada karyawan" sub="Klik '+ Tambah Karyawan' untuk mulai."/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  {isSuper && <th>Cabang</th>}
                  <th>Username</th><th>Jabatan</th>
                  <th className="table-numeric">Gaji Pokok</th>
                  <th className="table-numeric">Uang Makan</th>
                  <th className="table-numeric">Total Tetap</th>
                  <th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map(emp => {
                  const isEditing = editingId === emp.id;
                  const totalFixed = (emp.base_salary || 0) + (emp.meal_allowance || 0);
                  const editSalaryOptional = isEditing && isSalaryOptional(editForm.job_title);
                  return (
                    <tr key={emp.id}>
                      <td>
                        {isEditing ? (
                          <input className="form-input" style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})}/>
                        ) : (
                          <div>
                            <button
                              type="button"
                              onClick={() => setViewingEmployee(emp)}
                              style={{
                                background:'none',border:'none',padding:0,cursor:'pointer',
                                fontWeight:500,color:'var(--plum-deep)',textAlign:'left',
                                textDecoration:'underline',textDecorationColor:'var(--mauve)',
                                textUnderlineOffset:3,
                                fontFamily:'inherit',fontSize:'inherit',
                              }}
                              title="Klik untuk lihat dashboard karyawan"
                            >
                              {emp.full_name}
                            </button>
                            {emp.role === 'super_admin' && <span className="badge badge-gold" style={{marginTop:2,display:'inline-block',marginLeft:6}}>super</span>}
                            {emp.role === 'branch_admin' && <span className="badge badge-mauve" style={{marginTop:2,display:'inline-block',marginLeft:6}}>admin</span>}
                          </div>
                        )}
                      </td>
                      {isSuper && (
                        <td>
                          {isEditing ? (
                            <select className="form-select" style={{padding:'6px 10px',fontSize:13}}
                              value={editForm.branch_id} onChange={e => setEditForm({...editForm, branch_id: e.target.value})}>
                              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          ) : <span className="badge badge-mauve">{emp.branch?.name}</span>}
                        </td>
                      )}
                      <td>
                        {isEditing ? (
                          <input className="form-input" style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})}/>
                        ) : (
                          <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>{emp.username}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select className="form-select" style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.job_title} onChange={e => setEditForm({...editForm, job_title: e.target.value})}>
                            {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : <span className="badge badge-mauve">{emp.job_title}</span>}
                      </td>
                      <td className="table-numeric">
                        {isEditing ? (
                          <input type="number" className="form-input" style={{padding:'6px 10px',fontSize:13,textAlign:'right',width:130}}
                            value={editForm.base_salary || ''}
                            onChange={e => setEditForm({...editForm, base_salary: e.target.value})}
                            placeholder={editSalaryOptional ? 'opsional' : ''}/>
                        ) : fmtRpOrDash(emp.base_salary)}
                      </td>
                      <td className="table-numeric">
                        {isEditing ? (
                          <input type="number" className="form-input" style={{padding:'6px 10px',fontSize:13,textAlign:'right',width:120}}
                            value={editForm.meal_allowance || ''}
                            onChange={e => setEditForm({...editForm, meal_allowance: e.target.value})}
                            placeholder="0"/>
                        ) : fmtRpOrDash(emp.meal_allowance)}
                      </td>
                      <td className="table-numeric" style={{fontWeight:500}}>{totalFixed > 0 ? fmtRp(totalFixed) : <span style={{color:'var(--muted)',fontWeight:400}}>—</span>}</td>
                      <td>
                        {emp.is_active === false
                          ? <span className="badge badge-red">nonaktif</span>
                          : <span className="badge badge-green">aktif</span>}
                        {isEditing ? (() => {
                          const defExempt = isAttendanceExemptByTitle(editForm.job_title);
                          const checked = defExempt
                            ? editForm.skip_attendance === false
                            : editForm.skip_attendance === true;
                          return (
                            <label style={{display:'flex',alignItems:'center',gap:5,marginTop:6,fontSize:11,color:'var(--muted)',cursor:'pointer',whiteSpace:'nowrap'}}>
                              <input type="checkbox" checked={checked}
                                onChange={e => setEditForm({...editForm, skip_attendance: e.target.checked ? (defExempt ? false : true) : null})}
                                style={{accentColor:'var(--mauve)'}}/>
                              {defExempt ? 'ikut absensi' : 'tidak ikut absensi'}
                            </label>
                          );
                        })() : (isAttendanceExempt(emp) && (
                          <div style={{fontSize:10,color:'var(--muted)',marginTop:4,whiteSpace:'nowrap'}}>
                            tidak ikut absensi
                          </div>
                        ))}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(emp.id)} disabled={saving}>
                              {saving ? '...' : 'Simpan'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}>Batal</button>
                          </div>
                        ) : (
                          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => startEdit(emp)}>Edit</button>
                            {emp.is_active === false ? (
                              <button className="btn btn-ghost btn-sm" onClick={() => handleReactivate(emp)}>Aktifkan</button>
                            ) : emp.role !== 'super_admin' && emp.id !== profile.id ? (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(emp)}>Nonaktifkan</button>
                            ) : null}
                            {emp.role !== 'super_admin' && emp.id !== profile.id && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteTarget(emp)}
                                title="Hapus permanen (hanya bisa jika belum ada transaksi)"
                                style={{background:'var(--red)',color:'#fff',borderColor:'var(--red)'}}
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={load}
        profile={profile}
        branches={branches}
        currentBranchId={currentBranchId}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        employee={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </div>
  );
}

// =====================================================
// REPORTS PAGE — Tahap C1
// =====================================================
function ReportsPage({ profile, currentBranchId, branches }) {
  const isSuper = profile.role === 'super_admin';

  // Filters
  const [presetId, setPresetId] = useStateP('today');
  const [customFrom, setCustomFrom] = useStateP(todayStr());
  const [customTo, setCustomTo] = useStateP(todayStr());
  const [employeeFilter, setEmployeeFilter] = useStateP('');

  // Data
  const [transactions, setTransactions] = useStateP([]);
  const [employees, setEmployees] = useStateP([]);
  const [paymentFlow, setPaymentFlow] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [flowDetailMethod, setFlowDetailMethod] = useStateP(null);  // payment method clicked for detail
  const [showOmsetDetail, setShowOmsetDetail] = useStateP(false);   // Total Omset clicked → show all transactions

  // Effective date range
  const range = useMemoP(() => {
    if (presetId === 'custom') return { from: customFrom, to: customTo };
    const preset = DATE_PRESETS.find(p => p.id === presetId);
    return preset?.getRange() || { from: todayStr(), to: todayStr() };
  }, [presetId, customFrom, customTo]);

  // Effective branch (super_admin can switch; others locked)
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;

  // Load employees for filter dropdown
  useEffectP(() => {
    listEmployees(effectiveBranchId, false)
      .then(setEmployees)
      .catch(err => console.warn('Employees load:', err));
  }, [effectiveBranchId]);

  // Load transactions on range/branch/employee change
  async function loadData() {
    setLoading(true);
    try {
      const data = await getReportTransactions({
        from: range.from,
        to: range.to,
        branchId: effectiveBranchId,
      });
      setTransactions(data);
      // Derive payment flow directly from loaded transactions (they include payments).
      // No separate query → no silent failure, works for every period.
      setPaymentFlow(computePaymentFlow(data));
    } catch (err) {
      toast('Gagal memuat laporan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, [range.from, range.to, effectiveBranchId]);

  // Aggregate stats (respects employee filter)
  const stats = useMemoP(() => {
    return aggregateReport(transactions, employeeFilter || null);
  }, [transactions, employeeFilter]);

  // Format range for display
  const rangeLabel = useMemoP(() => {
    if (range.from === range.to) return fmtDate(range.from);
    return `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
  }, [range]);

  const branchLabel = effectiveBranchId
    ? branches.find(b => b.id === effectiveBranchId)?.name
    : (isSuper ? 'Semua Cabang' : '—');

  // Category labels
  const categoryLabels = {
    lash: 'Eyelash', brow: 'Brow & Sulam', facial: 'Facial',
    nail: 'Nail', other: 'Lainnya'
  };

  return (
    <div className="page">
      <PageHeader title="Laporan" sub={branchLabel}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (!transactions.length) {
              toast('Tidak ada data untuk diexport', 'error');
              return;
            }
            try {
              exportReportToExcel({
                transactions,
                stats,
                periodLabel: rangeLabel,
                branchLabel,
              });
              toast('Excel berhasil di-download ✓', 'success');
            } catch (err) {
              toast('Gagal export: ' + err.message, 'error');
            }
          }}
          disabled={loading || !transactions.length}
        >
          📥 Export Excel
        </button>
      </PageHeader>

      {/* FILTERS */}
      <Card title="Filter" sub="Pilih periode & karyawan">
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
          {DATE_PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              className={'btn btn-sm ' + (presetId === p.id ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setPresetId(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {presetId === 'custom' && (
          <div className="form-row" style={{marginBottom:14}}>
            <Field label="Dari Tanggal">
              <input type="date" className="form-input" value={customFrom}
                onChange={e => setCustomFrom(e.target.value)} max={customTo}/>
            </Field>
            <Field label="Sampai Tanggal">
              <input type="date" className="form-input" value={customTo}
                onChange={e => setCustomTo(e.target.value)} min={customFrom}/>
            </Field>
          </div>
        )}

        <div className="form-row">
          <Field label="Karyawan" hint="Filter untuk lihat performa 1 karyawan saja">
            <select className="form-select" value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}>
              <option value="">— Semua Karyawan —</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} · {emp.job_title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Periode Aktif">
            <input type="text" className="form-input" value={rangeLabel} disabled
              style={{background:'var(--mauve-tint)',color:'var(--plum)',fontWeight:500}}/>
          </Field>
        </div>
      </Card>

      {loading ? <Card><Loader text="Menghitung laporan..."/></Card> : (
        <>
          {/* SUMMARY METRICS */}
          <div className="metrics-grid" style={{marginBottom:20}}>
            <div onClick={() => setShowOmsetDetail(true)}
              title="Klik untuk lihat semua transaksi di periode ini"
              style={{cursor:'pointer',transition:'all 0.15s',borderRadius:12}}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(122,102,126,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              <Metric
                label={(employeeFilter ? 'Total Revenue (Treatment-nya)' : 'Total Omset') + ' 🔍'}
                value={fmtRp(stats.totalRevenue)}
                sub={`${stats.trxCount} transaksi · ${stats.itemCount} treatment`}
              />
            </div>
            <Metric
              label="Total Komisi"
              value={fmtRp(stats.totalCommission)}
              sub={employeeFilter ? 'untuk karyawan ini' : 'semua karyawan'}
            />
            <Metric
              label="Rata-rata per Transaksi"
              value={fmtRp(stats.avgPerTrx)}
              sub={`${stats.trxCount > 0 ? Math.round(stats.itemCount / stats.trxCount * 10) / 10 : 0} treatment/transaksi`}
            />
            <Metric
              label="Lembur & Home Service"
              value={`${stats.overtimeTrxs} / ${stats.homeServiceTrxs}`}
              sub="lembur · home service"
            />
          </div>

          {/* PAYMENT FLOW BREAKDOWN */}
          <Card title="Aliran Uang" sub="Breakdown pemasukan per metode pembayaran">
            {paymentFlow.length === 0 ? (
              <Empty title="Belum ada data pembayaran" sub="Belum ada transaksi/pembayaran di periode ini."/>
            ) : (
              <>
                {/* Summary cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',gap:10,marginBottom:16}}>
                  {paymentFlow.map(pf => {
                    const total = paymentFlow.reduce((s, p) => s + Number(p.total_amount || 0), 0);
                    const pct = total > 0 ? ((Number(pf.total_amount) / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={pf.payment_method}
                        onClick={() => setFlowDetailMethod(pf.payment_method)}
                        title="Klik untuk lihat transaksi yang pakai metode ini"
                        style={{
                        padding:14,
                        background:'var(--paper)',
                        border:'1px solid var(--line)',
                        borderRadius:10,
                        cursor:'pointer',
                        transition:'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mauve)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(122,102,126,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <span style={{fontSize:20}}>{getPaymentMethodIcon(pf.payment_method)}</span>
                          <span style={{fontSize:12,fontWeight:500,color:'var(--plum)'}}>
                            {getPaymentMethodLabel(pf.payment_method)}
                          </span>
                          <span style={{marginLeft:'auto',fontSize:11,color:'var(--mauve)'}}>›</span>
                        </div>
                        <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:22,fontWeight:400,color:'var(--plum-deep)',marginBottom:4}}>
                          {fmtRp(pf.total_amount)}
                        </div>
                        <div style={{fontSize:11,color:'var(--muted)',display:'flex',justifyContent:'space-between',gap:6}}>
                          <span>{pf.payment_count} pembayaran</span>
                          <span style={{color:'var(--mauve)',fontWeight:500}}>{pct}%</span>
                        </div>
                        {Number(pf.dp_count) > 0 && (
                          <div style={{fontSize:10,color:'var(--amber)',marginTop:4}}>
                            💰 {pf.dp_count} via DP · {pf.full_count} pelunasan/full
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Total summary */}
                <div style={{
                  padding:'12px 16px',
                  background:'var(--mauve-tint)',
                  borderRadius:10,
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  flexWrap:'wrap',
                  gap:10,
                }}>
                  <div>
                    <div className="eyebrow" style={{fontSize:9,marginBottom:4}}>TOTAL ALIRAN UANG</div>
                    <div style={{fontSize:11,color:'var(--muted)'}}>
                      {paymentFlow.reduce((s, p) => s + Number(p.payment_count || 0), 0)} total pembayaran
                      ({paymentFlow.reduce((s, p) => s + Number(p.dp_count || 0), 0)} DP)
                    </div>
                  </div>
                  <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:24,fontWeight:500,color:'var(--plum-deep)'}}>
                    {fmtRp(paymentFlow.reduce((s, p) => s + Number(p.total_amount || 0), 0))}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* PAYMENT FLOW DETAIL MODAL — transactions using the clicked method */}
          {flowDetailMethod && (() => {
            const method = flowDetailMethod;
            // Transactions that used this method (main payment_method or any payment row)
            const matched = transactions.filter(t => {
              if ((t.payment_method || 'cash') === method) return true;
              if ((t.payments || []).some(p => (p.payment_method || '') === method)) return true;
              return false;
            });
            // Sum the amount attributable to this method
            let methodTotal = 0;
            for (const t of matched) {
              const pays = t.payments || [];
              if (pays.length > 0) {
                for (const p of pays) if ((p.payment_method || '') === method) methodTotal += Number(p.amount || 0);
              } else if ((t.payment_method || 'cash') === method) {
                methodTotal += Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
              }
            }
            return (
              <div style={{position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
                onClick={() => setFlowDetailMethod(null)}>
                <div style={{background:'var(--paper)',borderRadius:16,padding:0,maxWidth:560,width:'100%',maxHeight:'85vh',display:'flex',flexDirection:'column',overflow:'hidden'}}
                  onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div style={{padding:'18px 20px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:22}}>{getPaymentMethodIcon(method)}</span>
                        <span style={{fontFamily:"'Cormorant Garamond', serif",fontSize:22,fontWeight:600,color:'var(--plum-deep)'}}>
                          {getPaymentMethodLabel(method)}
                        </span>
                      </div>
                      <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>
                        {matched.length} transaksi · Total {fmtRp(methodTotal)}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setFlowDetailMethod(null)}>✕ Tutup</button>
                  </div>
                  {/* List */}
                  <div style={{overflowY:'auto',padding:'12px 16px'}}>
                    {matched.length === 0 ? (
                      <Empty title="Tidak ada transaksi" sub="Tidak ada transaksi dengan metode ini."/>
                    ) : (
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {matched.map(t => {
                          const empNames = [...new Set((t.items || []).map(i => i.employee?.full_name).filter(Boolean))].join(', ');
                          const pays = t.payments || [];
                          const methodAmt = pays.length > 0
                            ? pays.filter(p => (p.payment_method||'') === method).reduce((s,p)=>s+Number(p.amount||0),0)
                            : Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
                          const isDpPartial = pays.length > 0 && pays.some(p => p.is_dp);
                          return (
                            <div key={t.id} style={{padding:'10px 12px',background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontWeight:500,fontSize:14}}>{t.client_name_snapshot || '-'}</div>
                                  <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>
                                    {fmtDate(t.date)}{t.start_time ? ` · ${t.start_time.slice(0,5)}` : ''}
                                    {empNames ? ` · ${empNames}` : ''}
                                  </div>
                                  <div style={{fontSize:11,color:'var(--mauve)',marginTop:2}}>
                                    {(t.items || []).map(i => i.service_name).join(', ')}
                                  </div>
                                </div>
                                <div style={{textAlign:'right',whiteSpace:'nowrap'}}>
                                  <div style={{fontWeight:600,color:'var(--plum-deep)'}}>{fmtRp(methodAmt)}</div>
                                  {isDpPartial && <div style={{fontSize:10,color:'var(--amber)',marginTop:2}}>termasuk DP</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TOTAL OMSET DETAIL MODAL */}
          {showOmsetDetail && (() => {
            const sorted = [...transactions].sort((a, b) => {
              const dA = a.date || '', dB = b.date || '';
              if (dA !== dB) return dA < dB ? 1 : -1;  // newest first
              return (b.start_time || '').localeCompare(a.start_time || '');
            });
            return (
              <div style={{position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
                onClick={() => setShowOmsetDetail(false)}>
                <div style={{background:'var(--paper)',borderRadius:16,padding:0,maxWidth:600,width:'100%',maxHeight:'85vh',display:'flex',flexDirection:'column',overflow:'hidden'}}
                  onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div style={{padding:'18px 20px',borderBottom:'1px solid var(--line)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:22,fontWeight:600,color:'var(--plum-deep)'}}>
                        {employeeFilter ? 'Detail Revenue' : 'Detail Total Omset'}
                      </div>
                      <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>
                        {sorted.length} transaksi · Total {fmtRp(stats.totalRevenue)}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowOmsetDetail(false)}>✕ Tutup</button>
                  </div>
                  {/* List */}
                  <div style={{overflowY:'auto',padding:'12px 16px'}}>
                    {sorted.length === 0 ? (
                      <Empty title="Tidak ada transaksi" sub="Belum ada transaksi di periode ini."/>
                    ) : (
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {sorted.map(t => {
                          const empNames = [...new Set((t.items || []).map(i => i.employee?.full_name).filter(Boolean))].join(', ');
                          const omset = Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
                          return (
                            <div key={t.id} style={{padding:'10px 12px',background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10}}>
                              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontWeight:500,fontSize:14}}>{t.client_name_snapshot || '-'}</div>
                                  <div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>
                                    {fmtDate(t.date)}{t.start_time ? ` · ${t.start_time.slice(0,5)}` : ''}
                                    {empNames ? ` · ${empNames}` : ''}
                                  </div>
                                  <div style={{fontSize:11,color:'var(--mauve)',marginTop:2}}>
                                    {(t.items || []).map(i => i.service_name).join(', ')}
                                  </div>
                                </div>
                                <div style={{textAlign:'right',whiteSpace:'nowrap'}}>
                                  <div style={{fontWeight:600,color:'var(--plum-deep)'}}>{fmtRp(omset)}</div>
                                  {t.is_home_service && <div style={{fontSize:10,color:'var(--amber)',marginTop:2}}>+ home service</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* BREAKDOWN BY CATEGORY */}
          <Card title="Breakdown per Kategori" sub="Distribusi service di periode ini">
            {Object.keys(stats.byCategory).length === 0 ? (
              <Empty title="Tidak ada data" sub="Belum ada transaksi di periode ini."/>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th className="table-numeric">Jumlah Treatment</th>
                      <th className="table-numeric">Total Revenue</th>
                      <th className="table-numeric">Total Komisi</th>
                      <th className="table-numeric">% dari Omset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byCategory)
                      .sort(([,a], [,b]) => b.revenue - a.revenue)
                      .map(([cat, d]) => (
                        <tr key={cat}>
                          <td><span className="badge badge-mauve">{categoryLabels[cat] || cat}</span></td>
                          <td className="table-numeric">{d.count}</td>
                          <td className="table-numeric" style={{fontWeight:500}}>{fmtRp(d.revenue)}</td>
                          <td className="table-numeric" style={{color:'var(--mauve)'}}>{fmtRp(d.commission)}</td>
                          <td className="table-numeric">
                            {stats.totalRevenue > 0
                              ? `${Math.round(d.revenue / stats.totalRevenue * 100)}%`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* TOP PERFORMERS */}
          {!employeeFilter && stats.topPerformers.length > 0 && (
            <Card title="Top Performer" sub="Karyawan dengan komisi tertinggi di periode ini">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Karyawan</th>
                      <th>Jabatan</th>
                      <th className="table-numeric">Treatment</th>
                      <th className="table-numeric">Revenue</th>
                      <th className="table-numeric">Komisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPerformers.slice(0, 5).map((emp, i) => (
                      <tr key={emp.employee_id}>
                        <td>
                          <span style={{
                            display:'inline-flex',alignItems:'center',justifyContent:'center',
                            width:24,height:24,borderRadius:12,
                            background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--mauve-tint)' : 'var(--cream)',
                            color: i === 0 ? '#fff' : 'var(--plum)',
                            fontWeight:600,fontSize:12,
                            fontFamily:'JetBrains Mono, monospace',
                          }}>{i+1}</span>
                        </td>
                        <td style={{fontWeight:500}}>{emp.full_name}</td>
                        <td><span className="badge badge-mauve">{emp.job_title}</span></td>
                        <td className="table-numeric">{emp.items}</td>
                        <td className="table-numeric">{fmtRp(emp.revenue)}</td>
                        <td className="table-numeric" style={{color:'var(--mauve)',fontWeight:500}}>{fmtRp(emp.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TOP SPENDERS */}
          {stats.topSpenders.length > 0 && (
            <Card title="Top Pelanggan" sub="Pelanggan dengan total belanja tertinggi">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Nama</th>
                      <th>HP</th>
                      <th className="table-numeric">Kunjungan</th>
                      <th className="table-numeric">Total Belanja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topSpenders.slice(0, 5).map((c, i) => (
                      <tr key={i}>
                        <td>
                          <span style={{
                            display:'inline-flex',alignItems:'center',justifyContent:'center',
                            width:24,height:24,borderRadius:12,
                            background: i === 0 ? 'var(--gold)' : 'var(--cream)',
                            color: i === 0 ? '#fff' : 'var(--plum)',
                            fontWeight:600,fontSize:12,
                            fontFamily:'JetBrains Mono, monospace',
                          }}>{i+1}</span>
                        </td>
                        <td style={{fontWeight:500}}>{c.name}</td>
                        <td>
                          <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>
                            {c.phone || '—'}
                          </span>
                        </td>
                        <td className="table-numeric">{c.visits}x</td>
                        <td className="table-numeric" style={{fontWeight:500}}>{fmtRp(c.spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TOP SERVICES */}
          {Object.keys(stats.byService).length > 0 && (
            <Card title="Top Treatment" sub="Treatment paling laris di periode ini">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Treatment</th>
                      <th className="table-numeric">Jumlah</th>
                      <th className="table-numeric">Revenue</th>
                      <th className="table-numeric">Komisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.byService)
                      .sort(([,a], [,b]) => b.count - a.count)
                      .slice(0, 8)
                      .map(([name, d]) => (
                        <tr key={name}>
                          <td style={{fontWeight:500}}>{name}</td>
                          <td className="table-numeric">{d.count}x</td>
                          <td className="table-numeric">{fmtRp(d.revenue)}</td>
                          <td className="table-numeric" style={{color:'var(--mauve)'}}>{fmtRp(d.commission)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* EMPTY STATE */}
          {stats.trxCount === 0 && (
            <Card>
              <Empty title="Belum ada data" sub={`Tidak ada transaksi di periode ${rangeLabel}.`}/>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// =====================================================
// KAS PAGE — Uang Keluar (pengeluaran) + saldo per metode
// =====================================================
function KasPage({ profile, currentBranchId, branches }) {
  const isSuper = profile.role === 'super_admin';
  const isAdmin = profile.role === 'super_admin' || profile.role === 'branch_admin';
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;

  // Period filter
  const [presetId, setPresetId] = useStateP('thisMonth');
  const [customFrom, setCustomFrom] = useStateP(todayStr());
  const [customTo, setCustomTo] = useStateP(todayStr());

  const range = useMemoP(() => {
    if (presetId === 'custom') return { from: customFrom, to: customTo };
    const preset = DATE_PRESETS.find(p => p.id === presetId);
    return preset?.getRange() || { from: todayStr(), to: todayStr() };
  }, [presetId, customFrom, customTo]);

  // Data
  const [expenses, setExpenses] = useStateP([]);
  const [balance, setBalance] = useStateP(null);
  const [loading, setLoading] = useStateP(true);

  // New expense form
  const [exDate, setExDate] = useStateP(todayStr());
  const [exDesc, setExDesc] = useStateP('');
  const [exAmount, setExAmount] = useStateP('');
  const [exMethod, setExMethod] = useStateP('cash');
  const [exNotes, setExNotes] = useStateP('');
  const [submitting, setSubmitting] = useStateP(false);

  // Edit state
  const [editingId, setEditingId] = useStateP(null);
  const [editForm, setEditForm] = useStateP({});
  const [deleteTarget, setDeleteTarget] = useStateP(null);

  async function loadData() {
    setLoading(true);
    try {
      const [exp, bal] = await Promise.all([
        listExpenses({ from: range.from, to: range.to, branchId: effectiveBranchId }),
        getCashBalance({ from: range.from, to: range.to, branchId: effectiveBranchId }).catch(e => { console.warn('balance:', e); return null; }),
      ]);
      setExpenses(exp);
      setBalance(bal);
    } catch (err) {
      toast('Gagal memuat kas: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, [range.from, range.to, effectiveBranchId]);

  async function handleAddExpense() {
    if (!effectiveBranchId) { toast('Pilih cabang dulu', 'error'); return; }
    if (!exDesc.trim()) { toast('Keterangan wajib diisi', 'error'); return; }
    if (!exAmount || Number(exAmount) <= 0) { toast('Jumlah harus > 0', 'error'); return; }
    if (!exDate) { toast('Tanggal wajib diisi', 'error'); return; }
    setSubmitting(true);
    try {
      await createExpense({
        branchId: effectiveBranchId,
        date: exDate,
        description: exDesc,
        amount: Number(exAmount),
        paymentMethod: exMethod,
        notes: exNotes,
        createdBy: profile.id,
      });
      toast('Pengeluaran dicatat! 💸', 'success');
      setExDesc(''); setExAmount(''); setExNotes(''); setExMethod('cash'); setExDate(todayStr());
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(e) {
    setEditingId(e.id);
    setEditForm({
      date: e.date,
      description: e.description,
      amount: e.amount,
      payment_method: e.payment_method,
      notes: e.notes || '',
    });
  }

  async function saveEdit(id) {
    if (!editForm.description?.trim()) { toast('Keterangan wajib diisi', 'error'); return; }
    if (!editForm.amount || Number(editForm.amount) <= 0) { toast('Jumlah harus > 0', 'error'); return; }
    try {
      await updateExpense(id, {
        date: editForm.date,
        description: editForm.description,
        amount: Number(editForm.amount),
        paymentMethod: editForm.payment_method,
        notes: editForm.notes,
      });
      toast('Pengeluaran diperbarui', 'success');
      setEditingId(null);
      loadData();
    } catch (err) {
      toast('Gagal edit: ' + (err.message || err), 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      toast('Pengeluaran dihapus', 'success');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast('Gagal hapus: ' + (err.message || err), 'error');
    }
  }

  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const branchName = effectiveBranchId ? branches.find(b => b.id === effectiveBranchId)?.name : null;

  return (
    <div className="page">
      <PageHeader title="Kas — Uang Keluar" sub={branchName || (isSuper ? 'Pilih cabang di pojok kanan atas' : 'Cabang')}/>

      {!effectiveBranchId && isSuper && (
        <Card>
          <Empty title="Pilih Cabang" desc="Pilih cabang di dropdown pojok kanan atas untuk melihat & mencatat pengeluaran."/>
        </Card>
      )}

      {effectiveBranchId && (
        <>
          {/* PERIOD FILTER */}
          <Card title="Filter Periode" sub="Pilih rentang waktu untuk saldo & daftar pengeluaran">
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:presetId==='custom'?14:0}}>
              {DATE_PRESETS.map(p => (
                <button key={p.id}
                  className={'btn btn-sm ' + (presetId === p.id ? 'btn-primary' : 'btn-ghost')}
                  onClick={() => setPresetId(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            {presetId === 'custom' && (
              <div className="form-row">
                <Field label="Dari Tanggal">
                  <input type="date" className="form-input" value={customFrom} onChange={e => setCustomFrom(e.target.value)}/>
                </Field>
                <Field label="Sampai Tanggal">
                  <input type="date" className="form-input" value={customTo} onChange={e => setCustomTo(e.target.value)}/>
                </Field>
              </div>
            )}
          </Card>

          {/* SALDO SUMMARY */}
          <Card title="Saldo Kas" sub="Uang masuk (transaksi + tips) − uang keluar (pengeluaran) per metode">
            {loading ? <Loader text="Menghitung saldo..."/> : balance && balance.byMethod.length > 0 ? (
              <>
                <div className="metrics-grid" style={{marginBottom:16}}>
                  {balance.byMethod.map(m => (
                    <div key={m.method} style={{
                      padding:16,borderRadius:12,
                      background: m.balance >= 0 ? 'var(--cream)' : '#fbeaea',
                      border:'1px solid ' + (m.balance >= 0 ? 'var(--gold-soft, #e8dcc0)' : '#e8c4c4'),
                    }}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                        <span style={{fontSize:18}}>{getPaymentMethodIcon(m.method)}</span>
                        <span style={{fontSize:13,fontWeight:600}}>{getPaymentMethodLabel(m.method)}</span>
                      </div>
                      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:600,color:m.balance>=0?'var(--plum-deep)':'var(--red)'}}>
                        {fmtRp(m.balance)}
                      </div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:6,lineHeight:1.5}}>
                        Masuk: {fmtRp(m.in)}<br/>
                        Keluar: {fmtRp(m.out)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',background:'var(--plum-deep)',borderRadius:12,color:'#fff'}}>
                  <div>
                    <div style={{fontSize:11,opacity:0.7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Total Saldo Kas</div>
                    <div style={{fontSize:11,opacity:0.6,marginTop:2}}>Masuk {fmtRp(balance.totalIn)} · Keluar {fmtRp(balance.totalOut)}</div>
                  </div>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:28,fontWeight:600}}>
                    {fmtRp(balance.totalBalance)}
                  </div>
                </div>
              </>
            ) : (
              <Empty title="Belum ada data" desc="Belum ada transaksi atau pengeluaran di periode ini."/>
            )}
          </Card>

          {/* INPUT PENGELUARAN */}
          <Card title="Catat Pengeluaran Baru" sub="Beli kapas, cotton bud, perlengkapan, dll">
            <div className="form-row">
              <Field label="Tanggal *">
                <input type="date" className="form-input" value={exDate} onChange={e => setExDate(e.target.value)}/>
              </Field>
              <Field label="Sumber Dana *">
                <select className="form-select" value={exMethod} onChange={e => setExMethod(e.target.value)}>
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Keterangan / Dipakai Untuk Apa *">
              <input className="form-input" value={exDesc} onChange={e => setExDesc(e.target.value)}
                placeholder="Contoh: Beli kapas & cotton bud"/>
            </Field>
            <div className="form-row">
              <Field label="Jumlah (Rp) *">
                <input type="number" className="form-input" value={exAmount} onChange={e => setExAmount(e.target.value)}
                  placeholder="50000" min="0" step="any"/>
              </Field>
              <Field label="Catatan (opsional)">
                <input className="form-input" value={exNotes} onChange={e => setExNotes(e.target.value)}
                  placeholder="Toko, dll"/>
              </Field>
            </div>
            <button className="btn btn-primary" onClick={handleAddExpense} disabled={submitting}>
              {submitting ? 'Menyimpan...' : '💸 Catat Pengeluaran'}
            </button>
          </Card>

          {/* DAFTAR PENGELUARAN */}
          <Card title="Daftar Pengeluaran" sub={`${expenses.length} pengeluaran · Total ${fmtRp(totalExpense)}`}>
            {loading ? <Loader text="Memuat..."/> : expenses.length === 0 ? (
              <Empty title="Belum ada pengeluaran" desc="Catat pengeluaran pertama di form atas."/>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {expenses.map(e => editingId === e.id ? (
                  <div key={e.id} style={{padding:14,background:'var(--mauve-tint)',borderRadius:10}}>
                    <div className="form-row">
                      <Field label="Tanggal">
                        <input type="date" className="form-input" value={editForm.date}
                          onChange={ev => setEditForm({...editForm, date: ev.target.value})}/>
                      </Field>
                      <Field label="Sumber Dana">
                        <select className="form-select" value={editForm.payment_method}
                          onChange={ev => setEditForm({...editForm, payment_method: ev.target.value})}>
                          {PAYMENT_METHODS.map(pm => <option key={pm.value} value={pm.value}>{pm.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Keterangan">
                      <input className="form-input" value={editForm.description}
                        onChange={ev => setEditForm({...editForm, description: ev.target.value})}/>
                    </Field>
                    <Field label="Jumlah">
                      <input type="number" className="form-input" value={editForm.amount}
                        onChange={ev => setEditForm({...editForm, amount: ev.target.value})}/>
                    </Field>
                    <div style={{display:'flex',gap:8,marginTop:8}}>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(e.id)}>Simpan</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'12px 14px',background:'var(--paper)',border:'1px solid var(--border, #eee)',borderRadius:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:500,fontSize:14}}>{e.description}</div>
                      <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>
                        {fmtDate(e.date)} · {getPaymentMethodIcon(e.payment_method)} {getPaymentMethodLabel(e.payment_method)}
                        {e.notes ? ` · ${e.notes}` : ''}
                      </div>
                    </div>
                    <div style={{textAlign:'right',marginLeft:12}}>
                      <div style={{fontWeight:600,color:'var(--red)',fontSize:15,whiteSpace:'nowrap'}}>−{fmtRp(e.amount)}</div>
                      {isAdmin && (
                        <div style={{display:'flex',gap:4,marginTop:6,justifyContent:'flex-end'}}>
                          <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:11}}
                            onClick={() => startEdit(e)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" style={{padding:'2px 8px',fontSize:11,color:'var(--red)'}}
                            onClick={() => setDeleteTarget(e)}>🗑</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div style={{position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}
          onClick={() => setDeleteTarget(null)}>
          <div style={{background:'var(--paper)',borderRadius:16,padding:24,maxWidth:340,width:'100%'}} onClick={ev => ev.stopPropagation()}>
            <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:600,marginBottom:8}}>Hapus Pengeluaran?</div>
            <div style={{fontSize:13,color:'var(--muted)',marginBottom:18}}>
              "{deleteTarget.description}" — {fmtRp(deleteTarget.amount)}. Tindakan ini tidak bisa dibatalkan.
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" style={{background:'var(--red)',flex:1}} onClick={confirmDelete}>Ya, Hapus</button>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// =====================================================
// ADJUST ATTENDANCE MODAL — input absensi & penyesuaian per karyawan
// =====================================================
function AdjustAttendanceModal({ open, onClose, onSuccess, employee, period, currentAdjustment, branchId, adjustedBy, leaveBalance, attendance }) {
  const [form, setForm] = useStateP({
    standard_work_days: 26,
    annual_leave_days: 0,
    sick_leave_certified_days: 0,
    unpaid_leave_days: 0,
    bonus: 0,
    extra_deduction: 0,
    notes: '',
  });
  const [saving, setSaving] = useStateP(false);

  useEffectP(() => {
    if (open && currentAdjustment) {
      setForm({
        standard_work_days: currentAdjustment.standard_work_days || 26,
        actual_work_days: currentAdjustment.actual_work_days || '',
        annual_leave_days: currentAdjustment.annual_leave_days || 0,
        sick_leave_certified_days: currentAdjustment.sick_leave_certified_days || 0,
        unpaid_leave_days: currentAdjustment.unpaid_leave_days || 0,
        unpaid_leave_weekend_days: currentAdjustment.unpaid_leave_weekend_days || 0,
        bpjs_kesehatan: currentAdjustment.bpjs_kesehatan || 0,
        bonus: currentAdjustment.bonus || 0,
        extra_deduction: currentAdjustment.extra_deduction || 0,
        notes: currentAdjustment.notes || '',
      });
    } else if (open) {
      setForm({
        standard_work_days: 26,
        actual_work_days: '',
        annual_leave_days: 0,
        sick_leave_certified_days: 0,
        unpaid_leave_days: 0,
        unpaid_leave_weekend_days: 0,
        bpjs_kesehatan: 0,
        bonus: 0,
        extra_deduction: 0,
        notes: '',
      });
    }
  }, [open, currentAdjustment]);

  function update(patch) {
    setForm(prev => ({ ...prev, ...patch }));
  }

  // Live preview
  const preview = useMemoP(() => {
    if (!employee) return null;
    const baseSalary = Number(employee.base_salary) || 0;
    const unpaid = Number(form.unpaid_leave_days) || 0;
    const unpaidWeekend = Number(form.unpaid_leave_weekend_days) || 0;
    const effectiveAbsent = unpaid + (unpaidWeekend * 2);
    const standardDays = Number(form.standard_work_days) || 26;
    const dailyWage = Math.round(baseSalary / standardDays);
    const actualWorkDays = Number(form.actual_work_days) || 0;
    const isProrated = actualWorkDays > 0 && actualWorkDays < standardDays;
    let actualSalary;
    if (isProrated) {
      const proratedBase = baseSalary * (actualWorkDays / standardDays);
      actualSalary = effectiveAbsent > 0
        ? Math.round(proratedBase * (1 - effectiveAbsent / actualWorkDays))
        : Math.round(proratedBase);
      if (actualSalary < 0) actualSalary = 0;
    } else {
      actualSalary = effectiveAbsent > 0
        ? Math.round(baseSalary * (1 - effectiveAbsent / standardDays))
        : baseSalary;
    }
    const deduction = baseSalary - actualSalary;

    // Meal allowance: reduced by unpaid absence (weekend counted once, not doubled).
    // Paid leave (annual/certified sick) does not reduce it.
    const mealFull = Number(employee.meal_allowance) || 0;
    const mealAbsent = unpaid + unpaidWeekend;
    const mealDaysBase = isProrated ? actualWorkDays : standardDays;
    let actualMeal;
    if (isProrated) {
      const proratedMeal = mealFull * (actualWorkDays / standardDays);
      actualMeal = mealAbsent > 0
        ? Math.round(proratedMeal * (1 - mealAbsent / actualWorkDays))
        : Math.round(proratedMeal);
    } else {
      actualMeal = mealAbsent > 0
        ? Math.round(mealFull * (1 - mealAbsent / standardDays))
        : mealFull;
    }
    if (actualMeal < 0) actualMeal = 0;
    const mealDeduction = mealFull - actualMeal;
    const mealDaysPaid = Math.max(0, mealDaysBase - mealAbsent);

    return { actualSalary, deduction, effectiveAbsent, dailyWage, isProrated, actualWorkDays,
             mealFull, actualMeal, mealDeduction, mealAbsent, mealDaysPaid, mealDaysBase };
  }, [form, employee]);

  // Annual leave check
  const annualLeaveUsedOther = (leaveBalance?.used_days || 0) - (currentAdjustment?.annual_leave_days || 0);
  const annualLeaveRemaining = (leaveBalance?.total_quota || 7) - annualLeaveUsedOther - (Number(form.annual_leave_days) || 0);
  const annualLeaveOverQuota = annualLeaveRemaining < 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!employee) return;

    const annualLeave = Number(form.annual_leave_days) || 0;
    const sickCertified = Number(form.sick_leave_certified_days) || 0;
    const unpaid = Number(form.unpaid_leave_days) || 0;

    if (annualLeave < 0 || sickCertified < 0 || unpaid < 0) {
      toast('Hari absen tidak boleh negatif', 'error');
      return;
    }
    if (annualLeaveOverQuota) {
      if (!window.confirm(`Cuti tahunan melebihi jatah ${leaveBalance?.total_quota || 7} hari/tahun. Sisa hanya ${Math.max(0, (leaveBalance?.total_quota || 7) - annualLeaveUsedOther)} hari. Lanjut tetap simpan?`)) {
        return;
      }
    }

    setSaving(true);
    try {
      await upsertPayrollAdjustment({
        employee_id: employee.id,
        branch_id: branchId,
        period_start: period.period_start,
        period_end: period.period_end,
        standard_work_days: Number(form.standard_work_days) || 26,
        actual_work_days: form.actual_work_days ? Number(form.actual_work_days) : null,
        annual_leave_days: annualLeave,
        sick_leave_certified_days: sickCertified,
        unpaid_leave_days: unpaid,
        unpaid_leave_weekend_days: Number(form.unpaid_leave_weekend_days) || 0,
        bpjs_kesehatan: Number(form.bpjs_kesehatan) || 0,
        bonus: Number(form.bonus) || 0,
        extra_deduction: Number(form.extra_deduction) || 0,
        notes: form.notes || null,
        adjusted_by: adjustedBy,
      });
      toast('Absensi tersimpan ✓', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!open || !employee) return null;

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(36,26,44,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:20,backdropFilter:'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background:'var(--paper)',borderRadius:20,padding:32,
        width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto',
        boxShadow:'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <div>
            <div className="eyebrow" style={{marginBottom:6}}>Absensi & Penyesuaian</div>
            <h2 style={{fontFamily:'Cormorant Garamond, serif',fontSize:26,fontWeight:400,color:'var(--plum-deep)'}}>
              {employee.full_name}
            </h2>
            <p style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
              {employee.job_title} · Gaji pokok {fmtRp(employee.base_salary)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{padding:'12px 14px',background:'var(--mauve-tint)',borderRadius:8,fontSize:12,color:'var(--plum)',marginBottom:18,lineHeight:1.6}}>
            <strong>Aturan JBB:</strong><br/>
            • Cuti tahunan, sakit + surat dokter → <strong>tidak potong gaji</strong><br/>
            • Absen tanpa surat / izin pribadi → <strong>potong gaji harian</strong> (1×)<br/>
            • Absen di hari weekend (Sabtu/Minggu) → <strong>potong 2× gaji harian</strong><br/>
            • Standar hari kerja: 26 hari/bulan
          </div>

          <Field label="Standar Hari Kerja" hint="Default 26 hari (libur 1x/minggu). Ini pembagi gaji harian.">
            <input type="number" className="form-input" value={form.standard_work_days}
              onChange={e => update({ standard_work_days: e.target.value })}
              min="1" max="31"/>
          </Field>

          <Field label="Hari Kerja Aktual (opsional — karyawan baru)" hint="Isi HANYA jika karyawan baru masuk pertengahan periode. Contoh: baru kerja 7 hari → gaji proporsional 7/standar. Kosongkan untuk karyawan normal.">
            <input type="number" className="form-input" value={form.actual_work_days}
              onChange={e => update({ actual_work_days: e.target.value })}
              min="1" max="31" placeholder="Kosongkan jika kerja penuh"/>
          </Field>
          {preview?.isProrated && (
            <div style={{padding:'8px 12px',background:'var(--cream)',borderRadius:8,fontSize:12,color:'var(--plum)',marginTop:-6,marginBottom:14}}>
              💡 Gaji proporsional: {preview.actualWorkDays} dari {Number(form.standard_work_days) || 26} hari
              = {fmtRp(preview.actualSalary)} (dari {fmtRp(Number(employee.base_salary) || 0)})
              <div style={{fontSize:11,color:'var(--muted)',marginTop:4}}>
                Uang makan juga ikut pro-rata. Komisi, home service & tips tetap penuh (sesuai transaksi nyata).
              </div>
            </div>
          )}

          {/* Data dari sistem absensi */}
          {attendance && attendance.days_present > 0 && (() => {
            const std = Number(form.standard_work_days) || 26;
            const cuti = Number(form.annual_leave_days) || 0;
            const sakit = Number(form.sick_leave_certified_days) || 0;
            // Absen tanpa keterangan = hari kerja standar dikurangi hari hadir,
            // dikurangi lagi cuti & sakit bersurat (yang sudah punya keterangan)
            const saranAbsen = Math.max(0, std - attendance.days_present - cuti - sakit);
            const sudahSama = Number(form.unpaid_leave_days) === saranAbsen;
            return (
              <div style={{padding:'12px 14px',background:'var(--mauve-tint)',borderRadius:10,marginBottom:14}}>
                <div className="eyebrow" style={{marginBottom:8}}>Dari sistem absensi</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10,fontSize:12,marginBottom:10}}>
                  <div>
                    <div style={{color:'var(--muted)',fontSize:11}}>Hari hadir</div>
                    <div style={{fontWeight:600,fontSize:15,color:'var(--plum-deep)'}}>{attendance.days_present} hari</div>
                  </div>
                  <div>
                    <div style={{color:'var(--muted)',fontSize:11}}>Hari telat</div>
                    <div style={{fontWeight:600,fontSize:15,color: attendance.days_late > 0 ? 'var(--red)' : 'var(--plum-deep)'}}>
                      {attendance.days_late} hari
                    </div>
                  </div>
                  <div>
                    <div style={{color:'var(--muted)',fontSize:11}}>Total telat</div>
                    <div style={{fontWeight:600,fontSize:15,color: attendance.total_late_minutes > 0 ? 'var(--red)' : 'var(--plum-deep)'}}>
                      {attendance.total_late_minutes} menit
                    </div>
                  </div>
                  {attendance.days_no_clockout > 0 && (
                    <div>
                      <div style={{color:'var(--muted)',fontSize:11}}>Lupa absen pulang</div>
                      <div style={{fontWeight:600,fontSize:15,color:'var(--amber)'}}>{attendance.days_no_clockout} hari</div>
                    </div>
                  )}
                </div>
                <div style={{borderTop:'1px solid rgba(122,102,126,0.2)',paddingTop:10,fontSize:12}}>
                  <div style={{marginBottom:8,color:'var(--plum)'}}>
                    Perhitungan absen: {std} hari kerja − {attendance.days_present} hadir
                    {cuti > 0 ? ` − ${cuti} cuti` : ''}{sakit > 0 ? ` − ${sakit} sakit` : ''}
                    {' = '}<strong>{saranAbsen} hari absen tanpa keterangan</strong>
                  </div>
                  <button type="button" className={'btn btn-sm ' + (sudahSama ? 'btn-ghost' : 'btn-primary')}
                    disabled={sudahSama}
                    onClick={() => update({ unpaid_leave_days: saranAbsen })}>
                    {sudahSama ? 'Sudah sesuai absensi' : `Isi otomatis: ${saranAbsen} hari absen`}
                  </button>
                  <div style={{fontSize:11,color:'var(--muted)',marginTop:8}}>
                    Isi dulu cuti dan sakit bersurat di bawah, baru tekan tombol ini supaya hasilnya tepat.
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <Field
              label="Cuti Tahunan (hari)"
              hint={leaveBalance ? `Sisa: ${Math.max(0, annualLeaveRemaining)}/${leaveBalance.total_quota || 7}` : 'Jatah 7 hari/tahun'}
              error={annualLeaveOverQuota ? '⚠️ Melebihi jatah!' : null}
            >
              <input type="number" className="form-input" value={form.annual_leave_days}
                onChange={e => update({ annual_leave_days: e.target.value })}
                min="0" max="31"
                style={annualLeaveOverQuota ? {borderColor:'var(--red)',background:'#fdf0f0'} : {}}/>
            </Field>
            <Field label="Sakit + Surat Dokter" hint="Tidak potong gaji">
              <input type="number" className="form-input" value={form.sick_leave_certified_days}
                onChange={e => update({ sick_leave_certified_days: e.target.value })}
                min="0" max="31"/>
            </Field>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <Field label="Absen (hari biasa)" hint="Senin–Jumat · POTONG GAJI 1×" error={null}>
              <input type="number" className="form-input" value={form.unpaid_leave_days}
                onChange={e => update({ unpaid_leave_days: e.target.value })}
                min="0" max="31"
                style={Number(form.unpaid_leave_days) > 0 ? {borderColor:'var(--amber)',background:'#fdf6e3'} : {}}/>
            </Field>
            <Field label="Absen Weekend (Sabtu/Minggu)" hint="POTONG GAJI 2×" error={null}>
              <input type="number" className="form-input" value={form.unpaid_leave_weekend_days}
                onChange={e => update({ unpaid_leave_weekend_days: e.target.value })}
                min="0" max="10"
                style={Number(form.unpaid_leave_weekend_days) > 0 ? {borderColor:'var(--red)',background:'#fef0e8'} : {}}/>
            </Field>
          </div>

          {/* PREVIEW */}
          {preview && (Number(form.unpaid_leave_days) > 0 || Number(form.unpaid_leave_weekend_days) > 0) && (
            <div style={{
              padding:'12px 14px',background:'#fdf6e3',borderRadius:8,
              fontSize:13,color:'var(--plum)',marginBottom:18,lineHeight:1.7,
              border:'1px solid var(--amber)'
            }}>
              <strong>⚠️ Potongan gaji aktif:</strong><br/>
              Gaji pokok {fmtRp(employee.base_salary)} → <strong style={{color:'var(--red)'}}>{fmtRp(preview.actualSalary)}</strong><br/>
              <span style={{fontSize:11,color:'var(--muted)'}}>
                Gaji harian: {fmtRp(preview.dailyWage)} ({fmtRp(employee.base_salary)} / {form.standard_work_days} hari)<br/>
                {Number(form.unpaid_leave_days) > 0 && (
                  <>Absen biasa: {form.unpaid_leave_days} × {fmtRp(preview.dailyWage)} = {fmtRp(Number(form.unpaid_leave_days) * preview.dailyWage)}<br/></>
                )}
                {Number(form.unpaid_leave_weekend_days) > 0 && (
                  <>Absen weekend: {form.unpaid_leave_weekend_days} × 2 × {fmtRp(preview.dailyWage)} = {fmtRp(Number(form.unpaid_leave_weekend_days) * 2 * preview.dailyWage)}<br/></>
                )}
                Total potongan: <strong style={{color:'var(--red)'}}>{fmtRp(preview.deduction)}</strong> ({preview.effectiveAbsent} hari efektif)
              </span>
              {preview.mealDeduction > 0 && (
                <>
                  <div style={{borderTop:'1px solid var(--amber)',margin:'8px 0',opacity:0.5}}/>
                  Uang makan {fmtRp(preview.mealFull)} → <strong style={{color:'var(--red)'}}>{fmtRp(preview.actualMeal)}</strong><br/>
                  <span style={{fontSize:11,color:'var(--muted)'}}>
                    Dibayar {preview.mealDaysPaid} dari {preview.mealDaysBase} hari
                    (absen {preview.mealAbsent} hari, weekend dihitung 1 hari)<br/>
                    Potongan uang makan: <strong style={{color:'var(--red)'}}>{fmtRp(preview.mealDeduction)}</strong>
                  </span>
                </>
              )}
            </div>
          )}

          <Field label="BPJS Kesehatan (Rp)" hint="Tunjangan BPJS dari perusahaan, ditambahkan ke gaji. Biasanya 35.000. Kosongkan/0 jika tidak ada.">
            <input type="number" className="form-input" value={form.bpjs_kesehatan}
              onChange={e => update({ bpjs_kesehatan: e.target.value })}
              min="0" step="any" placeholder="35000"/>
          </Field>

          <div className="form-row">
            <Field label="Bonus (Rp)" hint="THR, insentif, dll. Opsional">
              <input type="number" className="form-input" value={form.bonus}
                onChange={e => update({ bonus: e.target.value })}
                min="0" step="any" placeholder="0"/>
            </Field>
            <Field label="Potongan / Kasbon (Rp)" hint="Kasbon, denda telat, dll. Dipotong dari gaji. Opsional">
              <input type="number" className="form-input" value={form.extra_deduction}
                onChange={e => update({ extra_deduction: e.target.value })}
                min="0" step="any" placeholder="0"/>
            </Field>
          </div>

          <Field label="Catatan" hint="Opsional">
            <textarea className="form-textarea" rows="2" value={form.notes}
              onChange={e => update({ notes: e.target.value })}
              placeholder="Misal: cuti H-1 untuk acara keluarga, sakit demam dapat surat dokter..."/>
          </Field>

          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20,flexWrap:'wrap'}}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Simpan Absensi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// PAYROLL PAGE — Tahap C2
// =====================================================
function PayrollPage({ profile, currentBranchId, branches }) {
  const isSuper = profile.role === 'super_admin';
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;

  // Period selection
  const periodOptions = useMemoP(() => listRecentPayrollPeriods(12), []);
  const [selectedPeriodId, setSelectedPeriodId] = useStateP(periodOptions[0]?.id);
  const selectedPeriod = useMemoP(
    () => periodOptions.find(p => p.id === selectedPeriodId) || periodOptions[0],
    [selectedPeriodId, periodOptions]
  );

  const [employees, setEmployees] = useStateP([]);
  const [commissions, setCommissions] = useStateP({});
  const [adjustments, setAdjustments] = useStateP([]);
  const [leaveBalances, setLeaveBalances] = useStateP([]);
  const [attendanceSummary, setAttendanceSummary] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [adjustTarget, setAdjustTarget] = useStateP(null);
  const [viewingEmployee, setViewingEmployee] = useStateP(null);

  async function loadData() {
    if (!selectedPeriod) return;
    setLoading(true);
    try {
      const branchFilter = effectiveBranchId;
      const [emps, comms, adjs, balances] = await Promise.all([
        listPayrollEligibleEmployees(branchFilter),
        getPeriodCommissionByEmployee(selectedPeriod.period_start, selectedPeriod.period_end, branchFilter),
        listPayrollAdjustments(selectedPeriod.period_start, branchFilter),
        getAnnualLeaveBalances(selectedPeriod.year, branchFilter),
      ]);
      setEmployees(emps);
      setCommissions(comms);
      setAdjustments(adjs);
      setLeaveBalances(balances);
      // Absensi dimuat terpisah supaya kegagalannya tidak membatalkan data gaji
      try {
        const att = await getAttendanceSummary(branchFilter, selectedPeriod.period_start, selectedPeriod.period_end);
        setAttendanceSummary(att);
      } catch (e) {
        setAttendanceSummary([]);
      }
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, [selectedPeriodId, effectiveBranchId]);

  // Build payroll rows
  const rows = useMemoP(() => {
    return employees.map(emp => {
      const commData = commissions[emp.id];
      const adjData = adjustments.find(a => a.employee_id === emp.id);
      const leaveData = leaveBalances.find(b => b.employee_id === emp.id);
      const payroll = calculatePayroll({ employee: emp, commissions: commData, adjustment: adjData });
      return { employee: emp, payroll, adjustment: adjData, leaveBalance: leaveData };
    });
  }, [employees, commissions, adjustments, leaveBalances]);

  // Totals
  const totals = useMemoP(() => {
    return rows.reduce((acc, r) => ({
      base: acc.base + r.payroll.base_salary_actual,
      meal: acc.meal + r.payroll.meal_allowance,
      bpjs: acc.bpjs + (r.payroll.bpjs_kesehatan || 0),
      commission: acc.commission + r.payroll.treatment_commission + r.payroll.hs_commission,
      tips: acc.tips + (r.payroll.tips || 0),
      bonus: acc.bonus + r.payroll.bonus,
      deduction: acc.deduction + r.payroll.extra_deduction,
      total: acc.total + r.payroll.total,
    }), { base: 0, meal: 0, bpjs: 0, commission: 0, tips: 0, bonus: 0, deduction: 0, total: 0 });
  }, [rows]);

  const scopeLabel = effectiveBranchId
    ? branches.find(b => b.id === effectiveBranchId)?.name
    : (isSuper ? 'Semua Cabang' : '—');

  // Print slip for one employee
  async function handlePrintSlip(row) {
    try {
      const items = await getEmployeePeriodTransactions(
        row.employee.id,
        selectedPeriod.period_start,
        selectedPeriod.period_end
      );
      const tipsDetail = await getEmployeePeriodTips(
        row.employee.id,
        selectedPeriod.period_start,
        selectedPeriod.period_end
      );
      const branch = branches.find(b => b.id === row.employee.branch_id);
      const slipHtml = generateSlipHTML({
        employee: row.employee,
        payroll: row.payroll,
        items,
        period: selectedPeriod,
        branch,
        generatedBy: profile,
        isApproved: row.adjustment?.is_approved === true,
        tipsDetail,
        attendance: attendanceSummary.find(a => a.employee_id === row.employee.id) || null,
      });
      printSlip(slipHtml);
    } catch (err) {
      toast('Gagal generate slip: ' + (err.message || err), 'error');
    }
  }

  // Print all slips at once
  async function handlePrintAllSlips() {
    if (!rows.length) {
      toast('Tidak ada karyawan untuk diprint', 'error');
      return;
    }
    toast('Menyiapkan ' + rows.length + ' slip gaji...', 'success');
    try {
      const slips = [];
      for (const row of rows) {
        const items = await getEmployeePeriodTransactions(
          row.employee.id,
          selectedPeriod.period_start,
          selectedPeriod.period_end
        );
        const tipsDetail = await getEmployeePeriodTips(
          row.employee.id,
          selectedPeriod.period_start,
          selectedPeriod.period_end
        );
        const branch = branches.find(b => b.id === row.employee.branch_id);
        slips.push(generateSlipHTML({
          employee: row.employee,
          payroll: row.payroll,
          items,
          period: selectedPeriod,
          branch,
          generatedBy: profile,
          isApproved: row.adjustment?.is_approved === true,
          tipsDetail,
          attendance: attendanceSummary.find(a => a.employee_id === row.employee.id) || null,
        }));
      }
      printMultipleSlips(slips);
    } catch (err) {
      toast('Gagal generate slip: ' + (err.message || err), 'error');
    }
  }

  // Export payroll to Excel
  function handleExportExcel() {
    if (!rows.length) {
      toast('Tidak ada data untuk diexport', 'error');
      return;
    }
    try {
      exportPayrollToExcel({
        rows,
        periodLabel: selectedPeriod.label,
        branchLabel: scopeLabel,
        totals,
      });
      toast('Excel berhasil di-download ✓', 'success');
    } catch (err) {
      toast('Gagal export: ' + err.message, 'error');
    }
  }

  function openAdjust(row) {
    setAdjustTarget({
      employee: row.employee,
      adjustment: row.adjustment,
      leaveBalance: row.leaveBalance,
    });
  }

  // Approve slip
  async function handleApproveSlip(row) {
    if (!row.adjustment?.id) {
      toast('Slip belum diinput. Klik "Input" dulu untuk set absensi.', 'error');
      return;
    }
    if (!window.confirm(`Approve slip gaji untuk ${row.employee.full_name}?\n\nSetelah approved, slip jadi "OFFICIAL" tanpa watermark PREVIEW. Bisa di-unapprove lagi kalau perlu koreksi.`)) {
      return;
    }
    try {
      await approveSlip(row.adjustment.id);
      toast('Slip approved ✓', 'success');
      loadData();
    } catch (err) {
      toast('Gagal approve: ' + (err.message || err), 'error');
    }
  }

  async function handleUnapproveSlip(row) {
    if (!row.adjustment?.id) return;
    if (!window.confirm(`Un-approve slip ${row.employee.full_name}?\n\nSlip akan kembali ke status PREVIEW.`)) {
      return;
    }
    try {
      await unapproveSlip(row.adjustment.id);
      toast('Slip di-unapprove', 'success');
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  // If admin clicked an employee name, show their dashboard view instead
  if (viewingEmployee) {
    return (
      <AdminEmployeeView
        profile={profile}
        employee={viewingEmployee}
        branches={branches}
        onBack={() => setViewingEmployee(null)}
      />
    );
  }

  return (
    <div className="page">
      <PageHeader title="Rekap Gaji" sub={scopeLabel}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleExportExcel}
          disabled={loading || !rows.length}
        >
          📥 Export Excel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handlePrintAllSlips}
          disabled={loading || !rows.length}
        >
          🖨 Print Semua Slip
        </button>
      </PageHeader>

      <Card title="Pilih Periode" sub="Periode payroll 26 → 25 bulan berikutnya">
        <div className="form-row">
          <Field label="Bulan Gajian">
            <select className="form-select" value={selectedPeriodId}
              onChange={e => setSelectedPeriodId(e.target.value)}>
              {periodOptions.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Periode">
            <input type="text" className="form-input" disabled
              value={selectedPeriod ? `${fmtDate(selectedPeriod.period_start)} – ${fmtDate(selectedPeriod.period_end)}` : ''}
              style={{background:'var(--mauve-tint)',color:'var(--plum)',fontWeight:500}}/>
          </Field>
        </div>
      </Card>

      {/* SUMMARY */}
      <div className="metrics-grid" style={{marginBottom:20}}>
        <Metric label="Total Karyawan" value={loading ? '...' : rows.length} sub="dalam payroll"/>
        <Metric label="Total Gaji Pokok" value={loading ? '...' : fmtRp(totals.base + totals.meal)} sub="setelah pemotongan"/>
        <Metric label="Total Komisi" value={loading ? '...' : fmtRp(totals.commission)} sub="treatment + home service"/>
        {totals.tips > 0 && (
          <Metric label="Total Tips" value={loading ? '...' : fmtRp(totals.tips)} sub="tips dari client"/>
        )}
        <Metric label="Total Payroll" value={loading ? '...' : fmtRp(totals.total)} sub={scopeLabel}/>
      </div>

      <Card title="Detail Per Karyawan" sub="Owner & Manager tidak masuk rekap (profit sharing)">
        {loading ? <Loader text="Menghitung..."/> :
         !rows.length ? <Empty title="Belum ada karyawan" sub="Tambah karyawan dengan jabatan selain Owner/Manager."/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  {isSuper && !effectiveBranchId && <th>Cabang</th>}
                  <th className="table-numeric">Gapok</th>
                  <th className="table-numeric">U. Makan</th>
                  <th className="table-numeric">Komisi Treatment</th>
                  <th className="table-numeric">Komisi HS</th>
                  <th>Absensi</th>
                  <th className="table-numeric">Bonus</th>
                  <th className="table-numeric">Potongan</th>
                  <th className="table-numeric" style={{minWidth:110}}>TOTAL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ employee: emp, payroll: p, adjustment: adj, leaveBalance: lb }) => {
                  const isApproved = adj?.is_approved === true;
                  return (
                  <tr key={emp.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <button
                          type="button"
                          onClick={() => setViewingEmployee(emp)}
                          style={{
                            background:'none',border:'none',padding:0,cursor:'pointer',
                            fontWeight:500,color:'var(--plum-deep)',textAlign:'left',
                            textDecoration:'underline',textDecorationColor:'var(--mauve)',
                            textUnderlineOffset:3,
                            fontFamily:'inherit',fontSize:'inherit',
                          }}
                          title="Klik untuk lihat dashboard karyawan"
                        >
                          {emp.full_name}
                        </button>
                        {isApproved && (
                          <span className="badge" style={{background:'#ecf5ef',color:'#4a7c59',fontSize:9,padding:'2px 8px'}}>✓ Approved</span>
                        )}
                      </div>
                      <span className="badge badge-mauve" style={{fontSize:10,marginTop:4}}>{emp.job_title}</span>
                    </td>
                    {isSuper && !effectiveBranchId && (
                      <td><span className="badge badge-mauve" style={{fontSize:10}}>{emp.branch?.name}</span></td>
                    )}
                    <td className="table-numeric">
                      {p.salary_deduction > 0 ? (
                        <div>
                          <div style={{fontWeight:500}}>{fmtRp(p.base_salary_actual)}</div>
                          <div style={{fontSize:10,color:'var(--red)',fontFamily:'JetBrains Mono, monospace'}}>
                            −{fmtRp(p.salary_deduction)}
                          </div>
                        </div>
                      ) : (
                        fmtRpOrDash(p.base_salary_actual)
                      )}
                    </td>
                    <td className="table-numeric">{fmtRpOrDash(p.meal_allowance)}</td>
                    <td className="table-numeric">
                      <div style={{fontWeight:500,color:'var(--mauve)'}}>{fmtRp(p.treatment_commission)}</div>
                    </td>
                    <td className="table-numeric">
                      {p.hs_commission > 0 ? (
                        <div style={{fontWeight:500,color:'var(--gold)'}}>{fmtRp(p.hs_commission)}</div>
                      ) : (
                        <span style={{color:'var(--muted)'}}>—</span>
                      )}
                    </td>
                    <td style={{fontSize:11}}>
                      {p.annual_leave_days > 0 && <div style={{color:'var(--green)'}}>Cuti: {p.annual_leave_days}h</div>}
                      {p.sick_leave_certified_days > 0 && <div style={{color:'var(--mauve)'}}>Sakit+S: {p.sick_leave_certified_days}h</div>}
                      {p.unpaid_leave_days > 0 && <div style={{color:'var(--red)'}}>Unpaid: {p.unpaid_leave_days}h</div>}
                      {!p.annual_leave_days && !p.sick_leave_certified_days && !p.unpaid_leave_days && (
                        <span style={{color:'var(--muted)'}}>Full</span>
                      )}
                    </td>
                    <td className="table-numeric">{p.bonus > 0 ? <span style={{color:'var(--green)'}}>+{fmtRp(p.bonus)}</span> : '—'}</td>
                    <td className="table-numeric">{p.extra_deduction > 0 ? <span style={{color:'var(--red)'}}>−{fmtRp(p.extra_deduction)}</span> : '—'}</td>
                    <td className="table-numeric" style={{fontWeight:600,fontSize:14,color:'var(--plum-deep)'}}>
                      {fmtRp(p.total)}
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openAdjust({ employee: emp, payroll: p, adjustment: adj, leaveBalance: lb })}>
                          {adj ? 'Edit' : 'Input'}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handlePrintSlip({ employee: emp, payroll: p, adjustment: adj })}
                          title="Print slip gaji karyawan ini"
                        >
                          🖨 Slip
                        </button>
                        {isApproved ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleUnapproveSlip({ employee: emp, adjustment: adj })}
                            title="Un-approve slip (kembali ke PREVIEW)"
                            style={{color:'var(--red)'}}
                          >
                            ↺ Un-approve
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleApproveSlip({ employee: emp, adjustment: adj })}
                            title="Approve slip (jadi OFFICIAL tanpa watermark)"
                            disabled={!adj}
                          >
                            ✓ Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}

                {/* TOTAL ROW */}
                <tr style={{background:'var(--mauve-tint)',fontWeight:600}}>
                  <td colSpan={isSuper && !effectiveBranchId ? 2 : 1} style={{fontWeight:600}}>TOTAL</td>
                  <td className="table-numeric">{fmtRp(totals.base)}</td>
                  <td className="table-numeric">{fmtRp(totals.meal)}</td>
                  <td className="table-numeric" style={{color:'var(--mauve)'}}>{fmtRp(totals.commission)}</td>
                  <td></td>
                  <td className="table-numeric" style={{color:'var(--green)'}}>{totals.bonus > 0 ? `+${fmtRp(totals.bonus)}` : '—'}</td>
                  <td className="table-numeric" style={{color:'var(--red)'}}>{totals.deduction > 0 ? `−${fmtRp(totals.deduction)}` : '—'}</td>
                  <td className="table-numeric" style={{fontSize:15,color:'var(--plum-deep)'}}>{fmtRp(totals.total)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AdjustAttendanceModal
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onSuccess={loadData}
        employee={adjustTarget?.employee}
        period={selectedPeriod}
        currentAdjustment={adjustTarget?.adjustment}
        leaveBalance={adjustTarget?.leaveBalance}
        attendance={attendanceSummary.find(a => a.employee_id === adjustTarget?.employee?.id) || null}
        branchId={adjustTarget?.employee?.branch_id}
        adjustedBy={profile.id}
      />
    </div>
  );
}

// =====================================================
// AUDIT LOG PAGE — Tahap C2.5 (super_admin only)
// =====================================================
function AuditLogPage({ profile, branches }) {
  const [logs, setLogs] = useStateP([]);
  const [summary, setSummary] = useStateP(null);
  const [loading, setLoading] = useStateP(true);
  const [expandedId, setExpandedId] = useStateP(null);

  // Filters
  const [filterTable, setFilterTable] = useStateP('');
  const [filterAction, setFilterAction] = useStateP('');
  const [filterBranch, setFilterBranch] = useStateP('');
  const [filterDays, setFilterDays] = useStateP(7);

  const TABLE_OPTIONS = [
    { value: '', label: '— Semua —' },
    { value: 'transactions', label: 'Transaksi' },
    { value: 'transaction_items', label: 'Detail Treatment' },
    { value: 'employees', label: 'Karyawan' },
    { value: 'payroll_adjustments', label: 'Penyesuaian Gaji' },
    { value: 'clients', label: 'Pelanggan' },
  ];

  async function loadData() {
    setLoading(true);
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(filterDays));
      const dateFromIso = dateFrom.toISOString();

      const [logsData, summaryData] = await Promise.all([
        listAuditLog({
          limit: 200,
          tableName: filterTable || null,
          action: filterAction || null,
          branchId: filterBranch || null,
          dateFrom: dateFromIso,
        }),
        getAuditSummary(Number(filterDays)),
      ]);

      setLogs(logsData);
      setSummary(summaryData);
    } catch (err) {
      toast('Gagal memuat audit log: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, [filterTable, filterAction, filterBranch, filterDays]);

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  function fmtTimestamp(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
  }

  function describeLog(log) {
    const action = getActionLabel(log.action);
    const tableLabel = log.table_label || log.table_name;
    const user = log.changed_by_name || '—';

    if (log.action === 'INSERT') {
      const name = log.new_data?.full_name || log.new_data?.service_name || log.new_data?.client_name_snapshot || log.new_data?.id?.slice(0, 8);
      return `${user} menambah ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
    }
    if (log.action === 'DELETE') {
      const name = log.old_data?.full_name || log.old_data?.service_name || log.old_data?.client_name_snapshot || log.old_data?.id?.slice(0, 8);
      return `${user} menghapus ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
    }
    if (log.action === 'UPDATE') {
      const name = log.new_data?.full_name || log.new_data?.service_name || log.new_data?.client_name_snapshot || log.new_data?.id?.slice(0, 8);
      // Input-time UPDATE = side effect of creating the record, not a real edit
      if (log.is_input_side_effect) {
        return `${user} input ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
      }
      const fields = (log.changed_fields || []).map(getFieldLabel).join(', ');
      return `${user} mengubah ${fields || 'data'} di ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
    }
    return '—';
  }

  return (
    <div className="page">
      <PageHeader title="Riwayat Perubahan" sub="Audit Log JBB Group"/>

      <div style={{marginBottom:20,padding:'12px 16px',background:'var(--mauve-tint)',borderRadius:10,fontSize:13,color:'var(--plum)',lineHeight:1.6}}>
        <strong>🔒 Audit Log Otomatis:</strong> setiap perubahan data (input transaksi, edit karyawan, hapus, dll) tercatat di sini dengan timestamp & siapa yang melakukan. Tidak bisa dihapus atau dimanipulasi.
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="metrics-grid" style={{marginBottom:20}}>
          <Metric label="Total Perubahan" value={summary.total_changes} sub={`dalam ${filterDays} hari`}/>
          <Metric label="Penambahan" value={summary.inserts} sub="INSERT"/>
          <Metric label="Editing" value={summary.updates} sub="UPDATE"/>
          <Metric label="Penghapusan" value={summary.deletes} sub="DELETE"/>
        </div>
      )}

      {/* FILTERS */}
      <Card title="Filter">
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              type="button"
              className={'btn btn-sm ' + (filterDays === d ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setFilterDays(d)}
            >
              {d} hari
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
          <Field label="Tabel">
            <select className="form-select" value={filterTable} onChange={e => setFilterTable(e.target.value)}>
              {TABLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Aksi">
            <select className="form-select" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
              <option value="">— Semua —</option>
              <option value="INSERT">Tambah (INSERT)</option>
              <option value="UPDATE">Edit (UPDATE)</option>
              <option value="DELETE">Hapus (DELETE)</option>
            </select>
          </Field>
          <Field label="Cabang">
            <select className="form-select" value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
              <option value="">— Semua Cabang —</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      {/* LOG TIMELINE */}
      <Card title="Log Perubahan" sub={`${logs.length} entri terbaru`}>
        {loading ? <Loader text="Memuat audit log..."/> :
         !logs.length ? <Empty title="Belum ada log" sub="Tidak ada perubahan data dalam periode ini."/> : (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {logs.map(log => {
              const isExpanded = expandedId === log.id;
              const diff = formatAuditDiff(log.old_data, log.new_data, log.changed_fields);

              return (
                <div key={log.id} style={{
                  border:'1px solid var(--line)',
                  borderRadius:10,
                  background:'var(--paper)',
                  overflow:'hidden',
                }}>
                  {/* Header row (clickable) */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    style={{
                      padding:'12px 14px',
                      cursor:'pointer',
                      display:'flex',
                      gap:12,
                      alignItems:'flex-start',
                    }}
                  >
                    <span className={'badge ' + (log.is_input_side_effect ? 'badge-green' : getActionBadge(log.action))} style={{minWidth:55,textAlign:'center'}}>
                      {log.is_input_side_effect ? 'Input' : getActionLabel(log.action)}
                    </span>

                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:'var(--plum-deep)',marginBottom:2}}>
                        {describeLog(log)}
                      </div>
                      <div style={{fontSize:11,color:'var(--muted)',display:'flex',gap:10,flexWrap:'wrap',fontFamily:'JetBrains Mono, monospace'}}>
                        <span>{fmtTimestamp(log.created_at)}</span>
                        {log.branch_name && <span>• {log.branch_name}</span>}
                        {log.changed_by_role && <span>• {log.changed_by_role}</span>}
                      </div>
                    </div>

                    <span style={{
                      color:'var(--muted)',
                      fontSize:14,
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition:'transform 0.2s',
                    }}>▶</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      padding:'12px 14px',
                      borderTop:'1px solid var(--line)',
                      background:'var(--cream)',
                      fontSize:12,
                    }}>
                      {log.action === 'UPDATE' && diff.length > 0 && (
                        <>
                          <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>Detail Perubahan</div>
                          <table style={{width:'100%',fontSize:12,borderCollapse:'collapse'}}>
                            <thead>
                              <tr style={{borderBottom:'1px solid var(--line)'}}>
                                <th style={{textAlign:'left',padding:'6px 8px',color:'var(--muted)',fontWeight:500}}>Field</th>
                                <th style={{textAlign:'left',padding:'6px 8px',color:'var(--red)',fontWeight:500}}>Sebelum</th>
                                <th style={{textAlign:'left',padding:'6px 8px',color:'var(--green)',fontWeight:500}}>Sesudah</th>
                              </tr>
                            </thead>
                            <tbody>
                              {diff.map(d => (
                                <tr key={d.field} style={{borderBottom:'1px solid var(--line)'}}>
                                  <td style={{padding:'6px 8px',fontWeight:500}}>{getFieldLabel(d.field)}</td>
                                  <td style={{padding:'6px 8px',color:'var(--red)',textDecoration:'line-through',opacity:0.7}}>
                                    {formatAuditValue(d.field, d.old)}
                                  </td>
                                  <td style={{padding:'6px 8px',color:'var(--green)',fontWeight:500}}>
                                    {formatAuditValue(d.field, d.new)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}

                      {log.action === 'INSERT' && log.new_data && (
                        <>
                          <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>Data yang Ditambahkan</div>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>
                            {Object.entries(log.new_data)
                              .filter(([k]) => !['id','created_at','updated_at','adjusted_at'].includes(k))
                              .slice(0, 12)
                              .map(([k, v]) => (
                                <div key={k}>
                                  <div style={{fontSize:10,color:'var(--muted)',marginBottom:2}}>{getFieldLabel(k)}</div>
                                  <div style={{fontWeight:500}}>{formatAuditValue(k, v)}</div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}

                      {log.action === 'DELETE' && log.old_data && (
                        <>
                          <div className="eyebrow" style={{fontSize:9,marginBottom:8,color:'var(--red)'}}>⚠️ Data yang Dihapus</div>
                          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8,opacity:0.85}}>
                            {Object.entries(log.old_data)
                              .filter(([k]) => !['id','created_at','updated_at','adjusted_at'].includes(k))
                              .slice(0, 12)
                              .map(([k, v]) => (
                                <div key={k}>
                                  <div style={{fontSize:10,color:'var(--muted)',marginBottom:2}}>{getFieldLabel(k)}</div>
                                  <div style={{fontWeight:500,textDecoration:'line-through'}}>{formatAuditValue(k, v)}</div>
                                </div>
                              ))}
                          </div>
                        </>
                      )}

                      {/* Footer with technical details */}
                      <div style={{
                        marginTop:12,
                        paddingTop:10,
                        borderTop:'1px solid var(--line)',
                        fontSize:10,
                        color:'var(--muted)',
                        fontFamily:'JetBrains Mono, monospace',
                        display:'flex',
                        gap:14,
                        flexWrap:'wrap',
                      }}>
                        <span>ID: {log.record_id?.slice(0,8) || '—'}</span>
                        <span>Table: {log.table_name}</span>
                        <span>By: {log.changed_by_name || 'unknown'} ({log.changed_by_role || '—'})</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// =====================================================
// TAHAP D — Shared Dashboard Component
// Used by both Employee (self-view) and Admin (viewing employee)
// =====================================================
function EmployeeDashboardView({
  employee,
  profile,
  isAdminViewing = false,  // true = admin viewing this employee; false = self-view
  branches = [],
  onBack = null,           // for admin: function to go back
  onViewTransactions = null,
  onViewPayroll = null,
}) {
  const [stats, setStats] = useStateP(null);
  const [topServices, setTopServices] = useStateP([]);
  const [topClients, setTopClients] = useStateP([]);
  const [adjustment, setAdjustment] = useStateP(null);
  const [leaveBalance, setLeaveBalance] = useStateP(null);
  const [loading, setLoading] = useStateP(true);

  const branch = useMemoP(
    () => branches.find(b => b.id === employee.branch_id) || employee.branch,
    [branches, employee]
  );

  async function loadData() {
    setLoading(true);
    try {
      const period = getPayrollPeriod();
      const year = new Date().getFullYear();

      if (isAdminViewing) {
        // Admin view: use admin functions (full data)
        const [statsData, services, clients, adj, balance] = await Promise.all([
          getEmployeeDashboardStatsAdmin(employee.id),
          getEmployeeTopServicesAdmin(employee.id, 3),
          getEmployeeTopClientsAdmin(employee.id, 3),
          getPayrollAdjustment(employee.id, period.period_start),
          getAnnualLeaveBalanceForEmployee(employee.id, year),
        ]);
        setStats(statsData);
        setTopServices(services);
        setTopClients(clients);
        setAdjustment(adj);
        setLeaveBalance(balance);
      } else {
        // Self view: use self-view functions (privacy filtered)
        const [statsData, services, clients, adj, balance] = await Promise.all([
          getMyDashboardStats(),
          getMyTopServices(3),
          getMyTopClients(3),
          getPayrollAdjustment(employee.id, period.period_start),
          getAnnualLeaveBalanceForEmployee(employee.id, year),
        ]);
        setStats(statsData);
        setTopServices(services);
        setTopClients(clients);
        setAdjustment(adj);
        setLeaveBalance(balance);
      }
    } catch (err) {
      toast('Gagal memuat dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, [employee.id, isAdminViewing]);

  // Calculate estimated payroll for current period
  const estimatedPayroll = useMemoP(() => {
    if (!stats) return null;
    const commissions = {
      treatment_commission: stats.period_commission || 0,
      hs_commission: 0, // will be included in treatment_commission already from view
    };
    return calculatePayroll({
      employee,
      commissions,
      adjustment,
    });
  }, [stats, adjustment, employee]);

  // Annual leave info
  const leaveQuota = leaveBalance?.total_quota || 7;
  const leaveUsed = leaveBalance?.used_days || 0;
  const leaveRemaining = Math.max(0, leaveQuota - leaveUsed);
  const leaveProgressPct = Math.min(100, (leaveUsed / leaveQuota) * 100);

  const firstName = employee.full_name?.split(' ')[0] || 'Karyawan';
  const periodLabel = stats
    ? `${fmtDate(stats.period_start)} – ${fmtDate(stats.period_end)}`
    : '';

  // Determine if slip is approved
  const isApproved = adjustment?.is_approved === true;

  // Handle slip printing (only available for self-view in this dashboard)
  async function handlePrintMySlip() {
    if (!employee) return;
    try {
      const period = getPayrollPeriod();
      const items = await getEmployeePeriodTransactions(
        employee.id,
        period.period_start,
        period.period_end
      );
      const tipsDetail = await getEmployeePeriodTips(
        employee.id,
        period.period_start,
        period.period_end
      );
      const totalTips = tipsDetail.reduce((s, t) => s + Number(t.amount || 0), 0);
      const slipHtml = generateSlipHTML({
        employee,
        payroll: estimatedPayroll ? { ...estimatedPayroll, tips: estimatedPayroll.tips != null ? estimatedPayroll.tips : totalTips } : {
          base_salary: Number(employee.base_salary) || 0,
          base_salary_actual: Number(employee.base_salary) || 0,
          salary_deduction: 0,
          meal_allowance: Number(employee.meal_allowance) || 0,
          bpjs_kesehatan: 0,
          treatment_commission: stats?.period_commission || 0,
          hs_commission: 0,
          tips: totalTips,
          annual_leave_days: 0,
          sick_leave_certified_days: 0,
          unpaid_leave_days: 0,
          standard_work_days: 26,
          bonus: 0,
          extra_deduction: 0,
          total_before_deduction: (Number(employee.base_salary) || 0) + (Number(employee.meal_allowance) || 0) + (stats?.period_commission || 0) + totalTips,
          total: (Number(employee.base_salary) || 0) + (Number(employee.meal_allowance) || 0) + (stats?.period_commission || 0) + totalTips,
        },
        items,
        period,
        branch,
        generatedBy: profile,
        isApproved,
        tipsDetail,
      });
      printSlip(slipHtml);
    } catch (err) {
      toast('Gagal generate slip: ' + (err.message || err), 'error');
    }
  }

  return (
    <div className="page">
      {isAdminViewing && onBack && (
        <div style={{padding:'12px 16px',background:'var(--gold)',background:'linear-gradient(135deg, #fdf6e3, #f7efe0)',borderRadius:10,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13,color:'var(--plum-deep)',flexWrap:'wrap',gap:10}}>
          <span>🔍 <strong>Mode Lihat:</strong> {employee.full_name} ({employee.job_title}) — sebagai {getRoleLabel(profile.role)}</span>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Kembali</button>
        </div>
      )}

      <PageHeader
        title={isAdminViewing ? `Dashboard ${firstName}` : `Halo, ${firstName}`}
        sub={`${employee.job_title || ''} · ${branch?.name || '—'}`}
      />

      {loading ? <Card><Loader text="Memuat dashboard..."/></Card> : (
        <>
          {/* TODAY METRICS */}
          <div style={{marginBottom:8}}>
            <span className="eyebrow">Hari Ini</span>
          </div>
          <div className="metrics-grid" style={{marginBottom:20}}>
            <Metric label="Omset Hari Ini" value={fmtRp(stats?.today_revenue || 0)} sub={`${stats?.today_trx_count || 0} transaksi`}/>
            <Metric label="Komisi Hari Ini" value={fmtRp(stats?.today_commission || 0)} sub={`${stats?.today_item_count || 0} treatment`}/>
            <Metric label="Omset Minggu Ini" value={fmtRp(stats?.week_revenue || 0)} sub="Senin – sekarang"/>
            <Metric label="Komisi Minggu Ini" value={fmtRp(stats?.week_commission || 0)} sub={`${stats?.week_trx_count || 0} transaksi`}/>
          </div>

          {/* CURRENT PERIOD PAYROLL ESTIMATE */}
          <Card
            title={`Estimasi Gaji Periode Ini${isApproved ? ' · ✓ Disetujui' : ' · Preview'}`}
            sub={periodLabel}
          >
            {!estimatedPayroll ? <Empty title="Belum ada data" sub="Estimasi gaji akan muncul setelah ada transaksi."/> : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:18}}>
                  <Metric label="Gaji Pokok" value={fmtRp(estimatedPayroll.base_salary_actual)}
                    sub={estimatedPayroll.salary_deduction > 0 ? `−${fmtRp(estimatedPayroll.salary_deduction)} potongan` : 'full'}/>
                  <Metric label="Uang Makan" value={fmtRp(estimatedPayroll.meal_allowance)}/>
                  <Metric label="Komisi Treatment" value={fmtRp(estimatedPayroll.treatment_commission)}
                    sub={`${stats?.period_trx_count || 0} transaksi`}/>
                  <Metric label="Estimasi Total" value={fmtRp(estimatedPayroll.total)} sub="real-time"/>
                </div>

                <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:isAdminViewing ? 'flex-start' : 'space-between',alignItems:'center'}}>
                  {!isAdminViewing && (
                    <button className="btn btn-primary btn-sm" onClick={handlePrintMySlip}>
                      🖨 Print Slip Gaji {!isApproved && '(Preview)'}
                    </button>
                  )}
                  {isAdminViewing && onViewPayroll && (
                    <button className="btn btn-primary btn-sm" onClick={onViewPayroll}>
                      💰 Lihat Detail Gaji
                    </button>
                  )}
                  <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>
                    {isApproved ? (
                      <>✓ Slip sudah di-approve admin · final</>
                    ) : (
                      <>⚠️ Estimasi real-time, belum di-approve admin</>
                    )}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* ANNUAL LEAVE */}
          <Card title="Cuti Tahunan" sub={`Tahun ${new Date().getFullYear()}`}>
            <div style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap',marginBottom:14}}>
              <div>
                <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:40,fontWeight:400,color:'var(--plum-deep)',lineHeight:1}}>
                  {leaveRemaining}
                </div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>hari tersisa</div>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)',marginBottom:6}}>
                  <span>Terpakai: {leaveUsed} hari</span>
                  <span>Jatah: {leaveQuota} hari</span>
                </div>
                <div style={{height:8,background:'var(--mauve-tint)',borderRadius:8,overflow:'hidden'}}>
                  <div style={{
                    width: `${leaveProgressPct}%`,
                    height:'100%',
                    background: leaveProgressPct >= 100 ? 'var(--red)' : leaveProgressPct >= 80 ? 'var(--amber)' : 'var(--mauve)',
                    transition: 'width 0.3s',
                  }}/>
                </div>
                <div style={{fontSize:10,color:'var(--muted)',marginTop:6,fontStyle:'italic'}}>
                  Aturan JBB: cuti tahunan 7 hari/tahun, lapor minimal H-1. Tidak potong gaji.
                </div>
              </div>
            </div>
          </Card>

          {/* TOP SERVICES */}
          {topServices.length > 0 && (
            <Card title="Treatment Favorit" sub="3 bulan terakhir">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Treatment</th>
                      <th>Kategori</th>
                      <th className="table-numeric">Jumlah</th>
                      <th className="table-numeric">Revenue</th>
                      <th className="table-numeric">Komisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topServices.map((s, i) => (
                      <tr key={i}>
                        <td style={{fontWeight:500}}>{s.service_name}</td>
                        <td><span className="badge badge-mauve">{s.service_category}</span></td>
                        <td className="table-numeric">{s.count_done}x</td>
                        <td className="table-numeric">{fmtRp(s.total_revenue)}</td>
                        <td className="table-numeric" style={{color:'var(--mauve)',fontWeight:500}}>{fmtRp(s.total_commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TOP CLIENTS */}
          {topClients.length > 0 && (
            <Card title="Pelanggan Setia" sub={isAdminViewing ? "Nama lengkap (admin view)" : "Nama depan saja"}>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Nama</th>
                      {isAdminViewing && <th>HP</th>}
                      <th className="table-numeric">Kunjungan</th>
                      <th className="table-numeric">Total Belanja</th>
                      <th className="table-numeric">Komisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <span style={{
                            display:'inline-flex',alignItems:'center',justifyContent:'center',
                            width:24,height:24,borderRadius:12,
                            background: i === 0 ? 'var(--gold)' : 'var(--cream)',
                            color: i === 0 ? '#fff' : 'var(--plum)',
                            fontWeight:600,fontSize:12,
                            fontFamily:'JetBrains Mono, monospace',
                          }}>{i+1}</span>
                        </td>
                        <td style={{fontWeight:500}}>
                          {isAdminViewing ? c.client_name : c.client_first_name}
                        </td>
                        {isAdminViewing && (
                          <td>
                            <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:11,color:'var(--muted)'}}>
                              {c.client_phone || '—'}
                            </span>
                          </td>
                        )}
                        <td className="table-numeric">{c.visit_count}x</td>
                        <td className="table-numeric" style={{fontWeight:500}}>{fmtRp(c.total_spent)}</td>
                        <td className="table-numeric" style={{color:'var(--mauve)'}}>{fmtRp(c.total_commission_earned)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* QUICK ACCESS - only for employee self-view */}
          {!isAdminViewing && onViewTransactions && (
            <Card>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button className="btn btn-ghost" onClick={onViewTransactions}>
                  📋 Lihat Semua Transaksi Saya
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// =====================================================
// TAHAP D — Employee Transactions Page (3 months history)
// =====================================================
function MyTransactionsPage({ profile }) {
  const [transactions, setTransactions] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [presetId, setPresetId] = useStateP('thisMonth');

  async function loadData() {
    setLoading(true);
    try {
      const data = await getMyRecentTransactions(200);
      setTransactions(data);
    } catch (err) {
      toast('Gagal memuat transaksi: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, []);

  // Filter by date preset
  const filteredTransactions = useMemoP(() => {
    if (!transactions.length) return [];
    const preset = DATE_PRESETS.find(p => p.id === presetId);
    if (!preset || preset.id === 'custom') return transactions;
    const range = preset.getRange();
    return transactions.filter(t => t.date >= range.from && t.date <= range.to);
  }, [transactions, presetId]);

  // Aggregate
  const totals = useMemoP(() => {
    return filteredTransactions.reduce((acc, t) => ({
      revenue: acc.revenue + (Number(t.price) || 0),
      commission: acc.commission + (Number(t.commission_amount) || 0),
      count: acc.count + 1,
    }), { revenue: 0, commission: 0, count: 0 });
  }, [filteredTransactions]);

  const firstName = profile.full_name?.split(' ')[0] || 'Karyawan';

  return (
    <div className="page">
      <PageHeader title="Transaksi Saya" sub={`${firstName} · 3 bulan terakhir`}/>

      <Card title="Filter Periode">
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {DATE_PRESETS.filter(p => p.id !== 'custom').map(p => (
            <button
              key={p.id}
              type="button"
              className={'btn btn-sm ' + (presetId === p.id ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setPresetId(p.id)}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className={'btn btn-sm ' + (presetId === 'all3mo' ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setPresetId('all3mo')}
          >
            3 Bulan Penuh
          </button>
        </div>
      </Card>

      <div className="metrics-grid" style={{marginBottom:20}}>
        <Metric label="Total Treatment" value={loading ? '...' : totals.count} sub="dalam periode"/>
        <Metric label="Revenue Saya Kerjakan" value={loading ? '...' : fmtRp(totals.revenue)}/>
        <Metric label="Komisi Saya" value={loading ? '...' : fmtRp(totals.commission)}/>
      </div>

      <Card title="Detail Transaksi" sub="Nomor HP klien tidak ditampilkan untuk privasi">
        {loading ? <Loader text="Memuat..."/> :
         !filteredTransactions.length ? <Empty title="Tidak ada transaksi" sub="Belum ada transaksi di periode ini."/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jam</th>
                  <th>Pelanggan</th>
                  <th>Treatment</th>
                  <th>Tipe</th>
                  <th className="table-numeric">Harga</th>
                  <th className="table-numeric">Komisi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.item_id}>
                    <td style={{fontFamily:'JetBrains Mono, monospace',fontSize:11}}>{fmtDate(t.date)}</td>
                    <td style={{fontFamily:'JetBrains Mono, monospace',fontSize:11,color:'var(--muted)'}}>{fmtTime(t.start_time)}</td>
                    <td style={{fontWeight:500}}>{t.client_first_name || '—'}</td>
                    <td>{t.service_name}</td>
                    <td>
                      {t.is_overtime && <span className="badge" style={{background:'#fdf6e3',color:'#b8893d',fontSize:9}}>lembur</span>}
                      {t.is_home_service && <span className="badge" style={{background:'#f7efe0',color:'#a8884a',fontSize:9,marginLeft:4}}>HS</span>}
                      {!t.is_overtime && !t.is_home_service && <span style={{color:'var(--muted)',fontSize:11}}>normal</span>}
                    </td>
                    <td className="table-numeric">{fmtRp(t.price)}</td>
                    <td className="table-numeric" style={{color:'var(--mauve)',fontWeight:500}}>{fmtRp(t.commission_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// =====================================================
// TAHAP D — Employee Salary Page (current period only)
// =====================================================
function MySalaryPage({ profile, branches }) {
  return (
    <EmployeeDashboardView
      employee={profile}
      profile={profile}
      isAdminViewing={false}
      branches={branches}
    />
  );
}

// =====================================================
// TAHAP D — Employee Dashboard (self)
// =====================================================
function EmployeeDashboard({ profile, branches, setPage }) {
  return (
    <EmployeeDashboardView
      employee={profile}
      profile={profile}
      isAdminViewing={false}
      branches={branches}
      onViewTransactions={() => setPage && setPage('myTransactions')}
    />
  );
}

// =====================================================
// TAHAP D — Admin Viewing Employee Dashboard
// =====================================================
function AdminEmployeeView({ profile, employee, branches, onBack, setPage }) {
  return (
    <EmployeeDashboardView
      employee={employee}
      profile={profile}
      isAdminViewing={true}
      branches={branches}
      onBack={onBack}
      onViewPayroll={() => setPage && setPage('payroll')}
    />
  );
}

// =====================================================
// PHOTO UPLOAD FIELD — Tahap E
// Reusable photo upload widget (camera + gallery)
// =====================================================
function PhotoUploadField({ label, hint, photoType, existingPhoto, onUploaded, onDeleted, transactionId, branchId, disabled = false, required = false }) {
  const [uploading, setUploading] = useStateP(false);
  const [previewUrl, setPreviewUrl] = useStateP(null);
  const cameraInputRef = useRefP(null);
  const galleryInputRef = useRefP(null);

  // Update preview when existingPhoto changes
  useEffectP(() => {
    if (existingPhoto?.signedUrl) {
      setPreviewUrl(existingPhoto.signedUrl);
    } else if (!existingPhoto) {
      setPreviewUrl(null);
    }
  }, [existingPhoto]);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('File harus berupa gambar', 'error');
      return;
    }

    if (!transactionId) {
      toast('Transaksi belum tersimpan. Simpan transaksi dulu, lalu upload foto.', 'error');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = ev => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(file);

      // Delete existing photo first (if any, since we have unique constraint)
      if (existingPhoto?.id) {
        await deleteTreatmentPhoto(existingPhoto.id);
      }

      // Upload
      const photo = await uploadTreatmentPhoto({
        transactionId,
        branchId,
        photoType,
        file,
      });

      toast(`Foto ${photoType} berhasil diupload ✓`, 'success');

      // Get fresh signed URL
      const photos = await getTransactionPhotos(transactionId);
      const fresh = photos.find(p => p.id === photo.id);
      if (fresh) {
        setPreviewUrl(fresh.signedUrl);
        onUploaded?.(fresh);
      } else {
        onUploaded?.(photo);
      }
    } catch (err) {
      toast('Gagal upload: ' + (err.message || err), 'error');
      setPreviewUrl(existingPhoto?.signedUrl || null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete() {
    if (!existingPhoto?.id) return;
    if (!window.confirm(`Hapus foto ${photoType}?`)) return;

    try {
      await deleteTreatmentPhoto(existingPhoto.id);
      setPreviewUrl(null);
      toast('Foto dihapus', 'success');
      onDeleted?.();
    } catch (err) {
      toast('Gagal hapus foto: ' + (err.message || err), 'error');
    }
  }

  return (
    <div style={{marginBottom:14}}>
      <div className="eyebrow" style={{fontSize:9,marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
        {label}
        {required && <span style={{color:'var(--red)'}}>*</span>}
        {existingPhoto && <span className="badge" style={{background:'#ecf5ef',color:'#4a7c59',fontSize:9}}>✓ Uploaded</span>}
      </div>

      {hint && <div style={{fontSize:11,color:'var(--muted)',marginBottom:8,lineHeight:1.5}}>{hint}</div>}

      <div style={{
        border:'2px dashed',
        borderColor: existingPhoto ? 'var(--green)' : (required ? 'var(--amber)' : 'var(--line)'),
        borderRadius:10,
        padding:previewUrl ? 8 : 20,
        background: existingPhoto ? '#f4f9f5' : 'var(--cream)',
        position:'relative',
        textAlign:'center',
        minHeight:previewUrl ? 'auto' : 140,
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
      }}>
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`${photoType} preview`}
              style={{
                maxWidth:'100%',
                maxHeight:200,
                borderRadius:8,
                objectFit:'contain',
                display:'block',
              }}
            />
            <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap',justifyContent:'center'}}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading || disabled}
                title="Ambil foto dengan kamera"
              >
                📷 Kamera
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading || disabled}
                title="Pilih dari galeri / file"
              >
                🖼 Galeri
              </button>
              {existingPhoto && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleDelete}
                  disabled={uploading || disabled}
                  style={{color:'var(--red)'}}
                >
                  🗑 Hapus
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{fontSize:36,marginBottom:8}}>📸</div>
            <div style={{fontSize:13,color:'var(--plum)',marginBottom:4,fontWeight:500}}>
              {photoType === 'before' ? 'Foto Sebelum Treatment' : 'Foto Hasil Treatment'}
            </div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:14,lineHeight:1.4,maxWidth:300}}>
              {photoType === 'after'
                ? 'Wajib upload sebagai bukti hasil. Bisa pakai kamera HP atau pilih dari galeri.'
                : 'Optional. Foto sebelum treatment kalau sempat.'}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading || disabled || !transactionId}
                title="Ambil foto dengan kamera"
              >
                {uploading ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : '📷 Kamera'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading || disabled || !transactionId}
                title="Pilih dari galeri / file"
              >
                🖼 Galeri
              </button>
            </div>
            {!transactionId && (
              <div style={{fontSize:10,color:'var(--muted)',marginTop:8,fontStyle:'italic'}}>
                Simpan transaksi dulu untuk upload foto
              </div>
            )}
          </>
        )}

        {uploading && (
          <div style={{
            position:'absolute',inset:0,
            background:'rgba(255,255,255,0.85)',
            display:'flex',alignItems:'center',justifyContent:'center',
            borderRadius:10,
          }}>
            <div style={{textAlign:'center'}}>
              <div className="loader"/>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:8}}>Mengupload & compress...</div>
            </div>
          </div>
        )}

        {/* Camera input - forces camera on mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{display:'none'}}
          disabled={uploading || disabled}
        />

        {/* Gallery input - shows file picker (works on desktop + mobile gallery) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{display:'none'}}
          disabled={uploading || disabled}
        />
      </div>
    </div>
  );
}

// =====================================================
// PHOTO GALLERY MODAL — Lihat semua foto sebuah transaksi
// =====================================================
function PhotoGalleryModal({ open, transactionId, profile, onClose }) {
  const [photos, setPhotos] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [trx, setTrx] = useStateP(null);
  const [skipReason, setSkipReason] = useStateP('');
  const [editingSkipReason, setEditingSkipReason] = useStateP(false);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'branch_admin';

  async function loadData() {
    if (!transactionId) return;
    setLoading(true);
    try {
      const [photosData, trxData] = await Promise.all([
        getTransactionPhotos(transactionId),
        getTransactionDetail(transactionId),
      ]);
      setPhotos(photosData);
      setTrx(trxData);
      setSkipReason(trxData?.photo_skip_reason || '');
    } catch (err) {
      toast('Gagal memuat foto: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => {
    if (open) loadData();
  }, [open, transactionId]);

  const beforePhoto = photos.find(p => p.photo_type === 'before');
  const afterPhoto = photos.find(p => p.photo_type === 'after');

  async function handleMarkMarketing(photo, approved) {
    try {
      await markPhotoMarketing(photo.id, approved);
      toast(approved ? 'Foto ditandai untuk marketing ✓' : 'Tanda marketing dihapus', 'success');
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  async function saveSkipReason() {
    try {
      await updatePhotoSkipReason(transactionId, skipReason || null);
      toast('Alasan disimpan', 'success');
      setEditingSkipReason(false);
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  function downloadPhoto(photo) {
    if (!photo.signedUrl) return;
    const a = document.createElement('a');
    a.href = photo.signedUrl;
    a.download = `${trx?.client_name_snapshot || 'foto'}_${photo.photo_type}_${trx?.date}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function shareWA(photo) {
    if (!photo.signedUrl) return;
    // Simple share: open WhatsApp web with text + link
    const text = encodeURIComponent(`Foto hasil treatment ${photo.photo_type === 'after' ? 'after' : 'before'} di JBB. Lihat: ${photo.signedUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  if (!open) return null;

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(36,26,44,0.7)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:20,backdropFilter:'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background:'var(--paper)',borderRadius:20,padding:28,
        width:'100%',maxWidth:820,maxHeight:'92vh',overflowY:'auto',
        boxShadow:'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
          <div>
            <div className="eyebrow" style={{marginBottom:6}}>📸 Foto Treatment</div>
            <h2 style={{fontFamily:'Cormorant Garamond, serif',fontSize:24,fontWeight:400,color:'var(--plum-deep)'}}>
              {trx?.client_name_snapshot || 'Memuat...'}
            </h2>
            {trx && (
              <p style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
                {fmtDate(trx.date)} · {fmtTime(trx.start_time)} · {trx.branch?.name}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        {loading ? <Loader text="Memuat foto..."/> : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,marginBottom:18}}>
              {/* Before Photo */}
              <div>
                <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>
                  Foto Before
                  {!beforePhoto && <span style={{color:'var(--muted)',marginLeft:6}}>(tidak ada)</span>}
                </div>
                {beforePhoto?.signedUrl ? (
                  <div style={{borderRadius:10,overflow:'hidden',background:'var(--cream)'}}>
                    <img src={beforePhoto.signedUrl} alt="Before"
                      style={{width:'100%',display:'block',maxHeight:400,objectFit:'contain'}}/>
                    <div style={{padding:10,display:'flex',gap:6,flexWrap:'wrap',background:'var(--paper)'}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => downloadPhoto(beforePhoto)}>⬇ Download</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => shareWA(beforePhoto)}>💬 WA</button>
                      {isAdmin && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleMarkMarketing(beforePhoto, !beforePhoto.is_marketing_approved)}
                          style={beforePhoto.is_marketing_approved ? {color:'var(--gold)'} : {}}
                        >
                          {beforePhoto.is_marketing_approved ? '⭐ Marketing ON' : '☆ Mark Marketing'}
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          if (!window.confirm('Hapus foto before?')) return;
                          try {
                            await deleteTreatmentPhoto(beforePhoto.id);
                            toast('Foto before dihapus', 'success');
                            loadData();
                          } catch (err) { toast('Gagal: '+err.message, 'error'); }
                        }}
                        style={{color:'var(--red)'}}
                      >
                        🗑 Hapus
                      </button>
                    </div>
                    <div style={{padding:'4px 10px 10px',fontSize:10,color:'var(--muted)'}}>
                      Upload: {beforePhoto.uploaded_at ? new Date(beforePhoto.uploaded_at).toLocaleString('id-ID') : '—'}
                    </div>
                  </div>
                ) : (
                  <PhotoUploadField
                    label="Foto Before"
                    hint="Optional — foto sebelum treatment kalau sempat"
                    photoType="before"
                    existingPhoto={null}
                    transactionId={transactionId}
                    branchId={trx?.branch_id}
                    onUploaded={() => loadData()}
                  />
                )}
              </div>

              {/* After Photo */}
              <div>
                <div className="eyebrow" style={{fontSize:9,marginBottom:8}}>
                  Foto After
                  {!afterPhoto && !trx?.photo_skip_reason && <span style={{color:'var(--red)',marginLeft:6}}>⚠️ wajib upload</span>}
                </div>
                {afterPhoto?.signedUrl ? (
                  <div style={{borderRadius:10,overflow:'hidden',background:'var(--cream)'}}>
                    <img src={afterPhoto.signedUrl} alt="After"
                      style={{width:'100%',display:'block',maxHeight:400,objectFit:'contain'}}/>
                    <div style={{padding:10,display:'flex',gap:6,flexWrap:'wrap',background:'var(--paper)'}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => downloadPhoto(afterPhoto)}>⬇ Download</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => shareWA(afterPhoto)}>💬 WA</button>
                      {isAdmin && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleMarkMarketing(afterPhoto, !afterPhoto.is_marketing_approved)}
                          style={afterPhoto.is_marketing_approved ? {color:'var(--gold)'} : {}}
                        >
                          {afterPhoto.is_marketing_approved ? '⭐ Marketing ON' : '☆ Mark Marketing'}
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          if (!window.confirm('Hapus foto after?')) return;
                          try {
                            await deleteTreatmentPhoto(afterPhoto.id);
                            toast('Foto after dihapus', 'success');
                            loadData();
                          } catch (err) { toast('Gagal: '+err.message, 'error'); }
                        }}
                        style={{color:'var(--red)'}}
                      >
                        🗑 Hapus
                      </button>
                    </div>
                    <div style={{padding:'4px 10px 10px',fontSize:10,color:'var(--muted)'}}>
                      Upload: {afterPhoto.uploaded_at ? new Date(afterPhoto.uploaded_at).toLocaleString('id-ID') : '—'}
                    </div>
                  </div>
                ) : trx?.photo_skip_reason ? (
                  <div style={{padding:20,background:'#fdf6e3',borderRadius:10,fontSize:13,color:'var(--plum)'}}>
                    <div className="eyebrow" style={{fontSize:9,marginBottom:6,color:'var(--amber)'}}>⚠️ Foto di-skip</div>
                    <div>Alasan: {trx.photo_skip_reason}</div>
                  </div>
                ) : (
                  <PhotoUploadField
                    label="Foto After"
                    hint="Wajib upload. Bisa pakai kamera HP atau pilih dari galeri."
                    photoType="after"
                    existingPhoto={null}
                    transactionId={transactionId}
                    branchId={trx?.branch_id}
                    onUploaded={() => loadData()}
                    required
                  />
                )}
              </div>
            </div>

            {/* Skip reason editor */}
            {!afterPhoto && (
              <Card title="Alasan Skip Foto After" sub="Isi alasan jika foto after benar-benar tidak bisa diambil">
                {editingSkipReason ? (
                  <>
                    <Field label="Alasan">
                      <select className="form-select" value={skipReason}
                        onChange={e => setSkipReason(e.target.value)}>
                        <option value="">— Pilih —</option>
                        <option value="Klien tolak difoto">Klien tolak difoto</option>
                        <option value="Foto tidak terambil karena alasan teknis">Foto tidak terambil karena alasan teknis</option>
                        <option value="Klien buru-buru pulang">Klien buru-buru pulang</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </Field>
                    {skipReason === 'Lainnya' && (
                      <Field label="Alasan custom">
                        <input type="text" className="form-input"
                          placeholder="Tulis alasan..."
                          onChange={e => setSkipReason(e.target.value)}/>
                      </Field>
                    )}
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditingSkipReason(false); setSkipReason(trx?.photo_skip_reason || ''); }}>Batal</button>
                      <button className="btn btn-primary btn-sm" onClick={saveSkipReason}>Simpan</button>
                    </div>
                  </>
                ) : (
                  <>
                    {trx?.photo_skip_reason ? (
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                        <div>
                          <div style={{fontSize:11,color:'var(--muted)'}}>Alasan tersimpan:</div>
                          <div style={{fontSize:14,fontWeight:500}}>{trx.photo_skip_reason}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingSkipReason(true)}>✏️ Edit</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingSkipReason(true)}>+ Tambah Alasan Skip</button>
                    )}
                  </>
                )}
              </Card>
            )}
          </>
        )}

        <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
          <button className="btn btn-ghost" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ABSENSI — Halaman kiosk (perangkat menetap di salon)
// Karyawan tap nama, selfie, sistem catat jam otomatis
// =====================================================
function AbsensiPage({ profile, currentBranchId, branches }) {
  const [employees, setEmployees] = useStateP([]);
  const [todayRows, setTodayRows] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [camTarget, setCamTarget] = useStateP(null);  // { employee, kind: 'in'|'out' }
  const [clock, setClock] = useStateP(new Date());

  const effectiveBranchId = profile.role === 'super_admin'
    ? (currentBranchId || profile.branch_id)
    : profile.branch_id;
  const branch = branches.find(b => b.id === effectiveBranchId);

  // Jam berjalan
  useEffectP(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  async function loadData() {
    if (!effectiveBranchId) return;
    setLoading(true);
    try {
      const [emps, att] = await Promise.all([
        listEmployees(effectiveBranchId, true),
        getTodayAttendance(effectiveBranchId),
      ]);
      setEmployees(emps);
      setTodayRows(att);
    } catch (err) {
      toast('Gagal memuat: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { loadData(); }, [effectiveBranchId]);

  function rowFor(empId) {
    return todayRows.find(r => r.employee_id === empId) || null;
  }

  // Status: 'belum' | 'masuk' | 'selesai'
  function statusOf(empId) {
    const r = rowFor(empId);
    if (!r || !r.clock_in_at) return 'belum';
    if (!r.clock_out_at) return 'masuk';
    return 'selesai';
  }

  async function handleCaptured(blob) {
    if (!camTarget) return;
    const { employee, kind } = camTarget;
    setCamTarget(null);
    try {
      if (kind === 'in') {
        const rec = await clockIn({ employeeId: employee.id, branchId: effectiveBranchId, photoBlob: blob });
        const late = rec.late_minutes || 0;
        toast(late > 0
          ? `${employee.full_name}: absen masuk tercatat, terlambat ${late} menit`
          : `${employee.full_name}: absen masuk tercatat, tepat waktu`,
          late > 0 ? 'error' : 'success');
      } else {
        await clockOut({ employeeId: employee.id, branchId: effectiveBranchId, photoBlob: blob });
        toast(`${employee.full_name}: absen pulang tercatat`, 'success');
      }
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  const jam = `${String(clock.getHours()).padStart(2,'0')}:${String(clock.getMinutes()).padStart(2,'0')}`;
  const detik = String(clock.getSeconds()).padStart(2,'0');
  const tanggalPanjang = clock.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // Pisahkan yang ikut absensi dan yang dikecualikan (Owner, Manager, akun kiosk)
  const absenEmployees = employees.filter(e => !isAttendanceExempt(e));
  const exemptEmployees = employees.filter(e => isAttendanceExempt(e));
  const sudahMasuk = absenEmployees.filter(e => statusOf(e.id) !== 'belum').length;

  return (
    <div className="page">
      {/* Jam besar */}
      <div style={{textAlign:'center',padding:'24px 16px 20px',background:'var(--mauve)',borderRadius:16,marginBottom:20,color:'#fff'}}>
        <div style={{fontSize:13,opacity:0.85,marginBottom:6}}>{tanggalPanjang}</div>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:56,fontWeight:600,lineHeight:1}}>
          {jam}<span style={{fontSize:24,opacity:0.7}}>:{detik}</span>
        </div>
        <div style={{fontSize:12,opacity:0.85,marginTop:8}}>
          {branch?.name || '—'} · masuk 09:30 · pulang 19:30
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div className="eyebrow">Tap nama untuk absen</div>
        <div style={{fontSize:12,color:'var(--muted)'}}>{sudahMasuk} dari {absenEmployees.length} sudah absen</div>
      </div>

      {loading ? <Loader text="Memuat karyawan..."/> :
       !absenEmployees.length ? <Empty title="Belum ada karyawan" sub="Tambahkan karyawan di menu Karyawan."/> : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:12}}>
          {absenEmployees.map(emp => {
            const st = statusOf(emp.id);
            const r = rowFor(emp.id);
            const kind = st === 'belum' ? 'in' : 'out';
            const disabled = st === 'selesai';
            const bg = st === 'belum' ? 'var(--paper)' : st === 'masuk' ? '#f0f7f2' : 'var(--cream)';
            const border = st === 'belum' ? 'var(--line)' : st === 'masuk' ? 'var(--hijau)' : 'var(--line)';
            const fmtJam = ts => ts ? new Date(ts).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '';
            return (
              <button key={emp.id} type="button" disabled={disabled}
                onClick={() => setCamTarget({ employee: emp, kind })}
                style={{
                  textAlign:'left',padding:14,borderRadius:14,
                  background:bg,border:`1.5px solid ${border}`,
                  cursor:disabled?'default':'pointer',opacity:disabled?0.75:1,
                  transition:'all .15s',
                }}>
                <div style={{fontWeight:600,fontSize:14,color:'var(--plum-deep)',marginBottom:2}}>{emp.full_name}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginBottom:8}}>{emp.job_title || '—'}</div>

                {st === 'belum' && (
                  <div style={{fontSize:12,color:'var(--mauve)',fontWeight:500}}>Tap untuk absen masuk</div>
                )}
                {st === 'masuk' && (
                  <>
                    <div style={{fontSize:12,color:'var(--hijau)',fontWeight:500}}>
                      Masuk {fmtJam(r.clock_in_at)}
                      {r.late_minutes > 0 && <span style={{color:'var(--red)'}}> · telat {r.late_minutes}m</span>}
                    </div>
                    <div style={{fontSize:12,color:'var(--mauve)',fontWeight:500,marginTop:4}}>Tap untuk absen pulang</div>
                  </>
                )}
                {st === 'selesai' && (
                  <div style={{fontSize:12,color:'var(--muted)'}}>
                    {fmtJam(r.clock_in_at)} sampai {fmtJam(r.clock_out_at)}
                    {r.late_minutes > 0 && <div style={{color:'var(--red)'}}>telat {r.late_minutes} menit</div>}
                    <div style={{color:'var(--hijau)',fontWeight:500,marginTop:2}}>Selesai</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!loading && exemptEmployees.length > 0 && (
        <div style={{marginTop:22}}>
          <div className="eyebrow" style={{marginBottom:10}}>Tidak ikut absensi</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {exemptEmployees.map(emp => (
              <div key={emp.id} style={{
                padding:'8px 12px',borderRadius:100,background:'var(--cream)',
                border:'1px dashed var(--line)',fontSize:12,color:'var(--muted)',
              }}>
                {emp.full_name}
                <span style={{marginLeft:6,opacity:0.75}}>
                  · {attendanceExemptReason(emp) || 'Dikecualikan'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {camTarget && (
        <FaceScanCamera
          employeeName={camTarget.employee.full_name}
          kind={camTarget.kind}
          onCancel={() => setCamTarget(null)}
          onCaptured={handleCaptured}
        />
      )}
    </div>
  );
}

// =====================================================
// Kamera selfie dengan animasi pemindaian wajah
// Catatan: animasi ini efek visual, bukan pengenalan wajah sungguhan
// =====================================================
function FaceScanCamera({ employeeName, kind, onCancel, onCaptured }) {
  const videoRef = useRefP(null);
  const streamRef = useRefP(null);
  const [phase, setPhase] = useStateP('starting');  // starting | ready | scanning | done | error
  const [errMsg, setErrMsg] = useStateP('');

  useEffectP(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPhase('ready');
      } catch (e) {
        setErrMsg('Kamera tidak bisa diakses. Pastikan izin kamera diaktifkan di browser.');
        setPhase('error');
      }
    }
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  function stopCamera() {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }

  function captureBlob() {
    return new Promise(resolve => {
      const v = videoRef.current;
      if (!v) return resolve(null);
      const size = 640;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      // Crop tengah jadi persegi
      const vw = v.videoWidth || size, vh = v.videoHeight || size;
      const side = Math.min(vw, vh);
      const sx = (vw - side) / 2, sy = (vh - side) / 2;
      // Mirror supaya terasa natural seperti cermin
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, sx, sy, side, side, 0, 0, size, size);
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.75);
    });
  }

  async function handleShoot() {
    setPhase('scanning');
    const blob = await captureBlob();
    // Beri jeda supaya animasi pemindaian terlihat
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => {
        stopCamera();
        onCaptured(blob);
      }, 900);
    }, 1600);
  }

  const judul = kind === 'in' ? 'Absen Masuk' : 'Absen Pulang';

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(20,14,24,0.92)',zIndex:9500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <style>{`
        @keyframes jbbScanLine {
          0%   { top: 4%;  opacity: 0; }
          10%  { opacity: 1; }
          50%  { top: 94%; opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 4%;  opacity: 0; }
        }
        @keyframes jbbPulseRing {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%     { opacity: 0.9;  transform: scale(1.02); }
        }
        @keyframes jbbPopIn {
          0%   { opacity: 0; transform: scale(0.8); }
          60%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        .jbb-scan-line {
          position:absolute; left:6%; right:6%; height:3px;
          background:linear-gradient(90deg, transparent, #c9a961, #fff, #c9a961, transparent);
          box-shadow:0 0 14px 3px rgba(201,169,97,0.65);
          animation: jbbScanLine 2.6s ease-in-out infinite;
        }
        /* Saat memindai, garis bergerak lebih cepat dan lebih terang */
        .jbb-scan-line.fast {
          animation-duration: 1.2s;
          height:4px;
          box-shadow:0 0 18px 5px rgba(201,169,97,0.85);
        }
        .jbb-corner {
          position:absolute; width:34px; height:34px;
          border-color:#c9a961; border-style:solid; border-width:0;
        }
      `}</style>

      <div style={{width:'100%',maxWidth:400,textAlign:'center'}}>
        <div style={{color:'#fff',marginBottom:4,fontSize:13,opacity:0.8}}>{judul}</div>
        <div style={{color:'#fff',marginBottom:16,fontFamily:"'Cormorant Garamond', serif",fontSize:26,fontWeight:600}}>
          {employeeName}
        </div>

        {phase === 'error' ? (
          <div style={{background:'var(--paper)',borderRadius:16,padding:24}}>
            <div style={{fontSize:40,marginBottom:10}}>📷</div>
            <div style={{color:'var(--red)',fontSize:14,marginBottom:16}}>{errMsg}</div>
            <button className="btn btn-ghost" onClick={onCancel}>Tutup</button>
          </div>
        ) : (
          <>
            {/* Bingkai kamera */}
            <div style={{position:'relative',width:'100%',aspectRatio:'1 / 1',borderRadius:20,overflow:'hidden',background:'#000',marginBottom:18}}>
              <video ref={videoRef} playsInline muted
                style={{width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/>

              {/* Sudut bingkai */}
              <div className="jbb-corner" style={{top:12,left:12,borderTopWidth:3,borderLeftWidth:3,borderTopLeftRadius:10}}/>
              <div className="jbb-corner" style={{top:12,right:12,borderTopWidth:3,borderRightWidth:3,borderTopRightRadius:10}}/>
              <div className="jbb-corner" style={{bottom:12,left:12,borderBottomWidth:3,borderLeftWidth:3,borderBottomLeftRadius:10}}/>
              <div className="jbb-corner" style={{bottom:12,right:12,borderBottomWidth:3,borderRightWidth:3,borderBottomRightRadius:10}}/>

              {/* Oval panduan wajah */}
              {phase !== 'done' && (
                <div style={{
                  position:'absolute',top:'12%',left:'22%',width:'56%',height:'70%',
                  border:'2px dashed rgba(255,255,255,0.55)',borderRadius:'50% / 42%',
                  animation:'jbbPulseRing 2s ease-in-out infinite',pointerEvents:'none',
                }}/>
              )}

              {/* Garis pemindai — sudah berjalan sejak kamera siap */}
              {(phase === 'ready' || phase === 'scanning') && (
                <div className={'jbb-scan-line' + (phase === 'scanning' ? ' fast' : '')}/>
              )}

              {/* Hasil */}
              {phase === 'done' && (
                <div style={{position:'absolute',inset:0,background:'rgba(74,124,89,0.88)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',animation:'jbbPopIn .45s ease-out'}}>
                  <div style={{fontSize:52,marginBottom:10}}>✓</div>
                  <div style={{color:'#fff',fontSize:16,fontWeight:600}}>Wajah terekam</div>
                  <div style={{color:'rgba(255,255,255,0.85)',fontSize:12,marginTop:4}}>Absensi sedang disimpan</div>
                </div>
              )}

              {/* Status pemindaian */}
              {(phase === 'ready' || phase === 'scanning') && (
                <div style={{position:'absolute',bottom:14,left:0,right:0,color:'#c9a961',fontSize:12,fontWeight:600,letterSpacing:'0.06em'}}>
                  {phase === 'scanning' ? 'MEMINDAI WAJAH...' : 'POSISIKAN WAJAH DI DALAM OVAL'}
                </div>
              )}
            </div>

            {/* Tombol */}
            {phase === 'ready' && (
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button className="btn btn-ghost" onClick={() => { stopCamera(); onCancel(); }}
                  style={{color:'#fff',borderColor:'rgba(255,255,255,0.4)'}}>
                  Batal
                </button>
                <button className="btn btn-primary" onClick={handleShoot} style={{minWidth:150}}>
                  Ambil Foto & Absen
                </button>
              </div>
            )}
            {phase === 'starting' && (
              <div style={{color:'#fff',fontSize:13,opacity:0.8}}>Menyalakan kamera...</div>
            )}
            {(phase === 'scanning' || phase === 'done') && (
              <div style={{color:'rgba(255,255,255,0.6)',fontSize:12}}>Mohon tunggu sebentar</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// =====================================================
// LAPORAN ABSENSI — rekap per periode untuk admin
// =====================================================
function LaporanAbsensiPage({ profile, currentBranchId, branches }) {
  const [rows, setRows] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [preset, setPreset] = useStateP('period');
  const [customFrom, setCustomFrom] = useStateP('');
  const [customTo, setCustomTo] = useStateP('');
  const [photoUrl, setPhotoUrl] = useStateP(null);
  const [photoLabel, setPhotoLabel] = useStateP('');

  const isSuper = profile.role === 'super_admin';
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;
  const canDelete = isSuper || profile.role === 'branch_admin';

  const range = useMemoP(() => {
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (preset === 'today') return { from: fmt(today), to: fmt(today) };
    if (preset === 'week') {
      const s = new Date(today); s.setDate(s.getDate() - 6);
      return { from: fmt(s), to: fmt(today) };
    }
    if (preset === 'custom' && customFrom && customTo) return { from: customFrom, to: customTo };
    const p = getPayrollPeriod();
    return { from: p.period_start, to: p.period_end };
  }, [preset, customFrom, customTo]);

  async function load() {
    setLoading(true);
    try {
      const data = await listAttendance(effectiveBranchId, range.from, range.to);
      setRows(data);
    } catch (err) {
      toast('Gagal memuat: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { load(); }, [effectiveBranchId, range.from, range.to]);

  async function showPhoto(path, label) {
    if (!path) { toast('Tidak ada foto', 'error'); return; }
    const url = await getAttendancePhotoUrl(path);
    if (!url) { toast('Foto tidak bisa dibuka', 'error'); return; }
    setPhotoLabel(label);
    setPhotoUrl(url);
  }

  async function handleDelete(row) {
    if (!window.confirm(`Hapus absensi ${row.employee?.full_name} tanggal ${fmtDate(row.date)}?`)) return;
    try {
      const { error } = await sb.from('attendance').delete().eq('id', row.id);
      if (error) throw error;
      toast('Absensi dihapus', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  // Rekap per karyawan
  const summary = useMemoP(() => {
    const by = {};
    for (const r of rows) {
      const id = r.employee_id;
      if (!by[id]) by[id] = { name: r.employee?.full_name || '—', hadir: 0, telat: 0, menitTelat: 0, lupaPulang: 0 };
      const s = by[id];
      if (r.clock_in_at) s.hadir += 1;
      if (r.late_minutes > 0) { s.telat += 1; s.menitTelat += r.late_minutes; }
      if (r.clock_in_at && !r.clock_out_at) s.lupaPulang += 1;
    }
    return Object.values(by).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const fmtJam = ts => ts ? new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtJarak = m => m == null ? '' : (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);
  const radiusFor = bid => Number(branches.find(b => b.id === bid)?.geofence_radius_m) || 200;

  return (
    <div className="page">
      <PageHeader title="Laporan Absensi" sub="Kehadiran">
        <button className="btn btn-ghost btn-sm" onClick={load}>Muat ulang</button>
      </PageHeader>

      <Card>
        <Field label="Periode">
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {[['period','Periode (26–25)'],['today','Hari ini'],['week','7 hari'],['custom','Custom']].map(([v,l]) => (
              <button key={v} type="button"
                className={'btn btn-sm ' + (preset === v ? 'btn-primary' : 'btn-ghost')}
                onClick={() => setPreset(v)}>{l}</button>
            ))}
          </div>
        </Field>
        {preset === 'custom' && (
          <div className="form-row">
            <Field label="Dari"><input type="date" className="form-input" value={customFrom} onChange={e => setCustomFrom(e.target.value)}/></Field>
            <Field label="Sampai"><input type="date" className="form-input" value={customTo} onChange={e => setCustomTo(e.target.value)}/></Field>
          </div>
        )}
        <div style={{fontSize:12,color:'var(--muted)'}}>
          {fmtDate(range.from)} sampai {fmtDate(range.to)} · {rows.length} catatan
        </div>
      </Card>

      {/* REKAP */}
      <Card title="Rekap per Karyawan" sub="Jumlah hari hadir dan keterlambatan">
        {loading ? <Loader text="Memuat..."/> :
         !summary.length ? <Empty title="Belum ada data absensi" sub="Belum ada yang absen di periode ini."/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th className="table-numeric">Hari Hadir</th>
                  <th className="table-numeric">Hari Telat</th>
                  <th className="table-numeric">Total Telat</th>
                  <th className="table-numeric">Lupa Pulang</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(s => (
                  <tr key={s.name}>
                    <td style={{fontWeight:500}}>{s.name}</td>
                    <td className="table-numeric">{s.hadir}</td>
                    <td className="table-numeric" style={{color: s.telat > 0 ? 'var(--red)' : 'inherit'}}>{s.telat}</td>
                    <td className="table-numeric" style={{color: s.menitTelat > 0 ? 'var(--red)' : 'inherit'}}>
                      {s.menitTelat > 0 ? `${s.menitTelat} menit` : '—'}
                    </td>
                    <td className="table-numeric" style={{color: s.lupaPulang > 0 ? 'var(--amber)' : 'inherit'}}>
                      {s.lupaPulang > 0 ? s.lupaPulang : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* RINCIAN HARIAN */}
      <Card title="Rincian Harian" sub="Klik jam untuk melihat foto selfie">
        {loading ? <Loader text="Memuat..."/> :
         !rows.length ? <Empty title="Belum ada catatan" sub="Belum ada absensi di periode ini."/> : (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {rows.map(r => (
              <div key={r.id} style={{padding:'10px 12px',border:'1px solid var(--line)',borderRadius:10,background:'var(--paper)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,flexWrap:'wrap'}}>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontWeight:500,fontSize:14}}>{r.employee?.full_name || '—'}</div>
                    <div style={{fontSize:12,color:'var(--muted)'}}>{fmtDate(r.date)}</div>
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    <button className="btn btn-ghost btn-sm" onClick={() => showPhoto(r.clock_in_photo, `${r.employee?.full_name} · masuk`)}>
                      Masuk {fmtJam(r.clock_in_at)}
                      {r.late_minutes > 0 && <span style={{color:'var(--red)'}}> · telat {r.late_minutes}m</span>}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => showPhoto(r.clock_out_photo, `${r.employee?.full_name} · pulang`)}
                      disabled={!r.clock_out_at}>
                      Pulang {fmtJam(r.clock_out_at)}
                    </button>
                    {canDelete && (
                      <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => handleDelete(r)}>Hapus</button>
                    )}
                  </div>
                </div>
                {(r.clock_in_lat != null || r.clock_out_lat != null) && (
                  <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--line)',display:'flex',gap:14,flexWrap:'wrap',fontSize:11,color:'var(--muted)'}}>
                    {r.clock_in_lat != null && (() => {
                      const jauh = r.clock_in_distance_m != null && r.clock_in_distance_m > radiusFor(r.branch_id);
                      return (
                        <a href={mapsLinkFor(r.clock_in_lat, r.clock_in_lng)} target="_blank" rel="noopener noreferrer"
                          style={{color: jauh ? 'var(--red)' : 'var(--mauve)',textDecoration:'none',fontWeight: jauh ? 600 : 400}}>
                          {jauh ? '⚠️' : '📍'} Masuk
                          {r.clock_in_distance_m != null ? ` · ${fmtJarak(r.clock_in_distance_m)} dari salon` : ''}
                          {r.clock_in_accuracy != null ? ` (±${r.clock_in_accuracy}m)` : ''}
                        </a>
                      );
                    })()}
                    {r.clock_out_lat != null && (() => {
                      const jauh = r.clock_out_distance_m != null && r.clock_out_distance_m > radiusFor(r.branch_id);
                      return (
                        <a href={mapsLinkFor(r.clock_out_lat, r.clock_out_lng)} target="_blank" rel="noopener noreferrer"
                          style={{color: jauh ? 'var(--red)' : 'var(--mauve)',textDecoration:'none',fontWeight: jauh ? 600 : 400}}>
                          {jauh ? '⚠️' : '📍'} Pulang
                          {r.clock_out_distance_m != null ? ` · ${fmtJarak(r.clock_out_distance_m)} dari salon` : ''}
                          {r.clock_out_accuracy != null ? ` (±${r.clock_out_accuracy}m)` : ''}
                        </a>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal foto */}
      {photoUrl && (
        <div style={{position:'fixed',inset:0,background:'rgba(36,26,44,0.75)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={() => setPhotoUrl(null)}>
          <div style={{maxWidth:420,width:'100%',textAlign:'center'}} onClick={e => e.stopPropagation()}>
            <div style={{color:'#fff',marginBottom:10,fontSize:14}}>{photoLabel}</div>
            <img src={photoUrl} alt="Selfie absensi" style={{width:'100%',borderRadius:16,display:'block'}}/>
            <button className="btn btn-ghost" style={{marginTop:14,color:'#fff',borderColor:'rgba(255,255,255,0.4)'}}
              onClick={() => setPhotoUrl(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  LoginPage, AdminDashboard, BranchesPage,
  NewTransactionPage, TransactionsPage,
  EmployeesPage, EmployeeDashboard,
  AddEmployeeModal, DeleteConfirmModal,
  ReportsPage, PayrollPage, AdjustAttendanceModal,
  AuditLogPage,
  EmployeeDashboardView, MyTransactionsPage, MySalaryPage,
  AdminEmployeeView,
  EditTransactionModal,
  // Tahap E
  PhotoUploadField, PhotoGalleryModal,
  AbsensiPage, FaceScanCamera, LaporanAbsensiPage,
});
