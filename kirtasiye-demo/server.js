const express = require('express');
const multer = require('multer');
const Database = require('better-sqlite3');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const QRCode = require('qrcode');

const PORT = 3000;
// Demo fiyatları (TL / sayfa). İstediğin gibi değiştir.
const PRICES = { bw: 1.0, color: 5.0 };

const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(path.join(__dirname, 'demo.db'));
db.exec(`CREATE TABLE IF NOT EXISTS orders (
  code TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  pages INTEGER NOT NULL,
  color TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'bekliyor',
  created_at TEXT NOT NULL,
  paid_at TEXT,
  printed_at TEXT
)`);

// Karışan karakterler (0/O, 1/I) yok. Kod büyük/küçük harf duyarsız: hep büyük harfe çevrilir.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newCode() {
  for (;;) {
    let c = '';
    for (let i = 0; i < 6; i++) c += ALPHABET[crypto.randomInt(ALPHABET.length)];
    if (!db.prepare('SELECT 1 FROM orders WHERE code = ?').get(c)) return c;
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function countPages(buffer) {
  const pdf = await PDFDocument.load(buffer); // şifreli/bozuk PDF burada hata verir
  return pdf.getPageCount();
}

function fixName(name) {
  return Buffer.from(name, 'latin1').toString('utf8');
}

const publicFields = (o) => ({
  code: o.code, fileName: o.file_name, pages: o.pages, color: o.color,
  price: o.price, status: o.status, createdAt: o.created_at,
  paidAt: o.paid_at, printedAt: o.printed_at,
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/prices', (req, res) => res.json(PRICES));

// Sadece sayfa sayısını döndürür (müşteri sayfasında anlık fiyat için)
app.post('/api/preview', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi.' });
  try {
    res.json({ pages: await countPages(req.file.buffer) });
  } catch {
    res.status(400).json({ error: 'PDF okunamadı. Dosya bozuk veya şifreli olabilir.' });
  }
});

// Sipariş oluştur: fiyat burada, sunucuda hesaplanır
app.post('/api/orders', upload.single('file'), async (req, res) => {
  const color = req.body.color;
  if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi.' });
  if (!['bw', 'color'].includes(color)) return res.status(400).json({ error: 'Baskı türü seçilmedi.' });
  let pages;
  try {
    pages = await countPages(req.file.buffer);
  } catch {
    return res.status(400).json({ error: 'PDF okunamadı. Dosya bozuk veya şifreli olabilir.' });
  }
  const code = newCode();
  const filePath = path.join(UPLOAD_DIR, code + '.pdf');
  fs.writeFileSync(filePath, req.file.buffer);
  const price = Math.round(pages * PRICES[color] * 100) / 100;
  db.prepare(`INSERT INTO orders (code, file_name, file_path, pages, color, price, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(code, fixName(req.file.originalname), filePath, pages, color, price, new Date().toISOString());
  res.json({ code, pages, price });
});

// Tek sipariş (müşteri sorgulama, kasa kodla açma, masaüstü kodla açma)
app.get('/api/orders/:code', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(req.params.code.toUpperCase());
  if (!o) return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  res.json(publicFields(o));
});

// Tüm siparişler (kasa listesi ve masaüstü uygulamasının önceden indirme döngüsü)
app.get('/api/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(rows.map(publicFields));
});

app.post('/api/orders/:code/pay', (req, res) => {
  const code = req.params.code.toUpperCase();
  const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(code);
  if (!o) return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  if (o.status !== 'bekliyor') return res.status(409).json({ error: 'Sipariş zaten işleme alınmış.' });
  db.prepare("UPDATE orders SET status = 'odendi', paid_at = ? WHERE code = ?")
    .run(new Date().toISOString(), code);
  res.json({ ok: true });
});

app.get('/api/orders/:code/file', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(req.params.code.toUpperCase());
  if (!o) return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  res.type('application/pdf').sendFile(o.file_path);
});

// Masaüstü uygulaması durum günceller. Yazdırma kilidi sunucuda da zorlanır.
const TRANSITIONS = { yazdiriliyor: 'odendi', cikti_alindi: 'yazdiriliyor' };
app.post('/api/orders/:code/status', (req, res) => {
  const code = req.params.code.toUpperCase();
  const next = req.body.status;
  const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(code);
  if (!o) return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  if (!TRANSITIONS[next]) return res.status(400).json({ error: 'Geçersiz durum.' });
  if (o.status !== TRANSITIONS[next]) {
    return res.status(409).json({ error: o.status === 'bekliyor' ? 'Ödeme alınmadı, yazdırma kilitli.' : 'Bu geçiş yapılamaz.' });
  }
  db.prepare('UPDATE orders SET status = ?, printed_at = ? WHERE code = ?')
    .run(next, next === 'cikti_alindi' ? new Date().toISOString() : null, code);
  res.json({ ok: true });
});

// Kasa: bir adım geri al (iade/yeniden basma). cikti_alindi/yazdiriliyor -> odendi, odendi -> bekliyor
const UNDO = { cikti_alindi: 'odendi', yazdiriliyor: 'odendi', odendi: 'bekliyor' };
app.post('/api/orders/:code/undo', (req, res) => {
  const code = req.params.code.toUpperCase();
  const o = db.prepare('SELECT * FROM orders WHERE code = ?').get(code);
  if (!o) return res.status(404).json({ error: 'Sipariş bulunamadı.' });
  const prev = UNDO[o.status];
  if (!prev) return res.status(409).json({ error: 'Bu sipariş geri alınamaz.' });
  db.prepare('UPDATE orders SET status = ?, printed_at = NULL, paid_at = ? WHERE code = ?')
    .run(prev, prev === 'bekliyor' ? null : o.paid_at, code);
  res.json({ ok: true, status: prev });
});

// Telefonun bağlanacağı adres. Sanal adaptörler (VirtualBox, WSL, VMware...) elenir, Wi-Fi öne alınır.
function lanUrls() {
  const found = [];
  for (const [name, list] of Object.entries(os.networkInterfaces()))
    for (const i of list || []) {
      if (i.family !== 'IPv4' || i.internal) continue;
      if (/virtual|vmware|vbox|vethernet|wsl|hyper-v|loopback/i.test(name)) continue;
      if (i.address.startsWith('192.168.56.') || i.address.startsWith('169.254.')) continue;
      found.push({ name, address: i.address, url: `http://${i.address}:${PORT}` });
    }
  found.sort((a, b) => {
    const aWifi = /wi-?fi|wlan|wireless/i.test(a.name) ? 1 : 0;
    const bWifi = /wi-?fi|wlan|wireless/i.test(b.name) ? 1 : 0;
    return bWifi - aWifi;
  });
  return found;
}

app.get('/api/info', async (req, res) => {
  const urls = lanUrls();
  const url = urls.length ? urls[0].url : `http://localhost:${PORT}`;
  res.json({ url, others: urls.slice(1).map((u) => u.url), qr: await QRCode.toString(url, { type: 'svg', margin: 1 }) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sunucu hazır: http://localhost:${PORT}`);
  for (const u of lanUrls()) console.log(`Telefondan (aynı Wi-Fi): ${u.url}`);
});
