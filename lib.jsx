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
});
