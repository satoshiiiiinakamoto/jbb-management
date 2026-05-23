// ===== Supabase client + shared helpers =====

const SUPABASE_URL = window.__ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV.SUPABASE_ANON_KEY;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ----- Currency formatter -----
function fmtRp(n) {
  if (n === null || n === undefined || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Math.round(Number(n)).toLocaleString('id-ID');
}

function fmtNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(Number(n)).toLocaleString('id-ID');
}

function fmtDate(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(t) {
  if (!t) return '-';
  return t.slice(0, 5);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// ----- Services catalog -----
const SERVICES = [
  { name: 'Eyelash Extension', category: 'lash', baseCommission: 5 },
  { name: 'Lash Lift', category: 'lash', baseCommission: 5 },
  { name: 'Brow Lamination', category: 'lash', baseCommission: 5 },
  { name: 'Sulam Alis', category: 'lash', baseCommission: 5 },
  { name: 'Korean Vit C Glow', category: 'lash', baseCommission: 5 },
  { name: 'Korean BB Glow', category: 'lash', baseCommission: 5 },
  { name: 'Nail Art', category: 'nail', baseCommission: 10 },
  { name: 'Manicure', category: 'nail', baseCommission: 10 },
  { name: 'Pedicure', category: 'nail', baseCommission: 10 },
];

const JOB_TITLES = [
  'Owner',
  'Manager',
  'Senior Therapist',
  'Lash Technician',
  'Nail Artist',
  'Beauty Therapist',
  'Kasir',
];

const ROLES = [
  { value: 'super_admin', label: 'Super Admin (Owner JBB Group)' },
  { value: 'branch_admin', label: 'Branch Admin (Manager Cabang)' },
  { value: 'employee', label: 'Karyawan' },
];

function isOvertime(timeStr) {
  if (!timeStr) return false;
  const h = parseInt(timeStr.split(':')[0]);
  return h >= 18;
}

function getCommissionRate(serviceName, timeStr) {
  const svc = SERVICES.find(s => s.name === serviceName);
  if (!svc) return 0;
  return svc.baseCommission + (isOvertime(timeStr) ? 5 : 0);
}

function getRoleLabel(role) {
  const r = ROLES.find(x => x.value === role);
  return r ? r.label : role;
}

// ----- Toast notifications -----
const toastListeners = new Set();
function toast(message, type = 'default') {
  const t = { id: Math.random().toString(36), message, type };
  toastListeners.forEach(fn => fn(t));
}

function useToasts() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    const listener = (t) => {
      setItems(prev => [...prev, t]);
      setTimeout(() => {
        setItems(prev => prev.filter(x => x.id !== t.id));
      }, 3500);
    };
    toastListeners.add(listener);
    return () => toastListeners.delete(listener);
  }, []);
  return items;
}

// ----- Auth helpers -----
async function loginWithEmail(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function logout() {
  await sb.auth.signOut();
}

async function getCurrentSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function getMyProfile() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile, error } = await sb
    .from('employees')
    .select('*, branch:branches(id, name, city, status)')
    .eq('id', user.id)
    .single();
  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
  return { ...profile, email: user.email };
}

// ===== Branch helpers =====

async function listBranches() {
  const { data, error } = await sb
    .from('branches')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Helper: tentukan role-based access
function canAccessAllBranches(profile) {
  return profile?.role === 'super_admin';
}

function canManageBranch(profile, branchId) {
  if (profile?.role === 'super_admin') return true;
  if (profile?.role === 'branch_admin' && profile?.branch_id === branchId) return true;
  return false;
}

// ===== Employee CRUD (now branch-aware) =====

async function listEmployees(branchId = null) {
  let query = sb
    .from('employees')
    .select('*, branch:branches(id, name, city)')
    .order('created_at', { ascending: true });

  // If branchId specified, filter (super admin doing manual filter)
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function updateEmployee(id, patch) {
  const { data, error } = await sb
    .from('employees')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deactivateEmployee(id) {
  return updateEmployee(id, { is_active: false });
}

async function reactivateEmployee(id) {
  return updateEmployee(id, { is_active: true });
}

// Expose to window
Object.assign(window, {
  sb, SERVICES, JOB_TITLES, ROLES,
  fmtRp, fmtNumber, fmtDate, fmtTime, todayStr, currentMonth,
  isOvertime, getCommissionRate, getRoleLabel, toast, useToasts,
  loginWithEmail, logout, getCurrentSession, getMyProfile,
  listBranches, canAccessAllBranches, canManageBranch,
  listEmployees, updateEmployee, deactivateEmployee, reactivateEmployee,
});
