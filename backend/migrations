-- ============================================================
-- WellFix Unified ERP — MODULE 1: TRANSACTION CORE
-- Date: 2026-06  |  Additive & backward compatible
-- ------------------------------------------------------------
-- This migration ONLY CREATES new tables. It does NOT touch,
-- rename, or drop pos_invoices / pos_invoice_items / orders.
-- The old POS system keeps working exactly as before.
-- Safe to run multiple times (IF NOT EXISTS guards).
-- ============================================================

-- ── CORE: transactions ──────────────────────────────────────
-- Unifies sale / quotation / return / refund / service billing.
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- spec field "type"
  type              TEXT NOT NULL DEFAULT 'sale'
                    CHECK (type IN ('sale','quotation','service','return','refund')),

  -- where this transaction originated
  reference_source  TEXT NOT NULL DEFAULT 'pos'
                    CHECK (reference_source IN ('pos','service','admin')),

  status            TEXT NOT NULL DEFAULT 'completed'
                    CHECK (status IN ('draft','completed','cancelled')),

  -- customer (nullable for walk-ins; denormalised name/phone kept for receipts)
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_phone    TEXT,

  -- money (spec: subtotal, discount, tax, total)
  subtotal          DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax               DECIMAL(12,2) NOT NULL DEFAULT 0,
  total             DECIMAL(12,2) NOT NULL DEFAULT 0,

  payment_method    TEXT,
  payment_status    TEXT DEFAULT 'paid',
  payment_reference TEXT,

  -- linkage to the legacy parallel system (for backfill + dual-write dedup)
  invoice_number    TEXT,
  source_invoice_id UUID,           -- = pos_invoices.id when origin is POS

  cashier           TEXT,
  notes             TEXT,

  -- spec field "date" (business date). created_at is the system audit stamp.
  txn_date          TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── transaction_items (mixed billing: product / service / labor / spare_part) ──
CREATE TABLE IF NOT EXISTS transaction_items (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,

  type            TEXT NOT NULL DEFAULT 'product'
                  CHECK (type IN ('product','service','labor','spare_part','custom')),

  name            TEXT NOT NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,  -- nullable
  sku             TEXT,

  qty             DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,   -- line total

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tx_type           ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_status         ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_customer       ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_tx_created        ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_invoice_number ON transactions(invoice_number);
CREATE INDEX IF NOT EXISTS idx_tx_source_inv     ON transactions(source_invoice_id);
CREATE INDEX IF NOT EXISTS idx_txi_tx            ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_txi_product       ON transaction_items(product_id);

-- ── updated_at trigger (reuses existing schema function) ─────
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS: disabled, matching the existing pos_invoices pattern ─
-- (Admin panel uses the anon/service client directly; keeping the
--  same posture as pos_invoices avoids breaking current access.)
ALTER TABLE transactions      DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Done. Old POS untouched. Next: run the backfill migration.
-- ============================================================
