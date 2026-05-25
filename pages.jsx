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
        <Metric label="Omset Hari Ini" value={loadingStats ? '...' : fmtRp(stats.today?.total)} sub={loadingStats ? 'memuat...' : `${stats.today?.count || 0} transaksi`}/>
        <Metric label="Komisi Hari Ini" value={loadingStats ? '...' : fmtRp(stats.today?.commission)} sub="semua karyawan"/>
        <Metric label="Karyawan Aktif" value={loadingStats ? '...' : stats.employees} sub={currentBranch ? currentBranch.name : 'group total'}/>
        <Metric label="Bulan Ini" value={loadingStats ? '...' : fmtRp(stats.month?.total)} sub="total omset"/>
      </div>
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
  const [items, setItems] = useStateP([{ employee_id: '', service_name: '', price: '', fixed_commission: '', notes: '' }]);
  const [employees, setEmployees] = useStateP([]);
  const [loadingEmployees, setLoadingEmployees] = useStateP(true);
  const [submitting, setSubmitting] = useStateP(false);

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
    setItems(prev => [...prev, { employee_id: '', service_name: '', price: '', fixed_commission: '', notes: '' }]);
  }
  function removeItem(idx) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  }

  function getItemCommission(item) {
    if (!item.service_name) return { rate: 0, amount: 0, type: 'percent' };

    const svc = getServiceDef(item.service_name);

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
    if (!effectiveBranchId) { toast('Cabang belum ditentukan', 'error'); return; }
    if (!clientName.trim()) { toast('Nama pelanggan wajib diisi', 'error'); return; }
    if (!items.length || items.some(it => !it.employee_id || !it.service_name || !it.price)) {
      toast('Lengkapi semua item', 'error'); return;
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
      const itemsPayload = items.map(it => {
        const com = getItemCommission(it);
        // Normalize commission_type for DB: only 'percent' or 'fixed_amount' allowed
        const dbCommissionType = com.type === 'percent_manual' ? 'percent' : com.type;
        return {
          employee_id: it.employee_id,
          service_name: it.service_name,
          price: Number(it.price),
          commission_type: dbCommissionType,
          commission_rate: com.rate,
          commission_amount: com.amount,
          notes: it.notes || null,
        };
      });

      await createTransaction({
        branchId: effectiveBranchId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date, startTime, isHomeService,
        homeServiceFee: Number(homeServiceFee) || 0,
        notes,
        items: itemsPayload,
        createdBy: profile.id,
      });

      toast('Transaksi tersimpan! 🎉', 'success');
      setPage('transactions');
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
                            hint={`Range 50.000 – 250.000. ${isOT && effectiveBranchId !== 'bdg' ? '+Rp 5.000 lembur' : isOT && effectiveBranchId === 'bdg' ? 'Tidak ada bonus lembur (Bandung)' : ''}`}>
                            <input type="number" className="form-input" value={item.fixed_commission}
                              onChange={e => updateItem(idx, { fixed_commission: e.target.value })}
                              placeholder="100000" min="50000" max="250000" step="1000" required/>
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
                    </div>
                  );
                })}
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
              <Metric label="Total Omset" value={fmtRp(totalAmount)} sub={`${items.length} treatment`}/>
              <Metric label="Komisi Treatment" value={fmtRp(totalCommission)} sub={isOT ? '⚠️ termasuk lembur' : ''}/>
              {isHomeService && <Metric label="Komisi Home Service" value={fmtRp(Number(homeServiceFee) || 0)} sub="100% untuk karyawan"/>}
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

  const isSuper = profile.role === 'super_admin';
  const isBranchAdmin = profile.role === 'branch_admin';
  const canEdit = isSuper || isBranchAdmin;
  const canDelete = isSuper;

  async function load() {
    setLoading(true);
    try {
      const filterBranch = isSuper ? currentBranchId : profile.branch_id;
      const data = await listRecentTransactions(filterBranch, 50);
      setTrxs(data);
      // Check which ones have been edited
      const ids = data.map(t => t.id);
      const edited = await getEditedTransactionIds(ids);
      setEditedIds(edited);
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => { load(); }, [currentBranchId]);

  const scopeLabel = isSuper
    ? (currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang')
    : branches.find(b => b.id === profile.branch_id)?.name;

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

      <Card>
        {loading ? <Loader text="Memuat..."/> :
         !trxs.length ? <Empty title="Belum ada transaksi" sub="Klik 'Input Transaksi' untuk mulai mencatat."/> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Jam</th>
                  {isSuper && !currentBranchId && <th>Cabang</th>}
                  <th>Pelanggan</th><th>Treatment</th>
                  <th className="table-numeric">Total Omset</th>
                  <th className="table-numeric">Komisi</th>
                  {canEdit && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {trxs.map(t => {
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
                    </td>
                    {isSuper && !currentBranchId && <td><span className="badge badge-mauve" style={{fontSize:10}}>{t.branch?.name}</span></td>}
                    <td>
                      <div style={{fontWeight:500,fontSize:13}}>{t.client_name_snapshot || '—'}</div>
                      {t.client_phone_snapshot && <div style={{fontSize:11,color:'var(--muted)',fontFamily:'JetBrains Mono, monospace'}}>{t.client_phone_snapshot}</div>}
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
                    <td className="table-numeric" style={{color:'var(--mauve)',fontWeight:500}}>{fmtRp(t.total_commission)}</td>
                    {canEdit && (
                      <td>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
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
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

      // Load items
      const loadedItems = (data.items || []).map(it => ({
        employee_id: it.employee_id,
        service_name: it.service_name,
        price: String(it.price),
        fixed_commission: it.commission_type === 'fixed_amount' ? String(it.commission_amount) : '',
        commission_override: data.is_home_service && it.commission_type === 'percent' ? String(it.commission_amount) : '',
        notes: it.notes || '',
      }));
      setItems(loadedItems);

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
    }]);
  }

  function getItemCommission(item) {
    if (!item.service_name) return { rate: 0, amount: 0, type: 'percent' };
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
    for (const it of items) {
      if (!it.employee_id) { toast('Karyawan wajib dipilih untuk semua treatment', 'error'); return; }
      if (!it.service_name) { toast('Treatment wajib dipilih', 'error'); return; }
      if (!it.price || Number(it.price) <= 0) { toast('Harga wajib diisi', 'error'); return; }
      const svc = getServiceDef(it.service_name);
      if (svc?.commission_type === 'fixed_amount' && (!it.fixed_commission || Number(it.fixed_commission) < 50000 || Number(it.fixed_commission) > 250000)) {
        toast('Komisi sulam alis harus 50.000 – 250.000', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const itemsPayload = items.map(it => {
        const com = getItemCommission(it);
        const svc = getServiceDef(it.service_name);
        const dbCommissionType = com.type === 'percent_manual' ? 'percent' : com.type;
        return {
          employee_id: it.employee_id,
          service_name: it.service_name,
          service_category: svc?.category || 'other',
          price: Number(it.price),
          commission_type: dbCommissionType,
          commission_rate: com.rate,
          commission_amount: com.amount,
          notes: it.notes || null,
        };
      });

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
      });

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
                      <Field label="Komisi Karyawan (Rp) *" hint="50.000 – 250.000">
                        <input type="number" className="form-input" value={item.fixed_commission}
                          onChange={e => updateItem(idx, { fixed_commission: e.target.value })}
                          placeholder="100000" min="50000" max="250000" step="1000" required/>
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
                </div>
              );
            })}

            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              + Tambah Treatment
            </button>
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
      if (isNaN(salary) || salary < 1000000) {
        toast('Gaji pokok minimal Rp 1.000.000 untuk jabatan ini', 'error'); return;
      }
    }

    setSubmitting(true);
    try {
      await createEmployee({
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
      toast('Karyawan berhasil ditambahkan! 🎉', 'success');
      onSuccess();
      onClose();
      setForm({
        email: '', password: '', full_name: '', username: '',
        job_title: 'Lash Technician', role: 'employee',
        base_salary: 1500000, meal_allowance: 0, branch_id: defaultBranchId,
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
            <Field label={`Gaji Pokok (Rp) ${salaryOptional ? '' : '*'}`} hint={salaryOptional ? 'Opsional untuk Owner/Manager' : 'Minimal Rp 1.000.000'}>
              <input type="number" className="form-input" value={form.base_salary}
                onChange={e => update({ base_salary: e.target.value })}
                min={salaryOptional ? "0" : "1000000"} step="100000"
                required={!salaryOptional}
                placeholder={salaryOptional ? '0 (opsional)' : '1500000'}/>
            </Field>
            <Field label="Uang Makan (Rp)" hint={salaryOptional ? 'Opsional' : 'Opsional, max Rp 500.000'}>
              <input type="number" className="form-input" value={form.meal_allowance}
                onChange={e => update({ meal_allowance: e.target.value })}
                min="0" max="500000" step="50000"
                placeholder="0"/>
            </Field>
          </div>

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
      if (isNaN(salary) || salary < 1000000) {
        toast('Gaji pokok minimal Rp 1.000.000 untuk jabatan ini', 'error'); return;
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
  const [loading, setLoading] = useStateP(true);

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
            <Metric
              label={employeeFilter ? 'Total Revenue (Treatment-nya)' : 'Total Omset'}
              value={fmtRp(stats.totalRevenue)}
              sub={`${stats.trxCount} transaksi · ${stats.itemCount} treatment`}
            />
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
// ADJUST ATTENDANCE MODAL — input absensi & penyesuaian per karyawan
// =====================================================
function AdjustAttendanceModal({ open, onClose, onSuccess, employee, period, currentAdjustment, branchId, adjustedBy, leaveBalance }) {
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
        annual_leave_days: currentAdjustment.annual_leave_days || 0,
        sick_leave_certified_days: currentAdjustment.sick_leave_certified_days || 0,
        unpaid_leave_days: currentAdjustment.unpaid_leave_days || 0,
        bonus: currentAdjustment.bonus || 0,
        extra_deduction: currentAdjustment.extra_deduction || 0,
        notes: currentAdjustment.notes || '',
      });
    } else if (open) {
      setForm({
        standard_work_days: 26,
        annual_leave_days: 0,
        sick_leave_certified_days: 0,
        unpaid_leave_days: 0,
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
    const standardDays = Number(form.standard_work_days) || 26;
    const actualSalary = unpaid > 0
      ? Math.round(baseSalary * (1 - unpaid / standardDays))
      : baseSalary;
    const deduction = baseSalary - actualSalary;
    return { actualSalary, deduction };
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
        annual_leave_days: annualLeave,
        sick_leave_certified_days: sickCertified,
        unpaid_leave_days: unpaid,
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
            • Sakit tanpa surat, izin pribadi, mangkir → <strong>potong gaji</strong> (per hari)<br/>
            • Standar hari kerja: 26 hari/bulan
          </div>

          <Field label="Standar Hari Kerja" hint="Default 26 hari (libur 1x/minggu)">
            <input type="number" className="form-input" value={form.standard_work_days}
              onChange={e => update({ standard_work_days: e.target.value })}
              min="20" max="31"/>
          </Field>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:14}}>
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
            <Field label="Izin / Sakit tanpa Surat / Mangkir" hint="POTONG GAJI" error={null}>
              <input type="number" className="form-input" value={form.unpaid_leave_days}
                onChange={e => update({ unpaid_leave_days: e.target.value })}
                min="0" max="31"
                style={Number(form.unpaid_leave_days) > 0 ? {borderColor:'var(--amber)',background:'#fdf6e3'} : {}}/>
            </Field>
          </div>

          {/* PREVIEW */}
          {preview && Number(form.unpaid_leave_days) > 0 && (
            <div style={{
              padding:'12px 14px',background:'#fdf6e3',borderRadius:8,
              fontSize:13,color:'var(--plum)',marginBottom:18,lineHeight:1.7,
              border:'1px solid var(--amber)'
            }}>
              <strong>⚠️ Potongan gaji aktif:</strong><br/>
              Gaji pokok {fmtRp(employee.base_salary)} → <strong style={{color:'var(--red)'}}>{fmtRp(preview.actualSalary)}</strong><br/>
              <span style={{fontSize:11,color:'var(--muted)'}}>
                Formula: {fmtRp(employee.base_salary)} × (1 − {form.unpaid_leave_days}/{form.standard_work_days}) = potongan {fmtRp(preview.deduction)}
              </span>
            </div>
          )}

          <div className="form-row">
            <Field label="Bonus (Rp)" hint="THR, insentif, dll. Opsional">
              <input type="number" className="form-input" value={form.bonus}
                onChange={e => update({ bonus: e.target.value })}
                min="0" step="10000" placeholder="0"/>
            </Field>
            <Field label="Potongan Tambahan (Rp)" hint="Denda telat, kasbon, dll. Opsional">
              <input type="number" className="form-input" value={form.extra_deduction}
                onChange={e => update({ extra_deduction: e.target.value })}
                min="0" step="10000" placeholder="0"/>
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
      commission: acc.commission + r.payroll.treatment_commission + r.payroll.hs_commission,
      bonus: acc.bonus + r.payroll.bonus,
      deduction: acc.deduction + r.payroll.extra_deduction,
      total: acc.total + r.payroll.total,
    }), { base: 0, meal: 0, commission: 0, bonus: 0, deduction: 0, total: 0 });
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
      const branch = branches.find(b => b.id === row.employee.branch_id);
      const slipHtml = generateSlipHTML({
        employee: row.employee,
        payroll: row.payroll,
        items,
        period: selectedPeriod,
        branch,
        generatedBy: profile,
        isApproved: row.adjustment?.is_approved === true,
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
        const branch = branches.find(b => b.id === row.employee.branch_id);
        slips.push(generateSlipHTML({
          employee: row.employee,
          payroll: row.payroll,
          items,
          period: selectedPeriod,
          branch,
          generatedBy: profile,
          isApproved: row.adjustment?.is_approved === true,
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
                  <th className="table-numeric">Komisi</th>
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
                      <div style={{fontWeight:500,color:'var(--mauve)'}}>{fmtRp(p.treatment_commission + p.hs_commission)}</div>
                      {p.hs_commission > 0 && (
                        <div style={{fontSize:10,color:'var(--muted)'}}>HS: {fmtRp(p.hs_commission)}</div>
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
      const fields = (log.changed_fields || []).map(getFieldLabel).join(', ');
      const name = log.new_data?.full_name || log.new_data?.service_name || log.new_data?.client_name_snapshot || log.new_data?.id?.slice(0, 8);
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
                    <span className={'badge ' + getActionBadge(log.action)} style={{minWidth:55,textAlign:'center'}}>
                      {getActionLabel(log.action)}
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
      const slipHtml = generateSlipHTML({
        employee,
        payroll: estimatedPayroll || {
          base_salary: Number(employee.base_salary) || 0,
          base_salary_actual: Number(employee.base_salary) || 0,
          salary_deduction: 0,
          meal_allowance: Number(employee.meal_allowance) || 0,
          treatment_commission: stats?.period_commission || 0,
          hs_commission: 0,
          annual_leave_days: 0,
          sick_leave_certified_days: 0,
          unpaid_leave_days: 0,
          standard_work_days: 26,
          bonus: 0,
          extra_deduction: 0,
          total: (Number(employee.base_salary) || 0) + (Number(employee.meal_allowance) || 0) + (stats?.period_commission || 0),
        },
        items,
        period,
        branch,
        generatedBy: profile,
        isApproved,
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

Object.assign(window, {
  LoginPage, AdminDashboard, BranchesPage,
  NewTransactionPage, TransactionsPage,
  EmployeesPage, EmployeeDashboard,
  AddEmployeeModal, DeleteConfirmModal,
  ReportsPage, PayrollPage, AdjustAttendanceModal,
  AuditLogPage,
  // Tahap D
  EmployeeDashboardView, MyTransactionsPage, MySalaryPage,
  AdminEmployeeView,
  // Edit/Delete
  EditTransactionModal,
});
