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
  { name: 'Retouch Korean', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Retouch Skinny/Double', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Retouch Russian', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Removal Eyelash', category: 'lash', commission_type: 'percent', baseRate: 5 },
  { name: 'Brow Lamination', category: 'brow', commission_type: 'percent', baseRate: 5 },
  { name: 'Brow Bomber', category: 'brow', commission_type: 'percent', baseRate: 5 },
  { name: 'Sulam Alis', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Retouch Sulam Alis', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Cukur Alis', category: 'brow', commission_type: 'percent', baseRate: 5 },
  { name: 'Korean Vit C Glow', category: 'facial', commission_type: 'percent', baseRate: 5 },
  { name: 'Korean BB Glow', category: 'facial', commission_type: 'percent', baseRate: 5 },
  { name: 'Nail Art', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Nail Polish (Polos)', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Nail Extension', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Manicure', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Pedicure', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Menipedi', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Removal Nails', category: 'nail', commission_type: 'percent', baseRate: 10 },
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
// Payment Methods — Tahap F
// =====================================================
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵', category: 'cash' },
  { value: 'qris', label: 'QRIS', icon: '📱', category: 'digital' },
  { value: 'bca', label: 'Transfer BCA', icon: '🏦', category: 'bank' },
  { value: 'mandiri', label: 'Transfer Mandiri', icon: '🏦', category: 'bank' },
  { value: 'bni', label: 'Transfer BNI', icon: '🏦', category: 'bank' },
  { value: 'btn', label: 'Transfer BTN', icon: '🏦', category: 'bank' },
];

function getPaymentMethodLabel(value) {
  const m = PAYMENT_METHODS.find(p => p.value === value);
  return m ? m.label : (value || 'Cash');
}

function getPaymentMethodIcon(value) {
  const m = PAYMENT_METHODS.find(p => p.value === value);
  return m ? m.icon : '💵';
}

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
  paymentMethod = 'cash',
  payments = null,  // [{ method, amount, is_dp, paid_at }] - if null, single payment with paymentMethod
  tips = null,      // [{ employee_id, amount, payment_method }] - tips per beautician (transfer/qris only)
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
      payment_method: paymentMethod,
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
      share_group_id: it.share_group_id || null,
      share_percent: it.share_percent != null ? Number(it.share_percent) : 100,
    };
  });

  const { error: itemErr } = await sb.from('transaction_items').insert(itemRows);
  if (itemErr) {
    await sb.from('transactions').delete().eq('id', trx.id);
    throw itemErr;
  }

  // Insert payments
  const grandTotal = totalAmount + (isHomeService ? (Number(homeServiceFee) || 0) : 0);
  try {
    if (payments && payments.length > 0) {
      // Use provided payments (DP + Sisa, or single)
      await insertTransactionPayments(trx.id, branchId, payments, createdBy);
    } else {
      // Single payment with paymentMethod
      await insertTransactionPayments(trx.id, branchId, [{
        method: paymentMethod,
        amount: grandTotal,
        is_dp: false,
        paid_at: date,
      }], createdBy);
    }
  } catch (payErr) {
    console.warn('Payment insert failed (transaction still saved):', payErr);
  }

  // Insert tips (per beautician) — separate from omset, but recorded for payroll & cash flow
  try {
    if (tips && tips.length > 0) {
      const tipRows = tips
        .filter(t => t.employee_id && Number(t.amount) > 0)
        .map(t => ({
          transaction_id: trx.id,
          branch_id: branchId,
          employee_id: t.employee_id,
          amount: Number(t.amount) || 0,
          payment_method: t.payment_method || 'qris',
          created_by: createdBy || null,
        }));
      if (tipRows.length > 0) {
        const { error: tipErr } = await sb.from('transaction_tips').insert(tipRows);
        if (tipErr) console.warn('Tips insert failed (transaction still saved):', tipErr);
      }
    }
  } catch (tipErr) {
    console.warn('Tips insert error (transaction still saved):', tipErr);
  }

  return trx;
}

async function listRecentTransactions(branchId = null, limit = 20) {
  let query = sb
    .from('transactions')
    .select('*, items:transaction_items(*, employee:employees(full_name)), payments:transaction_payments(*), tips:transaction_tips(id, amount, payment_method, employee_id), branch:branches(name)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// List transactions in a date range (no limit, for Tab Transaksi)
async function listTransactionsByDateRange({ branchId = null, from, to, searchQuery = '' }) {
  let query = sb
    .from('transactions')
    .select('*, items:transaction_items(*, employee:employees(full_name)), payments:transaction_payments(*), tips:transaction_tips(id, amount, payment_method, employee_id), branch:branches(name)')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .order('created_at', { ascending: false });

  if (branchId) query = query.eq('branch_id', branchId);
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    query = query.or(`client_name_snapshot.ilike.%${q}%,client_phone_snapshot.ilike.%${q}%`);
  }

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
    .select('*, items:transaction_items(*, employee:employees(id, full_name, job_title)), payments:transaction_payments(*), branch:branches(id, name)')
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

  // Tips per employee (Tahap 3) — from transaction_tips, scoped to period via parent transaction date
  let tipsQuery = sb
    .from('transaction_tips')
    .select('employee_id, amount, transactions!inner(date, branch_id)')
    .gte('transactions.date', periodStart)
    .lte('transactions.date', periodEnd);

  if (branchId) tipsQuery = tipsQuery.eq('transactions.branch_id', branchId);

  const { data: tipsData, error: tipsErr } = await tipsQuery;
  if (!tipsErr && tipsData) {
    for (const row of tipsData) {
      const empId = row.employee_id;
      if (!byEmployee[empId]) {
        byEmployee[empId] = {
          employee_id: empId,
          treatment_commission: 0,
          items_count: 0,
          transaction_ids: new Set(),
          hs_commission: 0,
        };
      }
      byEmployee[empId].tips = (byEmployee[empId].tips || 0) + Number(row.amount || 0);
    }
  }

  return byEmployee;
}
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
  const tips = Number(commissions?.tips || 0);

  // Adjustments (or defaults if no adjustment row exists)
  const standardDays = Number(adjustment?.standard_work_days) || defaultStandardDays;
  const annualLeave = Number(adjustment?.annual_leave_days) || 0;
  const sickCertified = Number(adjustment?.sick_leave_certified_days) || 0;
  const unpaidLeave = Number(adjustment?.unpaid_leave_days) || 0;
  const unpaidLeaveWeekend = Number(adjustment?.unpaid_leave_weekend_days) || 0;
  const bonus = Number(adjustment?.bonus) || 0;
  const extraDeduction = Number(adjustment?.extra_deduction) || 0;

  // Daily wage = base salary / standard work days
  // Weekend absence counts as 2 days (double deduction)
  const effectiveAbsentDays = unpaidLeave + (unpaidLeaveWeekend * 2);

  // Actual work days (for new employees who started mid-period).
  // If set (>0), salary is prorated by actualWorkDays / standardDays,
  // THEN any absence deduction is applied on top of the prorated amount.
  const actualWorkDays = Number(adjustment?.actual_work_days) || 0;
  const isProrated = actualWorkDays > 0 && actualWorkDays < standardDays;

  let baseSalaryActual;
  if (isProrated) {
    // Prorate to days actually worked, then subtract any absences within those days
    const proratedBase = baseSalary * (actualWorkDays / standardDays);
    baseSalaryActual = effectiveAbsentDays > 0
      ? Math.round(proratedBase * (1 - effectiveAbsentDays / actualWorkDays))
      : Math.round(proratedBase);
    if (baseSalaryActual < 0) baseSalaryActual = 0;
  } else {
    baseSalaryActual = effectiveAbsentDays > 0
      ? Math.round(baseSalary * (1 - effectiveAbsentDays / standardDays))
      : baseSalary;
  }

  const salaryDeduction = baseSalary - baseSalaryActual;

  // Meal allowance is also prorated for new employees (paid per day present)
  const mealAllowanceActual = isProrated
    ? Math.round(mealAllowance * (actualWorkDays / standardDays))
    : mealAllowance;

  // Total take-home (tips added — they belong to the beautician)
  const total = baseSalaryActual + mealAllowanceActual + treatmentCommission + hsCommission + tips + bonus - extraDeduction;

  return {
    base_salary: baseSalary,
    base_salary_actual: baseSalaryActual,
    salary_deduction: salaryDeduction,
    meal_allowance: mealAllowanceActual,
    meal_allowance_full: mealAllowance,
    treatment_commission: treatmentCommission,
    hs_commission: hsCommission,
    tips: tips,
    annual_leave_days: annualLeave,
    sick_leave_certified_days: sickCertified,
    unpaid_leave_days: unpaidLeave,
    unpaid_leave_weekend_days: unpaidLeaveWeekend,
    effective_absent_days: effectiveAbsentDays,
    standard_work_days: standardDays,
    actual_work_days: actualWorkDays,
    is_prorated: isProrated,
    bonus,
    extra_deduction: extraDeduction,
    notes: adjustment?.notes || null,
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
  return markInputTimeUpdates(data || []);
}

// Re-classify UPDATE entries that happen at input-time as part of "input", not a real edit.
// An UPDATE on a record is considered input-time if it occurs within INPUT_WINDOW_MS
// of that same record's INSERT (e.g. trigger recalculating totals right after creation).
// Adds `is_input_side_effect: true` to such rows so the UI can label them as "Input".
function markInputTimeUpdates(logs, windowMs = 15000) {
  if (!logs || !logs.length) return logs || [];
  // Find earliest INSERT time per record_id
  const insertTime = {};
  for (const l of logs) {
    if (l.action === 'INSERT' && l.record_id) {
      const t = new Date(l.created_at).getTime();
      if (!(l.record_id in insertTime) || t < insertTime[l.record_id]) {
        insertTime[l.record_id] = t;
      }
    }
  }
  return logs.map(l => {
    if (l.action === 'UPDATE' && l.record_id && (l.record_id in insertTime)) {
      const t = new Date(l.created_at).getTime();
      const diff = Math.abs(t - insertTime[l.record_id]);
      if (diff <= windowMs) {
        return { ...l, is_input_side_effect: true };
      }
    }
    return l;
  });
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
  unpaid_leave_days: 'Absen (tanpa surat)',
  unpaid_leave_weekend_days: 'Absen Weekend',
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
      { Metric: 'Total Tips', Nilai: totals.tips || 0 },
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
    'Tips': r.payroll.tips || 0,
    'Cuti Tahunan (hari)': r.payroll.annual_leave_days,
    'Sakit + Surat (hari)': r.payroll.sick_leave_certified_days,
    'Izin/Absen (hari)': r.payroll.unpaid_leave_days,
    'Absen Weekend (hari)': r.payroll.unpaid_leave_weekend_days || 0,
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

// =====================================================
// INVOICE / RECEIPT — Thermal 58mm
// =====================================================

// Per-branch invoice header info (address, phone, instagram).
// Keyed by branch_id. Falls back to JBB generic if not found.
const BRANCH_INFO = {
  bdg: {
    name: 'Jewel Beauty Bandung',
    address: 'Commercial Area Apartment La Grande Tamansari, Jalan Merdeka No. 25-29, Bandung 40117',
    phone: '0813-2465-5419',
    ig: '@jewelbeautybandung',
  },
  smr: {
    name: 'Jewel Beauty Summarecon',
    address: 'Ruko Shappire No. 6, Summarecon Bandung',
    phone: '+62 853-5350-6458',
    ig: '@jewelbeautybandung.summarecon',
  },
  vli: {
    name: 'VIALI Beauty',
    address: 'Piazza The Mozia, Blok E9 No. 22, BSD City',
    phone: '+62 881-0825-39229',
    ig: '@vialibeauty',
  },
  jgj: {
    name: 'JBB Jogja',
    address: 'Ruko Kuning No. 8B, Jalan Ring Road Utara (Samping Pakuwon Mall), Yogyakarta',
    phone: '+62 821-2817-0907',
    ig: '@jogjabeautybar',
  },
  jmb: {
    name: 'JBB Jogja Jambon',
    address: 'Ruko IBC Nomor 5, Jalan Jambon, Kota Yogyakarta',
    phone: '+62 858-4632-4762',
    ig: '@jogjabeautybar.jambon',
  },
  cms: {
    name: 'JBB Ciamis',
    address: 'Perum Imbanagara Estate No. 2-4, Jl. Yogaswara, Warungwetan, Imbanagara, Kec. Ciamis, Kabupaten Ciamis, Jawa Barat 46219',
    phone: '+62 822-1687-7778',
    ig: '@jbb.ciamis',
  },
};

function getBranchInfo(branchId, fallbackName = '') {
  return BRANCH_INFO[branchId] || {
    name: fallbackName || 'Jewel Beauty',
    address: '',
    phone: '',
    ig: '',
  };
}

// Generate thermal-receipt HTML (58mm) for a transaction.
// trx = result of getTransactionDetail (has branch, items[].employee, payments[])
function generateInvoiceHTML(trx) {
  const brand = getBrandForBranch(trx.branch_id);
  const isViali = trx.branch_id === 'vli';
  const info = getBranchInfo(trx.branch_id, trx.branch?.name || '');
  const items = trx.items || [];
  const payments = (trx.payments || []).slice().sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0));

  const subtotal = items.reduce((s, it) => s + Number(it.price || 0), 0);
  const hsFee = trx.is_home_service ? Number(trx.home_service_fee || 0) : 0;
  const grandTotal = subtotal + hsFee;

  // Format short transaction number from id (last 6 chars uppercase)
  const trxNo = (trx.id || '').replace(/-/g, '').slice(-6).toUpperCase();

  // Date = transaction date. Time = WHEN INVOICE IS PRINTED (now), not treatment start time.
  const dateStr = fmtDate(trx.date);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Build items rows (no "lembur" badge — this is for the client)
  const itemRows = items.map(it => {
    const empName = it.employee?.full_name || '—';
    const sharePct = (it.share_percent != null && it.share_percent < 100) ? ` (${it.share_percent}%)` : '';
    return `
      <div class="item">
        <div class="item-name">${escapeHtml(it.service_name)}${sharePct}</div>
        <div class="item-row">
          <span class="item-emp">oleh ${escapeHtml(empName)}</span>
          <span class="item-price">${fmtRp(it.price)}</span>
        </div>
      </div>`;
  }).join('');

  const paymentRows = payments.length > 0
    ? payments.map(p => `
        <div class="pay-row">
          <span>${p.is_dp ? 'DP' : 'Bayar'} (${getPaymentMethodLabel(p.payment_method)})</span>
          <span>${fmtRp(p.amount)}</span>
        </div>`).join('')
    : `<div class="pay-row"><span>Pembayaran (${getPaymentMethodLabel(trx.payment_method || 'cash')})</span><span>${fmtRp(grandTotal)}</span></div>`;

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const showSisa = payments.length > 0 && totalPaid < grandTotal;
  const sisa = grandTotal - totalPaid;

  const officialName = isViali ? 'VIALI' : 'JBB';

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${trxNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', monospace;
    background: #f0f0f0;
    padding: 12px;
    display: flex;
    justify-content: center;
  }
  .receipt {
    width: 58mm;
    max-width: 220px;
    background: #fff;
    padding: 10px 8px;
    color: #000;
    font-size: 11px;
    line-height: 1.45;
  }
  .center { text-align: center; }
  .brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .tagline { font-size: 9px; color: #555; margin-bottom: 3px; }
  .branch { font-size: 10px; font-weight: bold; margin-bottom: 3px; }
  .addr { font-size: 8.5px; color: #333; line-height: 1.35; margin-bottom: 2px; }
  .contact { font-size: 8.5px; color: #333; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .meta { font-size: 10px; }
  .meta-row { display: flex; justify-content: space-between; }
  .item { margin-bottom: 5px; }
  .item-name { font-weight: bold; font-size: 11px; }
  .item-row { display: flex; justify-content: space-between; font-size: 10px; }
  .item-emp { color: #333; font-style: italic; }
  .item-price { white-space: nowrap; }
  .totals { font-size: 11px; }
  .total-row { display: flex; justify-content: space-between; }
  .grand { font-weight: bold; font-size: 13px; }
  .pay-row { display: flex; justify-content: space-between; font-size: 10px; }
  .sisa { display: flex; justify-content: space-between; font-weight: bold; color: #a00; }
  .footer { text-align: center; font-size: 9px; margin-top: 8px; color: #333; }
  .footer-thanks { font-family: 'Cormorant Garamond', serif; font-size: 13px; font-weight: 600; margin-bottom: 2px; }
  .review-note { font-size: 8.5px; color: #222; line-height: 1.5; margin-top: 7px; text-align: center; }
  .review-note strong { font-size: 9px; }
  .footer-note { font-size: 8px; color: #444; line-height: 1.4; margin-top: 6px; text-align: left; }
  .disclaimer { font-size: 7.5px; color: #555; line-height: 1.4; margin-top: 6px; text-align: justify; border-top: 1px dotted #999; padding-top: 5px; }

  @media print {
    @page { size: 58mm auto; margin: 0; }
    body { background: #fff; padding: 0; }
    .receipt { width: 100%; max-width: none; padding: 4px 6px; }
  }
</style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      <div class="brand">${escapeHtml(brand.name)}</div>
      <div class="tagline">${escapeHtml(brand.tagline)}</div>
      <div class="branch">${escapeHtml(info.name)}</div>
      ${info.address ? `<div class="addr">${escapeHtml(info.address)}</div>` : ''}
      ${info.phone ? `<div class="contact">Telp: ${escapeHtml(info.phone)}</div>` : ''}
      ${info.ig ? `<div class="contact">IG: ${escapeHtml(info.ig)}</div>` : ''}
    </div>

    <div class="divider"></div>

    <div class="meta">
      <div class="meta-row"><span>No</span><span>#${trxNo}</span></div>
      <div class="meta-row"><span>Tgl</span><span>${dateStr}</span></div>
      <div class="meta-row"><span>Jam</span><span>${timeStr}</span></div>
      <div class="meta-row"><span>Klien</span><span>${escapeHtml(trx.client_name_snapshot || '-')}</span></div>
      ${trx.is_home_service ? `<div class="meta-row"><span></span><span>(Home Service)</span></div>` : ''}
    </div>

    <div class="divider"></div>

    ${itemRows}

    <div class="divider"></div>

    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${fmtRp(subtotal)}</span></div>
      ${hsFee > 0 ? `<div class="total-row"><span>Biaya Home Service</span><span>${fmtRp(hsFee)}</span></div>` : ''}
      <div class="total-row grand"><span>TOTAL</span><span>${fmtRp(grandTotal)}</span></div>
    </div>

    <div class="divider"></div>

    ${paymentRows}
    ${showSisa ? `<div class="sisa"><span>SISA</span><span>${fmtRp(sisa)}</span></div>` : ''}

    <div class="footer">
      <div class="footer-thanks">Terima Kasih</div>
      <div>Sampai jumpa kembali ✨</div>
      <div class="review-note">
        <strong>Jika Anda puas, ceritakan ke teman.<br/>
        Jika ada kekurangan, sampaikan dulu kepada kami —<br/>
        akan kami perbaiki segera.</strong><br/>
        Sebagai UMKM yang sedang berjuang, ulasan baik &amp; masukan langsung dari Anda sangat berarti untuk kami terus berkembang. 🙏
      </div>
      <div class="footer-note">
        Kritik &amp; saran, silakan sampaikan ke www.jbb-indonesia.com
      </div>
      <div class="disclaimer">
        ${officialName} tidak bertanggung jawab atas transaksi atau pembayaran yang dilakukan di luar nama resmi ${officialName} atau di luar rekening resmi ${officialName}. Pastikan setiap pembayaran dilakukan melalui jalur resmi.
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Show invoice in print/download modal (reuses showSlipModal)
async function printInvoice(transactionId) {
  try {
    const trx = await getTransactionDetail(transactionId);
    const html = generateInvoiceHTML(trx);
    const trxNo = (trx.id || '').replace(/-/g, '').slice(-6).toUpperCase();
    showSlipModal(html, `invoice-${trxNo}`, '🧾 Invoice', () => downloadInvoicePNG(trx));
  } catch (err) {
    toast('Gagal membuat invoice: ' + (err.message || err), 'error');
  }
}

// Render a receipt to a canvas (no external library) and return the canvas element.
// Single-pass layout: each op stores its own y-step so measure & render stay in sync.
function drawInvoiceToCanvas(trx) {
  const brand = getBrandForBranch(trx.branch_id);
  const isViali = trx.branch_id === 'vli';
  const info = getBranchInfo(trx.branch_id, trx.branch?.name || '');
  const items = trx.items || [];
  const payments = (trx.payments || []).slice().sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0));
  const subtotal = items.reduce((s, it) => s + Number(it.price || 0), 0);
  const hsFee = trx.is_home_service ? Number(trx.home_service_fee || 0) : 0;
  const grandTotal = subtotal + hsFee;
  const trxNo = (trx.id || '').replace(/-/g, '').slice(-6).toUpperCase();
  const dateStr = fmtDate(trx.date);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const showSisa = payments.length > 0 && totalPaid < grandTotal;
  const sisa = grandTotal - totalPaid;
  const officialName = isViali ? 'VIALI' : 'JBB';

  const SCALE = 3;
  const W = 384;
  const PAD = 20;
  const innerW = W - PAD * 2;
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');

  const F = (size, weight = 'normal', family = "'Courier New', monospace") => `${weight} ${size}px ${family}`;
  const SERIF = "Georgia, 'Times New Roman', serif";

  function wrapText(text, font, maxW) {
    ctx.font = font;
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line); line = w;
      } else { line = test; }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Build ops list, each with explicit step. Then total height = sum of steps + paddings.
  const ops = [];
  const addText = (text, font, color, align, step) => ops.push({ type: 'text', text, font, color, align, step });
  const addWrapped = (text, font, color, align, stepPerLine, maxW) => {
    for (const ln of wrapText(text, font, maxW || innerW)) ops.push({ type: 'text', text: ln, font, color, align, step: stepPerLine });
  };
  const addGap = (px) => ops.push({ type: 'gap', step: px });
  const addDivider = () => ops.push({ type: 'divider', step: 12 });
  const addRow = (left, right, font, color) => ops.push({ type: 'row', left, right, font, color, step: 16 });

  // HEADER
  addText(brand.name, F(30, 'bold', SERIF), '#000', 'center', 32);
  addText(brand.tagline, F(11), '#555', 'center', 15);
  addText(info.name, F(13, 'bold'), '#000', 'center', 17);
  if (info.address) addWrapped(info.address, F(10), '#333', 'center', 13);
  if (info.phone) addText('Telp: ' + info.phone, F(10), '#333', 'center', 13);
  if (info.ig) addText('IG: ' + info.ig, F(10), '#333', 'center', 13);
  addGap(4);
  addDivider();

  // META
  addRow('No', '#' + trxNo, F(12), '#000');
  addRow('Tgl', dateStr, F(12), '#000');
  addRow('Jam', timeStr, F(12), '#000');
  addRow('Klien', trx.client_name_snapshot || '-', F(12), '#000');
  if (trx.is_home_service) addRow('', '(Home Service)', F(12), '#000');
  addDivider();

  // ITEMS
  for (const it of items) {
    const empName = it.employee?.full_name || '—';
    const sharePct = (it.share_percent != null && it.share_percent < 100) ? ` (${it.share_percent}%)` : '';
    addWrapped(it.service_name + sharePct, F(13, 'bold'), '#000', 'left', 16);
    addRow('oleh ' + empName, fmtRp(it.price), F(11), '#333');
    addGap(3);
  }
  addDivider();

  // TOTALS
  addRow('Subtotal', fmtRp(subtotal), F(12), '#000');
  if (hsFee > 0) addRow('Biaya Home Service', fmtRp(hsFee), F(11), '#000');
  addRow('TOTAL', fmtRp(grandTotal), F(15, 'bold'), '#000');
  addDivider();

  // PAYMENTS
  if (payments.length > 0) {
    for (const p of payments) addRow(`${p.is_dp ? 'DP' : 'Bayar'} (${getPaymentMethodLabel(p.payment_method)})`, fmtRp(p.amount), F(11), '#000');
  } else {
    addRow(`Pembayaran (${getPaymentMethodLabel(trx.payment_method || 'cash')})`, fmtRp(grandTotal), F(11), '#000');
  }
  if (showSisa) addRow('SISA', fmtRp(sisa), F(12, 'bold'), '#a00');

  // FOOTER
  addGap(8);
  addText('Terima Kasih', F(15, 'bold', SERIF), '#000', 'center', 18);
  addText('Sampai jumpa kembali', F(11), '#333', 'center', 16);
  addGap(4);
  addWrapped('Jika Anda puas, ceritakan ke teman. Jika ada kekurangan, sampaikan dulu kepada kami — akan kami perbaiki segera.', F(10, 'bold'), '#111', 'center', 13);
  addGap(2);
  addWrapped('Sebagai UMKM yang sedang berjuang, ulasan baik & masukan langsung dari Anda sangat berarti untuk kami terus berkembang.', F(9.5), '#333', 'center', 12);
  addGap(4);
  addWrapped('Kritik & saran, silakan sampaikan ke www.jbb-indonesia.com', F(9), '#444', 'center', 12);
  addGap(6);
  addDivider();
  addWrapped(`${officialName} tidak bertanggung jawab atas transaksi atau pembayaran yang dilakukan di luar nama resmi ${officialName} atau di luar rekening resmi ${officialName}. Pastikan setiap pembayaran dilakukan melalui jalur resmi.`, F(8.5), '#555', 'left', 11);

  // Total height
  const totalH = ops.reduce((s, o) => s + o.step, 0) + PAD * 2;

  cv.width = W * SCALE;
  cv.height = Math.ceil(totalH * SCALE);
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, totalH);

  // Render
  let yy = PAD;
  for (const op of ops) {
    if (op.type === 'text') {
      ctx.font = op.font;
      ctx.fillStyle = op.color;
      ctx.textBaseline = 'top';
      ctx.textAlign = op.align === 'center' ? 'center' : 'left';
      ctx.fillText(op.text, op.align === 'center' ? W / 2 : PAD, yy);
    } else if (op.type === 'divider') {
      ctx.strokeStyle = '#000';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, yy + 2);
      ctx.lineTo(W - PAD, yy + 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (op.type === 'row') {
      ctx.font = op.font;
      ctx.fillStyle = op.color;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillText(op.left, PAD, yy);
      ctx.textAlign = 'right';
      ctx.fillText(op.right, W - PAD, yy);
    }
    yy += op.step;
  }

  return cv;
}

// Trigger PNG download of the invoice.
function downloadInvoicePNG(trx) {
  try {
    const cv = drawInvoiceToCanvas(trx);
    const trxNo = (trx.id || '').replace(/-/g, '').slice(-6).toUpperCase();
    cv.toBlob((blob) => {
      if (!blob) { toast('Gagal membuat PNG', 'error'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${trxNo}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  } catch (err) {
    console.error('PNG export failed:', err);
    toast('Gagal membuat PNG: ' + (err.message || err), 'error');
  }
}

// Fetch transactions for an employee in a period (for slip detail)
async function getEmployeePeriodTransactions(employeeId, periodStart, periodEnd) {
  const { data, error } = await sb
    .from('transaction_items')
    .select(`
      id, service_name, price, commission_amount, commission_rate, commission_type,
      share_group_id, share_percent,
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

// Get tip detail (per transaction) for one employee in a period — for slip breakdown
async function getEmployeePeriodTips(employeeId, periodStart, periodEnd) {
  const { data, error } = await sb
    .from('transaction_tips')
    .select(`
      id, amount, payment_method,
      transaction:transactions!inner(id, date, client_name_snapshot)
    `)
    .eq('employee_id', employeeId)
    .gte('transaction.date', periodStart)
    .lte('transaction.date', periodEnd);
  if (error) return [];
  return (data || []).filter(r => r.transaction).sort((a, b) => {
    const dA = a.transaction?.date || '';
    const dB = b.transaction?.date || '';
    return dA < dB ? -1 : dA > dB ? 1 : 0;
  });
}

// Generate slip HTML for one employee
function generateSlipHTML({ employee, payroll, items, period, branch, generatedBy, isApproved = false, tipsDetail = [] }) {
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
    // For HS transactions: distribute the home_service_fee across items equally
    // So each item's "komisi" cell shows its portion of the HS fee in gold
    const isHS = trx.is_home_service;
    const hsFee = Number(trx.home_service_fee || 0);
    const hsPortionPerItem = isHS && trx.items.length > 0 ? Math.round(hsFee / trx.items.length) : 0;
    // Handle remainder so total still equals hsFee (last item gets the remainder)
    const hsRemainder = isHS ? hsFee - (hsPortionPerItem * trx.items.length) : 0;

    for (let i = 0; i < trx.items.length; i++) {
      const it = trx.items[i];
      const isFirst = i === 0;
      const isLast = i === trx.items.length - 1;
      // Shared treatment info
      const sharePercent = Number(it.share_percent || 100);
      const isShared = it.share_group_id && sharePercent < 100;
      const sharedTag = isShared ? ` <span class="tag tag-mauve">shared ${sharePercent}%</span>` : '';

      // Calculate effective commission to display
      let displayCommission;
      let commissionColor;
      if (isHS) {
        // HS: show portion of HS fee in gold
        displayCommission = hsPortionPerItem + (isLast ? hsRemainder : 0);
        commissionColor = '#a8884a'; // gold
        runningCommission += displayCommission;
      } else {
        // Regular: show treatment commission as usual
        displayCommission = Number(it.commission_amount || 0);
        commissionColor = ''; // default mauve via CSS
        runningCommission += displayCommission;
      }

      detailRows += `
        <tr>
          <td class="cell-date">${isFirst ? fmtDate(trx.date) : ''}</td>
          <td class="cell-time">${isFirst ? fmtTime(trx.start_time) : ''}</td>
          <td class="cell-client">${isFirst ? escapeHtml(trx.client_name) : ''}</td>
          <td class="cell-service">
            ${escapeHtml(it.service_name)}
            ${trx.is_overtime && isFirst ? '<span class="tag tag-amber">lembur</span>' : ''}
            ${trx.is_home_service && isFirst ? '<span class="tag tag-gold">HS</span>' : ''}
            ${sharedTag}
          </td>
          <td class="cell-num">${fmtRp(it.price)}</td>
          <td class="cell-num cell-commission" style="${commissionColor ? `color: ${commissionColor}; font-weight: 600;` : ''}">${fmtRp(displayCommission)}</td>
        </tr>
      `;
    }
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
  .tag-mauve { background: #f3eef5; color: #7a667e; }

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

  /* Watermark PREVIEW (when not approved) */
  .slip {
    position: relative;
  }
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-family: 'Cormorant Garamond', serif;
    font-size: 120px;
    color: rgba(168, 85, 85, 0.10);
    font-weight: 600;
    letter-spacing: 0.15em;
    pointer-events: none;
    z-index: 1;
    white-space: nowrap;
    user-select: none;
  }
  .approval-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 100px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 500;
    margin-left: 10px;
    vertical-align: middle;
  }
  .approval-badge.preview {
    background: #fdf0f0;
    color: #a85555;
    border: 1px solid #e8c5c5;
  }
  .approval-badge.approved {
    background: #ecf5ef;
    color: #4a7c59;
    border: 1px solid #c5e0cc;
  }
</style>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+KR:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
<div class="print-controls">
  <button onclick="window.print()">🖨 Print / Save PDF</button>
  <button class="secondary" onclick="window.close()">Tutup</button>
</div>

<div class="slip">
  ${!isApproved ? '<div class="watermark">PREVIEW</div>' : ''}
  <div class="header">
    <div>
      <span class="brand">${brand.name}</span>
      <span class="brand-tag">${brand.tagline}</span>
    </div>
    <div class="doc-title">
      <div class="eyebrow">Slip Gaji
        <span class="approval-badge ${isApproved ? 'approved' : 'preview'}">${isApproved ? '✓ Approved' : 'Preview'}</span>
      </div>
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
      <div class="label">Absen (tanpa surat)</div>
      <div class="value">${payroll.unpaid_leave_days} hari</div>
    </div>
    ${payroll.unpaid_leave_weekend_days > 0 ? `
    <div class="absensi-item unpaid" style="background:#fef0e8;border-color:#e8a87c;">
      <div class="label">Absen Weekend (2x potongan)</div>
      <div class="value">${payroll.unpaid_leave_weekend_days} hari</div>
    </div>
    ` : ''}
    <div class="absensi-note">
      Standar hari kerja: ${payroll.standard_work_days} hari. Cuti tahunan & sakit dengan surat dokter tidak dipotong dari gaji pokok. Absen weekend dihitung 2x gaji harian.
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
        <td colspan="4" style="text-align: right; font-weight: 500; color: #a8884a;">Total Komisi Home Service</td>
        <td colspan="2" class="cell-num" style="font-weight: 600; color: #a8884a;">${fmtRp(hsCommission)}</td>
      </tr>
      ` : ''}
    </tfoot>
  </table>

  ${(tipsDetail && tipsDetail.length > 0) ? `
  <div class="section-title">Rincian Tips dari Client 💝</div>
  <table class="detail-table">
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Client</th>
        <th>Metode</th>
        <th class="cell-num">Tips</th>
      </tr>
    </thead>
    <tbody>
      ${tipsDetail.map(t => `
      <tr>
        <td>${fmtDate(t.transaction?.date)}</td>
        <td>${escapeHtml(t.transaction?.client_name_snapshot || '-')}</td>
        <td>${escapeHtml(getPaymentMethodLabel(t.payment_method))}</td>
        <td class="cell-num" style="color: #7a667e; font-weight: 500;">${fmtRp(t.amount)}</td>
      </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align: right; font-weight: 500; padding-top: 12px; border-top: 1px solid #d4c8d8; color: #7a667e;">Total Tips</td>
        <td class="cell-num" style="font-weight: 600; padding-top: 12px; border-top: 1px solid #d4c8d8; color: #7a667e;">${fmtRp(tipsDetail.reduce((s, t) => s + Number(t.amount || 0), 0))}</td>
      </tr>
    </tfoot>
  </table>
  ` : ''}

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
          ${payroll.is_prorated
            ? `Pro-rata: kerja ${payroll.actual_work_days} dari ${payroll.standard_work_days} hari${payroll.effective_absent_days > 0 ? ` (− ${payroll.effective_absent_days} hari absen)` : ''}`
            : `Potongan absen (${payroll.unpaid_leave_days} hari biasa${payroll.unpaid_leave_weekend_days > 0 ? ` + ${payroll.unpaid_leave_weekend_days} hari weekend × 2` : ''} = ${payroll.effective_absent_days} hari × ${fmtRp(Math.round(payroll.base_salary / payroll.standard_work_days))})`}
        </td>
        <td class="cell-num neg">−${fmtRp(payroll.salary_deduction)}</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; font-style: italic; color: #6b5b6e;">Gaji Pokok Aktual</td>
        <td class="cell-num" style="font-weight: 500;">${fmtRp(payroll.base_salary_actual)}</td>
      </tr>
      ` : ''}
      <tr>
        <td>Uang Makan${(payroll.is_prorated && payroll.meal_allowance_full > payroll.meal_allowance) ? ` <span style="font-size: 10px; color: #6b5b6e;">(pro-rata ${payroll.actual_work_days}/${payroll.standard_work_days} dari ${fmtRp(payroll.meal_allowance_full)})</span>` : ''}</td>
        <td class="cell-num">${fmtRp(payroll.meal_allowance)}</td>
      </tr>
      <tr>
        <td>Komisi Treatment</td>
        <td class="cell-num">${fmtRp(payroll.treatment_commission)}</td>
      </tr>
      ${hsCommission > 0 ? `
      <tr>
        <td style="color: #a8884a;">Komisi Home Service</td>
        <td class="cell-num" style="color: #a8884a; font-weight: 500;">${fmtRp(hsCommission)}</td>
      </tr>
      ` : ''}
      ${(payroll.tips || 0) > 0 ? `
      <tr>
        <td style="color: #7a667e;">Tips dari Client 💝</td>
        <td class="cell-num pos" style="color: #7a667e; font-weight: 500;">+${fmtRp(payroll.tips)}</td>
      </tr>
      ` : ''}
      ${payroll.bonus > 0 ? `
      <tr>
        <td>Bonus${(payroll.notes && !(payroll.extra_deduction > 0)) ? ` (${escapeHtml(payroll.notes)})` : ''}</td>
        <td class="cell-num pos">+${fmtRp(payroll.bonus)}</td>
      </tr>
      ` : ''}
      ${payroll.extra_deduction > 0 ? `
      <tr>
        <td>Potongan Tambahan${payroll.notes ? ` (${escapeHtml(payroll.notes)})` : ''}</td>
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
        <div class="sig-name">Ami</div>
        <div class="sig-role">Owner</div>
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

// Open slip in in-page modal with iframe (works on iOS Safari, Android, all browsers)
function printSlip(slipHtml) {
  showSlipModal(slipHtml, 'slip-gaji');
}

// Print multiple slips combined
function printMultipleSlips(slips) {
  if (!slips.length) {
    toast('Tidak ada slip untuk diprint', 'error');
    return;
  }

  // Combine: take first slip as base, append others as additional pages
  const firstSlip = slips[0];
  let combinedHtml = firstSlip;

  if (slips.length > 1) {
    const additionalSections = slips.slice(1).map(slipHtml => {
      const slipMatch = slipHtml.match(/<div class="slip">([\s\S]*?)<\/div>\s*<\/body>/);
      if (slipMatch) {
        return `<div class="page-break"></div><div class="slip">${slipMatch[1]}</div>`;
      }
      return '';
    }).join('\n');

    combinedHtml = firstSlip.replace('</body>', additionalSections + '\n</body>');
  }

  showSlipModal(combinedHtml, `slip-gaji-${slips.length}-karyawan`);
}

// Show slip in iframe modal (works on iOS Safari, Android, all browsers)
function showSlipModal(slipHtml, downloadName = 'slip-gaji', modalTitle = '📄 Slip Gaji', onPng = null) {
  // Remove any existing modal
  const existing = document.getElementById('jbb-slip-modal');
  if (existing) existing.remove();

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'jbb-slip-modal';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(36, 26, 44, 0.85);
    z-index: 99999;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(4px);
  `;

  // Header bar with action buttons
  const header = document.createElement('div');
  header.style.cssText = `
    background: #fdfbf9;
    padding: 12px 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    border-bottom: 1px solid #e5dce5;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding-top: max(12px, env(safe-area-inset-top));
  `;
  header.innerHTML = `
    <div style="font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #3d2e44; font-weight: 500;">
      ${modalTitle}
    </div>
    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
      <button id="jbb-slip-print" style="
        padding: 8px 16px;
        background: #7a667e;
        color: white;
        border: none;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        min-height: 38px;
      ">🖨️ Print</button>
      ${onPng ? `<button id="jbb-slip-png" style="
        padding: 8px 16px;
        background: #c9a961;
        color: #fff;
        border: none;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        min-height: 38px;
      ">🖼️ PNG</button>` : ''}
      <button id="jbb-slip-download" style="
        padding: 8px 16px;
        background: #f3eef5;
        color: #3d2e44;
        border: none;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        min-height: 38px;
      ">📥 Download HTML</button>
      <button id="jbb-slip-close" style="
        padding: 8px 14px;
        background: transparent;
        color: #7a667e;
        border: 1px solid #d4c8d8;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        min-height: 38px;
      ">✕ Tutup</button>
    </div>
  `;

  // Iframe container
  const iframeWrap = document.createElement('div');
  iframeWrap.style.cssText = `
    flex: 1;
    background: white;
    overflow: hidden;
    padding-bottom: env(safe-area-inset-bottom);
  `;

  const iframe = document.createElement('iframe');
  iframe.id = 'jbb-slip-iframe';
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;
  iframeWrap.appendChild(iframe);

  overlay.appendChild(header);
  overlay.appendChild(iframeWrap);
  document.body.appendChild(overlay);

  // Write slip content to iframe
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(slipHtml);
  doc.close();

  // Wait for iframe content & fonts to load before allowing print
  let isReady = false;
  iframe.onload = () => { isReady = true; };
  // Fallback: also mark ready after a short delay
  setTimeout(() => { isReady = true; }, 800);

  // Close button
  document.getElementById('jbb-slip-close').onclick = () => overlay.remove();

  // Click outside iframe to close
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  // ESC key to close
  function onKey(e) {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);

  // Print button: trigger print inside iframe
  document.getElementById('jbb-slip-print').onclick = () => {
    try {
      // Focus iframe first (required for some browsers)
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Print failed:', err);
      alert('Print gagal. Coba pakai tombol Download HTML, lalu print dari file yang ter-download.');
    }
  };

  // PNG button (only present if onPng provided)
  const pngBtn = document.getElementById('jbb-slip-png');
  if (pngBtn && onPng) {
    pngBtn.onclick = () => {
      try {
        onPng();
      } catch (err) {
        console.error('PNG failed:', err);
        alert('Gagal membuat PNG.');
      }
    };
  }

  // Download HTML button: save the slip as standalone .html file
  document.getElementById('jbb-slip-download').onclick = () => {
    try {
      const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadName}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download gagal.');
    }
  };
}

// =====================================================
// TAHAP D — Employee Dashboard helpers
// =====================================================

// Get dashboard stats for current user (employee self-view)
async function getMyDashboardStats() {
  const { data, error } = await sb.from('my_dashboard_stats').select('*').single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    throw error;
  }
  return data;
}

// Get my recent transactions (3 months, privacy filter)
async function getMyRecentTransactions(limit = 100) {
  const { data, error } = await sb
    .from('my_employee_transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Get my top services
async function getMyTopServices(months = 3) {
  const { data, error } = await sb.rpc('get_my_top_services', { p_months: months });
  if (error) throw error;
  return data || [];
}

// Get my top clients (first name only)
async function getMyTopClients(months = 3) {
  const { data, error } = await sb.rpc('get_my_top_clients', { p_months: months });
  if (error) throw error;
  return data || [];
}

// =====================================================
// TAHAP D — Admin View Employee Dashboard
// =====================================================

async function getEmployeeDashboardStatsAdmin(employeeId) {
  const { data, error } = await sb.rpc('get_employee_dashboard_stats', { p_employee_id: employeeId });
  if (error) throw error;
  return data?.[0] || null;
}

async function getEmployeeTransactionsAdmin(employeeId, limit = 200) {
  const { data, error } = await sb.rpc('get_employee_transactions_admin', {
    p_employee_id: employeeId,
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}

async function getEmployeeTopServicesAdmin(employeeId, months = 3) {
  const { data, error } = await sb.rpc('get_employee_top_services_admin', {
    p_employee_id: employeeId,
    p_months: months,
  });
  if (error) throw error;
  return data || [];
}

async function getEmployeeTopClientsAdmin(employeeId, months = 3) {
  const { data, error } = await sb.rpc('get_employee_top_clients_admin', {
    p_employee_id: employeeId,
    p_months: months,
  });
  if (error) throw error;
  return data || [];
}

// Get full employee data by ID (with branch info)
async function getEmployeeById(employeeId) {
  const { data, error } = await sb
    .from('employees')
    .select('*, branch:branches(id, name)')
    .eq('id', employeeId)
    .single();
  if (error) throw error;
  return data;
}

// Get one payroll adjustment for an employee in a specific period
async function getPayrollAdjustment(employeeId, periodStart) {
  const { data, error } = await sb
    .from('payroll_adjustments')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('period_start', periodStart)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Get annual leave balance for one employee in a year
async function getAnnualLeaveBalanceForEmployee(employeeId, year) {
  const { data, error } = await sb
    .from('annual_leave_balance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('year', year)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// TAHAP D — Slip Approval
// =====================================================

async function approveSlip(adjustmentId) {
  const { error } = await sb.rpc('approve_slip', { p_adjustment_id: adjustmentId });
  if (error) throw error;
}

async function unapproveSlip(adjustmentId) {
  const { error } = await sb.rpc('unapprove_slip', { p_adjustment_id: adjustmentId });
  if (error) throw error;
}

// =====================================================
// EDIT & DELETE TRANSACTION
// =====================================================

// Get full transaction detail (header + items + employee info)
async function getTransactionDetail(transactionId) {
  const { data, error } = await sb
    .from('transactions')
    .select(`
      *,
      branch:branches(id, name),
      items:transaction_items(
        id, employee_id, service_name, service_category,
        price, commission_type, commission_rate, commission_amount, notes,
        share_group_id, share_percent,
        employee:employees(id, full_name, job_title)
      ),
      payments:transaction_payments(*),
      tips:transaction_tips(id, employee_id, amount, payment_method, employee:employees(id, full_name))
    `)
    .eq('id', transactionId)
    .single();
  if (error) throw error;
  return data;
}

// Update transaction (atomic via DB function)
async function updateTransactionFull({
  transactionId,
  date,
  startTime,
  clientName,
  clientPhone,
  isOvertime,
  isHomeService,
  homeServiceFee,
  notes,
  items,
  paymentMethod,
}) {
  // First try RPC (for backward compatibility with older deployments)
  // If items have share_group_id/share_percent OR payment_method is set,
  // we need to bypass RPC and do direct ops since RPC signature is fixed.

  const needsDirectOps = paymentMethod != null
    || items.some(it => it.share_group_id || (it.share_percent != null && it.share_percent !== 100));

  if (!needsDirectOps) {
    // Use existing RPC for simple updates
    const { data, error } = await sb.rpc('update_transaction_full', {
      p_transaction_id: transactionId,
      p_date: date,
      p_start_time: startTime,
      p_client_name: clientName,
      p_client_phone: clientPhone,
      p_is_overtime: isOvertime,
      p_is_home_service: isHomeService,
      p_home_service_fee: homeServiceFee || 0,
      p_notes: notes || null,
      p_items: items,
    });
    if (error) throw error;
    return data;
  }

  // Direct ops (when payment_method or share fields are used)
  // Calculate totals
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + (Number(it.commission_amount) || 0), 0);
  const finalCommission = totalCommission + (isHomeService ? (Number(homeServiceFee) || 0) : 0);

  // Get existing trx for branch_id
  const { data: existingTrx, error: fetchErr } = await sb
    .from('transactions')
    .select('branch_id')
    .eq('id', transactionId)
    .single();
  if (fetchErr) throw fetchErr;
  const branchId = existingTrx.branch_id;

  // Update transaction header
  const updatePayload = {
    date,
    start_time: startTime,
    client_name_snapshot: clientName,
    client_phone_snapshot: clientPhone,
    is_overtime: isOvertime,
    is_home_service: isHomeService,
    home_service_fee: Number(homeServiceFee) || 0,
    total_amount: totalAmount,
    total_commission: finalCommission,
    notes: notes || null,
  };
  if (paymentMethod != null) updatePayload.payment_method = paymentMethod;

  const { error: updateErr } = await sb
    .from('transactions')
    .update(updatePayload)
    .eq('id', transactionId);
  if (updateErr) throw updateErr;

  // Delete existing items
  const { error: delErr } = await sb
    .from('transaction_items')
    .delete()
    .eq('transaction_id', transactionId);
  if (delErr) throw delErr;

  // Re-insert items
  const itemRows = items.map(it => {
    const svc = getServiceDef(it.service_name);
    return {
      transaction_id: transactionId,
      branch_id: branchId,
      employee_id: it.employee_id,
      service_name: it.service_name,
      service_category: svc?.category || it.service_category || 'other',
      price: Number(it.price) || 0,
      commission_type: it.commission_type,
      commission_rate: Number(it.commission_rate) || 0,
      commission_amount: Number(it.commission_amount) || 0,
      notes: it.notes || null,
      share_group_id: it.share_group_id || null,
      share_percent: it.share_percent != null ? Number(it.share_percent) : 100,
    };
  });

  const { error: insertErr } = await sb.from('transaction_items').insert(itemRows);
  if (insertErr) throw insertErr;

  return transactionId;
}

// Delete transaction (super_admin only)
async function deleteTransaction(transactionId) {
  const { error } = await sb.rpc('delete_transaction', { p_transaction_id: transactionId });
  if (error) throw error;
}

// Check if transaction has been edited (based on audit log)
async function checkTransactionEdited(transactionId) {
  const { data, error } = await sb
    .from('audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('table_name', 'transactions')
    .eq('record_id', transactionId)
    .eq('action', 'UPDATE');
  if (error) return false;
  return (data?.length || 0) > 0;
}

// Get list of edited transaction IDs (for batch checking)
async function getEditedTransactionIds(transactionIds) {
  if (!transactionIds.length) return new Set();
  // Fetch both INSERT and UPDATE events with timestamps, so we can tell a real edit
  // from an input-time side-effect (UPDATE that happens right after the INSERT).
  const { data, error } = await sb
    .from('audit_log')
    .select('record_id, action, created_at')
    .eq('table_name', 'transactions')
    .in('action', ['INSERT', 'UPDATE'])
    .in('record_id', transactionIds);
  if (error) return new Set();

  const INPUT_WINDOW_MS = 15000;
  const insertTime = {};
  for (const r of (data || [])) {
    if (r.action === 'INSERT') {
      const t = new Date(r.created_at).getTime();
      if (!(r.record_id in insertTime) || t < insertTime[r.record_id]) insertTime[r.record_id] = t;
    }
  }
  const edited = new Set();
  for (const r of (data || [])) {
    if (r.action !== 'UPDATE') continue;
    const t = new Date(r.created_at).getTime();
    const ins = insertTime[r.record_id];
    // Real edit only if UPDATE happens meaningfully after the INSERT (or no INSERT in batch)
    if (ins == null || (t - ins) > INPUT_WINDOW_MS) {
      edited.add(r.record_id);
    }
  }
  return edited;
}

// =====================================================
// TREATMENT PHOTOS — Tahap E
// =====================================================

const PHOTO_BUCKET = 'treatment-photos';
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGE_DIMENSION = 1600; // Resize to max 1600px on longest side

// Compress & resize image client-side before upload
async function compressImage(file, maxDim = MAX_IMAGE_DIMENSION, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }

        // Create canvas & draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            resolve({ blob, width, height });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

// Upload photo to storage + insert metadata to table
// Returns { id, storage_path, signedUrl }
async function uploadTreatmentPhoto({
  transactionId,
  branchId,
  photoType,  // 'before' or 'after'
  file,
  caption = null,
}) {
  if (!file) throw new Error('File required');
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error(`File terlalu besar (maks ${MAX_PHOTO_SIZE / 1024 / 1024} MB)`);
  }

  // Compress image
  const { blob, width, height } = await compressImage(file);

  // Generate storage path: {branch_id}/{yyyy-mm}/{transaction_id}_{photo_type}_{timestamp}.jpg
  const now = new Date();
  const yyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const timestamp = Date.now();
  const storagePath = `${branchId}/${yyyymm}/${transactionId}_${photoType}_${timestamp}.jpg`;

  // Upload to storage
  const { error: uploadError } = await sb.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });
  if (uploadError) throw uploadError;

  // Insert metadata to table
  const { data: insertData, error: insertError } = await sb
    .from('treatment_photos')
    .insert({
      transaction_id: transactionId,
      branch_id: branchId,
      photo_type: photoType,
      storage_path: storagePath,
      file_size_bytes: blob.size,
      mime_type: 'image/jpeg',
      width,
      height,
      caption,
      uploaded_by: (await sb.auth.getUser()).data?.user?.id,
    })
    .select()
    .single();

  if (insertError) {
    // Rollback: delete the uploaded file
    await sb.storage.from(PHOTO_BUCKET).remove([storagePath]);
    throw insertError;
  }

  return insertData;
}

// Get photos for a transaction (with signed URLs)
async function getTransactionPhotos(transactionId) {
  const { data: photos, error } = await sb
    .from('treatment_photos')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('photo_type', { ascending: true });

  if (error) throw error;
  if (!photos || !photos.length) return [];

  // Generate signed URLs for each photo (valid for 1 hour)
  const photosWithUrls = await Promise.all(
    photos.map(async p => {
      const { data: signed } = await sb.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(p.storage_path, 3600); // 1 hour
      return { ...p, signedUrl: signed?.signedUrl || null };
    })
  );

  return photosWithUrls;
}

// Delete a photo (storage + table)
async function deleteTreatmentPhoto(photoId) {
  // Get photo first to know storage_path
  const { data: photo, error: fetchError } = await sb
    .from('treatment_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  if (photo?.storage_path) {
    const { error: storageError } = await sb.storage
      .from(PHOTO_BUCKET)
      .remove([photo.storage_path]);
    if (storageError) {
      console.warn('Storage delete failed (may already be gone):', storageError);
    }
  }

  // Delete from table
  const { error: deleteError } = await sb
    .from('treatment_photos')
    .delete()
    .eq('id', photoId);

  if (deleteError) throw deleteError;
}

// Mark photo as marketing approved (or unmark)
async function markPhotoMarketing(photoId, approved = true) {
  const { error } = await sb.rpc('mark_photo_marketing_approved', {
    p_photo_id: photoId,
    p_approved: approved,
  });
  if (error) throw error;
}

// Generate a fresh signed URL for an existing photo (if expired)
async function refreshPhotoSignedUrl(storagePath, expiresIn = 3600) {
  const { data, error } = await sb.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
}

// Update transaction's photo_skip_reason (when skipping after photo)
async function updatePhotoSkipReason(transactionId, reason) {
  const { error } = await sb
    .from('transactions')
    .update({ photo_skip_reason: reason })
    .eq('id', transactionId);
  if (error) throw error;
}

// Get marketing-approved photos (for portfolio gallery)
async function listMarketingPhotos({ branchId = null, limit = 50 } = {}) {
  let query = sb
    .from('photos_with_context')
    .select('*')
    .eq('is_marketing_approved', true)
    .order('marketing_approved_at', { ascending: false })
    .limit(limit);

  if (branchId) query = query.eq('branch_id', branchId);

  const { data, error } = await query;
  if (error) throw error;

  // Add signed URLs
  if (data && data.length) {
    const withUrls = await Promise.all(
      data.map(async p => {
        const { data: signed } = await sb.storage
          .from(PHOTO_BUCKET)
          .createSignedUrl(p.storage_path, 3600);
        return { ...p, signedUrl: signed?.signedUrl || null };
      })
    );
    return withUrls;
  }
  return [];
}

// Get all photos with context (for admin gallery)
async function listAllPhotos({ branchId = null, photoType = null, limit = 100 } = {}) {
  let query = sb
    .from('photos_with_context')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(limit);

  if (branchId) query = query.eq('branch_id', branchId);
  if (photoType) query = query.eq('photo_type', photoType);

  const { data, error } = await query;
  if (error) throw error;

  if (data && data.length) {
    const withUrls = await Promise.all(
      data.map(async p => {
        const { data: signed } = await sb.storage
          .from(PHOTO_BUCKET)
          .createSignedUrl(p.storage_path, 3600);
        return { ...p, signedUrl: signed?.signedUrl || null };
      })
    );
    return withUrls;
  }
  return [];
}

// =====================================================
// TRANSACTION PAYMENTS — Tahap G
// DP & Payment Flow Tracking
// =====================================================

// Insert payments for a transaction (1 or 2 rows)
// payments: [{ method, amount, is_dp, paid_at }]
async function insertTransactionPayments(transactionId, branchId, payments, createdBy) {
  if (!payments || !payments.length) return [];
  const rows = payments.map(p => ({
    transaction_id: transactionId,
    branch_id: branchId,
    payment_method: p.method || 'cash',
    amount: Number(p.amount) || 0,
    is_dp: !!p.is_dp,
    paid_at: p.paid_at || null,  // null = use default (current_date)
    created_by: createdBy || null,
  }));
  const { data, error } = await sb.from('transaction_payments').insert(rows).select();
  if (error) throw error;
  return data || [];
}

// Get payments for a transaction
async function getTransactionPayments(transactionId) {
  const { data, error } = await sb
    .from('transaction_payments')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('is_dp', { ascending: false })  // DP first
    .order('paid_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ===== TIPS helpers (Tahap 2) =====

// Insert tips for a transaction. tips: [{ employee_id, amount, payment_method }]
async function insertTransactionTips(transactionId, branchId, tips, createdBy) {
  if (!tips || !tips.length) return [];
  const rows = tips
    .filter(t => t.employee_id && Number(t.amount) > 0)
    .map(t => ({
      transaction_id: transactionId,
      branch_id: branchId,
      employee_id: t.employee_id,
      amount: Number(t.amount) || 0,
      payment_method: t.payment_method || 'qris',
      created_by: createdBy || null,
    }));
  if (!rows.length) return [];
  const { data, error } = await sb.from('transaction_tips').insert(rows).select();
  if (error) throw error;
  return data || [];
}

// Replace all tips for a transaction (used in edit)
async function replaceTransactionTips(transactionId, branchId, tips, createdBy) {
  const { error: delErr } = await sb.from('transaction_tips').delete().eq('transaction_id', transactionId);
  if (delErr) throw delErr;
  return insertTransactionTips(transactionId, branchId, tips, createdBy);
}

// Replace all payments for a transaction (used in edit)
async function replaceTransactionPayments(transactionId, branchId, payments, createdBy) {
  // Delete existing
  const { error: delErr } = await sb
    .from('transaction_payments')
    .delete()
    .eq('transaction_id', transactionId);
  if (delErr) throw delErr;

  // Insert new
  return insertTransactionPayments(transactionId, branchId, payments, createdBy);
}

// Get payment flow breakdown for laporan
// Compute payment flow breakdown from an array of transactions that already
// include their `payments` (from getReportTransactions). No extra query needed.
// Falls back to the transaction's own total/payment_method if a transaction has
// no payment rows (older data), so nothing is missed.
function computePaymentFlow(transactions) {
  const trxs = transactions || [];
  const byMethod = {};
  const bump = (method, amount, isDp) => {
    const m = method || 'cash';
    if (!byMethod[m]) byMethod[m] = { payment_method: m, total_amount: 0, payment_count: 0, dp_count: 0, full_count: 0 };
    byMethod[m].total_amount += Number(amount || 0);
    byMethod[m].payment_count += 1;
    if (isDp) byMethod[m].dp_count += 1;
    else byMethod[m].full_count += 1;
  };

  for (const t of trxs) {
    const pays = t.payments || [];
    if (pays.length > 0) {
      for (const p of pays) bump(p.payment_method, p.amount, p.is_dp);
    } else {
      // No payment rows recorded → treat the whole transaction as one full payment
      const grand = Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
      if (grand > 0) bump(t.payment_method || 'cash', grand, false);
    }
  }

  return Object.values(byMethod).sort((a, b) => b.total_amount - a.total_amount);
}

// Payment flow breakdown — computed directly from transaction_payments table.
// Uses paid_at when available, but falls back to the parent transaction's date
// when paid_at is NULL (older/quick-input rows). This makes the report work for
// every period regardless of whether paid_at was filled.
async function getPaymentFlowBreakdown({ from, to, branchId = null }) {
  // Join to parent transaction to get its date as a fallback for paid_at.
  let query = sb
    .from('transaction_payments')
    .select('payment_method, amount, is_dp, paid_at, transaction:transactions(date)');
  if (branchId) query = query.eq('branch_id', branchId);

  const { data, error } = await query;
  if (error) throw error;

  const rows = data || [];
  const byMethod = {};
  for (const p of rows) {
    // Effective date = paid_at if set, else parent transaction date
    const effDate = p.paid_at || p.transaction?.date || null;
    if (!effDate) continue;               // no usable date → skip
    if (effDate < from || effDate > to) continue;  // outside selected period

    const m = p.payment_method || 'cash';
    if (!byMethod[m]) {
      byMethod[m] = { payment_method: m, total_amount: 0, payment_count: 0, dp_count: 0, full_count: 0 };
    }
    byMethod[m].total_amount += Number(p.amount || 0);
    byMethod[m].payment_count += 1;
    if (p.is_dp) byMethod[m].dp_count += 1;
    else byMethod[m].full_count += 1;
  }

  return Object.values(byMethod).sort((a, b) => b.total_amount - a.total_amount);
}


// =====================================================
// DASHBOARD DATA — KPI + Charts (multi-branch, period aware)
// =====================================================

const CATEGORY_LABELS = {
  lash: 'Eyelash',
  brow: 'Brow & Sulam',
  facial: 'Facial',
  nail: 'Nail',
  other: 'Lainnya',
};

// Compute date range for a dashboard period preset
function getDashboardRange(preset, customFrom = null, customTo = null) {
  const today = new Date();
  const ymd = d => dateToYMD(d);
  switch (preset) {
    case 'today':
      return { from: ymd(today), to: ymd(today), grain: 'day' };
    case 'period': {
      // Payroll period 26 -> 25 (same logic as tab Gaji)
      const p = getPayrollPeriod(today);
      return { from: p.period_start, to: p.period_end, grain: 'day' };
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: ymd(start), to: ymd(end), grain: 'day' };
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      return { from: ymd(start), to: ymd(end), grain: 'month' };
    }
    case 'custom':
      return {
        from: customFrom || ymd(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: customTo || ymd(today),
        grain: 'day',
      };
    default: {
      // default = payroll period 26 -> 25
      const p = getPayrollPeriod(today);
      return { from: p.period_start, to: p.period_end, grain: 'day' };
    }
  }
}

// Main dashboard data fetcher.
// branchId = null means ALL branches (super_admin).
async function getDashboardData({ branchId = null, from, to, grain = 'day' }) {
  const trxs = await getReportTransactions({ from, to, branchId });
  const allItems = trxs.flatMap(t => (t.items || []).map(it => ({ ...it, _trx: t })));

  // KPI numbers
  const totalTransactions = trxs.length;
  const totalOmset = trxs.reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const totalCommission = allItems.reduce((s, it) => s + Number(it.commission_amount || 0), 0)
    + trxs.filter(t => t.is_home_service).reduce((s, t) => s + Number(t.home_service_fee || 0), 0);

  // Treatment distribution (by category) — donut
  const byCategory = {};
  for (const it of allItems) {
    const cat = it.service_category || 'other';
    if (!byCategory[cat]) byCategory[cat] = { count: 0, revenue: 0 };
    byCategory[cat].count += 1;
    byCategory[cat].revenue += Number(it.price || 0);
  }
  const treatmentDist = Object.entries(byCategory)
    .map(([cat, v]) => ({ key: cat, label: CATEGORY_LABELS[cat] || cat, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.count - a.count);

  // Omset per category — bar
  const omsetByCategory = treatmentDist
    .map(d => ({ label: d.label, value: d.revenue }))
    .sort((a, b) => b.value - a.value);

  // Omset per branch — bar
  const byBranch = {};
  for (const t of trxs) {
    const bid = t.branch_id || 'unknown';
    const bname = t.branch?.name || bid;
    if (!byBranch[bid]) byBranch[bid] = { label: bname, value: 0 };
    byBranch[bid].value += Number(t.total_amount || 0);
  }
  const omsetByBranch = Object.values(byBranch).sort((a, b) => b.value - a.value);

  // Trend line — per day or per month
  const trend = [];
  if (grain === 'month') {
    const byMonth = {};
    for (const t of trxs) {
      const m = (t.date || '').slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { count: 0, omset: 0 };
      byMonth[m].count += 1;
      byMonth[m].omset += Number(t.total_amount || 0);
    }
    const yr = (from || '').slice(0, 4);
    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    for (let mo = 1; mo <= 12; mo++) {
      const key = `${yr}-${String(mo).padStart(2, '0')}`;
      trend.push({ label: MONTH_SHORT[mo - 1], count: byMonth[key]?.count || 0, omset: byMonth[key]?.omset || 0 });
    }
  } else {
    const byDay = {};
    for (const t of trxs) {
      const d = t.date;
      if (!byDay[d]) byDay[d] = { count: 0, omset: 0 };
      byDay[d].count += 1;
      byDay[d].omset += Number(t.total_amount || 0);
    }
    const start = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dateToYMD(d);
      trend.push({ label: String(d.getDate()), fullDate: key, count: byDay[key]?.count || 0, omset: byDay[key]?.omset || 0 });
    }
  }

  // Estimated payroll = base+meal of active employees + total commission (indicative)
  let estPayroll = 0;
  try {
    const emps = await listPayrollEligibleEmployees(branchId);
    const baseSalaries = (emps || []).reduce((s, e) => s + Number(e.base_salary || 0) + Number(e.meal_allowance || 0), 0);
    estPayroll = baseSalaries + totalCommission;
  } catch (err) {
    estPayroll = totalCommission;
  }

  return {
    kpi: { totalTransactions, totalOmset, totalCommission, estPayroll },
    treatmentDist,
    omsetByCategory,
    omsetByBranch,
    trend,
  };
}

// =====================================================
// EXPENSES (Uang Keluar) — Tahap 4
// =====================================================

// List expenses in a date range (and optional branch)
async function listExpenses({ from, to, branchId = null } = {}) {
  let query = sb
    .from('expenses')
    .select('*, branch:branches(id, name)')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Create an expense
async function createExpense({ branchId, date, description, amount, paymentMethod, notes, createdBy }) {
  const { data, error } = await sb.from('expenses').insert({
    branch_id: branchId,
    date: date || todayStr(),
    description: description?.trim(),
    amount: Number(amount) || 0,
    payment_method: paymentMethod || 'cash',
    notes: notes?.trim() || null,
    created_by: createdBy || null,
  }).select().single();
  if (error) throw error;
  return data;
}

// Update an expense (admin only — enforced by RLS)
async function updateExpense(id, { date, description, amount, paymentMethod, notes }) {
  const { data, error } = await sb.from('expenses').update({
    date,
    description: description?.trim(),
    amount: Number(amount) || 0,
    payment_method: paymentMethod || 'cash',
    notes: notes?.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Delete an expense (admin only — enforced by RLS)
async function deleteExpense(id) {
  const { error } = await sb.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// Sum of tips grouped by payment method in a period
async function getTipsTotalByMethod({ from, to, branchId = null }) {
  let query = sb
    .from('transaction_tips')
    .select('amount, payment_method, transactions!inner(date, branch_id)')
    .gte('transactions.date', from)
    .lte('transactions.date', to);
  if (branchId) query = query.eq('transactions.branch_id', branchId);
  const { data, error } = await query;
  if (error) return {};
  const byMethod = {};
  for (const t of (data || [])) {
    const m = t.payment_method || 'qris';
    byMethod[m] = (byMethod[m] || 0) + Number(t.amount || 0);
  }
  return byMethod;
}

// Total tips amount in a period (for reports)
async function getTipsTotal({ from, to, branchId = null }) {
  const byMethod = await getTipsTotalByMethod({ from, to, branchId });
  return Object.values(byMethod).reduce((s, v) => s + v, 0);
}

// Compute cash balance per payment method for a period.
// balance = money IN (transaction payments + tips) − money OUT (expenses)
async function getCashBalance({ from, to, branchId = null }) {
  const trxs = await getReportTransactions({ from, to, branchId });
  const flow = computePaymentFlow(trxs);  // [{payment_method, total_amount, ...}]

  const byMethod = {};
  const ensure = (m) => {
    if (!byMethod[m]) byMethod[m] = { method: m, in: 0, out: 0, balance: 0 };
    return byMethod[m];
  };

  for (const f of flow) ensure(f.payment_method).in += Number(f.total_amount || 0);

  // Tips money also enters our account (separate from omset)
  const tips = await getTipsTotalByMethod({ from, to, branchId });
  for (const [m, amt] of Object.entries(tips)) ensure(m).in += amt;

  // Money OUT — expenses
  const expenses = await listExpenses({ from, to, branchId });
  for (const e of expenses) ensure(e.payment_method || 'cash').out += Number(e.amount || 0);

  let totalIn = 0, totalOut = 0;
  for (const m of Object.values(byMethod)) {
    m.balance = m.in - m.out;
    totalIn += m.in;
    totalOut += m.out;
  }

  return {
    byMethod: Object.values(byMethod).sort((a, b) => b.balance - a.balance),
    totalIn,
    totalOut,
    totalBalance: totalIn - totalOut,
  };
}

// Expose
Object.assign(window, {
  sb, SERVICES, JOB_TITLES, SALARY_OPTIONAL_TITLES, ROLES,
  CATEGORY_LABELS, getDashboardRange, getDashboardData,
  fmtRp, fmtRpOrDash, fmtNumber, fmtDate, fmtTime, todayStr, nowTimeStr, currentMonth,
  dateToYMD, startOfWeekMonday, endOfWeekSunday, DATE_PRESETS,
  isOvertime, isSalaryOptional, getServiceDef, calcCommission, getRoleLabel,
  toast, useToasts,
  loginWithEmail, logout, getCurrentSession, getMyProfile,
  listBranches, canAccessAllBranches, canManageBranch,
  listEmployees, updateEmployee, deactivateEmployee, reactivateEmployee,
  createEmployee, deleteEmployee,
  findClientByPhone, upsertClient,
  createTransaction, listRecentTransactions, listTransactionsByDateRange, getTodayStats, getMonthStats,
  getReportTransactions, aggregateReport,
  getPayrollPeriod, getPayrollPeriodForMonth, listRecentPayrollPeriods,
  listPayrollEligibleEmployees, getPeriodCommissionByEmployee,
  listPayrollAdjustments, upsertPayrollAdjustment,
  getAnnualLeaveBalances, calculatePayroll,
  listAuditLog, getAuditSummary, formatAuditDiff,
  getActionLabel, getActionColor, getActionBadge, getFieldLabel, formatAuditValue,
  exportToExcel, exportReportToExcel, exportPayrollToExcel,
  generateSlipHTML, getEmployeePeriodTransactions, getEmployeePeriodTips, printSlip, printMultipleSlips,
  getBrandForBranch, escapeHtml,
  generateInvoiceHTML, printInvoice, drawInvoiceToCanvas, downloadInvoicePNG,
  getMyDashboardStats, getMyRecentTransactions, getMyTopServices, getMyTopClients,
  getEmployeeDashboardStatsAdmin, getEmployeeTransactionsAdmin,
  getEmployeeTopServicesAdmin, getEmployeeTopClientsAdmin,
  getEmployeeById, getPayrollAdjustment, getAnnualLeaveBalanceForEmployee,
  approveSlip, unapproveSlip,
  getTransactionDetail, updateTransactionFull, deleteTransaction,
  checkTransactionEdited, getEditedTransactionIds,
  // Tahap E - Photos
  // Tahap E - Photos
  PHOTO_BUCKET, compressImage,
  uploadTreatmentPhoto, getTransactionPhotos, deleteTreatmentPhoto,
  markPhotoMarketing, refreshPhotoSignedUrl, updatePhotoSkipReason,
  listMarketingPhotos, listAllPhotos,
  // Tahap F - Payment + Multi-employee
  PAYMENT_METHODS, getPaymentMethodLabel, getPaymentMethodIcon,
  // Tahap G - DP & Payment Flow
  insertTransactionPayments, getTransactionPayments, replaceTransactionPayments,
  insertTransactionTips, replaceTransactionTips,
  listExpenses, createExpense, updateExpense, deleteExpense,
  getCashBalance, getTipsTotal, getTipsTotalByMethod,
  getPaymentFlowBreakdown, computePaymentFlow,
});
