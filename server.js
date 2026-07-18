const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (Veri işleme ayarları)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'oyun-sitesi-super-gizli-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Bellek Tabanlı Veritabanı (Sunucu çökmesini önlemek için RAM'de tutulur)
let oyunlar = [
    { id: 1, isim: "Örnek Oyun 1", boyut: "1.2 GB", link: "https://download.mediafire.com/ornek1", indirme_sayisi: 0 },
    { id: 2, isim: "Örnek Oyun 2", boyut: "550 MB", link: "https://download.mediafire.com/ornek2", indirme_sayisi: 0 }
];
let bakimModu = 0; // 0 = Kapalı, 1 = Hard Bakım Aktif
let oyunSayac = 3;

// HARD BAKIM MODU ENGELİ
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        return next();
    }
    if (bakimModu === 1) {
        return res.status(503).send(`
            <!DOCTYPE html>
            <html lang="tr">
            <head>
                <meta charset="UTF-8">
                <title>SİSTEM ÇEVRİMDIŞI</title>
                <style>
                    body { 
                        background: #0d0d11; color: #ff3333; font-family: 'Courier New', monospace; 
                        display: flex; flex-direction: column; justify-content: center; align-items: center; 
                        height: 100vh; margin: 0; text-align: center;
                    }
                    .warning-box {
                        border: 2px solid #ff3333; padding: 40px; background: rgba(255, 0, 0, 0.05);
                        box-shadow: 0 0 20px rgba(255, 51, 51, 0.3); max-width: 600px;
                        animation: pulse 2s infinite; border-radius: 8px;
                    }
                    h1 { font-size: 2.2rem; margin-bottom: 10px; letter-spacing: 2px; }
                    p { color: #a5a5b5; font-size: 1.1rem; line-height: 1.6; }
                    @keyframes pulse {
                        0% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.3); }
                        50% { box-shadow: 0 0 40px rgba(255, 51, 51, 0.6); border-color: #ff6666; }
                        100% { box-shadow: 0 0 20px rgba(255, 51, 51, 0.3); }
                    }
                </style>
            </head>
            <body>
                <div class="warning-box">
                    <h1>⚠️ KRİTİK ERİŞİM ENGELİ ⚠️</h1>
                    <hr color="#ff3333">
                    <p><strong>DURUM:</strong> SUNUCU ÇEKİRDEĞİ BAKIMA ALINDI.</p>
                    <p>Şu anda platform üzerinde kritik altyapı çalışmaları gerçekleştirilmektedir. Tüm indirme hatları geçici olarak askıya alınmıştır.</p>
                    <p style="font-size: 0.9rem; color: #ff3333; margin-top: 30px;">Lütfen daha sonra tekrar ziyaret edin.</p>
                </div>
            </body>
            </html>
        `);
    }
    next();
});

// 1. ANA SAYFA (KULLANICILAR İÇİN)
app.get('/', (req, res) => {
    let oyunKartlari = oyunlar.map(oyun => `
        <div style="background:white; padding:20px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); width:220px; text-align:center;">
            <h3 style="margin-top:0; color:#333;">${oyun.isim}</h3>
            <p style="color:#666; font-size:14px;"><strong>Boyut:</strong> ${oyun.boyut}</p>
            <a href="/indir/${oyun.id}" style="display:inline-block; background:#28a745; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">İndir</a>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>Oyun İndirme Merkezi</title>
        </head>
        <body style="font-family:sans-serif; background:#f4f6f9; margin:40px;">
            <h1 style="color:#2c3e50; text-align:center; margin-bottom:40px;">Mevcut Oyunlar</h1>
            <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;">
                ${oyunKartlari || '<p style="color:#999;">Henüz oyun eklenmedi.</p>'}
            </div>
        </body>
        </html>
    `);
});

// 2. SAYAÇLI İNDİRME TETİKLEYİCİ
app.get('/indir/:id', (req, res) => {
    const oyun = oyunlar.find(o => o.id == req.params.id);
    if (!oyun) return res.status(404).send("Oyun bulunamadı.");
    
    oyun.indirme_sayisi += 1; // Sayacı artır
    res.redirect(oyun.link); // Doğrudan indirme linkine fırlat
});

// 3. ADMIN GİRİŞ SAYFASI
app.get('/admin/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Admin Giriş</title></head>
        <body style="font-family:sans-serif; background:#e9ecef; display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
            <div style="background:white; padding:40px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.1); width:300px; text-align:center;">
                <h2 style="margin-bottom:20px; color:#333;">Yönetici Girişi</h2>
                <form action="/admin/login" method="POST">
                    <input type="password" name="sifre" placeholder="Şifre girin..." required style="width:100%; padding:10px; margin-bottom:20px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                    <button type="submit" style="width:100%; padding:10px; background:#007bff; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Giriş Yap</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin/login', (req, res) => {
    if (req.body.sifre === '122323') {
        req.session.isAdmin = true;
        res.redirect('/admin');
    } else {
        res.send("<h3>Hatalı şifre! Erişim engellendi.</h3><a href='/admin/login'>Tekrar Dene</a>");
    }
});

// 4. ADMIN PANELİ ANA SAYFASI (OYUN EKLEME, SİLME VE BAKIM MODU)
app.get('/admin', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');

    let bakimDurumMetni = bakimModu === 1 
        ? '<span style="color:red; font-weight:bold;">AKTİF (Site Dış Dünyaya Kapalı)</span>' 
        : '<span style="color:green; font-weight:bold;">KAPALI (Site Herkese Açık)</span>';

    let bakimButonMetni = bakimModu === 1 ? 'Bakım Modunu Kapat (Sitiyi Aç)' : 'Bakım Modunu Aktif Et (Hard Kilit)';
    let bakimButonRenk = bakimModu === 1 ? 'green' : 'red';

    let tabloSatirlari = oyunlar.map(oyun => `
        <tr>
            <td style="padding:10px; border:1px solid #ddd;">${oyun.isim}</td>
            <td style="padding:10px; border:1px solid #ddd;">${oyun.boyut}</td>
            <td style="padding:10px; border:1px solid #ddd; font-weight:bold; text-align:center; color:#007bff;">${oyun.indirme_sayisi}</td>
            <td style="padding:10px; border:1px solid #ddd; text-align:center;">
                <a href="/admin/sil/${oyun.id}" onclick="return confirm('Bu oyunu silmek istediğinize emin misiniz?')" style="background:#dc3545; color:white; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:13px;">Sil</a>
            </td>
        </tr>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><title>Admin Paneli</title></head>
        <body style="font-family:sans-serif; margin:40px; background:#f8f9fa; color:#333;">
            <div style="max-width:900px; margin:0 auto; background:white; padding:30px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:between; align-items:center; border-bottom:2px solid #eee; padding-bottom:15px; margin-bottom:30px;">
                    <h1 style="margin:0;">Yönetim Paneli</h1>
                    <a href="/admin/cikis" style="background:#6c757d; color:white; padding:8px 15px; text-decoration:none; border-radius:4px; font-weight:bold; margin-left:auto;">Güvenli Çıkış</a>
                </div>

                <!-- BAKIM MODU -->
                <div style="background:#fff3cd; border:1px solid #ffeeba; padding:20px; border-radius:6px; margin-bottom:30px;">
                    <h3 style="margin-top:0;">Hard Bakım Modu Ayarı</h3>
                    <p>Mevcut Durum: ${bakimDurumMetni}</p>
                    <form action="/admin/bakim-degistir" method="POST">
                        <button type="submit" style="background:${bakimButonRenk}; color:white; padding:10px 20px; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">${bakimButonMetni}</button>
                    </form>
                </div>

                <!-- OYUN EKLEME FORMU -->
                <div style="margin-bottom:40px;">
                    <h2>Yeni Oyun Ekle</h2>
                    <form action="/admin/ekle" method="POST" style="display:flex; flex-direction:column; gap:15px; max-width:400px;">
                        <input type="text" name="isim" placeholder="Oyun Adı" required style="padding:10px; border:1px solid #ccc; border-radius:4px;">
                        <input type="text" name="boyut" placeholder="Boyut (Örn: 2.4 GB)" required style="padding:10px; border:1px solid #ccc; border-radius:4px;">
                        <input type="url" name="link" placeholder="MediaFire Doğrudan İndirme Linki" required style="padding:10px; border:1px solid #ccc; border-radius:4px;">
                        <button type="submit" style="background:#007bff; color:white; padding:12px; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Oyunu Sisteme Ekle</button>
                    </form>
                </div>

                <!-- İSTATİSTİKLER VE SİLME -->
                <h2>Kayıtlı Oyunlar ve İstatistikler</h2>
                <table style="width:100%; border-collapse:collapse; margin-top:15px;">
                    <thead>
                        <tr style="background:#e9ecef;">
                            <th style="padding:10px; border:1px solid #ddd; text-align:left;">Oyun Adı</th>
                            <th style="padding:10px; border:1px solid #ddd; text-align:left;">Boyut</th>
                            <th style="padding:10px; border:1px solid #ddd;">İndirme (Tıklama)</th>
                            <th style="padding:10px; border:1px solid #ddd;">Eylem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tabloSatirlari || '<tr><td colspan="4" style="text-align:center; padding:20px; color:#999;">Kayıtlı oyun bulunmuyor.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
});

// 5. YENİ OYUN EKLEME ROTASI
app.post('/admin/ekle', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send("Yetkisiz erişim.");
    const { isim, boyut, link } = req.body;
    
    oyunlar.push({
        id: oyunSayac++,
        isim: isim,
        boyut: boyut,
        link: link,
        indirme_sayisi: 0
    });
    res.redirect('/admin');
});

// 6. OYUN SİLME ROTASI (YENİ ÖZELLİK)
app.get('/admin/sil/:id', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send("Yetkisiz erişim.");
    const oyunId = req.params.id;
    
    // Seçilen oyunu listeden filtreleyerek siler
    oyunlar = oyunlar.filter(o => o.id != oyunId);
    res.redirect('/admin');
});

// 7. BAKIM MODU DEĞİŞTİRME ROTASI
app.post('/admin/bakim-degistir', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).send("Yetkisiz erişim.");
    bakimModu = bakimModu === 0 ? 1 : 0;
    res.redirect('/admin');
});

// 8. ÇIKISH
app.get('/admin/cikis', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} üzerinde çalışıyor.`);
});
