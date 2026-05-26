// ===== Shared UI components =====
const { useState, useEffect, useRef } = React;

// ----- Topnav with branch switcher + hamburger -----
function TopNav({ profile, page, setPage, tabs, currentBranchId, setCurrentBranchId, branches }) {
  const isSuper = profile.role === 'super_admin';
  const currentBranch = branches.find(b => b.id === currentBranchId);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when page changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  // Close mobile menu when clicking outside (any link tap)
  function handleTabClick(tabId) {
    setPage(tabId);
    setMobileMenuOpen(false);
  }

  return (
    <nav className="topnav">
      <div className="topnav-inner">
        <button
          className="topnav-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          style={{display:'none'}}  /* Shown only via CSS @media on mobile */
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </>
            )}
          </svg>
        </button>

        <div className="topnav-brand">
          JBB<span className="ko">아름다움</span>
        </div>

        <div className={'topnav-tabs' + (mobileMenuOpen ? ' mobile-open' : '')}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={'topnav-tab' + (page === t.id ? ' active' : '')}
              onClick={() => handleTabClick(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginLeft:'auto'}}>
          {isSuper && branches.length > 0 ? (
            <select
              className="form-select topnav-branch-select"
              style={{
                padding:'6px 12px',fontSize:12,fontWeight:500,
                background:'var(--mauve-tint)',border:'none',
                borderRadius:100,color:'var(--plum)',
                minWidth:140,cursor:'pointer'
              }}
              value={currentBranchId || ''}
              onChange={e => setCurrentBranchId(e.target.value || null)}
            >
              <option value="">Semua Cabang</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          ) : currentBranch ? (
            <div style={{
              padding:'6px 14px',borderRadius:100,
              background:'var(--mauve-tint)',
              fontSize:12,color:'var(--plum)',fontWeight:500
            }}>
              📍 {currentBranch.name}
            </div>
          ) : null}

          <div className="topnav-user">
            <span className="topnav-user-name">{profile.full_name}</span>
            <span className="badge badge-mauve" style={{padding:'1px 8px'}}>
              {profile.role === 'super_admin' ? 'super' :
               profile.role === 'branch_admin' ? 'admin' : 'staff'}
            </span>
          </div>
          <button className="topnav-logout" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ----- Page header -----
function PageHeader({ title, sub, children }) {
  return (
    <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
      <div>
        <div className="eyebrow" style={{marginBottom:8}}>{sub || 'Dashboard'}</div>
        <h1 className="page-title">{title}</h1>
      </div>
      {children && <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{children}</div>}
    </div>
  );
}

// ----- Card -----
function Card({ title, sub, children, action }) {
  return (
    <div className="card">
      {title && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:sub?6:16}}>
          <div>
            <h3 className="card-title" style={{marginBottom:0}}>{title}</h3>
            {sub && <p className="card-sub" style={{marginBottom:0,marginTop:4}}>{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {(title && sub) && <div style={{height:14}}/>}
      {children}
    </div>
  );
}

// ----- Empty state -----
function Empty({ title, sub }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
    </div>
  );
}

// ----- Loader -----
function Loader({ text }) {
  return (
    <div className="loader-page">
      <div className="loader"/>
      {text && <div>{text}</div>}
    </div>
  );
}

// ----- Toast stack -----
function ToastStack() {
  const items = useToasts();
  if (!items.length) return null;
  return (
    <div className="toast-stack">
      {items.map(t => (
        <div key={t.id} className={'toast toast-' + t.type}>{t.message}</div>
      ))}
    </div>
  );
}

// ----- Footer -----
function AppFooter() {
  return (
    <footer className="app-footer">
      JBB <span className="ko">아름다움</span> · Management Program v.2.1
      <div style={{marginTop:4,fontSize:11}}>PT Wicaksono Berkarya Sejahtera</div>
    </footer>
  );
}

// ----- Form field -----
function Field({ label, hint, error, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {hint && !error && <div className="form-hint">{hint}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// ----- Metric card -----
function Metric({ label, value, sub }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

// ----- Branch badge -----
function BranchBadge({ branch }) {
  if (!branch) return null;
  const cls = branch.status === 'franchise' ? 'badge-gold' : 'badge-mauve';
  return (
    <span className={'badge ' + cls} title={branch.city}>
      {branch.name}
    </span>
  );
}

Object.assign(window, { TopNav, PageHeader, Card, Empty, Loader, ToastStack, AppFooter, Field, Metric, BranchBadge });
