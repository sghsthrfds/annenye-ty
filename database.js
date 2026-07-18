const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Oyunlar tablosu
    db.run(`CREATE TABLE IF NOT EXISTS oyunlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isim TEXT NOT NULL,
        boyut TEXT NOT NULL,
        link TEXT NOT NULL,
        indirme_sayisi INTEGER DEFAULT 0
    )`);

    // Bakım modu tablosu (Varsayılan olarak 0 yani kapalı başlar)
    db.run(`CREATE TABLE IF NOT EXISTS ayarlar (
        anahtar TEXT PRIMARY KEY,
        deger INTEGER DEFAULT 0
    )`);

    // Eğer ilk defa kuruluyorsa varsayılan değeri ekle
    db.run(`INSERT OR IGNORE INTO ayarlar (anahtar, deger) VALUES ('bakim_modu', 0)`);
});

module.exports = db;
