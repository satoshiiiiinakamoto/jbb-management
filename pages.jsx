// ===== Pages: Login + Dashboards =====
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

// ----- Admin dashboard (placeholder for now) -----
function AdminDashboard({ profile }) {
  return (
    <div className="page">
      <PageHeader title="Dashboard Admin" sub={`Halo, ${profile.full_name}`}>
        <button className="btn btn-ghost btn-sm">Refresh</button>
      </PageHeader>

      <div className="metrics-grid">
        <Metric label="Omset Hari Ini" value={fmtRp(0)} sub="0 transaksi"/>
        <Metric label="Komisi Hari Ini" value={fmtRp(0)} sub="semua karyawan"/>
        <Metric label="Karyawan Aktif" value="—" sub="memuat..."/>
        <Metric label="Bulan Ini" value={fmtRp(0)} sub="total omset"/>
      </div>

      <Card title="Selamat Datang" sub="Fitur lengkap akan segera tersedia">
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>
          Ini adalah <strong>Tahap A</strong> dari JBB Management Program. Saat ini kamu sudah berhasil login sebagai <strong>admin</strong>.
        </p>
        <div className="section-divider"/>
        <div style={{fontSize:13,color:'var(--muted)'}}>
          <p style={{marginBottom:8}}><strong>Coming in Tahap B:</strong></p>
          <ul style={{paddingLeft:20,lineHeight:1.8}}>
            <li>Input transaksi salon & home service</li>
            <li>Daftar transaksi lengkap dengan filter</li>
            <li>Manajemen karyawan (CRUD)</li>
          </ul>
        </div>
      </Card>

      <Card title="Profile Kamu" sub="Data yang tersimpan di database">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,fontSize:13}}>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Nama</div>
            <div style={{fontWeight:500}}>{profile.full_name}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Email</div>
            <div>{profile.email}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Username</div>
            <div>{profile.username}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Jabatan</div>
            <div>{profile.job_title}</div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,letterSpacing:'0.05em',textTransform:'uppercase'}}>Role</div>
            <div><span className="badge badge-gold">{profile.role}</span></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ----- Employee dashboard (placeholder for now) -----
function EmployeeDashboard({ profile }) {
  return (
    <div className="page">
      <PageHeader title={`Halo, ${profile.full_name.split(' ')[0]}`} sub="Dashboard Karyawan"/>

      <Card title="Selamat Datang" sub="Fitur lengkap akan segera tersedia">
        <p style={{fontSize:14,color:'var(--muted)',lineHeight:1.7}}>
          Kamu login sebagai <strong>karyawan</strong>. Saat ini sistem masih dalam tahap pembangunan.
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

Object.assign(window, { LoginPage, AdminDashboard, EmployeeDashboard });
