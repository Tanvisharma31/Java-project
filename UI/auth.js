/**
 * auth.js — Session management & validation helpers.
 * Mirrors: adminLogin(), staffLogin(), customerLogin() in MainApp.java
 */

const Auth = {
  session: null,
  failedAttempts: 0,
  lockUntil: 0,

  login(role, id, password) {
    const now = Date.now();
    if (now < this.lockUntil) {
      const secs = Math.ceil((this.lockUntil - now) / 1000);
      return { success: false, locked: true, seconds: secs };
    }

    let user = null;
    if (role === 'admin') {
      if (id === 'admin' && password === 'admin123') user = { role: 'admin', name: 'Administrator', id: 'admin' };
    } else if (role === 'staff') {
      const s = findStaff(id);
      if (s && s.password === password) user = { role: 'staff', name: s.name, id: s.staffId, data: s };
    } else if (role === 'customer') {
      applyLateFees(DB.bills);
      const c = findCustomer(id);
      if (c && c.password === password) user = { role: 'customer', name: c.name, id: c.consumerId, data: c };
    }

    if (user) {
      this.session = user;
      this.failedAttempts = 0;
      sessionStorage.setItem('vs_session', JSON.stringify(user));
      return { success: true, user };
    }

    this.failedAttempts++;
    if (this.failedAttempts >= 3) {
      this.lockUntil = Date.now() + 10000;
      this.failedAttempts = 0;
      return { success: false, locked: true, seconds: 10 };
    }
    return { success: false, remaining: 3 - this.failedAttempts };
  },

  logout() {
    this.session = null;
    sessionStorage.removeItem('vs_session');
    window.location.href = 'index.html';
  },

  restore() {
    try {
      const s = sessionStorage.getItem('vs_session');
      if (s) this.session = JSON.parse(s);
    } catch(e) { this.session = null; }
    return this.session;
  },

  require(role) {
    const s = this.restore();
    if (!s || (role && s.role !== role)) { window.location.href = 'index.html'; return null; }
    return s;
  },
};

/* ══════════════════════════════════════════
   VALIDATION HELPERS
   Updated per sheet requirements: 13-digit consumer ID, 5-20 char user ID, 6-30 char password, etc.
   Mirrors all readEmail(), readMobile(), readPassword(), readName() in MainApp.java
══════════════════════════════════════════ */
const Validate = {
  // Updated per sheet requirements
  consumerId(v) { return /^\d{13}$/.test(v.trim()) ? '' : 'Consumer ID must be exactly 13 digits.'; },
  name(v)     { return /^[A-Za-z\s]{2,50}$/.test(v.trim()) ? '' : 'Name must be 2-50 letters (alphabets only).'; },
  email(v)    { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.'; },
  mobile(v)   { return /^\d{10}$/.test(v.trim()) ? '' : 'Mobile must be exactly 10 digits.'; },
  password(v) { return /^(?=.*\d).{6,30}$/.test(v) ? '' : 'Password: min 6 chars, max 30 chars, at least 1 digit.'; },
  userId(v)   { return /^[A-Za-z0-9]{5,20}$/.test(v.trim()) ? '' : 'User ID must be 5-20 alphanumeric characters.'; },
  title(v)    { return ['Mr','Mrs','Ms','Dr'].includes(v) ? '' : 'Title must be Mr, Mrs, Ms, or Dr.'; },
  status(v)   { return ['Active','Inactive'].includes(v) ? '' : 'Status must be Active or Inactive.'; },

  // Payment validations per sheet requirements
  cardNumber(v)     { return /^\d{16,}$/.test(v.replace(/\s/g,'')) ? '' : 'Card number must be minimum 16 digits.'; },
  cardHolderName(v) { return v.trim().length >= 10 ? '' : 'Card holder name must be minimum 10 characters.'; },
  expiryDate(v)    { return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? '' : 'Expiry date must be in MM/YY format.'; },
  cvv(v)            { return /^\d{3,4}$/.test(v) ? '' : 'CVV must be 3-4 digits.'; },

  // Complaint validations per sheet requirements
  complaintConsumerNo(v) { return /^\d{13}$/.test(v.trim()) ? '' : 'Consumer No must be 13 digits.'; },
  complaintMobile(v)     { return /^\d{10}$/.test(v.trim()) ? '' : 'Mobile must be 10 digits.'; },
  complaintType(v)        { return ['Billing related','Voltage related','Frequent disruption','Street light related','Pole related'].includes(v) ? '' : 'Invalid complaint type.'; },

  // Existing validations
  id(v)       { return /^[A-Za-z0-9]+$/.test(v.trim()) ? '' : 'ID must be alphanumeric.'; },
  card(v)     { return /^\d{16}$/.test(v.replace(/\s/g,'')) ? '' : 'Card number must be exactly 16 digits.'; },
  upi(v)      { return v.includes('@') ? '' : 'UPI ID must contain "@".'; },
  load(v)     { return parseFloat(v) > 0 ? '' : 'Load must be a positive number.'; },
  reading(cur, prev) { return parseInt(cur) >= parseInt(prev) ? '' : `Reading must be ≥ previous (${prev}).`; },
  required(v) { return v && String(v).trim().length > 0 ? '' : 'This field is required.'; },
};

/* ══════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
══════════════════════════════════════════ */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

/* ══════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════ */
function openModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModal';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}
function closeModal() {
  const m = document.getElementById('activeModal');
  if (m) m.remove();
}

/* ══════════════════════════════════════════
   SIDEBAR HELPERS
══════════════════════════════════════════ */
function buildSidebar(role, activeSection) {
  const navs = {
    admin: [
      { icon: '📊', label: 'Dashboard',         id: 'dashboard' },
      { icon: '👥', label: 'Customers',          id: 'customers' },
      { icon: '👷', label: 'Staff',              id: 'staff' },
      { icon: '⚡', label: 'Tariff Config',      id: 'tariff' },
      { icon: '🔧', label: 'Requests & Complaints', id: 'requests' },
      { icon: '📈', label: 'Analytics',          id: 'analytics' },
    ],
    staff: [
      { icon: '📟', label: 'Meter Readings',     id: 'meter' },
      { icon: '📋', label: 'Area Complaints',    id: 'area-complaints' },
    ],
    customer: [
      { icon: '🏠', label: 'Dashboard',          id: 'dashboard' },
      { icon: '💡', label: 'My Profile',         id: 'profile' },
      { icon: '🧾', label: 'View & Pay Bills',   id: 'bills' },
      { icon: '📜', label: 'Payment History',    id: 'history' },
      { icon: '📣', label: 'Raise Complaint',    id: 'complaint' },
      { icon: '🔧', label: 'Service Requests',   id: 'service' },
      { icon: '🔔', label: 'Notifications',      id: 'notifications' },
      { icon: '🔑', label: 'Change Password',    id: 'password' },
    ],
  };
  const session = Auth.restore();
  const items = navs[role] || [];
  const initials = session ? session.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

  return `
    <div class="sidebar-brand">
      <span class="sidebar-brand-icon">⚡</span>
      <div>
        <div class="sidebar-brand-text">VidyutSeva</div>
        <div class="sidebar-brand-sub">${role.charAt(0).toUpperCase()+role.slice(1)} Portal</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${items.map(item => `
        <button class="nav-item ${item.id === activeSection ? 'active' : ''}" data-section="${item.id}" onclick="navigate('${item.id}')">
          <span class="nav-icon">${item.icon}</span>
          ${item.label}
        </button>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div class="avatar" style="width:36px;height:36px;font-size:0.9rem">${initials}</div>
        <div>
          <div style="font-size:0.85rem;font-weight:600">${session ? session.name : ''}</div>
          <div style="font-size:0.72rem;color:var(--text-muted)">${session ? session.id : ''}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-full btn-sm" onclick="Auth.logout()">🚪 Logout</button>
    </div>`;
}

function renderBadge(value) {
  const cls = value ? value.toLowerCase().replace(/[^a-z]/g,'') : '';
  return `<span class="badge badge-${cls}">${value || '—'}</span>`;
}
