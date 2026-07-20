/**
 * data.js — In-memory data store mirroring Java arrays.
 * Mirrors: MainApp.java → loadDummyData()
 */

const DB = {
  /* ── TARIFF CONFIG ── */
  tariff: {
    residential: { fixedPerKw: 50, slab1: 3.5, slab2: 5.0, slab3: 7.0 },
    commercial:  { fixedPerKw: 100, slab1: 6.0, slab2: 8.0, slab3: 10.0 },
    dutyPct: 0.05,
  },

  /* ── CUSTOMERS ── */
  customers: [
    {
      consumerId: '1234567890123', name: 'Amit Sharma', email: 'amit@test.com',
      mobile: '9876543210', password: 'pass123', title: 'Mr', userId: 'amit123', status: 'Active',
      addressArea: 'Delhi North', connectionType: 'RESIDENTIAL', sanctionedLoadKw: 2.0,
      previousMeterReading: 1500, notifications: ['Welcome to Electricity Board.'],
    },
    {
      consumerId: '1234567890124', name: 'Priya Singh', email: 'priya@test.com',
      mobile: '8765432109', password: 'pass123', title: 'Mrs', userId: 'priya123', status: 'Active',
      addressArea: 'Delhi South', connectionType: 'COMMERCIAL', sanctionedLoadKw: 5.0,
      previousMeterReading: 5000, notifications: [],
    },
  ],

  /* ── STAFF ── */
  staff: [
    { staffId: 'S101', name: 'Ramesh Kumar', password: 'staff123', areaAssigned: 'Delhi North' },
    { staffId: 'S102', name: 'Suresh Verma', password: 'staff123', areaAssigned: 'Delhi South' },
  ],

  /* ── BILLS ── */
  bills: (() => {
    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    const sub = (d, n) => { const x = new Date(d); x.setDate(x.getDate() - n); return x; };
    const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
    return [
      {
        billId: 'B1001', consumerId: '1234567890123', previousReading: 1255, currentReading: 1500,
        unitsConsumed: 245, amount: 1225.00, lateFee: 0, totalPayable: 1225.00,
        billDate: fmt(sub(today, 20)), dueDate: fmt(sub(today, 5)),
        status: 'PENDING', paymentMethod: 'N/A', paymentDate: null,
      },
      {
        billId: 'B1002', consumerId: '1234567890124', previousReading: 4850, currentReading: 5000,
        unitsConsumed: 150, amount: 600.00, lateFee: 0, totalPayable: 600.00,
        billDate: fmt(today), dueDate: fmt(add(today, 15)),
        status: 'PENDING', paymentMethod: 'N/A', paymentDate: null,
      },
    ];
  })(),

  /* ── COMPLAINTS ── */
  complaints: [
    { complaintId: 'COMP1001', consumerId: '1234567890123', description: 'Meter reading incorrect', priority: 'HIGH', status: 'OPEN' },
  ],

  /* ── SERVICE REQUESTS ── */
  requests: [
    { requestId: 'REQ1001', consumerId: '1234567890123', requestType: 'LOAD_CHANGE', description: 'Increase load to 4.0 kW', status: 'PENDING' },
  ],

  /* ── COUNTERS (for ID generation) ── */
  billSeq: 1002,
  complaintSeq: 1001,
  requestSeq: 1001,
};

/* ══════════════════════════════════════════
   BILLING ENGINE — mirrors calculateBillAmount()
══════════════════════════════════════════ */
function calculateBillAmount(units, customer) {
  const t = customer.connectionType === 'RESIDENTIAL' ? DB.tariff.residential : DB.tariff.commercial;
  const fixed = t.fixedPerKw * customer.sanctionedLoadKw;
  let energy = 0;
  if (units <= 100)      energy = units * t.slab1;
  else if (units <= 300) energy = (100 * t.slab1) + ((units - 100) * t.slab2);
  else                   energy = (100 * t.slab1) + (200 * t.slab2) + ((units - 300) * t.slab3);
  const subtotal = fixed + energy;
  return +(subtotal + subtotal * DB.tariff.dutyPct).toFixed(2);
}

/* ══════════════════════════════════════════
   LATE FEE ENGINE — mirrors applyLateFee()
   2% penalty per 7-day block, capped at 20%
══════════════════════════════════════════ */
function applyLateFees(bills) {
  const today = new Date(); today.setHours(0,0,0,0);
  bills.forEach(b => {
    if (b.status !== 'PENDING') return;
    const due = new Date(b.dueDate); due.setHours(0,0,0,0);
    if (today > due) {
      const days = Math.floor((today - due) / 86400000);
      const blocks = Math.ceil(days / 7);
      const pct = Math.min(blocks * 0.02, 0.20);
      b.lateFee = +(b.amount * pct).toFixed(2);
      b.totalPayable = +(b.amount + b.lateFee).toFixed(2);
    }
  });
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function findCustomer(id)  { return DB.customers.find(c => c.consumerId === id); }
function findStaff(id)     { return DB.staff.find(s => s.staffId === id); }
function findComplaint(id) { return DB.complaints.find(c => c.complaintId === id); }
function findRequest(id)   { return DB.requests.find(r => r.requestId === id); }

function customerBills(consumerId, status = null) {
  return DB.bills.filter(b => b.consumerId === consumerId && (status ? b.status === status : true));
}

function nextId(prefix, seq) { return `${prefix}${seq}`; }

function todayStr() { return new Date().toISOString().split('T')[0]; }
function dueDateStr(days = 15) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatCurrency(n) { return `₹ ${Number(n).toFixed(2)}`; }
function formatDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── ANALYTICS ── */
function getAnalytics() {
  applyLateFees(DB.bills);
  let revenue = 0, pending = 0;
  DB.bills.forEach(b => {
    if (b.status === 'PAID') revenue += b.totalPayable;
    else pending += b.totalPayable;
  });
  const openComplaints     = DB.complaints.filter(c => c.status === 'OPEN').length;
  const resolvedComplaints = DB.complaints.filter(c => c.status === 'RESOLVED').length;
  const today = new Date(); today.setHours(0,0,0,0);
  const defaulters = DB.bills.filter(b => {
    const due = new Date(b.dueDate); due.setHours(0,0,0,0);
    return b.status === 'PENDING' && today > due;
  });
  return {
    totalCustomers: DB.customers.length,
    totalStaff: DB.staff.length,
    totalBills: DB.bills.length,
    revenue: +revenue.toFixed(2),
    pendingDues: +pending.toFixed(2),
    openComplaints, resolvedComplaints,
    defaulters,
    pendingRequests: DB.requests.filter(r => r.status === 'PENDING').length,
  };
}
