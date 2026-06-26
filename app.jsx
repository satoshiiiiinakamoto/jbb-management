// ===== App root =====
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [loading, setLoading] = useStateA(true);
  const [session, setSession] = useStateA(null);
  const [profile, setProfile] = useStateA(null);
  // Remember the last menu across reloads (Safari often reloads inactive tabs)
  const [page, setPageRaw] = useStateA(() => {
    try { return localStorage.getItem('jbb_last_page') || 'dashboard'; }
    catch (e) { return 'dashboard'; }
  });
  const setPage = (p) => {
    setPageRaw(p);
    try { localStorage.setItem('jbb_last_page', p); } catch (e) {}
  };
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

      try {
        const bs = await listBranches();
        setBranches(bs);
        if (p.role !== 'super_admin') {
          setCurrentBranchId(p.branch_id);
        } else {
          // Restore last selected branch for super_admin
          try {
            const saved = localStorage.getItem('jbb_last_branch');
            if (saved && bs.some(b => b.id === saved)) setCurrentBranchId(saved);
          } catch (e) {}
        }
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
        try { localStorage.removeItem('jbb_last_page'); localStorage.removeItem('jbb_last_branch'); } catch (e) {}
      }
      if (event === 'SIGNED_IN' && s) {
        bootstrap();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Save scroll position continuously (throttled) so a Safari reload can restore it
  useEffectA(() => {
    let timer = null;
    const onScroll = () => {
      if (timer) return;
      timer = setTimeout(() => {
        try { sessionStorage.setItem('jbb_scroll_' + page, String(window.scrollY)); } catch (e) {}
        timer = null;
      }, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (timer) clearTimeout(timer); };
  }, [page]);

  // Restore scroll position when a page mounts (after load completes)
  useEffectA(() => {
    if (loading || !profile) return;
    try {
      const saved = sessionStorage.getItem('jbb_scroll_' + page);
      if (saved) {
        const y = parseInt(saved, 10);
        if (y > 0) {
          // Wait for content to render before scrolling
          setTimeout(() => window.scrollTo(0, y), 100);
        }
      }
    } catch (e) {}
  }, [page, loading, profile]);

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
    { id: 'newTransaction', label: 'Input Transaksi' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'reports', label: 'Laporan' },
    { id: 'kas', label: 'Kas' },
    { id: 'payroll', label: 'Gaji' },
    { id: 'employees', label: 'Karyawan' },
    { id: 'branches', label: 'Cabang' },
    { id: 'audit', label: 'Audit Log' },
  ];
  const branchAdminTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'newTransaction', label: 'Input Transaksi' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'reports', label: 'Laporan' },
    { id: 'kas', label: 'Kas' },
    { id: 'payroll', label: 'Gaji' },
    { id: 'employees', label: 'Karyawan' },
  ];
  const employeeTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'newTransaction', label: 'Input Transaksi' },
    { id: 'transactions', label: 'Transaksi Cabang' },
    { id: 'kas', label: 'Kas' },
    { id: 'myTransactions', label: 'Transaksi Saya' },
  ];

  let tabs;
  if (profile.role === 'super_admin') tabs = superTabs;
  else if (profile.role === 'branch_admin') tabs = branchAdminTabs;
  else tabs = employeeTabs;

  // Route pages
  let pageContent;
  const isAdmin = profile.role === 'super_admin' || profile.role === 'branch_admin';

  if (isAdmin) {
    switch (page) {
      case 'newTransaction':
        pageContent = <NewTransactionPage profile={profile} currentBranchId={currentBranchId} branches={branches} setPage={setPage}/>;
        break;
      case 'transactions':
        pageContent = <TransactionsPage profile={profile} currentBranchId={currentBranchId} branches={branches} setPage={setPage}/>;
        break;
      case 'reports':
        pageContent = <ReportsPage profile={profile} currentBranchId={currentBranchId} branches={branches}/>;
        break;
      case 'kas':
        pageContent = <KasPage profile={profile} currentBranchId={currentBranchId} branches={branches}/>;
        break;
      case 'payroll':
        pageContent = <PayrollPage profile={profile} currentBranchId={currentBranchId} branches={branches}/>;
        break;
      case 'employees':
        pageContent = <EmployeesPage profile={profile} currentBranchId={currentBranchId} branches={branches}/>;
        break;
      case 'audit':
        if (profile.role === 'super_admin') {
          pageContent = <AuditLogPage profile={profile} branches={branches}/>;
        } else {
          pageContent = <AdminDashboard profile={profile} setPage={setPage} currentBranchId={currentBranchId} branches={branches}/>;
        }
        break;
      case 'branches':
        if (profile.role === 'super_admin') {
          pageContent = <BranchesPage/>;
        } else {
          pageContent = <AdminDashboard profile={profile} setPage={setPage} currentBranchId={currentBranchId} branches={branches}/>;
        }
        break;
      default:
        pageContent = <AdminDashboard profile={profile} setPage={setPage} currentBranchId={currentBranchId} branches={branches}/>;
    }
  } else {
    // Employee role
    switch (page) {
      case 'newTransaction':
        pageContent = <NewTransactionPage profile={profile} currentBranchId={profile.branch_id} branches={branches} setPage={setPage}/>;
        break;
      case 'transactions':
        pageContent = <TransactionsPage profile={profile} currentBranchId={profile.branch_id} branches={branches} setPage={setPage}/>;
        break;
      case 'myTransactions':
        pageContent = <MyTransactionsPage profile={profile}/>;
        break;
      case 'kas':
        pageContent = <KasPage profile={profile} currentBranchId={profile.branch_id} branches={branches}/>;
        break;
      default:
        pageContent = <EmployeeDashboard profile={profile} branches={branches} setPage={setPage}/>;
    }
  }

  return (
    <>
      <TopNav
        profile={profile}
        page={page}
        setPage={setPage}
        tabs={tabs}
        currentBranchId={currentBranchId}
        setCurrentBranchId={(id) => {
          setCurrentBranchId(id);
          try { if (id) localStorage.setItem('jbb_last_branch', id); else localStorage.removeItem('jbb_last_branch'); } catch (e) {}
        }}
        branches={branches}
      />
      {pageContent}
      <AppFooter/>
      <ToastStack/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
