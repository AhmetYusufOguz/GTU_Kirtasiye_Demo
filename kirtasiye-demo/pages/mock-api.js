// GitHub Pages sürümü: server.js ve Electron (main.js/preload.js) yerine tarayıcıda çalışan sahte backend.
// Siparişler localStorage'da, PDF'ler IndexedDB'de tutulur. Aynı tarayıcıdaki tüm sekmeler (müşteri,
// kasa, yazıcı) aynı veriyi görür. Kurallar server.js ile aynıdır.
(function () {
  const PRICES = { bw: 1.0, color: 5.0 };
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const KEY = 'kirtasiye-orders';
  const BASE = location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (all) => localStorage.setItem(KEY, JSON.stringify(all));

  function loadScript(src) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = fail;
      document.head.append(s);
    });
  }
  let pdfLib = null;
  async function countPages(file) {
    pdfLib = pdfLib || loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js');
    await pdfLib;
    const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer()); // şifreli/bozuk PDF burada hata verir
    return pdf.getPageCount();
  }

  // PDF dosyaları (localStorage'a sığmaz)
  const idb = new Promise((ok, fail) => {
    const r = indexedDB.open('kirtasiye-files', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('files');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => fail(r.error);
  });
  async function fileOp(mode, fn) {
    const db = await idb;
    return new Promise((ok, fail) => {
      const req = fn(db.transaction('files', mode).objectStore('files'));
      req.onsuccess = () => ok(req.result);
      req.onerror = () => fail(req.error);
    });
  }
  const putFile = (code, blob) => fileOp('readwrite', (s) => s.put(blob, code));
  const getFile = (code) => fileOp('readonly', (s) => s.get(code));

  function newCode(all) {
    for (;;) {
      let c = '';
      const rnd = crypto.getRandomValues(new Uint32Array(6));
      for (let i = 0; i < 6; i++) c += ALPHABET[rnd[i] % ALPHABET.length];
      if (!all[c]) return c;
    }
  }

  class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
  const find = (all, code) => {
    const o = all[String(code).toUpperCase()];
    if (!o) throw new HttpError(404, 'Sipariş bulunamadı.');
    return o;
  };

  const TRANSITIONS = { yazdiriliyor: 'odendi', cikti_alindi: 'yazdiriliyor' };
  const UNDO = { cikti_alindi: 'odendi', yazdiriliyor: 'odendi', odendi: 'bekliyor' };

  async function handle(method, path, body) {
    const all = load();
    let m;
    if (method === 'GET' && path === '/api/prices') return PRICES;
    if (method === 'POST' && path === '/api/preview') {
      const f = body && body.get('file');
      if (!f) throw new HttpError(400, 'Dosya seçilmedi.');
      try { return { pages: await countPages(f) }; }
      catch { throw new HttpError(400, 'PDF okunamadı. Dosya bozuk veya şifreli olabilir.'); }
    }
    if (method === 'POST' && path === '/api/orders') {
      const f = body && body.get('file'), color = body && body.get('color');
      if (!f) throw new HttpError(400, 'Dosya seçilmedi.');
      if (!['bw', 'color'].includes(color)) throw new HttpError(400, 'Baskı türü seçilmedi.');
      let pages;
      try { pages = await countPages(f); }
      catch { throw new HttpError(400, 'PDF okunamadı. Dosya bozuk veya şifreli olabilir.'); }
      const code = newCode(all);
      await putFile(code, f);
      const price = Math.round(pages * PRICES[color] * 100) / 100;
      all[code] = { code, fileName: f.name, pages, color, price, status: 'bekliyor',
        createdAt: new Date().toISOString(), paidAt: null, printedAt: null };
      save(all);
      return { code, pages, price };
    }
    if (method === 'GET' && path === '/api/orders') {
      return Object.values(all).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    if (method === 'GET' && (m = path.match(/^\/api\/orders\/([^/]+)$/))) return find(all, m[1]);
    if (method === 'POST' && (m = path.match(/^\/api\/orders\/([^/]+)\/pay$/))) {
      const o = find(all, m[1]);
      if (o.status !== 'bekliyor') throw new HttpError(409, 'Sipariş zaten işleme alınmış.');
      o.status = 'odendi'; o.paidAt = new Date().toISOString();
      save(all);
      return { ok: true };
    }
    if (method === 'POST' && (m = path.match(/^\/api\/orders\/([^/]+)\/status$/))) {
      const o = find(all, m[1]);
      const next = body && body.status;
      if (!TRANSITIONS[next]) throw new HttpError(400, 'Geçersiz durum.');
      if (o.status !== TRANSITIONS[next]) {
        throw new HttpError(409, o.status === 'bekliyor' ? 'Ödeme alınmadı, yazdırma kilitli.' : 'Bu geçiş yapılamaz.');
      }
      o.status = next; o.printedAt = next === 'cikti_alindi' ? new Date().toISOString() : null;
      save(all);
      return { ok: true };
    }
    if (method === 'POST' && (m = path.match(/^\/api\/orders\/([^/]+)\/undo$/))) {
      const o = find(all, m[1]);
      const prev = UNDO[o.status];
      if (!prev) throw new HttpError(409, 'Bu sipariş geri alınamaz.');
      o.status = prev; o.printedAt = null;
      if (prev === 'bekliyor') o.paidAt = null;
      save(all);
      return { ok: true, status: prev };
    }
    if (method === 'GET' && path === '/api/info') {
      const url = BASE;
      let qr = '';
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js');
        const q = qrcode(0, 'M'); q.addData(url); q.make();
        qr = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      } catch {}
      return { url, others: [], qr };
    }
    throw new HttpError(404, 'Bulunamadı.');
  }

  // Sayfalardaki fetch('/api/...') çağrılarını yakala
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!/^\/api\//.test(url)) return realFetch(input, init);
    const method = (init.method || 'GET').toUpperCase();
    let body = init.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch {} }
    try {
      return new Response(JSON.stringify(await handle(method, url.split('?')[0], body)),
        { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }),
        { status: e.status || 500, headers: { 'Content-Type': 'application/json' } });
    }
  };

  // Yazıcı bilgisayarı sayfası için preload.js'teki window.api karşılığı
  const call = (method, path, body) => handle(method, path, body);
  function printBlob(blob) {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    frame.src = url;
    frame.onload = () => setTimeout(() => {
      try { frame.contentWindow.focus(); frame.contentWindow.print(); }
      catch { window.open(url, '_blank'); }
    }, 600);
    document.body.append(frame);
    setTimeout(() => { frame.remove(); URL.revokeObjectURL(url); }, 10 * 60 * 1000);
  }
  window.api = {
    sync: async () => {
      const active = Object.values(load()).filter((o) => o.status !== 'cikti_alindi');
      return { ok: true, ready: active.length, last: new Date().toISOString() };
    },
    info: () => call('GET', '/api/info'),
    getOrder: async (code) => ({ ...(await call('GET', '/api/orders/' + String(code).trim().toUpperCase())), fileReady: true }),
    // Tarayıcı yazdırmanın onaylanıp onaylanmadığını bildirmez: sipariş "Yazdırılıyor"da kalır,
    // görevli "Çıktı alındı olarak işaretle" ile tamamlar.
    print: async (code) => {
      code = String(code).trim().toUpperCase();
      const o = await call('GET', '/api/orders/' + code);
      if (o.status === 'bekliyor') throw new Error('Ödeme alınmadı, yazdırma kilitli.');
      if (o.status === 'cikti_alindi') throw new Error('Bu siparişin çıktısı zaten alındı.');
      const blob = await getFile(code);
      if (!blob) throw new Error('Dosya bu tarayıcıda bulunamadı.');
      if (o.status === 'odendi') await call('POST', `/api/orders/${code}/status`, { status: 'yazdiriliyor' });
      printBlob(blob);
      return { success: true };
    },
    markPrinted: (code) => call('POST', `/api/orders/${String(code).toUpperCase()}/status`, { status: 'cikti_alindi' }),
    openExternal: async (code) => {
      const w = window.open('', '_blank'); // açılır pencere engelini aşmak için tıklama anında aç
      const blob = await getFile(String(code).toUpperCase());
      if (!blob) { if (w) w.close(); throw new Error('Dosya bu tarayıcıda bulunamadı.'); }
      const url = URL.createObjectURL(blob);
      if (w) w.location = url; else window.open(url, '_blank');
      return true;
    },
  };

  // Ekranlar arası geçiş çubuğu
  document.addEventListener('DOMContentLoaded', () => {
    const here = location.pathname.split('/').pop() || 'index.html';
    const nav = document.createElement('nav');
    nav.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;display:flex;gap:4px;align-items:center;' +
      'padding:6px 8px;border-radius:99px;background:rgba(23,32,51,.92);color:#c3cbda;' +
      'font:13px/1.2 "Segoe UI",system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)';
    nav.title = 'Web demosu: veriler yalnızca bu tarayıcıda tutulur. Ekranları ayrı sekmelerde açıp yan yana dene.';
    const label = document.createElement('span');
    label.textContent = 'Demo';
    label.style.cssText = 'padding:0 6px;font-weight:700';
    nav.append(label);
    for (const [href, text] of [['index.html', 'Müşteri'], ['cashier.html', 'Kasa'], ['printer.html', 'Yazıcı']]) {
      const a = document.createElement('a');
      a.href = href; a.target = '_blank'; a.textContent = text;
      a.style.cssText = 'padding:4px 10px;border-radius:99px;text-decoration:none;color:#fff;' +
        (href === here ? 'background:#0a84b6' : '');
      nav.append(a);
    }
    document.body.append(nav);
  });
})();
