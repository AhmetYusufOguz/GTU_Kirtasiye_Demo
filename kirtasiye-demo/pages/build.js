// GitHub Pages için statik site üretir: node kirtasiye-demo/pages/build.js [çıktı klasörü]
// Müşteri, kasa ve yazıcı sayfalarını kopyalar, sunucu/Electron yerine mock-api.js'i bağlar.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, '..', '_site'));
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const PAGES = [
  ['public/index.html', 'index.html'],
  ['public/cashier.html', 'cashier.html'],
  ['desktop/index.html', 'printer.html'],
];
for (const [src, dest] of PAGES) {
  let html = fs.readFileSync(path.join(root, src), 'utf8');
  html = html
    .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/i, '') // Electron CSP, CDN scriptlerini engeller
    .replace(/href="\/"/g, 'href="index.html"')
    .replace(/href="\/cashier\.html"/g, 'href="cashier.html"')
    .replace(/<\/title>/i, '</title>\n<script src="mock-api.js"></script>');
  fs.writeFileSync(path.join(out, dest), html);
}
fs.copyFileSync(path.join(__dirname, 'mock-api.js'), path.join(out, 'mock-api.js'));
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('Site hazır: ' + out);
