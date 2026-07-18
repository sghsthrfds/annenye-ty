const express = require('express');
const session = require('express-session');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware ayarları
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'oyun-sitesi-gizli-anahtar',
    resave: false,
    saveUninitialized: true
}));

// Ana Sayfa - Oyunları Listeleme
app.get('/', (req, res) => {
    db.all("SELECT * FROM oyunlar", [], (err, rows) => {
        if (err) return res.send("Hata oluştu.");
        res.render('index', { oyunlar: rows });
    });
});

// Admin Giriş Sayfası
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

// Admin Paneli (Korumalı)
app.get('/admin', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    
    db.all("SELECT * FROM oyunlar", [], (err, rows) => {
        if (err) return res.send("Hata oluştu.");
        res.render('admin', { oyunlar: rows });
    });
});

// Yeni Oyun Ekleme
app.post('/admin/ekle', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send("Yetkisiz erişim.");
    const { isim, boyut, link } = req.body;
    
    db.run("INSERT INTO oyunlar (isim, boyut, link) VALUES (?, ?, ?)", [isim, boyut, link], (err) => {
        if (err) return res.send("Ekleme başarısız.");
        res.redirect('/admin');
    });
});

// Sayaçlı İndirme Yönlendirmesi
app.get('/indir/:id', (req, res) => {
    const oyunId = req.params.id;
    
    db.get("SELECT link FROM oyunlar WHERE id = ?", [oyunId], (err, row) => {
        if (err || !row) return res.status(404).send("Oyun bulunamadı.");
        
        // Tıklama sayısını 1 artır
        db.run("UPDATE oyunlar SET indirme_sayisi = indirme_sayisi + 1 WHERE id = ?", [oyunId], (err) => {
            // Kullanıcıyı MediaFire veya direkt indirme linkine yönlendirir
            // Sayfa açılmadan inmesi için verdiğiniz linkin doğrudan dosya linki olması gerekir
            res.redirect(row.link);
        });
    });
});

// Çıkış
app.get('/admin/cikis', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
