const sqlite3 = require('sqlite3').verbose();
const path = require('path');
// Veritabanı dosyasını projenin ana dizinine kesin olarak sabitler
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Oyunlar tablosu
    db.run(`CREATE TABLE IF NOT EXISTS oyunlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isim TEXT NOT NULL,
        boyut TEXT NOT NULL,
        link TEXT NOT NULL,
        indirme_sayisi INTEGER DEFAULT 0
    )`);

    // Bakım modu tablosu
    db.run(`CREATE TABLE IF NOT EXISTS ayarlar (
        anahtar TEXT PRIMARY KEY,
        deger INTEGER DEFAULT 0
    )`);

    db.run(`INSERT OR IGNORE INTO ayarlar (anahtar, deger) VALUES ('bakim_modu', 0)`);
});

module.exports = db;
