const express = require('express');
const session = require('express-session');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'oyun-sitesi-gizli-anahtar',
    resave: false,
    saveUninitialized: true
}));

// HARD BAKIM MODU KONTROLÜ (Middleware)
app.use((req, res, next) => {
    // Admin sayfalarına giden istekleri engelleme ki bakım modunu kapatabilesin
    if (req.path.startsWith('/admin')) {
        return next();
    }

    // Veritabanından bakım modu durumunu kontrol et
    db.get("SELECT deger FROM ayarlar WHERE anahtar = 'bakim_modu'", [], (err, row) => {
        if (row && row.deger === 1) {
            // "Hard" Bakım Modu Ekranı (HTML + CSS birlikte)
            return res.status(503).send(`
                <!DOCTYPE html>
                <html lang="tr">
                <head>
                    <meta charset="UTF-8">
                    <title>SİSTEM ÇEVRİMDIŞI</title>
                    <style>
                        body { 
                            background: #0d0d11; 
                            color: #ff3333; 
                            font-family: 'Courier New', Courier, monospace; 
                            display: flex; 
                            flex-direction: column; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0; 
                            overflow: hidden;
                            text-align: center;
                        }
                        .warning-box {
                            border: 2px solid #ff3333;
                            padding: 40px;
                            background: rgba(255, 0, 0, 0.05);
                            box-shadow: 0 0 20px rgba(255, 51, 51, 0.2);
                            max-width: 600px;
                            animation: pulse 2s infinite;
                        }
                        h1 { font-size: 2.5rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
                        p { color: #a5a5b5; font-size: 1.1rem; line-height: 1.6; }
                        .glitch { font-weight: bold; position: relative; }
                        @keyframes pulse {
                            0% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.2); }
                            50% { box-shadow: 0 0 40px rgba(255, 51, 51, 0.5); border-color: #ff6666; }
                            100% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.2); }
                        }
                    </style>
                </head>
                <body>
                    <div class="warning-box">
                        <h1 class="glitch">⚠️ KRİTİK ERİŞİM ENGELİ ⚠️</h1>
                        <hr color="#ff3333">
                        <p><strong>DURUM:</strong> VERİTABANI VE SUNUCU ÇEKİRDEĞİ BAKIMA ALINDI.</p>
                        <p>Şu anda platform üzerinde kritik altyapı çalışmaları gerçekleştirilmektedir. Tüm indirme hatları geçici olarak askıya alınmıştır.</p>
                        <p style="font-size: 0.9rem; color: #ff3333; margin-top: 30px;">Lütfen daha sonra tekrar ziyaret edin.</p>
                    </div>
                </body>
                </html>
            `);
        }
        next();
    });
});

// Ana Sayfa
app.get('/', (req, res) => {
    db.all("SELECT * FROM oyunlar", [], (err, rows) => {
        if (err) return res.send("Hata oluştu.");
        res.render('index', { oyunlar: rows });
    });
});

// Admin Giriş
app.get('/admin/login', (req, res) => {
    res.send(`
        <h2>Admin Girişi</h2>
        <form action="/admin/login" method="POST">
            <input type="password" name="sifre" placeholder="Şifre" required />
            <button type="submit">Giriş Yap</button>
        </form>
    `);
});

app.post('/admin/login', (req, res) => {
    if (req.body.sifre === '122323') {
        req.session.isAdmin = true;
        res.redirect('/admin');
    } else {
        res.send("Hatalı şifre! Admin paneline erişilemedi. <a href='/admin/login'>Tekrar Dene</a>");
    }
});

// Admin Paneli Ana Sayfası
app.get('/admin', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    
    db.all("SELECT * FROM oyunlar", [], (err, oyunRows) => {
        db.get("SELECT deger FROM ayarlar WHERE anahtar = 'bakim_modu'", [], (err, configRow) => {
            const bakimAktif = configRow ? configRow.deger : 0;
            res.render('admin', { oyunlar: oyunRows, bakimAktif: bakimAktif });
        });
    });
});

// Bakım Modu Durumunu Değiştirme Rotası
app.post('/admin/bakim-degistir', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send("Yetkisiz erişim.");
    const yeniDurum = req.body.bakimDurumu === 'aktif' ? 1 : 0;

    db.run("UPDATE ayarlar SET deger = ? WHERE anahtar = 'bakim_modu'", [yeniDurum], (err) => {
        if (err) return res.send("Bakım modu güncellenemedi.");
        res.redirect('/admin');
    });
});

// Oyun Ekleme
app.post('/admin/ekle', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send("Yetkisiz erişim.");
    const { isim, boyut, link } = req.body;
    db.run("INSERT INTO oyunlar (isim, boyut, link) VALUES (?, ?, ?)", [isim, boyut, link], (err) => {
        if (err) return res.send("Ekleme başarısız.");
        res.redirect('/admin');
    });
});

// Sayaçlı İndirme
app.get('/indir/:id', (req, res) => {
    const oyunId = req.params.id;
    db.get("SELECT link FROM oyunlar WHERE id = ?", [oyunId], (err, row) => {
        if (err || !row) return res.status(404).send("Oyun bulunamadı.");
        db.run("UPDATE oyunlar SET indirme_sayisi = indirme_sayisi + 1 WHERE id = ?", [oyunId], () => {
            res.redirect(row.link);
        });
    });
});

app.get('/admin/cikis', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda aktif.`);
});
