// ===== Pages: Login + Dashboards + Employees + Branches =====
const { useState: useStateP, useEffect: useEffectP } = React;

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
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@jbb.local"
              required
              autoComplete="email"
            />
          </Field>

          <Field label="Password" error={error}>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </Field>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
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
  const isSuper = profile.role === 'super_admin';
  const currentBranch = branches.find(b => b.id === currentBranchId);
  const scopeLabel = currentBranchId
    ? currentBranch?.name || ''
    : isSuper ? 'Semua Cabang (JBB Group)' : '';

  return (
    <div className="page">
      <PageHeader
        title={isSuper ? 'Dashboard JBB Group' : 'Dashboard Cabang'}
        sub={`Halo, ${profile.full_name}`}
      />

      <div style={{marginBottom:20,padding:'12px 16px',background:'var(--mauve-tint)',borderRadius:10,fontSize:13,color:'var(--plum)'}}>
        <strong>Scope saat ini:</strong> {scopeLabel}
        {isSuper && !currentBranchId && (
          <div style={{fontSize:12,marginTop:4,color:'var(--muted)'}}>
            Pilih cabang dari dropdown di pojok kanan atas untuk fokus ke satu cabang.
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <Metric label="Omset Hari Ini" value={fmtRp(0)} sub="0 transaksi"/>
        <Metric label="Komisi Hari Ini" value={fmtRp(0)} sub="semua karyawan"/>
        <Metric label="Karyawan Aktif" value="—" sub="memuat..."/>
        <Metric label="Bulan Ini" value={fmtRp(0)} sub="total omset"/>
      </div>

      <Card title="Mulai dari sini" sub="Aplikasi sedang berkembang bertahap">
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7,marginBottom:14}}>
          {isSuper ? (
            <>Sekarang multi-cabang sudah aktif. Kamu bisa lihat semua cabang JBB Group atau pilih salah satu dari dropdown.</>
          ) : (
            <>Kamu mengelola cabang {currentBranch?.name}. Klik tab Karyawan untuk mulai mengelola data tim cabangmu.</>
          )}
        </p>
        <button className="btn btn-primary" onClick={() => setPage('employees')}>
          Buka Karyawan →
        </button>
        {isSuper && (
          <button className="btn btn-ghost" style={{marginLeft:8}} onClick={() => setPage('branches')}>
            Lihat Semua Cabang
          </button>
        )}
        <div className="section-divider"/>
        <div style={{fontSize:13,color:'var(--muted)'}}>
          <p style={{marginBottom:8}}><strong>Coming next:</strong></p>
          <ul style={{paddingLeft:20,lineHeight:1.8}}>
            <li>Tahap B2: Input transaksi & auto komisi (per cabang)</li>
            <li>Tahap B3: Daftar transaksi dengan filter cabang & tanggal</li>
            <li>Tahap C: Laporan harian & rekap gaji bulanan</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ----- Branches list page (super_admin only) -----
function BranchesPage({ profile }) {
  const [branches, setBranches] = useStateP([]);
  const [loading, setLoading] = useStateP(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listBranches();
      setBranches(data);
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
        {loading ? (
          <Loader text="Memuat daftar cabang..."/>
        ) : !branches.length ? (
          <Empty title="Belum ada cabang"/>
        ) : (
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
                    <td>
                      <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>
                        {b.id}
                      </span>
                    </td>
                    <td style={{fontWeight:500}}>{b.name}</td>
                    <td>{b.city}</td>
                    <td>
                      {b.status === 'inhouse' ? (
                        <span className="badge badge-mauve">In-house</span>
                      ) : (
                        <span className="badge badge-gold">Franchise</span>
                      )}
                    </td>
                    <td className="table-numeric">
                      {b.status === 'franchise' ? `${b.profit_sharing_pct}%` : '—'}
                    </td>
                    <td style={{fontSize:12,fontFamily:'JetBrains Mono, monospace',color:'var(--muted)'}}>
                      {b.whatsapp}
                    </td>
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

// ----- Employees page (branch-aware) -----
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
      // Super admin can filter by branch; branch admin always sees own branch (RLS handles it)
      const filterBranch = isSuper ? currentBranchId : null;
      const data = await listEmployees(filterBranch);
      setEmployees(data);
    } catch (err) {
      toast('Gagal memuat data: ' + err.message, 'error');
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

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id) {
    if (!editForm.full_name?.trim()) {
      toast('Nama wajib diisi', 'error'); return;
    }
    if (!editForm.username?.trim()) {
      toast('Username wajib diisi', 'error'); return;
    }
    const salary = Number(editForm.base_salary);
    const meal = Number(editForm.meal_allowance) || 0;
    if (isNaN(salary) || salary < 1000000) {
      toast('Gaji pokok minimal Rp 1.000.000', 'error'); return;
    }
    if (meal < 0 || meal > 500000) {
      toast('Uang makan: Rp 0 – Rp 500.000', 'error'); return;
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
      // Super admin can also move karyawan ke cabang lain
      if (isSuper && editForm.branch_id) {
        patch.branch_id = editForm.branch_id;
      }

      await updateEmployee(id, patch);
      toast('Data karyawan tersimpan', 'success');
      cancelEdit();
      load();
    } catch (err) {
      toast('Gagal menyimpan: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(emp) {
    if (!window.confirm(`Nonaktifkan ${emp.full_name}? Data tetap tersimpan, tapi dia tidak akan muncul di daftar aktif.`)) return;
    try {
      await deactivateEmployee(emp.id);
      toast('Karyawan dinonaktifkan', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    }
  }

  async function handleReactivate(emp) {
    try {
      await reactivateEmployee(emp.id);
      toast('Karyawan diaktifkan kembali', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    }
  }

  const visibleEmployees = showInactive
    ? employees
    : employees.filter(e => e.is_active !== false);

  const headerSub = isSuper
    ? (currentBranchId
        ? `${branches.find(b => b.id === currentBranchId)?.name || ''}`
        : 'Semua Cabang')
    : 'Kelola Data';

  return (
    <div className="page">
      <PageHeader title="Karyawan" sub={headerSub}>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'var(--muted)',cursor:'pointer'}}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            style={{accentColor:'var(--mauve)'}}
          />
          Tampilkan yang nonaktif
        </label>
      </PageHeader>

      <Card>
        <div style={{marginBottom:16,padding:'12px 14px',background:'var(--mauve-tint)',borderRadius:8,fontSize:13,color:'var(--plum)',lineHeight:1.6}}>
          <strong>Catatan:</strong> Untuk menambah karyawan baru, buat akun di Supabase Authentication terlebih dahulu, lalu daftarkan di tabel <code style={{fontSize:12,fontFamily:'JetBrains Mono, monospace'}}>employees</code> via SQL. Edit data di tabel ini dengan klik tombol <strong>Edit</strong>.
        </div>

        {loading ? (
          <Loader text="Memuat data karyawan..."/>
        ) : !visibleEmployees.length ? (
          <Empty title="Belum ada karyawan" sub="Tambah karyawan via Supabase Authentication."/>
        ) : (
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
                          <input
                            className="form-input"
                            style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.full_name}
                            onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                          />
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
                            <select
                              className="form-select"
                              style={{padding:'6px 10px',fontSize:13}}
                              value={editForm.branch_id}
                              onChange={e => setEditForm({...editForm, branch_id: e.target.value})}
                            >
                              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                          ) : (
                            <BranchBadge branch={emp.branch}/>
                          )}
                        </td>
                      )}
                      <td>
                        {isEditing ? (
                          <input
                            className="form-input"
                            style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.username}
                            onChange={e => setEditForm({...editForm, username: e.target.value})}
                          />
                        ) : (
                          <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:'var(--muted)'}}>{emp.username}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            className="form-select"
                            style={{padding:'6px 10px',fontSize:13}}
                            value={editForm.job_title}
                            onChange={e => setEditForm({...editForm, job_title: e.target.value})}
                          >
                            {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <span className="badge badge-mauve">{emp.job_title}</span>
                        )}
                      </td>
                      <td className="table-numeric">
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-input"
                            style={{padding:'6px 10px',fontSize:13,textAlign:'right',width:130}}
                            value={editForm.base_salary}
                            onChange={e => setEditForm({...editForm, base_salary: e.target.value})}
                          />
                        ) : fmtRp(emp.base_salary)}
                      </td>
                      <td className="table-numeric">
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-input"
                            style={{padding:'6px 10px',fontSize:13,textAlign:'right',width:120}}
                            value={editForm.meal_allowance}
                            onChange={e => setEditForm({...editForm, meal_allowance: e.target.value})}
                          />
                        ) : (emp.meal_allowance ? fmtRp(emp.meal_allowance) : <span style={{color:'var(--muted)'}}>—</span>)}
                      </td>
                      <td className="table-numeric" style={{fontWeight:500}}>
                        {fmtRp(totalFixed)}
                      </td>
                      <td>
                        {emp.is_active === false ? (
                          <span className="badge badge-red">nonaktif</span>
                        ) : (
                          <span className="badge badge-green">aktif</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-primary btn-sm" onClick={() => saveEdit(emp.id)} disabled={saving}>
                              {saving ? '...' : 'Simpan'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}>
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => startEdit(emp)}>
                              Edit
                            </button>
                            {emp.is_active === false ? (
                              <button className="btn btn-ghost btn-sm" onClick={() => handleReactivate(emp)}>
                                Aktifkan
                              </button>
                            ) : emp.role !== 'super_admin' ? (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(emp)}>
                                Nonaktifkan
                              </button>
                            ) : null}
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

      <Card title="Cara Tambah Karyawan Baru" sub="Untuk Super Admin / Branch Admin">
        <ol style={{paddingLeft:20,lineHeight:1.9,fontSize:13,color:'var(--muted)'}}>
          <li>Buka <a href="https://supabase.com/dashboard" target="_blank" style={{color:'var(--mauve)',textDecoration:'underline'}}>Supabase Dashboard</a> → project jbb-management</li>
          <li>Klik <strong>Authentication → Users → Add user → Create new user</strong></li>
          <li>Isi email karyawan (contoh: <code style={{background:'var(--mauve-tint)',padding:'1px 6px',borderRadius:4,fontSize:12}}>desi@jbb.local</code>) + password</li>
          <li>Centang <strong>Auto Confirm User</strong> → klik <strong>Create user</strong></li>
          <li>Buka <strong>SQL Editor</strong> → jalankan query (ganti email & branch_id sesuai kebutuhan):</li>
        </ol>
        <pre style={{background:'var(--cream)',padding:'12px 14px',borderRadius:8,fontSize:12,overflow:'auto',marginTop:10,fontFamily:'JetBrains Mono, monospace',lineHeight:1.6}}>
{`insert into public.employees
  (id, username, full_name, role, job_title,
   base_salary, meal_allowance, branch_id)
select
  id, 'desi', 'Desi Kurniawan', 'employee',
  'Lash Technician', 1500000, 300000, 'bdg'
from auth.users
where email = 'desi@jbb.local';`}
        </pre>
        <p style={{fontSize:12,color:'var(--muted)',marginTop:10,lineHeight:1.6}}>
          <strong>branch_id</strong> tersedia: <code>bdg</code> (Bandung), <code>smr</code> (Summarecon), <code>jgj</code> (Jogja), <code>jmb</code> (Jambon), <code>cms</code> (Ciamis), <code>vli</code> (VIALI Tangerang)
        </p>
        <p style={{fontSize:12,color:'var(--muted)',marginTop:6,lineHeight:1.6}}>
          <strong>role</strong> tersedia: <code>employee</code> (default), <code>branch_admin</code> (manager cabang), <code>super_admin</code> (owner JBB Group)
        </p>
      </Card>
    </div>
  );
}

// ----- Employee dashboard (regular staff view) -----
function EmployeeDashboard({ profile }) {
  return (
    <div className="page">
      <PageHeader title={`Halo, ${profile.full_name.split(' ')[0]}`} sub={`${profile.branch?.name || ''}`}/>

      <Card title="Selamat Datang" sub="Fitur lengkap akan segera tersedia">
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>
          Kamu login sebagai <strong>karyawan</strong> di {profile.branch?.name}. Saat ini sistem masih dalam tahap pembangunan.
        </p>
        <div className="section-divider"/>
        <div style={{fontSize:13,color:'var(--muted)'}}>
          <p style={{marginBottom:8}}><strong>Yang akan tersedia di tahap berikutnya:</strong></p>
          <ul style={{paddingLeft:20,lineHeight:1.8}}>
            <li>Input transaksi pelanggan kamu sendiri</li>
            <li>Lihat riwayat treatment yang sudah kamu kerjakan</li>
            <li>Lihat estimasi gaji bulanan (gapok + komisi + HS)</li>
            <li>Upload foto before/after dari HP</li>
          </ul>
        </div>
      </Card>

      <Card title="Profile Kamu">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,fontSize:13}}>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Nama</div>
            <div style={{fontWeight:500}}>{profile.full_name}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Cabang</div>
            <div>{profile.branch?.name || '-'}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Jabatan</div>
            <div>{profile.job_title}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Gaji Pokok</div>
            <div>{fmtRp(profile.base_salary)}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Uang Makan</div>
            <div>{fmtRp(profile.meal_allowance)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { LoginPage, AdminDashboard, BranchesPage, EmployeesPage, EmployeeDashboard });
