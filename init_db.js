// 安裝依賴：npm install sqlite3
const sqlite3 = require('sqlite3').verbose();

// 建立/開啟資料庫檔案
const db = new sqlite3.Database('price_tracker.db');

db.serialize(() => {
    // 建立資料表
    db.run(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item_name TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);

    // 清空舊資料（可選）
    db.run(`DELETE FROM prices`);

    // 插入幾筆初始資料
    const stmt = db.prepare(`INSERT INTO prices (date, item_name, price) VALUES (?, ?, ?)`);
    stmt.run("2024-05-24", "台積電", 589.0);
    stmt.run("2024-05-25", "台積電", 595.5);
    stmt.run("2024-05-26", "台積電", 602.0);
    stmt.finalize();

    console.log("✅ 資料庫建立成功，已新增初始台積電價格資料！");
});

db.close();
