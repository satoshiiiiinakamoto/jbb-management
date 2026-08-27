/* =====================================================================
   JBB MANAGEMENT - BUNDEL SIAP JALAN
   ---------------------------------------------------------------------
   File ini DIBUAT OTOMATIS. JANGAN DIEDIT LANGSUNG.

   Isinya gabungan dari lib.jsx, components.jsx, pages.jsx, dan app.jsx
   yang sudah diterjemahkan dari JSX ke JavaScript biasa, supaya HP
   tidak perlu menerjemahkan sendiri setiap kali aplikasi dibuka.

   Kalau ada perubahan kode: yang diedit tetap file .jsx, lalu bundel
   ini dibuat ulang. Upload keduanya, jangan salah satu saja.

   Dibuat: 2026-08-27
   ===================================================================== */

/* ============ lib.jsx ============ */
// ===== Supabase client + shared helpers =====

const SUPABASE_URL = window.__ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.__ENV.SUPABASE_ANON_KEY;
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
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
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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
const SERVICES = [{
  name: 'Korean Natural (Eyelash)',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Skinny Volume (Eyelash)',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Russian Volume (Eyelash)',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Anime Volume (Eyelash)',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Lash Lift',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Retouch Korean',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Retouch Skinny/Double',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Retouch Russian',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Removal Eyelash',
  category: 'lash',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Brow Lamination',
  category: 'brow',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Brow Bomber',
  category: 'brow',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Sulam Alis',
  category: 'brow',
  commission_type: 'fixed_amount',
  baseRate: 0
}, {
  name: 'Sulam Alis by Master',
  category: 'brow',
  commission_type: 'fixed_amount',
  baseRate: 0
}, {
  name: 'Sulam Alis by Owner',
  category: 'brow',
  commission_type: 'fixed_amount',
  baseRate: 0
}, {
  name: 'Sulam Alis by Junior',
  category: 'brow',
  commission_type: 'fixed_amount',
  baseRate: 0
}, {
  name: 'Sulam Alis by Senior',
  category: 'brow',
  commission_type: 'fixed_amount',
  baseRate: 0
}, {
  name: 'Retouch Sulam Alis',
  category: 'brow',
  commission_type: 'fixed_amount',
  baseRate: 0
}, {
  name: 'Cukur Alis',
  category: 'brow',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Korean Vit C Glow',
  category: 'facial',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Korean BB Glow',
  category: 'facial',
  commission_type: 'percent',
  baseRate: 5
}, {
  name: 'Nail Art',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}, {
  name: 'Nail Polish (Polos)',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}, {
  name: 'Nail Extension',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}, {
  name: 'Manicure',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}, {
  name: 'Pedicure',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}, {
  name: 'Menipedi',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}, {
  name: 'Removal Nails',
  category: 'nail',
  commission_type: 'percent',
  baseRate: 10
}];
const JOB_TITLES = ['Owner', 'Manager', 'Senior Therapist', 'Lash Technician', 'Nail Artist', 'Beauty Therapist', 'Kasir'];

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
const ROLES = [{
  value: 'super_admin',
  label: 'Super Admin (Owner JBB Group)'
}, {
  value: 'branch_admin',
  label: 'Branch Admin (Manager Cabang)'
}, {
  value: 'employee',
  label: 'Karyawan'
}];

// =====================================================
// Payment Methods — Tahap F
// =====================================================
const PAYMENT_METHODS = [{
  value: 'cash',
  label: 'Cash',
  icon: '💵',
  category: 'cash'
}, {
  value: 'qris',
  label: 'QRIS',
  icon: '📱',
  category: 'digital'
}, {
  value: 'bca',
  label: 'Transfer BCA',
  icon: '🏦',
  category: 'bank'
}, {
  value: 'mandiri',
  label: 'Transfer Mandiri',
  icon: '🏦',
  category: 'bank'
}, {
  value: 'bni',
  label: 'Transfer BNI',
  icon: '🏦',
  category: 'bank'
}, {
  value: 'btn',
  label: 'Transfer BTN',
  icon: '🏦',
  category: 'bank'
}];
function getPaymentMethodLabel(value) {
  const m = PAYMENT_METHODS.find(p => p.value === value);
  return m ? m.label : value || 'Cash';
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
function calcCommission({
  serviceName,
  price,
  fixedAmount,
  isOT,
  branchId
}) {
  const svc = getServiceDef(serviceName);
  if (!svc) return {
    rate: 0,
    amount: 0,
    type: 'percent'
  };
  if (svc.commission_type === 'percent') {
    const rate = svc.baseRate + (isOT ? 5 : 0);
    const amount = Math.round((Number(price) || 0) * rate / 100);
    return {
      rate,
      amount,
      type: 'percent'
    };
  }
  let amount = Number(fixedAmount) || 0;
  if (isOT && branchId !== 'bdg') {
    amount += 5000;
  }
  return {
    rate: 0,
    amount,
    type: 'fixed_amount'
  };
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
  const t = {
    id: Math.random().toString(36),
    message,
    type
  };
  toastListeners.forEach(fn => fn(t));
}
function useToasts() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    const listener = t => {
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
  const {
    data,
    error
  } = await sb.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}
async function logout() {
  await sb.auth.signOut();
}
async function getCurrentSession() {
  const {
    data
  } = await sb.auth.getSession();
  return data.session;
}
async function getMyProfile() {
  const {
    data: {
      user
    }
  } = await sb.auth.getUser();
  if (!user) return null;
  const {
    data: profile,
    error
  } = await sb.from('employees').select('*, branch:branches(id, name, city, status)').eq('id', user.id).single();
  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
  return {
    ...profile,
    email: user.email
  };
}

// =====================================================
// Branches
// =====================================================
async function listBranches() {
  const {
    data,
    error
  } = await sb.from('branches').select('*').order('name', {
    ascending: true
  });
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
  let query = sb.from('employees').select('*, branch:branches(id, name, city)').order('full_name', {
    ascending: true
  });
  if (branchId) query = query.eq('branch_id', branchId);
  if (activeOnly) query = query.eq('is_active', true);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}
async function updateEmployee(id, patch) {
  const {
    data,
    error
  } = await sb.from('employees').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
async function deactivateEmployee(id) {
  return updateEmployee(id, {
    is_active: false
  });
}
async function reactivateEmployee(id) {
  return updateEmployee(id, {
    is_active: true
  });
}

// =====================================================
// CREATE EMPLOYEE (via Edge Function)
// =====================================================
async function createEmployee(payload) {
  const {
    data: {
      session
    }
  } = await sb.auth.getSession();
  if (!session) throw new Error('Sesi login tidak ditemukan');
  const url = `${SUPABASE_URL}/functions/v1/create-employee`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify(payload)
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
  const {
    data: {
      session
    }
  } = await sb.auth.getSession();
  if (!session) throw new Error('Sesi login tidak ditemukan');
  const url = `${SUPABASE_URL}/functions/v1/delete-employee`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      employee_id: employeeId
    })
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
  const {
    data,
    error
  } = await sb.from('clients').select('*').eq('branch_id', branchId).eq('phone', phone.trim()).maybeSingle();
  if (error) {
    console.error('Find client error:', error);
    return null;
  }
  return data;
}
async function upsertClient(branchId, fullName, phone) {
  const {
    data,
    error
  } = await sb.rpc('upsert_client', {
    p_branch_id: branchId,
    p_full_name: fullName,
    p_phone: phone || null
  });
  if (error) throw error;
  return data;
}

// =====================================================
// Transactions
// =====================================================
async function createTransaction({
  branchId,
  clientName,
  clientPhone,
  date,
  startTime,
  isHomeService,
  homeServiceFee,
  notes,
  items,
  createdBy,
  paymentMethod = 'cash',
  payments = null,
  // [{ method, amount, is_dp, paid_at }] - if null, single payment with paymentMethod
  tips = null // [{ employee_id, amount, payment_method }] - tips per beautician (transfer/qris only)
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
  const {
    data: trx,
    error: trxErr
  } = await sb.from('transactions').insert({
    branch_id: branchId,
    client_id: clientId,
    client_name_snapshot: clientName?.trim() || null,
    client_phone_snapshot: clientPhone?.trim() || null,
    date,
    start_time: startTime,
    is_overtime: isOT,
    is_home_service: !!isHomeService,
    home_service_fee: Number(homeServiceFee) || 0,
    total_amount: totalAmount,
    total_commission: totalCommission + (isHomeService ? Number(homeServiceFee) || 0 : 0),
    notes: notes || null,
    created_by: createdBy,
    payment_method: paymentMethod
  }).select().single();
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
      original_price: it.original_price != null ? Number(it.original_price) : Number(it.price) || 0,
      discount_type: it.discount_type || null,
      discount_value: it.discount_value != null ? Number(it.discount_value) : null,
      discount_amount: it.discount_amount != null ? Number(it.discount_amount) : 0
    };
  });
  const {
    error: itemErr
  } = await sb.from('transaction_items').insert(itemRows);
  if (itemErr) {
    await sb.from('transactions').delete().eq('id', trx.id);
    throw itemErr;
  }

  // Insert payments
  const grandTotal = totalAmount + (isHomeService ? Number(homeServiceFee) || 0 : 0);
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
        paid_at: date
      }], createdBy);
    }
  } catch (payErr) {
    console.warn('Payment insert failed (transaction still saved):', payErr);
  }

  // Insert tips (per beautician) — separate from omset, but recorded for payroll & cash flow
  try {
    if (tips && tips.length > 0) {
      const tipRows = tips.filter(t => t.employee_id && Number(t.amount) > 0).map(t => ({
        transaction_id: trx.id,
        branch_id: branchId,
        employee_id: t.employee_id,
        amount: Number(t.amount) || 0,
        payment_method: t.payment_method || 'qris',
        created_by: createdBy || null
      }));
      if (tipRows.length > 0) {
        const {
          error: tipErr
        } = await sb.from('transaction_tips').insert(tipRows);
        if (tipErr) console.warn('Tips insert failed (transaction still saved):', tipErr);
      }
    }
  } catch (tipErr) {
    console.warn('Tips insert error (transaction still saved):', tipErr);
  }
  return trx;
}
async function listRecentTransactions(branchId = null, limit = 20) {
  let query = sb.from('transactions').select('*, items:transaction_items(*, employee:employees(full_name)), payments:transaction_payments(*), tips:transaction_tips(id, amount, payment_method, employee_id), branch:branches(name)').order('date', {
    ascending: false
  }).order('created_at', {
    ascending: false
  }).limit(limit);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}

// List transactions in a date range (no limit, for Tab Transaksi)
async function listTransactionsByDateRange({
  branchId = null,
  from,
  to,
  searchQuery = ''
}) {
  let query = sb.from('transactions').select('*, items:transaction_items(*, employee:employees(full_name)), payments:transaction_payments(*), tips:transaction_tips(id, amount, payment_method, employee_id), branch:branches(name)').gte('date', from).lte('date', to).order('date', {
    ascending: false
  }).order('start_time', {
    ascending: false
  }).order('created_at', {
    ascending: false
  });
  if (branchId) query = query.eq('branch_id', branchId);
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    query = query.or(`client_name_snapshot.ilike.%${q}%,client_phone_snapshot.ilike.%${q}%`);
  }
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}
async function getTodayStats(branchId = null) {
  const today = todayStr();
  let query = sb.from('transactions').select('total_amount, total_commission').eq('date', today);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) return {
    count: 0,
    total: 0,
    commission: 0
  };
  return {
    count: (data || []).length,
    total: (data || []).reduce((s, r) => s + Number(r.total_amount || 0), 0),
    commission: (data || []).reduce((s, r) => s + Number(r.total_commission || 0), 0)
  };
}
async function getMonthStats(branchId = null) {
  const ym = currentMonth();
  const firstDay = ym + '-01';
  const nextMonth = new Date(ym + '-01');
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextFirst = nextMonth.toISOString().split('T')[0];
  let query = sb.from('transactions').select('total_amount').gte('date', firstDay).lt('date', nextFirst);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) return {
    total: 0
  };
  return {
    total: (data || []).reduce((s, r) => s + Number(r.total_amount || 0), 0)
  };
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
const DATE_PRESETS = [{
  id: 'today',
  label: 'Hari Ini',
  getRange() {
    const t = todayStr();
    return {
      from: t,
      to: t
    };
  }
}, {
  id: 'yesterday',
  label: 'Kemarin',
  getRange() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = dateToYMD(d);
    return {
      from: y,
      to: y
    };
  }
}, {
  id: 'this_week',
  label: 'Minggu Ini',
  getRange() {
    const start = startOfWeekMonday();
    const end = endOfWeekSunday();
    return {
      from: dateToYMD(start),
      to: dateToYMD(end)
    };
  }
}, {
  id: 'last_week',
  label: 'Minggu Lalu',
  getRange() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const start = startOfWeekMonday(d);
    const end = endOfWeekSunday(d);
    return {
      from: dateToYMD(start),
      to: dateToYMD(end)
    };
  }
}, {
  id: 'this_month',
  label: 'Bulan Ini',
  getRange() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: dateToYMD(first),
      to: dateToYMD(last)
    };
  }
}, {
  id: 'last_month',
  label: 'Bulan Lalu',
  getRange() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      from: dateToYMD(first),
      to: dateToYMD(last)
    };
  }
}, {
  id: 'custom',
  label: 'Custom',
  getRange() {
    return null;
  } // Caller handles custom
}];

// =====================================================
// REPORTS — Query Functions
// =====================================================

// Get all transactions in date range (with items)
async function getReportTransactions({
  from,
  to,
  branchId = null,
  employeeId = null
}) {
  let query = sb.from('transactions').select('*, items:transaction_items(*, employee:employees(id, full_name, job_title)), payments:transaction_payments(*), branch:branches(id, name)').gte('date', from).lte('date', to).order('date', {
    ascending: false
  }).order('created_at', {
    ascending: false
  });
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  let result = data || [];

  // If employee filter set, filter transactions that have at least one item by that employee
  if (employeeId) {
    result = result.filter(t => (t.items || []).some(it => it.employee_id === employeeId));
  }
  return result;
}

// Aggregate stats from transactions
function aggregateReport(transactions, employeeFilter = null) {
  const trxs = transactions || [];
  const allItems = trxs.flatMap(t => (t.items || []).map(it => ({
    ...it,
    _trx: t
  })));
  const items = employeeFilter ? allItems.filter(it => it.employee_id === employeeFilter) : allItems;

  // Totals
  const totalRevenue = employeeFilter ? items.reduce((s, it) => s + Number(it.price || 0), 0) : trxs.reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + Number(it.commission_amount || 0), 0);
  const totalHomeServiceFee = employeeFilter ? 0 // HS fee tied to transaction, not employee — skip when filtering by employee
  : trxs.filter(t => t.is_home_service).reduce((s, t) => s + Number(t.home_service_fee || 0), 0);
  const trxCount = employeeFilter ? new Set(items.map(it => it.transaction_id)).size : trxs.length;
  const itemCount = items.length;
  const avgPerTrx = trxCount > 0 ? totalRevenue / trxCount : 0;

  // Breakdown by service category
  const byCategory = {};
  for (const it of items) {
    const cat = it.service_category || 'other';
    if (!byCategory[cat]) byCategory[cat] = {
      count: 0,
      revenue: 0,
      commission: 0
    };
    byCategory[cat].count += 1;
    byCategory[cat].revenue += Number(it.price || 0);
    byCategory[cat].commission += Number(it.commission_amount || 0);
  }

  // Breakdown by service name (top services)
  const byService = {};
  for (const it of items) {
    const name = it.service_name;
    if (!byService[name]) byService[name] = {
      count: 0,
      revenue: 0,
      commission: 0
    };
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
        commission: 0
      };
    }
    byEmployee[empId].items += 1;
    byEmployee[empId].revenue += Number(it.price || 0);
    byEmployee[empId].commission += Number(it.commission_amount || 0);
  }
  const topPerformers = Object.values(byEmployee).sort((a, b) => b.commission - a.commission);

  // Top spenders (by client total spend)
  const byClient = {};
  for (const t of trxs) {
    const key = t.client_phone_snapshot || t.client_name_snapshot || t.id;
    if (!byClient[key]) {
      byClient[key] = {
        name: t.client_name_snapshot || '—',
        phone: t.client_phone_snapshot || '',
        visits: 0,
        spent: 0
      };
    }
    byClient[key].visits += 1;
    byClient[key].spent += Number(t.total_amount || 0);
  }
  const topSpenders = Object.values(byClient).sort((a, b) => b.spent - a.spent);

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
    homeServiceTrxs
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
    endYear = startMonth === 11 ? startYear + 1 : startYear;
    endMonth = (startMonth + 1) % 12;
  } else {
    // Periode bulan sebelumnya (26 bulan lalu → 25 bulan ini)
    endYear = d.getFullYear();
    endMonth = d.getMonth();
    startYear = endMonth === 0 ? endYear - 1 : endYear;
    startMonth = endMonth === 0 ? 11 : endMonth - 1;
  }
  const periodStart = new Date(startYear, startMonth, 26);
  const periodEnd = new Date(endYear, endMonth, 25);
  return {
    period_start: dateToYMD(periodStart),
    period_end: dateToYMD(periodEnd),
    period_start_date: periodStart,
    period_end_date: periodEnd
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
    period_end_date: periodEnd
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
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    list.push({
      id: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
      label: `${monthNames[month - 1]} ${year}`,
      range_label: `26 ${monthNames[startMonthForPeriod(month) - 1]} – 25 ${monthNames[month - 1]} ${year}`,
      ...p
    });
    // Previous month
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
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
  let query = sb.from('employees').select('*, branch:branches(id, name)').eq('is_active', true).not('job_title', 'in', '("Owner","Manager")').order('full_name', {
    ascending: true
  });
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}

// Get commission totals per employee in a period
async function getPeriodCommissionByEmployee(periodStart, periodEnd, branchId = null) {
  let query = sb.from('transaction_items').select('employee_id, commission_amount, transactions!inner(date, is_home_service, home_service_fee, branch_id)').gte('transactions.date', periodStart).lte('transactions.date', periodEnd);
  if (branchId) query = query.eq('transactions.branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;

  // Aggregate by employee
  const byEmployee = {};
  for (const row of data || []) {
    const empId = row.employee_id;
    if (!byEmployee[empId]) {
      byEmployee[empId] = {
        employee_id: empId,
        treatment_commission: 0,
        items_count: 0,
        transaction_ids: new Set()
      };
    }
    byEmployee[empId].treatment_commission += Number(row.commission_amount || 0);
    byEmployee[empId].items_count += 1;
    byEmployee[empId].transaction_ids.add(row.transactions?.id);
  }

  // Home service fees (counted at transaction level, but we need to attribute to employees who worked on it)
  // For simplicity: HS fee → all items in that transaction share it equally
  // We need a separate query for transactions with HS
  let hsQuery = sb.from('transactions').select('id, home_service_fee, items:transaction_items(employee_id)').gte('date', periodStart).lte('date', periodEnd).eq('is_home_service', true);
  if (branchId) hsQuery = hsQuery.eq('branch_id', branchId);
  const {
    data: hsData,
    error: hsErr
  } = await hsQuery;
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
              hs_commission: 0
            };
          }
          byEmployee[empId].hs_commission = (byEmployee[empId].hs_commission || 0) + perEmp;
        }
      }
    }
  }

  // Tips per employee (Tahap 3) — from transaction_tips, scoped to period via parent transaction date
  let tipsQuery = sb.from('transaction_tips').select('employee_id, amount, transactions!inner(date, branch_id)').gte('transactions.date', periodStart).lte('transactions.date', periodEnd);
  if (branchId) tipsQuery = tipsQuery.eq('transactions.branch_id', branchId);
  const {
    data: tipsData,
    error: tipsErr
  } = await tipsQuery;
  if (!tipsErr && tipsData) {
    for (const row of tipsData) {
      const empId = row.employee_id;
      if (!byEmployee[empId]) {
        byEmployee[empId] = {
          employee_id: empId,
          treatment_commission: 0,
          items_count: 0,
          transaction_ids: new Set(),
          hs_commission: 0
        };
      }
      byEmployee[empId].tips = (byEmployee[empId].tips || 0) + Number(row.amount || 0);
    }
  }
  return byEmployee;
}
async function listPayrollAdjustments(periodStart, branchId = null) {
  let query = sb.from('payroll_adjustments').select('*').eq('period_start', periodStart);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}

// Upsert payroll adjustment
async function upsertPayrollAdjustment(payload) {
  // payload: { employee_id, branch_id, period_start, period_end, standard_work_days,
  //           annual_leave_days, sick_leave_certified_days, unpaid_leave_days,
  //           bonus, extra_deduction, notes, adjusted_by }
  const {
    data,
    error
  } = await sb.from('payroll_adjustments').upsert(payload, {
    onConflict: 'employee_id,period_start'
  }).select().single();
  if (error) throw error;
  return data;
}

// Get annual leave balances for employees in a year
async function getAnnualLeaveBalances(year, branchId = null) {
  let query = sb.from('annual_leave_balance').select('*').eq('year', year);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}

// Calculate full payroll details for one employee
// Pure function — no async, takes all needed data
function calculatePayroll({
  employee,
  commissions,
  adjustment,
  defaultStandardDays = 26
}) {
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
  const effectiveAbsentDays = unpaidLeave + unpaidLeaveWeekend * 2;

  // Actual work days (for new employees who started mid-period).
  // If set (>0), salary is prorated by actualWorkDays / standardDays,
  // THEN any absence deduction is applied on top of the prorated amount.
  const actualWorkDays = Number(adjustment?.actual_work_days) || 0;
  const isProrated = actualWorkDays > 0 && actualWorkDays < standardDays;
  let baseSalaryActual;
  if (isProrated) {
    // Prorate to days actually worked, then subtract any absences within those days
    const proratedBase = baseSalary * (actualWorkDays / standardDays);
    baseSalaryActual = effectiveAbsentDays > 0 ? Math.round(proratedBase * (1 - effectiveAbsentDays / actualWorkDays)) : Math.round(proratedBase);
    if (baseSalaryActual < 0) baseSalaryActual = 0;
  } else {
    baseSalaryActual = effectiveAbsentDays > 0 ? Math.round(baseSalary * (1 - effectiveAbsentDays / standardDays)) : baseSalary;
  }
  const salaryDeduction = baseSalary - baseSalaryActual;

  // Meal allowance is paid per day actually present.
  // Rules: unpaid absence reduces it (weekend counted ONCE, not doubled like base
  // salary), while paid leave (annual leave / certified sick) does NOT reduce it.
  const mealAbsentDays = unpaidLeave + unpaidLeaveWeekend;
  let mealAllowanceActual;
  let mealDaysBase; // days the meal allowance is counted against
  if (isProrated) {
    mealDaysBase = actualWorkDays;
    const proratedMeal = mealAllowance * (actualWorkDays / standardDays);
    mealAllowanceActual = mealAbsentDays > 0 ? Math.round(proratedMeal * (1 - mealAbsentDays / actualWorkDays)) : Math.round(proratedMeal);
  } else {
    mealDaysBase = standardDays;
    mealAllowanceActual = mealAbsentDays > 0 ? Math.round(mealAllowance * (1 - mealAbsentDays / standardDays)) : mealAllowance;
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
  const totalBeforeDeduction = baseSalaryActual + mealAllowanceActual + bpjsKesehatan + treatmentCommission + hsCommission + tips + bonus;

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
    total
  };
}

// =====================================================
// AUDIT LOG — Only accessible by super_admin
// =====================================================

async function listAuditLog({
  limit = 100,
  tableName = null,
  action = null,
  userId = null,
  branchId = null,
  dateFrom = null,
  dateTo = null
} = {}) {
  let query = sb.from('audit_log_readable').select('*').order('created_at', {
    ascending: false
  }).limit(limit);
  if (tableName) query = query.eq('table_name', tableName);
  if (action) query = query.eq('action', action);
  if (userId) query = query.eq('changed_by', userId);
  if (branchId) query = query.eq('branch_id', branchId);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);
  const {
    data,
    error
  } = await query;
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
    if (l.action === 'UPDATE' && l.record_id && l.record_id in insertTime) {
      const t = new Date(l.created_at).getTime();
      const diff = Math.abs(t - insertTime[l.record_id]);
      if (diff <= windowMs) {
        return {
          ...l,
          is_input_side_effect: true
        };
      }
    }
    return l;
  });
}
async function getAuditSummary(days = 7) {
  const {
    data,
    error
  } = await sb.rpc('get_audit_summary', {
    p_days: days
  });
  if (error) throw error;
  return data?.[0] || {
    total_changes: 0,
    inserts: 0,
    updates: 0,
    deletes: 0,
    active_users: 0
  };
}

// Helper to format JSON diff for display (for UPDATE actions)
function formatAuditDiff(oldData, newData, changedFields) {
  if (!changedFields || !changedFields.length) return [];
  return changedFields.map(field => ({
    field,
    old: oldData ? oldData[field] : null,
    new: newData ? newData[field] : null
  }));
}

// Friendly label for action
function getActionLabel(action) {
  const map = {
    INSERT: 'Tambah',
    UPDATE: 'Edit',
    DELETE: 'Hapus'
  };
  return map[action] || action;
}
function getActionColor(action) {
  const map = {
    INSERT: 'var(--green)',
    UPDATE: 'var(--mauve)',
    DELETE: 'var(--red)'
  };
  return map[action] || 'var(--muted)';
}
function getActionBadge(action) {
  const map = {
    INSERT: 'badge-green',
    UPDATE: 'badge-mauve',
    DELETE: 'badge-red'
  };
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
  total_spent: 'Total Belanja'
};
function getFieldLabel(field) {
  return AUDIT_FIELD_LABELS[field] || field;
}

// Format value for display in audit (currency, dates, booleans)
function formatAuditValue(field, value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (['base_salary', 'meal_allowance', 'total_amount', 'total_commission', 'home_service_fee', 'price', 'commission_amount', 'bonus', 'extra_deduction', 'total_spent'].includes(field)) {
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
        return {
          wch: Math.min(Math.max(maxLen + 2, 10), 50)
        };
      });
      ws['!cols'] = cols;
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31)); // Max 31 chars
  }

  // Generate & download
  const today = todayStr();
  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}_${today}.xlsx`;
  XLSX.writeFile(wb, finalName);
}

// Export report data (transactions list + aggregates)
function exportReportToExcel({
  transactions,
  stats,
  periodLabel,
  branchLabel
}) {
  const sheets = [];

  // Sheet 1: Summary
  sheets.push({
    name: 'Ringkasan',
    rows: [{
      Metric: 'Periode',
      Nilai: periodLabel
    }, {
      Metric: 'Cabang',
      Nilai: branchLabel
    }, {
      Metric: 'Total Omset',
      Nilai: stats.totalRevenue
    }, {
      Metric: 'Total Komisi',
      Nilai: stats.totalCommission
    }, {
      Metric: 'Jumlah Transaksi',
      Nilai: stats.trxCount
    }, {
      Metric: 'Jumlah Treatment',
      Nilai: stats.itemCount
    }, {
      Metric: 'Rata-rata per Transaksi',
      Nilai: Math.round(stats.avgPerTrx)
    }, {
      Metric: 'Transaksi Lembur',
      Nilai: stats.overtimeTrxs
    }, {
      Metric: 'Transaksi Home Service',
      Nilai: stats.homeServiceTrxs
    }]
  });

  // Sheet 2: Transaksi Detail
  const trxRows = [];
  for (const t of transactions) {
    for (const item of t.items || []) {
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
        'Biaya HS': Number(t.home_service_fee) || 0
      });
    }
  }
  sheets.push({
    name: 'Transaksi Detail',
    rows: trxRows
  });

  // Sheet 3: Top Performer
  const performerRows = stats.topPerformers.map((emp, i) => ({
    Rank: i + 1,
    Karyawan: emp.full_name,
    Jabatan: emp.job_title,
    Treatment: emp.items,
    Revenue: emp.revenue,
    Komisi: emp.commission
  }));
  sheets.push({
    name: 'Top Performer',
    rows: performerRows
  });

  // Sheet 4: Top Pelanggan
  const spenderRows = stats.topSpenders.map((c, i) => ({
    Rank: i + 1,
    Nama: c.name,
    HP: c.phone || '',
    Kunjungan: c.visits,
    'Total Belanja': c.spent
  }));
  sheets.push({
    name: 'Top Pelanggan',
    rows: spenderRows
  });

  // Sheet 5: Per Kategori
  const categoryRows = Object.entries(stats.byCategory).map(([cat, d]) => ({
    Kategori: cat,
    'Jumlah Treatment': d.count,
    Revenue: d.revenue,
    Komisi: d.commission,
    '% dari Omset': stats.totalRevenue > 0 ? Math.round(d.revenue / stats.totalRevenue * 100) : 0
  }));
  sheets.push({
    name: 'Per Kategori',
    rows: categoryRows
  });

  // Sheet 6: Per Treatment
  const serviceRows = Object.entries(stats.byService).sort(([, a], [, b]) => b.count - a.count).map(([name, d]) => ({
    Treatment: name,
    Jumlah: d.count,
    Revenue: d.revenue,
    Komisi: d.commission
  }));
  sheets.push({
    name: 'Per Treatment',
    rows: serviceRows
  });
  const fname = `JBB_Laporan_${(branchLabel || 'all').replace(/\s/g, '_')}_${periodLabel.replace(/\s/g, '_').replace(/[\/]/g, '-')}`;
  exportToExcel(fname, sheets);
}

// Export payroll to Excel
function exportPayrollToExcel({
  rows,
  periodLabel,
  branchLabel,
  totals
}) {
  const sheets = [];

  // Sheet 1: Ringkasan
  sheets.push({
    name: 'Ringkasan',
    rows: [{
      Metric: 'Periode',
      Nilai: periodLabel
    }, {
      Metric: 'Cabang',
      Nilai: branchLabel
    }, {
      Metric: 'Jumlah Karyawan',
      Nilai: rows.length
    }, {
      Metric: 'Total Gaji Pokok (setelah potong)',
      Nilai: totals.base
    }, {
      Metric: 'Total Uang Makan',
      Nilai: totals.meal
    }, {
      Metric: 'Total BPJS Kesehatan',
      Nilai: totals.bpjs || 0
    }, {
      Metric: 'Total Komisi',
      Nilai: totals.commission
    }, {
      Metric: 'Total Tips',
      Nilai: totals.tips || 0
    }, {
      Metric: 'Total Bonus',
      Nilai: totals.bonus
    }, {
      Metric: 'Total Potongan / Kasbon',
      Nilai: totals.deduction
    }, {
      Metric: 'TOTAL PAYROLL',
      Nilai: totals.total
    }]
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
    'Gaji Diterima (sblm potongan)': r.payroll.total_before_deduction != null ? r.payroll.total_before_deduction : r.payroll.total + r.payroll.extra_deduction,
    'Potongan / Kasbon': r.payroll.extra_deduction,
    'TOTAL GAJI': r.payroll.total
  }));
  sheets.push({
    name: 'Detail Gaji',
    rows: payrollRows
  });
  const fname = `JBB_RekapGaji_${(branchLabel || 'all').replace(/\s/g, '_')}_${periodLabel.replace(/\s/g, '_').replace(/[\/]/g, '-')}`;
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
  w: 700,
  h: 436,
  d: 'M213.6 433.5C213.3 432.6 213.0 408.7 213.0 380.5L213.0 329.2L206.5 325.9C202.9 324.0 200.0 322.1 200.0 321.6C200.0 320.4 209.3 321.5 215.8 323.5L221.0 325.1L221.0 350.5L221.0 376.0L224.8 376.0C226.8 375.9 229.6 375.3 231.0 374.5C233.7 372.9 242.7 372.5 244.8 373.9C245.6 374.4 246.0 375.6 245.8 376.6C245.5 378.3 244.3 378.5 233.2 378.8L221.0 379.1L220.9 390.3C220.8 409.4 219.5 428.3 217.9 431.4C216.2 434.9 214.5 435.7 213.6 433.5ZM459.6 432.8C459.3 431.5 459.0 419.6 459.0 406.2L459.0 382.0L454.2 384.4C441.6 390.7 412.3 399.7 402.5 400.3C398.4 400.5 397.5 400.2 395.6 397.7C393.6 395.0 393.5 393.4 393.0 372.5C392.7 360.2 392.3 349.9 391.9 349.6C391.6 349.3 388.9 348.0 385.9 346.6C380.5 344.2 380.5 344.2 383.4 343.5C385.1 343.0 390.3 343.4 396.1 344.4C407.7 346.4 420.1 345.8 426.7 342.9C430.8 341.0 437.3 340.4 440.4 341.6C442.4 342.4 442.5 345.6 440.5 346.4C439.7 346.7 430.6 347.2 420.3 347.6C408.8 348.0 401.2 348.7 400.8 349.4C399.8 351.0 399.9 391.3 400.9 392.9C402.9 396.1 434.9 390.0 451.5 383.3L458.5 380.5L458.8 354.8L459.0 329.0L451.8 325.3L444.5 321.5L448.9 321.2C451.3 321.0 456.2 321.8 460.1 323.0L467.0 325.1L467.0 350.5L467.0 376.0L470.8 376.0C472.8 376.0 475.8 375.3 477.4 374.5C480.5 372.9 488.7 372.5 490.8 373.9C491.6 374.4 492.0 375.6 491.8 376.6C491.5 378.3 490.3 378.5 479.2 378.8L467.0 379.1L467.0 397.8C467.0 408.1 466.6 419.3 466.1 422.7C464.7 432.4 461.0 438.0 459.6 432.8ZM288.6 431.8C288.3 430.5 287.6 423.1 287.1 415.2C286.6 407.3 285.6 400.3 285.0 399.5C284.4 398.7 282.3 397.6 280.4 397.0C278.5 396.4 277.0 395.5 277.0 395.1C277.0 394.8 288.4 394.4 302.2 394.4C316.1 394.3 330.3 394.1 333.7 393.9C340.3 393.5 342.0 394.1 340.1 396.4C339.5 397.1 338.1 402.2 337.1 407.6C336.0 413.1 334.9 418.7 334.5 420.2C333.9 422.4 334.2 422.9 336.2 423.2C337.4 423.4 338.5 424.2 338.5 425.0C338.5 426.3 335.2 426.5 316.3 426.8L294.0 427.0L292.6 430.5C290.9 434.5 289.3 435.0 288.6 431.8ZM533.6 428.8C533.3 425.9 532.8 419.4 532.5 414.5C531.5 399.6 531.4 399.3 526.4 397.4C523.9 396.5 522.2 395.4 522.6 395.1C522.9 394.8 534.5 394.5 548.3 394.5C562.2 394.4 575.8 394.1 578.5 393.7C584.7 392.7 586.5 393.7 585.1 397.1C584.5 398.4 582.9 404.6 581.6 410.8L579.2 422.1L581.5 423.0C583.6 423.8 585.6 425.7 584.8 426.2C584.6 426.3 574.4 426.7 562.1 427.0L539.7 427.5L538.0 430.4C535.4 435.1 534.2 434.7 533.6 428.8ZM328.8 423.2C330.9 422.0 331.0 421.4 331.0 409.3L331.0 396.7L312.9 397.4C302.9 397.7 294.3 398.3 293.9 398.6C292.9 399.2 292.7 419.3 293.7 422.8L294.3 425.2L310.4 424.8C320.8 424.6 327.3 424.0 328.8 423.2ZM571.0 423.9L576.0 422.8L576.0 409.8L576.0 396.7L558.6 397.3C549.0 397.7 540.5 398.3 539.6 398.6C537.8 399.3 537.5 404.4 538.6 417.3L539.3 425.0L552.6 425.0C559.9 425.0 568.2 424.5 571.0 423.9ZM152.0 392.4C143.0 388.5 138.0 381.2 138.0 372.0C138.0 362.4 144.5 354.4 154.7 351.4C165.5 348.3 165.3 348.4 164.6 344.0C163.9 339.4 164.3 339.3 168.8 342.0C172.4 344.2 172.7 345.2 170.5 347.0C167.9 349.1 168.8 350.5 173.4 351.8C185.6 355.0 192.3 369.1 187.1 380.5C184.8 385.6 178.2 391.6 173.3 392.9C167.8 394.5 156.1 394.2 152.0 392.4ZM553.6 390.9C553.3 389.2 553.0 385.0 553.0 381.7L553.0 375.7L538.8 376.5C529.3 377.0 523.5 377.7 521.6 378.7C518.3 380.4 514.0 379.6 506.3 375.6L502.1 373.5L537.3 373.5C573.1 373.5 589.8 372.7 593.1 371.0C595.8 369.5 607.3 369.8 609.5 371.4C611.2 372.6 611.3 373.0 610.0 374.5C608.7 376.1 607.2 376.2 596.1 375.7C589.3 375.3 578.5 375.3 572.0 375.7L560.3 376.3L559.7 382.8C558.8 392.3 554.9 397.4 553.6 390.9ZM172.7 388.1C183.1 383.3 185.9 369.9 178.3 360.9C174.5 356.4 170.9 355.0 163.2 355.0C155.3 355.0 151.3 357.0 147.2 363.0C144.0 367.8 144.3 377.9 147.9 382.7C153.0 389.6 164.1 392.0 172.7 388.1ZM262.2 380.0C258.7 378.2 256.1 376.6 256.4 376.3C256.6 376.1 261.2 376.4 266.7 377.0C281.0 378.8 338.1 376.3 347.0 373.6C351.6 372.2 360.1 372.5 363.2 374.1C365.0 375.1 365.7 377.9 364.2 378.1C363.8 378.1 351.6 378.3 337.0 378.4C307.6 378.8 290.5 379.7 281.5 381.2C269.2 383.3 268.8 383.3 262.2 380.0ZM546.1 364.1C538.9 361.6 535.9 359.2 533.2 354.0C530.5 348.5 530.4 344.8 533.0 339.4C535.5 334.3 541.2 330.2 548.2 328.4C554.6 326.7 555.5 325.8 554.1 323.1C553.1 321.2 553.2 321.0 555.4 321.0C558.1 321.0 559.5 322.5 559.5 325.3C559.5 326.6 560.7 327.6 563.1 328.4C574.7 332.4 580.4 340.6 578.6 350.4C576.3 362.4 560.3 369.2 546.1 364.1ZM284.4 361.9C283.9 361.1 283.1 357.8 282.5 354.6C281.5 348.8 281.4 348.6 277.2 347.2C274.8 346.4 273.2 345.5 273.5 345.2C273.8 344.8 285.2 344.5 298.8 344.5C314.9 344.4 324.9 344.0 327.6 343.2C331.7 342.0 331.8 342.0 332.3 336.2C332.5 333.1 332.4 330.1 332.0 329.7C330.9 328.4 293.1 331.0 289.2 332.6C285.8 334.0 284.4 333.7 277.3 330.3C273.7 328.6 272.8 326.5 276.0 327.5C279.4 328.6 308.5 328.2 325.2 326.9C333.9 326.2 341.3 326.0 341.7 326.4C342.1 326.8 341.9 327.9 341.2 328.8C339.5 331.1 337.4 335.9 336.7 339.1C336.1 341.2 336.5 341.9 338.6 342.9C340.1 343.5 340.9 344.4 340.5 344.8C340.2 345.2 328.9 346.0 315.5 346.6C302.1 347.3 290.7 348.1 290.1 348.5C288.8 349.3 288.7 357.9 289.9 359.9C291.3 362.1 325.4 360.9 330.1 358.4C336.7 355.0 347.8 356.6 343.9 360.5C341.8 362.7 285.8 364.0 284.4 361.9ZM565.7 359.4C570.7 355.7 572.5 352.2 572.5 346.7C572.5 331.8 553.2 325.6 541.9 336.9C533.7 345.1 536.8 356.5 548.5 360.8C553.1 362.5 562.5 361.7 565.7 359.4ZM72.5 280.3C51.6 278.6 32.3 270.3 19.8 257.6C8.6 246.2 2.4 231.1 1.3 211.8L0.7 202.0L19.4 202.0L38.0 202.0L38.0 207.2C38.1 224.6 46.7 240.0 60.2 246.8C68.4 251.0 76.2 252.3 88.6 251.8C97.3 251.4 99.6 250.9 105.4 248.2C114.2 244.1 123.5 234.9 127.8 226.0C134.1 213.2 134.0 215.7 134.0 103.2L134.0 1.0L153.0 1.0L172.1 1.0L171.8 107.2L171.5 213.5L169.2 221.5C157.6 262.8 122.1 284.4 72.5 280.3ZM239.0 139.0L239.0 0.8L295.2 1.2C349.0 1.6 352.0 1.7 362.5 3.9C398.6 11.4 418.3 28.7 424.5 58.6C429.1 80.9 424.4 97.9 409.6 112.5C403.8 118.3 399.3 121.7 393.8 124.5C385.8 128.6 384.4 130.0 388.1 130.0C389.3 130.0 394.3 131.4 399.3 133.0C420.0 140.0 434.4 154.9 441.8 176.8C444.2 183.8 444.4 185.9 444.4 200.5C444.4 215.8 444.2 216.9 441.2 226.0C434.3 246.8 420.4 260.6 397.4 269.4C379.8 276.1 377.0 276.4 304.2 276.8L239.0 277.1L239.0 139.0ZM493.0 139.0L493.0 0.8L549.2 1.2C603.0 1.6 606.0 1.7 616.5 3.9C653.4 11.5 674.0 30.3 678.9 61.1C682.5 83.1 678.0 98.3 663.6 112.5C657.8 118.3 653.3 121.7 647.8 124.5C639.8 128.6 638.4 130.0 642.1 130.0C643.3 130.0 648.3 131.4 653.3 133.0C680.4 142.1 697.3 165.4 698.7 195.6C700.4 231.4 684.6 256.4 652.1 269.1C633.9 276.2 631.5 276.4 558.2 276.8L493.0 277.1L493.0 139.0ZM375.2 245.2C387.2 241.2 396.7 233.5 401.8 223.5C408.9 209.9 408.7 189.1 401.3 174.6C397.9 167.9 387.9 158.2 380.5 154.3C367.9 147.8 365.1 147.5 318.5 147.5L276.5 147.5L276.2 197.8L276.0 248.1L322.2 247.7C366.8 247.4 368.7 247.3 375.2 245.2ZM629.2 245.2C641.2 241.2 650.7 233.5 655.8 223.5C662.9 209.9 662.7 189.1 655.3 174.6C651.9 167.9 641.9 158.2 634.5 154.3C621.9 147.8 619.1 147.5 572.5 147.5L530.5 147.5L530.2 197.8L530.0 248.1L576.2 247.7C620.8 247.4 622.7 247.3 629.2 245.2ZM357.2 116.3C369.9 112.5 380.8 103.0 385.2 92.2C387.1 87.4 387.5 84.7 387.5 74.5C387.5 64.2 387.1 61.7 385.1 56.5C382.1 49.0 373.3 40.0 365.8 36.5C353.6 30.9 351.2 30.6 312.2 30.2L276.0 29.9L276.0 73.8C276.0 97.9 276.3 118.0 276.7 118.4C277.1 118.8 293.9 119.0 314.0 118.8C347.1 118.4 351.1 118.2 357.2 116.3ZM609.7 116.8C618.8 114.0 624.3 110.8 630.6 104.6C639.4 95.8 641.5 90.1 641.5 74.5C641.5 64.2 641.1 61.7 639.1 56.5C636.1 49.0 627.3 40.0 619.8 36.5C607.6 30.9 605.2 30.6 566.2 30.2L530.0 29.9L530.0 73.8C530.0 97.9 530.3 118.0 530.7 118.4C531.1 118.8 547.9 119.0 568.0 118.7C597.4 118.4 605.5 118.0 609.7 116.8Z'
};
const LOGO_VIALI = {
  w: 700,
  h: 304,
  d: 'M487.7 303.4C487.3 303.0 487.0 295.8 487.0 287.3L487.0 272.0L483.2 273.9C474.7 278.2 449.3 286.0 443.7 286.0C439.6 286.0 438.5 283.5 438.0 272.6L437.5 262.5L433.6 260.6C430.3 259.0 430.0 258.6 431.5 257.7C432.6 257.2 435.3 257.1 438.4 257.5C443.8 258.4 454.8 258.3 459.1 257.4C461.6 256.9 461.8 256.5 462.5 248.9C462.8 244.4 462.9 240.6 462.6 240.3C462.4 240.0 457.9 240.3 452.8 240.9C439.8 242.6 438.4 242.5 435.5 240.6C434.0 239.6 433.0 238.7 433.2 238.6C433.3 238.4 442.0 238.0 452.3 237.7C469.7 237.2 471.1 237.3 470.4 238.8C470.0 239.7 468.8 243.8 467.7 247.9L465.6 255.2L468.1 257.0C471.2 259.4 470.4 259.7 456.6 260.5C450.6 260.8 445.3 261.3 444.8 261.6C443.4 262.5 443.8 280.0 445.2 280.1C452.9 280.7 470.2 276.8 482.2 271.8L487.0 269.8L487.0 250.0C487.0 228.2 487.3 229.1 480.1 225.5C477.4 224.1 477.0 223.6 478.2 222.9C479.7 222.0 489.6 224.2 491.2 225.8C491.7 226.3 492.0 241.9 491.8 262.6C491.5 292.7 491.3 298.9 490.0 301.3C489.1 302.8 488.1 303.8 487.7 303.4ZM313.7 302.3C313.3 302.0 313.0 285.3 313.0 265.3L313.0 228.9L309.9 227.2C308.2 226.3 306.1 225.0 305.2 224.3C302.0 222.1 306.6 221.6 312.8 223.6L318.5 225.5L318.4 261.5C318.2 295.8 317.7 303.0 315.2 303.0C314.7 303.0 314.0 302.7 313.7 302.3ZM366.2 299.5C364.4 298.2 364.0 296.9 364.0 293.0C364.0 288.5 363.8 288.1 360.8 287.1C359.1 286.5 358.0 285.7 358.3 285.4C358.6 285.0 366.7 284.8 376.3 284.9C395.8 285.1 395.0 285.4 395.0 277.9L395.0 274.0L390.2 274.0C387.6 274.0 380.7 274.5 374.7 275.0C365.1 275.9 363.6 275.9 360.7 274.3C357.5 272.5 357.7 272.5 379.0 271.9C390.8 271.6 400.8 271.6 401.2 271.9C401.6 272.3 401.1 275.0 399.9 277.9C398.0 283.0 398.0 283.3 399.7 284.5C400.7 285.2 401.3 286.1 401.0 286.4C400.7 286.7 393.5 287.3 385.0 287.7L369.5 288.5L369.9 293.0C370.0 295.5 370.4 297.9 370.7 298.4C371.5 299.6 393.5 298.5 399.1 297.0C404.6 295.4 409.3 296.3 408.8 298.8C408.5 300.3 406.4 300.5 388.5 300.8C371.6 301.0 368.2 300.8 366.2 299.5ZM263.7 281.3C263.3 281.0 263.0 272.2 263.0 261.8L263.0 242.9L259.0 241.2C256.8 240.3 255.0 239.2 255.0 238.8C255.0 237.7 265.2 237.8 266.9 238.9C268.0 239.6 268.3 241.4 268.1 245.5L267.9 251.1L278.7 250.8L289.5 250.5L289.8 245.6C290.2 240.3 288.6 237.6 284.4 236.6C283.1 236.2 282.0 235.5 282.0 234.8C282.0 233.7 291.9 234.2 294.0 235.5C295.3 236.3 295.3 270.3 294.0 275.2C292.7 279.7 291.1 281.0 290.3 278.1C289.8 276.1 289.1 276.0 279.0 276.0L268.2 276.0L267.0 279.0C265.8 282.0 264.9 282.6 263.7 281.3ZM281.8 273.3L290.0 272.7L290.0 263.4C290.0 258.3 289.7 254.0 289.2 253.8C288.8 253.6 283.9 253.6 278.2 253.8L268.0 254.1L268.0 264.1L268.0 274.0L270.8 274.0C272.3 274.0 277.2 273.7 281.8 273.3ZM395.8 247.8L395.5 228.5L391.2 226.2C383.8 222.1 387.0 220.5 396.4 223.8L401.4 225.5L401.1 238.6C401.0 245.9 401.2 252.0 401.7 252.3C402.1 252.6 404.3 252.2 406.5 251.4C411.7 249.6 416.4 249.6 418.0 251.5C419.7 253.6 415.6 255.0 407.4 255.0L401.0 255.0L401.0 258.2C401.0 261.9 399.1 266.1 397.3 266.7C396.3 267.1 396.0 262.6 395.8 247.8ZM354.5 261.8C348.7 259.8 344.0 253.7 344.0 248.3C344.0 242.3 350.5 235.8 357.8 234.4C361.6 233.7 362.6 232.4 361.0 230.5C360.0 229.2 360.2 229.0 362.3 229.0C365.2 229.0 367.7 231.4 365.9 232.5C365.2 233.0 366.9 234.3 370.1 235.9C382.8 242.0 383.2 254.5 371.0 260.8C366.2 263.2 359.7 263.6 354.5 261.8ZM369.0 257.5C372.7 255.6 374.0 253.2 374.0 248.5C374.0 241.5 369.8 238.0 361.3 238.0C355.5 238.0 352.3 239.9 350.3 244.7C346.3 254.5 358.6 262.9 369.0 257.5ZM59.5 159.8C59.2 159.1 46.0 123.3 30.0 80.3C14.1 37.2 1.0 1.6 1.0 1.0C1.0 0.4 5.4 0.0 12.4 0.0L23.8 0.0L25.8 5.8C26.8 8.9 36.3 36.0 46.8 66.0C57.3 96.0 66.6 123.3 67.6 126.8C68.5 130.2 69.4 132.9 69.6 132.7C69.8 132.5 71.0 128.8 72.3 124.4C73.5 120.1 83.7 90.3 94.9 58.2L115.3 -0.0L126.7 -0.0C133.0 -0.0 138.0 0.4 138.0 0.9C138.0 1.6 83.5 149.1 79.5 159.2C78.9 160.7 77.4 161.0 69.4 161.0C62.7 161.0 59.8 160.6 59.5 159.8ZM208.0 80.5L208.0 0.0L218.5 0.0L229.0 0.0L229.0 80.5L229.0 161.0L218.5 161.0L208.0 161.0L208.0 80.5ZM304.1 158.3C305.4 154.9 357.6 10.3 359.7 4.3L361.2 0.0L370.4 0.0L379.6 0.0L407.5 79.3C422.8 122.8 435.5 159.1 435.8 159.8C436.1 160.7 433.6 161.0 425.2 161.0L414.1 161.0L407.3 140.5L400.5 120.0L370.0 120.0L339.4 120.0L332.4 140.2L325.5 160.5L314.2 160.8L303.0 161.1L304.1 158.3ZM506.0 80.5L506.0 0.0L516.5 0.0L527.0 0.0L527.2 72.3L527.5 144.5L566.8 144.8L606.0 145.0L606.0 153.0L606.0 161.0L556.0 161.0L506.0 161.0L506.0 80.5ZM678.0 80.5L678.0 -0.1L688.8 0.2L699.5 0.5L699.8 80.8L700.0 161.0L689.0 161.0L678.0 161.0L678.0 80.5ZM394.0 101.6C394.0 100.6 371.0 33.7 370.5 33.2C370.2 32.9 369.9 32.9 369.7 33.1C369.5 33.3 364.2 48.4 358.0 66.5C351.8 84.7 346.5 100.1 346.2 100.8C345.9 101.7 351.0 102.0 369.9 102.0C383.2 102.0 394.0 101.8 394.0 101.6Z'
};

// Versi PNG hitam, dipakai untuk nota versi gambar (canvas).
// Sengaja PNG, bukan SVG, supaya aman di Safari lama.
const LOGO_JBB_PNG = 'data:image/png;base64,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';
const LOGO_VIALI_PNG = 'data:image/png;base64,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';

// Bikin markup <svg> siap tempel. Dipakai di nota HTML dan slip gaji.
function logoSVG(logo, height, color) {
  const w = Math.round(height * logo.w / logo.h);
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + height + '" viewBox="0 0 ' + logo.w + ' ' + logo.h + '" role="img" aria-label="Logo">' + '<path fill="' + color + '" d="' + logo.d + '"/></svg>';
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
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function () {
        resolve(null);
      };
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
      logoPng: LOGO_VIALI_PNG
    };
  }
  return {
    name: 'JBB',
    tagline: '아름다움',
    color: '#7a667e',
    logo: LOGO_JBB,
    logoPng: LOGO_JBB_PNG
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
    ig: '@jewelbeautybandung'
  },
  smr: {
    name: 'Jewel Beauty Summarecon',
    address: 'Ruko Shappire No. 6, Summarecon Bandung',
    phone: '+62 853-5350-6458',
    ig: '@jewelbeautybandung.summarecon'
  },
  vli: {
    name: 'VIALI Beauty',
    address: 'Piazza The Mozia, Blok E9 No. 22, BSD City',
    phone: '+62 881-0825-39229',
    ig: '@vialibeauty'
  },
  jgj: {
    name: 'JBB Jogja',
    address: 'Ruko Kuning No. 8B, Jalan Ring Road Utara (Samping Pakuwon Mall), Yogyakarta',
    phone: '+62 821-2817-0907',
    ig: '@jogjabeautybar'
  },
  jmb: {
    name: 'JBB Jogja Jambon',
    address: 'Ruko IBC Nomor 5, Jalan Jambon, Kota Yogyakarta',
    phone: '+62 858-4632-4762',
    ig: '@jogjabeautybar.jambon'
  },
  cms: {
    name: 'JBB Ciamis',
    address: 'Perum Imbanagara Estate No. 2-4, Jl. Yogaswara, Warungwetan, Imbanagara, Kec. Ciamis, Kabupaten Ciamis, Jawa Barat 46219',
    phone: '+62 822-1687-7778',
    ig: '@jbb.ciamis'
  }
};
function getBranchInfo(branchId, fallbackName = '') {
  return BRANCH_INFO[branchId] || {
    name: fallbackName || 'Jewel Beauty',
    address: '',
    phone: '',
    ig: ''
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
  for (const it of rawItems || []) {
    const gid = it.share_group_id;
    if (gid) {
      if (!byGroup[gid]) {
        byGroup[gid] = {
          service_name: it.service_name,
          discount_type: it.discount_type,
          discount_value: it.discount_value,
          price: 0,
          original_price: 0,
          discount_amount: 0,
          names: []
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
        names: it.employee?.full_name ? [it.employee.full_name] : []
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
    const discLabel = it.discount_type === 'percent' && it.discount_value ? `Diskon ${it.discount_value}%` : 'Diskon';
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
  const paymentBreakdownRows = payments.length > 0 ? payments.map(p => {
    const label = p.is_dp ? `DP (${getPaymentMethodLabel(p.payment_method)})` : `Pelunasan (${getPaymentMethodLabel(p.payment_method)})`;
    return `<div class="total-row"><span>${label}</span><span>${fmtRp(p.amount)}</span></div>`;
  }).join('') : `<div class="total-row"><span>Pembayaran (${getPaymentMethodLabel(trx.payment_method || 'cash')})</span><span>${fmtRp(grandTotal)}</span></div>`;
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
    ${sisa <= 0 && payments.length > 0 ? `<div class="pay-note">✓ LUNAS</div>` : ''}

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
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // Build ops list, each with explicit step. Then total height = sum of steps + paddings.
  const ops = [];
  const addText = (text, font, color, align, step) => ops.push({
    type: 'text',
    text,
    font,
    color,
    align,
    step
  });
  const addWrapped = (text, font, color, align, stepPerLine, maxW) => {
    for (const ln of wrapText(text, font, maxW || innerW)) ops.push({
      type: 'text',
      text: ln,
      font,
      color,
      align,
      step: stepPerLine
    });
  };
  const addGap = px => ops.push({
    type: 'gap',
    step: px
  });
  const addDivider = () => ops.push({
    type: 'divider',
    step: 12
  });
  const addRow = (left, right, font, color) => ops.push({
    type: 'row',
    left,
    right,
    font,
    color,
    step: 16
  });

  // HEADER — logo asli. Pakai PNG hitam supaya tajam di printer termal
  // dan aman di Safari lama (SVG di canvas kadang bermasalah di sana).
  // Kalau logonya gagal dimuat, jatuh balik ke tulisan seperti versi lama.
  const logoImg = await loadLogoImage(brand.logoPng);
  if (logoImg && logoImg.naturalWidth) {
    const LOGO_W = 120;
    const logoH = Math.round(LOGO_W * logoImg.naturalHeight / logoImg.naturalWidth);
    ops.push({
      type: 'image',
      img: logoImg,
      w: LOGO_W,
      h: logoH,
      step: logoH + 8
    });
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
    cv.toBlob(blob => {
      if (!blob) {
        toast('Gagal membuat PNG', 'error');
        return;
      }
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
  const {
    data,
    error
  } = await sb.from('transaction_items').select(`
      id, service_name, price, commission_amount, commission_rate, commission_type, has_complaint, complaint_note, notes,
      share_group_id, share_percent,
      transaction:transactions(
        id, date, start_time, is_overtime, is_home_service, home_service_fee,
        client_name_snapshot, client_phone_snapshot,
        all_items:transaction_items(employee_id)
      )
    `).eq('employee_id', employeeId).gte('transaction.date', periodStart).lte('transaction.date', periodEnd);
  if (error) throw error;

  // Filter out rows where transaction is null (RLS edge case)
  return (data || []).filter(r => r.transaction);
}

// Get tip detail (per transaction) for one employee in a period — for slip breakdown
async function getEmployeePeriodTips(employeeId, periodStart, periodEnd) {
  const {
    data,
    error
  } = await sb.from('transaction_tips').select(`
      id, amount, payment_method,
      transaction:transactions!inner(id, date, client_name_snapshot)
    `).eq('employee_id', employeeId).gte('transaction.date', periodStart).lte('transaction.date', periodEnd);
  if (error) return [];
  return (data || []).filter(r => r.transaction).sort((a, b) => {
    const dA = a.transaction?.date || '';
    const dB = b.transaction?.date || '';
    return dA < dB ? -1 : dA > dB ? 1 : 0;
  });
}

// Generate slip HTML for one employee
function generateSlipHTML({
  employee,
  payroll,
  items,
  period,
  branch,
  generatedBy,
  isApproved = false,
  tipsDetail = [],
  attendance = null
}) {
  const brand = getBrandForBranch(employee.branch_id);
  const periodStartFmt = fmtDate(period.period_start);
  const periodEndFmt = fmtDate(period.period_end);
  const generatedAt = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
        worker_count: Math.max(1, new Set((it.transaction.all_items || []).map(x => x.employee_id).filter(Boolean)).size),
        items: []
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
    const hsRemainder = isHS ? hsShareForThisEmployee - hsPortionPerItem * trx.items.length : 0;
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
            ${Number(it.price) === 0 && !(it.notes || '').toLowerCase().includes('paket') ? '<span class="tag tag-mauve">gratis</span>' : ''}
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

  ${tipsDetail && tipsDetail.length > 0 ? `
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
          ${payroll.is_prorated ? `Pro-rata: kerja ${payroll.actual_work_days} dari ${payroll.standard_work_days} hari${payroll.effective_absent_days > 0 ? ` (− ${payroll.effective_absent_days} hari absen)` : ''}` : `Potongan absen (${payroll.unpaid_leave_days} hari biasa${payroll.unpaid_leave_weekend_days > 0 ? ` + ${payroll.unpaid_leave_weekend_days} hari weekend × 2` : ''} = ${payroll.effective_absent_days} hari × ${fmtRp(Math.round(payroll.base_salary / payroll.standard_work_days))})`}
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
          ${payroll.is_prorated ? `Pro-rata + absen: dibayar ${payroll.meal_days_paid} dari ${payroll.standard_work_days} hari` : `Potongan absen ${payroll.meal_absent_days} hari (dibayar ${payroll.meal_days_paid} dari ${payroll.meal_days_base} hari)`}
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
        <td>Bonus${payroll.notes && !(payroll.extra_deduction > 0) ? ` (${escapeHtml(payroll.notes)})` : ''}</td>
        <td class="cell-num pos">+${fmtRp(payroll.bonus)}</td>
      </tr>
      ` : ''}
      ${payroll.extra_deduction > 0 || payroll.late_deduction > 0 ? `
      <tr class="breakdown-row-bold">
        <td>GAJI DITERIMA</td>
        <td class="cell-num">${fmtRp(payroll.total_before_deduction != null ? payroll.total_before_deduction : payroll.total + payroll.extra_deduction + (payroll.late_deduction || 0))}</td>
      </tr>
      ${(payroll.late_deduction || 0) > 0 ? `
      <tr>
        <td>
          Potongan Keterlambatan
          ${attendance && ((attendance.tolerance_over || 0) > 0 || (attendance.days_late || 0) > 0) ? `
          <span style="font-size: 10px; color: #6b5b6e;">
            (${[(attendance.tolerance_over || 0) > 0 ? `${attendance.tolerance_over} toleransi lewat jatah × ${fmtRp(attendance.tolerance_over_penalty_per_day || 5000)}` : null, (attendance.days_late || 0) > 0 ? `${attendance.days_late} hari telat × ${fmtRp(attendance.late_penalty_per_day || 15000)}` : null].filter(Boolean).join(' + ')})
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
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
  iframe.onload = () => {
    isReady = true;
  };
  // Fallback: also mark ready after a short delay
  setTimeout(() => {
    isReady = true;
  }, 800);

  // Close button
  document.getElementById('jbb-slip-close').onclick = () => overlay.remove();

  // Click outside iframe to close
  overlay.onclick = e => {
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
      const blob = new Blob([slipHtml], {
        type: 'text/html;charset=utf-8'
      });
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
  const {
    data,
    error
  } = await sb.from('my_dashboard_stats').select('*').single();
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    throw error;
  }
  return data;
}

// Get my recent transactions (3 months, privacy filter)
async function getMyRecentTransactions(limit = 100) {
  const {
    data,
    error
  } = await sb.from('my_employee_transactions').select('*').order('date', {
    ascending: false
  }).order('start_time', {
    ascending: false
  }).limit(limit);
  if (error) throw error;
  return data || [];
}

// Get my top services
async function getMyTopServices(months = 3) {
  const {
    data,
    error
  } = await sb.rpc('get_my_top_services', {
    p_months: months
  });
  if (error) throw error;
  return data || [];
}

// Get my top clients (first name only)
async function getMyTopClients(months = 3) {
  const {
    data,
    error
  } = await sb.rpc('get_my_top_clients', {
    p_months: months
  });
  if (error) throw error;
  return data || [];
}

// =====================================================
// TAHAP D — Admin View Employee Dashboard
// =====================================================

async function getEmployeeDashboardStatsAdmin(employeeId) {
  const {
    data,
    error
  } = await sb.rpc('get_employee_dashboard_stats', {
    p_employee_id: employeeId
  });
  if (error) throw error;
  return data?.[0] || null;
}
async function getEmployeeTransactionsAdmin(employeeId, limit = 200) {
  const {
    data,
    error
  } = await sb.rpc('get_employee_transactions_admin', {
    p_employee_id: employeeId,
    p_limit: limit
  });
  if (error) throw error;
  return data || [];
}
async function getEmployeeTopServicesAdmin(employeeId, months = 3) {
  const {
    data,
    error
  } = await sb.rpc('get_employee_top_services_admin', {
    p_employee_id: employeeId,
    p_months: months
  });
  if (error) throw error;
  return data || [];
}
async function getEmployeeTopClientsAdmin(employeeId, months = 3) {
  const {
    data,
    error
  } = await sb.rpc('get_employee_top_clients_admin', {
    p_employee_id: employeeId,
    p_months: months
  });
  if (error) throw error;
  return data || [];
}

// Get full employee data by ID (with branch info)
async function getEmployeeById(employeeId) {
  const {
    data,
    error
  } = await sb.from('employees').select('*, branch:branches(id, name)').eq('id', employeeId).single();
  if (error) throw error;
  return data;
}

// Get one payroll adjustment for an employee in a specific period
async function getPayrollAdjustment(employeeId, periodStart) {
  const {
    data,
    error
  } = await sb.from('payroll_adjustments').select('*').eq('employee_id', employeeId).eq('period_start', periodStart).maybeSingle();
  if (error) throw error;
  return data;
}

// Get annual leave balance for one employee in a year
async function getAnnualLeaveBalanceForEmployee(employeeId, year) {
  const {
    data,
    error
  } = await sb.from('annual_leave_balance').select('*').eq('employee_id', employeeId).eq('year', year).maybeSingle();
  if (error) throw error;
  return data;
}

// =====================================================
// TAHAP D — Slip Approval
// =====================================================

async function approveSlip(adjustmentId) {
  const {
    error
  } = await sb.rpc('approve_slip', {
    p_adjustment_id: adjustmentId
  });
  if (error) throw error;
}
async function unapproveSlip(adjustmentId) {
  const {
    error
  } = await sb.rpc('unapprove_slip', {
    p_adjustment_id: adjustmentId
  });
  if (error) throw error;
}

// =====================================================
// EDIT & DELETE TRANSACTION
// =====================================================

// Get full transaction detail (header + items + employee info)
async function getTransactionDetail(transactionId) {
  const {
    data,
    error
  } = await sb.from('transactions').select(`
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
    `).eq('id', transactionId).single();
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
  paymentMethod
}) {
  // First try RPC (for backward compatibility with older deployments)
  // If items have share_group_id/share_percent OR payment_method is set,
  // we need to bypass RPC and do direct ops since RPC signature is fixed.

  const needsDirectOps = paymentMethod != null || items.some(it => it.share_group_id || it.share_percent != null && it.share_percent !== 100);
  if (!needsDirectOps) {
    // Use existing RPC for simple updates
    const {
      data,
      error
    } = await sb.rpc('update_transaction_full', {
      p_transaction_id: transactionId,
      p_date: date,
      p_start_time: startTime,
      p_client_name: clientName,
      p_client_phone: clientPhone,
      p_is_overtime: isOvertime,
      p_is_home_service: isHomeService,
      p_home_service_fee: homeServiceFee || 0,
      p_notes: notes || null,
      p_items: items
    });
    if (error) throw error;
    return data;
  }

  // Direct ops (when payment_method or share fields are used)
  // Calculate totals
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + (Number(it.commission_amount) || 0), 0);
  const finalCommission = totalCommission + (isHomeService ? Number(homeServiceFee) || 0 : 0);

  // Get existing trx for branch_id
  const {
    data: existingTrx,
    error: fetchErr
  } = await sb.from('transactions').select('branch_id').eq('id', transactionId).single();
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
    notes: notes || null
  };
  if (paymentMethod != null) updatePayload.payment_method = paymentMethod;
  const {
    error: updateErr
  } = await sb.from('transactions').update(updatePayload).eq('id', transactionId);
  if (updateErr) throw updateErr;

  // Delete existing items
  const {
    error: delErr
  } = await sb.from('transaction_items').delete().eq('transaction_id', transactionId);
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
      share_percent: it.share_percent != null ? Number(it.share_percent) : 100
    };
  });
  const {
    error: insertErr
  } = await sb.from('transaction_items').insert(itemRows);
  if (insertErr) throw insertErr;
  return transactionId;
}

// Delete transaction (super_admin only)
async function deleteTransaction(transactionId) {
  const {
    error
  } = await sb.rpc('delete_transaction', {
    p_transaction_id: transactionId
  });
  if (error) throw error;
}

// Check if transaction has been edited (based on audit log)
async function checkTransactionEdited(transactionId) {
  const {
    data,
    error
  } = await sb.from('audit_log').select('id', {
    count: 'exact',
    head: true
  }).eq('table_name', 'transactions').eq('record_id', transactionId).eq('action', 'UPDATE');
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
    const {
      data: part,
      error
    } = await sb.from('audit_log').select('record_id, action, created_at').eq('table_name', 'transactions').in('action', ['INSERT', 'UPDATE']).in('record_id', batch);
    if (error) return new Set(); // gagal di tengah, lewati saja penanda edit
    if (part) data.push(...part);
  }
  const INPUT_WINDOW_MS = 15000;
  const insertTime = {};
  for (const r of data || []) {
    if (r.action === 'INSERT') {
      const t = new Date(r.created_at).getTime();
      if (!(r.record_id in insertTime) || t < insertTime[r.record_id]) insertTime[r.record_id] = t;
    }
  }
  const edited = new Set();
  for (const r of data || []) {
    if (r.action !== 'UPDATE') continue;
    const t = new Date(r.created_at).getTime();
    const ins = insertTime[r.record_id];
    // Real edit only if UPDATE happens meaningfully after the INSERT (or no INSERT in batch)
    if (ins == null || t - ins > INPUT_WINDOW_MS) {
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
        let {
          width,
          height
        } = img;
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
        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          resolve({
            blob,
            width,
            height
          });
        }, 'image/jpeg', quality);
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
  photoType,
  // 'before' or 'after'
  file,
  caption = null
}) {
  if (!file) throw new Error('File required');
  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error(`File terlalu besar (maks ${MAX_PHOTO_SIZE / 1024 / 1024} MB)`);
  }

  // Compress image
  const {
    blob,
    width,
    height
  } = await compressImage(file);

  // Generate storage path: {branch_id}/{yyyy-mm}/{transaction_id}_{photo_type}_{timestamp}.jpg
  const now = new Date();
  const yyyymm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const timestamp = Date.now();
  const storagePath = `${branchId}/${yyyymm}/${transactionId}_${photoType}_${timestamp}.jpg`;

  // Upload to storage
  const {
    error: uploadError
  } = await sb.storage.from(PHOTO_BUCKET).upload(storagePath, blob, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false
  });
  if (uploadError) throw uploadError;

  // Insert metadata to table
  const {
    data: insertData,
    error: insertError
  } = await sb.from('treatment_photos').insert({
    transaction_id: transactionId,
    branch_id: branchId,
    photo_type: photoType,
    storage_path: storagePath,
    file_size_bytes: blob.size,
    mime_type: 'image/jpeg',
    width,
    height,
    caption,
    uploaded_by: (await sb.auth.getUser()).data?.user?.id
  }).select().single();
  if (insertError) {
    // Rollback: delete the uploaded file
    await sb.storage.from(PHOTO_BUCKET).remove([storagePath]);
    throw insertError;
  }
  return insertData;
}

// Get photos for a transaction (with signed URLs)
async function getTransactionPhotos(transactionId) {
  const {
    data: photos,
    error
  } = await sb.from('treatment_photos').select('*').eq('transaction_id', transactionId).order('photo_type', {
    ascending: true
  });
  if (error) throw error;
  if (!photos || !photos.length) return [];

  // Generate signed URLs for each photo (valid for 1 hour)
  const photosWithUrls = await Promise.all(photos.map(async p => {
    const {
      data: signed
    } = await sb.storage.from(PHOTO_BUCKET).createSignedUrl(p.storage_path, 3600); // 1 hour
    return {
      ...p,
      signedUrl: signed?.signedUrl || null
    };
  }));
  return photosWithUrls;
}

// Delete a photo (storage + table)
async function deleteTreatmentPhoto(photoId) {
  // Get photo first to know storage_path
  const {
    data: photo,
    error: fetchError
  } = await sb.from('treatment_photos').select('storage_path').eq('id', photoId).single();
  if (fetchError) throw fetchError;

  // Delete from storage
  if (photo?.storage_path) {
    const {
      error: storageError
    } = await sb.storage.from(PHOTO_BUCKET).remove([photo.storage_path]);
    if (storageError) {
      console.warn('Storage delete failed (may already be gone):', storageError);
    }
  }

  // Delete from table
  const {
    error: deleteError
  } = await sb.from('treatment_photos').delete().eq('id', photoId);
  if (deleteError) throw deleteError;
}

// Mark photo as marketing approved (or unmark)
async function markPhotoMarketing(photoId, approved = true) {
  const {
    error
  } = await sb.rpc('mark_photo_marketing_approved', {
    p_photo_id: photoId,
    p_approved: approved
  });
  if (error) throw error;
}

// Generate a fresh signed URL for an existing photo (if expired)
async function refreshPhotoSignedUrl(storagePath, expiresIn = 3600) {
  const {
    data,
    error
  } = await sb.storage.from(PHOTO_BUCKET).createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
}

// Update transaction's photo_skip_reason (when skipping after photo)
async function updatePhotoSkipReason(transactionId, reason) {
  const {
    error
  } = await sb.from('transactions').update({
    photo_skip_reason: reason
  }).eq('id', transactionId);
  if (error) throw error;
}

// Get marketing-approved photos (for portfolio gallery)
async function listMarketingPhotos({
  branchId = null,
  limit = 50
} = {}) {
  let query = sb.from('photos_with_context').select('*').eq('is_marketing_approved', true).order('marketing_approved_at', {
    ascending: false
  }).limit(limit);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;

  // Add signed URLs
  if (data && data.length) {
    const withUrls = await Promise.all(data.map(async p => {
      const {
        data: signed
      } = await sb.storage.from(PHOTO_BUCKET).createSignedUrl(p.storage_path, 3600);
      return {
        ...p,
        signedUrl: signed?.signedUrl || null
      };
    }));
    return withUrls;
  }
  return [];
}

// Get all photos with context (for admin gallery)
async function listAllPhotos({
  branchId = null,
  photoType = null,
  limit = 100
} = {}) {
  let query = sb.from('photos_with_context').select('*').order('uploaded_at', {
    ascending: false
  }).limit(limit);
  if (branchId) query = query.eq('branch_id', branchId);
  if (photoType) query = query.eq('photo_type', photoType);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  if (data && data.length) {
    const withUrls = await Promise.all(data.map(async p => {
      const {
        data: signed
      } = await sb.storage.from(PHOTO_BUCKET).createSignedUrl(p.storage_path, 3600);
      return {
        ...p,
        signedUrl: signed?.signedUrl || null
      };
    }));
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
    paid_at: p.paid_at || null,
    // null = use default (current_date)
    created_by: createdBy || null
  }));
  const {
    data,
    error
  } = await sb.from('transaction_payments').insert(rows).select();
  if (error) throw error;
  return data || [];
}

// Get payments for a transaction
async function getTransactionPayments(transactionId) {
  const {
    data,
    error
  } = await sb.from('transaction_payments').select('*').eq('transaction_id', transactionId).order('is_dp', {
    ascending: false
  }) // DP first
  .order('paid_at', {
    ascending: true
  });
  if (error) throw error;
  return data || [];
}

// ===== TIPS helpers (Tahap 2) =====

// Insert tips for a transaction. tips: [{ employee_id, amount, payment_method }]
async function insertTransactionTips(transactionId, branchId, tips, createdBy) {
  if (!tips || !tips.length) return [];
  const rows = tips.filter(t => t.employee_id && Number(t.amount) > 0).map(t => ({
    transaction_id: transactionId,
    branch_id: branchId,
    employee_id: t.employee_id,
    amount: Number(t.amount) || 0,
    payment_method: t.payment_method || 'qris',
    created_by: createdBy || null
  }));
  if (!rows.length) return [];
  const {
    data,
    error
  } = await sb.from('transaction_tips').insert(rows).select();
  if (error) throw error;
  return data || [];
}

// Replace all tips for a transaction (used in edit)
async function replaceTransactionTips(transactionId, branchId, tips, createdBy) {
  const {
    error: delErr
  } = await sb.from('transaction_tips').delete().eq('transaction_id', transactionId);
  if (delErr) throw delErr;
  return insertTransactionTips(transactionId, branchId, tips, createdBy);
}

// Replace all payments for a transaction (used in edit)
async function replaceTransactionPayments(transactionId, branchId, payments, createdBy) {
  // Delete existing
  const {
    error: delErr
  } = await sb.from('transaction_payments').delete().eq('transaction_id', transactionId);
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
    if (!byMethod[m]) byMethod[m] = {
      payment_method: m,
      total_amount: 0,
      payment_count: 0,
      dp_count: 0,
      full_count: 0
    };
    byMethod[m].total_amount += Number(amount || 0);
    byMethod[m].payment_count += 1;
    if (isDp) byMethod[m].dp_count += 1;else byMethod[m].full_count += 1;
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
async function getPaymentFlowBreakdown({
  from,
  to,
  branchId = null
}) {
  // Join to parent transaction to get its date as a fallback for paid_at.
  let query = sb.from('transaction_payments').select('payment_method, amount, is_dp, paid_at, transaction:transactions(date)');
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  const rows = data || [];
  const byMethod = {};
  for (const p of rows) {
    // Effective date = paid_at if set, else parent transaction date
    const effDate = p.paid_at || p.transaction?.date || null;
    if (!effDate) continue; // no usable date → skip
    if (effDate < from || effDate > to) continue; // outside selected period

    const m = p.payment_method || 'cash';
    if (!byMethod[m]) {
      byMethod[m] = {
        payment_method: m,
        total_amount: 0,
        payment_count: 0,
        dp_count: 0,
        full_count: 0
      };
    }
    byMethod[m].total_amount += Number(p.amount || 0);
    byMethod[m].payment_count += 1;
    if (p.is_dp) byMethod[m].dp_count += 1;else byMethod[m].full_count += 1;
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
  other: 'Lainnya'
};

// Compute date range for a dashboard period preset
function getDashboardRange(preset, customFrom = null, customTo = null) {
  const today = new Date();
  const ymd = d => dateToYMD(d);
  switch (preset) {
    case 'today':
      return {
        from: ymd(today),
        to: ymd(today),
        grain: 'day'
      };
    case 'period':
      {
        // Payroll period 26 -> 25 (same logic as tab Gaji)
        const p = getPayrollPeriod(today);
        return {
          from: p.period_start,
          to: p.period_end,
          grain: 'day'
        };
      }
    case 'month':
      {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          from: ymd(start),
          to: ymd(end),
          grain: 'day'
        };
      }
    case 'year':
      {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31);
        return {
          from: ymd(start),
          to: ymd(end),
          grain: 'month'
        };
      }
    case 'custom':
      return {
        from: customFrom || ymd(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: customTo || ymd(today),
        grain: 'day'
      };
    default:
      {
        // default = payroll period 26 -> 25
        const p = getPayrollPeriod(today);
        return {
          from: p.period_start,
          to: p.period_end,
          grain: 'day'
        };
      }
  }
}

// Main dashboard data fetcher.
// branchId = null means ALL branches (super_admin).
async function getDashboardData({
  branchId = null,
  from,
  to,
  grain = 'day'
}) {
  const trxs = await getReportTransactions({
    from,
    to,
    branchId
  });
  const allItems = trxs.flatMap(t => (t.items || []).map(it => ({
    ...it,
    _trx: t
  })));

  // KPI numbers
  const totalTransactions = trxs.length;
  const totalOmset = trxs.reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const totalCommission = allItems.reduce((s, it) => s + Number(it.commission_amount || 0), 0) + trxs.filter(t => t.is_home_service).reduce((s, t) => s + Number(t.home_service_fee || 0), 0);

  // Treatment distribution (by category) — donut
  const byCategory = {};
  for (const it of allItems) {
    const cat = it.service_category || 'other';
    if (!byCategory[cat]) byCategory[cat] = {
      count: 0,
      revenue: 0
    };
    byCategory[cat].count += 1;
    byCategory[cat].revenue += Number(it.price || 0);
  }
  const treatmentDist = Object.entries(byCategory).map(([cat, v]) => ({
    key: cat,
    label: CATEGORY_LABELS[cat] || cat,
    count: v.count,
    revenue: v.revenue
  })).sort((a, b) => b.count - a.count);

  // Omset per category — bar
  const omsetByCategory = treatmentDist.map(d => ({
    label: d.label,
    value: d.revenue
  })).sort((a, b) => b.value - a.value);

  // Omset per branch — bar
  const byBranch = {};
  for (const t of trxs) {
    const bid = t.branch_id || 'unknown';
    const bname = t.branch?.name || bid;
    if (!byBranch[bid]) byBranch[bid] = {
      label: bname,
      value: 0
    };
    byBranch[bid].value += Number(t.total_amount || 0);
  }
  const omsetByBranch = Object.values(byBranch).sort((a, b) => b.value - a.value);

  // Trend line — per day or per month
  const trend = [];
  if (grain === 'month') {
    const byMonth = {};
    for (const t of trxs) {
      const m = (t.date || '').slice(0, 7);
      if (!byMonth[m]) byMonth[m] = {
        count: 0,
        omset: 0
      };
      byMonth[m].count += 1;
      byMonth[m].omset += Number(t.total_amount || 0);
    }
    const yr = (from || '').slice(0, 4);
    const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let mo = 1; mo <= 12; mo++) {
      const key = `${yr}-${String(mo).padStart(2, '0')}`;
      trend.push({
        label: MONTH_SHORT[mo - 1],
        count: byMonth[key]?.count || 0,
        omset: byMonth[key]?.omset || 0
      });
    }
  } else {
    const byDay = {};
    for (const t of trxs) {
      const d = t.date;
      if (!byDay[d]) byDay[d] = {
        count: 0,
        omset: 0
      };
      byDay[d].count += 1;
      byDay[d].omset += Number(t.total_amount || 0);
    }
    const start = new Date(from + 'T00:00:00');
    const end = new Date(to + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dateToYMD(d);
      trend.push({
        label: String(d.getDate()),
        fullDate: key,
        count: byDay[key]?.count || 0,
        omset: byDay[key]?.omset || 0
      });
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
    kpi: {
      totalTransactions,
      totalOmset,
      totalCommission,
      estPayroll
    },
    treatmentDist,
    omsetByCategory,
    omsetByBranch,
    trend
  };
}

// =====================================================
// EXPENSES (Uang Keluar) — Tahap 4
// =====================================================

// List expenses in a date range (and optional branch)
async function listExpenses({
  from,
  to,
  branchId = null
} = {}) {
  let query = sb.from('expenses').select('*, branch:branches(id, name)').order('date', {
    ascending: false
  }).order('created_at', {
    ascending: false
  });
  if (from) query = query.gte('date', from);
  if (to) query = query.lte('date', to);
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}

// Create an expense
async function createExpense({
  branchId,
  date,
  description,
  amount,
  paymentMethod,
  notes,
  createdBy
}) {
  const {
    data,
    error
  } = await sb.from('expenses').insert({
    branch_id: branchId,
    date: date || todayStr(),
    description: description?.trim(),
    amount: Number(amount) || 0,
    payment_method: paymentMethod || 'cash',
    notes: notes?.trim() || null,
    created_by: createdBy || null
  }).select().single();
  if (error) throw error;
  return data;
}

// Update an expense (admin only — enforced by RLS)
async function updateExpense(id, {
  date,
  description,
  amount,
  paymentMethod,
  notes
}) {
  const {
    data,
    error
  } = await sb.from('expenses').update({
    date,
    description: description?.trim(),
    amount: Number(amount) || 0,
    payment_method: paymentMethod || 'cash',
    notes: notes?.trim() || null,
    updated_at: new Date().toISOString()
  }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Delete an expense (admin only — enforced by RLS)
async function deleteExpense(id) {
  const {
    error
  } = await sb.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// Sum of tips grouped by payment method in a period
async function getTipsTotalByMethod({
  from,
  to,
  branchId = null
}) {
  let query = sb.from('transaction_tips').select('amount, payment_method, transactions!inner(date, branch_id)').gte('transactions.date', from).lte('transactions.date', to);
  if (branchId) query = query.eq('transactions.branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) return {};
  const byMethod = {};
  for (const t of data || []) {
    const m = t.payment_method || 'qris';
    byMethod[m] = (byMethod[m] || 0) + Number(t.amount || 0);
  }
  return byMethod;
}

// Total tips amount in a period (for reports)
async function getTipsTotal({
  from,
  to,
  branchId = null
}) {
  const byMethod = await getTipsTotalByMethod({
    from,
    to,
    branchId
  });
  return Object.values(byMethod).reduce((s, v) => s + v, 0);
}

// Compute cash balance per payment method for a period.
// balance = money IN (transaction payments + tips) − money OUT (expenses)
async function getCashBalance({
  from,
  to,
  branchId = null
}) {
  const trxs = await getReportTransactions({
    from,
    to,
    branchId
  });
  const flow = computePaymentFlow(trxs); // [{payment_method, total_amount, ...}]

  const byMethod = {};
  const ensure = m => {
    if (!byMethod[m]) byMethod[m] = {
      method: m,
      in: 0,
      out: 0,
      balance: 0
    };
    return byMethod[m];
  };
  for (const f of flow) ensure(f.payment_method).in += Number(f.total_amount || 0);

  // Tips money also enters our account (separate from omset)
  const tips = await getTipsTotalByMethod({
    from,
    to,
    branchId
  });
  for (const [m, amt] of Object.entries(tips)) ensure(m).in += amt;

  // Money OUT — expenses
  const expenses = await listExpenses({
    from,
    to,
    branchId
  });
  for (const e of expenses) ensure(e.payment_method || 'cash').out += Number(e.amount || 0);
  let totalIn = 0,
    totalOut = 0;
  for (const m of Object.values(byMethod)) {
    m.balance = m.in - m.out;
    totalIn += m.in;
    totalOut += m.out;
  }
  return {
    byMethod: Object.values(byMethod).sort((a, b) => b.balance - a.balance),
    totalIn,
    totalOut,
    totalBalance: totalIn - totalOut
  };
}

// Expose
// =====================================================
// ABSENSI (Attendance)
// =====================================================
const ATTENDANCE_BUCKET = 'attendance-photos';
// Jam kerja standar
const WORK_START = {
  hour: 9,
  minute: 30
}; // jam masuk 09:30 (persiapan sebelum toko buka 10:00)
const WORK_END = {
  hour: 19,
  minute: 30
}; // pulang 19:30
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
  latePenalty: 15000
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
  latePenalty: 15000
};

// Pilih aturan sesuai tanggal absensinya
function attendanceRuleFor(dateOrTs) {
  if (!dateOrTs) return RULE_NEW;
  const d = typeof dateOrTs === 'string' && dateOrTs.length >= 10 ? dateOrTs.slice(0, 10) : new Date(dateOrTs).toISOString().slice(0, 10);
  return d < ATTENDANCE_RULE_CHANGE_DATE ? RULE_OLD : RULE_NEW;
}

// Nilai bawaan (aturan yang berlaku sekarang), dipakai untuk tampilan umum
const GRACE_MINUTES = RULE_NEW.graceMinutes;
const LATE_TOLERANCE_MINUTES = RULE_NEW.toleranceEndMinutes;
// Toleransi pulang: pulang 19:15 sampai 19:30 masih dianggap wajar.
// Di bawah 19:15 dihitung pulang cepat, kecuali memang ambil lembur pagi.
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

// Status kedatangan: 'tepat' (sebelum 09:30), 'toleransi' (09:30 sampai 10:00),
// atau 'telat' (di atas 10:00). Dipakai untuk tampilan, bukan perhitungan gaji.
function getArrivalStatus(clockInAt) {
  if (!clockInAt) return null;
  const at = new Date(clockInAt);
  const rule = attendanceRuleFor(clockInAt);
  const start = new Date(at);
  start.setHours(WORK_START.hour, WORK_START.minute, 0, 0);
  const minutesAfterStart = Math.floor((at - start) / 60000);
  const lateMinutes = Math.max(0, minutesAfterStart - rule.toleranceEndMinutes);

  // Tiga tingkat, ambangnya mengikuti aturan yang berlaku pada tanggal itu
  let status = 'tepat';
  if (lateMinutes > 0) status = 'telat';else if (minutesAfterStart > rule.graceMinutes) status = 'toleransi';
  return {
    status,
    minutesAfterStart,
    lateMinutes,
    rule
  };
}

// Batas awal toleransi dalam format jam (misal "09:45")
function toleranceStartLabel() {
  const d = new Date();
  d.setHours(WORK_START.hour, WORK_START.minute + GRACE_MINUTES, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Batas akhir toleransi dalam format jam (untuk ditampilkan, misal "10:00")
function toleranceEndLabel() {
  const d = new Date();
  d.setHours(WORK_START.hour, WORK_START.minute + LATE_TOLERANCE_MINUTES, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
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
// atau 'cepat' (sebelum 19:15). Dipakai untuk tampilan.
function getDepartureStatus(clockOutAt) {
  if (!clockOutAt) return null;
  const at = new Date(clockOutAt);
  const sched = new Date(at);
  sched.setHours(WORK_END.hour, WORK_END.minute, 0, 0);
  const minutesBefore = Math.floor((sched - at) / 60000);
  const earlyMinutes = Math.max(0, minutesBefore - EARLY_LEAVE_TOLERANCE_MINUTES);
  let status = 'lewat';
  if (earlyMinutes > 0) status = 'cepat';else if (minutesBefore > 0) status = 'toleransi';
  return {
    status,
    minutesBefore,
    earlyMinutes
  };
}

// Batas awal toleransi pulang, misal "19:15"
function departureToleranceLabel() {
  const d = new Date();
  d.setHours(WORK_END.hour, WORK_END.minute - EARLY_LEAVE_TOLERANCE_MINUTES, 0, 0);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Ambil lokasi perangkat. TIDAK PERNAH menggagalkan absensi:
// kalau izin ditolak, sinyal lemah, atau kelamaan, hasilnya null.
function getDeviceLocation(timeoutMs = 8000) {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    let settled = false;
    const finish = val => {
      if (!settled) {
        settled = true;
        resolve(val);
      }
    };
    const timer = setTimeout(() => finish(null), timeoutMs + 500);
    navigator.geolocation.getCurrentPosition(pos => {
      clearTimeout(timer);
      finish({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy != null ? Math.round(pos.coords.accuracy) : null
      });
    }, () => {
      clearTimeout(timer);
      finish(null);
    }, {
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 30000
    });
  });
}

// Jarak antara dua titik koordinat dalam meter (rumus haversine)
function distanceMeters(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const R = 6371000; // radius bumi (meter)
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// Ambil titik & radius cabang (untuk cek jarak absensi)
async function getBranchGeo(branchId) {
  if (!branchId) return null;
  const {
    data,
    error
  } = await sb.from('branches').select('id, name, lat, lng, geofence_radius_m').eq('id', branchId).maybeSingle();
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
  const {
    error
  } = await sb.storage.from(ATTENDANCE_BUCKET).upload(storagePath, blob, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  return storagePath;
}

// Ambil absensi hari ini untuk satu cabang
async function getTodayAttendance(branchId = null) {
  let query = sb.from('attendance').select('*, employee:employees(id, full_name, job_title)').eq('date', todayDateStr());
  // branchId kosong berarti semua cabang (untuk super admin)
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}

// Ambil absensi satu rentang tanggal (untuk laporan & gaji)
async function listAttendance(branchId, from, to) {
  let query = sb.from('attendance').select('*, employee:employees(id, full_name, job_title)').gte('date', from).lte('date', to).order('date', {
    ascending: false
  });
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
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
// Melempar error dengan pesan jelas kalau izin ditolak, sinyal tidak dapat,
// atau posisinya jauh dari cabang. Dipakai sebelum foto diupload supaya
// tidak ada foto nyangkut kalau absennya ditolak.
async function requireLocationAtBranch(branchId) {
  const loc = await getDeviceLocation();
  if (!loc) {
    throw new Error('Lokasi tidak terbaca. Aktifkan izin lokasi untuk aplikasi ini di pengaturan HP, ' + 'pastikan GPS menyala, lalu coba lagi. Absen wajib dilakukan di salon.');
  }
  const geo = await getBranchGeo(branchId);
  // Cabang belum punya titik lokasi: lokasi tetap dicatat, tapi tidak bisa diperiksa
  if (!geo) return {
    loc,
    distance: null
  };
  const distance = distanceMeters(loc.lat, loc.lng, Number(geo.lat), Number(geo.lng));
  const radius = Number(geo.geofence_radius_m) || 200;
  if (distance != null && distance > radius) {
    const jarak = distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} meter`;
    throw new Error(`Absen ditolak. Kamu terdeteksi ${jarak} dari ${geo.name || 'salon'}. ` + `Absen hanya bisa dilakukan di area salon. Kalau kamu memang sedang di salon, ` + `tunggu sinyal GPS membaik lalu coba lagi.`);
  }
  return {
    loc,
    distance
  };
}

// Catat jam masuk (buat baris baru)
async function clockIn({
  employeeId,
  branchId,
  photoBlob,
  faceVerified = null
}) {
  const now = new Date();
  const date = todayDateStr();

  // Cegah dobel absen masuk
  const {
    data: existing
  } = await sb.from('attendance').select('id, clock_in_at').eq('employee_id', employeeId).eq('date', date).maybeSingle();
  if (existing?.clock_in_at) {
    throw new Error('Sudah absen masuk hari ini');
  }

  // Lokasi diperiksa lebih dulu. Kalau ditolak, foto tidak jadi diupload.
  const {
    loc,
    distance
  } = await requireLocationAtBranch(branchId);
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
    face_verified: faceVerified
  };
  if (existing?.id) {
    const {
      data,
      error
    } = await sb.from('attendance').update(payload).eq('id', existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const {
    data,
    error
  } = await sb.from('attendance').insert(payload).select().single();
  if (error) throw error;
  return data;
}

// Catat jam pulang (update baris hari ini)
async function clockOut({
  employeeId,
  branchId,
  photoBlob,
  faceVerified = null
}) {
  const now = new Date();
  const date = todayDateStr();
  const {
    data: existing,
    error: findErr
  } = await sb.from('attendance').select('id, clock_in_at, clock_out_at').eq('employee_id', employeeId).eq('date', date).maybeSingle();
  if (findErr) throw findErr;
  if (!existing || !existing.clock_in_at) throw new Error('Belum absen masuk hari ini');
  if (existing.clock_out_at) throw new Error('Sudah absen pulang hari ini');
  const {
    loc,
    distance
  } = await requireLocationAtBranch(branchId);
  const photoPath = photoBlob ? await uploadAttendancePhoto(photoBlob, branchId, employeeId, 'out') : null;
  const {
    data,
    error
  } = await sb.from('attendance').update({
    clock_out_at: now.toISOString(),
    clock_out_photo: photoPath,
    early_leave_minutes: calcEarlyLeaveMinutes(now),
    clock_out_lat: loc.lat,
    clock_out_lng: loc.lng,
    clock_out_accuracy: loc.accuracy ?? null,
    clock_out_distance_m: distance,
    face_verified: faceVerified
  }).eq('id', existing.id).select().single();
  if (error) throw error;
  return data;
}

// Link foto absensi (signed URL, berlaku 1 jam)
async function getAttendancePhotoUrl(storagePath, expiresIn = 3600) {
  if (!storagePath) return null;
  const {
    data,
    error
  } = await sb.storage.from(ATTENDANCE_BUCKET).createSignedUrl(storagePath, expiresIn);
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
  let query = sb.from('attendance').select('id, clock_in_photo, clock_out_photo').lt('date', batas).or('clock_in_photo.not.is.null,clock_out_photo.not.is.null');
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  const rows = data || [];
  if (!rows.length) return {
    deletedPhotos: 0,
    affectedRows: 0,
    batas
  };
  const paths = [];
  for (const r of rows) {
    if (r.clock_in_photo) paths.push(r.clock_in_photo);
    if (r.clock_out_photo) paths.push(r.clock_out_photo);
  }

  // Hapus file per 100 supaya tidak kelebihan beban
  for (let i = 0; i < paths.length; i += 100) {
    const batch = paths.slice(i, i + 100);
    try {
      await sb.storage.from(ATTENDANCE_BUCKET).remove(batch);
    } catch (e) {}
  }

  // Kosongkan penunjuk fotonya
  const ids = rows.map(r => r.id);
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    await sb.from('attendance').update({
      clock_in_photo: null,
      clock_out_photo: null
    }).in('id', batch);
  }
  return {
    deletedPhotos: paths.length,
    affectedRows: rows.length,
    batas
  };
}

// Berapa foto lama yang masih tersimpan (untuk ditampilkan sebelum dibersihkan)
async function countOldAttendancePhotos(branchId = null) {
  const periode = getPayrollPeriod();
  let query = sb.from('attendance').select('id, clock_in_photo, clock_out_photo').lt('date', periode.period_start).or('clock_in_photo.not.is.null,clock_out_photo.not.is.null');
  if (branchId) query = query.eq('branch_id', branchId);
  const {
    data,
    error
  } = await query;
  if (error) return {
    photos: 0,
    rows: 0,
    batas: periode.period_start
  };
  let photos = 0;
  for (const r of data || []) {
    if (r.clock_in_photo) photos++;
    if (r.clock_out_photo) photos++;
  }
  return {
    photos,
    rows: (data || []).length,
    batas: periode.period_start
  };
}

// Ringkasan absensi per karyawan dalam satu periode (untuk gaji)
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
        days_over_ten: 0,
        // datang di atas 10:00
        days_no_clockout: 0,
        _toleransi: [] // tanggal-tanggal yang masuk toleransi
      };
    }
    const s = byEmployee[id];
    if (r.clock_in_at) s.days_present += 1;
    if (r.clock_in_at && !r.clock_out_at) s.days_no_clockout += 1;
    const st = getArrivalStatus(r.clock_in_at);
    if (st?.status === 'telat') {
      s.days_over_ten += 1;
      s.total_late_minutes += st.lateMinutes;
    } else if (st?.status === 'toleransi') {
      s._toleransi.push(r.date);
    }
  }

  // Hitung jatah toleransi. Yang dipakai lebih dulu (tanggal awal) yang gratis.
  return Object.values(byEmployee).map(s => {
    const toleransi = s._toleransi.slice().sort();
    // Tarif mengikuti aturan yang berlaku di periode ini
    const rule = attendanceRuleFor(periodStart);
    const dipakai = Math.min(toleransi.length, rule.quota);
    const lewatJatah = Math.max(0, toleransi.length - rule.quota);
    const hariTelat = s.days_over_ten; // hanya yang datang di atas 10:00

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
      tolerance_start_label: `${String(WORK_START.hour).padStart(2, '0')}:${String(WORK_START.minute + rule.graceMinutes).padStart(2, '0')}`,
      tolerance_over_deduction: potonganToleransi,
      late_only_deduction: potonganTelat,
      late_deduction_suggested: potonganToleransi + potonganTelat
    };
  });
}

// =====================================================
// HOME SERVICE — pelacakan 4 tahap (mirip aplikasi ojol)
// =====================================================
const HS_STATUS = {
  pending: {
    label: 'Menunggu diterima',
    next: 'accepted',
    nextLabel: 'Terima & Berangkat',
    color: '#7a667e'
  },
  accepted: {
    label: 'Dalam perjalanan',
    next: 'working',
    nextLabel: 'Sampai & Mulai Kerjakan',
    color: '#b8893d'
  },
  working: {
    label: 'Sedang dikerjakan',
    next: 'done',
    nextLabel: 'Selesai Treatment',
    color: '#4a7c59'
  },
  done: {
    label: 'Selesai treatment',
    next: 'returned',
    nextLabel: 'Sudah Sampai Kembali',
    color: '#a8884a'
  },
  returned: {
    label: 'Selesai & sudah sampai',
    next: null,
    nextLabel: null,
    color: '#6b5b6e'
  },
  cancelled: {
    label: 'Dibatalkan',
    next: null,
    nextLabel: null,
    color: '#a85555'
  }
};
function hsStatusInfo(status) {
  return HS_STATUS[status] || HS_STATUS.pending;
}

// Orderan yang masih berjalan (belum selesai atau dibatalkan)
const HS_ACTIVE_STATUSES = ['pending', 'accepted', 'working', 'done'];
async function listHomeServiceJobs({
  branchId = null,
  employeeId = null,
  activeOnly = false,
  from = null,
  to = null
} = {}) {
  let query = sb.from('home_service_jobs').select('*, employee:employees(id, full_name, job_title), members:home_service_job_members(*, employee:employees(id, full_name, job_title))').order('created_at', {
    ascending: false
  });
  if (branchId) query = query.eq('branch_id', branchId);
  if (employeeId) query = query.eq('employee_id', employeeId);
  if (activeOnly) query = query.in('status', HS_ACTIVE_STATUSES);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  const {
    data,
    error
  } = await query;
  if (error) throw error;
  return data || [];
}
async function createHomeServiceJob(payload, employeeIds = []) {
  const createdBy = (await sb.auth.getUser()).data?.user?.id || null;
  const ids = employeeIds && employeeIds.length ? employeeIds : [payload.employee_id].filter(Boolean);
  if (!ids.length) throw new Error('Pilih minimal satu beautician');
  const {
    data,
    error
  } = await sb.from('home_service_jobs').insert({
    ...payload,
    employee_id: ids[0],
    status: 'pending',
    created_by: createdBy
  }).select().single();
  if (error) throw error;

  // Tiap beautician jadi anggota dengan tahapnya sendiri
  const rows = ids.map(eid => ({
    job_id: data.id,
    employee_id: eid,
    status: 'pending'
  }));
  const {
    error: mErr
  } = await sb.from('home_service_job_members').insert(rows);
  if (mErr) throw mErr;
  return data;
}

// Tambah beautician ke orderan yang sudah berjalan
async function addHomeServiceMember(jobId, employeeId) {
  const {
    data,
    error
  } = await sb.from('home_service_job_members').insert({
    job_id: jobId,
    employee_id: employeeId,
    status: 'pending'
  }).select('*, employee:employees(id, full_name, job_title)').single();
  if (error) throw error;
  await refreshJobStatus(jobId);
  return data;
}
async function removeHomeServiceMember(memberId, jobId) {
  const {
    error
  } = await sb.from('home_service_job_members').delete().eq('id', memberId);
  if (error) throw error;
  if (jobId) await refreshJobStatus(jobId);
}

// Urutan kemajuan tahap, untuk menentukan status keseluruhan orderan
const HS_ORDER = {
  pending: 0,
  accepted: 1,
  working: 2,
  done: 3,
  returned: 4
};

// Status orderan mengikuti anggota yang PALING TERTINGGAL.
// Jadi orderan belum dianggap selesai sebelum semua orang menandai sudah sampai.
function computeJobStatus(members) {
  const aktif = (members || []).filter(m => m.status !== 'cancelled');
  if (!aktif.length) return 'pending';
  let min = 99,
    minKey = 'pending';
  for (const m of aktif) {
    const v = HS_ORDER[m.status] ?? 0;
    if (v < min) {
      min = v;
      minKey = m.status;
    }
  }
  return minKey;
}
async function refreshJobStatus(jobId) {
  const {
    data
  } = await sb.from('home_service_job_members').select('status').eq('job_id', jobId);
  const next = computeJobStatus(data || []);
  await sb.from('home_service_jobs').update({
    status: next
  }).eq('id', jobId);
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
    working: ['started_at', 'started_lat', 'started_lng'],
    done: ['finished_at', 'finished_lat', 'finished_lng'],
    returned: ['returned_at', 'returned_lat', 'returned_lng']
  };
  const [atField, latField, lngField] = fieldByStatus[next];
  const {
    data,
    error
  } = await sb.from('home_service_job_members').update({
    status: next,
    [atField]: now,
    [latField]: loc?.lat ?? null,
    [lngField]: loc?.lng ?? null,
    ...extra
  }).eq('id', member.id).select('*, employee:employees(id, full_name, job_title)').single();
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
    working: ['started_at', 'started_lat', 'started_lng'],
    done: ['finished_at', 'finished_lat', 'finished_lng'],
    returned: ['returned_at', 'returned_lat', 'returned_lng']
  };
  const [atField, latField, lngField] = fieldByStatus[next];
  const patch = {
    status: next,
    [atField]: now,
    [latField]: loc?.lat ?? null,
    [lngField]: loc?.lng ?? null,
    ...extra
  };
  const {
    data,
    error
  } = await sb.from('home_service_jobs').update(patch).eq('id', jobId).select('*, employee:employees(id, full_name, job_title)').single();
  if (error) throw error;
  return data;
}
async function cancelHomeServiceJob(jobId, reason) {
  const {
    data,
    error
  } = await sb.from('home_service_jobs').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    cancel_reason: reason || null
  }).eq('id', jobId).select().single();
  if (error) throw error;
  return data;
}

// Hapus permanen satu orderan home service (untuk membersihkan data latihan).
// Hanya berhasil untuk admin, dibatasi oleh aturan keamanan database.
async function deleteHomeServiceJob(jobId) {
  const {
    error
  } = await sb.from('home_service_jobs').delete().eq('id', jobId);
  if (error) throw error;
}
async function linkHomeServiceTransaction(jobId, transactionId) {
  const {
    error
  } = await sb.from('home_service_jobs').update({
    transaction_id: transactionId
  }).eq('id', jobId);
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
  const j = Math.floor(menit / 60),
    m = menit % 60;
  return m > 0 ? `${j}j ${m}m` : `${j}j`;
}
Object.assign(window, {
  sb,
  SERVICES,
  JOB_TITLES,
  SALARY_OPTIONAL_TITLES,
  ROLES,
  CATEGORY_LABELS,
  getDashboardRange,
  getDashboardData,
  fmtRp,
  fmtRpOrDash,
  fmtNumber,
  fmtDate,
  fmtTime,
  todayStr,
  nowTimeStr,
  currentMonth,
  dateToYMD,
  startOfWeekMonday,
  endOfWeekSunday,
  DATE_PRESETS,
  isOvertime,
  isSalaryOptional,
  isSalaryOptionalFor,
  getServiceDef,
  calcCommission,
  getRoleLabel,
  toast,
  useToasts,
  loginWithEmail,
  logout,
  getCurrentSession,
  getMyProfile,
  listBranches,
  canAccessAllBranches,
  canManageBranch,
  listEmployees,
  updateEmployee,
  deactivateEmployee,
  reactivateEmployee,
  createEmployee,
  deleteEmployee,
  findClientByPhone,
  upsertClient,
  createTransaction,
  listRecentTransactions,
  listTransactionsByDateRange,
  getTodayStats,
  getMonthStats,
  getReportTransactions,
  aggregateReport,
  getPayrollPeriod,
  getPayrollPeriodForMonth,
  listRecentPayrollPeriods,
  listPayrollEligibleEmployees,
  getPeriodCommissionByEmployee,
  listPayrollAdjustments,
  upsertPayrollAdjustment,
  getAnnualLeaveBalances,
  calculatePayroll,
  listAuditLog,
  getAuditSummary,
  formatAuditDiff,
  getActionLabel,
  getActionColor,
  getActionBadge,
  getFieldLabel,
  formatAuditValue,
  exportToExcel,
  exportReportToExcel,
  exportPayrollToExcel,
  generateSlipHTML,
  getEmployeePeriodTransactions,
  getEmployeePeriodTips,
  printSlip,
  printMultipleSlips,
  getBrandForBranch,
  escapeHtml,
  LOGO_JBB,
  LOGO_VIALI,
  LOGO_JBB_PNG,
  LOGO_VIALI_PNG,
  logoSVG,
  logoSVGWidth,
  loadLogoImage,
  generateInvoiceHTML,
  printInvoice,
  drawInvoiceToCanvas,
  downloadInvoicePNG,
  getMyDashboardStats,
  getMyRecentTransactions,
  getMyTopServices,
  getMyTopClients,
  getEmployeeDashboardStatsAdmin,
  getEmployeeTransactionsAdmin,
  getEmployeeTopServicesAdmin,
  getEmployeeTopClientsAdmin,
  getEmployeeById,
  getPayrollAdjustment,
  getAnnualLeaveBalanceForEmployee,
  approveSlip,
  unapproveSlip,
  getTransactionDetail,
  updateTransactionFull,
  deleteTransaction,
  checkTransactionEdited,
  getEditedTransactionIds,
  // Tahap E - Photos
  // Tahap E - Photos
  PHOTO_BUCKET,
  compressImage,
  uploadTreatmentPhoto,
  getTransactionPhotos,
  deleteTreatmentPhoto,
  clockIn,
  clockOut,
  getTodayAttendance,
  listAttendance,
  getAttendancePhotoUrl,
  getAttendanceSummary,
  calcLateMinutes,
  calcEarlyLeaveMinutes,
  todayDateStr,
  isAttendanceExempt,
  attendanceExemptReason,
  NO_ATTENDANCE_TITLES,
  isAttendanceExemptByTitle,
  getArrivalStatus,
  toleranceEndLabel,
  toleranceStartLabel,
  LATE_TOLERANCE_MINUTES,
  GRACE_MINUTES,
  TOLERANCE_OVER_PENALTY,
  attendanceRuleFor,
  ATTENDANCE_RULE_CHANGE_DATE,
  getDepartureStatus,
  departureToleranceLabel,
  EARLY_LEAVE_TOLERANCE_MINUTES,
  TOLERANCE_QUOTA_PER_PERIOD,
  LATE_PENALTY_PER_DAY,
  cleanupOldAttendancePhotos,
  countOldAttendancePhotos,
  getDeviceLocation,
  mapsLinkFor,
  distanceMeters,
  getBranchGeo,
  distanceFromBranch,
  requireLocationAtBranch,
  listHomeServiceJobs,
  createHomeServiceJob,
  advanceHomeServiceJob,
  cancelHomeServiceJob,
  linkHomeServiceTransaction,
  deleteHomeServiceJob,
  hsStatusInfo,
  addHomeServiceMember,
  removeHomeServiceMember,
  advanceHomeServiceMember,
  computeJobStatus,
  refreshJobStatus,
  HS_ORDER,
  HS_STATUS,
  HS_ACTIVE_STATUSES,
  minutesSince,
  fmtDurasi,
  WORK_START,
  WORK_END,
  markPhotoMarketing,
  refreshPhotoSignedUrl,
  updatePhotoSkipReason,
  listMarketingPhotos,
  listAllPhotos,
  // Tahap F - Payment + Multi-employee
  PAYMENT_METHODS,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  // Tahap G - DP & Payment Flow
  insertTransactionPayments,
  getTransactionPayments,
  replaceTransactionPayments,
  insertTransactionTips,
  replaceTransactionTips,
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getCashBalance,
  getTipsTotal,
  getTipsTotalByMethod,
  getPaymentFlowBreakdown,
  computePaymentFlow
});

/* ============ components.jsx ============ */
// ===== Shared UI components =====
const {
  useState,
  useEffect,
  useRef
} = React;

// ----- Logo JBB / VIALI (inline SVG, warnanya bisa diatur) -----
function JBBLogo({
  height = 26,
  color = '#7a667e',
  brand = 'jbb'
}) {
  const lg = brand === 'viali' ? LOGO_VIALI : LOGO_JBB;
  const w = Math.round(height * lg.w / lg.h);
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: height,
    viewBox: '0 0 ' + lg.w + ' ' + lg.h,
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-label": brand === 'viali' ? 'VIALI' : 'JBB',
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    fill: color,
    d: lg.d
  }));
}

// ----- Topnav with branch switcher + hamburger -----
function TopNav({
  profile,
  page,
  setPage,
  tabs,
  currentBranchId,
  setCurrentBranchId,
  branches
}) {
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
  return /*#__PURE__*/React.createElement("nav", {
    className: "topnav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "topnav-inner"
  }, /*#__PURE__*/React.createElement("button", {
    className: "topnav-hamburger",
    onClick: () => setMobileMenuOpen(!mobileMenuOpen),
    "aria-label": "Menu",
    style: {
      display: 'none'
    } /* Shown only via CSS @media on mobile */
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, mobileMenuOpen ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "21",
    y2: "18"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "topnav-brand"
  }, /*#__PURE__*/React.createElement(JBBLogo, {
    height: 34,
    color: "#ffffff"
  })), /*#__PURE__*/React.createElement("div", {
    className: 'topnav-tabs' + (mobileMenuOpen ? ' mobile-open' : '')
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: 'topnav-tab' + (page === t.id ? ' active' : ''),
    onClick: () => handleTabClick(t.id)
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginLeft: 'auto'
    }
  }, isSuper && branches.length > 0 ? /*#__PURE__*/React.createElement("select", {
    className: "form-select topnav-branch-select",
    style: {
      padding: '6px 12px',
      fontSize: 12,
      fontWeight: 500,
      background: 'var(--mauve-tint)',
      border: 'none',
      borderRadius: 100,
      color: 'var(--plum)',
      minWidth: 140,
      cursor: 'pointer'
    },
    value: currentBranchId || '',
    onChange: e => setCurrentBranchId(e.target.value || null)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Semua Cabang"), branches.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.id,
    value: b.id
  }, b.name))) : currentBranch ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 14px',
      borderRadius: 100,
      background: 'var(--mauve-tint)',
      fontSize: 12,
      color: 'var(--plum)',
      fontWeight: 500
    }
  }, "📍 ", currentBranch.name) : null, /*#__PURE__*/React.createElement("div", {
    className: "topnav-user"
  }, /*#__PURE__*/React.createElement("span", {
    className: "topnav-user-name"
  }, profile.full_name), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-mauve",
    style: {
      padding: '1px 8px'
    }
  }, profile.role === 'super_admin' ? 'super' : profile.role === 'branch_admin' ? 'admin' : 'staff')), /*#__PURE__*/React.createElement("button", {
    className: "topnav-logout",
    onClick: () => logout()
  }, "Logout"))));
}

// ----- Page header -----
function PageHeader({
  title,
  sub,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "page-header",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, sub || 'Dashboard'), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, title)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, children));
}

// ----- Card -----
function Card({
  title,
  sub,
  children,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: sub ? 6 : 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      marginBottom: 0
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "card-sub",
    style: {
      marginBottom: 0,
      marginTop: 4
    }
  }, sub)), action), title && sub && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14
    }
  }), children);
}

// ----- Empty state -----
function Empty({
  title,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "empty-sub"
  }, sub));
}

// ----- Loader -----
function Loader({
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "loader-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "loader"
  }), text && /*#__PURE__*/React.createElement("div", null, text));
}

// ----- Toast stack -----
function ToastStack() {
  const items = useToasts();
  if (!items.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "toast-stack"
  }, items.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: 'toast toast-' + t.type
  }, t.message)));
}

// ----- Footer -----
function AppFooter() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "app-footer"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(JBBLogo, {
    height: 46,
    color: "#7a667e"
  })), "Management Program v.2.1", /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontSize: 11
    }
  }, "PT Wicaksono Berkarya Sejahtera"));
}

// ----- Form field -----
function Field({
  label,
  hint,
  error,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, label), children, hint && !error && /*#__PURE__*/React.createElement("div", {
    className: "form-hint"
  }, hint), error && /*#__PURE__*/React.createElement("div", {
    className: "form-error"
  }, error));
}

// ----- Metric card -----
function Metric({
  label,
  value,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "metric"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "metric-value"
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    className: "metric-sub"
  }, sub));
}

// ----- Branch badge -----
function BranchBadge({
  branch
}) {
  if (!branch) return null;
  const cls = branch.status === 'franchise' ? 'badge-gold' : 'badge-mauve';
  return /*#__PURE__*/React.createElement("span", {
    className: 'badge ' + cls,
    title: branch.city
  }, branch.name);
}
Object.assign(window, {
  JBBLogo,
  TopNav,
  PageHeader,
  Card,
  Empty,
  Loader,
  ToastStack,
  AppFooter,
  Field,
  Metric,
  BranchBadge
});

/* ============ pages.jsx ============ */
// ===== Pages: Login + Dashboards + Employees + Branches + Transactions =====
const {
  useState: useStateP,
  useEffect: useEffectP,
  useMemo: useMemoP,
  useRef: useRefP
} = React;

// ----- Login page -----
function LoginPage({
  onLoggedIn
}) {
  const [email, setEmail] = useStateP('');
  const [password, setPassword] = useStateP('');
  const [loading, setLoading] = useStateP(false);
  const [error, setError] = useStateP('');
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast('Selamat datang!', 'success');
      onLoggedIn();
    } catch (err) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "auth-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-logo"
  }, /*#__PURE__*/React.createElement(JBBLogo, {
    height: 64,
    color: "#7a667e"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "auth-title"
  }, "Management Program"), /*#__PURE__*/React.createElement("p", {
    className: "auth-desc"
  }, "Anda keluarga besar JBB / VIALI? Silahkan Masuk"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Email"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "nama@jbb.local",
    required: true,
    autoComplete: "email"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password",
    error: error
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "••••••••",
    required: true,
    autoComplete: "current-password"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary btn-lg btn-block",
    disabled: loading
  }, loading ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : 'Masuk')), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 24,
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, "Lupa password? Hubungi admin JBB.")));
}

// ----- Admin Dashboard -----
// ===== Chart color palette (JBB design tokens) =====
const CHART_COLORS = ['#7a667e', '#c9a961', '#4a7c59', '#a85555', '#3d2e44', '#b8893d'];

// ----- Donut chart (SVG) -----
function DonutChart({
  data,
  valueKey = 'count',
  size = 200
}) {
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
  if (total === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 13,
        padding: '40px 0'
      }
    }, "Belum ada data");
  }
  const cx = size / 2,
    cy = size / 2;
  const r = size / 2 - 10;
  const inner = r * 0.58;
  let angle = -Math.PI / 2; // start at top
  const segs = data.map((d, i) => {
    const val = Number(d[valueKey]) || 0;
    const frac = val / total;
    const a0 = angle;
    const a1 = angle + frac * 2 * Math.PI;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0),
      y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1),
      y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1),
      yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0),
      yi0 = cy + inner * Math.sin(a0);
    const path = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${inner} ${inner} 0 ${large} 0 ${xi0} ${yi0} Z`;
    return {
      path,
      color: CHART_COLORS[i % CHART_COLORS.length],
      pct: Math.round(frac * 100)
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`
  }, segs.map((s, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: s.path,
    fill: s.color
  })), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy - 6,
    textAnchor: "middle",
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 28,
      fontWeight: 600,
      fill: 'var(--plum-deep)'
    }
  }, total), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + 14,
    textAnchor: "middle",
    style: {
      fontSize: 10,
      fill: 'var(--muted)'
    }
  }, "total treatment")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 140
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 3,
      background: CHART_COLORS[i % CHART_COLORS.length],
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: 'var(--plum)'
    }
  }, d.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--plum-deep)'
    }
  }, d[valueKey]), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: 11,
      width: 34,
      textAlign: 'right'
    }
  }, segs[i].pct, "%")))));
}

// ----- Horizontal bar chart (SVG) -----
function BarChart({
  data,
  isRupiah = true,
  color = '#c9a961'
}) {
  if (!data.length || data.every(d => !d.value)) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 13,
        padding: '40px 0'
      }
    }, "Belum ada data");
  }
  const max = Math.max(...data.map(d => d.value), 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, data.map((d, i) => {
    const pct = d.value / max * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--plum)',
        fontWeight: 500
      }
    }, d.label), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--plum-deep)',
        fontWeight: 600,
        fontFamily: isRupiah ? "'JetBrains Mono', monospace" : 'inherit',
        fontSize: 12
      }
    }, isRupiah ? fmtRp(d.value) : d.value)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 14,
        background: 'var(--mauve-tint)',
        borderRadius: 7,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct}%`,
        height: '100%',
        background: color,
        borderRadius: 7,
        transition: 'width 0.4s ease'
      }
    })));
  }));
}

// ----- Line/area chart (SVG) -----
function LineChart({
  data,
  height = 220
}) {
  if (!data.length) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 13,
        padding: '40px 0'
      }
    }, "Belum ada data");
  }
  const W = 760,
    H = height,
    padL = 44,
    padR = 16,
    padT = 20,
    padB = 30;
  const plotW = W - padL - padR,
    plotH = H - padT - padB;
  const maxOmset = Math.max(...data.map(d => d.omset), 1);
  // round max up to a nice number
  const niceMax = Math.ceil(maxOmset / 100000) * 100000 || 100000;
  const n = data.length;
  const xFor = i => padL + (n === 1 ? plotW / 2 : i / (n - 1) * plotW);
  const yFor = v => padT + plotH - v / niceMax * plotH;
  const pts = data.map((d, i) => ({
    x: xFor(i),
    y: yFor(d.omset),
    d
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  // y-axis ticks (4 steps)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    v: niceMax * f,
    y: yFor(niceMax * f)
  }));
  // x labels: show subset to avoid crowding
  const labelStep = Math.ceil(n / 12);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "100%",
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: "xMidYMid meet",
    style: {
      minWidth: 420
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "areaGrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#7a667e",
    stopOpacity: "0.25"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#7a667e",
    stopOpacity: "0"
  }))), ticks.map((t, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: padL,
    y1: t.y,
    x2: W - padR,
    y2: t.y,
    stroke: "var(--line)",
    strokeWidth: "1",
    strokeDasharray: "3 3"
  }), /*#__PURE__*/React.createElement("text", {
    x: padL - 6,
    y: t.y + 3,
    textAnchor: "end",
    style: {
      fontSize: 9,
      fill: 'var(--muted)'
    }
  }, t.v >= 1000000 ? (t.v / 1000000).toFixed(t.v >= 10000000 ? 0 : 1) + 'jt' : t.v >= 1000 ? Math.round(t.v / 1000) + 'rb' : Math.round(t.v)))), /*#__PURE__*/React.createElement("path", {
    d: areaPath,
    fill: "url(#areaGrad)"
  }), /*#__PURE__*/React.createElement("path", {
    d: linePath,
    fill: "none",
    stroke: "#7a667e",
    strokeWidth: "2.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), pts.map((p, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: p.x,
    cy: p.y,
    r: n > 20 ? 2 : 3.5,
    fill: "#c9a961",
    stroke: "#fff",
    strokeWidth: "1"
  }, /*#__PURE__*/React.createElement("title", null, `${p.d.label}: ${fmtRp(p.d.omset)} (${p.d.count} trx)`))), data.map((d, i) => (i % labelStep === 0 || i === n - 1) && /*#__PURE__*/React.createElement("text", {
    key: i,
    x: xFor(i),
    y: H - 10,
    textAnchor: "middle",
    style: {
      fontSize: 9,
      fill: 'var(--muted)'
    }
  }, d.label))));
}
function AdminDashboard({
  profile,
  setPage,
  currentBranchId,
  branches
}) {
  const isSuper = profile.role === 'super_admin';
  const [period, setPeriod] = useStateP('period');
  const [customFrom, setCustomFrom] = useStateP('');
  const [customTo, setCustomTo] = useStateP('');
  const [data, setData] = useStateP(null);
  const [loading, setLoading] = useStateP(true);
  const currentBranch = branches.find(b => b.id === currentBranchId);
  // employee/branch_admin always scoped to own branch; super can see all (null) or one
  const filterBranch = isSuper ? currentBranchId : profile.branch_id;
  const scopeLabel = filterBranch ? branches.find(b => b.id === filterBranch)?.name || '' : 'Semua Cabang (JBB Group)';
  async function load() {
    setLoading(true);
    try {
      const range = getDashboardRange(period, customFrom, customTo);
      const d = await getDashboardData({
        branchId: filterBranch,
        from: range.from,
        to: range.to,
        grain: range.grain
      });
      setData(d);
    } catch (err) {
      console.error('Dashboard load error:', err);
      toast('Gagal memuat dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    load();
  }, [currentBranchId, period, customFrom, customTo]);
  const range = getDashboardRange(period, customFrom, customTo);
  const showBranchChart = !filterBranch; // only meaningful when viewing all branches

  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: isSuper ? 'Dashboard JBB Group' : 'Dashboard Cabang',
    sub: `Halo, ${profile.full_name}`
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--plum)'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Scope:"), " ", scopeLabel, isSuper && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: 12
    }
  }, " · ganti cabang dari dropdown pojok kanan atas")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, "📅 ", fmtDate(range.from), " — ", fmtDate(range.to))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, [{
    value: 'today',
    label: 'Hari Ini'
  }, {
    value: 'period',
    label: 'Periode (26–25)'
  }, {
    value: 'month',
    label: 'Bulan Ini'
  }, {
    value: 'year',
    label: 'Tahun Ini'
  }, {
    value: 'custom',
    label: '📅 Custom'
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.value,
    type: "button",
    className: 'btn btn-sm ' + (period === p.value ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPeriod(p.value)
  }, p.label))), period === 'custom' && /*#__PURE__*/React.createElement("div", {
    className: "form-row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Dari Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customFrom,
    onChange: e => setCustomFrom(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sampai Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customTo,
    onChange: e => setCustomTo(e.target.value)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid"
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Total Transaksi",
    value: loading ? '...' : data?.kpi.totalTransactions ?? 0,
    sub: loading ? 'memuat...' : 'periode ini'
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Total Omset",
    value: loading ? '...' : fmtRp(data?.kpi.totalOmset),
    sub: "periode ini"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Total Komisi",
    value: loading ? '...' : fmtRp(data?.kpi.totalCommission),
    sub: "treatment + HS"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Estimasi Payroll",
    value: loading ? '...' : fmtRp(data?.kpi.estPayroll),
    sub: "gaji pokok + komisi"
  })), loading ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat grafik..."
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Jenis Treatment",
    sub: "Distribusi treatment di periode ini"
  }, /*#__PURE__*/React.createElement(DonutChart, {
    data: data.treatmentDist,
    valueKey: "count"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Omset per Kategori",
    sub: "Pendapatan per jenis layanan"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: data.omsetByCategory,
    isRupiah: true,
    color: "#c9a961"
  }))), showBranchChart && /*#__PURE__*/React.createElement(Card, {
    title: "Omset per Cabang",
    sub: "Perbandingan antar cabang JBB Group"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: data.omsetByBranch,
    isRupiah: true,
    color: "#7a667e"
  })), /*#__PURE__*/React.createElement(Card, {
    title: range.grain === 'month' ? 'Tren Omset Bulanan' : 'Tren Omset Harian',
    sub: range.grain === 'month' ? 'Per bulan sepanjang tahun' : 'Per hari di periode ini'
  }, /*#__PURE__*/React.createElement(LineChart, {
    data: data.trend
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Aksi Cepat"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setPage('newTransaction')
  }, "+ Input Transaksi"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setPage('transactions')
  }, "Lihat Transaksi"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setPage('employees')
  }, "Karyawan"), isSuper && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setPage('branches')
  }, "Lihat Semua Cabang"))));
}

// ----- Branches list page -----
function BranchesPage() {
  const [branches, setBranches] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  async function load() {
    setLoading(true);
    try {
      setBranches(await listBranches());
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    load();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Cabang",
    sub: "JBB Group"
  }), /*#__PURE__*/React.createElement(Card, null, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !branches.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada cabang"
  }) : /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Kode"), /*#__PURE__*/React.createElement("th", null, "Nama"), /*#__PURE__*/React.createElement("th", null, "Kota"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Profit Sharing"), /*#__PURE__*/React.createElement("th", null, "WhatsApp"), /*#__PURE__*/React.createElement("th", null, "Berdiri"))), /*#__PURE__*/React.createElement("tbody", null, branches.map(b => /*#__PURE__*/React.createElement("tr", {
    key: b.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, b.id)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, b.name), /*#__PURE__*/React.createElement("td", null, b.city), /*#__PURE__*/React.createElement("td", null, b.status === 'inhouse' ? /*#__PURE__*/React.createElement("span", {
    className: "badge badge-mauve"
  }, "In-house") : /*#__PURE__*/React.createElement("span", {
    className: "badge badge-gold"
  }, "Franchise")), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, b.status === 'franchise' ? `${b.profit_sharing_pct}%` : '—'), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--muted)'
    }
  }, b.whatsapp), /*#__PURE__*/React.createElement("td", null, b.established_year))))))));
}

// =====================================================
// NEW TRANSACTION PAGE
// =====================================================
function NewTransactionPage({
  profile,
  currentBranchId,
  branches,
  setPage
}) {
  const isSuper = profile.role === 'super_admin';
  const effectiveBranchId = useMemoP(() => {
    if (profile.role === 'super_admin') {
      return currentBranchId || profile.branch_id;
    }
    return profile.branch_id;
  }, [profile, currentBranchId]);
  const effectiveBranch = branches.find(b => b.id === effectiveBranchId);
  const [date, setDate] = useStateP(todayStr());
  const [startTime, setStartTime] = useStateP(nowTimeStr());
  const [clientName, setClientName] = useStateP('');
  const [clientPhone, setClientPhone] = useStateP('');
  const [foundClient, setFoundClient] = useStateP(null);
  const [isHomeService, setIsHomeService] = useStateP(false);
  const [homeServiceFee, setHomeServiceFee] = useStateP('');
  const [notes, setNotes] = useStateP('');
  const [paymentMethod, setPaymentMethod] = useStateP('cash');
  // DP states
  const [hasDp, setHasDp] = useStateP(false);
  const [dpAmount, setDpAmount] = useStateP('');
  const [dpMethod, setDpMethod] = useStateP('qris');
  const [dpDate, setDpDate] = useStateP(todayStr());
  // Tips states (Tahap 2) — tips per beautician (transfer/qris only)
  const [hasTips, setHasTips] = useStateP(false);
  const [tips, setTips] = useStateP([{
    employee_id: '',
    amount: '',
    payment_method: 'qris'
  }]);
  // shareWith: array of additional employee_ids (multi-employee support)
  // share_percents: parallel array of percentages [main, ...sharedWith]
  const [items, setItems] = useStateP([{
    employee_id: '',
    service_name: '',
    price: '',
    fixed_commission: '',
    notes: '',
    share_with: [],
    share_percents: [100],
    discount_type: 'none',
    discount_value: '',
    has_complaint: false,
    complaint_note: ''
  }]);
  const [employees, setEmployees] = useStateP([]);
  const [loadingEmployees, setLoadingEmployees] = useStateP(true);
  const [submitting, setSubmitting] = useStateP(false);
  const [savedTransactionId, setSavedTransactionId] = useStateP(null);
  const [showPhotoUploadAfter, setShowPhotoUploadAfter] = useStateP(false);
  const [showInvoicePrompt, setShowInvoicePrompt] = useStateP(false);
  const isOT = isOvertime(startTime);
  const [hsJobId, setHsJobId] = useStateP(null);
  // Menandai transaksi ini berasal dari home service, supaya setelah simpan
  // bisa langsung diarahkan balik untuk menyelesaikan tahap terakhir
  const [hsReturnPending, setHsReturnPending] = useStateP(false);
  // Layar setelah simpan dibagi dua langkah: cetak nota dulu, baru kembali
  const [postSaveStep, setPostSaveStep] = useStateP('invoice');

  // Isi otomatis kalau datang dari halaman Home Service setelah treatment selesai
  useEffectP(() => {
    try {
      const raw = sessionStorage.getItem('jbb_hs_prefill');
      if (!raw) return;
      sessionStorage.removeItem('jbb_hs_prefill');
      const pre = JSON.parse(raw);
      if (pre.client_name) setClientName(pre.client_name);
      if (pre.client_phone) setClientPhone(pre.client_phone);
      setIsHomeService(true);
      if (pre.job_id) setHsJobId(pre.job_id);
      if (pre.employee_id) {
        setItems(prev => {
          const next = [...prev];
          next[0] = {
            ...next[0],
            employee_id: pre.employee_id
          };
          return next;
        });
      }
      toast('Data client dari home service sudah diisi', 'success');
    } catch (e) {}
  }, []);
  useEffectP(() => {
    if (!effectiveBranchId) return;
    setLoadingEmployees(true);
    listEmployees(effectiveBranchId, true).then(setEmployees).catch(err => toast('Gagal: ' + err.message, 'error')).finally(() => setLoadingEmployees(false));
  }, [effectiveBranchId]);
  useEffectP(() => {
    if (!clientPhone || clientPhone.length < 8) {
      setFoundClient(null);
      return;
    }
    const timer = setTimeout(async () => {
      const c = await findClientByPhone(effectiveBranchId, clientPhone);
      if (c) {
        setFoundClient(c);
        if (!clientName) setClientName(c.full_name);
      } else {
        setFoundClient(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [clientPhone, effectiveBranchId]);
  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => i === idx ? {
      ...it,
      ...patch
    } : it));
  }
  function addItem() {
    setItems(prev => [...prev, {
      employee_id: '',
      service_name: '',
      price: '',
      fixed_commission: '',
      notes: '',
      share_with: [],
      share_percents: [100],
      discount_type: 'none',
      discount_value: '',
      has_complaint: false,
      complaint_note: ''
    }]);
  }
  function removeItem(idx) {
    setItems(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  }

  // Compute discount amount for an item based on type (percent/nominal) and original price
  function getItemDiscount(item) {
    const orig = Number(item.price) || 0;
    if (!item.discount_type || item.discount_type === 'none' || !item.discount_value) return 0;
    const val = Number(item.discount_value) || 0;
    if (val <= 0) return 0;
    if (item.discount_type === 'percent') {
      return Math.round(orig * Math.min(val, 100) / 100);
    }
    // nominal
    return Math.min(Math.round(val), orig); // can't discount more than price
  }

  // Effective (discounted) price — this is what commission & omset use
  function getItemEffectivePrice(item) {
    const orig = Number(item.price) || 0;
    return Math.max(0, orig - getItemDiscount(item));
  }
  function getItemCommission(item) {
    if (!item.service_name) return {
      rate: 0,
      amount: 0,
      type: 'percent'
    };

    // Client complaint: commission is forfeited for this treatment.
    // Revenue (omset) is unaffected — the client still paid.
    if (item.has_complaint) {
      return {
        rate: 0,
        amount: 0,
        type: 'percent'
      };
    }
    const svc = getServiceDef(item.service_name);
    const effectivePrice = getItemEffectivePrice(item);

    // If commission_override has value (HS mode), use it directly (for percent type only)
    // For fixed_amount (Sulam Alis), always use fixed_commission as before
    if (svc?.commission_type === 'percent' && item.commission_override !== undefined && item.commission_override !== null && item.commission_override !== '') {
      return {
        rate: 0,
        amount: Number(item.commission_override) || 0,
        type: 'percent_manual'
      };
    }
    return calcCommission({
      serviceName: item.service_name,
      price: effectivePrice,
      fixedAmount: Number(item.fixed_commission) || 0,
      isOT,
      branchId: effectiveBranchId
    });
  }
  const totalAmount = items.reduce((sum, it) => sum + getItemEffectivePrice(it), 0);
  const totalDiscount = items.reduce((sum, it) => sum + getItemDiscount(it), 0);
  const totalCommission = items.reduce((sum, it) => sum + getItemCommission(it).amount, 0);
  // Distinct beauticians on this transaction (main + join partners).
  // The home service fee is shared equally between them.
  const distinctWorkers = (() => {
    const ids = new Set();
    for (const it of items) {
      if (it.employee_id) ids.add(it.employee_id);
      for (const sid of it.share_with || []) if (sid) ids.add(sid);
    }
    return Math.max(1, ids.size);
  })();
  const hsPerWorker = isHomeService ? Math.round((Number(homeServiceFee) || 0) / distinctWorkers) : 0;
  const totalForEmployee = totalCommission + (isHomeService ? Number(homeServiceFee) || 0 : 0);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!effectiveBranchId) {
      toast('Cabang belum ditentukan', 'error');
      return;
    }
    if (!clientName.trim()) {
      toast('Nama pelanggan wajib diisi', 'error');
      return;
    }
    if (!items.length || items.some(it => !it.employee_id || !it.service_name || it.price === '' || it.price == null || Number(it.price) < 0)) {
      toast('Lengkapi semua item', 'error');
      return;
    }
    // Validate: shared_with all picked, percents sum to 100
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const allEmps = [it.employee_id, ...(it.share_with || [])];
      if (new Set(allEmps).size !== allEmps.length) {
        toast(`Treatment #${i + 1}: karyawan tidak boleh sama`, 'error');
        return;
      }
      if (allEmps.some(e => !e)) {
        toast(`Treatment #${i + 1}: semua karyawan harus dipilih`, 'error');
        return;
      }
      if (allEmps.length > 1) {
        const total = (it.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
        if (Math.abs(total - 100) > 0.01) {
          toast(`Treatment #${i + 1}: total persentase harus 100% (sekarang ${total}%)`, 'error');
          return;
        }
      }
    }
    for (const it of items) {
      const svc = getServiceDef(it.service_name);
      // Komisi 0 diperbolehkan (misal retouch yang sudah termasuk paket),
      // yang ditolak hanya kolom yang benar-benar dibiarkan kosong.
      if (svc?.commission_type === 'fixed_amount' && (it.fixed_commission === '' || it.fixed_commission == null)) {
        toast('Komisi wajib diisi. Isi 0 kalau sudah termasuk paket.', 'error');
        return;
      }
    }
    if (isHomeService && !homeServiceFee) {
      toast('Biaya home service wajib diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Expand items: shared treatments become multiple rows with same share_group_id
      const itemsPayload = [];
      for (const it of items) {
        const allEmps = [it.employee_id, ...(it.share_with || [])];
        const isShared = allEmps.length > 1;
        const originalPrice = Number(it.price) || 0;
        const itemDiscount = getItemDiscount(it);
        const effectivePrice = getItemEffectivePrice(it); // price after discount
        const totalPrice = effectivePrice; // commission & omset use discounted price
        const com = getItemCommission(it);
        const dbCommissionType = com.type === 'percent_manual' ? 'percent' : com.type;
        const hasDiscount = it.discount_type && it.discount_type !== 'none' && itemDiscount > 0;

        // Generate share_group_id once per treatment (only used if shared)
        const shareGroupId = isShared ? crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
        }) : null;
        allEmps.forEach((empId, idx) => {
          const sharePercent = isShared ? Number(it.share_percents[idx] || 0) : 100;
          const splitPrice = Math.round(totalPrice * sharePercent / 100);
          // Split original price & discount proportionally too (for invoice display)
          const splitOriginal = Math.round(originalPrice * sharePercent / 100);
          const splitDiscount = Math.round(itemDiscount * sharePercent / 100);

          // For shared: recalculate commission based on split price
          let splitCommissionAmount;
          if (isShared) {
            if (com.type === 'fixed_amount') {
              splitCommissionAmount = Math.round(com.amount * sharePercent / 100);
            } else {
              splitCommissionAmount = Math.round(splitPrice * com.rate / 100);
            }
          } else {
            splitCommissionAmount = com.amount;
          }
          itemsPayload.push({
            employee_id: empId,
            service_name: it.service_name,
            price: splitPrice,
            commission_type: dbCommissionType,
            commission_rate: com.rate,
            commission_amount: splitCommissionAmount,
            notes: it.notes || null,
            share_group_id: shareGroupId,
            share_percent: sharePercent,
            original_price: hasDiscount ? splitOriginal : splitPrice,
            discount_type: hasDiscount ? it.discount_type : null,
            discount_value: hasDiscount ? Number(it.discount_value) || 0 : null,
            discount_amount: hasDiscount ? splitDiscount : 0,
            has_complaint: !!it.has_complaint,
            complaint_note: it.has_complaint ? it.complaint_note || null : null
          });
        });
      }

      // Build payments array based on hasDp (use discounted prices)
      const grandTotal = items.reduce((sum, it) => sum + getItemEffectivePrice(it), 0) + (isHomeService ? Number(homeServiceFee) || 0 : 0);
      let paymentsArr = null;
      if (hasDp) {
        const dp = Number(dpAmount) || 0;
        const sisa = grandTotal - dp;
        if (dp <= 0) {
          toast('Jumlah DP wajib diisi (> 0)', 'error');
          setSubmitting(false);
          return;
        }
        if (dp >= grandTotal) {
          toast('DP tidak boleh ≥ total transaksi', 'error');
          setSubmitting(false);
          return;
        }
        if (!dpDate) {
          toast('Tanggal DP wajib diisi', 'error');
          setSubmitting(false);
          return;
        }
        paymentsArr = [{
          method: dpMethod,
          amount: dp,
          is_dp: true,
          paid_at: dpDate
        }, {
          method: paymentMethod,
          amount: sisa,
          is_dp: false,
          paid_at: date
        }].filter(p => Number(p.amount) > 0);
      }

      // Build tips array (only if hasTips). Validate each tip.
      let tipsArr = null;
      if (hasTips) {
        const validTips = tips.filter(t => t.employee_id && Number(t.amount) > 0);
        // Check: if user toggled tips on but filled nothing meaningful
        for (const t of tips) {
          if (t.employee_id && (!t.amount || Number(t.amount) <= 0) || !t.employee_id && Number(t.amount) > 0) {
            toast('Tips: pastikan setiap baris ada beautician DAN jumlah > 0', 'error');
            setSubmitting(false);
            return;
          }
        }
        if (validTips.length > 0) {
          tipsArr = validTips.map(t => ({
            employee_id: t.employee_id,
            amount: Number(t.amount),
            payment_method: t.payment_method || 'qris'
          }));
        }
      }
      const newTrx = await createTransaction({
        branchId: effectiveBranchId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date,
        startTime,
        isHomeService,
        homeServiceFee: Number(homeServiceFee) || 0,
        notes,
        items: itemsPayload,
        createdBy: profile.id,
        paymentMethod,
        payments: paymentsArr,
        tips: tipsArr
      });
      toast('Transaksi tersimpan! 🎉 Sekarang upload foto.', 'success');
      setSavedTransactionId(newTrx.id);
      setShowPhotoUploadAfter(true);
      setPostSaveStep('invoice');
      // Hubungkan kembali ke orderan home service kalau transaksi ini berasal dari sana
      if (hsJobId) {
        try {
          await linkHomeServiceTransaction(hsJobId, newTrx.id);
        } catch (e) {}
        setHsReturnPending(true);
      }
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Input Transaksi",
    sub: effectiveBranch?.name || 'Cabang'
  }), !effectiveBranchId && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: '#f0dada',
      color: 'var(--red)',
      borderRadius: 8,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("strong", null, "⚠️ Pilih cabang dulu"), " dari dropdown di pojok kanan atas.")), effectiveBranchId && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Info Transaksi",
    sub: "Tanggal, jam, pelanggan"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row-3"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: date,
    onChange: e => setDate(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Jam Mulai",
    hint: isOT ? '⚠️ Lembur — komisi +5%' : 'Jam masuk treatment'
  }, /*#__PURE__*/React.createElement("input", {
    type: "time",
    className: "form-input",
    value: startTime,
    onChange: e => setStartTime(e.target.value),
    required: true,
    style: isOT ? {
      borderColor: 'var(--amber)',
      background: '#fdf6e3'
    } : {}
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Cabang"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: effectiveBranch?.name || '',
    disabled: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "No. HP Pelanggan",
    hint: foundClient ? `✓ Pelanggan kembali: ${foundClient.total_visits || 0}x` : 'Format: 08xxxxxxx (opsional)'
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "form-input",
    value: clientPhone,
    onChange: e => setClientPhone(e.target.value),
    placeholder: "08xxxxxxxxx",
    style: foundClient ? {
      borderColor: 'var(--green)',
      background: '#f0f9f3'
    } : {}
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Nama Pelanggan *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: clientName,
    onChange: e => setClientName(e.target.value),
    placeholder: "Nama lengkap",
    required: true
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Treatment",
    sub: `${items.length} item • Total ${fmtRp(totalAmount)}`,
    action: /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-ghost btn-sm",
      onClick: addItem
    }, "+ Tambah Treatment")
  }, loadingEmployees ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, items.map((item, idx) => {
    const svc = getServiceDef(item.service_name);
    const com = getItemCommission(item);
    const isFixedComm = svc?.commission_type === 'fixed_amount';
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        padding: 16,
        border: '1px solid var(--line)',
        borderRadius: 12,
        background: 'var(--cream)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 10
      }
    }, "Treatment #", idx + 1), items.length > 1 && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-danger btn-sm",
      onClick: () => removeItem(idx),
      style: {
        padding: '4px 10px',
        fontSize: 11
      }
    }, "Hapus")), /*#__PURE__*/React.createElement("div", {
      className: "form-row"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Karyawan *"
    }, /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: item.employee_id,
      onChange: e => updateItem(idx, {
        employee_id: e.target.value
      }),
      required: true
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— pilih karyawan —"), employees.map(emp => /*#__PURE__*/React.createElement("option", {
      key: emp.id,
      value: emp.id
    }, emp.full_name, " ", emp.job_title ? `· ${emp.job_title}` : '')))), /*#__PURE__*/React.createElement(Field, {
      label: "Treatment *"
    }, /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: item.service_name,
      onChange: e => {
        const newSvcName = e.target.value;
        const newSvc = getServiceDef(newSvcName);
        // Reset fixed_commission saat service ganti
        // Set commission_override = '0' kalau HS aktif & service baru itu percent type
        const patch = {
          service_name: newSvcName,
          fixed_commission: ''
        };
        if (isHomeService && newSvc?.commission_type === 'percent') {
          patch.commission_override = '0';
        } else {
          patch.commission_override = '';
        }
        updateItem(idx, patch);
      },
      required: true
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— pilih treatment —"), SERVICES.map(s => /*#__PURE__*/React.createElement("option", {
      key: s.name,
      value: s.name
    }, s.name))))), /*#__PURE__*/React.createElement("div", {
      className: "form-row"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Harga (Rp) *"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.price,
      onChange: e => updateItem(idx, {
        price: e.target.value
      }),
      placeholder: "200000",
      min: "0"
    })), isFixedComm ? /*#__PURE__*/React.createElement(Field, {
      label: "Komisi Karyawan (Rp) *",
      hint: `Input manual. ${isOT && effectiveBranchId !== 'bdg' ? '+Rp 5.000 lembur' : isOT && effectiveBranchId === 'bdg' ? 'Tidak ada bonus lembur (Bandung)' : ''}`
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.fixed_commission,
      onChange: e => updateItem(idx, {
        fixed_commission: e.target.value
      }),
      placeholder: "50000",
      min: "0",
      step: "1000"
    }), (() => {
      const sudahPaket = (item.notes || '').toLowerCase().includes('paket');
      return /*#__PURE__*/React.createElement("label", {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          cursor: 'pointer',
          marginTop: 8,
          padding: '8px 10px',
          background: sudahPaket ? 'var(--mauve-tint)' : 'var(--cream)',
          borderRadius: 8
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: sudahPaket,
        onChange: e => updateItem(idx, e.target.checked ? {
          price: '0',
          notes: 'Sudah paket'
        } : {
          notes: ''
        }),
        style: {
          accentColor: 'var(--mauve)',
          width: 16,
          height: 16,
          marginTop: 1
        }
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          fontWeight: 500,
          color: 'var(--plum)'
        }
      }, "Sudah termasuk paket (harga Rp 0)"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: 'var(--muted)'
        }
      }, "Client sudah bayar di awal. Komisi tetap diisi manual untuk beautician yang mengerjakan.")));
    })()) : item.service_name && isHomeService ? /*#__PURE__*/React.createElement(Field, {
      label: "Komisi Treatment (Rp)",
      hint: "Default Rp 0 (sudah include di HS). Edit kalau perlu kasih komisi tambahan."
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.commission_override ?? '0',
      onChange: e => updateItem(idx, {
        commission_override: e.target.value
      }),
      min: "0",
      step: "1000",
      placeholder: "0",
      style: {
        borderColor: 'var(--amber)',
        background: '#fdf6e3'
      }
    })) : item.service_name ? /*#__PURE__*/React.createElement(Field, {
      label: "Komisi Otomatis",
      hint: `${com.rate}% dari harga`
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-input",
      value: fmtRp(com.amount),
      disabled: true,
      style: {
        background: 'var(--mauve-tint)',
        color: 'var(--plum)',
        fontWeight: 500
      }
    })) : /*#__PURE__*/React.createElement(Field, {
      label: "Komisi",
      hint: "Pilih treatment dulu"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-input",
      value: "—",
      disabled: true
    }))), Number(item.price) > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '10px 12px',
        background: 'var(--cream)',
        borderRadius: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: item.discount_type && item.discount_type !== 'none' ? 10 : 0,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--plum)'
      }
    }, "🏷️ Diskon:"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'btn btn-sm ' + (!item.discount_type || item.discount_type === 'none' ? 'btn-primary' : 'btn-ghost'),
      onClick: () => updateItem(idx, {
        discount_type: 'none',
        discount_value: ''
      })
    }, "Tanpa Diskon"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'btn btn-sm ' + (item.discount_type === 'percent' ? 'btn-primary' : 'btn-ghost'),
      onClick: () => updateItem(idx, {
        discount_type: 'percent'
      })
    }, "Persen (%)"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'btn btn-sm ' + (item.discount_type === 'nominal' ? 'btn-primary' : 'btn-ghost'),
      onClick: () => updateItem(idx, {
        discount_type: 'nominal'
      })
    }, "Nominal (Rp)"))), item.discount_type && item.discount_type !== 'none' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "form-row"
    }, /*#__PURE__*/React.createElement(Field, {
      label: item.discount_type === 'percent' ? 'Diskon (%)' : 'Diskon (Rp)'
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.discount_value,
      onChange: e => updateItem(idx, {
        discount_value: e.target.value
      }),
      placeholder: item.discount_type === 'percent' ? '10' : '50000',
      min: "0",
      step: "any",
      max: item.discount_type === 'percent' ? '100' : undefined
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Harga Setelah Diskon"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-input",
      disabled: true,
      value: fmtRp(getItemEffectivePrice(item)),
      style: {
        background: 'var(--mauve-tint)',
        color: 'var(--plum)',
        fontWeight: 600
      }
    }))), getItemDiscount(item) > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--hijau)',
        marginTop: -4
      }
    }, "Hemat ", fmtRp(getItemDiscount(item)), " · Komisi & omset dihitung dari harga setelah diskon"))), item.service_name && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '10px 12px',
        background: item.has_complaint ? '#fdf2f2' : 'var(--cream)',
        borderRadius: 8,
        border: item.has_complaint ? '1px solid var(--red)' : '1px solid transparent'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!item.has_complaint,
      onChange: e => updateItem(idx, {
        has_complaint: e.target.checked,
        complaint_note: e.target.checked ? item.complaint_note || '' : ''
      }),
      style: {
        accentColor: 'var(--red)',
        width: 17,
        height: 17,
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        color: item.has_complaint ? 'var(--red)' : 'var(--plum)'
      }
    }, "Client mengajukan komplain (komisi tidak dihitung)"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "Omset tetap penuh. Hanya komisi beautician untuk treatment ini yang jadi Rp 0."))), item.has_complaint && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Catatan komplain (opsional, internal)"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "form-textarea",
      rows: "2",
      value: item.complaint_note || '',
      onChange: e => updateItem(idx, {
        complaint_note: e.target.value
      }),
      placeholder: "Contoh: bentuk alis tidak simetris, client minta perbaikan"
    })))), svc && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        padding: '8px 12px',
        background: 'var(--paper)',
        borderRadius: 6,
        fontSize: 12,
        color: 'var(--muted)',
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Kategori:"), " ", svc.category, " ·", /*#__PURE__*/React.createElement("strong", null, " Tipe komisi:"), ' ', svc.commission_type === 'percent' ? isHomeService ? 'Manual (HS mode)' : `${svc.baseRate}% (base)` : 'Manual Rp', isOT && !isHomeService && ' · ⚠️ Lembur', isHomeService && ' · 🏠 HS'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: 'var(--plum)'
      }
    }, "Komisi: ", fmtRp(com.amount))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px dashed var(--line)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 10
      }
    }, "👥 Kerjasama: ", (item.share_with?.length || 0) + 1, " karyawan"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-ghost btn-sm",
      onClick: () => {
        const currentShareWith = item.share_with || [];
        const newShareWith = [...currentShareWith, ''];
        const newCount = newShareWith.length + 1; // +1 for main employee
        // Recalculate equal percentages
        const eqPercent = Math.floor(100 / newCount * 100) / 100;
        const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
        const newPercents = Array(newCount).fill(eqPercent);
        newPercents[newCount - 1] = remainder;
        updateItem(idx, {
          share_with: newShareWith,
          share_percents: newPercents
        });
      },
      style: {
        padding: '4px 10px',
        fontSize: 11
      }
    }, "+ Tambah Karyawan"))), (item.share_with?.length || 0) > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        background: '#fef9f2',
        borderRadius: 8,
        border: '1px solid #f0e0c0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        marginBottom: 10,
        lineHeight: 1.5
      }
    }, "💡 ", /*#__PURE__*/React.createElement("strong", null, "Treatment dikerjakan bersama."), " Harga & komisi akan dibagi sesuai persentase. Total harus = 100%."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: 8,
        background: 'var(--paper)',
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--plum)'
      }
    }, "👤 ", employees.find(e => e.id === item.employee_id)?.full_name || '(belum pilih)', /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--muted)'
      }
    }, "Karyawan utama")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.share_percents?.[0] || 0,
      onChange: e => {
        const newPercents = [...(item.share_percents || [])];
        newPercents[0] = Number(e.target.value);
        updateItem(idx, {
          share_percents: newPercents
        });
      },
      min: "1",
      max: "100",
      step: "0.01",
      style: {
        width: 80,
        textAlign: 'center'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, "%")), (item.share_with || []).map((empId, sidx) => /*#__PURE__*/React.createElement("div", {
      key: sidx,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: 8,
        background: 'var(--paper)',
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: empId,
      onChange: e => {
        const newShareWith = [...(item.share_with || [])];
        newShareWith[sidx] = e.target.value;
        updateItem(idx, {
          share_with: newShareWith
        });
      },
      style: {
        flex: 1,
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— pilih karyawan partner —"), employees.filter(emp => emp.id !== item.employee_id && !(item.share_with || []).some((id, i) => i !== sidx && id === emp.id)).map(emp => /*#__PURE__*/React.createElement("option", {
      key: emp.id,
      value: emp.id
    }, emp.full_name, " ", emp.job_title ? `· ${emp.job_title}` : ''))), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.share_percents?.[sidx + 1] || 0,
      onChange: e => {
        const newPercents = [...(item.share_percents || [])];
        newPercents[sidx + 1] = Number(e.target.value);
        updateItem(idx, {
          share_percents: newPercents
        });
      },
      min: "1",
      max: "100",
      step: "0.01",
      style: {
        width: 80,
        textAlign: 'center'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, "%"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        const newShareWith = (item.share_with || []).filter((_, i) => i !== sidx);
        const newCount = newShareWith.length + 1;
        const eqPercent = Math.floor(100 / newCount * 100) / 100;
        const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
        const newPercents = Array(newCount).fill(eqPercent);
        newPercents[newCount - 1] = remainder;
        updateItem(idx, {
          share_with: newShareWith,
          share_percents: newPercents
        });
      },
      className: "btn btn-ghost btn-sm",
      style: {
        padding: '4px 8px',
        fontSize: 11,
        color: 'var(--red)'
      }
    }, "✕"))), (() => {
      const total = (item.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
      const isValid = Math.abs(total - 100) < 0.01;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          padding: '6px 10px',
          borderRadius: 6,
          background: isValid ? '#ecf5ef' : '#fdf0f0',
          fontSize: 12,
          color: isValid ? 'var(--green)' : 'var(--red)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", null, "Total persentase"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, isValid ? '✓ ' : '⚠️ ', total.toFixed(2), "% ", !isValid && '(harus 100%)'));
    })(), item.price && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: 10,
        background: 'var(--cream)',
        borderRadius: 6,
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 6
      }
    }, "Pembagian harga & komisi:"), [item.employee_id, ...(item.share_with || [])].map((empId, i) => {
      const pct = Number(item.share_percents?.[i] || 0);
      const splitPrice = Math.round(Number(item.price) * pct / 100);
      const splitCom = isFixedComm ? Math.round(com.amount * pct / 100) : Math.round(splitPrice * com.rate / 100);
      const empName = employees.find(e => e.id === empId)?.full_name || '(belum pilih)';
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          padding: '3px 0',
          fontFamily: 'JetBrains Mono, monospace'
        }
      }, /*#__PURE__*/React.createElement("span", null, empName, " (", pct, "%)"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--plum)'
        }
      }, fmtRp(splitPrice), " → komisi ", fmtRp(splitCom)));
    })))));
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Pembayaran",
    sub: hasDp ? "Klien sudah bayar DP — input metode DP & pelunasan" : "Pilih metode pembayaran dari klien"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 14,
      padding: '10px 12px',
      background: 'var(--cream)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasDp,
    onChange: e => {
      const checked = e.target.checked;
      setHasDp(checked);
      if (!checked) {
        setDpAmount('');
      }
    },
    style: {
      accentColor: 'var(--mauve)',
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, "💰 Klien sudah bayar DP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Centang jika ada DP yang sudah dibayar sebelumnya/awal"))), !hasDp ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 8
    }
  }, "METODE PEMBAYARAN (FULL)"), /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 8
    }
  }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("label", {
    key: pm.value,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 14px',
      border: '2px solid',
      borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
      borderRadius: 10,
      background: paymentMethod === pm.value ? 'var(--mauve-tint)' : 'var(--paper)',
      cursor: 'pointer',
      transition: 'all 0.15s'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "paymentMethod",
    value: pm.value,
    checked: paymentMethod === pm.value,
    onChange: () => setPaymentMethod(pm.value),
    style: {
      accentColor: 'var(--mauve)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, pm.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: paymentMethod === pm.value ? 'var(--plum)' : 'var(--text)'
    }
  }, pm.label)))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      background: '#fdf6e3',
      borderRadius: 10,
      marginBottom: 14,
      border: '1px solid #f0e0c0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 10,
      color: 'var(--amber)'
    }
  }, "1. DP (UANG MUKA)"), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tanggal DP"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: dpDate,
    onChange: e => setDpDate(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Jumlah DP (Rp) *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: dpAmount,
    onChange: e => setDpAmount(e.target.value),
    placeholder: "50000",
    min: "0",
    step: "1000",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 8
    }
  }, "METODE DP"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 6
    }
  }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("label", {
    key: pm.value,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      border: '2px solid',
      borderColor: dpMethod === pm.value ? 'var(--amber)' : 'var(--line)',
      borderRadius: 8,
      background: dpMethod === pm.value ? '#fef3d7' : 'var(--paper)',
      cursor: 'pointer',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "dpMethod",
    value: pm.value,
    checked: dpMethod === pm.value,
    onChange: () => setDpMethod(pm.value),
    style: {
      accentColor: 'var(--amber)'
    }
  }), /*#__PURE__*/React.createElement("span", null, pm.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, pm.label.replace('Transfer ', '')))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      border: '1px solid var(--mauve)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 10,
      color: 'var(--mauve)'
    }
  }, "2. PELUNASAN (SISA)"), (() => {
    const grandTotal = totalAmount + (isHomeService ? Number(homeServiceFee) || 0 : 0);
    const dp = Number(dpAmount) || 0;
    const sisa = grandTotal - dp;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 10,
        background: 'var(--paper)',
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Total Transaksi"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, fmtRp(grandTotal))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, "− DP ", dpMethod ? `(${getPaymentMethodLabel(dpMethod)})` : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: 'var(--amber)'
      }
    }, "−", fmtRp(dp))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 6,
        borderTop: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: 'var(--plum)'
      }
    }, "Sisa Pembayaran"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: sisa < 0 ? 'var(--red)' : 'var(--plum)',
        fontSize: 15
      }
    }, fmtRp(sisa))), sisa < 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        fontSize: 11,
        color: 'var(--red)'
      }
    }, "⚠️ DP melebihi total transaksi")), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 8
      }
    }, "METODE PELUNASAN"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 6
      }
    }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("label", {
      key: pm.value,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        border: '2px solid',
        borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
        borderRadius: 8,
        background: paymentMethod === pm.value ? 'var(--paper)' : 'var(--paper)',
        cursor: 'pointer',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "paymentMethodSisa",
      value: pm.value,
      checked: paymentMethod === pm.value,
      onChange: () => setPaymentMethod(pm.value),
      style: {
        accentColor: 'var(--mauve)'
      }
    }), /*#__PURE__*/React.createElement("span", null, pm.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500
      }
    }, pm.label.replace('Transfer ', ''))))));
  })()))), /*#__PURE__*/React.createElement(Card, {
    title: "Tips dari Client",
    sub: "Opsional — tips transfer/QRIS untuk beautician (tips cash langsung diterima beautician)"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: hasTips ? 14 : 0,
      padding: '10px 12px',
      background: 'var(--cream)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasTips,
    onChange: e => {
      const checked = e.target.checked;
      setHasTips(checked);
      if (!checked) setTips([{
        employee_id: '',
        amount: '',
        payment_method: 'qris'
      }]);
    },
    style: {
      accentColor: 'var(--mauve)',
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, "💝 Ada tips dari client (transfer/QRIS)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Tips masuk ke rekening kita, lalu diberikan ke beautician. Tercatat di gaji mereka."))), hasTips && /*#__PURE__*/React.createElement("div", null, tips.map((tip, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      padding: 12,
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      fontSize: 10
    }
  }, "Tips #", idx + 1), tips.length > 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setTips(tips.filter((_, i) => i !== idx)),
    className: "btn btn-ghost btn-sm",
    style: {
      padding: '2px 8px',
      fontSize: 11,
      color: 'var(--red)'
    }
  }, "✕ Hapus")), /*#__PURE__*/React.createElement(Field, {
    label: "Beautician Penerima *"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: tip.employee_id,
    onChange: e => {
      const next = [...tips];
      next[idx] = {
        ...next[idx],
        employee_id: e.target.value
      };
      setTips(next);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— pilih beautician —"), employees.map(emp => /*#__PURE__*/React.createElement("option", {
    key: emp.id,
    value: emp.id
  }, emp.full_name, emp.job_title ? ` · ${emp.job_title}` : '')))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Jumlah Tips (Rp) *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: tip.amount,
    onChange: e => {
      const next = [...tips];
      next[idx] = {
        ...next[idx],
        amount: e.target.value
      };
      setTips(next);
    },
    placeholder: "20000",
    min: "0",
    step: "any"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Metode"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: tip.payment_method,
    onChange: e => {
      const next = [...tips];
      next[idx] = {
        ...next[idx],
        payment_method: e.target.value
      };
      setTips(next);
    }
  }, PAYMENT_METHODS.filter(pm => pm.value !== 'cash').map(pm => /*#__PURE__*/React.createElement("option", {
    key: pm.value,
    value: pm.value
  }, pm.label))))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: () => setTips([...tips, {
      employee_id: '',
      amount: '',
      payment_method: 'qris'
    }])
  }, "+ Tambah Tips (beautician lain)"), (() => {
    const totalTips = tips.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    return totalTips > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '8px 12px',
        background: 'var(--cream)',
        borderRadius: 8,
        fontSize: 13,
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Total tips"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: 'var(--plum)'
      }
    }, fmtRp(totalTips))) : null;
  })())), /*#__PURE__*/React.createElement(Card, {
    title: "Home Service",
    sub: "Opsional — komisi treatment sudah termasuk dalam biaya HS"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isHomeService,
    onChange: e => {
      const checked = e.target.checked;
      setIsHomeService(checked);
      // When HS toggled, adjust commission_override for percent-based treatments
      setItems(prev => prev.map(it => {
        const svc = getServiceDef(it.service_name);
        if (svc?.commission_type === 'percent') {
          return {
            ...it,
            commission_override: checked ? '0' : ''
          };
        }
        // For fixed_amount (Sulam Alis), don't touch — admin handles
        return it;
      }));
    },
    style: {
      accentColor: 'var(--mauve)',
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, "Ini transaksi home service")), isHomeService && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: '#fdf6e3',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--plum)',
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "💡 ", /*#__PURE__*/React.createElement("strong", null, "Mode Home Service aktif"), " — komisi treatment otomatis di-set ke ", /*#__PURE__*/React.createElement("strong", null, "Rp 0"), " karena sudah include di biaya HS. Admin/Owner bisa edit komisi treatment kalau perlu, dan input biaya HS manual sesuai jarak."), /*#__PURE__*/React.createElement(Field, {
    label: "Biaya Home Service (Rp)",
    hint: "100% masuk komisi karyawan"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: homeServiceFee,
    onChange: e => setHomeServiceFee(e.target.value),
    placeholder: "50000",
    min: "0",
    step: "5000"
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Catatan",
    sub: "Opsional"
  }, /*#__PURE__*/React.createElement(Field, null, /*#__PURE__*/React.createElement("textarea", {
    className: "form-textarea",
    rows: "2",
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "Catatan tambahan..."
  }))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Total Omset",
    value: fmtRp(totalAmount),
    sub: totalDiscount > 0 ? `setelah diskon ${fmtRp(totalDiscount)}` : `${items.length} treatment`
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Komisi Treatment",
    value: fmtRp(totalCommission),
    sub: isOT ? '⚠️ termasuk lembur' : ''
  }), isHomeService && /*#__PURE__*/React.createElement(Metric, {
    label: "Komisi Home Service",
    value: fmtRp(Number(homeServiceFee) || 0),
    sub: distinctWorkers > 1 ? `dibagi ${distinctWorkers} karyawan · ${fmtRp(hsPerWorker)} per orang` : '100% untuk karyawan'
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Total ke Karyawan",
    value: fmtRp(totalForEmployee),
    sub: "komisi total"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: () => setPage('dashboard'),
    disabled: submitting
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary btn-lg",
    disabled: submitting
  }, submitting ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : 'Simpan Transaksi')))), /*#__PURE__*/React.createElement(PhotoGalleryModal, {
    open: showPhotoUploadAfter,
    transactionId: savedTransactionId,
    profile: profile,
    onClose: () => {
      setShowPhotoUploadAfter(false);
      setShowInvoicePrompt(true);
    }
  }), showInvoicePrompt && savedTransactionId && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backdropFilter: 'blur(3px)'
    },
    onClick: () => {
      // Klik latar: kalau dari home service, jangan langsung keluar sebelum
      // sempat melihat pengingat tahap terakhir
      if (hsReturnPending && postSaveStep === 'invoice') {
        setPostSaveStep('return');
        return;
      }
      setShowInvoicePrompt(false);
      setPage(hsReturnPending ? 'homeService' : 'transactions');
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      padding: '24px 22px',
      maxWidth: 340,
      width: '100%',
      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      textAlign: 'center'
    },
    onClick: e => e.stopPropagation()
  }, !hsReturnPending || postSaveStep === 'invoice' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 8
    }
  }, "🧾"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--plum-deep)',
      marginBottom: 6
    }
  }, "Transaksi Tersimpan"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--muted)',
      marginBottom: 18,
      lineHeight: 1.5
    }
  }, hsReturnPending ? 'Download notanya dulu untuk dikirim ke client. Setelah itu ada satu langkah terakhir.' : 'Mau cetak / download invoice untuk klien sekarang? Bisa juga dilakukan nanti dari tab Transaksi.'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => {
      printInvoice(savedTransactionId);
      // Setelah nota dibuka, layar di belakangnya berganti ke langkah terakhir
      if (hsReturnPending) setPostSaveStep('return');
    }
  }, "🧾 Cetak / Download Nota"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => {
      if (hsReturnPending) {
        setPostSaveStep('return');
        return;
      }
      setShowInvoicePrompt(false);
      setPage('transactions');
    }
  }, hsReturnPending ? 'Lewati, nanti saja' : 'Nanti saja'))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 8
    }
  }, "🛡️"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--plum-deep)',
      marginBottom: 6
    }
  }, "Satu Langkah Terakhir"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--plum)',
      marginBottom: 6,
      lineHeight: 1.55
    }
  }, "Setelah kamu tiba di salon atau di rumah, geser tahap terakhir", /*#__PURE__*/React.createElement("strong", null, " Sudah Sampai Kembali"), " supaya kami tahu kamu sudah sampai dengan selamat."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginBottom: 18,
      lineHeight: 1.5
    }
  }, "Belum sampai? Tidak apa-apa, buka lagi menu Home Service nanti kalau sudah tiba."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => {
      setShowInvoicePrompt(false);
      setPage('homeService');
    }
  }, "Kembali ke Home Service"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => {
      setPostSaveStep('invoice');
    }
  }, "Download nota lagi"))))));
}

// =====================================================
// TRANSACTIONS LIST PAGE
// =====================================================
function TransactionsPage({
  profile,
  currentBranchId,
  branches,
  setPage
}) {
  const [trxs, setTrxs] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [editingId, setEditingId] = useStateP(null);
  const [deleteTarget, setDeleteTarget] = useStateP(null);
  const [deleting, setDeleting] = useStateP(false);
  const [editedIds, setEditedIds] = useStateP(new Set());
  const [photoTargetId, setPhotoTargetId] = useStateP(null);

  // Filter states — default 3 bulan ke belakang
  const [filterPreset, setFilterPreset] = useStateP('3months');
  // Untuk rentang panjang, jumlah transaksinya bisa ribuan. Merender semuanya
  // sekaligus membuat HP macet, jadi ditampilkan bertahap.
  const PAGE_SIZE = 100;
  const [visibleCount, setVisibleCount] = useStateP(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useStateP('');
  const [customFrom, setCustomFrom] = useStateP('');
  const [customTo, setCustomTo] = useStateP('');
  const [paymentFilter, setPaymentFilter] = useStateP('all'); // 'all' or a payment_method value
  const [beauticianFilter, setBeauticianFilter] = useStateP('all'); // 'all' or employee_id
  const [treatmentFilter, setTreatmentFilter] = useStateP('all'); // 'all' or service_name

  const isSuper = profile.role === 'super_admin';
  const isBranchAdmin = profile.role === 'branch_admin';
  const canEdit = isSuper || isBranchAdmin;
  // Branch admin may delete transactions in their own branch (data is already
  // scoped to their branch); super admin may delete anywhere.
  const canDelete = isSuper || isBranchAdmin;

  // Compute date range based on filter preset
  function getDateRange() {
    const today = new Date();
    const ymd = d => d.toISOString().split('T')[0];
    switch (filterPreset) {
      case 'today':
        return {
          from: ymd(today),
          to: ymd(today)
        };
      case 'week':
        {
          const start = new Date(today);
          start.setDate(today.getDate() - 7);
          return {
            from: ymd(start),
            to: ymd(today)
          };
        }
      case 'month':
        {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          return {
            from: ymd(start),
            to: ymd(end)
          };
        }
      case '3months':
        {
          const start = new Date(today);
          start.setMonth(today.getMonth() - 3);
          return {
            from: ymd(start),
            to: ymd(today)
          };
        }
      case 'all':
        {
          // 2 years back as practical upper bound
          const start = new Date(today);
          start.setFullYear(today.getFullYear() - 2);
          return {
            from: ymd(start),
            to: ymd(today)
          };
        }
      case 'custom':
        return {
          from: customFrom || ymd(new Date(today.getFullYear(), today.getMonth(), 1)),
          to: customTo || ymd(today)
        };
      default:
        return {
          from: ymd(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())),
          to: ymd(today)
        };
    }
  }
  async function load() {
    setLoading(true);
    try {
      const filterBranch = isSuper ? currentBranchId : profile.branch_id;
      const {
        from,
        to
      } = getDateRange();
      const data = await listTransactionsByDateRange({
        branchId: filterBranch,
        from,
        to,
        searchQuery
      });
      setTrxs(data);
      setLoading(false); // daftar sudah bisa ditampilkan, jangan tunggu penanda edit

      // Penanda "sudah diedit" hanya hiasan, jadi dijalankan belakangan dan
      // kegagalannya tidak boleh menahan tampilan.
      try {
        const ids = data.map(t => t.id);
        const edited = await getEditedTransactionIds(ids);
        setEditedIds(edited);
      } catch (e) {
        setEditedIds(new Set());
      }
    } catch (err) {
      toast('Gagal memuat transaksi: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    load();
  }, [currentBranchId, filterPreset, customFrom, customTo]);

  // Debounce search query
  useEffectP(() => {
    const t = setTimeout(() => {
      load();
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const scopeLabel = isSuper ? currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang' : branches.find(b => b.id === profile.branch_id)?.name;

  // Build dropdown options from loaded transactions
  const beauticianOptions = useMemoP(() => {
    const map = new Map();
    for (const t of trxs) {
      for (const it of t.items || []) {
        if (it.employee_id && it.employee?.full_name && !map.has(it.employee_id)) {
          map.set(it.employee_id, it.employee.full_name);
        }
      }
    }
    return [...map.entries()].map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [trxs]);
  const treatmentOptions = useMemoP(() => {
    const set = new Set();
    // Always include all master treatments (so e.g. Sulam Alis shows even if none yet this period)
    if (typeof SERVICES !== 'undefined' && Array.isArray(SERVICES)) {
      for (const s of SERVICES) if (s.name) set.add(s.name);
    }
    // Also include any service names found in transactions (covers old/custom names)
    for (const t of trxs) {
      for (const it of t.items || []) {
        if (it.service_name) set.add(it.service_name);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [trxs]);

  // Apply all client-side filters: payment method, beautician, treatment
  const displayedTrxs = useMemoP(() => {
    return trxs.filter(t => {
      // Payment filter
      if (paymentFilter !== 'all') {
        const mainMatch = (t.payment_method || 'cash') === paymentFilter;
        const payMatch = (t.payments || []).some(p => (p.payment_method || '') === paymentFilter);
        if (!mainMatch && !payMatch) return false;
      }
      // Beautician filter — any item done by this employee
      if (beauticianFilter !== 'all') {
        if (!(t.items || []).some(it => it.employee_id === beauticianFilter)) return false;
      }
      // Treatment filter — any item with this service
      if (treatmentFilter !== 'all') {
        if (!(t.items || []).some(it => it.service_name === treatmentFilter)) return false;
      }
      return true;
    });
  }, [trxs, paymentFilter, beauticianFilter, treatmentFilter]);
  const anyFilterActive = paymentFilter !== 'all' || beauticianFilter !== 'all' || treatmentFilter !== 'all';

  // Hanya sebagian yang dirender supaya HP tidak macet saat rentangnya panjang
  const renderedTrxs = useMemoP(() => displayedTrxs.slice(0, visibleCount), [displayedTrxs, visibleCount]);
  const adaSisa = displayedTrxs.length > renderedTrxs.length;

  // Balik ke 100 pertama tiap kali filter atau periode berubah
  useEffectP(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterPreset, customFrom, customTo, paymentFilter, beauticianFilter, treatmentFilter, searchQuery, currentBranchId]);
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      toast(`Transaksi tanggal ${fmtDate(deleteTarget.date)} dihapus`, 'success');
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast('Gagal hapus: ' + (err.message || err), 'error');
    } finally {
      setDeleting(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Transaksi",
    sub: scopeLabel
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setPage('newTransaction')
  }, "+ Input Transaksi")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: '10px 14px',
      background: 'var(--mauve-tint)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--plum)',
      lineHeight: 1.5
    }
  }, "💡 ", /*#__PURE__*/React.createElement("strong", null, "Tips:"), " Klik ", /*#__PURE__*/React.createElement("strong", null, "Edit"), " untuk mengubah transaksi, atau ", /*#__PURE__*/React.createElement("strong", null, "Hapus"), " untuk menghapus (super_admin only). Semua perubahan tercatat di ", /*#__PURE__*/React.createElement("strong", null, "Audit Log"), "."), /*#__PURE__*/React.createElement(Card, {
    title: "Filter & Pencarian",
    sub: "Pilih periode atau cari nama klien"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Periode"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, [{
    value: 'today',
    label: 'Hari Ini'
  }, {
    value: 'week',
    label: '7 Hari'
  }, {
    value: 'month',
    label: 'Bulan Ini'
  }, {
    value: '3months',
    label: '3 Bulan'
  }, {
    value: 'all',
    label: 'Semua (2 thn)'
  }, {
    value: 'custom',
    label: '📅 Custom'
  }].map(p => /*#__PURE__*/React.createElement("button", {
    key: p.value,
    type: "button",
    className: 'btn btn-sm ' + (filterPreset === p.value ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setFilterPreset(p.value)
  }, p.label)))), filterPreset === 'custom' && /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Dari Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customFrom,
    onChange: e => setCustomFrom(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sampai Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customTo,
    onChange: e => setCustomTo(e.target.value)
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "🔍 Cari Klien",
    hint: "Cari berdasarkan nama atau nomor HP"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: searchQuery,
    onChange: e => setSearchQuery(e.target.value),
    placeholder: "Ketik nama klien atau no HP..."
  })), /*#__PURE__*/React.createElement(Field, {
    label: "💳 Filter Pembayaran",
    hint: "Lihat transaksi berdasarkan metode pembayaran"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'btn btn-sm ' + (paymentFilter === 'all' ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPaymentFilter('all')
  }, "Semua"), PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("button", {
    type: "button",
    key: pm.value,
    className: 'btn btn-sm ' + (paymentFilter === pm.value ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPaymentFilter(pm.value)
  }, pm.icon, " ", pm.label)))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "💇 Filter Beautician",
    hint: "Transaksi yang dikerjakan beautician tertentu"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: beauticianFilter,
    onChange: e => setBeauticianFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "— Semua Beautician —"), beauticianOptions.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.id,
    value: b.id
  }, b.name)))), /*#__PURE__*/React.createElement(Field, {
    label: "✨ Filter Treatment",
    hint: "Transaksi dengan treatment tertentu"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: treatmentFilter,
    onChange: e => setTreatmentFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "— Semua Treatment —"), treatmentOptions.map(s => /*#__PURE__*/React.createElement("option", {
    key: s,
    value: s
  }, s))))), anyFilterActive && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    style: {
      marginBottom: 8
    },
    onClick: () => {
      setPaymentFilter('all');
      setBeauticianFilter('all');
      setTreatmentFilter('all');
    }
  }, "✕ Reset semua filter"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      background: 'var(--cream)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--muted)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, (() => {
    const {
      from,
      to
    } = getDateRange();
    return `📅 ${fmtDate(from)} — ${fmtDate(to)}`;
  })()), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--plum)',
      fontWeight: 500
    }
  }, adaSisa ? `Menampilkan ${renderedTrxs.length} dari ${displayedTrxs.length} transaksi` : `${displayedTrxs.length}${anyFilterActive ? ` dari ${trxs.length}` : ''} transaksi`))), /*#__PURE__*/React.createElement(Card, null, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !displayedTrxs.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada transaksi",
    sub: anyFilterActive ? 'Tidak ada transaksi yang cocok dengan filter ini di periode terpilih.' : 'Belum ada transaksi di periode ini, atau hasil pencarian kosong.'
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "table-mobile-cards"
  }, renderedTrxs.map(t => {
    const wasEdited = editedIds.has(t.id);
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: "row-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row-header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500,
        fontSize: 14,
        color: 'var(--plum-deep)'
      }
    }, t.client_name_snapshot || '—'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        marginTop: 2
      }
    }, fmtDate(t.date), " · ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, fmtTime(t.start_time))), t.client_phone_snapshot && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, t.client_phone_snapshot)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'flex-end'
      }
    }, t.payments && t.payments.length > 0 ? t.payments.slice().sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0)).map((p, pi) => /*#__PURE__*/React.createElement("span", {
      key: pi,
      className: "badge",
      style: {
        fontSize: 9,
        background: p.is_dp ? '#fdf6e3' : 'var(--mauve-tint)',
        color: p.is_dp ? '#b8893d' : 'var(--plum)'
      }
    }, p.is_dp && '💰 DP ', getPaymentMethodIcon(p.payment_method), " ", getPaymentMethodLabel(p.payment_method).replace('Transfer ', ''), " ", fmtRp(p.amount))) : t.payment_method && /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        fontSize: 9,
        background: 'var(--mauve-tint)',
        color: 'var(--plum)'
      }
    }, getPaymentMethodIcon(t.payment_method), " ", getPaymentMethodLabel(t.payment_method).replace('Transfer ', '')), t.is_overtime && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-amber",
      style: {
        fontSize: 9
      }
    }, "lembur"), t.is_home_service && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-gold",
      style: {
        fontSize: 9
      }
    }, "HS"), wasEdited && /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        background: '#fdf6e3',
        color: '#b8893d',
        fontSize: 9
      }
    }, "edited"))), isSuper && !currentBranchId && /*#__PURE__*/React.createElement("div", {
      className: "row-detail"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row-detail-label"
    }, "Cabang"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve",
      style: {
        fontSize: 10
      }
    }, t.branch?.name))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "row-detail-label",
      style: {
        marginBottom: 4
      }
    }, "Treatment"), (t.items || []).map((it, i) => {
      const sharePercent = Number(it.share_percent || 100);
      const isShared = it.share_group_id && sharePercent < 100;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: 12,
          marginBottom: 3,
          paddingLeft: 8,
          borderLeft: '2px solid var(--mauve-tint)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--plum)',
          fontWeight: 500
        }
      }, it.service_name, isShared && /*#__PURE__*/React.createElement("span", {
        className: "badge",
        style: {
          fontSize: 8,
          background: 'var(--mauve-tint)',
          color: 'var(--mauve)',
          marginLeft: 4
        }
      }, "shared ", sharePercent, "%")), /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--muted)',
          fontSize: 11
        }
      }, "oleh ", it.employee?.full_name || '—', isShared && /*#__PURE__*/React.createElement("span", null, " · ", fmtRp(it.price))));
    })), /*#__PURE__*/React.createElement("div", {
      className: "row-detail"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row-detail-label"
    }, "Omset"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, fmtRp(t.total_amount))), /*#__PURE__*/React.createElement("div", {
      className: "row-detail"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row-detail-label"
    }, "Komisi"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--mauve)',
        fontWeight: 500
      }
    }, fmtRp(t.total_commission))), (t.tips || []).length > 0 && (() => {
      const tipTotal = (t.tips || []).reduce((s, tp) => s + Number(tp.amount || 0), 0);
      return /*#__PURE__*/React.createElement("div", {
        className: "row-detail"
      }, /*#__PURE__*/React.createElement("span", {
        className: "row-detail-label"
      }, "Tips 💝"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--plum)',
          fontWeight: 500
        }
      }, "+", fmtRp(tipTotal)));
    })(), (t.items || []).some(i => i.has_complaint) && /*#__PURE__*/React.createElement("div", {
      className: "row-detail"
    }, /*#__PURE__*/React.createElement("span", {
      className: "row-detail-label"
    }, "Komplain"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red)',
        fontWeight: 500,
        fontSize: 12
      }
    }, "⚠️ ", (t.items || []).filter(i => i.has_complaint).length, " treatment, komisi Rp 0")), /*#__PURE__*/React.createElement("div", {
      className: "row-actions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => printInvoice(t.id)
    }, "🧾 Invoice"), canEdit && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setPhotoTargetId(t.id)
    }, "📸 Foto"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setEditingId(t.id)
    }, "✏️ Edit"), canDelete && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setDeleteTarget(t),
      style: {
        color: 'var(--red)'
      }
    }, "🗑 Hapus"))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Tanggal"), /*#__PURE__*/React.createElement("th", null, "Jam"), isSuper && !currentBranchId && /*#__PURE__*/React.createElement("th", null, "Cabang"), /*#__PURE__*/React.createElement("th", null, "Pelanggan"), /*#__PURE__*/React.createElement("th", null, "Treatment"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Omset"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi"), /*#__PURE__*/React.createElement("th", null, "Aksi"))), /*#__PURE__*/React.createElement("tbody", null, renderedTrxs.map(t => {
    const wasEdited = editedIds.has(t.id);
    return /*#__PURE__*/React.createElement("tr", {
      key: t.id
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: 13
      }
    }, fmtDate(t.date), wasEdited && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        background: '#fdf6e3',
        color: '#b8893d',
        fontSize: 9,
        marginTop: 3,
        display: 'inline-block'
      },
      title: "Transaksi ini pernah di-edit. Cek Audit Log untuk riwayat."
    }, "edited"))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12
      }
    }, fmtTime(t.start_time)), t.is_overtime && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-amber",
      style: {
        marginLeft: 6,
        fontSize: 10
      }
    }, "lembur"), t.is_home_service && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-gold",
      style: {
        marginLeft: 6,
        fontSize: 10
      }
    }, "HS"), t.payments && t.payments.length > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, t.payments.slice().sort((a, b) => (b.is_dp ? 1 : 0) - (a.is_dp ? 1 : 0)).map((p, pi) => /*#__PURE__*/React.createElement("span", {
      key: pi,
      className: "badge",
      style: {
        fontSize: 9,
        background: p.is_dp ? '#fdf6e3' : 'var(--mauve-tint)',
        color: p.is_dp ? '#b8893d' : 'var(--plum)'
      }
    }, p.is_dp && '💰 DP ', getPaymentMethodIcon(p.payment_method), " ", getPaymentMethodLabel(p.payment_method).replace('Transfer ', ''), " ", fmtRp(p.amount)))) : t.payment_method && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        fontSize: 9,
        background: 'var(--mauve-tint)',
        color: 'var(--plum)'
      }
    }, getPaymentMethodIcon(t.payment_method), " ", getPaymentMethodLabel(t.payment_method).replace('Transfer ', '')))), isSuper && !currentBranchId && /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve",
      style: {
        fontSize: 10
      }
    }, t.branch?.name)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500,
        fontSize: 13
      }
    }, t.client_name_snapshot || '—'), t.client_phone_snapshot && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, t.client_phone_snapshot)), /*#__PURE__*/React.createElement("td", null, (t.items || []).map((it, i) => {
      const sharePercent = Number(it.share_percent || 100);
      const isShared = it.share_group_id && sharePercent < 100;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontSize: 12,
          marginBottom: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--plum)',
          fontWeight: 500
        }
      }, it.service_name), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--muted)'
        }
      }, " • ", it.employee?.full_name || '—'), isShared && /*#__PURE__*/React.createElement("span", {
        className: "badge",
        style: {
          fontSize: 9,
          background: 'var(--mauve-tint)',
          color: 'var(--mauve)',
          marginLeft: 4
        }
      }, sharePercent, "%"));
    })), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric",
      style: {
        fontWeight: 500
      }
    }, fmtRp(t.total_amount)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric",
      style: {
        color: 'var(--mauve)',
        fontWeight: 500
      }
    }, fmtRp(t.total_commission), (t.tips || []).length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--plum)',
        fontWeight: 500,
        marginTop: 2
      }
    }, "+", fmtRp((t.tips || []).reduce((s, tp) => s + Number(tp.amount || 0), 0)), " tips 💝"), (t.items || []).some(i => i.has_complaint) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--red)',
        fontWeight: 500,
        marginTop: 2
      }
    }, "⚠️ komplain (", (t.items || []).filter(i => i.has_complaint).length, ")")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => printInvoice(t.id),
      title: "Cetak / download invoice"
    }, "🧾 Invoice"), canEdit && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setPhotoTargetId(t.id),
      title: "Lihat & kelola foto treatment"
    }, "📸 Foto"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setEditingId(t.id),
      title: "Edit transaksi"
    }, "✏️ Edit"), canDelete && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setDeleteTarget(t),
      title: "Hapus transaksi (super_admin only)",
      style: {
        color: 'var(--red)'
      }
    }, "🗑 Hapus")))));
  })))), adaSisa && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setVisibleCount(v => v + PAGE_SIZE)
  }, "Muat ", Math.min(PAGE_SIZE, displayedTrxs.length - renderedTrxs.length), " transaksi lagi"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 6
    }
  }, "Sisa ", displayedTrxs.length - renderedTrxs.length, " transaksi belum ditampilkan. Semua sudah terhitung di laporan, ini hanya batas tampilan supaya tidak berat.")))), /*#__PURE__*/React.createElement(EditTransactionModal, {
    open: !!editingId,
    transactionId: editingId,
    profile: profile,
    branches: branches,
    onClose: () => setEditingId(null),
    onSuccess: () => {
      setEditingId(null);
      load();
    }
  }), /*#__PURE__*/React.createElement(PhotoGalleryModal, {
    open: !!photoTargetId,
    transactionId: photoTargetId,
    profile: profile,
    onClose: () => setPhotoTargetId(null)
  }), deleteTarget && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
      backdropFilter: 'blur(4px)'
    },
    onClick: () => !deleting && setDeleteTarget(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 20,
      padding: 32,
      width: '100%',
      maxWidth: 520,
      boxShadow: 'var(--shadow-lg)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--red)',
      marginBottom: 6
    }
  }, "⚠️ Hapus Transaksi"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 26,
      fontWeight: 400,
      color: 'var(--plum-deep)',
      marginBottom: 14
    }
  }, "Yakin hapus transaksi ini?"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      background: 'var(--cream)',
      borderRadius: 8,
      marginBottom: 14,
      fontSize: 13,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Tanggal:"), " ", fmtDate(deleteTarget.date), " · ", fmtTime(deleteTarget.start_time)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Pelanggan:"), " ", deleteTarget.client_name_snapshot || '—'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Cabang:"), " ", deleteTarget.branch?.name || '—'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Total Omset:"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--mauve)',
      fontWeight: 500
    }
  }, fmtRp(deleteTarget.total_amount))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Komisi:"), " ", fmtRp(deleteTarget.total_commission)), (deleteTarget.items || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Treatment:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: '4px 0 0 18px',
      padding: 0
    }
  }, deleteTarget.items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontSize: 12
    }
  }, it.service_name, " (", it.employee?.full_name || '—', ")"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: '#fdf0f0',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--red)',
      marginBottom: 18,
      lineHeight: 1.5
    }
  }, "⚠️ Aksi ini ", /*#__PURE__*/React.createElement("strong", null, "tidak bisa di-undo"), ". Tapi data lengkap akan tercatat di Audit Log dan bisa dilihat kembali jika perlu."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setDeleteTarget(null),
    disabled: deleting
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleDelete,
    disabled: deleting,
    style: {
      background: 'var(--red)'
    }
  }, deleting ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : '🗑 Hapus Permanen')))));
}

// =====================================================
// EDIT TRANSACTION MODAL
// =====================================================
function EditTransactionModal({
  open,
  transactionId,
  profile,
  branches,
  onClose,
  onSuccess
}) {
  const [loading, setLoading] = useStateP(true);
  const [submitting, setSubmitting] = useStateP(false);
  const [trx, setTrx] = useStateP(null);
  const [employees, setEmployees] = useStateP([]);

  // Form state
  const [date, setDate] = useStateP('');
  const [startTime, setStartTime] = useStateP('');
  const [clientName, setClientName] = useStateP('');
  const [clientPhone, setClientPhone] = useStateP('');
  const [isHomeService, setIsHomeService] = useStateP(false);
  const [homeServiceFee, setHomeServiceFee] = useStateP(0);
  const [notes, setNotes] = useStateP('');
  const [items, setItems] = useStateP([]);

  // Tahap F & G states
  const [paymentMethod, setPaymentMethod] = useStateP('cash');
  const [hasDp, setHasDp] = useStateP(false);
  const [dpAmount, setDpAmount] = useStateP('');
  const [dpMethod, setDpMethod] = useStateP('qris');
  const [dpDate, setDpDate] = useStateP('');

  // Tips states (edit support)
  const [hasTips, setHasTips] = useStateP(false);
  const [tips, setTips] = useStateP([{
    employee_id: '',
    amount: '',
    payment_method: 'qris'
  }]);
  const isOT = useMemoP(() => isOvertime(startTime), [startTime]);
  useEffectP(() => {
    if (!open || !transactionId) return;
    loadTransaction();
  }, [open, transactionId]);
  async function loadTransaction() {
    setLoading(true);
    try {
      const data = await getTransactionDetail(transactionId);
      setTrx(data);
      setDate(data.date);
      setStartTime(data.start_time?.slice(0, 5) || '');
      setClientName(data.client_name_snapshot || '');
      setClientPhone(data.client_phone_snapshot || '');
      setIsHomeService(!!data.is_home_service);
      setHomeServiceFee(Number(data.home_service_fee) || 0);
      setNotes(data.notes || '');

      // Reconstruct items: group by share_group_id to recombine "shared treatments" into single rows
      const rawItems = data.items || [];
      const groupedItems = [];
      const seenGroups = new Set();
      for (const it of rawItems) {
        if (it.share_group_id) {
          if (seenGroups.has(it.share_group_id)) continue;
          seenGroups.add(it.share_group_id);

          // Find all siblings with same share_group_id
          const siblings = rawItems.filter(x => x.share_group_id === it.share_group_id);
          // First sibling is "main", rest are "share_with"
          const mainItem = siblings[0];
          const sharedItems = siblings.slice(1);

          // Sum prices to reconstruct original treatment price
          const totalPrice = siblings.reduce((s, x) => s + Number(x.price || 0), 0);
          groupedItems.push({
            employee_id: mainItem.employee_id,
            service_name: mainItem.service_name,
            price: String(totalPrice),
            fixed_commission: mainItem.commission_type === 'fixed_amount' ? String(siblings.reduce((s, x) => s + Number(x.commission_amount || 0), 0)) : '',
            commission_override: data.is_home_service && mainItem.commission_type === 'percent' ? String(siblings.reduce((s, x) => s + Number(x.commission_amount || 0), 0)) : '',
            notes: mainItem.notes || '',
            share_with: sharedItems.map(s => s.employee_id),
            share_percents: siblings.map(s => Number(s.share_percent || 0)),
            _existing_share_group_id: it.share_group_id,
            // preserve for re-save
            has_complaint: !!mainItem.has_complaint,
            complaint_note: mainItem.complaint_note || ''
          });
        } else {
          // Solo item (no sharing)
          groupedItems.push({
            employee_id: it.employee_id,
            service_name: it.service_name,
            price: String(it.price),
            fixed_commission: it.commission_type === 'fixed_amount' ? String(it.commission_amount) : '',
            commission_override: data.is_home_service && it.commission_type === 'percent' ? String(it.commission_amount) : '',
            notes: it.notes || '',
            share_with: [],
            share_percents: [100],
            has_complaint: !!it.has_complaint,
            complaint_note: it.complaint_note || ''
          });
        }
      }
      setItems(groupedItems);

      // Load payment info (Tahap G)
      const payments = data.payments || [];
      const dpPayment = payments.find(p => p.is_dp);
      const sisaPayment = payments.find(p => !p.is_dp);
      if (dpPayment) {
        // Has DP
        setHasDp(true);
        setDpAmount(String(dpPayment.amount));
        setDpMethod(dpPayment.payment_method || 'qris');
        setDpDate(dpPayment.paid_at || data.date);
        setPaymentMethod(sisaPayment?.payment_method || data.payment_method || 'cash');
      } else {
        // No DP - single payment
        setHasDp(false);
        setDpAmount('');
        setDpMethod('qris');
        setDpDate(data.date);
        setPaymentMethod(sisaPayment?.payment_method || data.payment_method || 'cash');
      }

      // Load tips (edit support)
      const existingTips = data.tips || [];
      if (existingTips.length > 0) {
        setHasTips(true);
        setTips(existingTips.map(t => ({
          employee_id: t.employee_id || '',
          amount: String(t.amount || ''),
          payment_method: t.payment_method || 'qris'
        })));
      } else {
        setHasTips(false);
        setTips([{
          employee_id: '',
          amount: '',
          payment_method: 'qris'
        }]);
      }

      // Load employees for that branch
      const emps = await listEmployees(data.branch_id, false);
      setEmployees(emps);
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }
  function updateItem(idx, patch) {
    setItems(prev => prev.map((it, i) => i === idx ? {
      ...it,
      ...patch
    } : it));
  }
  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }
  function addItem() {
    setItems(prev => [...prev, {
      employee_id: '',
      service_name: '',
      price: '',
      fixed_commission: '',
      commission_override: isHomeService ? '0' : '',
      notes: '',
      share_with: [],
      share_percents: [100]
    }]);
  }
  function getItemCommission(item) {
    if (!item.service_name) return {
      rate: 0,
      amount: 0,
      type: 'percent'
    };
    // Client complaint: commission forfeited for this treatment (omset unaffected)
    if (item.has_complaint) {
      return {
        rate: 0,
        amount: 0,
        type: 'percent'
      };
    }
    const svc = getServiceDef(item.service_name);
    if (svc?.commission_type === 'percent' && item.commission_override !== undefined && item.commission_override !== null && item.commission_override !== '') {
      return {
        rate: 0,
        amount: Number(item.commission_override) || 0,
        type: 'percent_manual'
      };
    }
    return calcCommission({
      serviceName: item.service_name,
      price: Number(item.price) || 0,
      fixedAmount: Number(item.fixed_commission) || 0,
      isOT,
      branchId: trx?.branch_id
    });
  }
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  const totalCommission = items.reduce((sum, it) => sum + getItemCommission(it).amount, 0);
  const totalForEmployee = totalCommission + (isHomeService ? Number(homeServiceFee) || 0 : 0);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!clientName.trim()) {
      toast('Nama pelanggan wajib diisi', 'error');
      return;
    }
    if (!items.length) {
      toast('Minimal 1 treatment', 'error');
      return;
    }
    // Validate items including share
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.employee_id) {
        toast(`Karyawan wajib dipilih untuk treatment #${i + 1}`, 'error');
        return;
      }
      if (!it.service_name) {
        toast(`Treatment #${i + 1} wajib dipilih`, 'error');
        return;
      }
      // Harga 0 diperbolehkan (misal treatment gratis atau sudah termasuk paket),
      // yang ditolak hanya kolom yang dibiarkan kosong atau bernilai minus.
      if (it.price === '' || it.price == null || Number(it.price) < 0) {
        toast(`Harga treatment #${i + 1} wajib diisi. Isi 0 kalau gratis.`, 'error');
        return;
      }
      const svc = getServiceDef(it.service_name);
      if (svc?.commission_type === 'fixed_amount' && (it.fixed_commission === '' || it.fixed_commission == null || Number(it.fixed_commission) < 0)) {
        toast('Komisi wajib diisi. Isi 0 kalau sudah termasuk paket.', 'error');
        return;
      }
      // Share validation
      const allEmps = [it.employee_id, ...(it.share_with || [])];
      if (new Set(allEmps).size !== allEmps.length) {
        toast(`Treatment #${i + 1}: karyawan tidak boleh sama`, 'error');
        return;
      }
      if (allEmps.some(e => !e)) {
        toast(`Treatment #${i + 1}: semua karyawan harus dipilih`, 'error');
        return;
      }
      if (allEmps.length > 1) {
        const total = (it.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
        if (Math.abs(total - 100) > 0.01) {
          toast(`Treatment #${i + 1}: total persentase harus 100% (sekarang ${total}%)`, 'error');
          return;
        }
      }
    }
    setSubmitting(true);
    try {
      // Expand items with share logic (same as new transaction)
      const itemsPayload = [];
      for (const it of items) {
        const allEmps = [it.employee_id, ...(it.share_with || [])];
        const isShared = allEmps.length > 1;
        const totalPrice = Number(it.price);
        const com = getItemCommission(it);
        const svc = getServiceDef(it.service_name);
        const dbCommissionType = com.type === 'percent_manual' ? 'percent' : com.type;

        // Reuse existing share_group_id if available (for audit consistency), else generate new
        const shareGroupId = isShared ? it._existing_share_group_id || (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
        })) : null;
        allEmps.forEach((empId, idx) => {
          const sharePercent = isShared ? Number(it.share_percents[idx] || 0) : 100;
          const splitPrice = Math.round(totalPrice * sharePercent / 100);
          let splitCommissionAmount;
          if (isShared) {
            if (com.type === 'fixed_amount') {
              splitCommissionAmount = Math.round(com.amount * sharePercent / 100);
            } else {
              splitCommissionAmount = Math.round(splitPrice * com.rate / 100);
            }
          } else {
            splitCommissionAmount = com.amount;
          }
          itemsPayload.push({
            employee_id: empId,
            service_name: it.service_name,
            service_category: svc?.category || 'other',
            price: splitPrice,
            commission_type: dbCommissionType,
            commission_rate: com.rate,
            commission_amount: splitCommissionAmount,
            notes: it.notes || null,
            share_group_id: shareGroupId,
            share_percent: sharePercent,
            has_complaint: !!it.has_complaint,
            complaint_note: it.has_complaint ? it.complaint_note || null : null
          });
        });
      }

      // Validate payments
      const grandTotal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0) + (isHomeService ? Number(homeServiceFee) || 0 : 0);
      let paymentsArr;
      if (hasDp) {
        const dp = Number(dpAmount) || 0;
        const sisa = grandTotal - dp;
        if (dp <= 0) {
          toast('Jumlah DP wajib diisi (> 0)', 'error');
          setSubmitting(false);
          return;
        }
        if (dp >= grandTotal) {
          toast('DP tidak boleh ≥ total transaksi', 'error');
          setSubmitting(false);
          return;
        }
        if (!dpDate) {
          toast('Tanggal DP wajib diisi', 'error');
          setSubmitting(false);
          return;
        }
        paymentsArr = [{
          method: dpMethod,
          amount: dp,
          is_dp: true,
          paid_at: dpDate
        }, {
          method: paymentMethod,
          amount: sisa,
          is_dp: false,
          paid_at: date
        }];
      } else {
        paymentsArr = [{
          method: paymentMethod,
          amount: grandTotal,
          is_dp: false,
          paid_at: date
        }];
      }
      // Transaksi bernilai nol (misal sudah dibayar di paket awal) tidak punya
      // pembayaran untuk dicatat. Baris bernilai nol ditolak database.
      paymentsArr = paymentsArr.filter(p => Number(p.amount) > 0);

      // Update transaction (will use direct ops since paymentMethod is set)
      await updateTransactionFull({
        transactionId,
        date,
        startTime,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        isOvertime: isOT,
        isHomeService,
        homeServiceFee: Number(homeServiceFee) || 0,
        notes,
        items: itemsPayload,
        paymentMethod
      });

      // Replace payments (always run, to capture DP changes)
      await replaceTransactionPayments(transactionId, trx.branch_id, paymentsArr, profile.id);

      // Replace tips (edit support) — validate, then replace all tips for this transaction
      let tipsArr = [];
      if (hasTips) {
        for (const t of tips) {
          if (t.employee_id && (!t.amount || Number(t.amount) <= 0) || !t.employee_id && Number(t.amount) > 0) {
            toast('Tips: pastikan setiap baris ada beautician DAN jumlah > 0', 'error');
            setSubmitting(false);
            return;
          }
        }
        tipsArr = tips.filter(t => t.employee_id && Number(t.amount) > 0).map(t => ({
          employee_id: t.employee_id,
          amount: Number(t.amount),
          payment_method: t.payment_method || 'qris'
        }));
      }
      // Always replace (empties out tips if user unchecked / removed them)
      await replaceTransactionTips(transactionId, trx.branch_id, tipsArr, profile.id);
      toast('Transaksi berhasil diupdate ✓', 'success');
      onSuccess();
    } catch (err) {
      toast('Gagal update: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
      backdropFilter: 'blur(4px)'
    },
    onClick: () => !submitting && onClose()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 20,
      padding: 28,
      width: '100%',
      maxWidth: 920,
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-lg)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, "Edit Transaksi"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 26,
      fontWeight: 400,
      color: 'var(--plum-deep)'
    }
  }, "Ubah Data Transaksi"), trx && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 4
    }
  }, "Cabang: ", trx.branch?.name || '—', " · ID: ", trx.id?.slice(0, 8), "…")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "btn btn-ghost btn-sm",
    disabled: submitting
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: 'var(--mauve-tint)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--plum)',
      marginBottom: 18,
      lineHeight: 1.5
    }
  }, "💡 Semua perubahan akan tercatat di ", /*#__PURE__*/React.createElement("strong", null, "Audit Log"), " dengan timestamp dan before/after lengkap."), loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat data..."
  }) : /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Info Dasar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tanggal *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: date,
    onChange: e => setDate(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Jam Mulai *",
    hint: isOT ? '⚠️ Lembur (≥18:00)' : ''
  }, /*#__PURE__*/React.createElement("input", {
    type: "time",
    className: "form-input",
    value: startTime,
    onChange: e => setStartTime(e.target.value),
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nama Pelanggan *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: clientName,
    onChange: e => setClientName(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "No HP Pelanggan"
  }, /*#__PURE__*/React.createElement("input", {
    type: "tel",
    className: "form-input",
    value: clientPhone,
    onChange: e => setClientPhone(e.target.value),
    placeholder: "08xxx"
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Treatment",
    sub: `${items.length} treatment · Total komisi: ${fmtRp(totalCommission)}`
  }, items.map((item, idx) => {
    const svc = getServiceDef(item.service_name);
    const isFixedComm = svc?.commission_type === 'fixed_amount';
    const com = getItemCommission(item);
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        padding: 14,
        background: 'var(--cream)',
        borderRadius: 8,
        marginBottom: 10,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 9
      }
    }, "Treatment ", idx + 1), items.length > 1 && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-ghost btn-sm",
      onClick: () => removeItem(idx),
      style: {
        color: 'var(--red)',
        fontSize: 11
      }
    }, "✕ Hapus")), /*#__PURE__*/React.createElement("div", {
      className: "form-row"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Karyawan *"
    }, /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: item.employee_id,
      onChange: e => updateItem(idx, {
        employee_id: e.target.value
      }),
      required: true
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— Pilih —"), employees.map(e => /*#__PURE__*/React.createElement("option", {
      key: e.id,
      value: e.id
    }, e.full_name, " (", e.job_title, ")")))), /*#__PURE__*/React.createElement(Field, {
      label: "Treatment *"
    }, /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: item.service_name,
      onChange: e => {
        const newSvcName = e.target.value;
        const newSvc = getServiceDef(newSvcName);
        const patch = {
          service_name: newSvcName,
          fixed_commission: ''
        };
        if (isHomeService && newSvc?.commission_type === 'percent') {
          patch.commission_override = '0';
        } else {
          patch.commission_override = '';
        }
        updateItem(idx, patch);
      },
      required: true
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— Pilih —"), SERVICES.map(s => /*#__PURE__*/React.createElement("option", {
      key: s.name,
      value: s.name
    }, s.name))))), /*#__PURE__*/React.createElement("div", {
      className: "form-row"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Harga (Rp) *"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.price,
      onChange: e => updateItem(idx, {
        price: e.target.value
      }),
      placeholder: "200000",
      min: "0",
      step: "1000"
    })), isFixedComm ? /*#__PURE__*/React.createElement(Field, {
      label: "Komisi Karyawan (Rp) *",
      hint: "Input manual. Isi 0 kalau sudah termasuk paket."
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.fixed_commission,
      onChange: e => updateItem(idx, {
        fixed_commission: e.target.value
      }),
      placeholder: "50000",
      min: "0",
      step: "1000"
    }), (() => {
      const sudahPaket = (item.notes || '').toLowerCase().includes('paket');
      return /*#__PURE__*/React.createElement("label", {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          cursor: 'pointer',
          marginTop: 8,
          padding: '8px 10px',
          background: sudahPaket ? 'var(--mauve-tint)' : 'var(--cream)',
          borderRadius: 8
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: sudahPaket,
        onChange: e => updateItem(idx, e.target.checked ? {
          price: '0',
          notes: 'Sudah paket'
        } : {
          notes: ''
        }),
        style: {
          accentColor: 'var(--mauve)',
          width: 16,
          height: 16,
          marginTop: 1
        }
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12.5,
          fontWeight: 500,
          color: 'var(--plum)'
        }
      }, "Sudah termasuk paket (harga Rp 0)"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: 'var(--muted)'
        }
      }, "Client sudah bayar di awal. Komisi tetap diisi manual untuk beautician yang mengerjakan.")));
    })()) : item.service_name && isHomeService ? /*#__PURE__*/React.createElement(Field, {
      label: "Komisi Treatment (Rp)",
      hint: "Default Rp 0 (HS mode)"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.commission_override ?? '0',
      onChange: e => updateItem(idx, {
        commission_override: e.target.value
      }),
      min: "0",
      step: "1000",
      placeholder: "0",
      style: {
        borderColor: 'var(--amber)',
        background: '#fdf6e3'
      }
    })) : item.service_name ? /*#__PURE__*/React.createElement(Field, {
      label: "Komisi Otomatis",
      hint: `${com.rate}% dari harga`
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-input",
      value: fmtRp(com.amount),
      disabled: true,
      style: {
        background: 'var(--mauve-tint)',
        color: 'var(--plum)',
        fontWeight: 500
      }
    })) : /*#__PURE__*/React.createElement(Field, {
      label: "Komisi"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-input",
      value: "—",
      disabled: true
    }))), item.service_name && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '10px 12px',
        background: item.has_complaint ? '#fdf2f2' : 'var(--cream)',
        borderRadius: 8,
        border: item.has_complaint ? '1px solid var(--red)' : '1px solid transparent'
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!item.has_complaint,
      onChange: e => updateItem(idx, {
        has_complaint: e.target.checked,
        complaint_note: e.target.checked ? item.complaint_note || '' : ''
      }),
      style: {
        accentColor: 'var(--red)',
        width: 17,
        height: 17,
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        color: item.has_complaint ? 'var(--red)' : 'var(--plum)'
      }
    }, "Client mengajukan komplain (komisi tidak dihitung)"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "Omset tetap penuh. Hanya komisi beautician untuk treatment ini yang jadi Rp 0."))), item.has_complaint && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Catatan komplain (opsional, internal)"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "form-textarea",
      rows: "2",
      value: item.complaint_note || '',
      onChange: e => updateItem(idx, {
        complaint_note: e.target.value
      }),
      placeholder: "Contoh: bentuk alis tidak simetris, client minta perbaikan"
    })))), svc && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        padding: '8px 12px',
        background: 'var(--paper)',
        borderRadius: 6,
        fontSize: 12,
        color: 'var(--muted)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Kategori:"), " ", svc.category, " ·", /*#__PURE__*/React.createElement("strong", null, " Tipe komisi:"), ' ', svc.commission_type === 'percent' ? isHomeService ? 'Manual (HS mode)' : `${svc.baseRate}% (base)` : 'Manual Rp', isOT && !isHomeService && ' · ⚠️ Lembur', isHomeService && ' · 🏠 HS'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: 'var(--plum)'
      }
    }, "Komisi: ", fmtRp(com.amount))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px dashed var(--line)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow",
      style: {
        fontSize: 10
      }
    }, "👥 Kerjasama: ", (item.share_with?.length || 0) + 1, " karyawan"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-ghost btn-sm",
      onClick: () => {
        const currentShareWith = item.share_with || [];
        const newShareWith = [...currentShareWith, ''];
        const newCount = newShareWith.length + 1;
        const eqPercent = Math.floor(100 / newCount * 100) / 100;
        const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
        const newPercents = Array(newCount).fill(eqPercent);
        newPercents[newCount - 1] = remainder;
        updateItem(idx, {
          share_with: newShareWith,
          share_percents: newPercents
        });
      },
      style: {
        padding: '4px 10px',
        fontSize: 11
      }
    }, "+ Tambah Karyawan")), (item.share_with?.length || 0) > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 12,
        background: '#fef9f2',
        borderRadius: 8,
        border: '1px solid #f0e0c0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        marginBottom: 10,
        lineHeight: 1.5
      }
    }, "💡 ", /*#__PURE__*/React.createElement("strong", null, "Treatment dikerjakan bersama."), " Harga & komisi akan dibagi sesuai persentase. Total harus = 100%."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: 8,
        background: 'var(--paper)',
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--plum)'
      }
    }, "👤 ", employees.find(e => e.id === item.employee_id)?.full_name || '(belum pilih)', /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--muted)'
      }
    }, "Karyawan utama")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.share_percents?.[0] || 0,
      onChange: e => {
        const newPercents = [...(item.share_percents || [])];
        newPercents[0] = Number(e.target.value);
        updateItem(idx, {
          share_percents: newPercents
        });
      },
      min: "1",
      max: "100",
      step: "0.01",
      style: {
        width: 80,
        textAlign: 'center'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, "%")), (item.share_with || []).map((empId, sidx) => /*#__PURE__*/React.createElement("div", {
      key: sidx,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: 8,
        background: 'var(--paper)',
        borderRadius: 6
      }
    }, /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      value: empId,
      onChange: e => {
        const newShareWith = [...(item.share_with || [])];
        newShareWith[sidx] = e.target.value;
        updateItem(idx, {
          share_with: newShareWith
        });
      },
      style: {
        flex: 1,
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "— pilih karyawan partner —"), employees.filter(emp => emp.id !== item.employee_id && !(item.share_with || []).some((id, i) => i !== sidx && id === emp.id)).map(emp => /*#__PURE__*/React.createElement("option", {
      key: emp.id,
      value: emp.id
    }, emp.full_name, " ", emp.job_title ? `· ${emp.job_title}` : ''))), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      value: item.share_percents?.[sidx + 1] || 0,
      onChange: e => {
        const newPercents = [...(item.share_percents || [])];
        newPercents[sidx + 1] = Number(e.target.value);
        updateItem(idx, {
          share_percents: newPercents
        });
      },
      min: "1",
      max: "100",
      step: "0.01",
      style: {
        width: 80,
        textAlign: 'center'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, "%"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => {
        const newShareWith = (item.share_with || []).filter((_, i) => i !== sidx);
        const newCount = newShareWith.length + 1;
        const eqPercent = Math.floor(100 / newCount * 100) / 100;
        const remainder = +(100 - eqPercent * (newCount - 1)).toFixed(2);
        const newPercents = Array(newCount).fill(eqPercent);
        newPercents[newCount - 1] = remainder;
        updateItem(idx, {
          share_with: newShareWith,
          share_percents: newPercents
        });
      },
      className: "btn btn-ghost btn-sm",
      style: {
        padding: '4px 8px',
        fontSize: 11,
        color: 'var(--red)'
      }
    }, "✕"))), (() => {
      const total = (item.share_percents || []).reduce((s, p) => s + (Number(p) || 0), 0);
      const isValid = Math.abs(total - 100) < 0.01;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          padding: '6px 10px',
          borderRadius: 6,
          background: isValid ? '#ecf5ef' : '#fdf0f0',
          fontSize: 12,
          color: isValid ? 'var(--green)' : 'var(--red)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", null, "Total persentase"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, isValid ? '✓ ' : '⚠️ ', total.toFixed(2), "% ", !isValid && '(harus 100%)'));
    })(), item.price && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: 10,
        background: 'var(--cream)',
        borderRadius: 6,
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 6
      }
    }, "Pembagian harga & komisi:"), [item.employee_id, ...(item.share_with || [])].map((empId, i) => {
      const pct = Number(item.share_percents?.[i] || 0);
      const splitPrice = Math.round(Number(item.price) * pct / 100);
      const splitCom = isFixedComm ? Math.round(com.amount * pct / 100) : Math.round(splitPrice * com.rate / 100);
      const empName = employees.find(e => e.id === empId)?.full_name || '(belum pilih)';
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          padding: '3px 0',
          fontFamily: 'JetBrains Mono, monospace'
        }
      }, /*#__PURE__*/React.createElement("span", null, empName, " (", pct, "%)"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--plum)'
        }
      }, fmtRp(splitPrice), " → komisi ", fmtRp(splitCom)));
    })))));
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: addItem
  }, "+ Tambah Treatment")), /*#__PURE__*/React.createElement(Card, {
    title: "Pembayaran",
    sub: hasDp ? "Klien sudah bayar DP — input metode DP & pelunasan" : "Pilih metode pembayaran dari klien"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 14,
      padding: '10px 12px',
      background: 'var(--cream)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasDp,
    onChange: e => {
      const checked = e.target.checked;
      setHasDp(checked);
      if (!checked) {
        setDpAmount('');
      } else if (!dpDate) {
        setDpDate(date);
      }
    },
    style: {
      accentColor: 'var(--mauve)',
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, "💰 Klien sudah bayar DP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Centang jika ada DP yang sudah dibayar"))), !hasDp ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 8
    }
  }, "METODE PEMBAYARAN (FULL)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 8
    }
  }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("label", {
    key: pm.value,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 14px',
      border: '2px solid',
      borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
      borderRadius: 10,
      background: paymentMethod === pm.value ? 'var(--mauve-tint)' : 'var(--paper)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "editPaymentMethod",
    value: pm.value,
    checked: paymentMethod === pm.value,
    onChange: () => setPaymentMethod(pm.value),
    style: {
      accentColor: 'var(--mauve)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, pm.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: paymentMethod === pm.value ? 'var(--plum)' : 'var(--text)'
    }
  }, pm.label))))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      background: '#fdf6e3',
      borderRadius: 10,
      marginBottom: 14,
      border: '1px solid #f0e0c0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 10,
      color: 'var(--amber)'
    }
  }, "1. DP (UANG MUKA)"), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tanggal DP"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: dpDate,
    onChange: e => setDpDate(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Jumlah DP (Rp) *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: dpAmount,
    onChange: e => setDpAmount(e.target.value),
    placeholder: "50000",
    min: "0",
    step: "1000",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 8
    }
  }, "METODE DP"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 6
    }
  }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("label", {
    key: pm.value,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      border: '2px solid',
      borderColor: dpMethod === pm.value ? 'var(--amber)' : 'var(--line)',
      borderRadius: 8,
      background: dpMethod === pm.value ? '#fef3d7' : 'var(--paper)',
      cursor: 'pointer',
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: "editDpMethod",
    value: pm.value,
    checked: dpMethod === pm.value,
    onChange: () => setDpMethod(pm.value),
    style: {
      accentColor: 'var(--amber)'
    }
  }), /*#__PURE__*/React.createElement("span", null, pm.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, pm.label.replace('Transfer ', '')))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      border: '1px solid var(--mauve)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 10,
      color: 'var(--mauve)'
    }
  }, "2. PELUNASAN (SISA)"), (() => {
    const grandTotal = totalAmount + (isHomeService ? Number(homeServiceFee) || 0 : 0);
    const dp = Number(dpAmount) || 0;
    const sisa = grandTotal - dp;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 10,
        background: 'var(--paper)',
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Total Transaksi"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, fmtRp(grandTotal))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, "− DP ", dpMethod ? `(${getPaymentMethodLabel(dpMethod)})` : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: 'var(--amber)'
      }
    }, "−", fmtRp(dp))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 6,
        borderTop: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: 'var(--plum)'
      }
    }, "Sisa Pembayaran"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: sisa < 0 ? 'var(--red)' : 'var(--plum)',
        fontSize: 15
      }
    }, fmtRp(sisa))), sisa < 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        fontSize: 11,
        color: 'var(--red)'
      }
    }, "⚠️ DP melebihi total transaksi")), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 8
      }
    }, "METODE PELUNASAN"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 6
      }
    }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("label", {
      key: pm.value,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        border: '2px solid',
        borderColor: paymentMethod === pm.value ? 'var(--mauve)' : 'var(--line)',
        borderRadius: 8,
        background: 'var(--paper)',
        cursor: 'pointer',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "editPaymentMethodSisa",
      value: pm.value,
      checked: paymentMethod === pm.value,
      onChange: () => setPaymentMethod(pm.value),
      style: {
        accentColor: 'var(--mauve)'
      }
    }), /*#__PURE__*/React.createElement("span", null, pm.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500
      }
    }, pm.label.replace('Transfer ', ''))))));
  })()))), /*#__PURE__*/React.createElement(Card, {
    title: "Tips dari Client",
    sub: "Tips transfer/QRIS untuk beautician (tips cash langsung diterima beautician)"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: hasTips ? 14 : 0,
      padding: '10px 12px',
      background: 'var(--cream)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: hasTips,
    onChange: e => {
      const checked = e.target.checked;
      setHasTips(checked);
      if (!checked) setTips([{
        employee_id: '',
        amount: '',
        payment_method: 'qris'
      }]);
    },
    style: {
      accentColor: 'var(--mauve)',
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, "💝 Ada tips dari client (transfer/QRIS)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Tips masuk ke rekening kita, lalu diberikan ke beautician. Tercatat di gaji mereka."))), hasTips && /*#__PURE__*/React.createElement("div", null, tips.map((tip, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      padding: 12,
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      fontSize: 10
    }
  }, "Tips #", idx + 1), tips.length > 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setTips(tips.filter((_, i) => i !== idx)),
    className: "btn btn-ghost btn-sm",
    style: {
      padding: '2px 8px',
      fontSize: 11,
      color: 'var(--red)'
    }
  }, "✕ Hapus")), /*#__PURE__*/React.createElement(Field, {
    label: "Beautician Penerima *"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: tip.employee_id,
    onChange: e => {
      const next = [...tips];
      next[idx] = {
        ...next[idx],
        employee_id: e.target.value
      };
      setTips(next);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— pilih beautician —"), employees.map(emp => /*#__PURE__*/React.createElement("option", {
    key: emp.id,
    value: emp.id
  }, emp.full_name, emp.job_title ? ` · ${emp.job_title}` : '')))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Jumlah Tips (Rp) *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: tip.amount,
    onChange: e => {
      const next = [...tips];
      next[idx] = {
        ...next[idx],
        amount: e.target.value
      };
      setTips(next);
    },
    placeholder: "20000",
    min: "0",
    step: "any"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Metode"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: tip.payment_method,
    onChange: e => {
      const next = [...tips];
      next[idx] = {
        ...next[idx],
        payment_method: e.target.value
      };
      setTips(next);
    }
  }, PAYMENT_METHODS.filter(pm => pm.value !== 'cash').map(pm => /*#__PURE__*/React.createElement("option", {
    key: pm.value,
    value: pm.value
  }, pm.label))))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: () => setTips([...tips, {
      employee_id: '',
      amount: '',
      payment_method: 'qris'
    }])
  }, "+ Tambah Tips (beautician lain)"), (() => {
    const totalTips = tips.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    return totalTips > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '8px 12px',
        background: 'var(--cream)',
        borderRadius: 8,
        fontSize: 13,
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Total tips"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: 'var(--plum)'
      }
    }, fmtRp(totalTips))) : null;
  })())), /*#__PURE__*/React.createElement(Card, {
    title: "Home Service",
    sub: "Opsional — komisi treatment sudah termasuk dalam biaya HS"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isHomeService,
    onChange: e => {
      const checked = e.target.checked;
      setIsHomeService(checked);
      setItems(prev => prev.map(it => {
        const svc = getServiceDef(it.service_name);
        if (svc?.commission_type === 'percent') {
          return {
            ...it,
            commission_override: checked ? '0' : ''
          };
        }
        return it;
      }));
    },
    style: {
      accentColor: 'var(--mauve)',
      width: 18,
      height: 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, "Ini transaksi home service")), isHomeService && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: '#fdf6e3',
      borderRadius: 6,
      fontSize: 12,
      color: 'var(--plum)',
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "💡 ", /*#__PURE__*/React.createElement("strong", null, "Mode Home Service aktif"), " — komisi treatment otomatis di-set ke Rp 0."), /*#__PURE__*/React.createElement(Field, {
    label: "Biaya Home Service (Rp)",
    hint: "100% masuk komisi karyawan"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: homeServiceFee,
    onChange: e => setHomeServiceFee(e.target.value),
    placeholder: "50000",
    min: "0",
    step: "5000"
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Catatan",
    sub: "Opsional"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "form-textarea",
    rows: "2",
    value: notes,
    onChange: e => setNotes(e.target.value),
    placeholder: "Catatan tambahan..."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total Omset:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, fmtRp(totalAmount))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total Komisi Treatment:"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--mauve)'
    }
  }, fmtRp(totalCommission))), isHomeService && Number(homeServiceFee) > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 6,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", null, "Biaya Home Service (100% Karyawan):"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--mauve)'
    }
  }, fmtRp(Number(homeServiceFee)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTop: '1px solid var(--mauve)',
      fontSize: 14,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total ke Karyawan:"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--plum-deep)'
    }
  }, fmtRp(totalForEmployee)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: onClose,
    disabled: submitting
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: submitting
  }, submitting ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : 'Simpan Perubahan')))));
}

// =====================================================
// ADD EMPLOYEE MODAL (with relaxed salary for Owner/Manager)
// =====================================================
function AddEmployeeModal({
  open,
  onClose,
  onSuccess,
  profile,
  branches,
  currentBranchId
}) {
  const isSuper = profile.role === 'super_admin';
  const [submitting, setSubmitting] = useStateP(false);
  const defaultBranchId = useMemoP(() => {
    if (isSuper) return currentBranchId || profile.branch_id;
    return profile.branch_id;
  }, [profile, currentBranchId, isSuper]);
  const [form, setForm] = useStateP({
    email: '',
    password: '',
    full_name: '',
    username: '',
    job_title: 'Lash Technician',
    role: 'employee',
    base_salary: 1500000,
    meal_allowance: 0,
    skip_attendance: null,
    branch_id: defaultBranchId
  });
  const salaryOptional = isSalaryOptional(form.job_title);
  useEffectP(() => {
    if (open) {
      setForm(f => ({
        ...f,
        branch_id: defaultBranchId
      }));
    }
  }, [open, defaultBranchId]);
  function update(patch) {
    setForm(prev => ({
      ...prev,
      ...patch
    }));
  }
  function generatePassword() {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    update({
      password: pw
    });
  }

  // When job title changes, auto-clear salary fields for Owner/Manager
  function handleJobTitleChange(newTitle) {
    if (isSalaryOptional(newTitle)) {
      update({
        job_title: newTitle,
        base_salary: '',
        meal_allowance: ''
      });
    } else {
      update({
        job_title: newTitle,
        base_salary: form.base_salary || 1500000,
        meal_allowance: form.meal_allowance || 0
      });
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim()) {
      toast('Email wajib diisi', 'error');
      return;
    }
    if (!form.email.includes('@')) {
      toast('Format email tidak valid', 'error');
      return;
    }
    if (form.password.length < 6) {
      toast('Password minimal 6 karakter', 'error');
      return;
    }
    if (!form.full_name.trim()) {
      toast('Nama wajib diisi', 'error');
      return;
    }
    if (!form.username.trim()) {
      toast('Username wajib diisi', 'error');
      return;
    }
    if (!form.branch_id) {
      toast('Cabang wajib dipilih', 'error');
      return;
    }

    // Salary validation: only required for non-Owner/Manager
    let salary = 0;
    let meal = 0;
    if (salaryOptional) {
      salary = Number(form.base_salary) || 0;
      meal = Number(form.meal_allowance) || 0;
    } else {
      salary = Number(form.base_salary);
      meal = Number(form.meal_allowance) || 0;
      if (isNaN(salary) || salary < 0) {
        toast('Gaji pokok tidak boleh negatif', 'error');
        return;
      }
    }
    setSubmitting(true);
    try {
      const created = await createEmployee({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        username: form.username.trim().toLowerCase(),
        job_title: form.job_title,
        role: form.role,
        base_salary: salary,
        meal_allowance: meal,
        branch_id: form.branch_id
      });
      // Penanda absensi di-set terpisah (Edge Function tidak menangani kolom ini)
      if (form.skip_attendance && created?.id) {
        try {
          await updateEmployee(created.id, {
            skip_attendance: true
          });
        } catch (e) {}
      }
      toast('Karyawan berhasil ditambahkan! 🎉', 'success');
      onSuccess();
      onClose();
      setForm({
        email: '',
        password: '',
        full_name: '',
        username: '',
        job_title: 'Lash Technician',
        role: 'employee',
        base_salary: 1500000,
        meal_allowance: 0,
        skip_attendance: null,
        branch_id: defaultBranchId
      });
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
      backdropFilter: 'blur(4px)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 20,
      padding: 32,
      width: '100%',
      maxWidth: 560,
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-lg)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, "Onboarding"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 28,
      fontWeight: 400,
      color: 'var(--plum-deep)'
    }
  }, "Tambah Karyawan")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "btn btn-ghost btn-sm"
  }, "✕")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      background: 'var(--mauve-tint)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--plum)',
      marginBottom: 18,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Tips:"), " Karyawan akan langsung bisa login. Kasih tahu email & password ke karyawan via WA."), /*#__PURE__*/React.createElement(Field, {
    label: "Email Login *",
    hint: "Bisa pakai format desi@jbb.local kalau ga ada email asli."
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "form-input",
    value: form.email,
    onChange: e => update({
      email: e.target.value
    }),
    placeholder: "desi@jbb.local",
    required: true,
    autoComplete: "off"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password *",
    hint: "Minimal 6 karakter. Klik 'Generate' untuk password otomatis."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: form.password,
    onChange: e => update({
      password: e.target.value
    }),
    placeholder: "••••••••",
    required: true,
    minLength: 6,
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: generatePassword
  }, "Generate"))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Nama Lengkap *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: form.full_name,
    onChange: e => update({
      full_name: e.target.value
    }),
    placeholder: "Desi Kurniawan",
    required: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Username *",
    hint: "Lowercase, no space"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: form.username,
    onChange: e => update({
      username: e.target.value.toLowerCase().replace(/\s/g, '')
    }),
    placeholder: "desi",
    required: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Cabang *"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.branch_id,
    onChange: e => update({
      branch_id: e.target.value
    }),
    required: true,
    disabled: !isSuper
  }, branches.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.id,
    value: b.id
  }, b.name)))), /*#__PURE__*/React.createElement(Field, {
    label: "Jabatan *"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.job_title,
    onChange: e => handleJobTitleChange(e.target.value),
    required: true
  }, JOB_TITLES.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, t))))), /*#__PURE__*/React.createElement(Field, {
    label: "Role / Tingkat Akses *"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.role,
    onChange: e => update({
      role: e.target.value
    }),
    required: true
  }, /*#__PURE__*/React.createElement("option", {
    value: "employee"
  }, "Karyawan (akses transaksi sendiri)"), /*#__PURE__*/React.createElement("option", {
    value: "branch_admin"
  }, "Branch Admin (manage cabang)"), isSuper && /*#__PURE__*/React.createElement("option", {
    value: "super_admin"
  }, "Super Admin (akses semua cabang)"))), salaryOptional ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      background: 'var(--cream)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--muted)',
      lineHeight: 1.6,
      marginBottom: 14
    }
  }, "💡 Untuk jabatan ", /*#__PURE__*/React.createElement("strong", null, form.job_title), ", gaji pokok & uang makan biasanya tidak diisi (compensation lewat profit sharing atau tunjangan lain). Bisa dikosongkan atau diisi sesuai kebijakan internal.") : null, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Gaji Pokok (Rp)",
    hint: "Isi bebas sesuai kebijakan. Boleh 0 (misal akun kiosk)."
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.base_salary,
    onChange: e => update({
      base_salary: e.target.value
    }),
    min: "0",
    step: "any",
    placeholder: "1500000"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Uang Makan (Rp)",
    hint: salaryOptional ? 'Opsional' : 'Opsional, max Rp 500.000'
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.meal_allowance,
    onChange: e => update({
      meal_allowance: e.target.value
    }),
    min: "0",
    max: "500000",
    step: "50000",
    placeholder: "0"
  }))), (() => {
    // Centang ini artinya "kebalikan dari aturan jabatan"
    const defaultExempt = isAttendanceExemptByTitle(form.job_title);
    const checked = defaultExempt ? form.skip_attendance === false // Owner/Manager: centang = ikut absensi
    : form.skip_attendance === true; // lainnya: centang = tidak ikut absensi
    return /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        cursor: 'pointer',
        padding: '10px 12px',
        background: 'var(--cream)',
        borderRadius: 8,
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: checked,
      onChange: e => update({
        skip_attendance: e.target.checked ? defaultExempt ? false : true : null
      }),
      style: {
        accentColor: 'var(--mauve)',
        width: 17,
        height: 17,
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500
      }
    }, defaultExempt ? 'Ikut absensi harian' : 'Tidak ikut absensi harian'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, defaultExempt ? `${form.job_title} secara bawaan tidak absen. Centang kalau tetap mau ikut absensi.` : 'Untuk akun kiosk absensi atau staf yang tidak perlu absen.')));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: onClose,
    disabled: submitting
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: submitting
  }, submitting ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : 'Tambah Karyawan')))));
}

// =====================================================
// DELETE CONFIRM MODAL
// =====================================================
function DeleteConfirmModal({
  open,
  employee,
  onClose,
  onConfirm,
  deleting
}) {
  const [confirmText, setConfirmText] = useStateP('');
  const expected = employee?.full_name || '';
  const canDelete = confirmText.trim() === expected.trim();
  useEffectP(() => {
    if (open) setConfirmText('');
  }, [open]);
  if (!open || !employee) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      padding: 20,
      backdropFilter: 'blur(4px)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 20,
      padding: 32,
      width: '100%',
      maxWidth: 480,
      boxShadow: 'var(--shadow-lg)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6,
      color: 'var(--red)'
    }
  }, "⚠️ Konfirmasi Hapus"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 26,
      fontWeight: 400,
      color: 'var(--plum-deep)'
    }
  }, "Hapus Karyawan Permanen?")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: '#f0dada',
      color: 'var(--red)',
      borderRadius: 8,
      fontSize: 13,
      marginBottom: 16,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Peringatan:"), " Aksi ini akan menghapus permanen akun ", /*#__PURE__*/React.createElement("strong", null, employee.full_name), " dari database & login. Tidak bisa di-undo.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "Catatan:"), " Kalau karyawan ini sudah punya transaksi tercatat, sistem akan menolak penghapusan untuk menjaga integritas laporan. Gunakan tombol ", /*#__PURE__*/React.createElement("strong", null, "Nonaktifkan"), " saja."), /*#__PURE__*/React.createElement(Field, {
    label: `Ketik nama lengkap "${expected}" untuk konfirmasi`
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: confirmText,
    onChange: e => setConfirmText(e.target.value),
    placeholder: expected,
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: onClose,
    disabled: deleting
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-danger",
    onClick: onConfirm,
    disabled: !canDelete || deleting,
    style: canDelete && !deleting ? {
      background: 'var(--red)',
      color: '#fff',
      borderColor: 'var(--red)'
    } : {}
  }, deleting ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : 'Hapus Permanen'))));
}

// =====================================================
// EMPLOYEES PAGE
// =====================================================
function EmployeesPage({
  profile,
  currentBranchId,
  branches
}) {
  const [employees, setEmployees] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [editingId, setEditingId] = useStateP(null);
  const [editForm, setEditForm] = useStateP({});
  const [saving, setSaving] = useStateP(false);
  const [showInactive, setShowInactive] = useStateP(false);
  const [showAddModal, setShowAddModal] = useStateP(false);
  const [deleteTarget, setDeleteTarget] = useStateP(null);
  const [deleting, setDeleting] = useStateP(false);
  const [viewingEmployee, setViewingEmployee] = useStateP(null);
  const isSuper = profile.role === 'super_admin';
  async function load() {
    setLoading(true);
    try {
      const filterBranch = isSuper ? currentBranchId : null;
      const data = await listEmployees(filterBranch, false);
      setEmployees(data);
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    load();
  }, [currentBranchId]);
  function startEdit(emp) {
    setEditingId(emp.id);
    setEditForm({
      full_name: emp.full_name,
      username: emp.username,
      job_title: emp.job_title,
      base_salary: emp.base_salary,
      meal_allowance: emp.meal_allowance,
      skip_attendance: emp.skip_attendance === null || emp.skip_attendance === undefined ? null : !!emp.skip_attendance,
      branch_id: emp.branch_id
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }
  async function saveEdit(id) {
    if (!editForm.full_name?.trim()) {
      toast('Nama wajib diisi', 'error');
      return;
    }
    if (!editForm.username?.trim()) {
      toast('Username wajib diisi', 'error');
      return;
    }
    const salaryOptional = isSalaryOptional(editForm.job_title);
    let salary = 0;
    let meal = 0;
    if (salaryOptional) {
      salary = Number(editForm.base_salary) || 0;
      meal = Number(editForm.meal_allowance) || 0;
    } else {
      salary = Number(editForm.base_salary);
      meal = Number(editForm.meal_allowance) || 0;
      if (isNaN(salary) || salary < 0) {
        toast('Gaji pokok tidak boleh negatif', 'error');
        return;
      }
      if (meal < 0 || meal > 500000) {
        toast('Uang makan: Rp 0 – Rp 500.000', 'error');
        return;
      }
    }
    setSaving(true);
    try {
      const patch = {
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim(),
        job_title: editForm.job_title,
        base_salary: salary,
        meal_allowance: meal,
        skip_attendance: editForm.skip_attendance === null || editForm.skip_attendance === undefined ? null : !!editForm.skip_attendance
      };
      if (isSuper && editForm.branch_id) patch.branch_id = editForm.branch_id;
      await updateEmployee(id, patch);
      toast('Data tersimpan', 'success');
      cancelEdit();
      load();
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }
  async function handleDeactivate(emp) {
    if (!window.confirm(`Nonaktifkan ${emp.full_name}?`)) return;
    try {
      await deactivateEmployee(emp.id);
      toast('Karyawan dinonaktifkan', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    }
  }
  async function handleReactivate(emp) {
    try {
      await reactivateEmployee(emp.id);
      toast('Karyawan diaktifkan kembali', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + err.message, 'error');
    }
  }
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast('Karyawan dihapus permanen', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      if (err.hasTransactions) {
        toast(err.message, 'error');
      } else {
        toast('Gagal: ' + (err.message || err), 'error');
      }
    } finally {
      setDeleting(false);
    }
  }
  const visibleEmployees = showInactive ? employees : employees.filter(e => e.is_active !== false);
  const headerSub = isSuper ? currentBranchId ? branches.find(b => b.id === currentBranchId)?.name : 'Semua Cabang' : 'Kelola Data';

  // If admin clicked an employee name, show their dashboard view
  if (viewingEmployee) {
    return /*#__PURE__*/React.createElement(AdminEmployeeView, {
      profile: profile,
      employee: viewingEmployee,
      branches: branches,
      onBack: () => setViewingEmployee(null)
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Karyawan",
    sub: headerSub
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      color: 'var(--muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showInactive,
    onChange: e => setShowInactive(e.target.checked),
    style: {
      accentColor: 'var(--mauve)'
    }
  }), "Tampilkan yang nonaktif"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setShowAddModal(true)
  }, "+ Tambah Karyawan")), /*#__PURE__*/React.createElement(Card, null, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !visibleEmployees.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada karyawan",
    sub: "Klik '+ Tambah Karyawan' untuk mulai."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Nama"), isSuper && /*#__PURE__*/React.createElement("th", null, "Cabang"), /*#__PURE__*/React.createElement("th", null, "Username"), /*#__PURE__*/React.createElement("th", null, "Jabatan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Gaji Pokok"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Uang Makan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Tetap"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, visibleEmployees.map(emp => {
    const isEditing = editingId === emp.id;
    const totalFixed = (emp.base_salary || 0) + (emp.meal_allowance || 0);
    const editSalaryOptional = isEditing && isSalaryOptional(editForm.job_title);
    return /*#__PURE__*/React.createElement("tr", {
      key: emp.id
    }, /*#__PURE__*/React.createElement("td", null, isEditing ? /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      style: {
        padding: '6px 10px',
        fontSize: 13
      },
      value: editForm.full_name,
      onChange: e => setEditForm({
        ...editForm,
        full_name: e.target.value
      })
    }) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setViewingEmployee(emp),
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontWeight: 500,
        color: 'var(--plum-deep)',
        textAlign: 'left',
        textDecoration: 'underline',
        textDecorationColor: 'var(--mauve)',
        textUnderlineOffset: 3,
        fontFamily: 'inherit',
        fontSize: 'inherit'
      },
      title: "Klik untuk lihat dashboard karyawan"
    }, emp.full_name), emp.role === 'super_admin' && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-gold",
      style: {
        marginTop: 2,
        display: 'inline-block',
        marginLeft: 6
      }
    }, "super"), emp.role === 'branch_admin' && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve",
      style: {
        marginTop: 2,
        display: 'inline-block',
        marginLeft: 6
      }
    }, "admin"))), isSuper && /*#__PURE__*/React.createElement("td", null, isEditing ? /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      style: {
        padding: '6px 10px',
        fontSize: 13
      },
      value: editForm.branch_id,
      onChange: e => setEditForm({
        ...editForm,
        branch_id: e.target.value
      })
    }, branches.map(b => /*#__PURE__*/React.createElement("option", {
      key: b.id,
      value: b.id
    }, b.name))) : /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve"
    }, emp.branch?.name)), /*#__PURE__*/React.createElement("td", null, isEditing ? /*#__PURE__*/React.createElement("input", {
      className: "form-input",
      style: {
        padding: '6px 10px',
        fontSize: 13
      },
      value: editForm.username,
      onChange: e => setEditForm({
        ...editForm,
        username: e.target.value
      })
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, emp.username)), /*#__PURE__*/React.createElement("td", null, isEditing ? /*#__PURE__*/React.createElement("select", {
      className: "form-select",
      style: {
        padding: '6px 10px',
        fontSize: 13
      },
      value: editForm.job_title,
      onChange: e => setEditForm({
        ...editForm,
        job_title: e.target.value
      })
    }, JOB_TITLES.map(t => /*#__PURE__*/React.createElement("option", {
      key: t,
      value: t
    }, t))) : /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve"
    }, emp.job_title)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, isEditing ? /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      style: {
        padding: '6px 10px',
        fontSize: 13,
        textAlign: 'right',
        width: 130
      },
      value: editForm.base_salary || '',
      onChange: e => setEditForm({
        ...editForm,
        base_salary: e.target.value
      }),
      placeholder: editSalaryOptional ? 'opsional' : ''
    }) : fmtRpOrDash(emp.base_salary)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, isEditing ? /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-input",
      style: {
        padding: '6px 10px',
        fontSize: 13,
        textAlign: 'right',
        width: 120
      },
      value: editForm.meal_allowance || '',
      onChange: e => setEditForm({
        ...editForm,
        meal_allowance: e.target.value
      }),
      placeholder: "0"
    }) : fmtRpOrDash(emp.meal_allowance)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric",
      style: {
        fontWeight: 500
      }
    }, totalFixed > 0 ? fmtRp(totalFixed) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)',
        fontWeight: 400
      }
    }, "—")), /*#__PURE__*/React.createElement("td", null, emp.is_active === false ? /*#__PURE__*/React.createElement("span", {
      className: "badge badge-red"
    }, "nonaktif") : /*#__PURE__*/React.createElement("span", {
      className: "badge badge-green"
    }, "aktif"), isEditing ? (() => {
      const defExempt = isAttendanceExemptByTitle(editForm.job_title);
      const checked = defExempt ? editForm.skip_attendance === false : editForm.skip_attendance === true;
      return /*#__PURE__*/React.createElement("label", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 6,
          fontSize: 11,
          color: 'var(--muted)',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: checked,
        onChange: e => setEditForm({
          ...editForm,
          skip_attendance: e.target.checked ? defExempt ? false : true : null
        }),
        style: {
          accentColor: 'var(--mauve)'
        }
      }), defExempt ? 'ikut absensi' : 'tidak ikut absensi');
    })() : isAttendanceExempt(emp) && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--muted)',
        marginTop: 4,
        whiteSpace: 'nowrap'
      }
    }, "tidak ikut absensi")), /*#__PURE__*/React.createElement("td", null, isEditing ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => saveEdit(emp.id),
      disabled: saving
    }, saving ? '...' : 'Simpan'), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: cancelEdit,
      disabled: saving
    }, "Batal")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => startEdit(emp)
    }, "Edit"), emp.is_active === false ? /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => handleReactivate(emp)
    }, "Aktifkan") : emp.role !== 'super_admin' && emp.id !== profile.id ? /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => handleDeactivate(emp)
    }, "Nonaktifkan") : null, emp.role !== 'super_admin' && emp.id !== profile.id && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-danger btn-sm",
      onClick: () => setDeleteTarget(emp),
      title: "Hapus permanen (hanya bisa jika belum ada transaksi)",
      style: {
        background: 'var(--red)',
        color: '#fff',
        borderColor: 'var(--red)'
      }
    }, "🗑"))));
  }))))), /*#__PURE__*/React.createElement(AddEmployeeModal, {
    open: showAddModal,
    onClose: () => setShowAddModal(false),
    onSuccess: load,
    profile: profile,
    branches: branches,
    currentBranchId: currentBranchId
  }), /*#__PURE__*/React.createElement(DeleteConfirmModal, {
    open: !!deleteTarget,
    employee: deleteTarget,
    onClose: () => setDeleteTarget(null),
    onConfirm: handleDeleteConfirm,
    deleting: deleting
  }));
}

// =====================================================
// REPORTS PAGE — Tahap C1
// =====================================================
function ReportsPage({
  profile,
  currentBranchId,
  branches
}) {
  const isSuper = profile.role === 'super_admin';

  // Filters
  const [presetId, setPresetId] = useStateP('today');
  const [customFrom, setCustomFrom] = useStateP(todayStr());
  const [customTo, setCustomTo] = useStateP(todayStr());
  const [employeeFilter, setEmployeeFilter] = useStateP('');

  // Data
  const [transactions, setTransactions] = useStateP([]);
  const [employees, setEmployees] = useStateP([]);
  const [paymentFlow, setPaymentFlow] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [flowDetailMethod, setFlowDetailMethod] = useStateP(null); // payment method clicked for detail
  const [showOmsetDetail, setShowOmsetDetail] = useStateP(false); // Total Omset clicked → show all transactions

  // Effective date range
  const range = useMemoP(() => {
    if (presetId === 'custom') return {
      from: customFrom,
      to: customTo
    };
    const preset = DATE_PRESETS.find(p => p.id === presetId);
    return preset?.getRange() || {
      from: todayStr(),
      to: todayStr()
    };
  }, [presetId, customFrom, customTo]);

  // Effective branch (super_admin can switch; others locked)
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;

  // Load employees for filter dropdown
  useEffectP(() => {
    listEmployees(effectiveBranchId, false).then(setEmployees).catch(err => console.warn('Employees load:', err));
  }, [effectiveBranchId]);

  // Load transactions on range/branch/employee change
  async function loadData() {
    setLoading(true);
    try {
      const data = await getReportTransactions({
        from: range.from,
        to: range.to,
        branchId: effectiveBranchId
      });
      setTransactions(data);
      // Derive payment flow directly from loaded transactions (they include payments).
      // No separate query → no silent failure, works for every period.
      setPaymentFlow(computePaymentFlow(data));
    } catch (err) {
      toast('Gagal memuat laporan: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    loadData();
  }, [range.from, range.to, effectiveBranchId]);

  // Aggregate stats (respects employee filter)
  const stats = useMemoP(() => {
    return aggregateReport(transactions, employeeFilter || null);
  }, [transactions, employeeFilter]);

  // Format range for display
  const rangeLabel = useMemoP(() => {
    if (range.from === range.to) return fmtDate(range.from);
    return `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
  }, [range]);
  const branchLabel = effectiveBranchId ? branches.find(b => b.id === effectiveBranchId)?.name : isSuper ? 'Semua Cabang' : '—';

  // Category labels
  const categoryLabels = {
    lash: 'Eyelash',
    brow: 'Brow & Sulam',
    facial: 'Facial',
    nail: 'Nail',
    other: 'Lainnya'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Laporan",
    sub: branchLabel
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      if (!transactions.length) {
        toast('Tidak ada data untuk diexport', 'error');
        return;
      }
      try {
        exportReportToExcel({
          transactions,
          stats,
          periodLabel: rangeLabel,
          branchLabel
        });
        toast('Excel berhasil di-download ✓', 'success');
      } catch (err) {
        toast('Gagal export: ' + err.message, 'error');
      }
    },
    disabled: loading || !transactions.length
  }, "📥 Export Excel")), /*#__PURE__*/React.createElement(Card, {
    title: "Filter",
    sub: "Pilih periode & karyawan"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, DATE_PRESETS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    type: "button",
    className: 'btn btn-sm ' + (presetId === p.id ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPresetId(p.id)
  }, p.label))), presetId === 'custom' && /*#__PURE__*/React.createElement("div", {
    className: "form-row",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Dari Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customFrom,
    onChange: e => setCustomFrom(e.target.value),
    max: customTo
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sampai Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customTo,
    onChange: e => setCustomTo(e.target.value),
    min: customFrom
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Karyawan",
    hint: "Filter untuk lihat performa 1 karyawan saja"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: employeeFilter,
    onChange: e => setEmployeeFilter(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Semua Karyawan —"), employees.map(emp => /*#__PURE__*/React.createElement("option", {
    key: emp.id,
    value: emp.id
  }, emp.full_name, " · ", emp.job_title)))), /*#__PURE__*/React.createElement(Field, {
    label: "Periode Aktif"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: rangeLabel,
    disabled: true,
    style: {
      background: 'var(--mauve-tint)',
      color: 'var(--plum)',
      fontWeight: 500
    }
  })))), loading ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Loader, {
    text: "Menghitung laporan..."
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setShowOmsetDetail(true),
    title: "Klik untuk lihat semua transaksi di periode ini",
    style: {
      cursor: 'pointer',
      transition: 'all 0.15s',
      borderRadius: 12
    },
    onMouseEnter: e => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(122,102,126,0.15)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.boxShadow = 'none';
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: (employeeFilter ? 'Total Revenue (Treatment-nya)' : 'Total Omset') + ' 🔍',
    value: fmtRp(stats.totalRevenue),
    sub: `${stats.trxCount} transaksi · ${stats.itemCount} treatment`
  })), /*#__PURE__*/React.createElement(Metric, {
    label: "Total Komisi",
    value: fmtRp(stats.totalCommission),
    sub: employeeFilter ? 'untuk karyawan ini' : 'semua karyawan'
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Rata-rata per Transaksi",
    value: fmtRp(stats.avgPerTrx),
    sub: `${stats.trxCount > 0 ? Math.round(stats.itemCount / stats.trxCount * 10) / 10 : 0} treatment/transaksi`
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Lembur & Home Service",
    value: `${stats.overtimeTrxs} / ${stats.homeServiceTrxs}`,
    sub: "lembur · home service"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Aliran Uang",
    sub: "Breakdown pemasukan per metode pembayaran"
  }, paymentFlow.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada data pembayaran",
    sub: "Belum ada transaksi/pembayaran di periode ini."
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 10,
      marginBottom: 16
    }
  }, paymentFlow.map(pf => {
    const total = paymentFlow.reduce((s, p) => s + Number(p.total_amount || 0), 0);
    const pct = total > 0 ? (Number(pf.total_amount) / total * 100).toFixed(1) : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: pf.payment_method,
      onClick: () => setFlowDetailMethod(pf.payment_method),
      title: "Klik untuk lihat transaksi yang pakai metode ini",
      style: {
        padding: 14,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.15s'
      },
      onMouseEnter: e => {
        e.currentTarget.style.borderColor = 'var(--mauve)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(122,102,126,0.12)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.borderColor = 'var(--line)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, getPaymentMethodIcon(pf.payment_method)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--plum)'
      }
    }, getPaymentMethodLabel(pf.payment_method)), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontSize: 11,
        color: 'var(--mauve)'
      }
    }, "›")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 22,
        fontWeight: 400,
        color: 'var(--plum-deep)',
        marginBottom: 4
      }
    }, fmtRp(pf.total_amount)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", null, pf.payment_count, " pembayaran"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--mauve)',
        fontWeight: 500
      }
    }, pct, "%")), Number(pf.dp_count) > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--amber)',
        marginTop: 4
      }
    }, "💰 ", pf.dp_count, " via DP · ", pf.full_count, " pelunasan/full"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 4
    }
  }, "TOTAL ALIRAN UANG"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, paymentFlow.reduce((s, p) => s + Number(p.payment_count || 0), 0), " total pembayaran (", paymentFlow.reduce((s, p) => s + Number(p.dp_count || 0), 0), " DP)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 24,
      fontWeight: 500,
      color: 'var(--plum-deep)'
    }
  }, fmtRp(paymentFlow.reduce((s, p) => s + Number(p.total_amount || 0), 0)))))), flowDetailMethod && (() => {
    const method = flowDetailMethod;
    // Transactions that used this method (main payment_method or any payment row)
    const matched = transactions.filter(t => {
      if ((t.payment_method || 'cash') === method) return true;
      if ((t.payments || []).some(p => (p.payment_method || '') === method)) return true;
      return false;
    });
    // Sum the amount attributable to this method
    let methodTotal = 0;
    for (const t of matched) {
      const pays = t.payments || [];
      if (pays.length > 0) {
        for (const p of pays) if ((p.payment_method || '') === method) methodTotal += Number(p.amount || 0);
      } else if ((t.payment_method || 'cash') === method) {
        methodTotal += Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
      }
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(36,26,44,0.6)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      },
      onClick: () => setFlowDetailMethod(null)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--paper)',
        borderRadius: 16,
        padding: 0,
        maxWidth: 560,
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 20px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 22
      }
    }, getPaymentMethodIcon(method)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 22,
        fontWeight: 600,
        color: 'var(--plum-deep)'
      }
    }, getPaymentMethodLabel(method))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)',
        marginTop: 3
      }
    }, matched.length, " transaksi · Total ", fmtRp(methodTotal))), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setFlowDetailMethod(null)
    }, "✕ Tutup")), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowY: 'auto',
        padding: '12px 16px'
      }
    }, matched.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
      title: "Tidak ada transaksi",
      sub: "Tidak ada transaksi dengan metode ini."
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, matched.map(t => {
      const empNames = [...new Set((t.items || []).map(i => i.employee?.full_name).filter(Boolean))].join(', ');
      const pays = t.payments || [];
      const methodAmt = pays.length > 0 ? pays.filter(p => (p.payment_method || '') === method).reduce((s, p) => s + Number(p.amount || 0), 0) : Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
      const isDpPartial = pays.length > 0 && pays.some(p => p.is_dp);
      return /*#__PURE__*/React.createElement("div", {
        key: t.id,
        style: {
          padding: '10px 12px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          fontSize: 14
        }
      }, t.client_name_snapshot || '-'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--muted)',
          marginTop: 2
        }
      }, fmtDate(t.date), t.start_time ? ` · ${t.start_time.slice(0, 5)}` : '', empNames ? ` · ${empNames}` : ''), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: 'var(--mauve)',
          marginTop: 2
        }
      }, (t.items || []).map(i => i.service_name).join(', '))), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--plum-deep)'
        }
      }, fmtRp(methodAmt)), isDpPartial && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          color: 'var(--amber)',
          marginTop: 2
        }
      }, "termasuk DP"))));
    })))));
  })(), showOmsetDetail && (() => {
    const sorted = [...transactions].sort((a, b) => {
      const dA = a.date || '',
        dB = b.date || '';
      if (dA !== dB) return dA < dB ? 1 : -1; // newest first
      return (b.start_time || '').localeCompare(a.start_time || '');
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(36,26,44,0.6)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      },
      onClick: () => setShowOmsetDetail(false)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--paper)',
        borderRadius: 16,
        padding: 0,
        maxWidth: 600,
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      },
      onClick: e => e.stopPropagation()
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '18px 20px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 22,
        fontWeight: 600,
        color: 'var(--plum-deep)'
      }
    }, employeeFilter ? 'Detail Revenue' : 'Detail Total Omset'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)',
        marginTop: 3
      }
    }, sorted.length, " transaksi · Total ", fmtRp(stats.totalRevenue))), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setShowOmsetDetail(false)
    }, "✕ Tutup")), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowY: 'auto',
        padding: '12px 16px'
      }
    }, sorted.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
      title: "Tidak ada transaksi",
      sub: "Belum ada transaksi di periode ini."
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, sorted.map(t => {
      const empNames = [...new Set((t.items || []).map(i => i.employee?.full_name).filter(Boolean))].join(', ');
      const omset = Number(t.total_amount || 0) + (t.is_home_service ? Number(t.home_service_fee || 0) : 0);
      return /*#__PURE__*/React.createElement("div", {
        key: t.id,
        style: {
          padding: '10px 12px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 500,
          fontSize: 14
        }
      }, t.client_name_snapshot || '-'), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: 'var(--muted)',
          marginTop: 2
        }
      }, fmtDate(t.date), t.start_time ? ` · ${t.start_time.slice(0, 5)}` : '', empNames ? ` · ${empNames}` : ''), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          color: 'var(--mauve)',
          marginTop: 2
        }
      }, (t.items || []).map(i => i.service_name).join(', '))), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          color: 'var(--plum-deep)'
        }
      }, fmtRp(omset)), t.is_home_service && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 10,
          color: 'var(--amber)',
          marginTop: 2
        }
      }, "+ home service"))));
    })))));
  })(), /*#__PURE__*/React.createElement(Card, {
    title: "Breakdown per Kategori",
    sub: "Distribusi service di periode ini"
  }, Object.keys(stats.byCategory).length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    title: "Tidak ada data",
    sub: "Belum ada transaksi di periode ini."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Kategori"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Jumlah Treatment"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Revenue"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Komisi"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "% dari Omset"))), /*#__PURE__*/React.createElement("tbody", null, Object.entries(stats.byCategory).sort(([, a], [, b]) => b.revenue - a.revenue).map(([cat, d]) => /*#__PURE__*/React.createElement("tr", {
    key: cat
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-mauve"
  }, categoryLabels[cat] || cat)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, d.count), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      fontWeight: 500
    }
  }, fmtRp(d.revenue)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)'
    }
  }, fmtRp(d.commission)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, stats.totalRevenue > 0 ? `${Math.round(d.revenue / stats.totalRevenue * 100)}%` : '—'))))))), !employeeFilter && stats.topPerformers.length > 0 && /*#__PURE__*/React.createElement(Card, {
    title: "Top Performer",
    sub: "Karyawan dengan komisi tertinggi di periode ini"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Rank"), /*#__PURE__*/React.createElement("th", null, "Karyawan"), /*#__PURE__*/React.createElement("th", null, "Jabatan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Treatment"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Revenue"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi"))), /*#__PURE__*/React.createElement("tbody", null, stats.topPerformers.slice(0, 5).map((emp, i) => /*#__PURE__*/React.createElement("tr", {
    key: emp.employee_id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: 12,
      background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--mauve-tint)' : 'var(--cream)',
      color: i === 0 ? '#fff' : 'var(--plum)',
      fontWeight: 600,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, i + 1)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, emp.full_name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-mauve"
  }, emp.job_title)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, emp.items), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, fmtRp(emp.revenue)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)',
      fontWeight: 500
    }
  }, fmtRp(emp.commission)))))))), stats.topSpenders.length > 0 && /*#__PURE__*/React.createElement(Card, {
    title: "Top Pelanggan",
    sub: "Pelanggan dengan total belanja tertinggi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Rank"), /*#__PURE__*/React.createElement("th", null, "Nama"), /*#__PURE__*/React.createElement("th", null, "HP"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Kunjungan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Belanja"))), /*#__PURE__*/React.createElement("tbody", null, stats.topSpenders.slice(0, 5).map((c, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: 12,
      background: i === 0 ? 'var(--gold)' : 'var(--cream)',
      color: i === 0 ? '#fff' : 'var(--plum)',
      fontWeight: 600,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, i + 1)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, c.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, c.phone || '—')), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, c.visits, "x"), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      fontWeight: 500
    }
  }, fmtRp(c.spent)))))))), Object.keys(stats.byService).length > 0 && /*#__PURE__*/React.createElement(Card, {
    title: "Top Treatment",
    sub: "Treatment paling laris di periode ini"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Treatment"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Jumlah"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Revenue"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi"))), /*#__PURE__*/React.createElement("tbody", null, Object.entries(stats.byService).sort(([, a], [, b]) => b.count - a.count).slice(0, 8).map(([name, d]) => /*#__PURE__*/React.createElement("tr", {
    key: name
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, name), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, d.count, "x"), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, fmtRp(d.revenue)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)'
    }
  }, fmtRp(d.commission)))))))), stats.trxCount === 0 && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada data",
    sub: `Tidak ada transaksi di periode ${rangeLabel}.`
  }))));
}

// =====================================================
// KAS PAGE — Uang Keluar (pengeluaran) + saldo per metode
// =====================================================
function KasPage({
  profile,
  currentBranchId,
  branches
}) {
  const isSuper = profile.role === 'super_admin';
  const isAdmin = profile.role === 'super_admin' || profile.role === 'branch_admin';
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;

  // Period filter
  const [presetId, setPresetId] = useStateP('thisMonth');
  const [customFrom, setCustomFrom] = useStateP(todayStr());
  const [customTo, setCustomTo] = useStateP(todayStr());
  const range = useMemoP(() => {
    if (presetId === 'custom') return {
      from: customFrom,
      to: customTo
    };
    const preset = DATE_PRESETS.find(p => p.id === presetId);
    return preset?.getRange() || {
      from: todayStr(),
      to: todayStr()
    };
  }, [presetId, customFrom, customTo]);

  // Data
  const [expenses, setExpenses] = useStateP([]);
  const [balance, setBalance] = useStateP(null);
  const [loading, setLoading] = useStateP(true);

  // New expense form
  const [exDate, setExDate] = useStateP(todayStr());
  const [exDesc, setExDesc] = useStateP('');
  const [exAmount, setExAmount] = useStateP('');
  const [exMethod, setExMethod] = useStateP('cash');
  const [exNotes, setExNotes] = useStateP('');
  const [submitting, setSubmitting] = useStateP(false);

  // Edit state
  const [editingId, setEditingId] = useStateP(null);
  const [editForm, setEditForm] = useStateP({});
  const [deleteTarget, setDeleteTarget] = useStateP(null);
  async function loadData() {
    setLoading(true);
    try {
      const [exp, bal] = await Promise.all([listExpenses({
        from: range.from,
        to: range.to,
        branchId: effectiveBranchId
      }), getCashBalance({
        from: range.from,
        to: range.to,
        branchId: effectiveBranchId
      }).catch(e => {
        console.warn('balance:', e);
        return null;
      })]);
      setExpenses(exp);
      setBalance(bal);
    } catch (err) {
      toast('Gagal memuat kas: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    loadData();
  }, [range.from, range.to, effectiveBranchId]);
  async function handleAddExpense() {
    if (!effectiveBranchId) {
      toast('Pilih cabang dulu', 'error');
      return;
    }
    if (!exDesc.trim()) {
      toast('Keterangan wajib diisi', 'error');
      return;
    }
    if (!exAmount || Number(exAmount) <= 0) {
      toast('Jumlah harus > 0', 'error');
      return;
    }
    if (!exDate) {
      toast('Tanggal wajib diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await createExpense({
        branchId: effectiveBranchId,
        date: exDate,
        description: exDesc,
        amount: Number(exAmount),
        paymentMethod: exMethod,
        notes: exNotes,
        createdBy: profile.id
      });
      toast('Pengeluaran dicatat! 💸', 'success');
      setExDesc('');
      setExAmount('');
      setExNotes('');
      setExMethod('cash');
      setExDate(todayStr());
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSubmitting(false);
    }
  }
  function startEdit(e) {
    setEditingId(e.id);
    setEditForm({
      date: e.date,
      description: e.description,
      amount: e.amount,
      payment_method: e.payment_method,
      notes: e.notes || ''
    });
  }
  async function saveEdit(id) {
    if (!editForm.description?.trim()) {
      toast('Keterangan wajib diisi', 'error');
      return;
    }
    if (!editForm.amount || Number(editForm.amount) <= 0) {
      toast('Jumlah harus > 0', 'error');
      return;
    }
    try {
      await updateExpense(id, {
        date: editForm.date,
        description: editForm.description,
        amount: Number(editForm.amount),
        paymentMethod: editForm.payment_method,
        notes: editForm.notes
      });
      toast('Pengeluaran diperbarui', 'success');
      setEditingId(null);
      loadData();
    } catch (err) {
      toast('Gagal edit: ' + (err.message || err), 'error');
    }
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      toast('Pengeluaran dihapus', 'success');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast('Gagal hapus: ' + (err.message || err), 'error');
    }
  }
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const branchName = effectiveBranchId ? branches.find(b => b.id === effectiveBranchId)?.name : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Kas — Uang Keluar",
    sub: branchName || (isSuper ? 'Pilih cabang di pojok kanan atas' : 'Cabang')
  }), !effectiveBranchId && isSuper && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Empty, {
    title: "Pilih Cabang",
    desc: "Pilih cabang di dropdown pojok kanan atas untuk melihat & mencatat pengeluaran."
  })), effectiveBranchId && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    title: "Filter Periode",
    sub: "Pilih rentang waktu untuk saldo & daftar pengeluaran"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: presetId === 'custom' ? 14 : 0
    }
  }, DATE_PRESETS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    className: 'btn btn-sm ' + (presetId === p.id ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPresetId(p.id)
  }, p.label))), presetId === 'custom' && /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Dari Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customFrom,
    onChange: e => setCustomFrom(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sampai Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customTo,
    onChange: e => setCustomTo(e.target.value)
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Saldo Kas",
    sub: "Uang masuk (transaksi + tips) − uang keluar (pengeluaran) per metode"
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Menghitung saldo..."
  }) : balance && balance.byMethod.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid",
    style: {
      marginBottom: 16
    }
  }, balance.byMethod.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.method,
    style: {
      padding: 16,
      borderRadius: 12,
      background: m.balance >= 0 ? 'var(--cream)' : '#fbeaea',
      border: '1px solid ' + (m.balance >= 0 ? 'var(--gold-soft, #e8dcc0)' : '#e8c4c4')
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, getPaymentMethodIcon(m.method)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, getPaymentMethodLabel(m.method))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 24,
      fontWeight: 600,
      color: m.balance >= 0 ? 'var(--plum-deep)' : 'var(--red)'
    }
  }, fmtRp(m.balance)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 6,
      lineHeight: 1.5
    }
  }, "Masuk: ", fmtRp(m.in), /*#__PURE__*/React.createElement("br", null), "Keluar: ", fmtRp(m.out))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 16px',
      background: 'var(--plum-deep)',
      borderRadius: 12,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.7,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, "Total Saldo Kas"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.6,
      marginTop: 2
    }
  }, "Masuk ", fmtRp(balance.totalIn), " · Keluar ", fmtRp(balance.totalOut))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 28,
      fontWeight: 600
    }
  }, fmtRp(balance.totalBalance)))) : /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada data",
    desc: "Belum ada transaksi atau pengeluaran di periode ini."
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Catat Pengeluaran Baru",
    sub: "Beli kapas, cotton bud, perlengkapan, dll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tanggal *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: exDate,
    onChange: e => setExDate(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sumber Dana *"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: exMethod,
    onChange: e => setExMethod(e.target.value)
  }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("option", {
    key: pm.value,
    value: pm.value
  }, pm.label))))), /*#__PURE__*/React.createElement(Field, {
    label: "Keterangan / Dipakai Untuk Apa *"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: exDesc,
    onChange: e => setExDesc(e.target.value),
    placeholder: "Contoh: Beli kapas & cotton bud"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Jumlah (Rp) *"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: exAmount,
    onChange: e => setExAmount(e.target.value),
    placeholder: "50000",
    min: "0",
    step: "any"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Catatan (opsional)"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: exNotes,
    onChange: e => setExNotes(e.target.value),
    placeholder: "Toko, dll"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleAddExpense,
    disabled: submitting
  }, submitting ? 'Menyimpan...' : '💸 Catat Pengeluaran')), /*#__PURE__*/React.createElement(Card, {
    title: "Daftar Pengeluaran",
    sub: `${expenses.length} pengeluaran · Total ${fmtRp(totalExpense)}`
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : expenses.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada pengeluaran",
    desc: "Catat pengeluaran pertama di form atas."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, expenses.map(e => editingId === e.id ? /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      padding: 14,
      background: 'var(--mauve-tint)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tanggal"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: editForm.date,
    onChange: ev => setEditForm({
      ...editForm,
      date: ev.target.value
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sumber Dana"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: editForm.payment_method,
    onChange: ev => setEditForm({
      ...editForm,
      payment_method: ev.target.value
    })
  }, PAYMENT_METHODS.map(pm => /*#__PURE__*/React.createElement("option", {
    key: pm.value,
    value: pm.value
  }, pm.label))))), /*#__PURE__*/React.createElement(Field, {
    label: "Keterangan"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: editForm.description,
    onChange: ev => setEditForm({
      ...editForm,
      description: ev.target.value
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Jumlah"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: editForm.amount,
    onChange: ev => setEditForm({
      ...editForm,
      amount: ev.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => saveEdit(e.id)
  }, "Simpan"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setEditingId(null)
  }, "Batal"))) : /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '12px 14px',
      background: 'var(--paper)',
      border: '1px solid var(--border, #eee)',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 14
    }
  }, e.description), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 3
    }
  }, fmtDate(e.date), " · ", getPaymentMethodIcon(e.payment_method), " ", getPaymentMethodLabel(e.payment_method), e.notes ? ` · ${e.notes}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      marginLeft: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--red)',
      fontSize: 15,
      whiteSpace: 'nowrap'
    }
  }, "−", fmtRp(e.amount)), isAdmin && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginTop: 6,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      padding: '2px 8px',
      fontSize: 11
    },
    onClick: () => startEdit(e)
  }, "✏️"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      padding: '2px 8px',
      fontSize: 11,
      color: 'var(--red)'
    },
    onClick: () => setDeleteTarget(e)
  }, "🗑")))))))), deleteTarget && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    },
    onClick: () => setDeleteTarget(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      padding: 24,
      maxWidth: 340,
      width: '100%'
    },
    onClick: ev => ev.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 8
    }
  }, "Hapus Pengeluaran?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--muted)',
      marginBottom: 18
    }
  }, "\"", deleteTarget.description, "\" — ", fmtRp(deleteTarget.amount), ". Tindakan ini tidak bisa dibatalkan."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      background: 'var(--red)',
      flex: 1
    },
    onClick: confirmDelete
  }, "Ya, Hapus"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setDeleteTarget(null)
  }, "Batal")))));
}

// =====================================================
// ADJUST ATTENDANCE MODAL — input absensi & penyesuaian per karyawan
// =====================================================
function AdjustAttendanceModal({
  open,
  onClose,
  onSuccess,
  employee,
  period,
  currentAdjustment,
  branchId,
  adjustedBy,
  leaveBalance,
  attendance
}) {
  const [form, setForm] = useStateP({
    standard_work_days: 26,
    annual_leave_days: 0,
    sick_leave_certified_days: 0,
    unpaid_leave_days: 0,
    bonus: 0,
    extra_deduction: 0,
    notes: ''
  });
  const [saving, setSaving] = useStateP(false);
  useEffectP(() => {
    if (open && currentAdjustment) {
      setForm({
        standard_work_days: currentAdjustment.standard_work_days || 26,
        actual_work_days: currentAdjustment.actual_work_days || '',
        annual_leave_days: currentAdjustment.annual_leave_days || 0,
        sick_leave_certified_days: currentAdjustment.sick_leave_certified_days || 0,
        unpaid_leave_days: currentAdjustment.unpaid_leave_days || 0,
        unpaid_leave_weekend_days: currentAdjustment.unpaid_leave_weekend_days || 0,
        bpjs_kesehatan: currentAdjustment.bpjs_kesehatan || 0,
        late_deduction: currentAdjustment.late_deduction || 0,
        bonus: currentAdjustment.bonus || 0,
        extra_deduction: currentAdjustment.extra_deduction || 0,
        notes: currentAdjustment.notes || ''
      });
    } else if (open) {
      setForm({
        standard_work_days: 26,
        actual_work_days: '',
        annual_leave_days: 0,
        sick_leave_certified_days: 0,
        unpaid_leave_days: 0,
        unpaid_leave_weekend_days: 0,
        bpjs_kesehatan: 0,
        late_deduction: 0,
        bonus: 0,
        extra_deduction: 0,
        notes: ''
      });
    }
  }, [open, currentAdjustment]);
  function update(patch) {
    setForm(prev => ({
      ...prev,
      ...patch
    }));
  }

  // Live preview
  const preview = useMemoP(() => {
    if (!employee) return null;
    const baseSalary = Number(employee.base_salary) || 0;
    const unpaid = Number(form.unpaid_leave_days) || 0;
    const unpaidWeekend = Number(form.unpaid_leave_weekend_days) || 0;
    const effectiveAbsent = unpaid + unpaidWeekend * 2;
    const standardDays = Number(form.standard_work_days) || 26;
    const dailyWage = Math.round(baseSalary / standardDays);
    const actualWorkDays = Number(form.actual_work_days) || 0;
    const isProrated = actualWorkDays > 0 && actualWorkDays < standardDays;
    let actualSalary;
    if (isProrated) {
      const proratedBase = baseSalary * (actualWorkDays / standardDays);
      actualSalary = effectiveAbsent > 0 ? Math.round(proratedBase * (1 - effectiveAbsent / actualWorkDays)) : Math.round(proratedBase);
      if (actualSalary < 0) actualSalary = 0;
    } else {
      actualSalary = effectiveAbsent > 0 ? Math.round(baseSalary * (1 - effectiveAbsent / standardDays)) : baseSalary;
    }
    const deduction = baseSalary - actualSalary;

    // Meal allowance: reduced by unpaid absence (weekend counted once, not doubled).
    // Paid leave (annual/certified sick) does not reduce it.
    const mealFull = Number(employee.meal_allowance) || 0;
    const mealAbsent = unpaid + unpaidWeekend;
    const mealDaysBase = isProrated ? actualWorkDays : standardDays;
    let actualMeal;
    if (isProrated) {
      const proratedMeal = mealFull * (actualWorkDays / standardDays);
      actualMeal = mealAbsent > 0 ? Math.round(proratedMeal * (1 - mealAbsent / actualWorkDays)) : Math.round(proratedMeal);
    } else {
      actualMeal = mealAbsent > 0 ? Math.round(mealFull * (1 - mealAbsent / standardDays)) : mealFull;
    }
    if (actualMeal < 0) actualMeal = 0;
    const mealDeduction = mealFull - actualMeal;
    const mealDaysPaid = Math.max(0, mealDaysBase - mealAbsent);
    return {
      actualSalary,
      deduction,
      effectiveAbsent,
      dailyWage,
      isProrated,
      actualWorkDays,
      mealFull,
      actualMeal,
      mealDeduction,
      mealAbsent,
      mealDaysPaid,
      mealDaysBase
    };
  }, [form, employee]);

  // Annual leave check
  const annualLeaveUsedOther = (leaveBalance?.used_days || 0) - (currentAdjustment?.annual_leave_days || 0);
  const annualLeaveRemaining = (leaveBalance?.total_quota || 7) - annualLeaveUsedOther - (Number(form.annual_leave_days) || 0);
  const annualLeaveOverQuota = annualLeaveRemaining < 0;
  async function handleSubmit(e) {
    e.preventDefault();
    if (!employee) return;
    const annualLeave = Number(form.annual_leave_days) || 0;
    const sickCertified = Number(form.sick_leave_certified_days) || 0;
    const unpaid = Number(form.unpaid_leave_days) || 0;
    if (annualLeave < 0 || sickCertified < 0 || unpaid < 0) {
      toast('Hari absen tidak boleh negatif', 'error');
      return;
    }
    if (annualLeaveOverQuota) {
      if (!window.confirm(`Cuti tahunan melebihi jatah ${leaveBalance?.total_quota || 7} hari/tahun. Sisa hanya ${Math.max(0, (leaveBalance?.total_quota || 7) - annualLeaveUsedOther)} hari. Lanjut tetap simpan?`)) {
        return;
      }
    }
    setSaving(true);
    try {
      await upsertPayrollAdjustment({
        employee_id: employee.id,
        branch_id: branchId,
        period_start: period.period_start,
        period_end: period.period_end,
        standard_work_days: Number(form.standard_work_days) || 26,
        actual_work_days: form.actual_work_days ? Number(form.actual_work_days) : null,
        annual_leave_days: annualLeave,
        sick_leave_certified_days: sickCertified,
        unpaid_leave_days: unpaid,
        unpaid_leave_weekend_days: Number(form.unpaid_leave_weekend_days) || 0,
        bpjs_kesehatan: Number(form.bpjs_kesehatan) || 0,
        late_deduction: Number(form.late_deduction) || 0,
        bonus: Number(form.bonus) || 0,
        extra_deduction: Number(form.extra_deduction) || 0,
        notes: form.notes || null,
        adjusted_by: adjustedBy
      });
      toast('Absensi tersimpan ✓', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  }
  if (!open || !employee) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
      backdropFilter: 'blur(4px)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 20,
      padding: 32,
      width: '100%',
      maxWidth: 640,
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-lg)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, "Absensi & Penyesuaian"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 26,
      fontWeight: 400,
      color: 'var(--plum-deep)'
    }
  }, employee.full_name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 4
    }
  }, employee.job_title, " · Gaji pokok ", fmtRp(employee.base_salary))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "btn btn-ghost btn-sm"
  }, "✕")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      background: 'var(--mauve-tint)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--plum)',
      marginBottom: 18,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Aturan JBB:"), /*#__PURE__*/React.createElement("br", null), "• Cuti tahunan, sakit + surat dokter → ", /*#__PURE__*/React.createElement("strong", null, "tidak potong gaji"), /*#__PURE__*/React.createElement("br", null), "• Absen tanpa surat / izin pribadi → ", /*#__PURE__*/React.createElement("strong", null, "potong gaji harian"), " (1×)", /*#__PURE__*/React.createElement("br", null), "• Absen di hari weekend (Sabtu/Minggu) → ", /*#__PURE__*/React.createElement("strong", null, "potong 2× gaji harian"), /*#__PURE__*/React.createElement("br", null), "• Standar hari kerja: 26 hari/bulan"), /*#__PURE__*/React.createElement(Field, {
    label: "Standar Hari Kerja",
    hint: "Default 26 hari (libur 1x/minggu). Ini pembagi gaji harian."
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.standard_work_days,
    onChange: e => update({
      standard_work_days: e.target.value
    }),
    min: "1",
    max: "31"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Hari Kerja Aktual (opsional — karyawan baru)",
    hint: "Isi HANYA jika karyawan baru masuk pertengahan periode. Contoh: baru kerja 7 hari → gaji proporsional 7/standar. Kosongkan untuk karyawan normal."
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.actual_work_days,
    onChange: e => update({
      actual_work_days: e.target.value
    }),
    min: "1",
    max: "31",
    placeholder: "Kosongkan jika kerja penuh"
  })), preview?.isProrated && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      background: 'var(--cream)',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--plum)',
      marginTop: -6,
      marginBottom: 14
    }
  }, "💡 Gaji proporsional: ", preview.actualWorkDays, " dari ", Number(form.standard_work_days) || 26, " hari = ", fmtRp(preview.actualSalary), " (dari ", fmtRp(Number(employee.base_salary) || 0), ")", /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 4
    }
  }, "Uang makan juga ikut pro-rata. Komisi, home service & tips tetap penuh (sesuai transaksi nyata).")), attendance && attendance.days_present > 0 && (() => {
    const std = Number(form.standard_work_days) || 26;
    const cuti = Number(form.annual_leave_days) || 0;
    const sakit = Number(form.sick_leave_certified_days) || 0;
    // Absen tanpa keterangan = hari kerja standar dikurangi hari hadir,
    // dikurangi lagi cuti & sakit bersurat (yang sudah punya keterangan)
    const saranAbsen = Math.max(0, std - attendance.days_present - cuti - sakit);
    const sudahSama = Number(form.unpaid_leave_days) === saranAbsen;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        background: 'var(--mauve-tint)',
        borderRadius: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "Dari sistem absensi"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))',
        gap: 10,
        fontSize: 12,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, "Hari hadir"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 15,
        color: 'var(--plum-deep)'
      }
    }, attendance.days_present, " hari")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, "Hari telat"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 15,
        color: attendance.days_late > 0 ? 'var(--red)' : 'var(--plum-deep)'
      }
    }, attendance.days_late, " hari")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, "Total telat"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 15,
        color: attendance.total_late_minutes > 0 ? 'var(--red)' : 'var(--plum-deep)'
      }
    }, attendance.total_late_minutes, " menit")), attendance.days_no_clockout > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, "Lupa absen pulang"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 15,
        color: 'var(--amber)'
      }
    }, attendance.days_no_clockout, " hari"))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid rgba(122,102,126,0.2)',
        paddingTop: 10,
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8,
        color: 'var(--plum)'
      }
    }, "Perhitungan absen: ", std, " hari kerja − ", attendance.days_present, " hadir", cuti > 0 ? ` − ${cuti} cuti` : '', sakit > 0 ? ` − ${sakit} sakit` : '', ' = ', /*#__PURE__*/React.createElement("strong", null, saranAbsen, " hari absen tanpa keterangan")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: 'btn btn-sm ' + (sudahSama ? 'btn-ghost' : 'btn-primary'),
      disabled: sudahSama,
      onClick: () => update({
        unpaid_leave_days: saranAbsen
      })
    }, sudahSama ? 'Sudah sesuai absensi' : `Isi otomatis: ${saranAbsen} hari absen`), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        marginTop: 8
      }
    }, "Isi dulu cuti dan sakit bersurat di bawah, baru tekan tombol ini supaya hasilnya tepat."), (() => {
      const kuota = attendance.tolerance_quota || 7;
      const tol = attendance.days_tolerance || 0;
      const lewat = attendance.tolerance_over || 0;
      const atas10 = attendance.days_late || 0;
      const hariTelat = attendance.effective_late_days || 0;
      const saranPotong = attendance.late_deduction_suggested || 0;
      const cocok = Number(form.late_deduction) === saranPotong;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          borderTop: '1px solid rgba(122,102,126,0.2)',
          marginTop: 12,
          paddingTop: 10
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: 6,
          color: 'var(--plum)'
        }
      }, "Toleransi datang (09:30 sampai 10:00): ", /*#__PURE__*/React.createElement("strong", null, tol, " kali"), " dari jatah ", kuota, lewat > 0 ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--red)'
        }
      }, " · ", lewat, " kali lewat jatah, dihitung telat") : /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--hijau)'
        }
      }, " · masih aman")), /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: 8,
          color: 'var(--plum)'
        }
      }, lewat > 0 && /*#__PURE__*/React.createElement("div", null, "Lewat jatah toleransi: ", lewat, " hari × ", fmtRp(attendance.tolerance_over_penalty_per_day || 5000), ' = ', /*#__PURE__*/React.createElement("strong", {
        style: {
          color: 'var(--red)'
        }
      }, fmtRp(attendance.tolerance_over_deduction || 0))), atas10 > 0 && /*#__PURE__*/React.createElement("div", null, "Terlambat di atas 10:00: ", atas10, " hari × ", fmtRp(attendance.late_penalty_per_day || 15000), ' = ', /*#__PURE__*/React.createElement("strong", {
        style: {
          color: 'var(--red)'
        }
      }, fmtRp(attendance.late_only_deduction || 0))), lewat > 0 || atas10 > 0 ? /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4
        }
      }, "Total potongan: ", /*#__PURE__*/React.createElement("strong", {
        style: {
          color: 'var(--red)'
        }
      }, fmtRp(saranPotong))) : /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--hijau)'
        }
      }, "Tidak ada potongan keterlambatan.")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: 'btn btn-sm ' + (cocok ? 'btn-ghost' : 'btn-primary'),
        disabled: cocok,
        onClick: () => update({
          late_deduction: saranPotong
        })
      }, cocok ? 'Potongan telat sudah sesuai' : `Isi otomatis: potongan ${fmtRp(saranPotong)}`));
    })()));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Cuti Tahunan (hari)",
    hint: leaveBalance ? `Sisa: ${Math.max(0, annualLeaveRemaining)}/${leaveBalance.total_quota || 7}` : 'Jatah 7 hari/tahun',
    error: annualLeaveOverQuota ? '⚠️ Melebihi jatah!' : null
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.annual_leave_days,
    onChange: e => update({
      annual_leave_days: e.target.value
    }),
    min: "0",
    max: "31",
    style: annualLeaveOverQuota ? {
      borderColor: 'var(--red)',
      background: '#fdf0f0'
    } : {}
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sakit + Surat Dokter",
    hint: "Tidak potong gaji"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.sick_leave_certified_days,
    onChange: e => update({
      sick_leave_certified_days: e.target.value
    }),
    min: "0",
    max: "31"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Absen (hari biasa)",
    hint: "Senin–Jumat · POTONG GAJI 1×",
    error: null
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.unpaid_leave_days,
    onChange: e => update({
      unpaid_leave_days: e.target.value
    }),
    min: "0",
    max: "31",
    style: Number(form.unpaid_leave_days) > 0 ? {
      borderColor: 'var(--amber)',
      background: '#fdf6e3'
    } : {}
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Absen Weekend (Sabtu/Minggu)",
    hint: "POTONG GAJI 2×",
    error: null
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.unpaid_leave_weekend_days,
    onChange: e => update({
      unpaid_leave_weekend_days: e.target.value
    }),
    min: "0",
    max: "10",
    style: Number(form.unpaid_leave_weekend_days) > 0 ? {
      borderColor: 'var(--red)',
      background: '#fef0e8'
    } : {}
  }))), preview && (Number(form.unpaid_leave_days) > 0 || Number(form.unpaid_leave_weekend_days) > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      background: '#fdf6e3',
      borderRadius: 8,
      fontSize: 13,
      color: 'var(--plum)',
      marginBottom: 18,
      lineHeight: 1.7,
      border: '1px solid var(--amber)'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "⚠️ Potongan gaji aktif:"), /*#__PURE__*/React.createElement("br", null), "Gaji pokok ", fmtRp(employee.base_salary), " → ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--red)'
    }
  }, fmtRp(preview.actualSalary)), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Gaji harian: ", fmtRp(preview.dailyWage), " (", fmtRp(employee.base_salary), " / ", form.standard_work_days, " hari)", /*#__PURE__*/React.createElement("br", null), Number(form.unpaid_leave_days) > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, "Absen biasa: ", form.unpaid_leave_days, " × ", fmtRp(preview.dailyWage), " = ", fmtRp(Number(form.unpaid_leave_days) * preview.dailyWage), /*#__PURE__*/React.createElement("br", null)), Number(form.unpaid_leave_weekend_days) > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, "Absen weekend: ", form.unpaid_leave_weekend_days, " × 2 × ", fmtRp(preview.dailyWage), " = ", fmtRp(Number(form.unpaid_leave_weekend_days) * 2 * preview.dailyWage), /*#__PURE__*/React.createElement("br", null)), "Total potongan: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--red)'
    }
  }, fmtRp(preview.deduction)), " (", preview.effectiveAbsent, " hari efektif)"), preview.mealDeduction > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--amber)',
      margin: '8px 0',
      opacity: 0.5
    }
  }), "Uang makan ", fmtRp(preview.mealFull), " → ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--red)'
    }
  }, fmtRp(preview.actualMeal)), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Dibayar ", preview.mealDaysPaid, " dari ", preview.mealDaysBase, " hari (absen ", preview.mealAbsent, " hari, weekend dihitung 1 hari)", /*#__PURE__*/React.createElement("br", null), "Potongan uang makan: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--red)'
    }
  }, fmtRp(preview.mealDeduction))))), /*#__PURE__*/React.createElement(Field, {
    label: "BPJS Kesehatan (Rp)",
    hint: "Tunjangan BPJS dari perusahaan, ditambahkan ke gaji. Biasanya 35.000. Kosongkan/0 jika tidak ada."
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.bpjs_kesehatan,
    onChange: e => update({
      bpjs_kesehatan: e.target.value
    }),
    min: "0",
    step: "any",
    placeholder: "35000"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Bonus (Rp)",
    hint: "THR, insentif, dll. Opsional"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.bonus,
    onChange: e => update({
      bonus: e.target.value
    }),
    min: "0",
    step: "any",
    placeholder: "0"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Potongan Keterlambatan (Rp)",
    hint: "Terisi otomatis dari absensi lewat tombol di atas. Bisa diubah manual."
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.late_deduction,
    onChange: e => update({
      late_deduction: e.target.value
    }),
    min: "0",
    step: "any",
    placeholder: "0"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Potongan / Kasbon (Rp)",
    hint: "Kasbon dan potongan lain di luar keterlambatan. Opsional"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-input",
    value: form.extra_deduction,
    onChange: e => update({
      extra_deduction: e.target.value
    }),
    min: "0",
    step: "any",
    placeholder: "0"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Catatan",
    hint: "Opsional"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "form-textarea",
    rows: "2",
    value: form.notes,
    onChange: e => update({
      notes: e.target.value
    }),
    placeholder: "Misal: cuti H-1 untuk acara keluarga, sakit demam dapat surat dokter..."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: onClose,
    disabled: saving
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: saving
  }, saving ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : 'Simpan Absensi')))));
}

// =====================================================
// PAYROLL PAGE — Tahap C2
// =====================================================
function PayrollPage({
  profile,
  currentBranchId,
  branches
}) {
  const isSuper = profile.role === 'super_admin';
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;

  // Period selection
  const periodOptions = useMemoP(() => listRecentPayrollPeriods(12), []);
  const [selectedPeriodId, setSelectedPeriodId] = useStateP(periodOptions[0]?.id);
  const selectedPeriod = useMemoP(() => periodOptions.find(p => p.id === selectedPeriodId) || periodOptions[0], [selectedPeriodId, periodOptions]);
  const [employees, setEmployees] = useStateP([]);
  const [commissions, setCommissions] = useStateP({});
  const [adjustments, setAdjustments] = useStateP([]);
  const [leaveBalances, setLeaveBalances] = useStateP([]);
  const [attendanceSummary, setAttendanceSummary] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [adjustTarget, setAdjustTarget] = useStateP(null);
  const [viewingEmployee, setViewingEmployee] = useStateP(null);
  async function loadData() {
    if (!selectedPeriod) return;
    setLoading(true);
    try {
      const branchFilter = effectiveBranchId;
      const [emps, comms, adjs, balances] = await Promise.all([listPayrollEligibleEmployees(branchFilter), getPeriodCommissionByEmployee(selectedPeriod.period_start, selectedPeriod.period_end, branchFilter), listPayrollAdjustments(selectedPeriod.period_start, branchFilter), getAnnualLeaveBalances(selectedPeriod.year, branchFilter)]);
      setEmployees(emps);
      setCommissions(comms);
      setAdjustments(adjs);
      setLeaveBalances(balances);
      // Absensi dimuat terpisah supaya kegagalannya tidak membatalkan data gaji
      try {
        const att = await getAttendanceSummary(branchFilter, selectedPeriod.period_start, selectedPeriod.period_end);
        setAttendanceSummary(att);
      } catch (e) {
        setAttendanceSummary([]);
      }
    } catch (err) {
      toast('Gagal memuat: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    loadData();
  }, [selectedPeriodId, effectiveBranchId]);

  // Build payroll rows
  const rows = useMemoP(() => {
    return employees.map(emp => {
      const commData = commissions[emp.id];
      const adjData = adjustments.find(a => a.employee_id === emp.id);
      const leaveData = leaveBalances.find(b => b.employee_id === emp.id);
      const payroll = calculatePayroll({
        employee: emp,
        commissions: commData,
        adjustment: adjData
      });
      return {
        employee: emp,
        payroll,
        adjustment: adjData,
        leaveBalance: leaveData
      };
    });
  }, [employees, commissions, adjustments, leaveBalances]);

  // Totals
  const totals = useMemoP(() => {
    return rows.reduce((acc, r) => ({
      base: acc.base + r.payroll.base_salary_actual,
      meal: acc.meal + r.payroll.meal_allowance,
      bpjs: acc.bpjs + (r.payroll.bpjs_kesehatan || 0),
      commission: acc.commission + r.payroll.treatment_commission + r.payroll.hs_commission,
      tips: acc.tips + (r.payroll.tips || 0),
      bonus: acc.bonus + r.payroll.bonus,
      deduction: acc.deduction + r.payroll.extra_deduction,
      lateDeduction: acc.lateDeduction + (r.payroll.late_deduction || 0),
      total: acc.total + r.payroll.total
    }), {
      base: 0,
      meal: 0,
      bpjs: 0,
      lateDeduction: 0,
      commission: 0,
      tips: 0,
      bonus: 0,
      deduction: 0,
      total: 0
    });
  }, [rows]);
  const scopeLabel = effectiveBranchId ? branches.find(b => b.id === effectiveBranchId)?.name : isSuper ? 'Semua Cabang' : '—';

  // Print slip for one employee
  async function handlePrintSlip(row) {
    try {
      const items = await getEmployeePeriodTransactions(row.employee.id, selectedPeriod.period_start, selectedPeriod.period_end);
      const tipsDetail = await getEmployeePeriodTips(row.employee.id, selectedPeriod.period_start, selectedPeriod.period_end);
      const branch = branches.find(b => b.id === row.employee.branch_id);
      const slipHtml = generateSlipHTML({
        employee: row.employee,
        payroll: row.payroll,
        items,
        period: selectedPeriod,
        branch,
        generatedBy: profile,
        isApproved: row.adjustment?.is_approved === true,
        tipsDetail,
        attendance: attendanceSummary.find(a => a.employee_id === row.employee.id) || null
      });
      printSlip(slipHtml);
    } catch (err) {
      toast('Gagal generate slip: ' + (err.message || err), 'error');
    }
  }

  // Print all slips at once
  async function handlePrintAllSlips() {
    if (!rows.length) {
      toast('Tidak ada karyawan untuk diprint', 'error');
      return;
    }
    toast('Menyiapkan ' + rows.length + ' slip gaji...', 'success');
    try {
      const slips = [];
      for (const row of rows) {
        const items = await getEmployeePeriodTransactions(row.employee.id, selectedPeriod.period_start, selectedPeriod.period_end);
        const tipsDetail = await getEmployeePeriodTips(row.employee.id, selectedPeriod.period_start, selectedPeriod.period_end);
        const branch = branches.find(b => b.id === row.employee.branch_id);
        slips.push(generateSlipHTML({
          employee: row.employee,
          payroll: row.payroll,
          items,
          period: selectedPeriod,
          branch,
          generatedBy: profile,
          isApproved: row.adjustment?.is_approved === true,
          tipsDetail,
          attendance: attendanceSummary.find(a => a.employee_id === row.employee.id) || null
        }));
      }
      printMultipleSlips(slips);
    } catch (err) {
      toast('Gagal generate slip: ' + (err.message || err), 'error');
    }
  }

  // Export payroll to Excel
  function handleExportExcel() {
    if (!rows.length) {
      toast('Tidak ada data untuk diexport', 'error');
      return;
    }
    try {
      exportPayrollToExcel({
        rows,
        periodLabel: selectedPeriod.label,
        branchLabel: scopeLabel,
        totals
      });
      toast('Excel berhasil di-download ✓', 'success');
    } catch (err) {
      toast('Gagal export: ' + err.message, 'error');
    }
  }
  function openAdjust(row) {
    setAdjustTarget({
      employee: row.employee,
      adjustment: row.adjustment,
      leaveBalance: row.leaveBalance
    });
  }

  // Approve slip
  async function handleApproveSlip(row) {
    if (!row.adjustment?.id) {
      toast('Slip belum diinput. Klik "Input" dulu untuk set absensi.', 'error');
      return;
    }
    if (!window.confirm(`Approve slip gaji untuk ${row.employee.full_name}?\n\nSetelah approved, slip jadi "OFFICIAL" tanpa watermark PREVIEW. Bisa di-unapprove lagi kalau perlu koreksi.`)) {
      return;
    }
    try {
      await approveSlip(row.adjustment.id);
      toast('Slip approved ✓', 'success');
      loadData();
    } catch (err) {
      toast('Gagal approve: ' + (err.message || err), 'error');
    }
  }
  async function handleUnapproveSlip(row) {
    if (!row.adjustment?.id) return;
    if (!window.confirm(`Un-approve slip ${row.employee.full_name}?\n\nSlip akan kembali ke status PREVIEW.`)) {
      return;
    }
    try {
      await unapproveSlip(row.adjustment.id);
      toast('Slip di-unapprove', 'success');
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  // If admin clicked an employee name, show their dashboard view instead
  if (viewingEmployee) {
    return /*#__PURE__*/React.createElement(AdminEmployeeView, {
      profile: profile,
      employee: viewingEmployee,
      branches: branches,
      onBack: () => setViewingEmployee(null)
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Rekap Gaji",
    sub: scopeLabel
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: handleExportExcel,
    disabled: loading || !rows.length
  }, "📥 Export Excel"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary btn-sm",
    onClick: handlePrintAllSlips,
    disabled: loading || !rows.length
  }, "🖨 Print Semua Slip")), /*#__PURE__*/React.createElement(Card, {
    title: "Pilih Periode",
    sub: "Periode payroll 26 → 25 bulan berikutnya"
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Bulan Gajian"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: selectedPeriodId,
    onChange: e => setSelectedPeriodId(e.target.value)
  }, periodOptions.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.label)))), /*#__PURE__*/React.createElement(Field, {
    label: "Periode"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    disabled: true,
    value: selectedPeriod ? `${fmtDate(selectedPeriod.period_start)} – ${fmtDate(selectedPeriod.period_end)}` : '',
    style: {
      background: 'var(--mauve-tint)',
      color: 'var(--plum)',
      fontWeight: 500
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Total Karyawan",
    value: loading ? '...' : rows.length,
    sub: "dalam payroll"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Total Gaji Pokok",
    value: loading ? '...' : fmtRp(totals.base + totals.meal),
    sub: "setelah pemotongan"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Total Komisi",
    value: loading ? '...' : fmtRp(totals.commission),
    sub: "treatment + home service"
  }), totals.tips > 0 && /*#__PURE__*/React.createElement(Metric, {
    label: "Total Tips",
    value: loading ? '...' : fmtRp(totals.tips),
    sub: "tips dari client"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Total Payroll",
    value: loading ? '...' : fmtRp(totals.total),
    sub: scopeLabel
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Detail Per Karyawan",
    sub: "Owner & Manager tidak masuk rekap (profit sharing)"
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Menghitung..."
  }) : !rows.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada karyawan",
    sub: "Tambah karyawan dengan jabatan selain Owner/Manager."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Karyawan"), isSuper && !effectiveBranchId && /*#__PURE__*/React.createElement("th", null, "Cabang"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Gapok"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "U. Makan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi Treatment"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi HS"), /*#__PURE__*/React.createElement("th", null, "Absensi"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Bonus"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Potongan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric",
    style: {
      minWidth: 110
    }
  }, "TOTAL"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, rows.map(({
    employee: emp,
    payroll: p,
    adjustment: adj,
    leaveBalance: lb
  }) => {
    const isApproved = adj?.is_approved === true;
    return /*#__PURE__*/React.createElement("tr", {
      key: emp.id
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setViewingEmployee(emp),
      style: {
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontWeight: 500,
        color: 'var(--plum-deep)',
        textAlign: 'left',
        textDecoration: 'underline',
        textDecorationColor: 'var(--mauve)',
        textUnderlineOffset: 3,
        fontFamily: 'inherit',
        fontSize: 'inherit'
      },
      title: "Klik untuk lihat dashboard karyawan"
    }, emp.full_name), isApproved && /*#__PURE__*/React.createElement("span", {
      className: "badge",
      style: {
        background: '#ecf5ef',
        color: '#4a7c59',
        fontSize: 9,
        padding: '2px 8px'
      }
    }, "✓ Approved")), /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve",
      style: {
        fontSize: 10,
        marginTop: 4
      }
    }, emp.job_title)), isSuper && !effectiveBranchId && /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve",
      style: {
        fontSize: 10
      }
    }, emp.branch?.name)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, p.salary_deduction > 0 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500
      }
    }, fmtRp(p.base_salary_actual)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--red)',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, "−", fmtRp(p.salary_deduction))) : fmtRpOrDash(p.base_salary_actual)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, fmtRpOrDash(p.meal_allowance)), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500,
        color: 'var(--mauve)'
      }
    }, fmtRp(p.treatment_commission))), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, p.hs_commission > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500,
        color: 'var(--gold)'
      }
    }, fmtRp(p.hs_commission)) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "—")), /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: 11
      }
    }, p.annual_leave_days > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--green)'
      }
    }, "Cuti: ", p.annual_leave_days, "h"), p.sick_leave_certified_days > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--mauve)'
      }
    }, "Sakit+S: ", p.sick_leave_certified_days, "h"), p.unpaid_leave_days > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--red)'
      }
    }, "Unpaid: ", p.unpaid_leave_days, "h"), !p.annual_leave_days && !p.sick_leave_certified_days && !p.unpaid_leave_days && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Full")), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, p.bonus > 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--green)'
      }
    }, "+", fmtRp(p.bonus)) : '—'), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric"
    }, p.extra_deduction > 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red)'
      }
    }, "−", fmtRp(p.extra_deduction)) : '—'), /*#__PURE__*/React.createElement("td", {
      className: "table-numeric",
      style: {
        fontWeight: 600,
        fontSize: 14,
        color: 'var(--plum-deep)'
      }
    }, fmtRp(p.total)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => openAdjust({
        employee: emp,
        payroll: p,
        adjustment: adj,
        leaveBalance: lb
      })
    }, adj ? 'Edit' : 'Input'), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => handlePrintSlip({
        employee: emp,
        payroll: p,
        adjustment: adj
      }),
      title: "Print slip gaji karyawan ini"
    }, "🖨 Slip"), isApproved ? /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => handleUnapproveSlip({
        employee: emp,
        adjustment: adj
      }),
      title: "Un-approve slip (kembali ke PREVIEW)",
      style: {
        color: 'var(--red)'
      }
    }, "↺ Un-approve") : /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: () => handleApproveSlip({
        employee: emp,
        adjustment: adj
      }),
      title: "Approve slip (jadi OFFICIAL tanpa watermark)",
      disabled: !adj
    }, "✓ Approve"))));
  }), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: 'var(--mauve-tint)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: isSuper && !effectiveBranchId ? 2 : 1,
    style: {
      fontWeight: 600
    }
  }, "TOTAL"), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, fmtRp(totals.base)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, fmtRp(totals.meal)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)'
    }
  }, fmtRp(totals.commission)), /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--green)'
    }
  }, totals.bonus > 0 ? `+${fmtRp(totals.bonus)}` : '—'), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--red)'
    }
  }, totals.deduction > 0 ? `−${fmtRp(totals.deduction)}` : '—'), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      fontSize: 15,
      color: 'var(--plum-deep)'
    }
  }, fmtRp(totals.total)), /*#__PURE__*/React.createElement("td", null)))))), /*#__PURE__*/React.createElement(AdjustAttendanceModal, {
    open: !!adjustTarget,
    onClose: () => setAdjustTarget(null),
    onSuccess: loadData,
    employee: adjustTarget?.employee,
    period: selectedPeriod,
    currentAdjustment: adjustTarget?.adjustment,
    leaveBalance: adjustTarget?.leaveBalance,
    attendance: attendanceSummary.find(a => a.employee_id === adjustTarget?.employee?.id) || null,
    branchId: adjustTarget?.employee?.branch_id,
    adjustedBy: profile.id
  }));
}

// =====================================================
// AUDIT LOG PAGE — Tahap C2.5 (super_admin only)
// =====================================================
function AuditLogPage({
  profile,
  branches
}) {
  const [logs, setLogs] = useStateP([]);
  const [summary, setSummary] = useStateP(null);
  const [loading, setLoading] = useStateP(true);
  const [expandedId, setExpandedId] = useStateP(null);

  // Filters
  const [filterTable, setFilterTable] = useStateP('');
  const [filterAction, setFilterAction] = useStateP('');
  const [filterBranch, setFilterBranch] = useStateP('');
  const [filterDays, setFilterDays] = useStateP(7);
  const TABLE_OPTIONS = [{
    value: '',
    label: '— Semua —'
  }, {
    value: 'transactions',
    label: 'Transaksi'
  }, {
    value: 'transaction_items',
    label: 'Detail Treatment'
  }, {
    value: 'employees',
    label: 'Karyawan'
  }, {
    value: 'payroll_adjustments',
    label: 'Penyesuaian Gaji'
  }, {
    value: 'clients',
    label: 'Pelanggan'
  }];
  async function loadData() {
    setLoading(true);
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - Number(filterDays));
      const dateFromIso = dateFrom.toISOString();
      const [logsData, summaryData] = await Promise.all([listAuditLog({
        limit: 200,
        tableName: filterTable || null,
        action: filterAction || null,
        branchId: filterBranch || null,
        dateFrom: dateFromIso
      }), getAuditSummary(Number(filterDays))]);
      setLogs(logsData);
      setSummary(summaryData);
    } catch (err) {
      toast('Gagal memuat audit log: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    loadData();
  }, [filterTable, filterAction, filterBranch, filterDays]);
  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }
  function fmtTimestamp(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  function describeLog(log) {
    const action = getActionLabel(log.action);
    const tableLabel = log.table_label || log.table_name;
    const user = log.changed_by_name || '—';
    if (log.action === 'INSERT') {
      const name = log.new_data?.full_name || log.new_data?.service_name || log.new_data?.client_name_snapshot || log.new_data?.id?.slice(0, 8);
      return `${user} menambah ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
    }
    if (log.action === 'DELETE') {
      const name = log.old_data?.full_name || log.old_data?.service_name || log.old_data?.client_name_snapshot || log.old_data?.id?.slice(0, 8);
      return `${user} menghapus ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
    }
    if (log.action === 'UPDATE') {
      const name = log.new_data?.full_name || log.new_data?.service_name || log.new_data?.client_name_snapshot || log.new_data?.id?.slice(0, 8);
      // Input-time UPDATE = side effect of creating the record, not a real edit
      if (log.is_input_side_effect) {
        return `${user} input ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
      }
      const fields = (log.changed_fields || []).map(getFieldLabel).join(', ');
      return `${user} mengubah ${fields || 'data'} di ${tableLabel.toLowerCase()} ${name ? '"' + name + '"' : ''}`;
    }
    return '—';
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Riwayat Perubahan",
    sub: "Audit Log JBB Group"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20,
      padding: '12px 16px',
      background: 'var(--mauve-tint)',
      borderRadius: 10,
      fontSize: 13,
      color: 'var(--plum)',
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("strong", null, "🔒 Audit Log Otomatis:"), " setiap perubahan data (input transaksi, edit karyawan, hapus, dll) tercatat di sini dengan timestamp & siapa yang melakukan. Tidak bisa dihapus atau dimanipulasi."), summary && /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Total Perubahan",
    value: summary.total_changes,
    sub: `dalam ${filterDays} hari`
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Penambahan",
    value: summary.inserts,
    sub: "INSERT"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Editing",
    value: summary.updates,
    sub: "UPDATE"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Penghapusan",
    value: summary.deletes,
    sub: "DELETE"
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Filter"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, [7, 14, 30, 90].map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    type: "button",
    className: 'btn btn-sm ' + (filterDays === d ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setFilterDays(d)
  }, d, " hari"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Tabel"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: filterTable,
    onChange: e => setFilterTable(e.target.value)
  }, TABLE_OPTIONS.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)))), /*#__PURE__*/React.createElement(Field, {
    label: "Aksi"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: filterAction,
    onChange: e => setFilterAction(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Semua —"), /*#__PURE__*/React.createElement("option", {
    value: "INSERT"
  }, "Tambah (INSERT)"), /*#__PURE__*/React.createElement("option", {
    value: "UPDATE"
  }, "Edit (UPDATE)"), /*#__PURE__*/React.createElement("option", {
    value: "DELETE"
  }, "Hapus (DELETE)"))), /*#__PURE__*/React.createElement(Field, {
    label: "Cabang"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: filterBranch,
    onChange: e => setFilterBranch(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Semua Cabang —"), branches.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.id,
    value: b.id
  }, b.name)))))), /*#__PURE__*/React.createElement(Card, {
    title: "Log Perubahan",
    sub: `${logs.length} entri terbaru`
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat audit log..."
  }) : !logs.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada log",
    sub: "Tidak ada perubahan data dalam periode ini."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, logs.map(log => {
    const isExpanded = expandedId === log.id;
    const diff = formatAuditDiff(log.old_data, log.new_data, log.changed_fields);
    return /*#__PURE__*/React.createElement("div", {
      key: log.id,
      style: {
        border: '1px solid var(--line)',
        borderRadius: 10,
        background: 'var(--paper)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => toggleExpand(log.id),
      style: {
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: 'badge ' + (log.is_input_side_effect ? 'badge-green' : getActionBadge(log.action)),
      style: {
        minWidth: 55,
        textAlign: 'center'
      }
    }, log.is_input_side_effect ? 'Input' : getActionLabel(log.action)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: 'var(--plum-deep)',
        marginBottom: 2
      }
    }, describeLog(log)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        fontFamily: 'JetBrains Mono, monospace'
      }
    }, /*#__PURE__*/React.createElement("span", null, fmtTimestamp(log.created_at)), log.branch_name && /*#__PURE__*/React.createElement("span", null, "• ", log.branch_name), log.changed_by_role && /*#__PURE__*/React.createElement("span", null, "• ", log.changed_by_role))), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)',
        fontSize: 14,
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s'
      }
    }, "▶")), isExpanded && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px',
        borderTop: '1px solid var(--line)',
        background: 'var(--cream)',
        fontSize: 12
      }
    }, log.action === 'UPDATE' && diff.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 8
      }
    }, "Detail Perubahan"), /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        fontSize: 12,
        borderCollapse: 'collapse'
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '6px 8px',
        color: 'var(--muted)',
        fontWeight: 500
      }
    }, "Field"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '6px 8px',
        color: 'var(--red)',
        fontWeight: 500
      }
    }, "Sebelum"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: 'left',
        padding: '6px 8px',
        color: 'var(--green)',
        fontWeight: 500
      }
    }, "Sesudah"))), /*#__PURE__*/React.createElement("tbody", null, diff.map(d => /*#__PURE__*/React.createElement("tr", {
      key: d.field,
      style: {
        borderBottom: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        fontWeight: 500
      }
    }, getFieldLabel(d.field)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        color: 'var(--red)',
        textDecoration: 'line-through',
        opacity: 0.7
      }
    }, formatAuditValue(d.field, d.old)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: '6px 8px',
        color: 'var(--green)',
        fontWeight: 500
      }
    }, formatAuditValue(d.field, d.new))))))), log.action === 'INSERT' && log.new_data && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 8
      }
    }, "Data yang Ditambahkan"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
        gap: 8
      }
    }, Object.entries(log.new_data).filter(([k]) => !['id', 'created_at', 'updated_at', 'adjusted_at'].includes(k)).slice(0, 12).map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--muted)',
        marginBottom: 2
      }
    }, getFieldLabel(k)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500
      }
    }, formatAuditValue(k, v)))))), log.action === 'DELETE' && log.old_data && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        fontSize: 9,
        marginBottom: 8,
        color: 'var(--red)'
      }
    }, "⚠️ Data yang Dihapus"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
        gap: 8,
        opacity: 0.85
      }
    }, Object.entries(log.old_data).filter(([k]) => !['id', 'created_at', 'updated_at', 'adjusted_at'].includes(k)).slice(0, 12).map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: 'var(--muted)',
        marginBottom: 2
      }
    }, getFieldLabel(k)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500,
        textDecoration: 'line-through'
      }
    }, formatAuditValue(k, v)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        paddingTop: 10,
        borderTop: '1px solid var(--line)',
        fontSize: 10,
        color: 'var(--muted)',
        fontFamily: 'JetBrains Mono, monospace',
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", null, "ID: ", log.record_id?.slice(0, 8) || '—'), /*#__PURE__*/React.createElement("span", null, "Table: ", log.table_name), /*#__PURE__*/React.createElement("span", null, "By: ", log.changed_by_name || 'unknown', " (", log.changed_by_role || '—', ")"))));
  }))));
}

// =====================================================
// TAHAP D — Shared Dashboard Component
// Used by both Employee (self-view) and Admin (viewing employee)
// =====================================================
function EmployeeDashboardView({
  employee,
  profile,
  isAdminViewing = false,
  // true = admin viewing this employee; false = self-view
  branches = [],
  onBack = null,
  // for admin: function to go back
  onViewTransactions = null,
  onViewPayroll = null
}) {
  const [stats, setStats] = useStateP(null);
  const [topServices, setTopServices] = useStateP([]);
  const [topClients, setTopClients] = useStateP([]);
  const [adjustment, setAdjustment] = useStateP(null);
  const [leaveBalance, setLeaveBalance] = useStateP(null);
  const [loading, setLoading] = useStateP(true);
  const branch = useMemoP(() => branches.find(b => b.id === employee.branch_id) || employee.branch, [branches, employee]);
  async function loadData() {
    setLoading(true);
    try {
      const period = getPayrollPeriod();
      const year = new Date().getFullYear();
      if (isAdminViewing) {
        // Admin view: use admin functions (full data)
        const [statsData, services, clients, adj, balance] = await Promise.all([getEmployeeDashboardStatsAdmin(employee.id), getEmployeeTopServicesAdmin(employee.id, 3), getEmployeeTopClientsAdmin(employee.id, 3), getPayrollAdjustment(employee.id, period.period_start), getAnnualLeaveBalanceForEmployee(employee.id, year)]);
        setStats(statsData);
        setTopServices(services);
        setTopClients(clients);
        setAdjustment(adj);
        setLeaveBalance(balance);
      } else {
        // Self view: use self-view functions (privacy filtered)
        const [statsData, services, clients, adj, balance] = await Promise.all([getMyDashboardStats(), getMyTopServices(3), getMyTopClients(3), getPayrollAdjustment(employee.id, period.period_start), getAnnualLeaveBalanceForEmployee(employee.id, year)]);
        setStats(statsData);
        setTopServices(services);
        setTopClients(clients);
        setAdjustment(adj);
        setLeaveBalance(balance);
      }
    } catch (err) {
      toast('Gagal memuat dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    loadData();
  }, [employee.id, isAdminViewing]);

  // Calculate estimated payroll for current period
  const estimatedPayroll = useMemoP(() => {
    if (!stats) return null;
    const commissions = {
      treatment_commission: stats.period_commission || 0,
      hs_commission: 0 // will be included in treatment_commission already from view
    };
    return calculatePayroll({
      employee,
      commissions,
      adjustment
    });
  }, [stats, adjustment, employee]);

  // Annual leave info
  const leaveQuota = leaveBalance?.total_quota || 7;
  const leaveUsed = leaveBalance?.used_days || 0;
  const leaveRemaining = Math.max(0, leaveQuota - leaveUsed);
  const leaveProgressPct = Math.min(100, leaveUsed / leaveQuota * 100);
  const firstName = employee.full_name?.split(' ')[0] || 'Karyawan';
  const periodLabel = stats ? `${fmtDate(stats.period_start)} – ${fmtDate(stats.period_end)}` : '';

  // Determine if slip is approved
  const isApproved = adjustment?.is_approved === true;

  // Handle slip printing (only available for self-view in this dashboard)
  async function handlePrintMySlip() {
    if (!employee) return;
    try {
      const period = getPayrollPeriod();
      const items = await getEmployeePeriodTransactions(employee.id, period.period_start, period.period_end);
      const tipsDetail = await getEmployeePeriodTips(employee.id, period.period_start, period.period_end);
      const totalTips = tipsDetail.reduce((s, t) => s + Number(t.amount || 0), 0);
      const slipHtml = generateSlipHTML({
        employee,
        payroll: estimatedPayroll ? {
          ...estimatedPayroll,
          tips: estimatedPayroll.tips != null ? estimatedPayroll.tips : totalTips
        } : {
          base_salary: Number(employee.base_salary) || 0,
          base_salary_actual: Number(employee.base_salary) || 0,
          salary_deduction: 0,
          meal_allowance: Number(employee.meal_allowance) || 0,
          bpjs_kesehatan: 0,
          treatment_commission: stats?.period_commission || 0,
          hs_commission: 0,
          tips: totalTips,
          annual_leave_days: 0,
          sick_leave_certified_days: 0,
          unpaid_leave_days: 0,
          standard_work_days: 26,
          bonus: 0,
          extra_deduction: 0,
          total_before_deduction: (Number(employee.base_salary) || 0) + (Number(employee.meal_allowance) || 0) + (stats?.period_commission || 0) + totalTips,
          total: (Number(employee.base_salary) || 0) + (Number(employee.meal_allowance) || 0) + (stats?.period_commission || 0) + totalTips
        },
        items,
        period,
        branch,
        generatedBy: profile,
        isApproved,
        tipsDetail
      });
      printSlip(slipHtml);
    } catch (err) {
      toast('Gagal generate slip: ' + (err.message || err), 'error');
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, isAdminViewing && onBack && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      background: 'var(--gold)',
      background: 'linear-gradient(135deg, #fdf6e3, #f7efe0)',
      borderRadius: 10,
      marginBottom: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: 13,
      color: 'var(--plum-deep)',
      flexWrap: 'wrap',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, "🔍 ", /*#__PURE__*/React.createElement("strong", null, "Mode Lihat:"), " ", employee.full_name, " (", employee.job_title, ") — sebagai ", getRoleLabel(profile.role)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: onBack
  }, "← Kembali")), /*#__PURE__*/React.createElement(PageHeader, {
    title: isAdminViewing ? `Dashboard ${firstName}` : `Halo, ${firstName}`,
    sub: `${employee.job_title || ''} · ${branch?.name || '—'}`
  }), loading ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat dashboard..."
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Hari Ini")), /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Omset Hari Ini",
    value: fmtRp(stats?.today_revenue || 0),
    sub: `${stats?.today_trx_count || 0} transaksi`
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Komisi Hari Ini",
    value: fmtRp(stats?.today_commission || 0),
    sub: `${stats?.today_item_count || 0} treatment`
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Omset Minggu Ini",
    value: fmtRp(stats?.week_revenue || 0),
    sub: "Senin – sekarang"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Komisi Minggu Ini",
    value: fmtRp(stats?.week_commission || 0),
    sub: `${stats?.week_trx_count || 0} transaksi`
  })), /*#__PURE__*/React.createElement(Card, {
    title: `Estimasi Gaji Periode Ini${isApproved ? ' · ✓ Disetujui' : ' · Preview'}`,
    sub: periodLabel
  }, !estimatedPayroll ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada data",
    sub: "Estimasi gaji akan muncul setelah ada transaksi."
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Gaji Pokok",
    value: fmtRp(estimatedPayroll.base_salary_actual),
    sub: estimatedPayroll.salary_deduction > 0 ? `−${fmtRp(estimatedPayroll.salary_deduction)} potongan` : 'full'
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Uang Makan",
    value: fmtRp(estimatedPayroll.meal_allowance)
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Komisi Treatment",
    value: fmtRp(estimatedPayroll.treatment_commission),
    sub: `${stats?.period_trx_count || 0} transaksi`
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Estimasi Total",
    value: fmtRp(estimatedPayroll.total),
    sub: "real-time"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      justifyContent: isAdminViewing ? 'flex-start' : 'space-between',
      alignItems: 'center'
    }
  }, !isAdminViewing && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: handlePrintMySlip
  }, "🖨 Print Slip Gaji ", !isApproved && '(Preview)'), isAdminViewing && onViewPayroll && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: onViewPayroll
  }, "💰 Lihat Detail Gaji"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      lineHeight: 1.5
    }
  }, isApproved ? /*#__PURE__*/React.createElement(React.Fragment, null, "✓ Slip sudah di-approve admin · final") : /*#__PURE__*/React.createElement(React.Fragment, null, "⚠️ Estimasi real-time, belum di-approve admin"))))), /*#__PURE__*/React.createElement(Card, {
    title: "Cuti Tahunan",
    sub: `Tahun ${new Date().getFullYear()}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 40,
      fontWeight: 400,
      color: 'var(--plum-deep)',
      lineHeight: 1
    }
  }, leaveRemaining), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 2
    }
  }, "hari tersisa")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: 'var(--muted)',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, "Terpakai: ", leaveUsed, " hari"), /*#__PURE__*/React.createElement("span", null, "Jatah: ", leaveQuota, " hari")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: 'var(--mauve-tint)',
      borderRadius: 8,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${leaveProgressPct}%`,
      height: '100%',
      background: leaveProgressPct >= 100 ? 'var(--red)' : leaveProgressPct >= 80 ? 'var(--amber)' : 'var(--mauve)',
      transition: 'width 0.3s'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--muted)',
      marginTop: 6,
      fontStyle: 'italic'
    }
  }, "Aturan JBB: cuti tahunan 7 hari/tahun, lapor minimal H-1. Tidak potong gaji.")))), topServices.length > 0 && /*#__PURE__*/React.createElement(Card, {
    title: "Treatment Favorit",
    sub: "3 bulan terakhir"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Treatment"), /*#__PURE__*/React.createElement("th", null, "Kategori"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Jumlah"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Revenue"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi"))), /*#__PURE__*/React.createElement("tbody", null, topServices.map((s, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, s.service_name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "badge badge-mauve"
  }, s.service_category)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, s.count_done, "x"), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, fmtRp(s.total_revenue)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)',
      fontWeight: 500
    }
  }, fmtRp(s.total_commission)))))))), topClients.length > 0 && /*#__PURE__*/React.createElement(Card, {
    title: "Pelanggan Setia",
    sub: isAdminViewing ? "Nama lengkap (admin view)" : "Nama depan saja"
  }, /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Rank"), /*#__PURE__*/React.createElement("th", null, "Nama"), isAdminViewing && /*#__PURE__*/React.createElement("th", null, "HP"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Kunjungan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Belanja"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi"))), /*#__PURE__*/React.createElement("tbody", null, topClients.map((c, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
      borderRadius: 12,
      background: i === 0 ? 'var(--gold)' : 'var(--cream)',
      color: i === 0 ? '#fff' : 'var(--plum)',
      fontWeight: 600,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace'
    }
  }, i + 1)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, isAdminViewing ? c.client_name : c.client_first_name), isAdminViewing && /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, c.client_phone || '—')), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, c.visit_count, "x"), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      fontWeight: 500
    }
  }, fmtRp(c.total_spent)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)'
    }
  }, fmtRp(c.total_commission_earned)))))))), !isAdminViewing && onViewTransactions && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onViewTransactions
  }, "📋 Lihat Semua Transaksi Saya")))));
}

// =====================================================
// TAHAP D — Employee Transactions Page (3 months history)
// =====================================================
function MyTransactionsPage({
  profile
}) {
  const [transactions, setTransactions] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [presetId, setPresetId] = useStateP('thisMonth');
  async function loadData() {
    setLoading(true);
    try {
      const data = await getMyRecentTransactions(200);
      setTransactions(data);
    } catch (err) {
      toast('Gagal memuat transaksi: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    loadData();
  }, []);

  // Filter by date preset
  const filteredTransactions = useMemoP(() => {
    if (!transactions.length) return [];
    const preset = DATE_PRESETS.find(p => p.id === presetId);
    if (!preset || preset.id === 'custom') return transactions;
    const range = preset.getRange();
    return transactions.filter(t => t.date >= range.from && t.date <= range.to);
  }, [transactions, presetId]);

  // Aggregate
  const totals = useMemoP(() => {
    return filteredTransactions.reduce((acc, t) => ({
      revenue: acc.revenue + (Number(t.price) || 0),
      commission: acc.commission + (Number(t.commission_amount) || 0),
      count: acc.count + 1
    }), {
      revenue: 0,
      commission: 0,
      count: 0
    });
  }, [filteredTransactions]);
  const firstName = profile.full_name?.split(' ')[0] || 'Karyawan';
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Transaksi Saya",
    sub: `${firstName} · 3 bulan terakhir`
  }), /*#__PURE__*/React.createElement(Card, {
    title: "Filter Periode"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, DATE_PRESETS.filter(p => p.id !== 'custom').map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    type: "button",
    className: 'btn btn-sm ' + (presetId === p.id ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPresetId(p.id)
  }, p.label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'btn btn-sm ' + (presetId === 'all3mo' ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPresetId('all3mo')
  }, "3 Bulan Penuh"))), /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Total Treatment",
    value: loading ? '...' : totals.count,
    sub: "dalam periode"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Revenue Saya Kerjakan",
    value: loading ? '...' : fmtRp(totals.revenue)
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Komisi Saya",
    value: loading ? '...' : fmtRp(totals.commission)
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Detail Transaksi",
    sub: "Nomor HP klien tidak ditampilkan untuk privasi"
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !filteredTransactions.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Tidak ada transaksi",
    sub: "Belum ada transaksi di periode ini."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Tanggal"), /*#__PURE__*/React.createElement("th", null, "Jam"), /*#__PURE__*/React.createElement("th", null, "Pelanggan"), /*#__PURE__*/React.createElement("th", null, "Treatment"), /*#__PURE__*/React.createElement("th", null, "Tipe"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Harga"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Komisi"))), /*#__PURE__*/React.createElement("tbody", null, filteredTransactions.map(t => /*#__PURE__*/React.createElement("tr", {
    key: t.item_id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11
    }
  }, fmtDate(t.date)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, fmtTime(t.start_time)), /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, t.client_first_name || '—'), /*#__PURE__*/React.createElement("td", null, t.service_name), /*#__PURE__*/React.createElement("td", null, t.is_overtime && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: '#fdf6e3',
      color: '#b8893d',
      fontSize: 9
    }
  }, "lembur"), t.is_home_service && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: '#f7efe0',
      color: '#a8884a',
      fontSize: 9,
      marginLeft: 4
    }
  }, "HS"), !t.is_overtime && !t.is_home_service && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: 11
    }
  }, "normal")), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, fmtRp(t.price)), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: 'var(--mauve)',
      fontWeight: 500
    }
  }, fmtRp(t.commission_amount)))))))));
}

// =====================================================
// TAHAP D — Employee Salary Page (current period only)
// =====================================================
function MySalaryPage({
  profile,
  branches
}) {
  return /*#__PURE__*/React.createElement(EmployeeDashboardView, {
    employee: profile,
    profile: profile,
    isAdminViewing: false,
    branches: branches
  });
}

// =====================================================
// TAHAP D — Employee Dashboard (self)
// =====================================================
function EmployeeDashboard({
  profile,
  branches,
  setPage
}) {
  return /*#__PURE__*/React.createElement(EmployeeDashboardView, {
    employee: profile,
    profile: profile,
    isAdminViewing: false,
    branches: branches,
    onViewTransactions: () => setPage && setPage('myTransactions')
  });
}

// =====================================================
// TAHAP D — Admin Viewing Employee Dashboard
// =====================================================
function AdminEmployeeView({
  profile,
  employee,
  branches,
  onBack,
  setPage
}) {
  return /*#__PURE__*/React.createElement(EmployeeDashboardView, {
    employee: employee,
    profile: profile,
    isAdminViewing: true,
    branches: branches,
    onBack: onBack,
    onViewPayroll: () => setPage && setPage('payroll')
  });
}

// =====================================================
// PHOTO UPLOAD FIELD — Tahap E
// Reusable photo upload widget (camera + gallery)
// =====================================================
function PhotoUploadField({
  label,
  hint,
  photoType,
  existingPhoto,
  onUploaded,
  onDeleted,
  transactionId,
  branchId,
  disabled = false,
  required = false
}) {
  const [uploading, setUploading] = useStateP(false);
  const [previewUrl, setPreviewUrl] = useStateP(null);
  const cameraInputRef = useRefP(null);
  const galleryInputRef = useRefP(null);

  // Update preview when existingPhoto changes
  useEffectP(() => {
    if (existingPhoto?.signedUrl) {
      setPreviewUrl(existingPhoto.signedUrl);
    } else if (!existingPhoto) {
      setPreviewUrl(null);
    }
  }, [existingPhoto]);
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('File harus berupa gambar', 'error');
      return;
    }
    if (!transactionId) {
      toast('Transaksi belum tersimpan. Simpan transaksi dulu, lalu upload foto.', 'error');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = ev => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(file);

      // Delete existing photo first (if any, since we have unique constraint)
      if (existingPhoto?.id) {
        await deleteTreatmentPhoto(existingPhoto.id);
      }

      // Upload
      const photo = await uploadTreatmentPhoto({
        transactionId,
        branchId,
        photoType,
        file
      });
      toast(`Foto ${photoType} berhasil diupload ✓`, 'success');

      // Get fresh signed URL
      const photos = await getTransactionPhotos(transactionId);
      const fresh = photos.find(p => p.id === photo.id);
      if (fresh) {
        setPreviewUrl(fresh.signedUrl);
        onUploaded?.(fresh);
      } else {
        onUploaded?.(photo);
      }
    } catch (err) {
      toast('Gagal upload: ' + (err.message || err), 'error');
      setPreviewUrl(existingPhoto?.signedUrl || null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }
  async function handleDelete() {
    if (!existingPhoto?.id) return;
    if (!window.confirm(`Hapus foto ${photoType}?`)) return;
    try {
      await deleteTreatmentPhoto(existingPhoto.id);
      setPreviewUrl(null);
      toast('Foto dihapus', 'success');
      onDeleted?.();
    } catch (err) {
      toast('Gagal hapus foto: ' + (err.message || err), 'error');
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red)'
    }
  }, "*"), existingPhoto && /*#__PURE__*/React.createElement("span", {
    className: "badge",
    style: {
      background: '#ecf5ef',
      color: '#4a7c59',
      fontSize: 9
    }
  }, "✓ Uploaded")), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginBottom: 8,
      lineHeight: 1.5
    }
  }, hint), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '2px dashed',
      borderColor: existingPhoto ? 'var(--green)' : required ? 'var(--amber)' : 'var(--line)',
      borderRadius: 10,
      padding: previewUrl ? 8 : 20,
      background: existingPhoto ? '#f4f9f5' : 'var(--cream)',
      position: 'relative',
      textAlign: 'center',
      minHeight: previewUrl ? 'auto' : 140,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, previewUrl ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: previewUrl,
    alt: `${photoType} preview`,
    style: {
      maxWidth: '100%',
      maxHeight: 200,
      borderRadius: 8,
      objectFit: 'contain',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: () => cameraInputRef.current?.click(),
    disabled: uploading || disabled,
    title: "Ambil foto dengan kamera"
  }, "📷 Kamera"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: () => galleryInputRef.current?.click(),
    disabled: uploading || disabled,
    title: "Pilih dari galeri / file"
  }, "🖼 Galeri"), existingPhoto && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: handleDelete,
    disabled: uploading || disabled,
    style: {
      color: 'var(--red)'
    }
  }, "🗑 Hapus"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 8
    }
  }, "📸"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--plum)',
      marginBottom: 4,
      fontWeight: 500
    }
  }, photoType === 'before' ? 'Foto Sebelum Treatment' : 'Foto Hasil Treatment'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginBottom: 14,
      lineHeight: 1.4,
      maxWidth: 300
    }
  }, photoType === 'after' ? 'Wajib upload sebagai bukti hasil. Bisa pakai kamera HP atau pilih dari galeri.' : 'Optional. Foto sebelum treatment kalau sempat.'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary btn-sm",
    onClick: () => cameraInputRef.current?.click(),
    disabled: uploading || disabled || !transactionId,
    title: "Ambil foto dengan kamera"
  }, uploading ? /*#__PURE__*/React.createElement("span", {
    className: "loader",
    style: {
      borderTopColor: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }) : '📷 Kamera'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost btn-sm",
    onClick: () => galleryInputRef.current?.click(),
    disabled: uploading || disabled || !transactionId,
    title: "Pilih dari galeri / file"
  }, "🖼 Galeri")), !transactionId && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--muted)',
      marginTop: 8,
      fontStyle: 'italic'
    }
  }, "Simpan transaksi dulu untuk upload foto")), uploading && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(255,255,255,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "loader"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 8
    }
  }, "Mengupload & compress..."))), /*#__PURE__*/React.createElement("input", {
    ref: cameraInputRef,
    type: "file",
    accept: "image/*",
    capture: "environment",
    onChange: handleFileSelect,
    style: {
      display: 'none'
    },
    disabled: uploading || disabled
  }), /*#__PURE__*/React.createElement("input", {
    ref: galleryInputRef,
    type: "file",
    accept: "image/*",
    onChange: handleFileSelect,
    style: {
      display: 'none'
    },
    disabled: uploading || disabled
  })));
}

// =====================================================
// PHOTO GALLERY MODAL — Lihat semua foto sebuah transaksi
// =====================================================
function PhotoGalleryModal({
  open,
  transactionId,
  profile,
  onClose
}) {
  const [photos, setPhotos] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [trx, setTrx] = useStateP(null);
  const [skipReason, setSkipReason] = useStateP('');
  const [editingSkipReason, setEditingSkipReason] = useStateP(false);
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'branch_admin';
  async function loadData() {
    if (!transactionId) return;
    setLoading(true);
    try {
      const [photosData, trxData] = await Promise.all([getTransactionPhotos(transactionId), getTransactionDetail(transactionId)]);
      setPhotos(photosData);
      setTrx(trxData);
      setSkipReason(trxData?.photo_skip_reason || '');
    } catch (err) {
      toast('Gagal memuat foto: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    if (open) loadData();
  }, [open, transactionId]);
  const beforePhoto = photos.find(p => p.photo_type === 'before');
  const afterPhoto = photos.find(p => p.photo_type === 'after');
  async function handleMarkMarketing(photo, approved) {
    try {
      await markPhotoMarketing(photo.id, approved);
      toast(approved ? 'Foto ditandai untuk marketing ✓' : 'Tanda marketing dihapus', 'success');
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }
  async function saveSkipReason() {
    try {
      await updatePhotoSkipReason(transactionId, skipReason || null);
      toast('Alasan disimpan', 'success');
      setEditingSkipReason(false);
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }
  function downloadPhoto(photo) {
    if (!photo.signedUrl) return;
    const a = document.createElement('a');
    a.href = photo.signedUrl;
    a.download = `${trx?.client_name_snapshot || 'foto'}_${photo.photo_type}_${trx?.date}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  function shareWA(photo) {
    if (!photo.signedUrl) return;
    // Simple share: open WhatsApp web with text + link
    const text = encodeURIComponent(`Foto hasil treatment ${photo.photo_type === 'after' ? 'after' : 'before'} di JBB. Lihat: ${photo.signedUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
      backdropFilter: 'blur(4px)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 20,
      padding: 28,
      width: '100%',
      maxWidth: 820,
      maxHeight: '92vh',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-lg)'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, "📸 Foto Treatment"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 24,
      fontWeight: 400,
      color: 'var(--plum-deep)'
    }
  }, trx?.client_name_snapshot || 'Memuat...'), trx && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 4
    }
  }, fmtDate(trx.date), " · ", fmtTime(trx.start_time), " · ", trx.branch?.name)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "btn btn-ghost btn-sm"
  }, "✕")), loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat foto..."
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
      gap: 16,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 8
    }
  }, "Foto Before", !beforePhoto && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      marginLeft: 6
    }
  }, "(tidak ada)")), beforePhoto?.signedUrl ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--cream)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: beforePhoto.signedUrl,
    alt: "Before",
    style: {
      width: '100%',
      display: 'block',
      maxHeight: 400,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      background: 'var(--paper)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => downloadPhoto(beforePhoto)
  }, "⬇ Download"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => shareWA(beforePhoto)
  }, "💬 WA"), isAdmin && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => handleMarkMarketing(beforePhoto, !beforePhoto.is_marketing_approved),
    style: beforePhoto.is_marketing_approved ? {
      color: 'var(--gold)'
    } : {}
  }, beforePhoto.is_marketing_approved ? '⭐ Marketing ON' : '☆ Mark Marketing'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: async () => {
      if (!window.confirm('Hapus foto before?')) return;
      try {
        await deleteTreatmentPhoto(beforePhoto.id);
        toast('Foto before dihapus', 'success');
        loadData();
      } catch (err) {
        toast('Gagal: ' + err.message, 'error');
      }
    },
    style: {
      color: 'var(--red)'
    }
  }, "🗑 Hapus")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 10px 10px',
      fontSize: 10,
      color: 'var(--muted)'
    }
  }, "Upload: ", beforePhoto.uploaded_at ? new Date(beforePhoto.uploaded_at).toLocaleString('id-ID') : '—')) : /*#__PURE__*/React.createElement(PhotoUploadField, {
    label: "Foto Before",
    hint: "Optional — foto sebelum treatment kalau sempat",
    photoType: "before",
    existingPhoto: null,
    transactionId: transactionId,
    branchId: trx?.branch_id,
    onUploaded: () => loadData()
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 8
    }
  }, "Foto After", !afterPhoto && !trx?.photo_skip_reason && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red)',
      marginLeft: 6
    }
  }, "⚠️ wajib upload")), afterPhoto?.signedUrl ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--cream)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: afterPhoto.signedUrl,
    alt: "After",
    style: {
      width: '100%',
      display: 'block',
      maxHeight: 400,
      objectFit: 'contain'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      background: 'var(--paper)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => downloadPhoto(afterPhoto)
  }, "⬇ Download"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => shareWA(afterPhoto)
  }, "💬 WA"), isAdmin && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => handleMarkMarketing(afterPhoto, !afterPhoto.is_marketing_approved),
    style: afterPhoto.is_marketing_approved ? {
      color: 'var(--gold)'
    } : {}
  }, afterPhoto.is_marketing_approved ? '⭐ Marketing ON' : '☆ Mark Marketing'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: async () => {
      if (!window.confirm('Hapus foto after?')) return;
      try {
        await deleteTreatmentPhoto(afterPhoto.id);
        toast('Foto after dihapus', 'success');
        loadData();
      } catch (err) {
        toast('Gagal: ' + err.message, 'error');
      }
    },
    style: {
      color: 'var(--red)'
    }
  }, "🗑 Hapus")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 10px 10px',
      fontSize: 10,
      color: 'var(--muted)'
    }
  }, "Upload: ", afterPhoto.uploaded_at ? new Date(afterPhoto.uploaded_at).toLocaleString('id-ID') : '—')) : trx?.photo_skip_reason ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      background: '#fdf6e3',
      borderRadius: 10,
      fontSize: 13,
      color: 'var(--plum)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      fontSize: 9,
      marginBottom: 6,
      color: 'var(--amber)'
    }
  }, "⚠️ Foto di-skip"), /*#__PURE__*/React.createElement("div", null, "Alasan: ", trx.photo_skip_reason)) : /*#__PURE__*/React.createElement(PhotoUploadField, {
    label: "Foto After",
    hint: "Wajib upload. Bisa pakai kamera HP atau pilih dari galeri.",
    photoType: "after",
    existingPhoto: null,
    transactionId: transactionId,
    branchId: trx?.branch_id,
    onUploaded: () => loadData(),
    required: true
  }))), !afterPhoto && /*#__PURE__*/React.createElement(Card, {
    title: "Alasan Skip Foto After",
    sub: "Isi alasan jika foto after benar-benar tidak bisa diambil"
  }, editingSkipReason ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Alasan"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: skipReason,
    onChange: e => setSkipReason(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Pilih —"), /*#__PURE__*/React.createElement("option", {
    value: "Klien tolak difoto"
  }, "Klien tolak difoto"), /*#__PURE__*/React.createElement("option", {
    value: "Foto tidak terambil karena alasan teknis"
  }, "Foto tidak terambil karena alasan teknis"), /*#__PURE__*/React.createElement("option", {
    value: "Klien buru-buru pulang"
  }, "Klien buru-buru pulang"), /*#__PURE__*/React.createElement("option", {
    value: "Lainnya"
  }, "Lainnya"))), skipReason === 'Lainnya' && /*#__PURE__*/React.createElement(Field, {
    label: "Alasan custom"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    placeholder: "Tulis alasan...",
    onChange: e => setSkipReason(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => {
      setEditingSkipReason(false);
      setSkipReason(trx?.photo_skip_reason || '');
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: saveSkipReason
  }, "Simpan"))) : /*#__PURE__*/React.createElement(React.Fragment, null, trx?.photo_skip_reason ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, "Alasan tersimpan:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, trx.photo_skip_reason)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setEditingSkipReason(true)
  }, "✏️ Edit")) : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setEditingSkipReason(true)
  }, "+ Tambah Alasan Skip")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onClose
  }, "Tutup"))));
}

// =====================================================
// ABSENSI — Halaman kiosk (perangkat menetap di salon)
// Karyawan tap nama, selfie, sistem catat jam otomatis
// =====================================================
function AbsensiPage({
  profile,
  currentBranchId,
  branches
}) {
  const [employees, setEmployees] = useStateP([]);
  const [todayRows, setTodayRows] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [camTarget, setCamTarget] = useStateP(null); // { employee, kind: 'in'|'out' }
  const [statSaya, setStatSaya] = useStateP(null); // ringkasan absensi diri sendiri
  const [cekLokasi, setCekLokasi] = useStateP(null); // id karyawan yang lokasinya sedang diperiksa
  const [riwayatSaya, setRiwayatSaya] = useStateP([]);
  const [bukaRiwayat, setBukaRiwayat] = useStateP(false);
  const [clock, setClock] = useStateP(new Date());

  // Super admin: kalau "Semua Cabang" dipilih, tampilkan karyawan semua cabang
  const effectiveBranchId = profile.role === 'super_admin' ? currentBranchId : profile.branch_id;
  const semuaCabang = profile.role === 'super_admin' && !currentBranchId;
  const branch = branches.find(b => b.id === effectiveBranchId);

  // Jam berjalan
  useEffectP(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  async function loadData() {
    if (!effectiveBranchId && !semuaCabang) return;
    setLoading(true);
    try {
      const [emps, att] = await Promise.all([listEmployees(effectiveBranchId, true), getTodayAttendance(effectiveBranchId)]);
      setEmployees(emps);
      setTodayRows(att);
    } catch (err) {
      toast('Gagal memuat: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }

  // Ringkasan absensi diri sendiri untuk periode gaji berjalan,
  // supaya karyawan bisa memantau sisa jatah toleransinya sendiri
  async function loadStatSaya() {
    const cabangSaya = profile.branch_id;
    if (!cabangSaya) return;
    try {
      const periode = getPayrollPeriod();
      const [ringkas, rincian] = await Promise.all([getAttendanceSummary(cabangSaya, periode.period_start, periode.period_end), listAttendance(cabangSaya, periode.period_start, periode.period_end)]);
      setStatSaya({
        ...(ringkas.find(x => x.employee_id === profile.id) || null),
        periode
      });
      setRiwayatSaya(rincian.filter(r => r.employee_id === profile.id));
    } catch (e) {
      setStatSaya(null);
    }
  }
  useEffectP(() => {
    loadData();
  }, [effectiveBranchId, semuaCabang]);
  useEffectP(() => {
    loadStatSaya();
  }, [profile.id]);
  function rowFor(empId) {
    return todayRows.find(r => r.employee_id === empId) || null;
  }

  // Status: 'belum' | 'masuk' | 'selesai'
  function statusOf(empId) {
    const r = rowFor(empId);
    if (!r || !r.clock_in_at) return 'belum';
    if (!r.clock_out_at) return 'masuk';
    return 'selesai';
  }
  async function handleCaptured(blob, faceVerified) {
    if (!camTarget) return;
    const {
      employee,
      kind
    } = camTarget;
    setCamTarget(null);
    // Absensi selalu tercatat di cabang KARYAWANNYA, bukan cabang yang
    // sedang dilihat. Penting saat super admin membuka "Semua Cabang".
    const branchAbsen = employee.branch_id || effectiveBranchId;
    if (!branchAbsen) {
      toast('Cabang karyawan tidak diketahui. Hubungi admin.', 'error');
      return;
    }
    try {
      if (kind === 'in') {
        const rec = await clockIn({
          employeeId: employee.id,
          branchId: branchAbsen,
          photoBlob: blob,
          faceVerified
        });
        const st = getArrivalStatus(rec.clock_in_at);
        let pesan;
        if (st?.status === 'telat') pesan = `${employee.full_name}: absen masuk tercatat, terlambat ${st.lateMinutes} menit`;else if (st?.status === 'toleransi') pesan = `${employee.full_name}: absen masuk tercatat, masih dalam toleransi`;else pesan = `${employee.full_name}: absen masuk tercatat, tepat waktu`;
        toast(pesan, st?.status === 'telat' ? 'error' : 'success');
      } else {
        await clockOut({
          employeeId: employee.id,
          branchId: branchAbsen,
          photoBlob: blob,
          faceVerified
        });
        toast(`${employee.full_name}: absen pulang tercatat`, 'success');
      }
      loadData();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }
  const jam = `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}`;
  const detik = String(clock.getSeconds()).padStart(2, '0');
  const tanggalPanjang = clock.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Pisahkan yang ikut absensi dan yang dikecualikan (Owner, Manager, akun kiosk)
  const semuaAbsen = employees.filter(e => !isAttendanceExempt(e));
  const exemptEmployees = employees.filter(e => isAttendanceExempt(e));

  // MODE KIOSK vs MODE PRIBADI
  // Kiosk (boleh absen atas nama siapa saja): admin, atau akun yang memang
  // dikecualikan dari absensi (akun kiosk salon).
  // Pribadi (hanya boleh absen untuk diri sendiri): karyawan biasa yang absen
  // dari HP-nya sendiri. Ini mencegah titip absen atas nama rekan.
  const myRecord = employees.find(e => e.id === profile.id) || null;
  const isKioskMode = profile.role !== 'employee' || (myRecord ? isAttendanceExempt(myRecord) : false);
  const absenEmployees = isKioskMode ? semuaAbsen : semuaAbsen.filter(e => e.id === profile.id);
  const sudahMasuk = absenEmployees.filter(e => statusOf(e.id) !== 'belum').length;
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '24px 16px 20px',
      background: 'var(--mauve)',
      borderRadius: 16,
      marginBottom: 20,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      opacity: 0.85,
      marginBottom: 6
    }
  }, tanggalPanjang), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 56,
      fontWeight: 600,
      lineHeight: 1
    }
  }, jam, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24,
      opacity: 0.7
    }
  }, ":", detik)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      opacity: 0.85,
      marginTop: 8
    }
  }, semuaCabang ? 'Semua Cabang' : branch?.name || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      opacity: 0.9,
      marginTop: 6,
      lineHeight: 1.65
    }
  }, "Sebelum ", toleranceStartLabel(), " tepat waktu ·", ' ', toleranceStartLabel(), "–", toleranceEndLabel(), " toleransi (jatah ", TOLERANCE_QUOTA_PER_PERIOD, "x, lebih dari itu ", fmtRp(TOLERANCE_OVER_PENALTY), "/hari) ·", ' ', "di atas ", toleranceEndLabel(), " terlambat (", fmtRp(LATE_PENALTY_PER_DAY), "/hari)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      opacity: 0.75,
      marginTop: 4
    }
  }, "Pulang 19:30 (toleransi mulai ", departureToleranceLabel(), ") · absen wajib di area salon")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, isKioskMode ? 'Tap nama untuk absen' : 'Tap kartu kamu untuk absen'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, isKioskMode ? `${sudahMasuk} dari ${absenEmployees.length} sudah absen` : 'Absensi pribadi')), loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat karyawan..."
  }) : !absenEmployees.length ? isKioskMode ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada karyawan",
    sub: "Tambahkan karyawan di menu Karyawan."
  }) : /*#__PURE__*/React.createElement(Empty, {
    title: "Kamu tidak terdaftar absensi",
    sub: "Akun ini dikecualikan dari absensi harian. Hubungi manager kalau ini keliru."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
      gap: 12
    }
  }, absenEmployees.map(emp => {
    const st = statusOf(emp.id);
    const r = rowFor(emp.id);
    const kind = st === 'belum' ? 'in' : 'out';
    const disabled = st === 'selesai';
    const bg = st === 'belum' ? 'var(--paper)' : st === 'masuk' ? '#f0f7f2' : 'var(--cream)';
    const border = st === 'belum' ? 'var(--line)' : st === 'masuk' ? 'var(--hijau)' : 'var(--line)';
    const fmtJam = ts => ts ? new Date(ts).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
    return /*#__PURE__*/React.createElement("button", {
      key: emp.id,
      type: "button",
      disabled: disabled,
      onClick: async () => {
        // Cek lokasi dulu supaya tidak sia-sia selfie kalau ternyata ditolak
        const cabang = emp.branch_id || effectiveBranchId;
        setCekLokasi(emp.id);
        try {
          await requireLocationAtBranch(cabang);
          setCamTarget({
            employee: emp,
            kind
          });
        } catch (err) {
          toast(err.message || 'Lokasi tidak bisa diperiksa', 'error');
        } finally {
          setCekLokasi(null);
        }
      },
      style: {
        textAlign: 'left',
        padding: 14,
        borderRadius: 14,
        background: bg,
        border: `1.5px solid ${border}`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.75 : 1,
        transition: 'all .15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14,
        color: 'var(--plum-deep)',
        marginBottom: 2
      }
    }, emp.full_name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        marginBottom: 8
      }
    }, emp.job_title || '—', semuaCabang && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--mauve)'
      }
    }, " · ", branches.find(b => b.id === emp.branch_id)?.name || emp.branch_id)), st === 'belum' && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--mauve)',
        fontWeight: 500
      }
    }, cekLokasi === emp.id ? 'Memeriksa lokasi...' : 'Tap untuk absen masuk'), st === 'masuk' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--hijau)',
        fontWeight: 500
      }
    }, "Masuk ", fmtJam(r.clock_in_at), (() => {
      const st = getArrivalStatus(r.clock_in_at);
      if (st?.status === 'telat') return /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--red)'
        }
      }, " · telat ", st.lateMinutes, "m");
      if (st?.status === 'toleransi') return /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--amber)'
        }
      }, " · dalam toleransi");
      return null;
    })()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--mauve)',
        fontWeight: 500,
        marginTop: 4
      }
    }, cekLokasi === emp.id ? 'Memeriksa lokasi...' : 'Tap untuk absen pulang')), st === 'selesai' && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, fmtJam(r.clock_in_at), " sampai ", fmtJam(r.clock_out_at), (() => {
      const st = getArrivalStatus(r.clock_in_at);
      if (st?.status === 'telat') return /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--red)'
        }
      }, "telat ", st.lateMinutes, " menit");
      if (st?.status === 'toleransi') return /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--amber)'
        }
      }, "dalam toleransi");
      return null;
    })(), (() => {
      const dp = getDepartureStatus(r.clock_out_at);
      if (dp?.status === 'cepat') return /*#__PURE__*/React.createElement("div", {
        style: {
          color: 'var(--red)'
        }
      }, "pulang cepat ", dp.earlyMinutes, " menit");
      return null;
    })(), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--hijau)',
        fontWeight: 500,
        marginTop: 2
      }
    }, "Selesai")));
  })), !loading && !isKioskMode && statSaya && statSaya.employee_id && (() => {
    const kuota = statSaya.tolerance_quota || 7;
    const tol = statSaya.days_tolerance || 0;
    const sisa = Math.max(0, kuota - tol);
    const lewat = statSaya.tolerance_over || 0;
    const telat = statSaya.effective_late_days || 0;
    const potong = statSaya.late_deduction_suggested || 0;
    const fmtJamR = ts => ts ? new Date(ts).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '—';
    return /*#__PURE__*/React.createElement(Card, {
      title: "Absensi Saya",
      sub: `Periode ${fmtDate(statSaya.periode.period_start)} sampai ${fmtDate(statSaya.periode.period_end)}`
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))',
        gap: 10,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '11px 13px',
        background: 'var(--cream)',
        borderRadius: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "Hari hadir"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 23,
        fontWeight: 700,
        color: 'var(--plum-deep)'
      }
    }, statSaya.days_present || 0)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '11px 13px',
        borderRadius: 10,
        background: lewat > 0 ? '#fdf6e3' : 'var(--cream)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "Toleransi terpakai"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 23,
        fontWeight: 700,
        color: lewat > 0 ? 'var(--amber)' : 'var(--plum-deep)'
      }
    }, tol, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        opacity: 0.6
      }
    }, "/", kuota)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: lewat > 0 ? 'var(--amber)' : 'var(--hijau)',
        fontWeight: 500
      }
    }, lewat > 0 ? `${lewat} lewat jatah` : `sisa ${sisa} kali`)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '11px 13px',
        borderRadius: 10,
        background: telat > 0 ? '#fdf2f2' : 'var(--cream)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)'
      }
    }, "Hari terlambat"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 23,
        fontWeight: 700,
        color: telat > 0 ? 'var(--red)' : 'var(--plum-deep)'
      }
    }, telat), potong > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--red)',
        fontWeight: 500
      }
    }, "perkiraan ", fmtRp(potong)))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 12px',
        background: 'var(--mauve-tint)',
        borderRadius: 9,
        fontSize: 11.5,
        color: 'var(--plum)',
        lineHeight: 1.55,
        marginBottom: 10
      }
    }, "Datang sebelum ", statSaya.tolerance_start_label || '09:45', " tepat waktu. Antara ", statSaya.tolerance_start_label || '09:45', " sampai 10:00 masuk toleransi, jatahnya ", kuota, " kali per periode. Lewat jatah dipotong", ' ', fmtRp(statSaya.tolerance_over_penalty_per_day || 5000), " per hari. Datang di atas 10:00 dihitung terlambat dan dipotong", ' ', fmtRp(statSaya.late_penalty_per_day || 15000), " per hari."), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setBukaRiwayat(v => !v)
    }, bukaRiwayat ? 'Sembunyikan rincian harian' : `Lihat rincian harian (${riwayatSaya.length} hari)`), bukaRiwayat && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, riwayatSaya.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, "Belum ada catatan di periode ini."), riwayatSaya.slice().sort((a, b) => a.date < b.date ? 1 : -1).map(r => {
      const st = getArrivalStatus(r.clock_in_at);
      const warna = st?.status === 'telat' ? 'var(--red)' : st?.status === 'toleransi' ? 'var(--amber)' : 'var(--hijau)';
      const label = st?.status === 'telat' ? `telat ${st.lateMinutes}m` : st?.status === 'toleransi' ? 'toleransi' : 'tepat waktu';
      return /*#__PURE__*/React.createElement("div", {
        key: r.id,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          padding: '7px 11px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          fontSize: 12,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 500
        }
      }, fmtDate(r.date)), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--muted)'
        }
      }, fmtJamR(r.clock_in_at), " sampai ", fmtJamR(r.clock_out_at)), /*#__PURE__*/React.createElement("span", {
        style: {
          color: warna,
          fontWeight: 600
        }
      }, label));
    })));
  })(), !loading && isKioskMode && exemptEmployees.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 10
    }
  }, "Tidak ikut absensi"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, exemptEmployees.map(emp => /*#__PURE__*/React.createElement("div", {
    key: emp.id,
    style: {
      padding: '8px 12px',
      borderRadius: 100,
      background: 'var(--cream)',
      border: '1px dashed var(--line)',
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, emp.full_name, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      opacity: 0.75
    }
  }, "· ", attendanceExemptReason(emp) || 'Dikecualikan'))))), camTarget && /*#__PURE__*/React.createElement(FaceScanCamera, {
    employeeName: camTarget.employee.full_name,
    kind: camTarget.kind,
    onCancel: () => setCamTarget(null),
    onCaptured: handleCaptured
  }));
}

// =====================================================
// Kamera selfie dengan animasi pemindaian wajah
// Catatan: animasi ini efek visual, bukan pengenalan wajah sungguhan
// =====================================================
// =====================================================
// DETEKSI WAJAH — memakai MediaPipe Face Detector
// Model hanya dimuat saat kamera dibuka, jadi tidak memberatkan
// pemuatan aplikasi secara keseluruhan.
// =====================================================
const MP_VERSION = '0.10.18';
let _faceDetectorPromise = null;
function loadFaceDetector() {
  if (_faceDetectorPromise) return _faceDetectorPromise;
  _faceDetectorPromise = (async () => {
    const vision = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/vision_bundle.mjs`);
    const fileset = await vision.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`);
    return await vision.FaceDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.5
    });
  })().catch(err => {
    _faceDetectorPromise = null; // biar bisa dicoba lagi nanti
    throw err;
  });
  return _faceDetectorPromise;
}

// Aturan kelayakan wajah. Dibuat tidak terlalu ketat supaya karyawan
// tidak frustrasi, tapi cukup untuk menolak jari, langit-langit, dan
// wajah yang terlalu jauh atau membelakangi.
const FACE_MIN_WIDTH_RATIO = 0.26; // lebar wajah minimal terhadap lebar layar
const FACE_MAX_WIDTH_RATIO = 0.92; // terlalu dekat sampai terpotong
const FACE_CENTER_TOLERANCE_X = 0.22;
const FACE_CENTER_TOLERANCE_Y = 0.26;
function evaluateFace(result, vw, vh) {
  const dets = result?.detections || [];
  if (dets.length === 0) return {
    ok: false,
    msg: 'Wajah tidak terdeteksi'
  };
  if (dets.length > 1) return {
    ok: false,
    msg: 'Terdeteksi lebih dari satu wajah'
  };
  const d = dets[0];
  const box = d.boundingBox;
  if (!box) return {
    ok: false,
    msg: 'Wajah tidak terdeteksi'
  };
  const ratio = box.width / vw;
  if (ratio < FACE_MIN_WIDTH_RATIO) return {
    ok: false,
    msg: 'Dekatkan wajah ke kamera'
  };
  if (ratio > FACE_MAX_WIDTH_RATIO) return {
    ok: false,
    msg: 'Terlalu dekat, mundur sedikit'
  };

  // Titik tengah wajah harus berada di sekitar tengah layar
  const cx = (box.originX + box.width / 2) / vw;
  const cy = (box.originY + box.height / 2) / vh;
  if (Math.abs(cx - 0.5) > FACE_CENTER_TOLERANCE_X) return {
    ok: false,
    msg: 'Posisikan wajah di tengah'
  };
  if (Math.abs(cy - 0.5) > FACE_CENTER_TOLERANCE_Y) return {
    ok: false,
    msg: 'Posisikan wajah di tengah'
  };

  // Tingkat 2: pastikan wajah menghadap depan lewat titik mata & hidung.
  // Titik dari MediaPipe: mata kanan, mata kiri, ujung hidung, mulut, 2 tragion.
  const kp = d.keypoints || [];
  if (kp.length >= 4) {
    const [m1, m2, hidung] = kp;
    if (m1 && m2 && hidung) {
      const jarakMata = Math.abs(m1.x - m2.x);
      if (jarakMata < 0.04) return {
        ok: false,
        msg: 'Hadapkan wajah lurus ke kamera'
      };

      // Hidung harus berada di antara kedua mata, tidak melenceng jauh
      const tengahMata = (m1.x + m2.x) / 2;
      const geser = Math.abs(hidung.x - tengahMata) / jarakMata;
      if (geser > 0.62) return {
        ok: false,
        msg: 'Jangan menoleh, hadap ke kamera'
      };

      // Kepala tidak boleh terlalu miring
      const beda = Math.abs(m1.y - m2.y) / jarakMata;
      if (beda > 0.55) return {
        ok: false,
        msg: 'Tegakkan kepala'
      };
    }
  }
  return {
    ok: true,
    msg: 'Wajah terdeteksi, siap difoto'
  };
}

// =====================================================
// Kamera selfie dengan pemeriksaan wajah sungguhan
// =====================================================
function FaceScanCamera({
  employeeName,
  kind,
  onCancel,
  onCaptured
}) {
  const videoRef = useRefP(null);
  const streamRef = useRefP(null);
  const detectorRef = useRefP(null);
  const rafRef = useRefP(null);
  const okStreakRef = useRefP(0);
  const [phase, setPhase] = useStateP('starting'); // starting | ready | scanning | done | error
  const [errMsg, setErrMsg] = useStateP('');
  const [faceMsg, setFaceMsg] = useStateP('Menyiapkan pemeriksaan wajah...');
  const [faceOk, setFaceOk] = useStateP(false);
  const [detectorSiap, setDetectorSiap] = useStateP(false);
  const [detectorGagal, setDetectorGagal] = useStateP(false);
  useEffectP(() => {
    let cancelled = false;
    async function start() {
      // 1. Nyalakan kamera dulu supaya karyawan tidak menunggu lama
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: {
              ideal: 640
            },
            height: {
              ideal: 640
            }
          },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPhase('ready');
      } catch (e) {
        setErrMsg('Kamera tidak bisa diakses. Pastikan izin kamera diaktifkan di browser.');
        setPhase('error');
        return;
      }

      // 2. Muat model pemeriksa wajah
      try {
        const det = await loadFaceDetector();
        if (cancelled) return;
        detectorRef.current = det;
        setDetectorSiap(true);
        setFaceMsg('Posisikan wajah di dalam oval');
        jalankanDeteksi();
      } catch (e) {
        if (cancelled) return;
        // Gagal muat model: absensi tetap boleh jalan, tapi ditandai belum terverifikasi
        setDetectorGagal(true);
        setFaceOk(true);
        setFaceMsg('Pemeriksaan wajah tidak aktif');
      }
    }
    function jalankanDeteksi() {
      const v = videoRef.current;
      const det = detectorRef.current;
      if (!v || !det || cancelled) return;
      let lastTs = -1;
      const loop = () => {
        if (cancelled) return;
        const vid = videoRef.current;
        if (vid && vid.readyState >= 2 && vid.videoWidth > 0) {
          const ts = performance.now();
          if (ts !== lastTs) {
            lastTs = ts;
            try {
              const hasil = det.detectForVideo(vid, ts);
              const nilai = evaluateFace(hasil, vid.videoWidth, vid.videoHeight);
              // Butuh beberapa frame berturut-turut supaya tidak berkedip-kedip
              if (nilai.ok) okStreakRef.current += 1;else okStreakRef.current = 0;
              const stabil = okStreakRef.current >= 3;
              setFaceOk(stabil);
              setFaceMsg(stabil ? 'Wajah terdeteksi, siap difoto' : nilai.msg);
            } catch (e) {/* lewati frame yang bermasalah */}
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }
    start();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);
  function stopKamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }
  function captureBlob() {
    return new Promise(resolve => {
      const v = videoRef.current;
      if (!v) return resolve(null);
      const size = 640;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const vw = v.videoWidth || size,
        vh = v.videoHeight || size;
      const side = Math.min(vw, vh);
      const sx = (vw - side) / 2,
        sy = (vh - side) / 2;
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, sx, sy, side, side, 0, 0, size, size);
      canvas.toBlob(b => resolve(b), 'image/jpeg', 0.75);
    });
  }
  async function handleShoot() {
    if (!faceOk) return;
    setPhase('scanning');
    const blob = await captureBlob();
    // Jeda supaya animasi pemindaian terlihat
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => {
        stopKamera();
        // Tandai apakah foto ini benar-benar lolos pemeriksaan wajah
        onCaptured(blob, !detectorGagal);
      }, 900);
    }, 1400);
  }
  const judul = kind === 'in' ? 'Absen Masuk' : 'Absen Pulang';
  const bolehFoto = phase === 'ready' && faceOk;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(20,14,24,0.92)',
      zIndex: 9500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        @keyframes jbbScanLine {
          0%   { top: 4%;  opacity: 0; }
          10%  { opacity: 1; }
          50%  { top: 94%; opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 4%;  opacity: 0; }
        }
        @keyframes jbbPulseRing {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%     { opacity: 0.9;  transform: scale(1.02); }
        }
        @keyframes jbbPopIn {
          0%   { opacity: 0; transform: scale(0.8); }
          60%  { opacity: 1; transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        .jbb-scan-line {
          position:absolute; left:6%; right:6%; height:3px;
          background:linear-gradient(90deg, transparent, #c9a961, #fff, #c9a961, transparent);
          box-shadow:0 0 14px 3px rgba(201,169,97,0.65);
          animation: jbbScanLine 2.6s ease-in-out infinite;
        }
        .jbb-scan-line.fast {
          animation-duration: 1.2s; height:4px;
          box-shadow:0 0 18px 5px rgba(201,169,97,0.85);
        }
        .jbb-corner {
          position:absolute; width:34px; height:34px;
          border-color:#c9a961; border-style:solid; border-width:0;
          transition: border-color .25s;
        }
        .jbb-corner.ok { border-color:#4a7c59; }
      `), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 400,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      marginBottom: 4,
      fontSize: 13,
      opacity: 0.8
    }
  }, judul), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      marginBottom: 16,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 26,
      fontWeight: 600
    }
  }, employeeName), phase === 'error' ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 10
    }
  }, "📷"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--red)',
      fontSize: 14,
      marginBottom: 16
    }
  }, errMsg), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onCancel
  }, "Tutup")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      borderRadius: 20,
      overflow: 'hidden',
      background: '#000',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    playsInline: true,
    muted: true,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: 'scaleX(-1)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: 'jbb-corner' + (faceOk ? ' ok' : ''),
    style: {
      top: 12,
      left: 12,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderTopLeftRadius: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: 'jbb-corner' + (faceOk ? ' ok' : ''),
    style: {
      top: 12,
      right: 12,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderTopRightRadius: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: 'jbb-corner' + (faceOk ? ' ok' : ''),
    style: {
      bottom: 12,
      left: 12,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderBottomLeftRadius: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: 'jbb-corner' + (faceOk ? ' ok' : ''),
    style: {
      bottom: 12,
      right: 12,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderBottomRightRadius: 10
    }
  }), phase !== 'done' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '12%',
      left: '22%',
      width: '56%',
      height: '70%',
      border: faceOk ? '2.5px solid rgba(74,124,89,0.9)' : '2px dashed rgba(255,255,255,0.55)',
      borderRadius: '50% / 42%',
      animation: faceOk ? 'none' : 'jbbPulseRing 2s ease-in-out infinite',
      pointerEvents: 'none',
      transition: 'border-color .25s'
    }
  }), (phase === 'ready' || phase === 'scanning') && /*#__PURE__*/React.createElement("div", {
    className: 'jbb-scan-line' + (phase === 'scanning' ? ' fast' : '')
  }), phase === 'done' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(74,124,89,0.88)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'jbbPopIn .45s ease-out'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 52,
      marginBottom: 10
    }
  }, "✓"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 600
    }
  }, "Wajah terekam"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      marginTop: 4
    }
  }, "Absensi sedang disimpan")), phase === 'scanning' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 14,
      left: 0,
      right: 0,
      color: '#c9a961',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.06em'
    }
  }, "MEMINDAI WAJAH...")), phase === 'ready' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '9px 14px',
      borderRadius: 100,
      marginBottom: 14,
      fontSize: 13,
      fontWeight: 600,
      background: faceOk ? 'rgba(74,124,89,0.22)' : 'rgba(255,255,255,0.12)',
      color: faceOk ? '#8fd6a5' : '#fff',
      display: 'inline-block'
    }
  }, faceOk ? '✓ ' : '', faceMsg), detectorGagal && phase === 'ready' && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 11,
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "Pemeriksaan wajah tidak bisa dijalankan di perangkat ini.", /*#__PURE__*/React.createElement("br", null), "Absensi tetap tersimpan dan akan ditandai untuk diperiksa manual."), phase === 'ready' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => {
      stopKamera();
      onCancel();
    },
    style: {
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.4)'
    }
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleShoot,
    disabled: !bolehFoto,
    style: {
      minWidth: 170,
      opacity: bolehFoto ? 1 : 0.45
    }
  }, bolehFoto ? 'Ambil Foto & Absen' : 'Menunggu Wajah')), phase === 'starting' && /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      fontSize: 13,
      opacity: 0.8
    }
  }, "Menyalakan kamera..."), (phase === 'scanning' || phase === 'done') && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12
    }
  }, "Mohon tunggu sebentar"))));
}

// =====================================================
// LAPORAN ABSENSI — rekap per periode untuk admin
// =====================================================
function LaporanAbsensiPage({
  profile,
  currentBranchId,
  branches
}) {
  const [rows, setRows] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [preset, setPreset] = useStateP('period');
  const [customFrom, setCustomFrom] = useStateP('');
  const [customTo, setCustomTo] = useStateP('');
  const [photoUrl, setPhotoUrl] = useStateP(null);
  const [photoLabel, setPhotoLabel] = useStateP('');
  const [fotoLama, setFotoLama] = useStateP(null);
  const [bersihkan, setBersihkan] = useStateP(false);
  const isSuper = profile.role === 'super_admin';
  const effectiveBranchId = isSuper ? currentBranchId : profile.branch_id;
  const canDelete = isSuper || profile.role === 'branch_admin';
  const range = useMemoP(() => {
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (preset === 'today') return {
      from: fmt(today),
      to: fmt(today)
    };
    if (preset === 'week') {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return {
        from: fmt(s),
        to: fmt(today)
      };
    }
    if (preset === 'custom' && customFrom && customTo) return {
      from: customFrom,
      to: customTo
    };
    const p = getPayrollPeriod();
    return {
      from: p.period_start,
      to: p.period_end
    };
  }, [preset, customFrom, customTo]);
  async function load() {
    setLoading(true);
    try {
      const data = await listAttendance(effectiveBranchId, range.from, range.to);
      setRows(data);
    } catch (err) {
      toast('Gagal memuat: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }
  async function cekFotoLama() {
    try {
      setFotoLama(await countOldAttendancePhotos(effectiveBranchId));
    } catch (e) {
      setFotoLama(null);
    }
  }
  useEffectP(() => {
    load();
  }, [effectiveBranchId, range.from, range.to]);
  useEffectP(() => {
    cekFotoLama();
  }, [effectiveBranchId]);
  async function showPhoto(path, label) {
    if (!path) {
      toast('Tidak ada foto', 'error');
      return;
    }
    const url = await getAttendancePhotoUrl(path);
    if (!url) {
      toast('Foto tidak bisa dibuka', 'error');
      return;
    }
    setPhotoLabel(label);
    setPhotoUrl(url);
  }
  async function handleDelete(row) {
    if (!window.confirm(`Hapus absensi ${row.employee?.full_name} tanggal ${fmtDate(row.date)}?`)) return;
    try {
      const {
        error
      } = await sb.from('attendance').delete().eq('id', row.id);
      if (error) throw error;
      toast('Absensi dihapus', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }

  // Rekap per karyawan.
  // Dihitung ulang dari jam masuknya, BUKAN dari angka telat yang tersimpan,
  // supaya konsisten dengan rincian harian dan tidak terpengaruh data lama
  // yang tersimpan sebelum aturan toleransi berlaku.
  const summary = useMemoP(() => {
    const by = {};
    const kuota = typeof TOLERANCE_QUOTA_PER_PERIOD !== 'undefined' ? TOLERANCE_QUOTA_PER_PERIOD : 7;
    for (const r of rows) {
      const id = r.employee_id;
      if (!by[id]) by[id] = {
        name: r.employee?.full_name || '—',
        hadir: 0,
        toleransi: 0,
        telat: 0,
        menitTelat: 0,
        lupaPulang: 0
      };
      const s = by[id];
      if (r.clock_in_at) s.hadir += 1;
      const st = getArrivalStatus(r.clock_in_at);
      if (st?.status === 'telat') {
        s.telat += 1;
        s.menitTelat += st.lateMinutes;
      } else if (st?.status === 'toleransi') {
        s.toleransi += 1;
      }
      if (r.clock_in_at && !r.clock_out_at) s.lupaPulang += 1;
    }
    return Object.values(by).map(s => {
      const lewat = Math.max(0, s.toleransi - kuota);
      return {
        ...s,
        kuota,
        lewatJatah: lewat,
        telatEfektif: s.telat + lewat
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);
  const fmtJam = ts => ts ? new Date(ts).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '—';
  const fmtJarak = m => m == null ? '' : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
  const radiusFor = bid => Number(branches.find(b => b.id === bid)?.geofence_radius_m) || 200;
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Laporan Absensi",
    sub: "Kehadiran"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: load
  }, "Muat ulang")), fotoLama && fotoLama.photos > 0 && /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--plum-deep)'
    }
  }, fotoLama.photos, " foto selfie dari periode lama"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 3,
      lineHeight: 1.5
    }
  }, "Foto sebelum ", fmtDate(fotoLama.batas), " sudah tidak dibutuhkan karena gajinya sudah diproses. Catatan absensinya tetap tersimpan, hanya fotonya yang dihapus.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    disabled: bersihkan,
    onClick: async () => {
      if (!window.confirm(`Hapus ${fotoLama.photos} foto selfie dari periode sebelum ${fmtDate(fotoLama.batas)}?\n\nCatatan absensi dan jam kerjanya TIDAK ikut terhapus.`)) return;
      setBersihkan(true);
      try {
        const hasil = await cleanupOldAttendancePhotos(effectiveBranchId);
        toast(`${hasil.deletedPhotos} foto lama dihapus ✓`, 'success');
        cekFotoLama();
        load();
      } catch (err) {
        toast('Gagal: ' + (err.message || err), 'error');
      } finally {
        setBersihkan(false);
      }
    }
  }, bersihkan ? 'Membersihkan...' : 'Bersihkan Foto Lama'))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Field, {
    label: "Periode"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, [['period', 'Periode (26–25)'], ['today', 'Hari ini'], ['week', '7 hari'], ['custom', 'Custom']].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: 'btn btn-sm ' + (preset === v ? 'btn-primary' : 'btn-ghost'),
    onClick: () => setPreset(v)
  }, l)))), preset === 'custom' && /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Dari"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customFrom,
    onChange: e => setCustomFrom(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sampai"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "form-input",
    value: customTo,
    onChange: e => setCustomTo(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, fmtDate(range.from), " sampai ", fmtDate(range.to), " · ", rows.length, " catatan")), (() => {
    const belum = rows.filter(r => r.face_verified === false);
    if (!belum.length) return null;
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--amber)'
      }
    }, "⚠️ ", belum.length, " absensi tanpa pemeriksaan wajah"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)',
        marginTop: 4,
        lineHeight: 1.5,
        marginBottom: 8
      }
    }, "Pemeriksaan wajah tidak bisa berjalan di perangkat mereka, biasanya karena sinyal jelek saat memuat. Absensinya tetap tersimpan. Ada baiknya fotonya diperiksa manual."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
      }
    }, belum.slice(0, 12).map(r => /*#__PURE__*/React.createElement("button", {
      key: r.id,
      className: "btn btn-ghost btn-sm",
      style: {
        fontSize: 11
      },
      onClick: () => showPhoto(r.clock_in_photo, `${r.employee?.full_name} · ${fmtDate(r.date)}`)
    }, r.employee?.full_name, " · ", fmtDate(r.date)))));
  })(), /*#__PURE__*/React.createElement(Card, {
    title: "Rekap per Karyawan",
    sub: "Jumlah hari hadir dan keterlambatan"
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !summary.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada data absensi",
    sub: "Belum ada yang absen di periode ini."
  }) : /*#__PURE__*/React.createElement("div", {
    className: "table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Karyawan"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Hari Hadir"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Toleransi"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Hari Telat"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Total Telat"), /*#__PURE__*/React.createElement("th", {
    className: "table-numeric"
  }, "Lupa Pulang"))), /*#__PURE__*/React.createElement("tbody", null, summary.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.name
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 500
    }
  }, s.name), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric"
  }, s.hadir), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: s.lewatJatah > 0 ? 'var(--amber)' : 'inherit'
    }
  }, s.toleransi, "/", s.kuota, s.lewatJatah > 0 ? ` (+${s.lewatJatah})` : ''), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: s.telatEfektif > 0 ? 'var(--red)' : 'inherit'
    }
  }, s.telatEfektif), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: s.menitTelat > 0 ? 'var(--red)' : 'inherit'
    }
  }, s.menitTelat > 0 ? `${s.menitTelat} menit` : '—'), /*#__PURE__*/React.createElement("td", {
    className: "table-numeric",
    style: {
      color: s.lupaPulang > 0 ? 'var(--amber)' : 'inherit'
    }
  }, s.lupaPulang > 0 ? s.lupaPulang : '—'))))))), /*#__PURE__*/React.createElement(Card, {
    title: "Rincian Harian",
    sub: "Klik jam untuk melihat foto selfie"
  }, loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !rows.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Belum ada catatan",
    sub: "Belum ada absensi di periode ini."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, rows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      padding: '10px 12px',
      border: '1px solid var(--line)',
      borderRadius: 10,
      background: 'var(--paper)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 14
    }
  }, r.employee?.full_name || '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, fmtDate(r.date))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => showPhoto(r.clock_in_photo, `${r.employee?.full_name} · masuk`)
  }, r.face_verified === false && /*#__PURE__*/React.createElement("span", {
    title: "Pemeriksaan wajah tidak berjalan, perlu dicek manual"
  }, "⚠️ "), "Masuk ", fmtJam(r.clock_in_at), (() => {
    const st = getArrivalStatus(r.clock_in_at);
    if (st?.status === 'telat') return /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red)'
      }
    }, " · telat ", st.lateMinutes, "m");
    if (st?.status === 'toleransi') return /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, " · toleransi");
    return null;
  })()), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => showPhoto(r.clock_out_photo, `${r.employee?.full_name} · pulang`),
    disabled: !r.clock_out_at
  }, "Pulang ", fmtJam(r.clock_out_at), (() => {
    const dp = getDepartureStatus(r.clock_out_at);
    if (dp?.status === 'cepat') return /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red)'
      }
    }, " · cepat ", dp.earlyMinutes, "m");
    if (dp?.status === 'toleransi') return /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, " · toleransi");
    return null;
  })()), canDelete && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      color: 'var(--red)'
    },
    onClick: () => handleDelete(r)
  }, "Hapus"))), (r.clock_in_lat != null || r.clock_out_lat != null) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      paddingTop: 8,
      borderTop: '1px solid var(--line)',
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      fontSize: 11,
      color: 'var(--muted)'
    }
  }, r.clock_in_lat != null && (() => {
    const jauh = r.clock_in_distance_m != null && r.clock_in_distance_m > radiusFor(r.branch_id);
    return /*#__PURE__*/React.createElement("a", {
      href: mapsLinkFor(r.clock_in_lat, r.clock_in_lng),
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        color: jauh ? 'var(--red)' : 'var(--mauve)',
        textDecoration: 'none',
        fontWeight: jauh ? 600 : 400
      }
    }, jauh ? '⚠️' : '📍', " Masuk", r.clock_in_distance_m != null ? ` · ${fmtJarak(r.clock_in_distance_m)} dari salon` : '', r.clock_in_accuracy != null ? ` (±${r.clock_in_accuracy}m)` : '');
  })(), r.clock_out_lat != null && (() => {
    const jauh = r.clock_out_distance_m != null && r.clock_out_distance_m > radiusFor(r.branch_id);
    return /*#__PURE__*/React.createElement("a", {
      href: mapsLinkFor(r.clock_out_lat, r.clock_out_lng),
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        color: jauh ? 'var(--red)' : 'var(--mauve)',
        textDecoration: 'none',
        fontWeight: jauh ? 600 : 400
      }
    }, jauh ? '⚠️' : '📍', " Pulang", r.clock_out_distance_m != null ? ` · ${fmtJarak(r.clock_out_distance_m)} dari salon` : '', r.clock_out_accuracy != null ? ` (±${r.clock_out_accuracy}m)` : '');
  })()))))), photoUrl && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.75)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    onClick: () => setPhotoUrl(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 420,
      width: '100%',
      textAlign: 'center'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#fff',
      marginBottom: 10,
      fontSize: 14
    }
  }, photoLabel), /*#__PURE__*/React.createElement("img", {
    src: photoUrl,
    alt: "Selfie absensi",
    style: {
      width: '100%',
      borderRadius: 16,
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      marginTop: 14,
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.4)'
    },
    onClick: () => setPhotoUrl(null)
  }, "Tutup"))));
}

// =====================================================
// SWIPE UNTUK KONFIRMASI — geser ke kanan untuk maju tahap
// Mencegah salah tekan saat buru-buru
// =====================================================
function SwipeConfirm({
  label,
  color = 'var(--mauve)',
  onConfirm,
  disabled = false
}) {
  const trackRef = useRefP(null);
  const [dragX, setDragX] = useStateP(0);
  const [dragging, setDragging] = useStateP(false);
  const [busy, setBusy] = useStateP(false);
  const KNOB = 52;
  function maxDrag() {
    const w = trackRef.current?.offsetWidth || 280;
    return Math.max(0, w - KNOB - 8);
  }
  function startDrag(clientX) {
    if (disabled || busy) return;
    setDragging(true);
    trackRef.current._startX = clientX;
  }
  function moveDrag(clientX) {
    if (!dragging) return;
    const dx = clientX - (trackRef.current?._startX || 0);
    setDragX(Math.min(maxDrag(), Math.max(0, dx)));
  }
  async function endDrag() {
    if (!dragging) return;
    setDragging(false);
    const m = maxDrag();
    if (dragX >= m * 0.85) {
      setDragX(m);
      setBusy(true);
      try {
        await onConfirm();
      } finally {
        setBusy(false);
        setDragX(0);
      }
    } else {
      setDragX(0);
    }
  }
  const progress = maxDrag() > 0 ? dragX / maxDrag() : 0;
  return /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onPointerDown: e => {
      e.currentTarget.setPointerCapture(e.pointerId);
      startDrag(e.clientX);
    },
    onPointerMove: e => moveDrag(e.clientX),
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    style: {
      position: 'relative',
      height: 60,
      borderRadius: 100,
      background: disabled ? 'var(--cream)' : 'var(--mauve-tint)',
      overflow: 'hidden',
      touchAction: 'none',
      userSelect: 'none',
      cursor: disabled ? 'default' : 'grab',
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      width: `${progress * 100}%`,
      background: color,
      opacity: 0.25,
      transition: dragging ? 'none' : 'width .2s'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 600,
      color: color,
      paddingLeft: KNOB,
      opacity: 1 - progress * 0.8,
      pointerEvents: 'none'
    }
  }, busy ? 'Menyimpan...' : label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 4,
      left: 4 + dragX,
      width: KNOB,
      height: KNOB,
      borderRadius: '50%',
      background: color,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      fontWeight: 700,
      transition: dragging ? 'none' : 'left .2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
    }
  }, busy ? '⋯' : '›'));
}

// =====================================================
// HOME SERVICE — halaman utama
// =====================================================
function HomeServicePage({
  profile,
  currentBranchId,
  branches,
  setPage
}) {
  const [jobs, setJobs] = useStateP([]);
  const [loading, setLoading] = useStateP(true);
  const [showForm, setShowForm] = useStateP(false);
  const [showHistory, setShowHistory] = useStateP(false);
  const [detailJob, setDetailJob] = useStateP(null);
  const [addMemberJob, setAddMemberJob] = useStateP(null);
  const [returnAsk, setReturnAsk] = useStateP(null); // { job, member }
  const [tick, setTick] = useStateP(0);
  const isAdmin = profile.role === 'super_admin' || profile.role === 'branch_admin';
  // Super admin: kalau "Semua Cabang" dipilih (currentBranchId kosong),
  // tampilkan orderan SEMUA cabang, bukan jatuh ke cabang sendiri.
  const effectiveBranchId = profile.role === 'super_admin' ? currentBranchId : profile.branch_id;
  const semuaCabang = profile.role === 'super_admin' && !currentBranchId;

  // Perbarui tampilan durasi tiap menit
  useEffectP(() => {
    const t = setInterval(() => setTick(x => x + 1), 60000);
    return () => clearInterval(t);
  }, []);
  async function load() {
    if (!effectiveBranchId && !semuaCabang) return;
    setLoading(true);
    try {
      const data = await listHomeServiceJobs({
        branchId: effectiveBranchId
      });
      setJobs(data);
    } catch (err) {
      toast('Gagal memuat: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
    }
  }
  useEffectP(() => {
    load();
  }, [effectiveBranchId, semuaCabang]);

  // Beautician hanya melihat orderan miliknya. Admin melihat semua.
  const visibleJobs = isAdmin ? jobs : jobs.filter(j => (j.members || []).some(m => m.employee_id === profile.id));
  const activeJobs = visibleJobs.filter(j => HS_ACTIVE_STATUSES.includes(j.status));
  const pastJobs = visibleJobs.filter(j => !HS_ACTIVE_STATUSES.includes(j.status));

  // Saat tahap terakhir, tanyakan dulu kembali ke mana lewat dua tombol
  async function handleAdvance(job, member) {
    const info = hsStatusInfo(member.status);
    if (info.next === 'returned') {
      setReturnAsk({
        job,
        member
      });
      return;
    }
    await doAdvance(job, member, {});
  }
  async function doAdvance(job, member, extra) {
    try {
      const updated = await advanceHomeServiceMember(member, extra);
      toast(hsStatusInfo(updated.status).label + ' ✓', 'success');
      await load();

      // Setelah selesai treatment, arahkan ke input transaksi
      if (updated.status === 'done') {
        try {
          sessionStorage.setItem('jbb_hs_prefill', JSON.stringify({
            job_id: job.id,
            client_name: job.client_name,
            client_phone: job.client_phone || '',
            employee_id: updated.employee_id
          }));
        } catch (e) {}
        setTimeout(() => {
          if (window.confirm('Treatment selesai. Lanjut input transaksi sekarang?')) {
            setPage && setPage('newTransaction');
          }
        }, 400);
      }
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }
  async function handleCancel(job) {
    const alasan = window.prompt('Alasan pembatalan:');
    if (alasan === null) return;
    try {
      await cancelHomeServiceJob(job.id, alasan);
      toast('Orderan dibatalkan', 'success');
      load();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    }
  }
  const fmtJam = ts => ts ? new Date(ts).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : '—';
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Home Service",
    sub: "Pelacakan"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: load
  }, "Muat ulang"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => setShowForm(true)
  }, "+ Orderan Baru")), loading ? /*#__PURE__*/React.createElement(Loader, {
    text: "Memuat..."
  }) : !activeJobs.length ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Empty, {
    title: "Tidak ada home service berjalan",
    sub: isAdmin ? 'Buat orderan baru lewat tombol di atas.' : 'Belum ada orderan untuk kamu saat ini.'
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, activeJobs.map(job => {
    const info = hsStatusInfo(job.status);
    const milikSaya = job.employee_id === profile.id;
    // Waktu sejak tahap terakhir, untuk memantau yang belum kembali
    const lastTs = job.finished_at || job.started_at || job.accepted_at || job.created_at;
    const menit = minutesSince(lastTs);
    const lamaKembali = job.status === 'done' && menit != null && menit > 90;
    return /*#__PURE__*/React.createElement(Card, {
      key: job.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 20,
        fontWeight: 600,
        color: 'var(--plum-deep)'
      }
    }, job.client_name), job.client_phone && /*#__PURE__*/React.createElement("a", {
      href: `https://wa.me/${String(job.client_phone).replace(/[^0-9]/g, '').replace(/^0/, '62')}`,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        fontSize: 12,
        color: 'var(--mauve)',
        textDecoration: 'none'
      }
    }, job.client_phone), job.client_address && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)',
        marginTop: 4
      }
    }, job.client_address), semuaCabang && /*#__PURE__*/React.createElement("span", {
      className: "badge badge-mauve",
      style: {
        fontSize: 10,
        marginTop: 5,
        display: 'inline-block'
      }
    }, branches.find(b => b.id === job.branch_id)?.name || job.branch_id)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '5px 12px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        background: 'var(--cream)',
        color: info.color,
        whiteSpace: 'nowrap'
      }
    }, info.label), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      style: {
        padding: '3px 10px',
        fontSize: 11
      },
      onClick: () => setDetailJob(job)
    }, "Lihat detail & lokasi"))), menit != null && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)',
        marginBottom: 12
      }
    }, fmtDurasi(menit), " lalu"), /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "Beautician (", (job.members || []).length, " orang)"), (job.members || []).map(m => {
      const mInfo = hsStatusInfo(m.status);
      const punyaSaya = m.employee_id === profile.id;
      const belumPulang = m.status === 'done' && minutesSince(m.finished_at) > 90;
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        style: {
          padding: '10px 12px',
          borderRadius: 10,
          marginBottom: 10,
          background: punyaSaya ? 'var(--mauve-tint)' : 'var(--cream)',
          border: belumPulang ? '1px solid var(--red)' : '1px solid transparent'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: punyaSaya && mInfo.next ? 10 : 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--plum-deep)'
        }
      }, m.employee?.full_name || '—', punyaSaya && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 400,
          color: 'var(--mauve)'
        }
      }, " · kamu")), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: mInfo.color,
          whiteSpace: 'nowrap'
        }
      }, mInfo.label)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 11,
          color: 'var(--muted)'
        }
      }, m.accepted_at && /*#__PURE__*/React.createElement("span", null, "Berangkat ", fmtJam(m.accepted_at)), m.started_at && /*#__PURE__*/React.createElement("span", null, "Mulai ", fmtJam(m.started_at), m.started_lat != null && /*#__PURE__*/React.createElement("a", {
        href: mapsLinkFor(m.started_lat, m.started_lng),
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          marginLeft: 4,
          color: 'var(--mauve)',
          textDecoration: 'none'
        }
      }, "📍")), m.finished_at && /*#__PURE__*/React.createElement("span", null, "Selesai ", fmtJam(m.finished_at)), m.returned_at && /*#__PURE__*/React.createElement("span", null, "Sampai ", fmtJam(m.returned_at), m.return_to ? ` (${m.return_to})` : '')), belumPulang && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          fontSize: 11,
          color: 'var(--red)',
          fontWeight: 500
        }
      }, "Sudah ", fmtDurasi(minutesSince(m.finished_at)), " sejak selesai tapi belum menandai sudah sampai. Ada baiknya dihubungi."), punyaSaya && mInfo.next && /*#__PURE__*/React.createElement(SwipeConfirm, {
        label: mInfo.nextLabel,
        color: hsStatusInfo(mInfo.next).color,
        onConfirm: () => handleAdvance(job, m)
      }), isAdmin && !punyaSaya && job.status === 'pending' && (job.members || []).length > 1 && /*#__PURE__*/React.createElement("button", {
        className: "btn btn-ghost btn-sm",
        style: {
          marginTop: 8,
          padding: '2px 8px',
          fontSize: 11,
          color: 'var(--red)'
        },
        onClick: async () => {
          if (!window.confirm(`Keluarkan ${m.employee?.full_name} dari orderan ini?`)) return;
          try {
            await removeHomeServiceMember(m.id, job.id);
            toast('Beautician dikeluarkan', 'success');
            load();
          } catch (err) {
            toast('Gagal: ' + (err.message || err), 'error');
          }
        }
      }, "Keluarkan"));
    }), !(job.members || []).some(m => m.employee_id === profile.id) && !isAdmin && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)',
        textAlign: 'center',
        padding: 10
      }
    }, "Kamu bukan bagian dari orderan ini"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setAddMemberJob(job)
    }, "+ Tambah Beautician"), isAdmin && job.status === 'pending' && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      style: {
        color: 'var(--red)'
      },
      onClick: () => handleCancel(job)
    }, "Batalkan orderan")));
  })), !loading && pastJobs.length > 0 && /*#__PURE__*/React.createElement(Card, {
    title: "Riwayat",
    sub: `${pastJobs.length} orderan selesai atau dibatalkan. Klik untuk lihat lokasi.`,
    action: /*#__PURE__*/React.createElement("button", {
      className: "btn btn-ghost btn-sm",
      onClick: () => setShowHistory(v => !v)
    }, showHistory ? 'Sembunyikan' : 'Lihat')
  }, showHistory && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, pastJobs.slice(0, 40).map(job => {
    const info = hsStatusInfo(job.status);
    return /*#__PURE__*/React.createElement("div", {
      key: job.id,
      onClick: () => setDetailJob(job),
      style: {
        padding: '10px 12px',
        border: '1px solid var(--line)',
        borderRadius: 10,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500,
        fontSize: 14
      }
    }, job.client_name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: 'var(--muted)'
      }
    }, fmtDate(job.created_at?.slice(0, 10)), " · ", job.employee?.full_name || '—', job.return_to && ` · kembali ke ${job.return_to}`)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: info.color,
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }
    }, info.label)));
  }))), detailJob && /*#__PURE__*/React.createElement(HomeServiceDetailModal, {
    job: detailJob,
    canDelete: isAdmin,
    onClose: () => setDetailJob(null),
    onDeleted: () => {
      setDetailJob(null);
      load();
    }
  }), returnAsk && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.65)',
      zIndex: 9300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    onClick: () => setReturnAsk(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      padding: '24px 22px',
      maxWidth: 340,
      width: '100%',
      textAlign: 'center'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      marginBottom: 8
    }
  }, "🏠"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--plum-deep)',
      marginBottom: 6
    }
  }, "Kamu sekarang di mana?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--muted)',
      marginBottom: 18,
      lineHeight: 1.5
    }
  }, "Pilih salah satu supaya kami tahu kamu sudah sampai dengan selamat."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      padding: '12px'
    },
    onClick: () => {
      const t = returnAsk;
      setReturnAsk(null);
      doAdvance(t.job, t.member, {
        return_to: 'salon'
      });
    }
  }, "🏪 Balik ke Store"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      padding: '12px',
      background: 'var(--hijau)'
    },
    onClick: () => {
      const t = returnAsk;
      setReturnAsk(null);
      doAdvance(t.job, t.member, {
        return_to: 'rumah'
      });
    }
  }, "🏠 Langsung Pulang ke Rumah"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setReturnAsk(null)
  }, "Batal")))), addMemberJob && /*#__PURE__*/React.createElement(HomeServiceAddMemberModal, {
    job: addMemberJob,
    branchId: effectiveBranchId,
    onClose: () => setAddMemberJob(null),
    onSuccess: () => {
      setAddMemberJob(null);
      load();
    }
  }), showForm && /*#__PURE__*/React.createElement(HomeServiceFormModal, {
    profile: profile,
    branchId: effectiveBranchId,
    branches: branches,
    perluPilihCabang: semuaCabang,
    onClose: () => setShowForm(false),
    onSuccess: () => {
      setShowForm(false);
      load();
    }
  }));
}

// =====================================================
// Form buat orderan home service baru
// =====================================================
function HomeServiceFormModal({
  profile,
  branchId,
  branches = [],
  perluPilihCabang = false,
  onClose,
  onSuccess
}) {
  const [employees, setEmployees] = useStateP([]);
  const [form, setForm] = useStateP({
    employee_ids: profile.role === 'employee' ? [profile.id] : [],
    branch_id: branchId || '',
    client_name: '',
    client_phone: '',
    client_address: '',
    notes: ''
  });
  const [saving, setSaving] = useStateP(false);

  // Daftar karyawan mengikuti cabang yang dipilih
  const cabangAktif = perluPilihCabang ? form.branch_id : branchId;
  useEffectP(() => {
    if (!cabangAktif) {
      setEmployees([]);
      return;
    }
    listEmployees(cabangAktif, true).then(setEmployees).catch(() => {});
  }, [cabangAktif]);
  function update(patch) {
    setForm(f => ({
      ...f,
      ...patch
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    if (!cabangAktif) {
      toast('Pilih cabang dulu', 'error');
      return;
    }
    if (!form.client_name.trim()) {
      toast('Nama client wajib diisi', 'error');
      return;
    }
    if (!form.employee_ids.length) {
      toast('Pilih minimal satu beautician', 'error');
      return;
    }
    setSaving(true);
    try {
      await createHomeServiceJob({
        branch_id: cabangAktif,
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim() || null,
        client_address: form.client_address.trim() || null,
        notes: form.notes.trim() || null
      }, form.employee_ids);
      toast('Orderan home service dibuat ✓', 'success');
      onSuccess();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      padding: 20,
      maxWidth: 460,
      width: '100%',
      maxHeight: '88vh',
      overflowY: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      marginBottom: 14
    }
  }, "Orderan Home Service Baru"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, perluPilihCabang && /*#__PURE__*/React.createElement(Field, {
    label: "Cabang *",
    hint: "Kamu sedang melihat semua cabang, jadi tentukan dulu cabangnya"
  }, /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: form.branch_id,
    onChange: e => update({
      branch_id: e.target.value,
      employee_ids: []
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— pilih cabang —"), branches.map(b => /*#__PURE__*/React.createElement("option", {
    key: b.id,
    value: b.id
  }, b.name)))), /*#__PURE__*/React.createElement(Field, {
    label: "Beautician *",
    hint: "Bisa pilih lebih dari satu kalau berangkat berdua atau lebih"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      maxHeight: 190,
      overflowY: 'auto',
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: 8
    }
  }, !cabangAktif && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      padding: '10px 6px',
      textAlign: 'center'
    }
  }, "Pilih cabang dulu di atas"), employees.map(emp => {
    const dipilih = form.employee_ids.includes(emp.id);
    return /*#__PURE__*/React.createElement("label", {
      key: emp.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer',
        padding: '7px 9px',
        borderRadius: 8,
        background: dipilih ? 'var(--mauve-tint)' : 'transparent'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: dipilih,
      onChange: e => update({
        employee_ids: e.target.checked ? [...form.employee_ids, emp.id] : form.employee_ids.filter(id => id !== emp.id)
      }),
      style: {
        accentColor: 'var(--mauve)',
        width: 16,
        height: 16
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, emp.full_name, emp.job_title && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, " · ", emp.job_title)));
  })), form.employee_ids.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--mauve)',
      marginTop: 6
    }
  }, form.employee_ids.length, " beautician. Masing-masing menggeser tahapnya sendiri dari HP-nya.")), /*#__PURE__*/React.createElement(Field, {
    label: "Nama Client *"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: form.client_name,
    onChange: e => update({
      client_name: e.target.value
    }),
    placeholder: "Nama client"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "No. HP Client"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-input",
    value: form.client_phone,
    onChange: e => update({
      client_phone: e.target.value
    }),
    placeholder: "08xxxxxxxxxx"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Alamat",
    hint: "Tulis selengkap mungkin untuk keamanan"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "form-textarea",
    rows: "2",
    value: form.client_address,
    onChange: e => update({
      client_address: e.target.value
    }),
    placeholder: "Alamat lengkap client"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Catatan"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "form-textarea",
    rows: "2",
    value: form.notes,
    onChange: e => update({
      notes: e.target.value
    }),
    placeholder: "Treatment yang dipesan, patokan lokasi, dll"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: onClose,
    disabled: saving
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "btn btn-primary",
    disabled: saving
  }, saving ? 'Menyimpan...' : 'Buat Orderan')))));
}

// =====================================================
// Tambah beautician ke orderan home service yang sudah berjalan
// =====================================================
function HomeServiceAddMemberModal({
  job,
  branchId,
  onClose,
  onSuccess
}) {
  const [employees, setEmployees] = useStateP([]);
  const [picked, setPicked] = useStateP([]);
  const [saving, setSaving] = useStateP(false);
  useEffectP(() => {
    listEmployees(branchId, true).then(setEmployees).catch(() => {});
  }, [branchId]);
  const sudahAda = new Set((job.members || []).map(m => m.employee_id));
  const tersedia = employees.filter(e => !sudahAda.has(e.id));
  async function handleSave() {
    if (!picked.length) {
      toast('Pilih minimal satu beautician', 'error');
      return;
    }
    setSaving(true);
    try {
      for (const eid of picked) {
        await addHomeServiceMember(job.id, eid);
      }
      toast('Beautician ditambahkan ✓', 'success');
      onSuccess();
    } catch (err) {
      toast('Gagal: ' + (err.message || err), 'error');
    } finally {
      setSaving(false);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.6)',
      zIndex: 9100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      padding: 20,
      maxWidth: 420,
      width: '100%',
      maxHeight: '85vh',
      overflowY: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h3", {
    className: "card-title",
    style: {
      marginBottom: 4
    }
  }, "Tambah Beautician"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, "Orderan ", job.client_name, ". Yang ditambahkan mulai dari tahap awal dan menggeser tahapnya sendiri."), !tersedia.length ? /*#__PURE__*/React.createElement(Empty, {
    title: "Tidak ada yang bisa ditambahkan",
    sub: "Semua beautician cabang ini sudah masuk orderan."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 16
    }
  }, tersedia.map(emp => {
    const dipilih = picked.includes(emp.id);
    return /*#__PURE__*/React.createElement("label", {
      key: emp.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer',
        padding: '9px 11px',
        borderRadius: 8,
        background: dipilih ? 'var(--mauve-tint)' : 'var(--cream)'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: dipilih,
      onChange: e => setPicked(e.target.checked ? [...picked, emp.id] : picked.filter(id => id !== emp.id)),
      style: {
        accentColor: 'var(--mauve)',
        width: 16,
        height: 16
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, emp.full_name, emp.job_title && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)',
        fontSize: 11
      }
    }, " · ", emp.job_title)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onClose,
    disabled: saving
  }, "Batal"), tersedia.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: handleSave,
    disabled: saving
  }, saving ? 'Menyimpan...' : 'Tambahkan'))));
}

// =====================================================
// Detail perjalanan home service — riwayat 4 tahap + lokasi
// =====================================================
function HomeServiceDetailModal({
  job,
  onClose,
  canDelete = false,
  onDeleted
}) {
  if (!job) return null;
  const fmtJam = ts => ts ? new Date(ts).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) : null;
  const fmtTgl = ts => ts ? new Date(ts).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '';

  // Kalau orderan punya beberapa beautician, tampilkan garis waktu tiap orang
  const members = job.members || [];
  const sumber = members.length ? members : [job];
  const tahapanFor = m => [{
    nama: 'Terima & Berangkat',
    ket: 'Menerima orderan dan berangkat',
    at: m.accepted_at,
    lat: m.accepted_lat,
    lng: m.accepted_lng
  }, {
    nama: 'Sampai & Mulai Kerjakan',
    ket: 'Lokasi rumah client',
    at: m.started_at,
    lat: m.started_lat,
    lng: m.started_lng,
    penting: true
  }, {
    nama: 'Selesai Treatment',
    ket: 'Treatment selesai dikerjakan',
    at: m.finished_at,
    lat: m.finished_lat,
    lng: m.finished_lng
  }, {
    nama: 'Sudah Sampai Kembali',
    ket: m.return_to === 'salon' ? 'Kembali ke salon' : m.return_to === 'rumah' ? 'Langsung pulang ke rumah' : 'Beautician sudah sampai',
    at: m.returned_at,
    lat: m.returned_lat,
    lng: m.returned_lng,
    penting: true
  }];

  // Lama treatment & lama perjalanan pulang
  const acuan = job.members && job.members.length ? job.members[0] : job;
  const lamaTreatment = acuan.started_at && acuan.finished_at ? Math.floor((new Date(acuan.finished_at) - new Date(acuan.started_at)) / 60000) : null;
  const lamaPulang = acuan.finished_at && acuan.returned_at ? Math.floor((new Date(acuan.returned_at) - new Date(acuan.finished_at)) / 60000) : null;
  const info = hsStatusInfo(job.status);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(36,26,44,0.65)',
      zIndex: 9200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--paper)',
      borderRadius: 16,
      maxWidth: 480,
      width: '100%',
      maxHeight: '88vh',
      overflowY: 'auto'
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--plum-deep)'
    }
  }, job.client_name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 2
    }
  }, fmtTgl(job.created_at))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: onClose
  }, "✕")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '4px 11px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      background: 'var(--cream)',
      color: info.color
    }
  }, info.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, "Beautician: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--plum)'
    }
  }, job.employee?.full_name || '—')))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Data Client"), job.client_phone && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: `https://wa.me/${String(job.client_phone).replace(/[^0-9]/g, '').replace(/^0/, '62')}`,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: 'var(--mauve)',
      textDecoration: 'none'
    }
  }, job.client_phone, " · chat WhatsApp")), job.client_address && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--plum)',
      marginBottom: 5
    }
  }, job.client_address), job.notes && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      fontStyle: 'italic'
    }
  }, job.notes), !job.client_phone && !job.client_address && !job.notes && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)'
    }
  }, "Tidak ada data tambahan")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 12
    }
  }, "Riwayat Perjalanan", members.length > 1 ? ` (${members.length} beautician)` : ''), sumber.map((m, mi) => /*#__PURE__*/React.createElement("div", {
    key: m.id || mi,
    style: {
      marginBottom: mi < sumber.length - 1 ? 20 : 0
    }
  }, members.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--plum-deep)',
      marginBottom: 10,
      paddingBottom: 6,
      borderBottom: '1px solid var(--line)'
    }
  }, m.employee?.full_name || '—', /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 400,
      color: hsStatusInfo(m.status).color,
      marginLeft: 8
    }
  }, hsStatusInfo(m.status).label)), tahapanFor(m).map((t, i, daftarTahap) => {
    const sudah = !!t.at;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 12,
        marginBottom: i < daftarTahap.length - 1 ? 4 : 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        flexShrink: 0,
        background: sudah ? t.penting ? 'var(--mauve)' : 'var(--hijau)' : 'var(--cream)',
        border: sudah ? 'none' : '2px dashed var(--line)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700
      }
    }, sudah ? '✓' : ''), i < daftarTahap.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 2,
        flex: 1,
        minHeight: 34,
        background: sudah ? 'var(--mauve-soft)' : 'var(--line)'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        paddingBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: sudah ? 'var(--plum-deep)' : 'var(--muted)'
      }
    }, t.nama), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: sudah ? 'var(--plum)' : 'var(--muted)',
        whiteSpace: 'nowrap'
      }
    }, fmtJam(t.at) || 'belum')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--muted)',
        marginTop: 2
      }
    }, t.ket), sudah && (t.lat != null ? /*#__PURE__*/React.createElement("a", {
      href: mapsLinkFor(t.lat, t.lng),
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        display: 'inline-block',
        marginTop: 5,
        fontSize: 12,
        color: 'var(--mauve)',
        textDecoration: 'none',
        fontWeight: 500
      }
    }, "📍 Buka lokasi di Maps") : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--amber)',
        marginTop: 5
      }
    }, "Lokasi tidak terekam (izin lokasi mati atau sinyal lemah)"))));
  }))), (lamaTreatment != null || lamaPulang != null) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      padding: '10px 12px',
      background: 'var(--cream)',
      borderRadius: 8,
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap',
      fontSize: 12
    }
  }, lamaTreatment != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 11
    }
  }, "Lama treatment"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--plum-deep)'
    }
  }, fmtDurasi(lamaTreatment))), lamaPulang != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--muted)',
      fontSize: 11
    }
  }, "Perjalanan kembali"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--plum-deep)'
    }
  }, fmtDurasi(lamaPulang)))), job.status === 'cancelled' && job.cancel_reason && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      padding: '10px 12px',
      background: '#fdf2f2',
      borderRadius: 8,
      fontSize: 12,
      color: 'var(--red)'
    }
  }, "Dibatalkan: ", job.cancel_reason), canDelete && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 14,
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      color: 'var(--red)'
    },
    onClick: async () => {
      if (!window.confirm(`Hapus permanen orderan "${job.client_name}"?\n\nRiwayat perjalanan dan lokasinya ikut hilang dan tidak bisa dikembalikan.`)) return;
      try {
        await deleteHomeServiceJob(job.id);
        toast('Orderan dihapus', 'success');
        onDeleted && onDeleted();
      } catch (err) {
        toast('Gagal menghapus: ' + (err.message || err), 'error');
      }
    }
  }, "Hapus orderan ini"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--muted)',
      marginTop: 6
    }
  }, "Untuk membersihkan data latihan. Transaksi yang sudah diinput tidak ikut terhapus.")))));
}
Object.assign(window, {
  LoginPage,
  AdminDashboard,
  BranchesPage,
  NewTransactionPage,
  TransactionsPage,
  EmployeesPage,
  EmployeeDashboard,
  AddEmployeeModal,
  DeleteConfirmModal,
  ReportsPage,
  PayrollPage,
  AdjustAttendanceModal,
  AuditLogPage,
  EmployeeDashboardView,
  MyTransactionsPage,
  MySalaryPage,
  AdminEmployeeView,
  EditTransactionModal,
  // Tahap E
  PhotoUploadField,
  PhotoGalleryModal,
  AbsensiPage,
  FaceScanCamera,
  LaporanAbsensiPage,
  HomeServicePage,
  HomeServiceFormModal,
  SwipeConfirm,
  HomeServiceDetailModal,
  HomeServiceAddMemberModal
});

/* ============ app.jsx ============ */
// ===== App root =====
const {
  useState: useStateA,
  useEffect: useEffectA
} = React;
function App() {
  const [loading, setLoading] = useStateA(true);
  const [session, setSession] = useStateA(null);
  const [profile, setProfile] = useStateA(null);
  // Remember the last menu across reloads (Safari often reloads inactive tabs)
  const [page, setPageRaw] = useStateA(() => {
    try {
      return localStorage.getItem('jbb_last_page') || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });
  const setPage = p => {
    setPageRaw(p);
    try {
      localStorage.setItem('jbb_last_page', p);
    } catch (e) {}
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
    const {
      data: {
        subscription
      }
    } = sb.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setBranches([]);
        setCurrentBranchId(null);
        try {
          localStorage.removeItem('jbb_last_page');
          localStorage.removeItem('jbb_last_branch');
        } catch (e) {}
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
        try {
          sessionStorage.setItem('jbb_scroll_' + page, String(window.scrollY));
        } catch (e) {}
        timer = null;
      }, 200);
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
    };
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
    return /*#__PURE__*/React.createElement("div", {
      className: "auth-page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "auth-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "auth-logo"
    }, /*#__PURE__*/React.createElement(JBBLogo, {
      height: 64,
      color: "#7a667e"
    })), /*#__PURE__*/React.createElement("h2", {
      className: "auth-title"
    }, "Setup Required"), /*#__PURE__*/React.createElement("p", {
      className: "auth-desc"
    }, "File ", /*#__PURE__*/React.createElement("code", {
      style: {
        background: 'var(--mauve-tint)',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 12
      }
    }, "config.js"), " belum ada atau credential Supabase belum diisi.")));
  }
  if (loading) {
    return /*#__PURE__*/React.createElement(Loader, {
      text: "Memuat..."
    });
  }
  if (!session || !profile) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(LoginPage, {
      onLoggedIn: bootstrap
    }), /*#__PURE__*/React.createElement(ToastStack, null));
  }

  // Build tabs based on role
  const superTabs = [{
    id: 'dashboard',
    label: 'Dashboard'
  }, {
    id: 'newTransaction',
    label: 'Input Transaksi'
  }, {
    id: 'transactions',
    label: 'Transaksi'
  }, {
    id: 'reports',
    label: 'Laporan'
  }, {
    id: 'kas',
    label: 'Kas'
  }, {
    id: 'homeService',
    label: 'Home Service'
  }, {
    id: 'absensi',
    label: 'Absensi'
  }, {
    id: 'laporanAbsensi',
    label: 'Lap. Absensi'
  }, {
    id: 'payroll',
    label: 'Gaji'
  }, {
    id: 'employees',
    label: 'Karyawan'
  }, {
    id: 'branches',
    label: 'Cabang'
  }, {
    id: 'audit',
    label: 'Audit Log'
  }];
  const branchAdminTabs = [{
    id: 'dashboard',
    label: 'Dashboard'
  }, {
    id: 'newTransaction',
    label: 'Input Transaksi'
  }, {
    id: 'transactions',
    label: 'Transaksi'
  }, {
    id: 'reports',
    label: 'Laporan'
  }, {
    id: 'kas',
    label: 'Kas'
  }, {
    id: 'homeService',
    label: 'Home Service'
  }, {
    id: 'absensi',
    label: 'Absensi'
  }, {
    id: 'laporanAbsensi',
    label: 'Lap. Absensi'
  }, {
    id: 'payroll',
    label: 'Gaji'
  }, {
    id: 'employees',
    label: 'Karyawan'
  }];
  const employeeTabs = [{
    id: 'dashboard',
    label: 'Dashboard'
  }, {
    id: 'newTransaction',
    label: 'Input Transaksi'
  }, {
    id: 'transactions',
    label: 'Transaksi Cabang'
  }, {
    id: 'kas',
    label: 'Kas'
  }, {
    id: 'homeService',
    label: 'Home Service'
  }, {
    id: 'absensi',
    label: 'Absensi'
  }, {
    id: 'myTransactions',
    label: 'Transaksi Saya'
  }];
  let tabs;
  if (profile.role === 'super_admin') tabs = superTabs;else if (profile.role === 'branch_admin') tabs = branchAdminTabs;else tabs = employeeTabs;

  // Route pages
  let pageContent;
  const isAdmin = profile.role === 'super_admin' || profile.role === 'branch_admin';
  if (isAdmin) {
    switch (page) {
      case 'newTransaction':
        pageContent = /*#__PURE__*/React.createElement(NewTransactionPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches,
          setPage: setPage
        });
        break;
      case 'transactions':
        pageContent = /*#__PURE__*/React.createElement(TransactionsPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches,
          setPage: setPage
        });
        break;
      case 'reports':
        pageContent = /*#__PURE__*/React.createElement(ReportsPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches
        });
        break;
      case 'kas':
        pageContent = /*#__PURE__*/React.createElement(KasPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches
        });
        break;
      case 'homeService':
        pageContent = /*#__PURE__*/React.createElement(HomeServicePage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches,
          setPage: setPage
        });
        break;
      case 'absensi':
        pageContent = /*#__PURE__*/React.createElement(AbsensiPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches
        });
        break;
      case 'laporanAbsensi':
        pageContent = /*#__PURE__*/React.createElement(LaporanAbsensiPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches
        });
        break;
      case 'payroll':
        pageContent = /*#__PURE__*/React.createElement(PayrollPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches
        });
        break;
      case 'employees':
        pageContent = /*#__PURE__*/React.createElement(EmployeesPage, {
          profile: profile,
          currentBranchId: currentBranchId,
          branches: branches
        });
        break;
      case 'audit':
        if (profile.role === 'super_admin') {
          pageContent = /*#__PURE__*/React.createElement(AuditLogPage, {
            profile: profile,
            branches: branches
          });
        } else {
          pageContent = /*#__PURE__*/React.createElement(AdminDashboard, {
            profile: profile,
            setPage: setPage,
            currentBranchId: currentBranchId,
            branches: branches
          });
        }
        break;
      case 'branches':
        if (profile.role === 'super_admin') {
          pageContent = /*#__PURE__*/React.createElement(BranchesPage, null);
        } else {
          pageContent = /*#__PURE__*/React.createElement(AdminDashboard, {
            profile: profile,
            setPage: setPage,
            currentBranchId: currentBranchId,
            branches: branches
          });
        }
        break;
      default:
        pageContent = /*#__PURE__*/React.createElement(AdminDashboard, {
          profile: profile,
          setPage: setPage,
          currentBranchId: currentBranchId,
          branches: branches
        });
    }
  } else {
    // Employee role
    switch (page) {
      case 'newTransaction':
        pageContent = /*#__PURE__*/React.createElement(NewTransactionPage, {
          profile: profile,
          currentBranchId: profile.branch_id,
          branches: branches,
          setPage: setPage
        });
        break;
      case 'transactions':
        pageContent = /*#__PURE__*/React.createElement(TransactionsPage, {
          profile: profile,
          currentBranchId: profile.branch_id,
          branches: branches,
          setPage: setPage
        });
        break;
      case 'myTransactions':
        pageContent = /*#__PURE__*/React.createElement(MyTransactionsPage, {
          profile: profile
        });
        break;
      case 'kas':
        pageContent = /*#__PURE__*/React.createElement(KasPage, {
          profile: profile,
          currentBranchId: profile.branch_id,
          branches: branches
        });
        break;
      case 'homeService':
        pageContent = /*#__PURE__*/React.createElement(HomeServicePage, {
          profile: profile,
          currentBranchId: profile.branch_id,
          branches: branches,
          setPage: setPage
        });
        break;
      case 'absensi':
        pageContent = /*#__PURE__*/React.createElement(AbsensiPage, {
          profile: profile,
          currentBranchId: profile.branch_id,
          branches: branches
        });
        break;
      default:
        pageContent = /*#__PURE__*/React.createElement(EmployeeDashboard, {
          profile: profile,
          branches: branches,
          setPage: setPage
        });
    }
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TopNav, {
    profile: profile,
    page: page,
    setPage: setPage,
    tabs: tabs,
    currentBranchId: currentBranchId,
    setCurrentBranchId: id => {
      setCurrentBranchId(id);
      try {
        if (id) localStorage.setItem('jbb_last_branch', id);else localStorage.removeItem('jbb_last_branch');
      } catch (e) {}
    },
    branches: branches
  }), pageContent, /*#__PURE__*/React.createElement(AppFooter, null), /*#__PURE__*/React.createElement(ToastStack, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
