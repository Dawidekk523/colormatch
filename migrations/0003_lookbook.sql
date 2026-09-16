-- The lookbook is the one part of the product that needs a photograph to leave
-- the device, so it is kept apart from everything else: its own table, its own
-- consent timestamp, and rows that can be deleted on their own without
-- touching the result they belong to.
--
-- `object_key` points into the R2 bucket. The photograph that was sent to the
-- image model is never stored; only what came back is.

CREATE TABLE IF NOT EXISTS lookbook_images (
  token TEXT NOT NULL,
  look_id TEXT NOT NULL,
  object_key TEXT NOT NULL,
  label TEXT NOT NULL,
  hex TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (token, look_id)
);

CREATE INDEX IF NOT EXISTS lookbook_token_idx ON lookbook_images (token);

-- Consent is recorded once per result, with the wording version that was
-- shown, so what someone agreed to can be reconstructed later.
CREATE TABLE IF NOT EXISTS lookbook_consent (
  token TEXT PRIMARY KEY,
  wording TEXT NOT NULL,
  agreed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
