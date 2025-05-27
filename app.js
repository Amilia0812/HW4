// 安裝：npm install express sqlite3 cors body-parser

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 建立 SQLite 資料庫
const db = new sqlite3.Database('price_tracker.db');

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item_name TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);
});

// 新增資料：POST /add_price
app.post('/add_price', (req, res) => {
    const { date, item_name, price } = req.body;
    if (!date || !item_name || price == null) {
        return res.status(400).json({ error: '缺少欄位' });
    }

    db.run(
        'INSERT INTO prices (date, item_name, price) VALUES (?, ?, ?)',
        [date, item_name, price],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: '新增成功', id: this.lastID });
        }
    );
});

// 查詢資料：GET /get_prices?keyword=台積電
app.get('/get_prices', (req, res) => {
    const keyword = req.query.keyword || '';
    db.all(
        'SELECT date, item_name, price FROM prices WHERE item_name LIKE ?',
        [`%${keyword}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`✅ 伺服器啟動於 http://localhost:${PORT}`);
});
