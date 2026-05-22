// ===== App root =====
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [loading, setLoading] = useStateA(true);
  const [session, setSession] = useStateA(null);
  const [profile, setProfile] = useStateA(null);
  const [page, setPage] = useStateA('dashboard');

  async function bootstrap() {
    setLoading(true);
    const s = await getCurrentSession();
    setSession(s);
    if (s) {
      const p = await getMyProfile();
      if (!p) {
        // User exists in auth but no employee row
        await logout();
        toast('Akun belum terdaftar sebagai karyawan. Hubungi admin.', 'error');
        setSession(null);
        setProfile(null);
      } else {
        setProfile(p);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffectA(() => {
    bootstrap();
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
      }
      if (event === 'SIGNED_IN' && s) {
        bootstrap();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check ENV
  const envMissing = !window.__ENV.SUPABASE_URL || window.__ENV.SUPABASE_URL.includes('REPLACE_WITH');
  if (envMissing) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">JBB</div>
          <div className="auth-sub">아름다움</div>
          <h2 className="auth-title">Setup Required</h2>
          <p className="auth-desc">
            File <code style={{background:'var(--mauve-tint)',padding:'2px 6px',borderRadius:4,fontSize:12}}>config.js</code> belum
            ada atau credential Supabase belum diisi. Cek panduan setup ya!
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader text="Memuat..."/>;
  }

  if (!session || !profile) {
    return (
      <>
        <LoginPage onLoggedIn={bootstrap}/>
        <ToastStack/>
      </>
    );
  }

  // Build tabs based on role
  const tabs = profile.role === 'admin'
    ? [{ id: 'dashboard', label: 'Dashboard' }]
    : [{ id: 'dashboard', label: 'Dashboard' }];

  return (
    <>
      <TopNav profile={profile} page={page} setPage={setPage} tabs={tabs}/>
      {profile.role === 'admin' ? (
        <AdminDashboard profile={profile}/>
      ) : (
        <EmployeeDashboard profile={profile}/>
      )}
      <AppFooter/>
      <ToastStack/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
