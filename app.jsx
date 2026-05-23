// ===== App root =====
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [loading, setLoading] = useStateA(true);
  const [session, setSession] = useStateA(null);
  const [profile, setProfile] = useStateA(null);
  const [page, setPage] = useStateA('dashboard');
  const [branches, setBranches] = useStateA([]);
  const [currentBranchId, setCurrentBranchId] = useStateA(null);

  async function bootstrap() {
    setLoading(true);
    const s = await getCurrentSession();
    setSession(s);
    if (s) {
      const p = await getMyProfile();
      if (!p) {
        await logout();
        toast('Akun belum terdaftar sebagai karyawan. Hubungi admin.', 'error');
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile(p);

      // Load branches list
      try {
        const bs = await listBranches();
        setBranches(bs);

        // For non-super, lock the branch context to their own
        if (p.role !== 'super_admin') {
          setCurrentBranchId(p.branch_id);
        }
        // Super admin starts with "Semua Cabang" (null = all)
      } catch (err) {
        console.error('Branch load error:', err);
      }
    } else {
      setProfile(null);
      setBranches([]);
      setCurrentBranchId(null);
    }
    setLoading(false);
  }

  useEffectA(() => {
    bootstrap();
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setBranches([]);
        setCurrentBranchId(null);
      }
      if (event === 'SIGNED_IN' && s) {
        bootstrap();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Check ENV
  const envMissing = !window.__ENV.SUPABASE_URL || window.__ENV.SUPABASE_URL.includes('GANTI');
  if (envMissing) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">JBB</div>
          <div className="auth-sub">아름다움</div>
          <h2 className="auth-title">Setup Required</h2>
          <p className="auth-desc">
            File <code style={{background:'var(--mauve-tint)',padding:'2px 6px',borderRadius:4,fontSize:12}}>config.js</code> belum
            ada atau credential Supabase belum diisi.
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
  const superTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'employees', label: 'Karyawan' },
    { id: 'branches', label: 'Cabang' },
  ];
  const branchAdminTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'employees', label: 'Karyawan' },
  ];
  const employeeTabs = [
    { id: 'dashboard', label: 'Dashboard' },
  ];

  let tabs;
  if (profile.role === 'super_admin') tabs = superTabs;
  else if (profile.role === 'branch_admin') tabs = branchAdminTabs;
  else tabs = employeeTabs;

  // Render active page
  let pageContent;
  const isAdmin = profile.role === 'super_admin' || profile.role === 'branch_admin';

  if (isAdmin) {
    if (page === 'employees') {
      pageContent = <EmployeesPage profile={profile} currentBranchId={currentBranchId} branches={branches}/>;
    } else if (page === 'branches' && profile.role === 'super_admin') {
      pageContent = <BranchesPage profile={profile}/>;
    } else {
      pageContent = <AdminDashboard profile={profile} setPage={setPage} currentBranchId={currentBranchId} branches={branches}/>;
    }
  } else {
    pageContent = <EmployeeDashboard profile={profile}/>;
  }

  return (
    <>
      <TopNav
        profile={profile}
        page={page}
        setPage={setPage}
        tabs={tabs}
        currentBranchId={currentBranchId}
        setCurrentBranchId={setCurrentBranchId}
        branches={branches}
      />
      {pageContent}
      <AppFooter/>
      <ToastStack/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
