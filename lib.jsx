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
  { name: 'Sulam Alis by Master', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Sulam Alis by Owner', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Sulam Alis by Junior', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Sulam Alis by Senior', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Retouch Sulam Alis', category: 'brow', commission_type: 'fixed_amount', baseRate: 0 },
  { name: 'Cukur Alis', category: 'brow', commission_type: 'percent', baseRate: 5 },
  { name: 'Threading Alis', category: 'brow', commission_type: 'percent', baseRate: 10 },
  { name: 'Korean Vit C Glow', category: 'facial', commission_type: 'percent', baseRate: 5 },
  { name: 'Korean BB Glow', category: 'facial', commission_type: 'percent', baseRate: 5 },
  { name: 'Nail Art', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Nail Polish (Polos)', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Nail Extension', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Manicure', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Pedicure', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Menipedi', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Menipedi Rendam', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Pedi Rendam', category: 'nail', commission_type: 'percent', baseRate: 10 },
  { name: 'Removal Nails', category: 'nail', commission_type: 'percent', baseRate: 10 },
  // Waxing sengaja dipisah dari nail supaya di Laporan angkanya terbaca sendiri.
  // Komisi 10 persen, dan otomatis jadi 15 persen kalau lembur, sama seperti nail
  // (tambahan 5 persen saat lembur diatur di calcCommission).
  { name: 'Brazilian Waxing', category: 'waxing', commission_type: 'percent', baseRate: 10 },
  { name: 'Underarm Waxing', category: 'waxing', commission_type: 'percent', baseRate: 10 },
  { name: 'Waxing (Area Lain)', category: 'waxing', commission_type: 'percent', baseRate: 10 },
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

// Jabatan yang otomatis tidak ikut absensi harian
const NO_ATTENDANCE_TITLES = ['Owner', 'Manager'];

// Aturan bawaan berdasarkan jabatan: Owner & Manager tidak ikut absensi
function isAttendanceExemptByTitle(jobTitle) {
  return NO_ATTENDANCE_TITLES.includes(jobTitle);
}

// Apakah karyawan ini dikecualikan dari absensi harian.
// skip_attendance punya tiga keadaan:
//   null  = ikuti aturan jabatan
//   true  = dikecualikan walau jabatannya biasanya absen (misal akun kiosk)
//   false = tetap ikut absensi walau jabatannya biasanya tidak (misal owner ikut coba)
function isAttendanceExempt(employee) {
  if (!employee) return false;
  if (employee.skip_attendance === true) return true;
  if (employee.skip_attendance === false) return false;
  return isAttendanceExemptByTitle(employee.job_title);
}

// Alasan pengecualian, untuk ditampilkan di kiosk
function attendanceExemptReason(employee) {
  if (!employee) return '';
  if (employee.skip_attendance === true) return 'Dikecualikan manual';
  if (isAttendanceExemptByTitle(employee.job_title)) return employee.job_title;
  return '';
}

// Gaji pokok tidak wajib untuk Owner/Manager, DAN untuk akun yang ditandai
// tidak ikut absensi (misalnya akun kiosk absensi yang bukan orang sungguhan)
function isSalaryOptionalFor(jobTitle, skipAttendance) {
  return SALARY_OPTIONAL_TITLES.includes(jobTitle) || !!skipAttendance;
}

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
      original_price: it.original_price != null ? Number(it.original_price) : (Number(it.price) || 0),
      discount_type: it.discount_type || null,
      discount_value: it.discount_value != null ? Number(it.discount_value) : null,
      discount_amount: it.discount_amount != null ? Number(it.discount_amount) : 0,
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

  // Meal allowance is paid per day actually present.
  // Rules: unpaid absence reduces it (weekend counted ONCE, not doubled like base
  // salary), while paid leave (annual leave / certified sick) does NOT reduce it.
  const mealAbsentDays = unpaidLeave + unpaidLeaveWeekend;

  let mealAllowanceActual;
  let mealDaysBase;   // days the meal allowance is counted against
  if (isProrated) {
    mealDaysBase = actualWorkDays;
    const proratedMeal = mealAllowance * (actualWorkDays / standardDays);
    mealAllowanceActual = mealAbsentDays > 0
      ? Math.round(proratedMeal * (1 - mealAbsentDays / actualWorkDays))
      : Math.round(proratedMeal);
  } else {
    mealDaysBase = standardDays;
    mealAllowanceActual = mealAbsentDays > 0
      ? Math.round(mealAllowance * (1 - mealAbsentDays / standardDays))
      : mealAllowance;
  }
  if (mealAllowanceActual < 0) mealAllowanceActual = 0;

  const mealDeduction = mealAllowance - mealAllowanceActual;
  const mealDaysPaid = Math.max(0, mealDaysBase - mealAbsentDays);

  // BPJS Kesehatan subsidy from company (fixed monthly amount, not prorated —
  // the premium is due monthly regardless of days worked)
  const bpjsKesehatan = Number(adjustment?.bpjs_kesehatan) || 0;

  // Potongan keterlambatan (dari sistem absensi, dihitung per hari terlambat)
  const lateDeduction = Number(adjustment?.late_deduction) || 0;

  // Gross take-home BEFORE any deduction (kasbon, telat).
  // Shown on the slip so the employee sees their salary without deductions.
  const totalBeforeDeduction = baseSalaryActual + mealAllowanceActual + bpjsKesehatan
    + treatmentCommission + hsCommission + tips + bonus;

  // Final take-home after all deductions
  const total = totalBeforeDeduction - extraDeduction - lateDeduction;

  return {
    base_salary: baseSalary,
    base_salary_actual: baseSalaryActual,
    salary_deduction: salaryDeduction,
    meal_allowance: mealAllowanceActual,
    meal_allowance_full: mealAllowance,
    meal_deduction: mealDeduction,
    meal_absent_days: mealAbsentDays,
    meal_days_paid: mealDaysPaid,
    meal_days_base: mealDaysBase,
    bpjs_kesehatan: bpjsKesehatan,
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
    late_deduction: lateDeduction,
    notes: adjustment?.notes || null,
    total_before_deduction: totalBeforeDeduction,
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
  bpjs_kesehatan: 'BPJS Kesehatan',
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
async function exportToExcel(filename, sheets) {
  // sheets: [{ name: 'Sheet1', rows: [{col1: val, col2: val}, ...] }, ...]
  // Lazy-load the Excel library on first use (kept out of initial page load for speed)
  if (typeof XLSX === 'undefined') {
    if (typeof window.__loadXLSX === 'function') {
      try {
        toast('Menyiapkan file Excel…', 'success');
        await window.__loadXLSX();
      } catch (e) {
        toast('Gagal memuat library Excel. Cek koneksi internet.', 'error');
        return;
      }
    } else {
      toast('Library Excel belum ter-load. Refresh halaman.', 'error');
      return;
    }
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
      { Metric: 'Total BPJS Kesehatan', Nilai: totals.bpjs || 0 },
      { Metric: 'Total Komisi', Nilai: totals.commission },
      { Metric: 'Total Tips', Nilai: totals.tips || 0 },
      { Metric: 'Total Bonus', Nilai: totals.bonus },
      { Metric: 'Total Potongan / Kasbon', Nilai: totals.deduction },
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
    'BPJS Kesehatan': r.payroll.bpjs_kesehatan || 0,
    'Komisi Treatment': r.payroll.treatment_commission,
    'Komisi HS': r.payroll.hs_commission,
    'Tips': r.payroll.tips || 0,
    'Cuti Tahunan (hari)': r.payroll.annual_leave_days,
    'Sakit + Surat (hari)': r.payroll.sick_leave_certified_days,
    'Izin/Absen (hari)': r.payroll.unpaid_leave_days,
    'Absen Weekend (hari)': r.payroll.unpaid_leave_weekend_days || 0,
    'Standar Hari Kerja': r.payroll.standard_work_days,
    Bonus: r.payroll.bonus,
    'Gaji Diterima (sblm potongan)': r.payroll.total_before_deduction != null ? r.payroll.total_before_deduction : (r.payroll.total + r.payroll.extra_deduction),
    'Potongan / Kasbon': r.payroll.extra_deduction,
    'TOTAL GAJI': r.payroll.total,
  }));
  sheets.push({ name: 'Detail Gaji', rows: payrollRows });

  const fname = `JBB_RekapGaji_${(branchLabel || 'all').replace(/\s/g, '_')}_${periodLabel.replace(/\s/g,'_').replace(/[\/]/g,'-')}`;
  exportToExcel(fname, sheets);
}

// =====================================================
// SLIP GAJI — Generate HTML for printing
// =====================================================

// =====================================================
// LOGO JBB & VIALI
// Bentuk logo disimpan sebagai path SVG (bisa diwarnai
// lewat atribut fill) plus versi PNG hitam untuk canvas.
// =====================================================

const LOGO_JBB = {
  w: 700, h: 436,
  d: 'M213.6 433.5C213.3 432.6 213.0 408.7 213.0 380.5L213.0 329.2L206.5 325.9C202.9 324.0 200.0 322.1 200.0 321.6C200.0 320.4 209.3 321.5 215.8 323.5L221.0 325.1L221.0 350.5L221.0 376.0L224.8 376.0C226.8 375.9 229.6 375.3 231.0 374.5C233.7 372.9 242.7 372.5 244.8 373.9C245.6 374.4 246.0 375.6 245.8 376.6C245.5 378.3 244.3 378.5 233.2 378.8L221.0 379.1L220.9 390.3C220.8 409.4 219.5 428.3 217.9 431.4C216.2 434.9 214.5 435.7 213.6 433.5ZM459.6 432.8C459.3 431.5 459.0 419.6 459.0 406.2L459.0 382.0L454.2 384.4C441.6 390.7 412.3 399.7 402.5 400.3C398.4 400.5 397.5 400.2 395.6 397.7C393.6 395.0 393.5 393.4 393.0 372.5C392.7 360.2 392.3 349.9 391.9 349.6C391.6 349.3 388.9 348.0 385.9 346.6C380.5 344.2 380.5 344.2 383.4 343.5C385.1 343.0 390.3 343.4 396.1 344.4C407.7 346.4 420.1 345.8 426.7 342.9C430.8 341.0 437.3 340.4 440.4 341.6C442.4 342.4 442.5 345.6 440.5 346.4C439.7 346.7 430.6 347.2 420.3 347.6C408.8 348.0 401.2 348.7 400.8 349.4C399.8 351.0 399.9 391.3 400.9 392.9C402.9 396.1 434.9 390.0 451.5 383.3L458.5 380.5L458.8 354.8L459.0 329.0L451.8 325.3L444.5 321.5L448.9 321.2C451.3 321.0 456.2 321.8 460.1 323.0L467.0 325.1L467.0 350.5L467.0 376.0L470.8 376.0C472.8 376.0 475.8 375.3 477.4 374.5C480.5 372.9 488.7 372.5 490.8 373.9C491.6 374.4 492.0 375.6 491.8 376.6C491.5 378.3 490.3 378.5 479.2 378.8L467.0 379.1L467.0 397.8C467.0 408.1 466.6 419.3 466.1 422.7C464.7 432.4 461.0 438.0 459.6 432.8ZM288.6 431.8C288.3 430.5 287.6 423.1 287.1 415.2C286.6 407.3 285.6 400.3 285.0 399.5C284.4 398.7 282.3 397.6 280.4 397.0C278.5 396.4 277.0 395.5 277.0 395.1C277.0 394.8 288.4 394.4 302.2 394.4C316.1 394.3 330.3 394.1 333.7 393.9C340.3 393.5 342.0 394.1 340.1 396.4C339.5 397.1 338.1 402.2 337.1 407.6C336.0 413.1 334.9 418.7 334.5 420.2C333.9 422.4 334.2 422.9 336.2 423.2C337.4 423.4 338.5 424.2 338.5 425.0C338.5 426.3 335.2 426.5 316.3 426.8L294.0 427.0L292.6 430.5C290.9 434.5 289.3 435.0 288.6 431.8ZM533.6 428.8C533.3 425.9 532.8 419.4 532.5 414.5C531.5 399.6 531.4 399.3 526.4 397.4C523.9 396.5 522.2 395.4 522.6 395.1C522.9 394.8 534.5 394.5 548.3 394.5C562.2 394.4 575.8 394.1 578.5 393.7C584.7 392.7 586.5 393.7 585.1 397.1C584.5 398.4 582.9 404.6 581.6 410.8L579.2 422.1L581.5 423.0C583.6 423.8 585.6 425.7 584.8 426.2C584.6 426.3 574.4 426.7 562.1 427.0L539.7 427.5L538.0 430.4C535.4 435.1 534.2 434.7 533.6 428.8ZM328.8 423.2C330.9 422.0 331.0 421.4 331.0 409.3L331.0 396.7L312.9 397.4C302.9 397.7 294.3 398.3 293.9 398.6C292.9 399.2 292.7 419.3 293.7 422.8L294.3 425.2L310.4 424.8C320.8 424.6 327.3 424.0 328.8 423.2ZM571.0 423.9L576.0 422.8L576.0 409.8L576.0 396.7L558.6 397.3C549.0 397.7 540.5 398.3 539.6 398.6C537.8 399.3 537.5 404.4 538.6 417.3L539.3 425.0L552.6 425.0C559.9 425.0 568.2 424.5 571.0 423.9ZM152.0 392.4C143.0 388.5 138.0 381.2 138.0 372.0C138.0 362.4 144.5 354.4 154.7 351.4C165.5 348.3 165.3 348.4 164.6 344.0C163.9 339.4 164.3 339.3 168.8 342.0C172.4 344.2 172.7 345.2 170.5 347.0C167.9 349.1 168.8 350.5 173.4 351.8C185.6 355.0 192.3 369.1 187.1 380.5C184.8 385.6 178.2 391.6 173.3 392.9C167.8 394.5 156.1 394.2 152.0 392.4ZM553.6 390.9C553.3 389.2 553.0 385.0 553.0 381.7L553.0 375.7L538.8 376.5C529.3 377.0 523.5 377.7 521.6 378.7C518.3 380.4 514.0 379.6 506.3 375.6L502.1 373.5L537.3 373.5C573.1 373.5 589.8 372.7 593.1 371.0C595.8 369.5 607.3 369.8 609.5 371.4C611.2 372.6 611.3 373.0 610.0 374.5C608.7 376.1 607.2 376.2 596.1 375.7C589.3 375.3 578.5 375.3 572.0 375.7L560.3 376.3L559.7 382.8C558.8 392.3 554.9 397.4 553.6 390.9ZM172.7 388.1C183.1 383.3 185.9 369.9 178.3 360.9C174.5 356.4 170.9 355.0 163.2 355.0C155.3 355.0 151.3 357.0 147.2 363.0C144.0 367.8 144.3 377.9 147.9 382.7C153.0 389.6 164.1 392.0 172.7 388.1ZM262.2 380.0C258.7 378.2 256.1 376.6 256.4 376.3C256.6 376.1 261.2 376.4 266.7 377.0C281.0 378.8 338.1 376.3 347.0 373.6C351.6 372.2 360.1 372.5 363.2 374.1C365.0 375.1 365.7 377.9 364.2 378.1C363.8 378.1 351.6 378.3 337.0 378.4C307.6 378.8 290.5 379.7 281.5 381.2C269.2 383.3 268.8 383.3 262.2 380.0ZM546.1 364.1C538.9 361.6 535.9 359.2 533.2 354.0C530.5 348.5 530.4 344.8 533.0 339.4C535.5 334.3 541.2 330.2 548.2 328.4C554.6 326.7 555.5 325.8 554.1 323.1C553.1 321.2 553.2 321.0 555.4 321.0C558.1 321.0 559.5 322.5 559.5 325.3C559.5 326.6 560.7 327.6 563.1 328.4C574.7 332.4 580.4 340.6 578.6 350.4C576.3 362.4 560.3 369.2 546.1 364.1ZM284.4 361.9C283.9 361.1 283.1 357.8 282.5 354.6C281.5 348.8 281.4 348.6 277.2 347.2C274.8 346.4 273.2 345.5 273.5 345.2C273.8 344.8 285.2 344.5 298.8 344.5C314.9 344.4 324.9 344.0 327.6 343.2C331.7 342.0 331.8 342.0 332.3 336.2C332.5 333.1 332.4 330.1 332.0 329.7C330.9 328.4 293.1 331.0 289.2 332.6C285.8 334.0 284.4 333.7 277.3 330.3C273.7 328.6 272.8 326.5 276.0 327.5C279.4 328.6 308.5 328.2 325.2 326.9C333.9 326.2 341.3 326.0 341.7 326.4C342.1 326.8 341.9 327.9 341.2 328.8C339.5 331.1 337.4 335.9 336.7 339.1C336.1 341.2 336.5 341.9 338.6 342.9C340.1 343.5 340.9 344.4 340.5 344.8C340.2 345.2 328.9 346.0 315.5 346.6C302.1 347.3 290.7 348.1 290.1 348.5C288.8 349.3 288.7 357.9 289.9 359.9C291.3 362.1 325.4 360.9 330.1 358.4C336.7 355.0 347.8 356.6 343.9 360.5C341.8 362.7 285.8 364.0 284.4 361.9ZM565.7 359.4C570.7 355.7 572.5 352.2 572.5 346.7C572.5 331.8 553.2 325.6 541.9 336.9C533.7 345.1 536.8 356.5 548.5 360.8C553.1 362.5 562.5 361.7 565.7 359.4ZM72.5 280.3C51.6 278.6 32.3 270.3 19.8 257.6C8.6 246.2 2.4 231.1 1.3 211.8L0.7 202.0L19.4 202.0L38.0 202.0L38.0 207.2C38.1 224.6 46.7 240.0 60.2 246.8C68.4 251.0 76.2 252.3 88.6 251.8C97.3 251.4 99.6 250.9 105.4 248.2C114.2 244.1 123.5 234.9 127.8 226.0C134.1 213.2 134.0 215.7 134.0 103.2L134.0 1.0L153.0 1.0L172.1 1.0L171.8 107.2L171.5 213.5L169.2 221.5C157.6 262.8 122.1 284.4 72.5 280.3ZM239.0 139.0L239.0 0.8L295.2 1.2C349.0 1.6 352.0 1.7 362.5 3.9C398.6 11.4 418.3 28.7 424.5 58.6C429.1 80.9 424.4 97.9 409.6 112.5C403.8 118.3 399.3 121.7 393.8 124.5C385.8 128.6 384.4 130.0 388.1 130.0C389.3 130.0 394.3 131.4 399.3 133.0C420.0 140.0 434.4 154.9 441.8 176.8C444.2 183.8 444.4 185.9 444.4 200.5C444.4 215.8 444.2 216.9 441.2 226.0C434.3 246.8 420.4 260.6 397.4 269.4C379.8 276.1 377.0 276.4 304.2 276.8L239.0 277.1L239.0 139.0ZM493.0 139.0L493.0 0.8L549.2 1.2C603.0 1.6 606.0 1.7 616.5 3.9C653.4 11.5 674.0 30.3 678.9 61.1C682.5 83.1 678.0 98.3 663.6 112.5C657.8 118.3 653.3 121.7 647.8 124.5C639.8 128.6 638.4 130.0 642.1 130.0C643.3 130.0 648.3 131.4 653.3 133.0C680.4 142.1 697.3 165.4 698.7 195.6C700.4 231.4 684.6 256.4 652.1 269.1C633.9 276.2 631.5 276.4 558.2 276.8L493.0 277.1L493.0 139.0ZM375.2 245.2C387.2 241.2 396.7 233.5 401.8 223.5C408.9 209.9 408.7 189.1 401.3 174.6C397.9 167.9 387.9 158.2 380.5 154.3C367.9 147.8 365.1 147.5 318.5 147.5L276.5 147.5L276.2 197.8L276.0 248.1L322.2 247.7C366.8 247.4 368.7 247.3 375.2 245.2ZM629.2 245.2C641.2 241.2 650.7 233.5 655.8 223.5C662.9 209.9 662.7 189.1 655.3 174.6C651.9 167.9 641.9 158.2 634.5 154.3C621.9 147.8 619.1 147.5 572.5 147.5L530.5 147.5L530.2 197.8L530.0 248.1L576.2 247.7C620.8 247.4 622.7 247.3 629.2 245.2ZM357.2 116.3C369.9 112.5 380.8 103.0 385.2 92.2C387.1 87.4 387.5 84.7 387.5 74.5C387.5 64.2 387.1 61.7 385.1 56.5C382.1 49.0 373.3 40.0 365.8 36.5C353.6 30.9 351.2 30.6 312.2 30.2L276.0 29.9L276.0 73.8C276.0 97.9 276.3 118.0 276.7 118.4C277.1 118.8 293.9 119.0 314.0 118.8C347.1 118.4 351.1 118.2 357.2 116.3ZM609.7 116.8C618.8 114.0 624.3 110.8 630.6 104.6C639.4 95.8 641.5 90.1 641.5 74.5C641.5 64.2 641.1 61.7 639.1 56.5C636.1 49.0 627.3 40.0 619.8 36.5C607.6 30.9 605.2 30.6 566.2 30.2L530.0 29.9L530.0 73.8C530.0 97.9 530.3 118.0 530.7 118.4C531.1 118.8 547.9 119.0 568.0 118.7C597.4 118.4 605.5 118.0 609.7 116.8Z'
};

const LOGO_VIALI = {
  w: 700, h: 304,
  d: 'M487.7 303.4C487.3 303.0 487.0 295.8 487.0 287.3L487.0 272.0L483.2 273.9C474.7 278.2 449.3 286.0 443.7 286.0C439.6 286.0 438.5 283.5 438.0 272.6L437.5 262.5L433.6 260.6C430.3 259.0 430.0 258.6 431.5 257.7C432.6 257.2 435.3 257.1 438.4 257.5C443.8 258.4 454.8 258.3 459.1 257.4C461.6 256.9 461.8 256.5 462.5 248.9C462.8 244.4 462.9 240.6 462.6 240.3C462.4 240.0 457.9 240.3 452.8 240.9C439.8 242.6 438.4 242.5 435.5 240.6C434.0 239.6 433.0 238.7 433.2 238.6C433.3 238.4 442.0 238.0 452.3 237.7C469.7 237.2 471.1 237.3 470.4 238.8C470.0 239.7 468.8 243.8 467.7 247.9L465.6 255.2L468.1 257.0C471.2 259.4 470.4 259.7 456.6 260.5C450.6 260.8 445.3 261.3 444.8 261.6C443.4 262.5 443.8 280.0 445.2 280.1C452.9 280.7 470.2 276.8 482.2 271.8L487.0 269.8L487.0 250.0C487.0 228.2 487.3 229.1 480.1 225.5C477.4 224.1 477.0 223.6 478.2 222.9C479.7 222.0 489.6 224.2 491.2 225.8C491.7 226.3 492.0 241.9 491.8 262.6C491.5 292.7 491.3 298.9 490.0 301.3C489.1 302.8 488.1 303.8 487.7 303.4ZM313.7 302.3C313.3 302.0 313.0 285.3 313.0 265.3L313.0 228.9L309.9 227.2C308.2 226.3 306.1 225.0 305.2 224.3C302.0 222.1 306.6 221.6 312.8 223.6L318.5 225.5L318.4 261.5C318.2 295.8 317.7 303.0 315.2 303.0C314.7 303.0 314.0 302.7 313.7 302.3ZM366.2 299.5C364.4 298.2 364.0 296.9 364.0 293.0C364.0 288.5 363.8 288.1 360.8 287.1C359.1 286.5 358.0 285.7 358.3 285.4C358.6 285.0 366.7 284.8 376.3 284.9C395.8 285.1 395.0 285.4 395.0 277.9L395.0 274.0L390.2 274.0C387.6 274.0 380.7 274.5 374.7 275.0C365.1 275.9 363.6 275.9 360.7 274.3C357.5 272.5 357.7 272.5 379.0 271.9C390.8 271.6 400.8 271.6 401.2 271.9C401.6 272.3 401.1 275.0 399.9 277.9C398.0 283.0 398.0 283.3 399.7 284.5C400.7 285.2 401.3 286.1 401.0 286.4C400.7 286.7 393.5 287.3 385.0 287.7L369.5 288.5L369.9 293.0C370.0 295.5 370.4 297.9 370.7 298.4C371.5 299.6 393.5 298.5 399.1 297.0C404.6 295.4 409.3 296.3 408.8 298.8C408.5 300.3 406.4 300.5 388.5 300.8C371.6 301.0 368.2 300.8 366.2 299.5ZM263.7 281.3C263.3 281.0 263.0 272.2 263.0 261.8L263.0 242.9L259.0 241.2C256.8 240.3 255.0 239.2 255.0 238.8C255.0 237.7 265.2 237.8 266.9 238.9C268.0 239.6 268.3 241.4 268.1 245.5L267.9 251.1L278.7 250.8L289.5 250.5L289.8 245.6C290.2 240.3 288.6 237.6 284.4 236.6C283.1 236.2 282.0 235.5 282.0 234.8C282.0 233.7 291.9 234.2 294.0 235.5C295.3 236.3 295.3 270.3 294.0 275.2C292.7 279.7 291.1 281.0 290.3 278.1C289.8 276.1 289.1 276.0 279.0 276.0L268.2 276.0L267.0 279.0C265.8 282.0 264.9 282.6 263.7 281.3ZM281.8 273.3L290.0 272.7L290.0 263.4C290.0 258.3 289.7 254.0 289.2 253.8C288.8 253.6 283.9 253.6 278.2 253.8L268.0 254.1L268.0 264.1L268.0 274.0L270.8 274.0C272.3 274.0 277.2 273.7 281.8 273.3ZM395.8 247.8L395.5 228.5L391.2 226.2C383.8 222.1 387.0 220.5 396.4 223.8L401.4 225.5L401.1 238.6C401.0 245.9 401.2 252.0 401.7 252.3C402.1 252.6 404.3 252.2 406.5 251.4C411.7 249.6 416.4 249.6 418.0 251.5C419.7 253.6 415.6 255.0 407.4 255.0L401.0 255.0L401.0 258.2C401.0 261.9 399.1 266.1 397.3 266.7C396.3 267.1 396.0 262.6 395.8 247.8ZM354.5 261.8C348.7 259.8 344.0 253.7 344.0 248.3C344.0 242.3 350.5 235.8 357.8 234.4C361.6 233.7 362.6 232.4 361.0 230.5C360.0 229.2 360.2 229.0 362.3 229.0C365.2 229.0 367.7 231.4 365.9 232.5C365.2 233.0 366.9 234.3 370.1 235.9C382.8 242.0 383.2 254.5 371.0 260.8C366.2 263.2 359.7 263.6 354.5 261.8ZM369.0 257.5C372.7 255.6 374.0 253.2 374.0 248.5C374.0 241.5 369.8 238.0 361.3 238.0C355.5 238.0 352.3 239.9 350.3 244.7C346.3 254.5 358.6 262.9 369.0 257.5ZM59.5 159.8C59.2 159.1 46.0 123.3 30.0 80.3C14.1 37.2 1.0 1.6 1.0 1.0C1.0 0.4 5.4 0.0 12.4 0.0L23.8 0.0L25.8 5.8C26.8 8.9 36.3 36.0 46.8 66.0C57.3 96.0 66.6 123.3 67.6 126.8C68.5 130.2 69.4 132.9 69.6 132.7C69.8 132.5 71.0 128.8 72.3 124.4C73.5 120.1 83.7 90.3 94.9 58.2L115.3 -0.0L126.7 -0.0C133.0 -0.0 138.0 0.4 138.0 0.9C138.0 1.6 83.5 149.1 79.5 159.2C78.9 160.7 77.4 161.0 69.4 161.0C62.7 161.0 59.8 160.6 59.5 159.8ZM208.0 80.5L208.0 0.0L218.5 0.0L229.0 0.0L229.0 80.5L229.0 161.0L218.5 161.0L208.0 161.0L208.0 80.5ZM304.1 158.3C305.4 154.9 357.6 10.3 359.7 4.3L361.2 0.0L370.4 0.0L379.6 0.0L407.5 79.3C422.8 122.8 435.5 159.1 435.8 159.8C436.1 160.7 433.6 161.0 425.2 161.0L414.1 161.0L407.3 140.5L400.5 120.0L370.0 120.0L339.4 120.0L332.4 140.2L325.5 160.5L314.2 160.8L303.0 161.1L304.1 158.3ZM506.0 80.5L506.0 0.0L516.5 0.0L527.0 0.0L527.2 72.3L527.5 144.5L566.8 144.8L606.0 145.0L606.0 153.0L606.0 161.0L556.0 161.0L506.0 161.0L506.0 80.5ZM678.0 80.5L678.0 -0.1L688.8 0.2L699.5 0.5L699.8 80.8L700.0 161.0L689.0 161.0L678.0 161.0L678.0 80.5ZM394.0 101.6C394.0 100.6 371.0 33.7 370.5 33.2C370.2 32.9 369.9 32.9 369.7 33.1C369.5 33.3 364.2 48.4 358.0 66.5C351.8 84.7 346.5 100.1 346.2 100.8C345.9 101.7 351.0 102.0 369.9 102.0C383.2 102.0 394.0 101.8 394.0 101.6Z'
};

// Versi PNG hitam, dipakai untuk nota versi gambar (canvas).
// Sengaja PNG, bukan SVG, supaya aman di Safari lama.
const LOGO_JBB_PNG = 'data:image/png;base64,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';

const LOGO_VIALI_PNG = 'data:image/png;base64,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';

// Bikin markup <svg> siap tempel. Dipakai di nota HTML dan slip gaji.
function logoSVG(logo, height, color) {
  const w = Math.round(height * logo.w / logo.h);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + height +
         '" viewBox="0 0 ' + logo.w + ' ' + logo.h + '" role="img" aria-label="Logo">' +
         '<path fill="' + color + '" d="' + logo.d + '"/></svg>';
}

// Bikin markup <svg> dengan lebar yang ditentukan (tinggi ikut proporsi).
function logoSVGWidth(logo, width, color) {
  return logoSVG(logo, Math.round(width * logo.h / logo.w), color);
}

// Muat gambar logo untuk canvas. Sengaja tidak pernah gagal:
// kalau gambarnya bermasalah, kembalikan null dan nota tetap tercetak.
function loadLogoImage(src) {
  return new Promise(function (resolve) {
    try {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    } catch (e) {
      resolve(null);
    }
  });
}

// Determine brand for a branch
function getBrandForBranch(branchId) {
  // VIALI Tangerang punya brand sendiri
  if (branchId === 'vli') {
    return {
      name: 'VIALI',
      tagline: 'BEAUTY',
      color: '#7a667e',
      logo: LOGO_VIALI,
      logoPng: LOGO_VIALI_PNG,
    };
  }
  return {
    name: 'JBB',
    tagline: '아름다움',
    color: '#7a667e',
    logo: LOGO_JBB,
    logoPng: LOGO_JBB_PNG,
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
// Group items done together (same share_group_id) into one logical line for invoices.
// A treatment done by 2+ beauticians is stored as multiple rows (split price);
// for the client-facing invoice we merge them: combined names + full price.
function groupSharedInvoiceItems(rawItems) {
  const groups = [];
  const byGroup = {};
  for (const it of (rawItems || [])) {
    const gid = it.share_group_id;
    if (gid) {
      if (!byGroup[gid]) {
        byGroup[gid] = {
          service_name: it.service_name,
          discount_type: it.discount_type,
          discount_value: it.discount_value,
          price: 0, original_price: 0, discount_amount: 0,
          names: [],
        };
        groups.push(byGroup[gid]);
      }
      const g = byGroup[gid];
      g.price += Number(it.price || 0);
      g.original_price += Number(it.original_price != null ? it.original_price : it.price || 0);
      g.discount_amount += Number(it.discount_amount || 0);
      if (it.employee?.full_name) g.names.push(it.employee.full_name);
    } else {
      groups.push({
        service_name: it.service_name,
        discount_type: it.discount_type,
        discount_value: it.discount_value,
        price: Number(it.price || 0),
        original_price: Number(it.original_price != null ? it.original_price : it.price || 0),
        discount_amount: Number(it.discount_amount || 0),
        names: it.employee?.full_name ? [it.employee.full_name] : [],
      });
    }
  }
  return groups;
}

// Format names naturally: "A", "A dan B", "A, B dan C"
function formatBeauticianNames(names) {
  if (!names || names.length === 0) return '—';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} dan ${names[1]}`;
  return names.slice(0, -1).join(', ') + ' dan ' + names[names.length - 1];
}

function generateInvoiceHTML(trx) {
  const brand = getBrandForBranch(trx.branch_id);
  const isViali = trx.branch_id === 'vli';
  const info = getBranchInfo(trx.branch_id, trx.branch?.name || '');
  const items = trx.items || [];
  const payments = (trx.payments || []).slice().sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0));

  // Subtotal = sum of final (discounted) prices. Also compute original subtotal & total discount.
  const subtotal = items.reduce((s, it) => s + Number(it.price || 0), 0);
  const originalSubtotal = items.reduce((s, it) => s + Number(it.original_price != null ? it.original_price : it.price || 0), 0);
  const totalDiscount = items.reduce((s, it) => s + Number(it.discount_amount || 0), 0);
  const hsFee = trx.is_home_service ? Number(trx.home_service_fee || 0) : 0;
  const grandTotal = subtotal + hsFee;

  // Format short transaction number from id (last 6 chars uppercase)
  const trxNo = (trx.id || '').replace(/-/g, '').slice(-6).toUpperCase();

  // Date = transaction date. Time = WHEN INVOICE IS PRINTED (now), not treatment start time.
  const dateStr = fmtDate(trx.date);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Group items done together (same share_group_id) into ONE line for the invoice.
  const groupedItems = groupSharedInvoiceItems(items);

  // Build items rows. Show original price (struck) + discount + final when discounted.
  const itemRows = groupedItems.map(it => {
    const empName = formatBeauticianNames(it.names);
    const hasDiscount = Number(it.discount_amount || 0) > 0 && Number(it.original_price) > Number(it.price);
    const discLabel = it.discount_type === 'percent' && it.discount_value
      ? `Diskon ${it.discount_value}%`
      : 'Diskon';
    if (hasDiscount) {
      return `
      <div class="item">
        <div class="item-name">${escapeHtml(it.service_name)}</div>
        <div class="item-row">
          <span class="item-emp">oleh ${escapeHtml(empName)}</span>
          <span class="item-strike">${fmtRp(it.original_price)}</span>
        </div>
        <div class="item-row">
          <span class="item-disc">${discLabel}</span>
          <span class="item-disc">−${fmtRp(it.discount_amount)}</span>
        </div>
        <div class="item-row">
          <span></span>
          <span class="item-price">${fmtRp(it.price)}</span>
        </div>
      </div>`;
    }
    return `
      <div class="item">
        <div class="item-name">${escapeHtml(it.service_name)}</div>
        <div class="item-row">
          <span class="item-emp">oleh ${escapeHtml(empName)}</span>
          <span class="item-price">${fmtRp(it.price)}</span>
        </div>
      </div>`;
  }).join('');

  // Payments: DP rows come first (shown near top of payment block), pelunasan after.
  const dpPayments = payments.filter(p => p.is_dp);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalDp = dpPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const hasDp = dpPayments.length > 0;
  const sisa = grandTotal - totalPaid;
  const showSisa = payments.length > 0 && totalPaid < grandTotal;

  // Payment breakdown: show each payment (DP + pelunasan) with method & amount.
  // Example: "DP (QRIS) Rp 150.000" + "Pelunasan (QRIS) Rp 249.000"
  const paymentBreakdownRows = payments.length > 0
    ? payments.map(p => {
        const label = p.is_dp ? `DP (${getPaymentMethodLabel(p.payment_method)})` : `Pelunasan (${getPaymentMethodLabel(p.payment_method)})`;
        return `<div class="total-row"><span>${label}</span><span>${fmtRp(p.amount)}</span></div>`;
      }).join('')
    : `<div class="total-row"><span>Pembayaran (${getPaymentMethodLabel(trx.payment_method || 'cash')})</span><span>${fmtRp(grandTotal)}</span></div>`;

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
  .brand-logo { margin-bottom: 5px; }
  .brand-logo svg { display: block; margin: 0 auto; }
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
  .item-strike { white-space: nowrap; text-decoration: line-through; color: #999; font-size: 9px; }
  .item-disc { white-space: nowrap; color: #a00; font-size: 9px; }
  .totals { font-size: 11px; }
  .total-row { display: flex; justify-content: space-between; }
  .disc-line { color: #a00; }
  .grand { font-weight: bold; font-size: 13px; }
  .dp-row { font-size: 10px; color: #b8893d; margin-top: 2px; }
  .pay-row { display: flex; justify-content: space-between; font-size: 10px; }
  .pay-final { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 2px; }
  .pay-note { text-align: right; font-size: 9px; color: #4a7c59; margin-top: 2px; }
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
      <div class="brand-logo">${logoSVGWidth(brand.logo, 100, '#000')}</div>
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
      ${totalDiscount > 0 ? `<div class="total-row"><span>Subtotal (sebelum diskon)</span><span>${fmtRp(originalSubtotal)}</span></div>` : ''}
      ${totalDiscount > 0 ? `<div class="total-row disc-line"><span>Total Diskon</span><span>−${fmtRp(totalDiscount)}</span></div>` : ''}
      <div class="total-row"><span>Subtotal</span><span>${fmtRp(subtotal)}</span></div>
      ${hsFee > 0 ? `<div class="total-row"><span>Biaya Home Service</span><span>${fmtRp(hsFee)}</span></div>` : ''}
      <div class="total-row grand"><span>TOTAL</span><span>${fmtRp(grandTotal)}</span></div>
    </div>

    <div class="divider"></div>

    <div class="totals">
      ${paymentBreakdownRows}
      ${sisa > 0 ? `<div class="total-row" style="color:#a00;font-weight:bold;"><span>SISA BELUM DIBAYAR</span><span>${fmtRp(sisa)}</span></div>` : ''}
    </div>

    <div class="divider"></div>

    <div class="pay-final">
      <span>${sisa > 0 ? 'SUDAH DIBAYAR' : 'TOTAL DIBAYAR'}</span>
      <span>${fmtRp(totalPaid)}</span>
    </div>
    ${(sisa <= 0 && payments.length > 0) ? `<div class="pay-note">✓ LUNAS</div>` : ''}

    <div class="footer">
      <div class="footer-thanks">Terima Kasih</div>
      <div>Sampai jumpa kembali ✨</div>
      <div class="review-note">
        <strong>Jika Anda puas, ceritakan ke teman.<br/>
        Jika ada kekurangan, sampaikan dulu kepada kami,<br/>
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
async function drawInvoiceToCanvas(trx) {
  const brand = getBrandForBranch(trx.branch_id);
  const isViali = trx.branch_id === 'vli';
  const info = getBranchInfo(trx.branch_id, trx.branch?.name || '');
  const items = trx.items || [];
  const payments = (trx.payments || []).slice().sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0));
  const subtotal = items.reduce((s, it) => s + Number(it.price || 0), 0);
  const originalSubtotal = items.reduce((s, it) => s + Number(it.original_price != null ? it.original_price : it.price || 0), 0);
  const totalDiscount = items.reduce((s, it) => s + Number(it.discount_amount || 0), 0);
  const hsFee = trx.is_home_service ? Number(trx.home_service_fee || 0) : 0;
  const grandTotal = subtotal + hsFee;
  const trxNo = (trx.id || '').replace(/-/g, '').slice(-6).toUpperCase();
  const dateStr = fmtDate(trx.date);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const dpPayments = payments.filter(p => p.is_dp);
  const hasDp = dpPayments.length > 0;
  const sisa = grandTotal - totalPaid;
  const finalPayment = payments.find(p => !p.is_dp);
  const finalMethodLabel = finalPayment ? getPaymentMethodLabel(finalPayment.payment_method) : getPaymentMethodLabel(trx.payment_method || 'cash');
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

  // HEADER — logo asli. Pakai PNG hitam supaya tajam di printer termal
  // dan aman di Safari lama (SVG di canvas kadang bermasalah di sana).
  // Kalau logonya gagal dimuat, jatuh balik ke tulisan seperti versi lama.
  const logoImg = await loadLogoImage(brand.logoPng);
  if (logoImg && logoImg.naturalWidth) {
    const LOGO_W = 120;
    const logoH = Math.round(LOGO_W * logoImg.naturalHeight / logoImg.naturalWidth);
    ops.push({ type: 'image', img: logoImg, w: LOGO_W, h: logoH, step: logoH + 8 });
  } else {
    addText(brand.name, F(30, 'bold', SERIF), '#000', 'center', 32);
    addText(brand.tagline, F(11), '#555', 'center', 15);
  }
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

  // ITEMS (grouped: treatment done together shows as one line with combined names)
  const groupedItems = groupSharedInvoiceItems(items);
  for (const it of groupedItems) {
    const empName = formatBeauticianNames(it.names);
    const hasDiscount = Number(it.discount_amount || 0) > 0 && Number(it.original_price) > Number(it.price);
    addWrapped(it.service_name, F(13, 'bold'), '#000', 'left', 16);
    if (hasDiscount) {
      const discLabel = it.discount_type === 'percent' && it.discount_value ? `Diskon ${it.discount_value}%` : 'Diskon';
      addRow('oleh ' + empName, fmtRp(it.original_price), F(11), '#999');
      addRow(discLabel, '-' + fmtRp(it.discount_amount), F(10), '#a00');
      addRow('', fmtRp(it.price), F(12, 'bold'), '#000');
    } else {
      addRow('oleh ' + empName, fmtRp(it.price), F(11), '#333');
    }
    addGap(3);
  }
  addDivider();

  // TOTALS
  if (totalDiscount > 0) {
    addRow('Subtotal (asli)', fmtRp(originalSubtotal), F(11), '#666');
    addRow('Total Diskon', '-' + fmtRp(totalDiscount), F(11), '#a00');
  }
  addRow('Subtotal', fmtRp(subtotal), F(12), '#000');
  if (hsFee > 0) addRow('Biaya Home Service', fmtRp(hsFee), F(11), '#000');
  addRow('TOTAL', fmtRp(grandTotal), F(15, 'bold'), '#000');
  addDivider();

  // PAYMENT BREAKDOWN — DP + pelunasan, each with method
  if (payments.length > 0) {
    for (const p of payments) {
      const label = p.is_dp ? `DP (${getPaymentMethodLabel(p.payment_method)})` : `Pelunasan (${getPaymentMethodLabel(p.payment_method)})`;
      addRow(label, fmtRp(p.amount), F(11), '#000');
    }
  } else {
    addRow(`Pembayaran (${getPaymentMethodLabel(trx.payment_method || 'cash')})`, fmtRp(grandTotal), F(11), '#000');
  }
  if (sisa > 0) addRow('SISA BELUM DIBAYAR', fmtRp(sisa), F(12, 'bold'), '#a00');
  addDivider();

  // TOTAL DIBAYAR (bold, bottom)
  addRow(sisa > 0 ? 'SUDAH DIBAYAR' : 'TOTAL DIBAYAR', fmtRp(totalPaid), F(15, 'bold'), '#000');
  if (sisa <= 0 && payments.length > 0) addRow('', '✓ LUNAS', F(10), '#4a7c59');

  // FOOTER
  addGap(8);
  addText('Terima Kasih', F(15, 'bold', SERIF), '#000', 'center', 18);
  addText('Sampai jumpa kembali', F(11), '#333', 'center', 16);
  addGap(4);
  addWrapped('Jika Anda puas, ceritakan ke teman. Jika ada kekurangan, sampaikan dulu kepada kami, akan kami perbaiki segera.', F(10, 'bold'), '#111', 'center', 13);
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
    } else if (op.type === 'image') {
      try {
        ctx.drawImage(op.img, Math.round((W - op.w) / 2), yy, op.w, op.h);
      } catch (e) {
        console.error('Gagal menggambar logo di nota:', e);
      }
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
async function downloadInvoicePNG(trx) {
  try {
    const cv = await drawInvoiceToCanvas(trx);
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
      id, service_name, price, commission_amount, commission_rate, commission_type, has_complaint, complaint_note, notes,
      share_group_id, share_percent,
      transaction:transactions(
        id, date, start_time, is_overtime, is_home_service, home_service_fee,
        client_name_snapshot, client_phone_snapshot,
        all_items:transaction_items(employee_id)
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

// Hitung jatah komisi home service milik SATU karyawan, dari daftar item
// miliknya sendiri (hasil getEmployeePeriodTransactions).
//
// Kenapa perlu fungsi ini: view my_dashboard_stats cuma menjumlahkan
// commission_amount per treatment. Biaya home service disimpan di tabel
// transactions, bukan di transaction_items, jadi TIDAK ikut terhitung di sana.
//
// Rumusnya sengaja dibuat sama persis dengan yang dipakai di dalam
// generateSlipHTML dan di getPeriodCommissionByEmployee (sisi admin):
// biaya home service dibagi rata ke semua beautician yang mengerjakan
// transaksi itu, bukan diberikan penuh ke masing-masing.
function computeHSCommissionFromItems(items) {
  const byTrx = {};
  for (const it of (items || [])) {
    const t = it.transaction;
    if (!t || !t.is_home_service) continue;
    if (byTrx[t.id]) continue;
    byTrx[t.id] = {
      fee: Number(t.home_service_fee || 0),
      workerCount: Math.max(1, new Set(
        (t.all_items || []).map(x => x.employee_id).filter(Boolean)
      ).size),
    };
  }
  let total = 0;
  for (const id in byTrx) {
    total += Math.round(byTrx[id].fee / byTrx[id].workerCount);
  }
  return total;
}

// Generate slip HTML for one employee
function generateSlipHTML({ employee, payroll, items, period, branch, generatedBy, isApproved = false, tipsDetail = [], attendance = null }) {
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
        // How many distinct beauticians worked this transaction — the home service
        // fee is shared equally between them (not given in full to each).
        worker_count: Math.max(1, new Set(
          (it.transaction.all_items || []).map(x => x.employee_id).filter(Boolean)
        ).size),
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
    // Home service fee is shared equally between all beauticians who worked the
    // transaction. This slip belongs to ONE employee, so take their share first,
    // then spread that share across their own items in the transaction.
    const isHS = trx.is_home_service;
    const hsFee = Number(trx.home_service_fee || 0);
    const workerCount = Math.max(1, Number(trx.worker_count) || 1);
    const hsShareForThisEmployee = isHS ? Math.round(hsFee / workerCount) : 0;
    const hsPortionPerItem = isHS && trx.items.length > 0 ? Math.round(hsShareForThisEmployee / trx.items.length) : 0;
    // Handle remainder so the employee's items still total their full share
    const hsRemainder = isHS ? hsShareForThisEmployee - (hsPortionPerItem * trx.items.length) : 0;

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
            ${it.has_complaint ? '<span class="tag tag-red">komplain</span>' : ''}
            ${(it.notes || '').toLowerCase().includes('paket') ? '<span class="tag tag-mauve">sudah paket</span>' : ''}
            ${(Number(it.price) === 0 && !(it.notes || '').toLowerCase().includes('paket')) ? '<span class="tag tag-mauve">gratis</span>' : ''}
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
  .brand-logo {
    display: inline-block;
    line-height: 0;
  }
  .brand-logo svg { display: block; }
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
  .tag-red { background: #fdf2f2; color: #a85555; }

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
      <span class="brand-logo">${logoSVGWidth(brand.logo, 150, brand.color)}</span>
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

  ${attendance ? `
  <div class="section-title">Ringkasan Absensi</div>
  <table class="detail-table">
    <thead>
      <tr>
        <th>Hari Hadir</th>
        <th>Toleransi 09:45–10:00 (jatah ${attendance.tolerance_quota || 7})</th>
        <th>Telat (di atas 10:00)</th>
        <th>Lupa Absen Pulang</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${attendance.days_present} hari</td>
        <td${(attendance.tolerance_over || 0) > 0 ? ' style="color: #b8893d;"' : ''}>${attendance.days_tolerance || 0} kali${(attendance.tolerance_over || 0) > 0 ? ` (${attendance.tolerance_over} lewat jatah)` : ''}</td>
        <td${(attendance.effective_late_days || 0) > 0 ? ' style="color: #a85555;"' : ''}>${attendance.effective_late_days || 0} hari</td>
        <td${attendance.days_no_clockout > 0 ? ' style="color: #b8893d;"' : ''}>${attendance.days_no_clockout} hari</td>
      </tr>
    </tbody>
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
      ${(payroll.meal_deduction || 0) > 0 ? `
      <tr>
        <td>Uang Makan</td>
        <td class="cell-num">${fmtRp(payroll.meal_allowance_full)}</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; font-size: 11px; color: #6b5b6e;">
          ${payroll.is_prorated
            ? `Pro-rata + absen: dibayar ${payroll.meal_days_paid} dari ${payroll.standard_work_days} hari`
            : `Potongan absen ${payroll.meal_absent_days} hari (dibayar ${payroll.meal_days_paid} dari ${payroll.meal_days_base} hari)`}
        </td>
        <td class="cell-num neg">−${fmtRp(payroll.meal_deduction)}</td>
      </tr>
      <tr>
        <td style="padding-left: 20px; font-style: italic; color: #6b5b6e;">Uang Makan Aktual</td>
        <td class="cell-num" style="font-weight: 500;">${fmtRp(payroll.meal_allowance)}</td>
      </tr>
      ` : `
      <tr>
        <td>Uang Makan</td>
        <td class="cell-num">${fmtRp(payroll.meal_allowance)}</td>
      </tr>
      `}
      ${(payroll.bpjs_kesehatan || 0) > 0 ? `
      <tr>
        <td>BPJS Kesehatan <span style="font-size: 10px; color: #6b5b6e;">(tunjangan dari perusahaan)</span></td>
        <td class="cell-num">${fmtRp(payroll.bpjs_kesehatan)}</td>
      </tr>
      ` : ''}
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
      ${(payroll.extra_deduction > 0 || payroll.late_deduction > 0) ? `
      <tr class="breakdown-row-bold">
        <td>GAJI DITERIMA</td>
        <td class="cell-num">${fmtRp(payroll.total_before_deduction != null ? payroll.total_before_deduction : (payroll.total + payroll.extra_deduction + (payroll.late_deduction || 0)))}</td>
      </tr>
      ${(payroll.late_deduction || 0) > 0 ? `
      <tr>
        <td>
          Potongan Keterlambatan
          ${attendance && ((attendance.tolerance_over || 0) > 0 || (attendance.days_late || 0) > 0) ? `
          <span style="font-size: 10px; color: #6b5b6e;">
            (${[
              (attendance.tolerance_over || 0) > 0
                ? `${attendance.tolerance_over} toleransi lewat jatah × ${fmtRp(attendance.tolerance_over_penalty_per_day || 5000)}`
                : null,
              (attendance.days_late || 0) > 0
                ? `${attendance.days_late} hari telat × ${fmtRp(attendance.late_penalty_per_day || 15000)}`
                : null,
            ].filter(Boolean).join(' + ')})
          </span>` : ''}
        </td>
        <td class="cell-num neg">−${fmtRp(payroll.late_deduction)}</td>
      </tr>
      ` : ''}
      ${payroll.extra_deduction > 0 ? `
      <tr>
        <td>Potongan / Kasbon${payroll.notes ? ` (${escapeHtml(payroll.notes)})` : ''}</td>
        <td class="cell-num neg">−${fmtRp(payroll.extra_deduction)}</td>
      </tr>
      ` : ''}
      <tr class="breakdown-row-final">
        <td>GAJI DITERIMA SETELAH POTONGAN</td>
        <td class="cell-num">${fmtRp(payroll.total)}</td>
      </tr>
      ` : `
      <tr class="breakdown-row-final">
        <td>GAJI DITERIMA</td>
        <td class="cell-num">${fmtRp(payroll.total)}</td>
      </tr>
      `}
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
        original_price, discount_type, discount_value, discount_amount,
        has_complaint, complaint_note,
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

  // Daftar ID dikirim lewat URL, jadi kalau transaksinya ribuan (misal filter
  // 3 bulan) URL-nya jadi terlalu panjang dan permintaannya gagal atau
  // menggantung. Karena itu dipecah jadi beberapa batch kecil.
  const BATCH = 120;
  const data = [];
  for (let i = 0; i < transactionIds.length; i += BATCH) {
    const batch = transactionIds.slice(i, i + BATCH);
    const { data: part, error } = await sb
      .from('audit_log')
      .select('record_id, action, created_at')
      .eq('table_name', 'transactions')
      .in('action', ['INSERT', 'UPDATE'])
      .in('record_id', batch);
    if (error) return new Set();   // gagal di tengah, lewati saja penanda edit
    if (part) data.push(...part);
  }

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
  waxing: 'Waxing',
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
// =====================================================
// ABSENSI (Attendance)
// =====================================================
const ATTENDANCE_BUCKET = 'attendance-photos';
// Jam kerja standar
const WORK_START = { hour: 9, minute: 30 };   // jam masuk 09:30 (persiapan sebelum toko buka 10:00)
const WORK_END = { hour: 19, minute: 30 };    // pulang 19:30
// ATURAN KETERLAMBATAN
// Aturan berubah mulai periode gaji 26 Agustus 2026. Absensi sebelum tanggal itu
// tetap dinilai dengan aturan lama, supaya periode gaji yang sudah tutup
// (26 Juli sampai 25 Agustus) tidak ikut berubah angkanya.
const ATTENDANCE_RULE_CHANGE_DATE = '2026-08-26';

// Aturan LAMA (berlaku sampai 25 Agustus 2026)
//   sampai 09:30       → tepat waktu
//   09:30 sampai 10:00 → toleransi, jatah 7x
//   di atas 10:00      → terlambat
//   lewat jatah maupun terlambat sama-sama dipotong 15.000 per hari
const RULE_OLD = {
  graceMinutes: 0,
  toleranceEndMinutes: 30,
  quota: 7,
  toleranceOverPenalty: 15000,
  latePenalty: 15000,
};

// Aturan BARU (mulai 26 Agustus 2026)
//   sampai 09:45       → tepat waktu
//   09:45 sampai 10:00 → toleransi, jatah 7x
//   di atas 10:00      → terlambat
//   lewat jatah dipotong 5.000 per hari, terlambat dipotong 15.000 per hari
const RULE_NEW = {
  graceMinutes: 15,
  toleranceEndMinutes: 30,
  quota: 7,
  toleranceOverPenalty: 5000,
  latePenalty: 15000,
};

// Pilih aturan sesuai tanggal absensinya
function attendanceRuleFor(dateOrTs) {
  if (!dateOrTs) return RULE_NEW;
  const d = typeof dateOrTs === 'string' && dateOrTs.length >= 10
    ? dateOrTs.slice(0, 10)
    : new Date(dateOrTs).toISOString().slice(0, 10);
  return d < ATTENDANCE_RULE_CHANGE_DATE ? RULE_OLD : RULE_NEW;
}

// Nilai bawaan (aturan yang berlaku sekarang), dipakai untuk tampilan umum
const GRACE_MINUTES = RULE_NEW.graceMinutes;
const LATE_TOLERANCE_MINUTES = RULE_NEW.toleranceEndMinutes;
// Toleransi pulang: pulang 19:15 sampai 19:30 masih dianggap wajar.
// Di bawah 19:15 dihitung pulang cepat, kecuali memang ambil lembur pagi.
//
// PENTING: jam pulang sama sekali TIDAK memengaruhi gaji. Jatah toleransi 7x
// dan potongan keterlambatan hanya dihitung dari jam MASUK (lihat
// getAttendanceSummary, yang cuma membaca getArrivalStatus). Angka pulang
// disimpan sebagai catatan operasional saja. Jangan tambahkan potongan dari
// sini tanpa keputusan baru dari owner.
const EARLY_LEAVE_TOLERANCE_MINUTES = 15;
// Jatah toleransi datang (09:30 sampai 10:00) per periode gaji.
// Toleransi ke-8 dan seterusnya dihitung sebagai terlambat.
const TOLERANCE_QUOTA_PER_PERIOD = 7;
// Potongan per hari terlambat
const LATE_PENALTY_PER_DAY = 15000;
// Potongan untuk toleransi yang melewati jatah (tarif lebih ringan)
const TOLERANCE_OVER_PENALTY = 5000;

function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Hitung menit keterlambatan dibanding jam masuk standar
function calcLateMinutes(at = new Date()) {
  const sched = new Date(at);
  sched.setHours(WORK_START.hour, WORK_START.minute, 0, 0);
  const diff = Math.floor((at - sched) / 60000);
  const late = diff - LATE_TOLERANCE_MINUTES;
  return late > 0 ? late : 0;
}

// Status kedatangan: 'tepat' (sebelum 09:45), 'toleransi' (09:45 sampai 10:00),
// atau 'telat' (di atas 10:00).
//
// Argumen kedua opsional: kalau admin sudah mengoreksi status kedatangan
// (kolom arrival_override), status hasil koreksi itu yang dipakai. Jam
// aslinya tetap dihitung dan dikembalikan di rawStatus, supaya tampilan
// bisa menunjukkan keduanya: "absen 10:05, dikoreksi jadi tepat waktu".
function getArrivalStatus(clockInAt, override = null) {
  if (!clockInAt) return null;
  const at = new Date(clockInAt);
  const rule = attendanceRuleFor(clockInAt);
  const start = new Date(at);
  start.setHours(WORK_START.hour, WORK_START.minute, 0, 0);
  const minutesAfterStart = Math.floor((at - start) / 60000);
  const lateMinutes = Math.max(0, minutesAfterStart - rule.toleranceEndMinutes);

  // Tiga tingkat, ambangnya mengikuti aturan yang berlaku pada tanggal itu
  let status = 'tepat';
  if (lateMinutes > 0) status = 'telat';
  else if (minutesAfterStart > rule.graceMinutes) status = 'toleransi';

  const rawStatus = status;
  const rawLateMinutes = lateMinutes;
  let isOverridden = false;

  if (override === 'tepat' || override === 'toleransi' || override === 'telat') {
    isOverridden = override !== rawStatus;
    status = override;
  }

  return {
    status,
    // Menit telat ikut nol kalau dikoreksi jadi tepat/toleransi, karena angka
    // ini yang dipakai untuk rekap dan potongan gaji.
    lateMinutes: status === 'telat' ? (rawLateMinutes > 0 ? rawLateMinutes : 0) : 0,
    minutesAfterStart,
    rule,
    rawStatus,
    rawLateMinutes,
    isOverridden,
  };
}

// Versi praktis: terima satu baris absensi, langsung terapkan koreksinya.
function getArrivalStatusOf(row) {
  if (!row) return null;
  return getArrivalStatus(row.clock_in_at, row.arrival_override || null);
}

// Batas awal toleransi dalam format jam (misal "09:45")
function toleranceStartLabel() {
  const d = new Date();
  d.setHours(WORK_START.hour, WORK_START.minute + GRACE_MINUTES, 0, 0);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// Batas akhir toleransi dalam format jam (untuk ditampilkan, misal "10:00")
function toleranceEndLabel() {
  const d = new Date();
  d.setHours(WORK_START.hour, WORK_START.minute + LATE_TOLERANCE_MINUTES, 0, 0);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// Hitung menit pulang lebih awal dibanding jam pulang standar
function calcEarlyLeaveMinutes(at = new Date()) {
  const sched = new Date(at);
  sched.setHours(WORK_END.hour, WORK_END.minute, 0, 0);
  const diff = Math.floor((sched - at) / 60000);
  const cepat = diff - EARLY_LEAVE_TOLERANCE_MINUTES;
  return cepat > 0 ? cepat : 0;
}

// Status kepulangan: 'lewat' (>= 19:30), 'toleransi' (19:15 sampai 19:30),
// atau 'cepat' (sebelum 19:15). Murni untuk tampilan, tidak dipakai
// dalam perhitungan gaji mana pun.
function getDepartureStatus(clockOutAt) {
  if (!clockOutAt) return null;
  const at = new Date(clockOutAt);
  const sched = new Date(at);
  sched.setHours(WORK_END.hour, WORK_END.minute, 0, 0);
  const minutesBefore = Math.floor((sched - at) / 60000);
  const earlyMinutes = Math.max(0, minutesBefore - EARLY_LEAVE_TOLERANCE_MINUTES);
  let status = 'lewat';
  if (earlyMinutes > 0) status = 'cepat';
  else if (minutesBefore > 0) status = 'toleransi';
  return { status, minutesBefore, earlyMinutes };
}

// Batas awal toleransi pulang, misal "19:15"
function departureToleranceLabel() {
  const d = new Date();
  d.setHours(WORK_END.hour, WORK_END.minute - EARLY_LEAVE_TOLERANCE_MINUTES, 0, 0);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// Ambil lokasi perangkat. TIDAK PERNAH menggagalkan absensi:
// kalau izin ditolak, sinyal lemah, atau kelamaan, hasilnya null.
function getDeviceLocation(timeoutMs = 8000) {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    let settled = false;
    const finish = val => { if (!settled) { settled = true; resolve(val); } };
    const timer = setTimeout(() => finish(null), timeoutMs + 500);
    navigator.geolocation.getCurrentPosition(
      pos => {
        clearTimeout(timer);
        finish({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy != null ? Math.round(pos.coords.accuracy) : null,
        });
      },
      () => { clearTimeout(timer); finish(null); },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30000 }
    );
  });
}

// Jarak antara dua titik koordinat dalam meter (rumus haversine)
function distanceMeters(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const R = 6371000;  // radius bumi (meter)
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// Ambil titik & radius cabang (untuk cek jarak absensi)
async function getBranchGeo(branchId) {
  if (!branchId) return null;
  const { data, error } = await sb
    .from('branches')
    .select('id, name, lat, lng, geofence_radius_m')
    .eq('id', branchId)
    .maybeSingle();
  if (error || !data || data.lat == null) return null;
  return data;
}

// Link Google Maps dari koordinat (untuk laporan)
function mapsLinkFor(lat, lng) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

// Upload selfie absensi (blob dari kamera), kembalikan storage path
async function uploadAttendancePhoto(blob, branchId, employeeId, kind) {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const storagePath = `${branchId}/${yyyymm}/${employeeId}_${kind}_${Date.now()}.jpg`;
  const { error } = await sb.storage
    .from(ATTENDANCE_BUCKET)
    .upload(storagePath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });
  if (error) throw error;
  return storagePath;
}

// Ambil absensi hari ini untuk satu cabang
async function getTodayAttendance(branchId = null) {
  let query = sb
    .from('attendance')
    .select('*, employee:employees(id, full_name, job_title)')
    .eq('date', todayDateStr());
  // branchId kosong berarti semua cabang (untuk super admin)
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Ambil absensi satu rentang tanggal (untuk laporan & gaji)
async function listAttendance(branchId, from, to) {
  let query = sb
    .from('attendance')
    .select('*, employee:employees(id, full_name, job_title)')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false });
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Jarak absensi dari titik cabang (null kalau lokasi/koordinat cabang tidak ada)
async function distanceFromBranch(branchId, loc) {
  if (!loc) return null;
  try {
    const geo = await getBranchGeo(branchId);
    if (!geo) return null;
    return distanceMeters(loc.lat, loc.lng, Number(geo.lat), Number(geo.lng));
  } catch (e) {
    return null;
  }
}

// Ambil lokasi dan pastikan berada di area salon.
// HANYA dipakai untuk absen MASUK. Absen pulang tidak memakai fungsi ini,
// karena beautician sering menutup hari kerjanya di lokasi home service.
// Melempar error dengan pesan jelas kalau izin ditolak, sinyal tidak dapat,
// atau posisinya jauh dari cabang. Dipakai sebelum foto diupload supaya
// tidak ada foto nyangkut kalau absennya ditolak.
async function requireLocationAtBranch(branchId) {
  const loc = await getDeviceLocation();
  if (!loc) {
    throw new Error(
      'Lokasi tidak terbaca. Aktifkan izin lokasi untuk aplikasi ini di pengaturan HP, ' +
      'pastikan GPS menyala, lalu coba lagi. Absen wajib dilakukan di salon.'
    );
  }

  const geo = await getBranchGeo(branchId);
  // Cabang belum punya titik lokasi: lokasi tetap dicatat, tapi tidak bisa diperiksa
  if (!geo) return { loc, distance: null };

  const distance = distanceMeters(loc.lat, loc.lng, Number(geo.lat), Number(geo.lng));
  // Dipersempit dari 200 ke 150 meter mulai 28 Agustus 2026, karena radius lama
  // masih meloloskan absen dari jalan di depan salon. Nilai per cabang tetap
  // bisa diatur lewat kolom geofence_radius_m di tabel branches.
  const radius = Number(geo.geofence_radius_m) || 150;

  if (distance != null && distance > radius) {
    const jarak = distance >= 1000
      ? `${(distance / 1000).toFixed(1)} km`
      : `${Math.round(distance)} meter`;
    throw new Error(
      `Absen masuk ditolak. Kamu terdeteksi ${jarak} dari ${geo.name || 'salon'}, ` +
      `sedangkan batasnya ${radius} meter. Absen masuk hanya bisa dilakukan di area salon. ` +
      `Kalau kamu memang sudah di salon, tunggu sinyal GPS membaik lalu coba lagi.`
    );
  }
  return { loc, distance };
}

// Catat jam masuk (buat baris baru)
async function clockIn({ employeeId, branchId, photoBlob, faceVerified = null }) {
  const now = new Date();
  const date = todayDateStr();

  // Cegah dobel absen masuk
  const { data: existing } = await sb
    .from('attendance')
    .select('id, clock_in_at')
    .eq('employee_id', employeeId)
    .eq('date', date)
    .maybeSingle();
  if (existing?.clock_in_at) {
    throw new Error('Sudah absen masuk hari ini');
  }

  // Lokasi diperiksa lebih dulu. Kalau ditolak, foto tidak jadi diupload.
  // Batas jarak hanya berlaku untuk absen masuk.
  const { loc, distance } = await requireLocationAtBranch(branchId);

  const photoPath = photoBlob ? await uploadAttendancePhoto(photoBlob, branchId, employeeId, 'in') : null;
  const createdBy = (await sb.auth.getUser()).data?.user?.id || null;

  const payload = {
    branch_id: branchId,
    employee_id: employeeId,
    date,
    clock_in_at: now.toISOString(),
    clock_in_photo: photoPath,
    late_minutes: calcLateMinutes(now),
    created_by: createdBy,
    clock_in_lat: loc.lat,
    clock_in_lng: loc.lng,
    clock_in_accuracy: loc.accuracy ?? null,
    clock_in_distance_m: distance,
    face_verified: faceVerified,
  };

  if (existing?.id) {
    const { data, error } = await sb.from('attendance').update(payload).eq('id', existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await sb.from('attendance').insert(payload).select().single();
  if (error) throw error;
  return data;
}

// Catat jam pulang (update baris hari ini)
async function clockOut({ employeeId, branchId, photoBlob, faceVerified = null }) {
  const now = new Date();
  const date = todayDateStr();

  const { data: existing, error: findErr } = await sb
    .from('attendance')
    .select('id, clock_in_at, clock_out_at')
    .eq('employee_id', employeeId)
    .eq('date', date)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!existing || !existing.clock_in_at) throw new Error('Belum absen masuk hari ini');
  if (existing.clock_out_at) throw new Error('Sudah absen pulang hari ini');

  // Absen PULANG tidak diwajibkan berada di area salon. Beautician sering
  // menutup hari kerjanya di lokasi home service, jadi kalau jaraknya
  // dipaksakan mereka tidak bisa absen pulang sama sekali.
  // Lokasi tetap dicatat untuk keperluan pemeriksaan, tapi tidak pernah
  // menolak absen. Kalau GPS mati atau izin ditolak pun, absen tetap masuk.
  const loc = await getDeviceLocation();
  const distance = await distanceFromBranch(branchId, loc);

  const photoPath = photoBlob ? await uploadAttendancePhoto(photoBlob, branchId, employeeId, 'out') : null;

  const { data, error } = await sb
    .from('attendance')
    .update({
      clock_out_at: now.toISOString(),
      clock_out_photo: photoPath,
      early_leave_minutes: calcEarlyLeaveMinutes(now),
      clock_out_lat: loc ? loc.lat : null,
      clock_out_lng: loc ? loc.lng : null,
      clock_out_accuracy: loc && loc.accuracy != null ? loc.accuracy : null,
      clock_out_distance_m: distance,
      face_verified: faceVerified,
    })
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Link foto absensi (signed URL, berlaku 1 jam)
async function getAttendancePhotoUrl(storagePath, expiresIn = 3600) {
  if (!storagePath) return null;
  const { data, error } = await sb.storage
    .from(ATTENDANCE_BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

// Hapus foto selfie absensi periode lama supaya penyimpanan tidak penuh.
// Catatan absensinya TIDAK dihapus (masih dibutuhkan untuk riwayat gaji),
// hanya file fotonya yang dibuang dan penunjuknya dikosongkan.
async function cleanupOldAttendancePhotos(branchId = null) {
  // Batas: semua yang tanggalnya sebelum periode gaji yang sedang berjalan
  const periode = getPayrollPeriod();
  const batas = periode.period_start;

  let query = sb
    .from('attendance')
    .select('id, clock_in_photo, clock_out_photo')
    .lt('date', batas)
    .or('clock_in_photo.not.is.null,clock_out_photo.not.is.null');
  if (branchId) query = query.eq('branch_id', branchId);

  const { data, error } = await query;
  if (error) throw error;
  const rows = data || [];
  if (!rows.length) return { deletedPhotos: 0, affectedRows: 0, batas };

  const paths = [];
  for (const r of rows) {
    if (r.clock_in_photo) paths.push(r.clock_in_photo);
    if (r.clock_out_photo) paths.push(r.clock_out_photo);
  }

  // Hapus file per 100 supaya tidak kelebihan beban
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    try { await sb.storage.from(ATTENDANCE_BUCKET).remove(batch); } catch (e) {}
  }

  // Kosongkan penunjuk fotonya
  const ids = rows.map(r => r.id);
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    await sb.from('attendance')
      .update({ clock_in_photo: null, clock_out_photo: null })
      .in('id', batch);
  }

  return { deletedPhotos: paths.length, affectedRows: rows.length, batas };
}

// Berapa foto lama yang masih tersimpan (untuk ditampilkan sebelum dibersihkan)
async function countOldAttendancePhotos(branchId = null) {
  const periode = getPayrollPeriod();
  let query = sb
    .from('attendance')
    .select('id, clock_in_photo, clock_out_photo')
    .lt('date', periode.period_start)
    .or('clock_in_photo.not.is.null,clock_out_photo.not.is.null');
  if (branchId) query = query.eq('branch_id', branchId);
  const { data, error } = await query;
  if (error) return { photos: 0, rows: 0, batas: periode.period_start };
  let photos = 0;
  for (const r of (data || [])) {
    if (r.clock_in_photo) photos++;
    if (r.clock_out_photo) photos++;
  }
  return { photos, rows: (data || []).length, batas: periode.period_start };
}

// Simpan koreksi absensi. Jam aslinya TIDAK diubah, yang disimpan cuma
// keputusan admin beserta alasannya.
//   arrivalOverride : 'tepat' | 'toleransi' | 'telat' | null (batalkan koreksi)
//   reason          : wajib diisi kalau arrivalOverride tidak null
//   locationExcused : true kalau jarak absen yang jauh sudah dimaklumi
//   adminNote       : keterangan bebas, ikut terlihat karyawan
async function saveAttendanceCorrection({ id, arrivalOverride = null, reason = '',
                                          locationExcused = false, adminNote = '' }) {
  if (!id) throw new Error('Baris absensi tidak dikenali');

  const bersih = (reason || '').trim();
  if (arrivalOverride && !bersih) {
    throw new Error('Alasan koreksi wajib diisi');
  }
  if (arrivalOverride && !['tepat', 'toleransi', 'telat'].includes(arrivalOverride)) {
    throw new Error('Status koreksi tidak dikenali');
  }

  const userId = (await sb.auth.getUser()).data?.user?.id || null;

  const payload = {
    arrival_override: arrivalOverride || null,
    override_reason: arrivalOverride ? bersih : null,
    override_by: arrivalOverride ? userId : null,
    override_at: arrivalOverride ? new Date().toISOString() : null,
    location_excused: !!locationExcused,
    admin_note: (adminNote || '').trim() || null,
  };

  const { data, error } = await sb
    .from('attendance')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Catat absensi secara manual. Dipakai kalau karyawan benar-benar tidak bisa
// absen sendiri, misalnya GPS tidak terbaca atau HP-nya bermasalah.
// Alasan wajib diisi, dan barisnya ditandai is_manual supaya jelas asalnya.
async function createManualAttendance({ employeeId, branchId, date, clockInTime,
                                        clockOutTime = null, reason = '' }) {
  const bersih = (reason || '').trim();
  if (!employeeId) throw new Error('Pilih karyawan dulu');
  if (!branchId) throw new Error('Cabang tidak dikenali');
  if (!date) throw new Error('Tanggal wajib diisi');
  if (!clockInTime) throw new Error('Jam masuk wajib diisi');
  if (!bersih) throw new Error('Alasan pencatatan manual wajib diisi');

  const { data: existing } = await sb
    .from('attendance')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('date', date)
    .maybeSingle();
  if (existing?.id) {
    throw new Error('Karyawan ini sudah punya catatan absensi di tanggal tersebut');
  }

  const masuk = new Date(`${date}T${clockInTime}:00`);
  const pulang = clockOutTime ? new Date(`${date}T${clockOutTime}:00`) : null;
  if (pulang && pulang <= masuk) {
    throw new Error('Jam pulang harus lebih malam dari jam masuk');
  }

  const userId = (await sb.auth.getUser()).data?.user?.id || null;

  const { data, error } = await sb
    .from('attendance')
    .insert({
      branch_id: branchId,
      employee_id: employeeId,
      date,
      clock_in_at: masuk.toISOString(),
      clock_out_at: pulang ? pulang.toISOString() : null,
      late_minutes: calcLateMinutes(masuk),
      early_leave_minutes: pulang ? calcEarlyLeaveMinutes(pulang) : 0,
      is_manual: true,
      admin_note: bersih,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Ringkasan absensi per karyawan dalam satu periode (untuk gaji).
// Hanya jam MASUK yang dinilai. Jam pulang tidak pernah ikut dihitung,
// baik toleransi maupun pulang cepat.
async function getAttendanceSummary(branchId, periodStart, periodEnd) {
  const rows = await listAttendance(branchId, periodStart, periodEnd);
  const byEmployee = {};

  for (const r of rows) {
    const id = r.employee_id;
    if (!byEmployee[id]) {
      byEmployee[id] = {
        employee_id: id,
        employee_name: r.employee?.full_name || '',
        days_present: 0,
        total_late_minutes: 0,
        days_over_ten: 0,        // datang di atas 10:00
        days_no_clockout: 0,
        days_corrected: 0,       // berapa hari statusnya dikoreksi admin
        _toleransi: [],          // tanggal-tanggal yang masuk toleransi
      };
    }
    const s = byEmployee[id];
    if (r.clock_in_at) s.days_present += 1;
    if (r.clock_in_at && !r.clock_out_at) s.days_no_clockout += 1;

    // Pakai status hasil koreksi admin kalau ada. Kalau tidak ada,
    // hasilnya sama persis dengan sebelumnya.
    const st = getArrivalStatusOf(r);
    if (st?.status === 'telat') {
      s.days_over_ten += 1;
      s.total_late_minutes += st.lateMinutes;
    } else if (st?.status === 'toleransi') {
      s._toleransi.push(r.date);
    }
    if (st?.isOverridden) s.days_corrected = (s.days_corrected || 0) + 1;
  }

  // Hitung jatah toleransi. Yang dipakai lebih dulu (tanggal awal) yang gratis.
  return Object.values(byEmployee).map(s => {
    const toleransi = s._toleransi.slice().sort();
    // Tarif mengikuti aturan yang berlaku di periode ini
    const rule = attendanceRuleFor(periodStart);
    const dipakai = Math.min(toleransi.length, rule.quota);
    const lewatJatah = Math.max(0, toleransi.length - rule.quota);
    const hariTelat = s.days_over_ten;   // hanya yang datang di atas 10:00

    const potonganToleransi = lewatJatah * rule.toleranceOverPenalty;
    const potonganTelat = hariTelat * rule.latePenalty;

    delete s._toleransi;
    return {
      ...s,
      days_late: hariTelat,
      days_tolerance: toleransi.length,
      tolerance_quota: rule.quota,
      tolerance_used: dipakai,
      tolerance_left: Math.max(0, rule.quota - toleransi.length),
      tolerance_over: lewatJatah,
      tolerance_over_dates: toleransi.slice(rule.quota),
      effective_late_days: hariTelat,
      late_penalty_per_day: rule.latePenalty,
      tolerance_over_penalty_per_day: rule.toleranceOverPenalty,
      rule_is_new: rule === RULE_NEW,
      tolerance_start_label: `${String(WORK_START.hour).padStart(2,'0')}:${String(WORK_START.minute + rule.graceMinutes).padStart(2,'0')}`,
      tolerance_over_deduction: potonganToleransi,
      late_only_deduction: potonganTelat,
      late_deduction_suggested: potonganToleransi + potonganTelat,
    };
  });
}

// =====================================================
// HOME SERVICE — pelacakan 4 tahap (mirip aplikasi ojol)
// =====================================================
const HS_STATUS = {
  pending:   { label: 'Menunggu diterima', next: 'accepted', nextLabel: 'Terima & Berangkat', color: '#7a667e' },
  accepted:  { label: 'Dalam perjalanan',  next: 'working',  nextLabel: 'Sampai & Mulai Kerjakan', color: '#b8893d' },
  working:   { label: 'Sedang dikerjakan', next: 'done',     nextLabel: 'Selesai Treatment', color: '#4a7c59' },
  done:      { label: 'Selesai treatment', next: 'returned', nextLabel: 'Sudah Sampai Kembali', color: '#a8884a' },
  returned:  { label: 'Selesai & sudah sampai', next: null,  nextLabel: null, color: '#6b5b6e' },
  cancelled: { label: 'Dibatalkan',        next: null,       nextLabel: null, color: '#a85555' },
};

function hsStatusInfo(status) {
  return HS_STATUS[status] || HS_STATUS.pending;
}

// Orderan yang masih berjalan (belum selesai atau dibatalkan)
const HS_ACTIVE_STATUSES = ['pending', 'accepted', 'working', 'done'];

async function listHomeServiceJobs({ branchId = null, employeeId = null, activeOnly = false, from = null, to = null } = {}) {
  let query = sb
    .from('home_service_jobs')
    .select('*, employee:employees(id, full_name, job_title), members:home_service_job_members(*, employee:employees(id, full_name, job_title))')
    .order('created_at', { ascending: false });
  if (branchId) query = query.eq('branch_id', branchId);
  if (employeeId) query = query.eq('employee_id', employeeId);
  if (activeOnly) query = query.in('status', HS_ACTIVE_STATUSES);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function createHomeServiceJob(payload, employeeIds = []) {
  const createdBy = (await sb.auth.getUser()).data?.user?.id || null;
  const ids = (employeeIds && employeeIds.length) ? employeeIds : [payload.employee_id].filter(Boolean);
  if (!ids.length) throw new Error('Pilih minimal satu beautician');

  const { data, error } = await sb
    .from('home_service_jobs')
    .insert({ ...payload, employee_id: ids[0], status: 'pending', created_by: createdBy })
    .select()
    .single();
  if (error) throw error;

  // Tiap beautician jadi anggota dengan tahapnya sendiri
  const rows = ids.map(eid => ({ job_id: data.id, employee_id: eid, status: 'pending' }));
  const { error: mErr } = await sb.from('home_service_job_members').insert(rows);
  if (mErr) throw mErr;
  return data;
}

// Tambah beautician ke orderan yang sudah berjalan
async function addHomeServiceMember(jobId, employeeId) {
  const { data, error } = await sb
    .from('home_service_job_members')
    .insert({ job_id: jobId, employee_id: employeeId, status: 'pending' })
    .select('*, employee:employees(id, full_name, job_title)')
    .single();
  if (error) throw error;
  await refreshJobStatus(jobId);
  return data;
}

async function removeHomeServiceMember(memberId, jobId) {
  const { error } = await sb.from('home_service_job_members').delete().eq('id', memberId);
  if (error) throw error;
  if (jobId) await refreshJobStatus(jobId);
}

// Urutan kemajuan tahap, untuk menentukan status keseluruhan orderan
const HS_ORDER = { pending: 0, accepted: 1, working: 2, done: 3, returned: 4 };

// Status orderan mengikuti anggota yang PALING TERTINGGAL.
// Jadi orderan belum dianggap selesai sebelum semua orang menandai sudah sampai.
function computeJobStatus(members) {
  const aktif = (members || []).filter(m => m.status !== 'cancelled');
  if (!aktif.length) return 'pending';
  let min = 99, minKey = 'pending';
  for (const m of aktif) {
    const v = HS_ORDER[m.status] ?? 0;
    if (v < min) { min = v; minKey = m.status; }
  }
  return minKey;
}

async function refreshJobStatus(jobId) {
  const { data } = await sb.from('home_service_job_members').select('status').eq('job_id', jobId);
  const next = computeJobStatus(data || []);
  await sb.from('home_service_jobs').update({ status: next }).eq('id', jobId);
  return next;
}

// Maju satu tahap untuk SATU anggota. Tiap orang menggeser tahapnya sendiri.
async function advanceHomeServiceMember(member, extra = {}) {
  const info = hsStatusInfo(member.status);
  if (!info.next) throw new Error('Tahap ini sudah selesai');

  const loc = await getDeviceLocation();
  const now = new Date().toISOString();
  const next = info.next;

  const fieldByStatus = {
    accepted: ['accepted_at', 'accepted_lat', 'accepted_lng'],
    working:  ['started_at', 'started_lat', 'started_lng'],
    done:     ['finished_at', 'finished_lat', 'finished_lng'],
    returned: ['returned_at', 'returned_lat', 'returned_lng'],
  };
  const [atField, latField, lngField] = fieldByStatus[next];

  const { data, error } = await sb
    .from('home_service_job_members')
    .update({
      status: next,
      [atField]: now,
      [latField]: loc?.lat ?? null,
      [lngField]: loc?.lng ?? null,
      ...extra,
    })
    .eq('id', member.id)
    .select('*, employee:employees(id, full_name, job_title)')
    .single();
  if (error) throw error;

  await refreshJobStatus(member.job_id);
  return data;
}

// Maju satu tahap. Lokasi direkam tiap tahap (tidak wajib berhasil).
async function advanceHomeServiceJob(jobId, currentStatus, extra = {}) {
  const info = hsStatusInfo(currentStatus);
  if (!info.next) throw new Error('Tahap ini sudah selesai');

  const loc = await getDeviceLocation();
  const now = new Date().toISOString();
  const next = info.next;

  const fieldByStatus = {
    accepted: ['accepted_at', 'accepted_lat', 'accepted_lng'],
    working:  ['started_at', 'started_lat', 'started_lng'],
    done:     ['finished_at', 'finished_lat', 'finished_lng'],
    returned: ['returned_at', 'returned_lat', 'returned_lng'],
  };
  const [atField, latField, lngField] = fieldByStatus[next];

  const patch = {
    status: next,
    [atField]: now,
    [latField]: loc?.lat ?? null,
    [lngField]: loc?.lng ?? null,
    ...extra,
  };

  const { data, error } = await sb
    .from('home_service_jobs')
    .update(patch)
    .eq('id', jobId)
    .select('*, employee:employees(id, full_name, job_title)')
    .single();
  if (error) throw error;
  return data;
}

async function cancelHomeServiceJob(jobId, reason) {
  const { data, error } = await sb
    .from('home_service_jobs')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: reason || null })
    .eq('id', jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Hapus permanen satu orderan home service (untuk membersihkan data latihan).
// Hanya berhasil untuk admin, dibatasi oleh aturan keamanan database.
async function deleteHomeServiceJob(jobId) {
  const { error } = await sb.from('home_service_jobs').delete().eq('id', jobId);
  if (error) throw error;
}

async function linkHomeServiceTransaction(jobId, transactionId) {
  const { error } = await sb
    .from('home_service_jobs')
    .update({ transaction_id: transactionId })
    .eq('id', jobId);
  if (error) throw error;
}

// Berapa lama sejak sebuah tahap dimulai (menit). Untuk memantau yang belum pulang.
function minutesSince(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
}

// Format durasi ringkas: 45m, 2j 10m
function fmtDurasi(menit) {
  if (menit == null) return '';
  if (menit < 60) return `${menit}m`;
  const j = Math.floor(menit / 60), m = menit % 60;
  return m > 0 ? `${j}j ${m}m` : `${j}j`;
}

Object.assign(window, {
  sb, SERVICES, JOB_TITLES, SALARY_OPTIONAL_TITLES, ROLES,
  CATEGORY_LABELS, getDashboardRange, getDashboardData,
  fmtRp, fmtRpOrDash, fmtNumber, fmtDate, fmtTime, todayStr, nowTimeStr, currentMonth,
  dateToYMD, startOfWeekMonday, endOfWeekSunday, DATE_PRESETS,
  isOvertime, isSalaryOptional, isSalaryOptionalFor, getServiceDef, calcCommission, getRoleLabel,
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
  computeHSCommissionFromItems,
  getBrandForBranch, escapeHtml,
  LOGO_JBB, LOGO_VIALI, LOGO_JBB_PNG, LOGO_VIALI_PNG, logoSVG, logoSVGWidth, loadLogoImage,
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
  clockIn, clockOut, getTodayAttendance, listAttendance, getAttendancePhotoUrl,
  getAttendanceSummary, calcLateMinutes, calcEarlyLeaveMinutes, todayDateStr,
  isAttendanceExempt, attendanceExemptReason, NO_ATTENDANCE_TITLES, isAttendanceExemptByTitle,
  getArrivalStatus, toleranceEndLabel, toleranceStartLabel, LATE_TOLERANCE_MINUTES,
  GRACE_MINUTES, TOLERANCE_OVER_PENALTY, attendanceRuleFor, ATTENDANCE_RULE_CHANGE_DATE,
  getDepartureStatus, departureToleranceLabel, EARLY_LEAVE_TOLERANCE_MINUTES,
  TOLERANCE_QUOTA_PER_PERIOD, LATE_PENALTY_PER_DAY,
  cleanupOldAttendancePhotos, countOldAttendancePhotos,
  getDeviceLocation, mapsLinkFor, distanceMeters, getBranchGeo, distanceFromBranch,
  getArrivalStatusOf, saveAttendanceCorrection, createManualAttendance,
  requireLocationAtBranch,
  listHomeServiceJobs, createHomeServiceJob, advanceHomeServiceJob, cancelHomeServiceJob,
  linkHomeServiceTransaction, deleteHomeServiceJob, hsStatusInfo,
  addHomeServiceMember, removeHomeServiceMember, advanceHomeServiceMember,
  computeJobStatus, refreshJobStatus, HS_ORDER, HS_STATUS, HS_ACTIVE_STATUSES, minutesSince, fmtDurasi,
  WORK_START, WORK_END,
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
