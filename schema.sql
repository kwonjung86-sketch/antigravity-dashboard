-- Drop tables if they exist
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS stocks;
DROP TABLE IF EXISTS coins;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS user_profile;

-- News Table
CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    category TEXT NOT NULL, -- '아침 뉴스', '교사용 시사 뉴스' or custom category title
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    summary TEXT,
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Market Table
CREATE TABLE stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    change_pct REAL NOT NULL,
    change_val REAL NOT NULL,
    rsi REAL,
    recommendation TEXT NOT NULL, -- 'BUY', 'SELL', 'HOLD'
    reason TEXT,
    chart_data TEXT, -- JSON string of 7-day historical prices for detail view: [{"date": "...", "price": ...}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coin Market Table
CREATE TABLE coins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    change_pct REAL NOT NULL,
    change_val REAL NOT NULL,
    rsi REAL,
    recommendation TEXT NOT NULL, -- 'BUY', 'SELL', 'HOLD'
    reason TEXT,
    chart_data TEXT, -- JSON string of 7-day historical prices: [{"date": "...", "price": ...}]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Sidebar Menu Items Table
CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- 'rss_news', 'stock_watchlist', 'coin_watchlist', 'fortune'
    config TEXT, -- JSON string for custom configuration (e.g. RSS URL, custom tickers)
    is_default INTEGER DEFAULT 0, -- 1 = default, 0 = user added
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Fortune Profile Table
CREATE TABLE user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date TEXT NOT NULL, -- YYYY-MM-DD
    birth_time TEXT NOT NULL, -- HH:MM
    calendar_type TEXT NOT NULL, -- 'solar' or 'lunar'
    gender TEXT NOT NULL, -- 'male' or 'female'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Sidebar Menu Items
INSERT INTO menu_items (title, type, is_default, config) VALUES ('아침 뉴스', 'rss_news', 1, '{"feed_url": "naver_headline"}');
INSERT INTO menu_items (title, type, is_default, config) VALUES ('주요 증시 현황', 'stock_watchlist', 1, '{"tickers": ["005930.KS", "000660.KS", "AAPL", "MSFT", "NVDA", "TSLA", "^KS11", "^KQ11"]}');
INSERT INTO menu_items (title, type, is_default, config) VALUES ('주요 코인 현황', 'coin_watchlist', 1, '{"symbols": ["KRW-BTC", "KRW-ETH", "KRW-SOL", "KRW-XRP", "KRW-ADA"]}');
INSERT INTO menu_items (title, type, is_default, config) VALUES ('교사용 시사 뉴스', 'rss_news', 1, '{"feed_url": "naver_search_education"}');
INSERT INTO menu_items (title, type, is_default, config) VALUES ('오늘의 사주/운세', 'fortune', 1, '{}');
