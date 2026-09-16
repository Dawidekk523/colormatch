-- The paid product has no accounts: a result is addressed by an unguessable
-- token, and the receipt email is the only thing that ties a purchase to a
-- person. Rows start anonymous — `email` is written only when Polar tells us an
-- order was paid, so an abandoned checkout leaves nothing personal behind.

CREATE TABLE IF NOT EXISTS results (
  token TEXT PRIMARY KEY,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  undertone TEXT NOT NULL CHECK (undertone IN ('warm', 'cool', 'neutral')),
  source TEXT NOT NULL CHECK (source IN ('photo', 'quiz')),
  confidence REAL NOT NULL DEFAULT 0,
  palette_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  email TEXT,
  checkout_id TEXT
);

-- The webhook arrives with a checkout id and has to find its row again.
CREATE INDEX IF NOT EXISTS results_checkout_idx ON results (checkout_id);

-- Unpaid rows are disposable; this index makes the sweep cheap.
CREATE INDEX IF NOT EXISTS results_created_idx ON results (created_at);
