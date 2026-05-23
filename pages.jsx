// ===== Pages: Login + Dashboards + Employees + Branches + Transactions =====
const { useState: useStateP, useEffect: useEffectP, useMemo: useMemoP } = React;

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
      setError(err.message || 'Login gagal. Periksa email & password.');
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
        <p className="auth-desc">Masuk dengan akun karyawan</p>

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
function AdminDashboard({ profile, setPage, currentBranchId, branches }) {
  const [stats, setStats] = useStateP({ today: null, month: null, employees: null });
  const [loadingStats, setLoadingStats] = useStateP(true);

  const isSuper = profile.role === 'super_admin';
  const currentBranch = branches.find(b => b.id === currentBranchId);
  const scopeLabel = currentBranchId
    ? currentBranch?.name || ''
    : isSuper ? 'Semua Cabang (JBB Group)' : '';

  async function loadStats() {
    setLoadingStats(true);
    try {
      const filterBranch = isSuper ? currentBranchId : profile.branch_id;
      const [today, month, emps] = await Promise.all([
        getTodayStats(filterBranch),
        getMonthStats(filterBranch),
        listEmployees(filterBranch, true),
      ]);
      setStats({ today, month, employees: emps.length });
    } catch (err) {
      console.error('Stats load error:', err);
    } finally {
      setLoadingStats(false);
    }
  }

  useEffectP(() => { loadStats(); }, [currentBranchId]);

  return (
    <div className="page">
      <PageHeader
        title={isSuper ? 'Dashboard JBB Group' : 'Dashboard Cabang'}
        sub={`Halo, ${profile.full_name}`}
      />

      <div style={{marginBottom:20,padding:'12px 16px',background:'var(--mauve-tint)',borderRadius:10,fontSize:13,color:'var(--plum)'}}>
        <strong>Scope:</strong> {scopeLabel}
        {isSuper && !currentBranchId && (
          <div style={{fontSize:12,marginTop:4,color:'var(--muted)'}}>
            Pilih cabang dari dropdown di pojok kanan atas untuk filter ke satu cabang.
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <Metric
          label="Omset Hari Ini"
          value={loadingStats ? '...' : fmtRp(stats.today?.total)}
          sub={loadingStats ? 'memuat...' : `${stats.today?.count || 0} transaksi`}
        />
        <Metric
          label="Komisi Hari Ini"
          value={loadingStats ? '...' : fmtRp(stats.today?.commission)}
          sub="semua karyawan"
        />
        <Metric
          label="Karyawan Aktif"
          value={loadingStats ? '...' : stats.employees}
          sub={currentBranch ? currentBranch.name : 'group total'}
        />
        <Metric
          label="Bulan Ini"
          value={loadingStats ? '...' : fmtRp(stats.month?.total)}
          sub="total omset"
        />
      </div>

      <Card title="Aksi Cepat">
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={() => setPage('newTransaction')}>
            + Input Transaksi
          </button>
          <button className="btn btn-ghost" onClick={() => setPage('transactions')}>
            Lihat Transaksi
          </button>
          <button className="btn btn-ghost" onClick={() => setPage('employees')}>
            Karyawan
          </button>
          {isSuper && (
            <button className="btn btn-ghost" onClick={() => setPage('branches')}>
              Lihat Semua Cabang
            </button>
          )}
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
    try {
      setBranches(await listBranches());
    } catch (err) {
      toast('Gagal memuat cabang: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
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
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Kota</th>
                  <th>Status</th>
                  <th className="table-numeric">Profit Sharing</th>
                  <th>WhatsApp</th>
                  <th>Berdiri</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(b => (
                  <tr key={b.id}>
                    <td><span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>{b.id}</span></td>
                    <td style={{fontWeight:500}}>{b.name}</td>
                    <td>{b.city}</td>
                    <td>
                      {b.status === 'inhouse'
                        ? <span className="badge badge-mauve">In-house</span>
                        : <span className="badge badge-gold">Franchise</span>}
                    </td>
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
// NEW TRANSACTION PAGE — the main feature of B2
// =====================================================
function NewTransactionPage({ profile, currentBranchId, branches, setPage }) {
  const isSuper = profile.role === 'super_admin';

  // Determine effective branch
  const effectiveBranchId = useMemoP(() => {
    if (profile.role === 'super_admin') {
      return currentBranchId || profile.branch_id; // fallback to own branch if no selection
    }
    return profile.branch_id;
  }, [profile, currentBranchId]);

  const effectiveBranch = branches.find(b => b.id === effectiveBranchId);

  // Form state
  const [date, setDate] = useStateP(todayStr());
  const [startTime, setStartTime] = useStateP(nowTimeStr());
  const [clientName, setClientName] = useStateP('');
  const [clientPhone, setClientPhone] = useStateP('');
  const [foundClient, setFoundClient] = useStateP(null);
  const [isHomeService, setIsHomeService] = useStateP(false);
  const [homeServiceFee, setHomeServiceFee] = useStateP('');
  const [notes, setNotes] = useStateP('');

  // Items array
  const [items, setItems] = useStateP([
    { employee_id: '', service_name: '', price: '', fixed_commission: '', notes: '' }
  ]);

  // Employees loaded for selection
  const [employees, setEmployees] = useStateP([]);
  const [loadingEmployees, setLoadingEmployees] = useStateP(true);
  const [submitting, setSubmitting] = useStateP(false);

  const isOT = isOvertime(startTime);

  // Load employees of effective branch
  useEffectP(() => {
    if (!effectiveBranchId) return;
    setLoadingEmployees(true);
    listEmployees(effectiveBranchId, true)
      .then(setEmployees)
      .catch(err => toast('Gagal memuat karyawan: ' + err.message, 'error'))
      .finally(() => setLoadingEmployees(false));
  }, [effectiveBranchId]);

  // Auto-lookup client by phone
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
    setItems(prev => [...prev, { employee_id: '', service_name: '', price: '', fixed_commission: '', notes: '' }]);
  }

  function removeItem(idx) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  }

  // Calculate item commission live
  function getItemCommission(item) {
    if (!item.service_name) return { rate: 0, amount: 0, type: 'percent' };
    const svc = getServiceDef(item.service_name);
    if (!svc) return { rate: 0, amount: 0, type: 'percent' };

    return calcCommission({
      serviceName: item.service_name,
      price: Number(item.price) || 0,
      fixedAmount: Number(item.fixed_commission) || 0,
      isOT,
      branchId: effectiveBranchId,
    });
  }

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + getItemCommission(it).amount, 0);
  const totalForEmployee = totalCommission + (isHomeService ? (Number(homeServiceFee) || 0) : 0);

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!effectiveBranchId) {
      toast('Cabang belum ditentukan', 'error'); return;
    }
    if (!clientName.trim()) {
      toast('Nama pelanggan wajib diisi', 'error'); return;
    }
    if (!items.length || items.some(it => !it.employee_id || !it.service_name || !it.price)) {
      toast('Lengkapi semua item: karyawan, treatment, harga', 'error'); return;
    }
    for (const it of items) {
      const svc = getServiceDef(it.service_name);
      if (svc?.commission_type === 'fixed_amount' && !it.fixed_commission) {
        toast(`Komisi sulam alis (${it.service_name}) wajib diisi`, 'error'); return;
      }
    }
    if (isHomeService && !homeServiceFee) {
      toast('Biaya home service wajib diisi', 'error'); return;
    }

    setSubmitting(true);
    try {
      const itemsPayload = items.map(it => {
        const com = getItemCommission(it);
        return {
          employee_id: it.employee_id,
          service_name: it.service_name,
          price: Number(it.price),
          commission_type: com.type,
          commission_rate: com.rate,
          commission_amount: com.amount,
          notes: it.notes || null,
        };
      });

      await createTransaction({
        branchId: effectiveBranchId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date,
        startTime,
        isHomeService,
        homeServiceFee: Number(homeServiceFee) || 0,
        notes,
        items: itemsPayload,
        createdBy: profile.id,
      });

      toast('Transaksi tersimpan! 🎉', 'success');
      setPage('transactions');
    } catch (err) {
      toast('Gagal menyimpan: ' + (err.message || err), 'error');
      console.error(err);
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
            <strong>⚠️ Pilih cabang dulu</strong> dari dropdown di pojok kanan atas untuk input transaksi.
          </div>
        </Card>
      )}

      {effectiveBranchId && (
        <form onSubmit={handleSubmit}>
          {/* INFO TRANSAKSI */}
          <Card title="Info Transaksi" sub="Tanggal, jam, pelanggan">
            <div className="form-row-3">
              <Field label="Tanggal">
                <input type="date" className="form-input" value={date}
                  onChange={e => setDate(e.target.value)} required/>
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
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Nama lengkap" required/>
              </Field>
            </div>
          </Card>

          {/* ITEMS / TREATMENTS */}
          <Card
            title="Treatment"
            sub={`${items.length} item • Total ${fmtRp(totalAmount)}`}
            action={
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
                + Tambah Treatment
              </button>
            }
          >
            {loadingEmployees ? <Loader text="Memuat karyawan..."/> : (
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {items.map((item, idx) => {
                  const svc = getServiceDef(item.service_name);
                  const com = getItemCommission(item);
                  const isFixedComm = svc?.commission_type === 'fixed_amount';

                  return (
                    <div key={idx} style={{
                      padding:16, border:'1px solid var(--line)', borderRadius:12,
                      background:'var(--cream)', position:'relative',
                    }}>
                      <div style={{
                        display:'flex',justifyContent:'space-between',alignItems:'center',
                        marginBottom:12,
                      }}>
                        <span className="eyebrow" style={{fontSize:10}}>Treatment #{idx+1}</span>
                        {items.length > 1 && (
                          <button type="button" className="btn btn-danger btn-sm"
                            onClick={() => removeItem(idx)} style={{padding:'4px 10px',fontSize:11}}>
                            Hapus
                          </button>
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
                            onChange={e => updateItem(idx, { service_name: e.target.value, fixed_commission: '' })} required>
                            <option value="">— pilih treatment —</option>
                            {SERVICES.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <div className="form-row">
                        <Field label="Harga (Rp) *">
                          <input type="number" className="form-input"
                            value={item.price} onChange={e => updateItem(idx, { price: e.target.value })}
                            placeholder="200000" min="0" required/>
                        </Field>

                        {isFixedComm ? (
                          <Field
                            label="Komisi Karyawan (Rp) *"
                            hint={`Range 50.000 – 250.000. ${isOT && effectiveBranchId !== 'bdg' ? '+Rp 5.000 lembur' : isOT && effectiveBranchId === 'bdg' ? 'Tidak ada bonus lembur (Bandung)' : ''}`}
                          >
                            <input type="number" className="form-input"
                              value={item.fixed_commission}
                              onChange={e => updateItem(idx, { fixed_commission: e.target.value })}
                              placeholder="100000" min="50000" max="250000" step="1000" required/>
                          </Field>
                        ) : item.service_name ? (
                          <Field
                            label="Komisi Otomatis"
                            hint={`${com.rate}% dari harga`}
                          >
                            <input type="text" className="form-input"
                              value={fmtRp(com.amount)} disabled
                              style={{background:'var(--mauve-tint)',color:'var(--plum)',fontWeight:500}}/>
                          </Field>
                        ) : (
                          <Field label="Komisi" hint="Pilih treatment dulu">
                            <input type="text" className="form-input" value="—" disabled/>
                          </Field>
                        )}
                      </div>

                      {svc && (
                        <div style={{
                          marginTop:8,padding:'8px 12px',
                          background:'var(--paper)',borderRadius:6,
                          fontSize:12,color:'var(--muted)',
                          display:'flex',justifyContent:'space-between',
                        }}>
                          <span>
                            <strong>Kategori:</strong> {svc.category} ·
                            <strong> Tipe komisi:</strong> {svc.commission_type === 'percent' ? `${svc.baseRate}% (base)` : 'Manual Rp'}
                            {isOT && ' · ⚠️ Lembur'}
                          </span>
                          <span style={{fontWeight:500,color:'var(--plum)'}}>
                            Komisi: {fmtRp(com.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* HOME SERVICE */}
          <Card title="Home Service" sub="Opsional — kalau treatment dilakukan di lokasi pelanggan">
            <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:12}}>
              <input type="checkbox" checked={isHomeService}
                onChange={e => setIsHomeService(e.target.checked)}
                style={{accentColor:'var(--mauve)',width:18,height:18}}/>
              <span style={{fontSize:14}}>Ini transaksi home service</span>
            </label>
            {isHomeService && (
              <Field label="Biaya Home Service (Rp)" hint="100% masuk komisi karyawan (selain komisi treatment)">
                <input type="number" className="form-input"
                  value={homeServiceFee} onChange={e => setHomeServiceFee(e.target.value)}
                  placeholder="50000" min="0" step="5000"/>
              </Field>
            )}
          </Card>

          {/* NOTES */}
          <Card title="Catatan" sub="Opsional">
            <Field>
              <textarea className="form-textarea" rows="2" value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk transaksi ini..."/>
            </Field>
          </Card>

          {/* SUMMARY + SUBMIT */}
          <Card>
            <div style={{
              display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
              gap:12,marginBottom:18,
            }}>
              <Metric label="Total Omset" value={fmtRp(totalAmount)} sub={`${items.length} treatment`}/>
              <Metric label="Komisi Treatment" value={fmtRp(totalCommission)} sub={isOT ? '⚠️ termasuk lembur' : ''}/>
              {isHomeService && (
                <Metric label="Komisi Home Service" value={fmtRp(Number(homeServiceFee) || 0)} sub="100% untuk karyawan"/>
              )}
              <Metric label="Total ke Karyawan" value={fmtRp(totalForEmployee)} sub="komisi total"/>
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap'}}>
              <button type="button" className="btn btn-ghost" onClick={() => setPage('dashboard')} disabled={submitting}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? <span className="loader" style={{borderTopColor:'#fff',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Simpan Transaksi'}
              </button>
            </div>
          </Card>
        </form>
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

  const isSuper = profile.role === 'super_admin';

  async function load() {
    setLoading(true);
    try {
      const filterBranch = isSuper ? currentBranchId : profile.branch_id;
      const data = await listRecentTransactions(filterBranch, 50);
      setTrxs(data);
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffectP(() => { load(); }, [currentBranchId]);

  const scopeLabel = isSuper
    ? (currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang')
    : branches.find(b => b.id === profile.branch_id)?.name;

  return (
    <div className="page">
      <PageHeader title="Transaksi" sub={scopeLabel}>
        <button className="btn btn-primary" onClick={() => setPage('newTransaction')}>
          + Input Transaksi
        </button>
      </PageHeader>

      <Card>
        {loading ? <Loader text="Memuat transaksi..."/> :
         !trxs.length ? <Empty title="Belum ada transaksi" sub="Klik 'Input Transaksi' untuk mulai mencatat."/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jam</th>
                  {isSuper && !currentBranchId && <th>Cabang</th>}
                  <th>Pelanggan</th>
                  <th>Treatment</th>
                  <th className="table-numeric">Total Omset</th>
                  <th className="table-numeric">Komisi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trxs.map(t => (
                  <tr key={t.id}>
                    <td style={{fontSize:13}}>{fmtDate(t.date)}</td>
                    <td>
                      <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12}}>{fmtTime(t.start_time)}</span>
                      {t.is_overtime && <span className="badge badge-amber" style={{marginLeft:6,fontSize:10}}>lembur</span>}
                      {t.is_home_service && <span className="badge badge-gold" style={{marginLeft:6,fontSize:10}}>HS</span>}
                    </td>
                    {isSuper && !currentBranchId && (
                      <td><span className="badge badge-mauve" style={{fontSize:10}}>{t.branch?.name}</span></td>
                    )}
                    <td>
                      <div style={{fontWeight:500,fontSize:13}}>{t.client_name_snapshot || '—'}</div>
                      {t.client_phone_snapshot && (
                        <div style={{fontSize:11,color:'var(--muted)',fontFamily:'JetBrains Mono, monospace'}}>{t.client_phone_snapshot}</div>
                      )}
                    </td>
                    <td>
                      {(t.items || []).map((it, i) => (
                        <div key={i} style={{fontSize:12,marginBottom:2}}>
                          <span style={{color:'var(--plum)',fontWeight:500}}>{it.service_name}</span>
                          <span style={{color:'var(--muted)'}}> • {it.employee?.full_name || '—'}</span>
                        </div>
                      ))}
                    </td>
                    <td className="table-numeric" style={{fontWeight:500}}>{fmtRp(t.total_amount)}</td>
                    <td className="table-numeric" style={{color:'var(--mauve)',fontWeight:500}}>
                      {fmtRp(t.total_commission)}
                    </td>
                    <td></td>
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
// EMPLOYEES PAGE (unchanged from B1.5, just carried over)
// =====================================================
function EmployeesPage({ profile, currentBranchId, branches }) {
  const [employees, setEmployees] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [editingId, setEditingId] = useStateP(null);
  const [editForm, setEditForm] = useStateP({});
  const [saving, setSaving] = useStateP(false);
  const [showInactive, setShowInactive] = useStateP(false);

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
      branch_id: emp.branch_id,
    });
  }

  function cancelEdit() { setEditingId(null); setEditForm({}); }

  async function saveEdit(id) {
    if (!editForm.full_name?.trim()) { toast('Nama wajib diisi', 'error'); return; }
    if (!editForm.username?.trim()) { toast('Username wajib diisi', 'error'); return; }
    const salary = Number(editForm.base_salary);
    const meal = Number(editForm.meal_allowance) || 0;
    if (isNaN(salary) || salary < 1000000) { toast('Gaji pokok minimal Rp 1.000.000', 'error'); return; }
    if (meal < 0 || meal > 500000) { toast('Uang makan: Rp 0 – Rp 500.000', 'error'); return; }

    setSaving(true);
    try {
      const patch = {
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim(),
        job_title: editForm.job_title,
        base_salary: salary,
        meal_allowance: meal,
      };
      if (isSuper && editForm.branch_id) patch.branch_id = editForm.branch_id;
      await updateEmployee(id, patch);
      toast('Data tersimpan', 'success');
      cancelEdit();
      load();
    } catch (err) {
      toast('Gagal menyimpan: ' + err.message, 'error');
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

  const visibleEmployees = showInactive ? employees : employees.filter(e => e.is_active !== false);
  const headerSub = isSuper
    ? (currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang')
    : 'Kelola Data';

  return (
    <div className="page">
      <PageHeader title="Karyawan" sub={headerSub}>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)',cursor:'pointer'}}>
          <input type="checkbox" checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            style={{accentColor:'var(--mauve)'}}/>
          Tampilkan yang nonaktif
        </label>
      </PageHeader>

      <Card>
        <div style={{marginBottom:16,padding:'12px 14px',background:'var(--mauve-tint)',borderRadius:8,fontSize:13,color:'var(--plum)',lineHeight:1.6}}>
          <strong>Catatan:</strong> Tambah karyawan baru via Supabase Authentication, lalu daftarkan di tabel <code style={{fontSize:12,fontFamily:'JetBrains Mono, monospace'}}>employees</code> via SQL. Edit data di sini dengan tombol <strong>Edit</strong>.
        </div>

        {loading ? <Loader text="Memuat..."/> :
         !visibleEmployees.length ? <Empty title="Belum ada karyawan"/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  {isSuper && <th>Cabang</th>}
                  <th>Username</th>
                  <th>Jabatan</th>
                  <th className="table-numeric">Gaji Pokok</th>
                  <th className="table-numeric">Uang Makan</th>
                  <th className="table-numeric">Total Tetap</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map(emp => {
                  const isEditing = editingId === emp.id;
                  const totalFixed = (emp.base_salary || 0) + (emp.meal_allowance || 0);
                  return (
                    <tr key={emp.id}>
                      <td>
                        {isEditing ? (
                          <input className="form-input" style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})}/>
                        ) : (
                          <div>
                            <div style={{fontWeight:500}}>{emp.full_name}</div>
                            {emp.role === 'super_admin' && <span className="badge badge-gold" style={{marginTop:2,display:'inline-block'}}>super</span>}
                            {emp.role === 'branch_admin' && <span className="badge badge-mauve" style={{marginTop:2,display:'inline-block'}}>admin</span>}
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
                          ) : (
                            <span className={'badge ' + (emp.branch?.id === 'bdg' ? 'badge-mauve' : 'badge-mauve')}>
                              {emp.branch?.name}
                            </span>
                          )}
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
                            value={editForm.base_salary} onChange={e => setEditForm({...editForm, base_salary: e.target.value})}/>
                        ) : fmtRp(emp.base_salary)}
                      </td>
                      <td className="table-numeric">
                        {isEditing ? (
                          <input type="number" className="form-input" style={{padding:'6px 10px',fontSize:13,textAlign:'right',width:120}}
                            value={editForm.meal_allowance} onChange={e => setEditForm({...editForm, meal_allowance: e.target.value})}/>
                        ) : (emp.meal_allowance ? fmtRp(emp.meal_allowance) : <span style={{color:'var(--muted)'}}>—</span>)}
                      </td>
                      <td className="table-numeric" style={{fontWeight:500}}>{fmtRp(totalFixed)}</td>
                      <td>
                        {emp.is_active === false
                          ? <span className="badge badge-red">nonaktif</span>
                          : <span className="badge badge-green">aktif</span>}
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
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => startEdit(emp)}>Edit</button>
                            {emp.is_active === false
                              ? <button className="btn btn-ghost btn-sm" onClick={() => handleReactivate(emp)}>Aktifkan</button>
                              : emp.role !== 'super_admin'
                                ? <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(emp)}>Nonaktifkan</button>
                                : null}
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
    </div>
  );
}

// ----- Employee dashboard -----
function EmployeeDashboard({ profile }) {
  return (
    <div className="page">
      <PageHeader title={`Halo, ${profile.full_name.split(' ')[0]}`} sub={profile.branch?.name || ''}/>
      <Card title="Selamat Datang">
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>
          Dashboard karyawan akan tersedia di tahap berikutnya (D). Untuk sekarang, transaksi diinput oleh admin/manager.
        </p>
      </Card>
    </div>
  );
}

Object.assign(window, {
  LoginPage, AdminDashboard, BranchesPage,
  NewTransactionPage, TransactionsPage,
  EmployeesPage, EmployeeDashboard
});
