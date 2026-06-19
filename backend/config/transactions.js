/* ============================================================
 * WellFix Unified ERP — MODULE 1 client core: WFTx
 * ------------------------------------------------------------
 * Pure data-layer writer for the `transactions` /
 * `transaction_items` tables. NO DOM, NO UI. Independently
 * testable from the console:
 *
 *   await WFTx.createTransaction({
 *     type:'sale', reference_source:'pos', status:'completed',
 *     subtotal:100, discount:0, tax:18, total:118,
 *     payment_method:'cash', payment_status:'paid',
 *     items:[{ name:'Test', price:100, qty:1, total:100 }]
 *   });
 *
 * Follows the project Supabase v2 pattern: db.from(...),
 * { data, error } destructuring, never .catch().
 * Requires the global `db` from backend/config/supabase.js.
 * ============================================================ */
(function (global) {
  'use strict';

  function getDb() {
    if (!global.db) throw new Error('WFTx: global `db` (supabase) not loaded');
    return global.db;
  }

  // Decide a transaction_item.type from a cart line.
  // Honours an explicit it.itemType (future: service / labor / spare_part),
  // otherwise: manual lines (id starting with "m") -> custom, else product.
  function resolveItemType(it) {
    if (it && it.itemType) return it.itemType;
    if (it && it.id && String(it.id).startsWith('m')) return 'custom';
    return 'product';
  }

  // Real product id only — manual lines (id "m...") map to NULL product_id.
  function resolveProductId(it) {
    if (!it || !it.id) return null;
    return String(it.id).startsWith('m') ? null : it.id;
  }

  // Map a cart line to a transaction_items row.
  function toItemRow(transaction_id, it) {
    return {
      transaction_id,
      type: resolveItemType(it),
      name: it.name,
      product_id: resolveProductId(it),
      sku: it.sku || null,
      qty: it.qty,
      unit_price: it.price,
      subtotal: (it.total != null) ? it.total : (Number(it.price || 0) * Number(it.qty || 0))
    };
  }

  /**
   * Create a unified transaction + its items.
   * Returns { data, error } — error is non-throwing so callers
   * can treat the unified write as best-effort (backward compat).
   *
   * @param {Object} tx
   *   type, reference_source, status, customer_id, customer_name,
   *   customer_phone, subtotal, discount, tax, total, payment_method,
   *   payment_status, payment_reference, invoice_number,
   *   source_invoice_id, cashier, notes, txn_date, items[]
   */
  async function createTransaction(tx) {
    let db;
    try { db = getDb(); } catch (e) { return { data: null, error: e }; }

    const head = {
      type:              tx.type || 'sale',
      reference_source:  tx.reference_source || 'pos',
      status:            tx.status || 'completed',
      customer_id:       tx.customer_id || null,
      customer_name:     tx.customer_name || null,
      customer_phone:    tx.customer_phone || null,
      subtotal:          Number(tx.subtotal || 0),
      discount:          Number(tx.discount || 0),
      tax:               Number(tx.tax || 0),
      total:             Number(tx.total || 0),
      payment_method:    tx.payment_method || null,
      payment_status:    tx.payment_status || 'paid',
      payment_reference: tx.payment_reference || null,
      invoice_number:    tx.invoice_number || null,
      source_invoice_id: tx.source_invoice_id || null,
      cashier:           tx.cashier || null,
      notes:             tx.notes || null
    };
    if (tx.txn_date) head.txn_date = tx.txn_date;

    const { data: row, error } = await db
      .from('transactions').insert(head).select().single();
    if (error) return { data: null, error };

    const items = (tx.items || []).map(function (it) { return toItemRow(row.id, it); });
    if (items.length) {
      const { error: ie } = await db.from('transaction_items').insert(items);
      if (ie) return { data: row, error: ie }; // header saved; items failed
    }
    return { data: row, error: null };
  }

  // Mark a transaction cancelled (does NOT reverse stock — caller decides).
  async function cancelTransaction(id) {
    let db;
    try { db = getDb(); } catch (e) { return { data: null, error: e }; }
    return await db.from('transactions').update({ status: 'cancelled' }).eq('id', id);
  }

  global.WFTx = {
    createTransaction: createTransaction,
    cancelTransaction: cancelTransaction,
    resolveItemType: resolveItemType,
    resolveProductId: resolveProductId,
    toItemRow: toItemRow
  };
})(window);
