-- 在 Cloudflare D1 控制台执行此文件
-- 打开 https://dash.cloudflare.com/?to=d1 → 点击你的数据库 → 控制台 → 逐条粘贴执行

CREATE TABLE pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL,
  ip_hash TEXT,
  referrer TEXT,
  is_crawler INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_pageviews_path ON pageviews(path);
CREATE INDEX idx_pageviews_created ON pageviews(created_at);
