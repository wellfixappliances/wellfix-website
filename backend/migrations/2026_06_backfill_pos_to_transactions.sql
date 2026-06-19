-- ============================================================
-- WellFix Unified ERP — MODULE 1 (cont.): SAFE BACKFILL
-- Maps the existing pos_invoices / pos_invoice_items into the
-- new transactions / transaction_items tables.
-- ------------------------------------------------------------
-- IDEMPOTENT: re-running will NOT create duplicates.
--   * Headers dedup on source_invoice_id (= pos_invoices.id)
--   * Items only inserted for transactions that have none yet
-- Run AFTER 2026_06_transactions_core.sql.
-- pos_invoices stays as the source of truth until you decide
-- to flip reads over. Nothing is deleted here.
-- ============================================================

-- ── 1) HEADERS: pos_invoices → transactions ─────────────────
INSERT INTO transactions (
  type, reference_source, status,
  customer_id, customer_name, customer_phone,
  subtotal, discount, tax, total,
  payment_method, payment_status, payment_reference,
  invoice_number, source_invoice_id,
  cashier, notes, txn_date, created_at
)
SELECT
  COALESCE(pi.invoice_type, 'sale')                       AS type,
  'pos'                                                   AS reference_source,
  -- pos status -> transactions status enum (draft|completed|cancelled)
  CASE
    WHEN pi.status = 'draft'     THEN 'draft'
    WHEN pi.status = 'cancelled' THEN 'cancelled'
    ELSE 'completed'                       -- completed / returned / null -> completed
  END                                                     AS status,
  pi.customer_id,
  pi.customer_name,
  pi.customer_phone,
  COALESCE(pi.subtotal, 0)                                AS subtotal,
  COALESCE(pi.discount_amount, 0)                         AS discount,
  COALESCE(pi.tax_amount, 0)                              AS tax,
  COALESCE(pi.total, 0)                                   AS total,
  pi.payment_method,
  pi.payment_status,
  pi.payment_reference,
  pi.invoice_number,
  pi.id                                                   AS source_invoice_id,
  pi.cashier,
  pi.notes,
  pi.created_at                                           AS txn_date,
  pi.created_at                                           AS created_at
FROM pos_invoices pi
WHERE NOT EXISTS (
  SELECT 1 FROM transactions t WHERE t.source_invoice_id = pi.id
);

-- ── 2) ITEMS: pos_invoice_items → transaction_items ─────────
-- Only for transactions that currently have ZERO items (keeps it idempotent).
INSERT INTO transaction_items (
  transaction_id, type, name, product_id, sku, qty, unit_price, subtotal
)
SELECT
  t.id                                                    AS transaction_id,
  CASE WHEN pii.product_id IS NULL THEN 'custom' ELSE 'product' END AS type,
  pii.product_name                                        AS name,
  pii.product_id,
  pii.sku,
  COALESCE(pii.quantity, 1)                               AS qty,
  COALESCE(pii.unit_price, 0)                             AS unit_price,
  COALESCE(pii.total_price, 0)                            AS subtotal
FROM transactions t
JOIN pos_invoice_items pii ON pii.invoice_id = t.source_invoice_id
WHERE t.source_invoice_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transaction_items ti WHERE ti.transaction_id = t.id
  );

-- ── 3) VERIFY (read-only; safe to run any time) ─────────────
-- SELECT
--   (SELECT COUNT(*) FROM pos_invoices)        AS old_invoices,
--   (SELECT COUNT(*) FROM transactions
--      WHERE reference_source='pos')           AS mapped_transactions,
--   (SELECT COUNT(*) FROM pos_invoice_items)   AS old_items,
--   (SELECT COUNT(*) FROM transaction_items)   AS new_items;
