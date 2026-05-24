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

// =====================================================
// Date Range Presets (Senin = awal minggu, ISO 8601)
// =====================================================

function startOfWeekMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Distance back to Monday. If today is Sun (0), back 6 days. If Mon (1), back 0.
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeekSunday(date = new Date()) {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function dateToYMD(d) {
  // Format Date object to YYYY-MM-DD (local time, not UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DATE_PRESETS = [
  {
    id: 'today',
    label: 'Hari Ini',
    getRange() {
      const t = todayStr();
      return { from: t, to: t };
    }
  },
  {
    id: 'yesterday',
    label: 'Kemarin',
    getRange() {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const y = dateToYMD(d);
      return { from: y, to: y };
    }
  },
  {
    id: 'this_week',
    label: 'Minggu Ini',
    getRange() {
      const start = startOfWeekMonday();
      const end = endOfWeekSunday();
      return { from: dateToYMD(start), to: dateToYMD(end) };
    }
  },
  {
    id: 'last_week',
    label: 'Minggu Lalu',
    getRange() {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const start = startOfWeekMonday(d);
      const end = endOfWeekSunday(d);
      return { from: dateToYMD(start), to: dateToYMD(end) };
    }
  },
  {
    id: 'this_month',
    label: 'Bulan Ini',
    getRange() {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: dateToYMD(first), to: dateToYMD(last) };
    }
  },
  {
    id: 'last_month',
    label: 'Bulan Lalu',
    getRange() {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: dateToYMD(first), to: dateToYMD(last) };
    }
  },
  {
    id: 'custom',
    label: 'Custom',
    getRange() { return null; } // Caller handles custom
  },
];

// =====================================================
// REPORTS — Query Functions
// =====================================================

// Get all transactions in date range (with items)
async function getReportTransactions({ from, to, branchId = null, employeeId = null }) {
  let query = sb
    .from('transactions')
    .select('*, items:transaction_items(*, employee:employees(id, full_name, job_title)), branch:branches(id, name)')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (branchId) query = query.eq('branch_id', branchId);

  const { data, error } = await query;
  if (error) throw error;

  let result = data || [];

  // If employee filter set, filter transactions that have at least one item by that employee
  if (employeeId) {
    result = result.filter(t =>
      (t.items || []).some(it => it.employee_id === employeeId)
    );
  }

  return result;
}

// Aggregate stats from transactions
function aggregateReport(transactions, employeeFilter = null) {
  const trxs = transactions || [];
  const allItems = trxs.flatMap(t => (t.items || []).map(it => ({ ...it, _trx: t })));
  const items = employeeFilter
    ? allItems.filter(it => it.employee_id === employeeFilter)
    : allItems;

  // Totals
  const totalRevenue = employeeFilter
    ? items.reduce((s, it) => s + Number(it.price || 0), 0)
    : trxs.reduce((s, t) => s + Number(t.total_amount || 0), 0);

  const totalCommission = items.reduce((sum, it) => sum + Number(it.commission_amount || 0), 0);
  const totalHomeServiceFee = employeeFilter
    ? 0  // HS fee tied to transaction, not employee — skip when filtering by employee
    : trxs.filter(t => t.is_home_service).reduce((s, t) => s + Number(t.home_service_fee || 0), 0);

  const trxCount = employeeFilter
    ? new Set(items.map(it => it.transaction_id)).size
    : trxs.length;

  const itemCount = items.length;
  const avgPerTrx = trxCount > 0 ? totalRevenue / trxCount : 0;

  // Breakdown by service category
  const byCategory = {};
  for (const it of items) {
    const cat = it.service_category || 'other';
    if (!byCategory[cat]) byCategory[cat] = { count: 0, revenue: 0, commission: 0 };
    byCategory[cat].count += 1;
    byCategory[cat].revenue += Number(it.price || 0);
    byCategory[cat].commission += Number(it.commission_amount || 0);
  }

  // Breakdown by service name (top services)
  const byService = {};
  for (const it of items) {
    const name = it.service_name;
    if (!byService[name]) byService[name] = { count: 0, revenue: 0, commission: 0 };
    byService[name].count += 1;
    byService[name].revenue += Number(it.price || 0);
    byService[name].commission += Number(it.commission_amount || 0);
  }

  // Top performers (by employee commission)
  const byEmployee = {};
  for (const it of items) {
    const empId = it.employee_id;
    if (!empId) continue;
    if (!byEmployee[empId]) {
      byEmployee[empId] = {
        employee_id: empId,
        full_name: it.employee?.full_name || '—',
        job_title: it.employee?.job_title || '',
        items: 0,
        revenue: 0,
        commission: 0,
      };
    }
    byEmployee[empId].items += 1;
    byEmployee[empId].revenue += Number(it.price || 0);
    byEmployee[empId].commission += Number(it.commission_amount || 0);
  }
  const topPerformers = Object.values(byEmployee)
    .sort((a, b) => b.commission - a.commission);

  // Top spenders (by client total spend)
  const byClient = {};
  for (const t of trxs) {
    const key = t.client_phone_snapshot || t.client_name_snapshot || t.id;
    if (!byClient[key]) {
      byClient[key] = {
        name: t.client_name_snapshot || '—',
        phone: t.client_phone_snapshot || '',
        visits: 0,
        spent: 0,
      };
    }
    byClient[key].visits += 1;
    byClient[key].spent += Number(t.total_amount || 0);
  }
  const topSpenders = Object.values(byClient)
    .sort((a, b) => b.spent - a.spent);

  // Overtime stats
  const overtimeTrxs = trxs.filter(t => t.is_overtime).length;
  const homeServiceTrxs = trxs.filter(t => t.is_home_service).length;

  return {
    totalRevenue,
    totalCommission,
    totalHomeServiceFee,
    trxCount,
    itemCount,
    avgPerTrx,
    byCategory,
    byService,
    topPerformers,
    topSpenders,
    overtimeTrxs,
    homeServiceTrxs,
  };
}

// =====================================================
// PAYROLL — Period Helpers (matches DB get_payroll_period)
// =====================================================

// Get payroll period for a given date.
// Period rule: tanggal 26 bulan X → tanggal 25 bulan X+1
function getPayrollPeriod(date = new Date()) {
  const d = new Date(date);
  const day = d.getDate();
  let startYear, startMonth, endYear, endMonth;

  if (day >= 26) {
    // Periode mulai dari tanggal 26 bulan ini
    startYear = d.getFullYear();
    startMonth = d.getMonth();
    endYear = (startMonth === 11) ? startYear + 1 : startYear;
    endMonth = (startMonth + 1) % 12;
  } else {
    // Periode bulan sebelumnya (26 bulan lalu → 25 bulan ini)
    endYear = d.getFullYear();
    endMonth = d.getMonth();
    startYear = (endMonth === 0) ? endYear - 1 : endYear;
    startMonth = (endMonth === 0) ? 11 : endMonth - 1;
  }

  const periodStart = new Date(startYear, startMonth, 26);
  const periodEnd = new Date(endYear, endMonth, 25);
  return {
    period_start: dateToYMD(periodStart),
    period_end: dateToYMD(periodEnd),
    period_start_date: periodStart,
    period_end_date: periodEnd,
  };
}

// Get payroll period by year & month-of-end (the month containing the 25th)
function getPayrollPeriodForMonth(year, month) {
  // month is 1-12 (Jan=1)
  const periodEnd = new Date(year, month - 1, 25);
  const startMonth = month === 1 ? 12 : month - 1;
  const startYear = month === 1 ? year - 1 : year;
  const periodStart = new Date(startYear, startMonth - 1, 26);
  return {
    period_start: dateToYMD(periodStart),
    period_end: dateToYMD(periodEnd),
    period_start_date: periodStart,
    period_end_date: periodEnd,
  };
}

// Generate list of recent payroll periods (e.g. last 12 months) for dropdown
function listRecentPayrollPeriods(count = 12) {
  const list = [];
  const now = new Date();
  // Start from current period
  const currentPeriod = getPayrollPeriod(now);
  let year = currentPeriod.period_end_date.getFullYear();
  let month = currentPeriod.period_end_date.getMonth() + 1; // 1-12

  for (let i = 0; i < count; i++) {
    const p = getPayrollPeriodForMonth(year, month);
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    list.push({
      id: `${year}-${String(month).padStart(2,'0')}`,
      year,
      month,
      label: `${monthNames[month-1]} ${year}`,
      range_label: `26 ${monthNames[startMonthForPeriod(month)-1]} – 25 ${monthNames[month-1]} ${year}`,
      ...p,
    });
    // Previous month
    month -= 1;
    if (month < 1) { month = 12; year -= 1; }
  }
  return list;
}

function startMonthForPeriod(endMonth) {
  return endMonth === 1 ? 12 : endMonth - 1;
}

// =====================================================
// PAYROLL — Data Functions
// =====================================================

// List employees eligible for payroll (excludes Owner/Manager who get profit sharing)
async function listPayrollEligibleEmployees(branchId = null) {
  let query = sb
    .from('employees')
    .select('*, branch:branches(id, name)')
    .eq('is_active', true)
    .not('job_title', 'in', '("Owner","Manager")')
    .order('full_name', { ascending: true });

  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get commission totals per employee in a period
async function getPeriodCommissionByEmployee(periodStart, periodEnd, branchId = null) {
  let query = sb
    .from('transaction_items')
    .select('employee_id, commission_amount, transactions!inner(date, is_home_service, home_service_fee, branch_id)')
    .gte('transactions.date', periodStart)
    .lte('transactions.date', periodEnd);

  if (branchId) query = query.eq('transactions.branch_id', branchId);

  const { data, error } = await query;
  if (error) throw error;

  // Aggregate by employee
  const byEmployee = {};
  for (const row of (data || [])) {
    const empId = row.employee_id;
    if (!byEmployee[empId]) {
      byEmployee[empId] = {
        employee_id: empId,
        treatment_commission: 0,
        items_count: 0,
        transaction_ids: new Set(),
      };
    }
    byEmployee[empId].treatment_commission += Number(row.commission_amount || 0);
    byEmployee[empId].items_count += 1;
    byEmployee[empId].transaction_ids.add(row.transactions?.id);
  }

  // Home service fees (counted at transaction level, but we need to attribute to employees who worked on it)
  // For simplicity: HS fee → all items in that transaction share it equally
  // We need a separate query for transactions with HS
  let hsQuery = sb
    .from('transactions')
    .select('id, home_service_fee, items:transaction_items(employee_id)')
    .gte('date', periodStart)
    .lte('date', periodEnd)
    .eq('is_home_service', true);

  if (branchId) hsQuery = hsQuery.eq('branch_id', branchId);

  const { data: hsData, error: hsErr } = await hsQuery;
  if (!hsErr && hsData) {
    for (const trx of hsData) {
      const fee = Number(trx.home_service_fee || 0);
      const empIds = [...new Set((trx.items || []).map(i => i.employee_id).filter(Boolean))];
      if (empIds.length > 0 && fee > 0) {
        const perEmp = fee / empIds.length;
        for (const empId of empIds) {
          if (!byEmployee[empId]) {
            byEmployee[empId] = {
              employee_id: empId,
              treatment_commission: 0,
              items_count: 0,
              transaction_ids: new Set(),
              hs_commission: 0,
            };
          }
          byEmployee[empId].hs_commission = (byEmployee[empId].hs_commission || 0) + perEmp;
        }
      }
    }
  }

  return byEmployee;
}

// Get payroll adjustments for a period (all employees)
async function listPayrollAdjustments(periodStart, branchId = null) {
  let query = sb
    .from('payroll_adjustments')
    .select('*')
    .eq('period_start', periodStart);

  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Upsert payroll adjustment
async function upsertPayrollAdjustment(payload) {
  // payload: { employee_id, branch_id, period_start, period_end, standard_work_days,
  //           annual_leave_days, sick_leave_certified_days, unpaid_leave_days,
  //           bonus, extra_deduction, notes, adjusted_by }
  const { data, error } = await sb
    .from('payroll_adjustments')
    .upsert(payload, { onConflict: 'employee_id,period_start' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get annual leave balances for employees in a year
async function getAnnualLeaveBalances(year, branchId = null) {
  let query = sb
    .from('annual_leave_balance')
    .select('*')
    .eq('year', year);

  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Calculate full payroll details for one employee
// Pure function — no async, takes all needed data
function calculatePayroll({ employee, commissions, adjustment, defaultStandardDays = 26 }) {
  const baseSalary = Number(employee.base_salary) || 0;
  const mealAllowance = Number(employee.meal_allowance) || 0;
  const treatmentCommission = Number(commissions?.treatment_commission || 0);
  const hsCommission = Number(commissions?.hs_commission || 0);

  // Adjustments (or defaults if no adjustment row exists)
  const standardDays = Number(adjustment?.standard_work_days) || defaultStandardDays;
  const annualLeave = Number(adjustment?.annual_leave_days) || 0;
  const sickCertified = Number(adjustment?.sick_leave_certified_days) || 0;
  const unpaidLeave = Number(adjustment?.unpaid_leave_days) || 0;
  const bonus = Number(adjustment?.bonus) || 0;
  const extraDeduction = Number(adjustment?.extra_deduction) || 0;

  // Calculate prorated base salary (only unpaid leave reduces it)
  const baseSalaryActual = unpaidLeave > 0
    ? Math.round(baseSalary * (1 - unpaidLeave / standardDays))
    : baseSalary;

  const salaryDeduction = baseSalary - baseSalaryActual;

  // Total take-home
  const total = baseSalaryActual + mealAllowance + treatmentCommission + hsCommission + bonus - extraDeduction;

  return {
    base_salary: baseSalary,
    base_salary_actual: baseSalaryActual,
    salary_deduction: salaryDeduction,
    meal_allowance: mealAllowance,
    treatment_commission: treatmentCommission,
    hs_commission: hsCommission,
    annual_leave_days: annualLeave,
    sick_leave_certified_days: sickCertified,
    unpaid_leave_days: unpaidLeave,
    standard_work_days: standardDays,
    bonus,
    extra_deduction: extraDeduction,
    total,
  };
}

// =====================================================
// AUDIT LOG — Only accessible by super_admin
// =====================================================

async function listAuditLog({ limit = 100, tableName = null, action = null, userId = null, branchId = null, dateFrom = null, dateTo = null } = {}) {
  let query = sb
    .from('audit_log_readable')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (tableName) query = query.eq('table_name', tableName);
  if (action) query = query.eq('action', action);
  if (userId) query = query.eq('changed_by', userId);
  if (branchId) query = query.eq('branch_id', branchId);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getAuditSummary(days = 7) {
  const { data, error } = await sb.rpc('get_audit_summary', { p_days: days });
  if (error) throw error;
  return data?.[0] || { total_changes: 0, inserts: 0, updates: 0, deletes: 0, active_users: 0 };
}

// Helper to format JSON diff for display (for UPDATE actions)
function formatAuditDiff(oldData, newData, changedFields) {
  if (!changedFields || !changedFields.length) return [];
  return changedFields.map(field => ({
    field,
    old: oldData ? oldData[field] : null,
    new: newData ? newData[field] : null,
  }));
}

// Friendly label for action
function getActionLabel(action) {
  const map = { INSERT: 'Tambah', UPDATE: 'Edit', DELETE: 'Hapus' };
  return map[action] || action;
}

function getActionColor(action) {
  const map = { INSERT: 'var(--green)', UPDATE: 'var(--mauve)', DELETE: 'var(--red)' };
  return map[action] || 'var(--muted)';
}

function getActionBadge(action) {
  const map = { INSERT: 'badge-green', UPDATE: 'badge-mauve', DELETE: 'badge-red' };
  return map[action] || 'badge-mauve';
}

// Field label translations
const AUDIT_FIELD_LABELS = {
  // transactions
  date: 'Tanggal',
  start_time: 'Jam Mulai',
  total_amount: 'Total Omset',
  total_commission: 'Total Komisi',
  is_overtime: 'Lembur',
  is_home_service: 'Home Service',
  home_service_fee: 'Biaya HS',
  client_name_snapshot: 'Nama Pelanggan',
  client_phone_snapshot: 'HP Pelanggan',
  notes: 'Catatan',
  // transaction_items
  service_name: 'Treatment',
  price: 'Harga',
  commission_amount: 'Komisi',
  commission_rate: 'Rate Komisi',
  commission_type: 'Tipe Komisi',
  employee_id: 'Karyawan',
  // employees
  full_name: 'Nama',
  username: 'Username',
  job_title: 'Jabatan',
  role: 'Role',
  base_salary: 'Gaji Pokok',
  meal_allowance: 'Uang Makan',
  branch_id: 'Cabang',
  is_active: 'Status Aktif',
  // payroll
  standard_work_days: 'Standar Hari Kerja',
  annual_leave_days: 'Cuti Tahunan',
  sick_leave_certified_days: 'Sakit + Surat',
  unpaid_leave_days: 'Izin/Mangkir',
  bonus: 'Bonus',
  extra_deduction: 'Potongan Tambahan',
  // clients
  full_name: 'Nama',
  phone: 'HP',
  total_visits: 'Total Kunjungan',
  total_spent: 'Total Belanja',
};

function getFieldLabel(field) {
  return AUDIT_FIELD_LABELS[field] || field;
}

// Format value for display in audit (currency, dates, booleans)
function formatAuditValue(field, value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (['base_salary','meal_allowance','total_amount','total_commission','home_service_fee','price','commission_amount','bonus','extra_deduction','total_spent'].includes(field)) {
    return fmtRp(value);
  }
  if (field === 'date') return fmtDate(value);
  if (field === 'start_time') return fmtTime(value);
  if (typeof value === 'string' && value.length > 60) {
    return value.slice(0, 60) + '…';
  }
  return String(value);
}

// =====================================================
// EXCEL EXPORT — pakai SheetJS (xlsx library, loaded via CDN)
// =====================================================

// Generic: export array of objects to .xlsx
function exportToExcel(filename, sheets) {
  // sheets: [{ name: 'Sheet1', rows: [{col1: val, col2: val}, ...] }, ...]
  if (typeof XLSX === 'undefined') {
    toast('Library Excel belum ter-load. Refresh halaman.', 'error');
    return;
  }

  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows || []);

    // Auto-fit column widths (approximate)
    if (sheet.rows && sheet.rows.length > 0) {
      const cols = Object.keys(sheet.rows[0]).map(key => {
        let maxLen = key.length;
        for (const row of sheet.rows) {
          const val = String(row[key] ?? '');
          if (val.length > maxLen) maxLen = val.length;
        }
        return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
      });
      ws['!cols'] = cols;
    }

    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));  // Max 31 chars
  }

  // Generate & download
  const today = todayStr();
  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}_${today}.xlsx`;
  XLSX.writeFile(wb, finalName);
}

// Export report data (transactions list + aggregates)
function exportReportToExcel({ transactions, stats, periodLabel, branchLabel }) {
  const sheets = [];

  // Sheet 1: Summary
  sheets.push({
    name: 'Ringkasan',
    rows: [
      { Metric: 'Periode', Nilai: periodLabel },
      { Metric: 'Cabang', Nilai: branchLabel },
      { Metric: 'Total Omset', Nilai: stats.totalRevenue },
      { Metric: 'Total Komisi', Nilai: stats.totalCommission },
      { Metric: 'Jumlah Transaksi', Nilai: stats.trxCount },
      { Metric: 'Jumlah Treatment', Nilai: stats.itemCount },
      { Metric: 'Rata-rata per Transaksi', Nilai: Math.round(stats.avgPerTrx) },
      { Metric: 'Transaksi Lembur', Nilai: stats.overtimeTrxs },
      { Metric: 'Transaksi Home Service', Nilai: stats.homeServiceTrxs },
    ],
  });

  // Sheet 2: Transaksi Detail
  const trxRows = [];
  for (const t of transactions) {
    for (const item of (t.items || [])) {
      trxRows.push({
        Tanggal: t.date,
        Jam: t.start_time?.slice(0, 5) || '',
        Cabang: t.branch?.name || '',
        Pelanggan: t.client_name_snapshot || '',
        'No HP': t.client_phone_snapshot || '',
        Karyawan: item.employee?.full_name || '',
        Treatment: item.service_name,
        Kategori: item.service_category,
        Harga: Number(item.price) || 0,
        Komisi: Number(item.commission_amount) || 0,
        Lembur: t.is_overtime ? 'Ya' : 'Tidak',
        'Home Service': t.is_home_service ? 'Ya' : 'Tidak',
        'Biaya HS': Number(t.home_service_fee) || 0,
      });
    }
  }
  sheets.push({ name: 'Transaksi Detail', rows: trxRows });

  // Sheet 3: Top Performer
  const performerRows = stats.topPerformers.map((emp, i) => ({
    Rank: i + 1,
    Karyawan: emp.full_name,
    Jabatan: emp.job_title,
    Treatment: emp.items,
    Revenue: emp.revenue,
    Komisi: emp.commission,
  }));
  sheets.push({ name: 'Top Performer', rows: performerRows });

  // Sheet 4: Top Pelanggan
  const spenderRows = stats.topSpenders.map((c, i) => ({
    Rank: i + 1,
    Nama: c.name,
    HP: c.phone || '',
    Kunjungan: c.visits,
    'Total Belanja': c.spent,
  }));
  sheets.push({ name: 'Top Pelanggan', rows: spenderRows });

  // Sheet 5: Per Kategori
  const categoryRows = Object.entries(stats.byCategory).map(([cat, d]) => ({
    Kategori: cat,
    'Jumlah Treatment': d.count,
    Revenue: d.revenue,
    Komisi: d.commission,
    '% dari Omset': stats.totalRevenue > 0 ? Math.round(d.revenue / stats.totalRevenue * 100) : 0,
  }));
  sheets.push({ name: 'Per Kategori', rows: categoryRows });

  // Sheet 6: Per Treatment
  const serviceRows = Object.entries(stats.byService)
    .sort(([,a], [,b]) => b.count - a.count)
    .map(([name, d]) => ({
      Treatment: name,
      Jumlah: d.count,
      Revenue: d.revenue,
      Komisi: d.commission,
    }));
  sheets.push({ name: 'Per Treatment', rows: serviceRows });

  const fname = `JBB_Laporan_${(branchLabel || 'all').replace(/\s/g, '_')}_${periodLabel.replace(/\s/g,'_').replace(/[\/]/g,'-')}`;
  exportToExcel(fname, sheets);
}

// Export payroll to Excel
function exportPayrollToExcel({ rows, periodLabel, branchLabel, totals }) {
  const sheets = [];

  // Sheet 1: Ringkasan
  sheets.push({
    name: 'Ringkasan',
    rows: [
      { Metric: 'Periode', Nilai: periodLabel },
      { Metric: 'Cabang', Nilai: branchLabel },
      { Metric: 'Jumlah Karyawan', Nilai: rows.length },
      { Metric: 'Total Gaji Pokok (setelah potong)', Nilai: totals.base },
      { Metric: 'Total Uang Makan', Nilai: totals.meal },
      { Metric: 'Total Komisi', Nilai: totals.commission },
      { Metric: 'Total Bonus', Nilai: totals.bonus },
      { Metric: 'Total Potongan Tambahan', Nilai: totals.deduction },
      { Metric: 'TOTAL PAYROLL', Nilai: totals.total },
    ],
  });

  // Sheet 2: Detail per Karyawan
  const payrollRows = rows.map(r => ({
    Nama: r.employee.full_name,
    Jabatan: r.employee.job_title,
    Cabang: r.employee.branch?.name || '',
    'Gaji Pokok (Asli)': r.payroll.base_salary,
    'Gaji Pokok (Aktual)': r.payroll.base_salary_actual,
    Potongan: r.payroll.salary_deduction,
    'Uang Makan': r.payroll.meal_allowance,
    'Komisi Treatment': r.payroll.treatment_commission,
    'Komisi HS': r.payroll.hs_commission,
    'Cuti Tahunan (hari)': r.payroll.annual_leave_days,
    'Sakit + Surat (hari)': r.payroll.sick_leave_certified_days,
    'Izin/Mangkir (hari)': r.payroll.unpaid_leave_days,
    'Standar Hari Kerja': r.payroll.standard_work_days,
    Bonus: r.payroll.bonus,
    'Potongan Tambahan': r.payroll.extra_deduction,
    'TOTAL GAJI': r.payroll.total,
  }));
  sheets.push({ name: 'Detail Gaji', rows: payrollRows });

  const fname = `JBB_RekapGaji_${(branchLabel || 'all').replace(/\s/g, '_')}_${periodLabel.replace(/\s/g,'_').replace(/[\/]/g,'-')}`;
  exportToExcel(fname, sheets);
}

// =====================================================
// SLIP GAJI — Generate HTML for printing
// =====================================================

// Determine brand for a branch
function getBrandForBranch(branchId) {
  // VIALI Tangerang punya brand sendiri
  if (branchId === 'vli') {
    return {
      name: 'VIALI',
      tagline: 'BEAUTY',
      color: '#7a667e',
    };
  }
  return {
    name: 'JBB',
    tagline: '아름다움',
    color: '#7a667e',
  };
}

// Fetch transactions for an employee in a period (for slip detail)
async function getEmployeePeriodTransactions(employeeId, periodStart, periodEnd) {
  const { data, error } = await sb
    .from('transaction_items')
    .select(`
      id, service_name, price, commission_amount, commission_rate, commission_type,
      transaction:transactions(
        id, date, start_time, is_overtime, is_home_service, home_service_fee,
        client_name_snapshot, client_phone_snapshot
      )
    `)
    .eq('employee_id', employeeId)
    .gte('transaction.date', periodStart)
    .lte('transaction.date', periodEnd);

  if (error) throw error;

  // Filter out rows where transaction is null (RLS edge case)
  return (data || []).filter(r => r.transaction);
}

// Generate slip HTML for one employee
function generateSlipHTML({ employee, payroll, items, period, branch, generatedBy }) {
  const brand = getBrandForBranch(employee.branch_id);
  const periodStartFmt = fmtDate(period.period_start);
  const periodEndFmt = fmtDate(period.period_end);
  const generatedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Sort items by date
  const sortedItems = [...items].sort((a, b) => {
    const dA = a.transaction?.date || '';
    const dB = b.transaction?.date || '';
    return dA.localeCompare(dB);
  });

  // Group by transaction
  const byTrx = {};
  for (const it of sortedItems) {
    const tid = it.transaction?.id;
    if (!tid) continue;
    if (!byTrx[tid]) {
      byTrx[tid] = {
        date: it.transaction.date,
        start_time: it.transaction.start_time,
        is_overtime: it.transaction.is_overtime,
        is_home_service: it.transaction.is_home_service,
        home_service_fee: Number(it.transaction.home_service_fee || 0),
        client_name: it.transaction.client_name_snapshot || '—',
        client_phone: it.transaction.client_phone_snapshot || '',
        items: [],
      };
    }
    byTrx[tid].items.push(it);
  }

  // Build transaction detail rows
  let detailRows = '';
  let runningCommission = 0;
  const trxList = Object.values(byTrx).sort((a, b) => a.date.localeCompare(b.date));

  for (const trx of trxList) {
    for (let i = 0; i < trx.items.length; i++) {
      const it = trx.items[i];
      const isFirst = i === 0;
      runningCommission += Number(it.commission_amount || 0);
      detailRows += `
        <tr>
          <td class="cell-date">${isFirst ? fmtDate(trx.date) : ''}</td>
          <td class="cell-time">${isFirst ? fmtTime(trx.start_time) : ''}</td>
          <td class="cell-client">${isFirst ? escapeHtml(trx.client_name) : ''}</td>
          <td class="cell-service">
            ${escapeHtml(it.service_name)}
            ${trx.is_overtime && isFirst ? '<span class="tag tag-amber">lembur</span>' : ''}
            ${trx.is_home_service && isFirst ? '<span class="tag tag-gold">HS</span>' : ''}
          </td>
          <td class="cell-num">${fmtRp(it.price)}</td>
          <td class="cell-num cell-commission">${fmtRp(it.commission_amount)}</td>
        </tr>
      `;
    }
    // Home service fee row (counted separately, distributed by lib calculation already)
  }

  // Empty state
  if (!trxList.length) {
    detailRows = `
      <tr><td colspan="6" class="cell-empty">Tidak ada transaksi di periode ini.</td></tr>
    `;
  }

  const hsCommission = payroll.hs_commission || 0;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Slip Gaji — ${escapeHtml(employee.full_name)} — ${periodEndFmt}</title>
<style>
  @page { size: A4; margin: 15mm 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #241a2c;
    margin: 0;
    padding: 0;
    line-height: 1.5;
    font-size: 12px;
    background: #fff;
  }
  .slip {
    max-width: 800px;
    margin: 0 auto;
    padding: 0;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 2px solid #3d2e44;
  }
  .brand {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 36px;
    font-weight: 400;
    color: ${brand.color};
    letter-spacing: 0.04em;
    line-height: 1;
  }
  .brand-tag {
    font-size: 14px;
    color: #7a667e;
    margin-left: 10px;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .doc-title {
    text-align: right;
  }
  .doc-title .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #7a667e;
    margin-bottom: 4px;
  }
  .doc-title h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    margin: 0;
    color: #241a2c;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 24px;
    padding: 14px 16px;
    background: #f3eef5;
    border-radius: 10px;
    margin-bottom: 18px;
    font-size: 12px;
  }
  .meta-item .label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #7a667e;
    margin-bottom: 2px;
  }
  .meta-item .value {
    font-weight: 500;
    color: #241a2c;
  }
  .section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #7a667e;
    margin: 18px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e8e0ea;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-bottom: 8px;
  }
  th {
    text-align: left;
    padding: 8px 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #7a667e;
    font-weight: 500;
    border-bottom: 1px solid #d4c8d8;
  }
  td {
    padding: 6px 6px;
    border-bottom: 1px solid #f1ecf3;
    vertical-align: top;
  }
  .cell-num { text-align: right; font-variant-numeric: tabular-nums; }
  .cell-commission { color: #7a667e; font-weight: 500; }
  .cell-date { white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
  .cell-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #6b5b6e; }
  .cell-client { font-weight: 500; }
  .cell-service { color: #3d2e44; }
  .cell-empty { text-align: center; padding: 20px; color: #9a8a9c; font-style: italic; }

  .tag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    margin-left: 4px;
    vertical-align: middle;
  }
  .tag-amber { background: #fdf6e3; color: #b8893d; }
  .tag-gold { background: #f7efe0; color: #a8884a; }

  .breakdown-table { margin-top: 10px; }
  .breakdown-table th { font-size: 10px; }
  .breakdown-table td { padding: 8px 6px; font-size: 12px; }
  .breakdown-row-bold td { font-weight: 600; font-size: 13px; border-top: 2px solid #3d2e44; padding-top: 12px; }
  .breakdown-row-final td { font-weight: 700; font-size: 16px; font-family: 'Cormorant Garamond', serif; color: #3d2e44; border-top: 2px solid #3d2e44; padding-top: 14px; padding-bottom: 14px; }
  .neg { color: #a85555; }
  .pos { color: #4a7c59; }

  .absensi-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 12px 14px;
    background: #fdfbf9;
    border-radius: 8px;
    border: 1px solid #f1ecf3;
    margin-bottom: 10px;
  }
  .absensi-item .label {
    font-size: 10px;
    color: #7a667e;
    margin-bottom: 2px;
  }
  .absensi-item .value {
    font-size: 16px;
    font-weight: 600;
    font-family: 'Cormorant Garamond', serif;
  }
  .absensi-item.unpaid .value { color: #a85555; }
  .absensi-item.leave .value { color: #4a7c59; }
  .absensi-item.sick .value { color: #7a667e; }
  .absensi-note {
    grid-column: 1 / -1;
    font-size: 10px;
    color: #6b5b6e;
    padding-top: 6px;
    border-top: 1px solid #f1ecf3;
    margin-top: 4px;
  }

  .signature-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 50px;
    padding-top: 20px;
  }
  .sig-box {
    text-align: center;
    font-size: 11px;
  }
  .sig-line {
    margin-top: 60px;
    border-top: 1px solid #3d2e44;
    padding-top: 6px;
  }
  .sig-name { font-weight: 500; }
  .sig-role { font-size: 10px; color: #7a667e; }

  .footer {
    margin-top: 30px;
    padding-top: 14px;
    border-top: 1px solid #f1ecf3;
    text-align: center;
    font-size: 10px;
    color: #9a8a9c;
    font-family: 'JetBrains Mono', monospace;
  }

  .print-controls {
    background: #f3eef5;
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 24px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  .print-controls button {
    padding: 8px 18px;
    border-radius: 100px;
    border: none;
    background: #7a667e;
    color: #fff;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
  }
  .print-controls button:hover { background: #5d4d62; }
  .print-controls button.secondary { background: #fff; color: #7a667e; border: 1px solid #7a667e; }

  @media print {
    .print-controls { display: none !important; }
    body { background: #fff; }
    .slip { max-width: none; }
  }

  .page-break { page-break-after: always; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+KR:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
<div class="print-controls">
  <button onclick="window.print()">🖨 Print / Save PDF</button>
  <button class="secondary" onclick="window.close()">Tutup</button>
</div>

<div class="slip">
  <div class="header">
    <div>
      <span class="brand">${brand.name}</span>
      <span class="brand-tag">${brand.tagline}</span>
    </div>
    <div class="doc-title">
      <div class="eyebrow">Slip Gaji</div>
      <h1>${periodEndFmt}</h1>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div class="label">Nama Karyawan</div>
      <div class="value">${escapeHtml(employee.full_name)}</div>
    </div>
    <div class="meta-item">
      <div class="label">Jabatan</div>
      <div class="value">${escapeHtml(employee.job_title || '—')}</div>
    </div>
    <div class="meta-item">
      <div class="label">Cabang</div>
      <div class="value">${escapeHtml(branch?.name || '—')}</div>
    </div>
    <div class="meta-item">
      <div class="label">Periode</div>
      <div class="value">${periodStartFmt} – ${periodEndFmt}</div>
    </div>
  </div>

  <div class="section-title">Absensi Periode Ini</div>
  <div class="absensi-grid">
    <div class="absensi-item leave">
      <div class="label">Cuti Tahunan</div>
      <div class="value">${payroll.annual_leave_days} hari</div>
    </div>
    <div class="absensi-item sick">
      <div class="label">Sakit + Surat Dokter</div>
      <div class="value">${payroll.sick_leave_certified_days} hari</div>
    </div>
    <div class="absensi-item unpaid">
      <div class="label">Izin / Sakit no Surat / Mangkir</div>
      <div class="value">${payroll.unpaid_leave_days} hari</div>
    </div>
    <div class="absensi-note">
      Standar hari kerja: ${payroll.standard_work_days} hari. Cuti tahunan & sakit dengan surat dokter tidak dipotong dari gaji pokok.
    </div>
  </div>

  <div class="section-title">Detail Transaksi & Komisi</div>
  <table>
    <thead>
      <tr>
        <th style="width: 12%">Tanggal</th>
        <th style="width: 7%">Jam</th>
        <th style="width: 22%">Pelanggan</th>
        <th style="width: 32%">Treatment</th>
        <th style="width: 13%; text-align: right">Harga</th>
        <th style="width: 14%; text-align: right">Komisi</th>
      </tr>
    </thead>
    <tbody>
      ${detailRows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align: right; font-weight: 500; padding-top: 12px; border-top: 1px solid #d4c8d8;">Total Komisi Treatment</td>
        <td colspan="2" class="cell-num" style="font-weight: 600; padding-top: 12px; border-top: 1px solid #d4c8d8;">${fmtRp(payroll.treatment_commission)}</td>
      </tr>
      ${hsCommission > 0 ? `
      <tr>
        <td colspan="4" style="text-align: right; font-weight: 500;">Komisi Home Service</td>
        <td colspan="2" class="cell-num" style="font-weight: 600;">${fmtRp(hsCommission)}</td>
      </tr>
      ` : ''}
    </tfoot>
  </table>

  <div class="section-title">Perhitungan Gaji</div>
  <table class="breakdown-table">
    <tbody>
      <tr>
        <td>Gaji Pokok</td>
        <td class="cell-num">${fmtRp(payroll.base_salary)}</td>
      </tr>
      ${payroll.salary_deduction > 0 ? `
      <tr>
        <td style="padding-left: 20px; font-size: 11px; color: #6b5b6e;">
          Potongan karena izin/mangkir (${payroll.unpaid_leave_days} hari × ${fmtRp(Math.round(payroll.base_salary / payroll.standard_work_days))})
        </td>
        <td class="cell-num neg">−${fmtRp(payroll.salary_deduction)}</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; font-style: italic; color: #6b5b6e;">Gaji Pokok Aktual</td>
        <td class="cell-num" style="font-weight: 500;">${fmtRp(payroll.base_salary_actual)}</td>
      </tr>
      ` : ''}
      <tr>
        <td>Uang Makan</td>
        <td class="cell-num">${fmtRp(payroll.meal_allowance)}</td>
      </tr>
      <tr>
        <td>Komisi Treatment</td>
        <td class="cell-num">${fmtRp(payroll.treatment_commission)}</td>
      </tr>
      ${hsCommission > 0 ? `
      <tr>
        <td>Komisi Home Service</td>
        <td class="cell-num">${fmtRp(hsCommission)}</td>
      </tr>
      ` : ''}
      ${payroll.bonus > 0 ? `
      <tr>
        <td>Bonus${notesForBonus(payroll) ? ` (${escapeHtml(notesForBonus(payroll))})` : ''}</td>
        <td class="cell-num pos">+${fmtRp(payroll.bonus)}</td>
      </tr>
      ` : ''}
      ${payroll.extra_deduction > 0 ? `
      <tr>
        <td>Potongan Tambahan</td>
        <td class="cell-num neg">−${fmtRp(payroll.extra_deduction)}</td>
      </tr>
      ` : ''}
      <tr class="breakdown-row-final">
        <td>TOTAL GAJI BERSIH</td>
        <td class="cell-num">${fmtRp(payroll.total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="signature-area">
    <div class="sig-box">
      <div class="sig-line">
        <div class="sig-name">${escapeHtml(generatedBy?.full_name || '_________________')}</div>
        <div class="sig-role">Kasir / HR</div>
      </div>
    </div>
    <div class="sig-box">
      <div class="sig-line">
        <div class="sig-name">${escapeHtml(employee.full_name)}</div>
        <div class="sig-role">Karyawan</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Slip ini dihasilkan otomatis oleh ${brand.name} Management Program · ${generatedAt}
  </div>
</div>
</body>
</html>
  `.trim();
}

function notesForBonus(payroll) {
  // Could derive from payroll.notes if needed, for now empty
  return null;
}

// HTML escape helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Open slip in new window
function printSlip(slipHtml) {
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) {
    toast('Browser memblokir popup. Izinkan popup untuk situs ini.', 'error');
    return;
  }
  w.document.write(slipHtml);
  w.document.close();
}

// Print multiple slips in one window (each with page-break)
function printMultipleSlips(slips) {
  if (!slips.length) {
    toast('Tidak ada slip untuk diprint', 'error');
    return;
  }

  // Combine: take the head from first slip, then concat all bodies with page breaks
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) {
    toast('Browser memblokir popup.', 'error');
    return;
  }

  // Extract first slip's full doc, then inject other slips as additional sections
  const firstSlip = slips[0];

  // Parse the first slip to inject additional sections
  // We'll do this by inserting more .slip divs before </body>
  let combinedHtml = firstSlip;

  if (slips.length > 1) {
    const additionalSections = slips.slice(1).map(slipHtml => {
      // Extract only the .slip div from each subsequent slip
      const slipMatch = slipHtml.match(/<div class="slip">([\s\S]*?)<\/div>\s*<\/body>/);
      if (slipMatch) {
        return `<div class="page-break"></div><div class="slip">${slipMatch[1]}</div>`;
      }
      return '';
    }).join('\n');

    combinedHtml = firstSlip.replace('</body>', additionalSections + '\n</body>');
  }

  w.document.write(combinedHtml);
  w.document.close();
}

// Expose
Object.assign(window, {
  sb, SERVICES, JOB_TITLES, SALARY_OPTIONAL_TITLES, ROLES,
  fmtRp, fmtRpOrDash, fmtNumber, fmtDate, fmtTime, todayStr, nowTimeStr, currentMonth,
  dateToYMD, startOfWeekMonday, endOfWeekSunday, DATE_PRESETS,
  isOvertime, isSalaryOptional, getServiceDef, calcCommission, getRoleLabel,
  toast, useToasts,
  loginWithEmail, logout, getCurrentSession, getMyProfile,
  listBranches, canAccessAllBranches, canManageBranch,
  listEmployees, updateEmployee, deactivateEmployee, reactivateEmployee,
  createEmployee, deleteEmployee,
  findClientByPhone, upsertClient,
  createTransaction, listRecentTransactions, getTodayStats, getMonthStats,
  getReportTransactions, aggregateReport,
  getPayrollPeriod, getPayrollPeriodForMonth, listRecentPayrollPeriods,
  listPayrollEligibleEmployees, getPeriodCommissionByEmployee,
  listPayrollAdjustments, upsertPayrollAdjustment,
  getAnnualLeaveBalances, calculatePayroll,
  listAuditLog, getAuditSummary, formatAuditDiff,
  getActionLabel, getActionColor, getActionBadge, getFieldLabel, formatAuditValue,
  exportToExcel, exportReportToExcel, exportPayrollToExcel,
  generateSlipHTML, getEmployeePeriodTransactions, printSlip, printMultipleSlips,
  getBrandForBranch, escapeHtml,
});
