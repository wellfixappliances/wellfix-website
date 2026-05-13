// ============================================================
// WELLFIX ERP — SUPABASE CLIENT CONFIG
// Used by BOTH frontend and admin
// ============================================================
// HOW TO SETUP:
// 1. Go to https://supabase.com → Create project
// 2. Go to Settings → API
// 3. Copy your Project URL and anon key
// 4. Replace the values below
// ============================================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';         // e.g. https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Your public anon key

// DO NOT change below this line
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── API Helpers ──────────────────────────────────────────────

const WF = {

  // ── AUTH ──────────────────────────────────────────────────
  auth: {
    async login(email, password) {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async logout() {
      await db.auth.signOut();
      window.location.href = '/admin/login.html';
    },
    async getUser() {
      const { data: { user } } = await db.auth.getUser();
      if (!user) return null;
      const { data: profile } = await db
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return { ...user, profile };
    },
    async requireAuth() {
      const user = await this.getUser();
      if (!user) window.location.href = '/admin/login.html';
      return user;
    },
    async resetPassword(email) {
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/reset-password.html'
      });
      if (error) throw error;
    }
  },

  // ── PRODUCTS ──────────────────────────────────────────────
  products: {
    async getAll(filters = {}) {
      let q = db.from('products')
        .select(`*, brand:brands(name,slug), category:categories(name,slug), images:product_images(url,sort_order,is_primary)`)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (filters.active !== false) q = q.eq('is_active', true);
      if (filters.featured) q = q.eq('is_featured', true);
      if (filters.trending) q = q.eq('is_trending', true);
      if (filters.category_id) q = q.eq('category_id', filters.category_id);
      if (filters.brand_id) q = q.eq('brand_id', filters.brand_id);
      if (filters.limit) q = q.limit(filters.limit);
      if (filters.search) q = q.ilike('name', `%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async getById(id) {
      const { data, error } = await db.from('products')
        .select(`*, brand:brands(*), category:categories(*), images:product_images(*)`)
        .eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(product) {
      const { data, error } = await db.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    async addImage(productId, url, isPrimary = false) {
      const { data, error } = await db.from('product_images').insert({
        product_id: productId, url, is_primary: isPrimary, sort_order: 0
      }).select().single();
      if (error) throw error;
      return data;
    },
    async deleteImage(imageId) {
      const { error } = await db.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
    }
  },

  // ── CATEGORIES ────────────────────────────────────────────
  categories: {
    async getAll() {
      const { data, error } = await db.from('categories')
        .select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async create(cat) {
      const { data, error } = await db.from('categories').insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('categories').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('categories').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // ── BANNERS ───────────────────────────────────────────────
  banners: {
    async getActive(position = 'hero') {
      const now = new Date().toISOString();
      const { data, error } = await db.from('banners')
        .select('*')
        .eq('is_active', true)
        .eq('position', position)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async getAll() {
      const { data, error } = await db.from('banners').select('*').order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async create(banner) {
      const { data, error } = await db.from('banners').insert(banner).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('banners').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('banners').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // ── ORDERS ────────────────────────────────────────────────
  orders: {
    async getAll(filters = {}) {
      let q = db.from('orders')
        .select(`*, items:order_items(*)`)
        .order('created_at', { ascending: false });
      if (filters.status) q = q.eq('status', filters.status);
      if (filters.limit) q = q.limit(filters.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async getById(id) {
      const { data, error } = await db.from('orders')
        .select(`*, items:order_items(*)`)
        .eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(order, items) {
      const orderNum = 'WF-' + Date.now().toString().slice(-6);
      const { data: newOrder, error } = await db.from('orders')
        .insert({ ...order, order_number: orderNum }).select().single();
      if (error) throw error;
      const orderItems = items.map(i => ({ ...i, order_id: newOrder.id }));
      await db.from('order_items').insert(orderItems);
      return newOrder;
    },
    async updateStatus(id, status) {
      const { data, error } = await db.from('orders').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  // ── SERVICE BOOKINGS ──────────────────────────────────────
  services: {
    async getAll(filters = {}) {
      let q = db.from('service_bookings').select('*').order('created_at', { ascending: false });
      if (filters.status) q = q.eq('status', filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async create(booking) {
      const bookingNum = 'SV-' + Date.now().toString().slice(-6);
      const { data, error } = await db.from('service_bookings')
        .insert({ ...booking, booking_number: bookingNum }).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('service_bookings').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  // ── REVIEWS ───────────────────────────────────────────────
  reviews: {
    async getForProduct(productId) {
      const { data, error } = await db.from('reviews')
        .select('*').eq('product_id', productId).eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async getAll() {
      const { data, error } = await db.from('reviews')
        .select(`*, product:products(name)`).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async submit(review) {
      const { data, error } = await db.from('reviews').insert(review).select().single();
      if (error) throw error;
      return data;
    },
    async approve(id) {
      const { data, error } = await db.from('reviews').update({ is_approved: true }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('reviews').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // ── BLOG ──────────────────────────────────────────────────
  blog: {
    async getPublished(limit = 10) {
      const { data, error } = await db.from('blog_posts')
        .select('*').eq('status', 'published')
        .order('published_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    },
    async getAll() {
      const { data, error } = await db.from('blog_posts')
        .select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async getBySlug(slug) {
      const { data, error } = await db.from('blog_posts')
        .select('*').eq('slug', slug).eq('status', 'published').single();
      if (error) throw error;
      await db.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
      return data;
    },
    async save(post) {
      if (post.id) {
        const { data, error } = await db.from('blog_posts').update(post).eq('id', post.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await db.from('blog_posts').insert(post).select().single();
        if (error) throw error;
        return data;
      }
    },
    async delete(id) {
      const { error } = await db.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // ── MEDIA / STORAGE ───────────────────────────────────────
  media: {
    async upload(file, folder = 'general') {
      const ext = file.name.split('.').pop();
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await db.storage.from('media').upload(filename, file, {
        cacheControl: '3600', upsert: false
      });
      if (error) throw error;
      const { data: { publicUrl } } = db.storage.from('media').getPublicUrl(filename);
      await db.from('media').insert({
        filename, original_name: file.name, url: publicUrl,
        size: file.size, mime_type: file.type, folder
      });
      return publicUrl;
    },
    async getAll(folder) {
      let q = db.from('media').select('*').order('created_at', { ascending: false });
      if (folder) q = q.eq('folder', folder);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async delete(id, filename) {
      await db.storage.from('media').remove([filename]);
      await db.from('media').delete().eq('id', id);
    }
  },

  // ── SETTINGS ──────────────────────────────────────────────
  settings: {
    async get(key) {
      const { data, error } = await db.from('site_settings').select('value').eq('key', key).single();
      if (error) return null;
      return data?.value;
    },
    async getAll() {
      const { data, error } = await db.from('site_settings').select('*');
      if (error) throw error;
      return data?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {};
    },
    async set(key, value) {
      const { error } = await db.from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
  },

  // ── HOMEPAGE SECTIONS ─────────────────────────────────────
  homepage: {
    async getSections() {
      const { data, error } = await db.from('homepage_sections')
        .select('*').order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async updateSection(id, updates) {
      const { error } = await db.from('homepage_sections').update(updates).eq('id', id);
      if (error) throw error;
    }
  },

  // ── CUSTOMERS ─────────────────────────────────────────────
  customers: {
    async getAll() {
      const { data, error } = await db.from('customers')
        .select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async create(customer) {
      const { data, error } = await db.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data;
    }
  },

  // ── BRANDS ────────────────────────────────────────────────
  brands: {
    async getAll() {
      const { data, error } = await db.from('brands')
        .select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data || [];
    },
    async create(brand) {
      const { data, error } = await db.from('brands').insert(brand).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('brands').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  // ── COUPONS ───────────────────────────────────────────────
  coupons: {
    async validate(code, orderAmount) {
      const now = new Date().toISOString();
      const { data, error } = await db.from('coupons')
        .select('*').eq('code', code.toUpperCase()).eq('is_active', true)
        .or(`ends_at.is.null,ends_at.gte.${now}`).single();
      if (error || !data) throw new Error('Invalid or expired coupon');
      if (data.usage_limit && data.used_count >= data.usage_limit) throw new Error('Coupon usage limit reached');
      if (orderAmount < data.min_order_amount) throw new Error(`Minimum order ₹${data.min_order_amount} required`);
      return data;
    },
    async getAll() {
      const { data, error } = await db.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  },

  // ── ANALYTICS ─────────────────────────────────────────────
  analytics: {
    async getDashboardStats() {
      const [orders, products, customers, bookings] = await Promise.all([
        db.from('orders').select('total, status, created_at'),
        db.from('products').select('id, stock_qty, low_stock_threshold', { count: 'exact' }),
        db.from('customers').select('id', { count: 'exact' }),
        db.from('service_bookings').select('id, status', { count: 'exact' })
      ]);
      const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
      const monthOrders = (orders.data || []).filter(o => new Date(o.created_at) >= thisMonth);
      const revenue = monthOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
      const lowStock = (products.data || []).filter(p => p.stock_qty <= p.low_stock_threshold).length;
      return {
        revenue: revenue.toFixed(2),
        orders_count: monthOrders.length,
        total_orders: (orders.data || []).length,
        customers_count: customers.count || 0,
        bookings_count: bookings.count || 0,
        low_stock_count: lowStock,
        pending_orders: (orders.data || []).filter(o => o.status === 'pending').length
      };
    }
  },

  // ── REALTIME ──────────────────────────────────────────────
  realtime: {
    onOrdersChange(callback) {
      return db.channel('orders').on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' }, callback
      ).subscribe();
    },
    onProductsChange(callback) {
      return db.channel('products').on('postgres_changes',
        { event: '*', schema: 'public', table: 'products' }, callback
      ).subscribe();
    }
  }
};

// Expose globally
window.WF = WF;
window.db = db;
