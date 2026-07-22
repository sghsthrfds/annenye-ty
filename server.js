const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// TÜM SİTEYİ KAPATAN VE ELVEDA EKRANINI BASTIRAN TEK ROTA
app.use((req, res) => {
    res.status(503).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SON / MISSION ACCOMPLISHED</title>
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body { 
                    background: #08080a; 
                    color: #ff2222; 
                    font-family: 'Courier New', Courier, monospace; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh; 
                    padding: 20px;
                    overflow: hidden;
                    text-align: center;
                }
                .glitch-wrapper {
                    border: 2px solid #ff1a1a;
                    padding: 50px 30px;
                    background: rgba(255, 0, 0, 0.03);
                    box-shadow: 0 0 35px rgba(255, 0, 0, 0.25), inset 0 0 15px rgba(255, 0, 0, 0.1);
                    max-width: 750px;
                    width: 100%;
                    border-radius: 4px;
                    position: relative;
                    animation: borderPulse 3s infinite alternate;
                }
                h1 { 
                    font-size: 2.8rem; 
                    margin-bottom: 15px; 
                    letter-spacing: 4px; 
                    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
                    text-transform: uppercase;
                }
                .subtitle {
                    color: #e0e0e0;
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                    margin-bottom: 25px;
                    font-weight: bold;
                }
                hr {
                    border: none;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #ff1a1a, transparent);
                    margin: 25px 0;
                }
                p { 
                    color: #b0b0b0; 
                    font-size: 1rem; 
                    line-height: 1.8; 
                    margin-bottom: 15px;
                }
                .quote {
                    font-style: italic;
                    color: #ffffff;
                    font-size: 1.1rem;
                    margin-top: 25px;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
                }
                .status-tag {
                    display: inline-block;
                    margin-top: 30px;
                    padding: 8px 18px;
                    background: #ff1a1a;
                    color: #000;
                    font-weight: bold;
                    letter-spacing: 2px;
                    font-size: 0.85rem;
                    border-radius: 2px;
                }
                @keyframes borderPulse {
                    0% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.2); border-color: #990000; }
                    100% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.5); border-color: #ff3333; }
                }
            </style>
        </head>
        <body>
            <div class="glitch-wrapper">
                <h1>SİSTEM KALICI OLARAK KAPATILDI</h1>
                <div class="subtitle">PERMANENTLY OFFLINE</div>
                <hr>
                <p>Kısa ama dolu dolu bir yolculuğun sonuna geldik. Sunucular durduruldu, kodlar arşive çekildi ve bu dijital alan görevini tamamlayarak emekliye ayrıldı.</p>
                <p>Geçmişten bugüne kurulan tüm sistemlerde, satır satır yazılan tüm kodlarda emeği geçen herkese ve burayı ziyaret eden tüm kullanıcılara teşekkürler.</p>
                
                <p class="quote">"Her hikâyenin bir sonu vardır, ama her son yeni bir başlangıcın habercisidir."</p>
                
                <div class="status-tag">GÖREV TAMAMLANDI // 2026</div>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Elveda sistemi ${PORT} portunda aktif.`);
});
