// ============================================================
// WELLFIX ERP — ADMIN SHELL JS
// Shared: auth guard, sidebar, navigation, toast, helpers
// ============================================================

'use strict';

// ── AUTH GUARD ───────────────────────────────────────────────
// Add to every admin page: AdminShell.init('PageTitle')
const AdminShell = {
  user: null,

  async init(pageTitle = 'Dashboard', requiredRole = null) {
    // Check auth
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      window.location.href = '/admin/login.html';
      return;
    }
    // Get profile
    const { data: profile } = await db.from('profiles')
      .select('*').eq('id', session.user.id).single();

    if (!profile || !profile.is_active) {
      await db.auth.signOut();
      window.location.href = '/admin/login.html';
      return;
    }
    // Role check
    if (requiredRole) {
      const roleHierarchy = { super_admin: 5, admin: 4, content: 3, staff: 2, inventory: 1 };
      if ((roleHierarchy[profile.role] || 0) < (roleHierarchy[requiredRole] || 0)) {
        window.location.href = '/admin/dashboard.html';
        return;
      }
    }
    this.user = { ...session.user, profile };
    this._renderShell(pageTitle);
    this._updateUserUI();
    return this.user;
  },

  _renderShell(pageTitle) {
    // Inject sidebar + topbar into #adminShell element
    const shell = document.getElementById('adminShell');
    if (!shell) return;

    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    const navItems = [
      { group: 'Main', items: [
        { page: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z' },
        { page: 'analytics', label: 'Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
      ]},
      { group: 'Catalogue', items: [
        { page: 'products', label: 'Products', icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0', badge: 0 },
        { page: 'categories', label: 'Categories', icon: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' },
        { page: 'brands', label: 'Brands', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z' },
        { page: 'inventory', label: 'Inventory', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
      ]},
      { group: 'Commerce', items: [
        { page: 'orders', label: 'Orders', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11', badge: 'orders' },
        { page: 'customers', label: 'Customers', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
        { page: 'coupons', label: 'Coupons', icon: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z' },
        { page: 'reviews', label: 'Reviews', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      ]},
      { group: 'Services', items: [
        { page: 'services', label: 'Bookings', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z', badge: 'services' },
      ]},
      { group: 'Content', items: [
        { page: 'homepage', label: 'Homepage', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
        { page: 'banners', label: 'Banners', icon: 'M3 3h18v18H3z M3 9h18 M9 21V9' },
        { page: 'blog', label: 'Blog', icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
        { page: 'media', label: 'Media', icon: 'M3 3h18v18H3z M8.5 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21' },
      ]},
      { group: 'System', items: [
        { page: 'seo', label: 'SEO', icon: 'M11 11a4 4 0 107.07 2.93M11 11l6.07 2.93M11 11V3M11 11H3' },
        { page: 'users', label: 'Admin Users', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z' },
        { page: 'settings', label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
      ]},
    ];

    const navHTML = navItems.map(group => `
      <div class="nav-section-label">${group.group}</div>
      ${group.items.map(item => `
        <a href="${item.page}.html" class="nav-link ${currentPage === item.page ? 'is-active' : ''}" data-tooltip="${item.label}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
            ${item.icon.split('M').filter(Boolean).map(d => `<path d="M${d}"/>`).join('')}
          </svg>
          <span class="nav-link__text">${item.label}</span>
          ${item.badge ? `<span class="nav-badge" id="badge-${item.page}">0</span>` : ''}
        </a>`).join('')}`).join('');

    shell.innerHTML = `
      <!-- Sidebar overlay -->
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <!-- Toast -->
      <div class="toast" id="toast">
        <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span id="toastMsg"></span>
      </div>

      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__logo">
            <img src="../frontend/assets/images/WELLFIX-MAIN-LOGO.png" alt="WellFix"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
              style="width:28px;height:28px;">
            <span style="display:none;font-family:var(--font-display);font-size:14px;font-weight:800;color:#fff;">W</span>
          </div>
          <div class="sidebar__brand-info">
            <div class="sidebar__brand-name">WellFix</div>
            <div class="sidebar__brand-role" id="sidebarRole">Admin</div>
          </div>
        </div>
        <nav class="sidebar__nav">${navHTML}</nav>
        <div class="sidebar__footer">
          <div class="sidebar__user" onclick="AdminShell.logout()">
            <div class="sidebar__avatar" id="userAvatar">A</div>
            <div class="sidebar__user-info">
              <div class="sidebar__user-name" id="userName">Loading…</div>
              <div class="sidebar__user-role" id="userRole">—</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Topbar -->
      <div class="topbar" id="topbar">
        <button class="topbar__menu-btn" id="menuBtn" onclick="AdminShell.toggleSidebar()">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="topbar__crumb">
          WellFix &nbsp;<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>&nbsp;
          <span>${pageTitle}</span>
        </div>
        <div class="topbar__spacer"></div>
        <div class="topbar__search">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="search" placeholder="Search…">
        </div>
        <div class="topbar__actions">
          <button class="topbar__icon-btn" title="Notifications">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="topbar__notif-dot" id="notifDot" style="display:none"></span>
          </button>
        </div>
        <a href="../frontend/index.html" target="_blank" class="topbar__view-site">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          <span>View Site</span>
        </a>
      </div>`;

    // Sidebar toggle
    document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());
    this._loadBadges();
  },

  _updateUserUI() {
    const p = this.user?.profile;
    if (!p) return;
    const name = p.full_name || this.user.email;
    const role = (p.role || 'staff').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    document.getElementById('userName').textContent = name;
    document.getElementById('userRole').textContent = role;
    document.getElementById('sidebarRole').textContent = role;
    document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
  },

  async _loadBadges() {
    try {
      const [orders, bookings] = await Promise.all([
        db.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        db.from('service_bookings').select('id', { count: 'exact' }).eq('status', 'new')
      ]);
      const ob = document.getElementById('badge-orders');
      const sb = document.getElementById('badge-services');
      if (ob && orders.count) { ob.textContent = orders.count; ob.style.display = 'flex'; }
      if (sb && bookings.count) { sb.textContent = bookings.count; sb.style.display = 'flex'; }
      if ((orders.count || 0) > 0) {
        const dot = document.getElementById('notifDot');
        if (dot) dot.style.display = 'block';
      }
    } catch (e) {}
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const topbar  = document.getElementById('topbar');
    const main    = document.getElementById('mainWrap');
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('is-mobile-open');
      overlay.classList.toggle('is-visible');
    } else {
      sidebar.classList.toggle('is-collapsed');
      topbar.classList.toggle('is-expanded');
      if (main) main.classList.toggle('is-expanded');
    }
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('is-mobile-open');
    document.getElementById('sidebarOverlay')?.classList.remove('is-visible');
  },

  async logout() {
    await db.auth.signOut();
    window.location.href = '/admin/login.html';
  }
};

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!el || !msgEl) return;
  msgEl.textContent = msg;
  el.className = 'toast' + (isError ? ' is-error' : '');
  el.classList.add('is-show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('is-show'), 3000);
}

// ── HELPERS ──────────────────────────────────────────────────

// Format currency
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Slugify
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Debounce
function debounce(fn, ms = 300) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// Confirm dialog
function confirmDialog(msg) {
  return window.confirm(msg);
}

// Upload file to Supabase storage
async function uploadFile(file, folder = 'general') {
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await db.storage.from('media').upload(filename, file, { cacheControl: '3600' });
  if (error) throw error;
  const { data: { publicUrl } } = db.storage.from('media').getPublicUrl(filename);
  return { url: publicUrl, filename };
}

// Render status badge HTML
function renderBadge(status) {
  const map = {
    active: 'badge-active', inactive: 'badge-inactive',
    pending: 'badge-pending', confirmed: 'badge-active',
    processing: 'badge-info', delivered: 'badge-active',
    cancelled: 'badge-danger', returned: 'badge-danger',
    new: 'badge-danger', assigned: 'badge-pending',
    in_progress: 'badge-info', completed: 'badge-active',
    draft: 'badge-inactive', published: 'badge-active',
    approved: 'badge-active',
  };
  const cls = map[status] || 'badge-inactive';
  const label = (status || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<span class="badge ${cls}">${label}</span>`;
}

// Action buttons
function actionBtns(onEdit, onDelete) {
  return `<div style="display:flex;gap:4px;">
    <button class="btn-icon" onclick="${onEdit}" title="Edit">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
    <button class="btn-icon danger" onclick="${onDelete}" title="Delete">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
      </svg>
    </button>
  </div>`;
}

// Render skeleton rows
function skeletonRows(cols = 6, rows = 5) {
  return Array(rows).fill(0).map(() =>
    `<tr>${Array(cols).fill(0).map(() =>
      `<td><div class="skeleton" style="height:14px;border-radius:4px;"></div></td>`
    ).join('')}</tr>`
  ).join('');
}

// Expose
window.AdminShell = AdminShell;
window.toast = toast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.slugify = slugify;
window.debounce = debounce;
window.confirmDialog = confirmDialog;
window.uploadFile = uploadFile;
window.renderBadge = renderBadge;
window.actionBtns = actionBtns;
window.skeletonRows = skeletonRows;
