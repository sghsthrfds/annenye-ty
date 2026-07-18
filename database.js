const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS oyunlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isim TEXT NOT NULL,
        boyut TEXT NOT NULL,
        link TEXT NOT NULL,
        indirme_sayisi INTEGER DEFAULT 0
    )`);
});

module.exports = db;
