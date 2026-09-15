-- Anonymous counters only. Nothing here can be traced back to a person: no
-- photos, no email addresses, and IPs appear only as a salted daily hash.

CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  source TEXT NOT NULL CHECK (source IN ('photo', 'quiz')),
  day TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS analyses_day_idx ON analyses (day);

CREATE TABLE IF NOT EXISTS rate_limits (
  visitor_hash TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (visitor_hash, day)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  season TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Written by the Polar webhook. `payload_type` is the event name; the id is
-- kept so repeated deliveries of the same event are ignored.
CREATE TABLE IF NOT EXISTS billing_events (
  event_id TEXT PRIMARY KEY,
  payload_type TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);
