// ===== Supabase client + shared helpers =====

const SUPABASE_URL = window.__ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV.SUPABASE_ANON_KEY;

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});

// ----- Formatters -----
function fmtRp(n) {
  if (n === null || n === undefined || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Math.round(Number(n)).toLocaleString('id-ID');
}

function fmtRpOrDash(n) {
  if (!n || n === 0 || isNaN(n)) return '—';
  return fmtRp(n);
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

function nowTimeStr() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// =====================================================
// SERVICES CATALOG
// =====================================================
const SERVICES = [
  { name: 'Korean Natural (Eyelash)', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Skinny Volume (Eyelash)', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Russian Volume (Eyelash)', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Anime Volume (Eyelash)', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Lash Lift', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Brow Lamination', category: 'brow', commission_type: 'percent', baseRate: 5 },
  { name: 'Brow Bomber', category: 'brow', commission_type: 'percent', baseRate: 5 },
  { name: 'Sulam Alis', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Korean Vit C Glow', category: 'facial', commission_type: 'percent', baseRate: 5 },
  { name: 'Korean BB Glow', category: 'facial', commission_type: 'percent', baseRate: 5 },
  { name: 'Nail Art', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Nail Polish (Polos)', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Nail Extension', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Manicure', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Pedicure', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Menipedi', category: 'nail', commission_type: 'percent', baseRate: 10 },
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

// Jabatan yang tidak wajib gaji pokok (biasanya owner/manager dapat profit sharing, bukan gaji)
const SALARY_OPTIONAL_TITLES = ['Owner', 'Manager'];

function isSalaryOptional(jobTitle) {
  return SALARY_OPTIONAL_TITLES.includes(jobTitle);
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin (Owner JBB Group)' },
  { value: 'branch_admin', label: 'Branch Admin (Manager Cabang)' },
  { value: 'employee', label: 'Karyawan' },
];

// =====================================================
// Commission calculator
// =====================================================
function isOvertime(timeStr) {
  if (!timeStr) return false;
  const h = parseInt(timeStr.split(':')[0]);
  return h >= 18;
}

function getServiceDef(serviceName) {
  return SERVICES.find(s => s.name === serviceName);
}

function calcCommission({ serviceName, price, fixedAmount, isOT, branchId }) {
  const svc = getServiceDef(serviceName);
  if (!svc) return { rate: 0, amount: 0, type: 'percent' };

  if (svc.commission_type === 'percent') {
    const rate = svc.baseRate + (isOT ? 5 : 0);
    const amount = Math.round((Number(price) || 0) * rate / 100);
    return { rate, amount, type: 'percent' };
  }

  let amount = Number(fixedAmount) || 0;
  if (isOT && branchId !== 'bdg') {
    amount += 5000;
  }
  return { rate: 0, amount, type: 'fixed_amount' };
}

function getRoleLabel(role) {
  const r = ROLES.find(x => x.value === role);
  return r ? r.label : role;
}

// =====================================================
// Toast
// =====================================================
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

// =====================================================
// Auth
// =====================================================
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

// =====================================================
// Branches
// =====================================================
async function listBranches() {
  const { data, error } = await sb
    .from('branches')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

function canAccessAllBranches(profile) {
  return profile?.role === 'super_admin';
}

function canManageBranch(profile, branchId) {
  if (profile?.role === 'super_admin') return true;
  if (profile?.role === 'branch_admin' && profile?.branch_id === branchId) return true;
  return false;
}

// =====================================================
// Employees
// =====================================================
async function listEmployees(branchId = null, activeOnly = true) {
  let query = sb
    .from('employees')
    .select('*, branch:branches(id, name, city)')
    .order('full_name', { ascending: true });
  if (branchId) query = query.eq('branch_id', branchId);
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function updateEmployee(id, patch) {
  const { data, error } = await sb
    .from('employees').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

async function deactivateEmployee(id) {
  return updateEmployee(id, { is_active: false });
}

async function reactivateEmployee(id) {
  return updateEmployee(id, { is_active: true });
}

// =====================================================
// CREATE EMPLOYEE (via Edge Function)
// =====================================================
async function createEmployee(payload) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Sesi login tidak ditemukan');

  const url = `${SUPABASE_URL}/functions/v1/create-employee`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  const result = await resp.json();
  if (!resp.ok || result.error) {
    throw new Error(result.error || `HTTP ${resp.status}`);
  }
  return result.employee;
}

// =====================================================
// DELETE EMPLOYEE (permanent, via Edge Function)
// =====================================================
async function deleteEmployee(employeeId) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Sesi login tidak ditemukan');

  const url = `${SUPABASE_URL}/functions/v1/delete-employee`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ employee_id: employeeId }),
  });

  const result = await resp.json();
  if (!resp.ok || result.error) {
    const err = new Error(result.error || `HTTP ${resp.status}`);
    err.hasTransactions = result.has_transactions;
    err.transactionCount = result.transaction_count;
    throw err;
  }
  return result;
}

// =====================================================
// Clients
// =====================================================
async function findClientByPhone(branchId, phone) {
  if (!phone || !phone.trim()) return null;
  const { data, error } = await sb
    .from('clients')
    .select('*')
    .eq('branch_id', branchId)
    .eq('phone', phone.trim())
    .maybeSingle();
  if (error) {
    console.error('Find client error:', error);
    return null;
  }
  return data;
}

async function upsertClient(branchId, fullName, phone) {
  const { data, error } = await sb.rpc('upsert_client', {
    p_branch_id: branchId,
    p_full_name: fullName,
    p_phone: phone || null,
  });
  if (error) throw error;
  return data;
}

// =====================================================
// Transactions
// =====================================================
async function createTransaction({
  branchId, clientName, clientPhone, date, startTime,
  isHomeService, homeServiceFee, notes, items, createdBy,
}) {
  const isOT = isOvertime(startTime);
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + (Number(it.commission_amount) || 0), 0);

  let clientId = null;
  if (clientName && clientName.trim()) {
    try {
      clientId = await upsertClient(branchId, clientName.trim(), clientPhone);
    } catch (err) {
      console.warn('Client upsert failed:', err);
    }
  }

  const { data: trx, error: trxErr } = await sb
    .from('transactions')
    .insert({
      branch_id: branchId,
      client_id: clientId,
      client_name_snapshot: clientName?.trim() || null,
      client_phone_snapshot: clientPhone?.trim() || null,
      date, start_time: startTime,
      is_overtime: isOT,
      is_home_service: !!isHomeService,
      home_service_fee: Number(homeServiceFee) || 0,
      total_amount: totalAmount,
      total_commission: totalCommission + (isHomeService ? (Number(homeServiceFee) || 0) : 0),
      notes: notes || null,
      created_by: createdBy,
    })
    .select().single();

  if (trxErr) throw trxErr;

  const itemRows = items.map(it => {
    const svc = getServiceDef(it.service_name);
    return {
      transaction_id: trx.id,
      branch_id: branchId,
      employee_id: it.employee_id,
      service_name: it.service_name,
      service_category: svc?.category || 'other',
      price: Number(it.price) || 0,
      commission_type: it.commission_type,
      commission_rate: Number(it.commission_rate) || 0,
      commission_amount: Number(it.commission_amount) || 0,
      notes: it.notes || null,
    };
  });

  const { error: itemErr } = await sb.from('transaction_items').insert(itemRows);
  if (itemErr) {
    await sb.from('transactions').delete().eq('id', trx.id);
    throw itemErr;
  }
  return trx;
}

async function listRecentTransactions(branchId = null, limit = 20) {
  let query = sb
    .from('transactions')
    .select('*, items:transaction_items(*, employee:employees(full_name)), branch:branches(name)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getTodayStats(branchId = null) {
  const today = todayStr();
  let query = sb
    .from('transactions')
    .select('total_amount, total_commission')
    .eq('date', today);
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) return { count: 0, total: 0, commission: 0 };
  return {
    count: (data || []).length,
    total: (data || []).reduce((s, r) => s + Number(r.total_amount || 0), 0),
    commission: (data || []).reduce((s, r) => s + Number(r.total_commission || 0), 0),
  };
}

async function getMonthStats(branchId = null) {
  const ym = currentMonth();
  const firstDay = ym + '-01';
  const nextMonth = new Date(ym + '-01');
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextFirst = nextMonth.toISOString().split('T')[0];

  let query = sb
    .from('transactions')
    .select('total_amount')
    .gte('date', firstDay)
    .lt('date', nextFirst);
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) return { total: 0 };
  return { total: (data || []).reduce((s, r) => s + Number(r.total_amount || 0), 0) };
}

// Expose
Object.assign(window, {
  sb, SERVICES, JOB_TITLES, SALARY_OPTIONAL_TITLES, ROLES,
  fmtRp, fmtRpOrDash, fmtNumber, fmtDate, fmtTime, todayStr, nowTimeStr, currentMonth,
  isOvertime, isSalaryOptional, getServiceDef, calcCommission, getRoleLabel,
  toast, useToasts,
  loginWithEmail, logout, getCurrentSession, getMyProfile,
  listBranches, canAccessAllBranches, canManageBranch,
  listEmployees, updateEmployee, deactivateEmployee, reactivateEmployee,
  createEmployee, deleteEmployee,
  findClientByPhone, upsertClient,
  createTransaction, listRecentTransactions, getTodayStats, getMonthStats,
});
