/**
 * login.js — Login page logic.
 * Mirrors: startScreen(), adminLogin(), staffLogin(), customerLogin()
 */

(function () {
  const form      = document.getElementById('loginForm');
  const loginId   = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const toggleBtn = document.getElementById('togglePass');
  const lockBanner= document.getElementById('lockoutBanner');
  const countdown = document.getElementById('lockCountdown');
  const roleTabs  = document.querySelectorAll('.role-tab');
  let   activeRole = 'customer';

  /* ── Redirect if already logged in ── */
  const existing = Auth.restore();
  if (existing) redirectToPortal(existing.role);

  /* ── Role tab switching ── */
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRole = tab.dataset.role;
      loginId.placeholder = activeRole === 'admin' ? 'admin' : activeRole === 'staff' ? 'e.g. S101' : 'e.g. C101';
      clearErrors();
    });
  });

  /* ── Password toggle ── */
  toggleBtn.addEventListener('click', () => {
    const isPass = loginPass.type === 'password';
    loginPass.type = isPass ? 'text' : 'password';
    toggleBtn.textContent = isPass ? '🙈' : '👁';
  });

  /* ── Form submit ── */
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const id   = loginId.value.trim();
    const pass = loginPass.value;
    let   valid = true;

    if (!id)   { showFieldError('errLoginId', 'ID is required.');       valid = false; }
    if (!pass) { showFieldError('errLoginPass', 'Password is required.'); valid = false; }
    if (!valid) return;

    const btn = document.getElementById('loginBtn');
    btn.innerHTML = '<span class="spinner"></span> Signing in…';
    btn.disabled = true;

    setTimeout(() => {
      const result = Auth.login(activeRole, id, pass);
      btn.innerHTML = 'Sign In';
      btn.disabled = false;

      if (result.success) {
        showToast(`Welcome, ${result.user.name}! 🎉`, 'success');
        setTimeout(() => redirectToPortal(result.user.role), 800);
      } else if (result.locked) {
        showLockout(result.seconds);
      } else {
        showFieldError('errLoginPass', `Invalid credentials. ${result.remaining} attempt(s) left.`);
        loginPass.value = '';
        loginPass.focus();
      }
    }, 600);
  });

  /* ── Lock countdown ── */
  function showLockout(seconds) {
    lockBanner.classList.remove('hidden');
    countdown.textContent = seconds;
    const iv = setInterval(() => {
      seconds--;
      countdown.textContent = seconds;
      if (seconds <= 0) { clearInterval(iv); lockBanner.classList.add('hidden'); }
    }, 1000);
  }

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  }

  function redirectToPortal(role) {
    const pages = { admin: 'admin.html', staff: 'staff.html', customer: 'customer.html' };
    window.location.href = pages[role] || 'index.html';
  }
})();
