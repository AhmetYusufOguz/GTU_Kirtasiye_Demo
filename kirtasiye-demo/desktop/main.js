const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Sunucu başka bir bilgisayardaysa: set SERVER_URL=http://IP:3000 (PowerShell: $env:SERVER_URL="http://IP:3000")
const SERVER = process.env.SERVER_URL || 'http://localhost:3000';
let cacheDir;
const sync = { ok: false, ready: 0, last: null };
const downloading = new Set();
let serverProc = null;

// Sunucu çalışmıyorsa (ve yerel adresse) kendimiz başlatırız; uygulama kapanınca kapanır.
async function ensureServer() {
  try { await fetch(SERVER + '/api/prices'); return; } catch {}
  if (process.env.SERVER_URL) return;
  serverProc = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'), windowsHide: true, stdio: 'ignore',
  });
  serverProc.on('error', () => { serverProc = null; });
}
app.on('before-quit', () => { if (serverProc) serverProc.kill(); });

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

const pdfPath = (code) => path.join(cacheDir, code + '.pdf');

async function api(p, opts) {
  const r = await fetch(SERVER + p, opts);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Sunucu hatası');
  return d;
}
const post = (p, body) => api(p, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
});

async function download(code) {
  if (downloading.has(code) || fs.existsSync(pdfPath(code))) return;
  downloading.add(code);
  try {
    const r = await fetch(`${SERVER}/api/orders/${code}/file`);
    if (!r.ok) throw new Error('indirilemedi');
    fs.writeFileSync(pdfPath(code) + '.part', Buffer.from(await r.arrayBuffer()));
    fs.renameSync(pdfPath(code) + '.part', pdfPath(code));
  } catch { /* bir sonraki turda tekrar denenir */ }
  finally { downloading.delete(code); }
}

// Önceden indirme: yeni siparişler, müşteri kasaya gelmeden dosya bu bilgisayara iner
async function syncLoop() {
  try {
    const list = await api('/api/orders');
    const active = list.filter((o) => o.status !== 'cikti_alindi');
    for (const o of active) await download(o.code);
    sync.ok = true;
    sync.ready = active.filter((o) => fs.existsSync(pdfPath(o.code))).length;
  } catch { sync.ok = false; }
  sync.last = new Date().toISOString();
  setTimeout(syncLoop, 2000);
}

function openPrintWindow(code) {
  return new Promise((resolve) => {
    const win = new BrowserWindow({
      width: 900, height: 1000, title: 'Çıktı: ' + code,
      webPreferences: { plugins: true },
    });
    win.setMenuBarVisibility(false);
    win.loadFile(pdfPath(code));
    win.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        win.webContents.print({ silent: false, printBackground: true }, async (success, reason) => {
          if (success) { try { await post(`/api/orders/${code}/status`, { status: 'cikti_alindi' }); } catch {} }
          resolve({ success, reason });
        });
      }, 1200);
    });
  });
}

ipcMain.handle('sync:get', () => sync);

ipcMain.handle('info:get', () => api('/api/info'));

ipcMain.handle('order:get', async (_e, code) => {
  code = String(code).trim().toUpperCase();
  const o = await api('/api/orders/' + encodeURIComponent(code));
  if (o.status !== 'cikti_alindi') download(code);
  return { ...o, fileReady: fs.existsSync(pdfPath(code)) };
});

ipcMain.handle('order:print', async (_e, code) => {
  code = String(code).trim().toUpperCase();
  const o = await api('/api/orders/' + encodeURIComponent(code));
  if (o.status === 'bekliyor') throw new Error('Ödeme alınmadı, yazdırma kilitli.');
  if (o.status === 'cikti_alindi') throw new Error('Bu siparişin çıktısı zaten alındı.');
  await download(code);
  if (!fs.existsSync(pdfPath(code))) throw new Error('Dosya henüz inmedi, birkaç saniye sonra tekrar dene.');
  if (o.status === 'odendi') await post(`/api/orders/${code}/status`, { status: 'yazdiriliyor' });
  return openPrintWindow(code);
});

// Yedek yol: yazdırma penceresi sorun çıkarırsa elle işaretleme
ipcMain.handle('order:markPrinted', (_e, code) =>
  post(`/api/orders/${String(code).toUpperCase()}/status`, { status: 'cikti_alindi' }));

ipcMain.handle('order:openExternal', async (_e, code) => {
  const err = await shell.openPath(pdfPath(String(code).toUpperCase()));
  if (err) throw new Error(err);
  return true;
});

app.whenReady().then(async () => {
  if (!gotLock) return;
  cacheDir = path.join(app.getPath('userData'), 'orders');
  fs.mkdirSync(cacheDir, { recursive: true });
  await ensureServer();
  const win = new BrowserWindow({
    width: 1100, height: 720, minWidth: 900, minHeight: 600, title: 'Kırtasiye Yazıcı Bilgisayarı',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'index.html'));
  syncLoop();
});
app.on('window-all-closed', () => app.quit());
