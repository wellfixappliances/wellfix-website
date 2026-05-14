// ============================================================
// WELLFIX — HOMEPAGE SECTION VISIBILITY
// Add this as a <script> in index.html AFTER supabase.js
// It reads homepage_sections table and hides/shows sections
// ============================================================
(async function applyHomepageSections() {
  try {
    const { data: sections } = await db.from('homepage_sections').select('section_key,is_visible').order('sort_order');
    if (!sections?.length) return;

    const sectionMap = {
      offer_strip:       '.offer-strip',
      hero_banners:      '.hero-compact',
      categories:        '.cat-section',
      flash_sale:        '.flash-section',
      trending_products: '#trending',
      brand_bar:         '.brands-bar',
      promo_banners:     '.banners-section',
      services:          '.services-section',
      reviews:           '.reviews-section'
    };

    sections.forEach(s => {
      const selector = sectionMap[s.section_key];
      if (!selector) return;
      const el = document.querySelector(selector);
      if (!el) return;
      el.style.display = s.is_visible ? '' : 'none';
    });
  } catch(e) {
    // Silently fail — show all sections if DB unreachable
  }
})();
