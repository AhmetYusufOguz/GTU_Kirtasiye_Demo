# Kırtasiye Çıktı Sistemi

Kırtasiyede çıktı alma sürecindeki iki darboğazı (yazıcı bilgisayarı başında dosya bulma ve kasada sayfa sayma) ortadan kaldıran sistemin demosu. GTÜ Yapay Zekâ Kulübü **"Claude's Plan"** yarışması için hazırlandı.

> 🎬 **Demo Videosu:** [Tüm akışı videodan izlemek için tıklayın (Google Drive)](https://drive.google.com/file/d/13lVFijzIIhb4o5ZJWNfXU7rEu3FuKpY5/view?usp=drive_link)  
> 🌐 **Canlı Web Demosu (Kurulumsuz):** [ahmetyusufoguz.github.io/GTU_Kirtasiye_Demo](https://ahmetyusufoguz.github.io/GTU_Kirtasiye_Demo/)

## Ne işe yarar?

**Eski süreç:** Müşteri dosyayı kırtasiyenin mailine atar, yazıcıya bağlı bilgisayarda mail bulunup dosya indirilir, çıktı ayarları yapılır, yazdırılır. Sonra kasada sayfalar elle sayılıp ücret hesaplanır.

**Bu sistemle:**

1. Müşteri telefondan siteye **PDF yükler**, siyah-beyaz/renkli seçer, **fiyatı anlık görür** ve 6 haneli bir **sipariş kodu** alır.
2. Yazıcı bilgisayarındaki masaüstü uygulaması dosyayı sipariş anında **önceden indirir**.
3. Müşteri kasaya kodu gösterir, görevli ödemeyi alıp siparişi **"Ödendi"** yapar.
4. Müşteri kodu yazıcı bilgisayarına girer; **yazdırma ödeme onayına kadar kilitlidir**. Ödeme onaylanınca kilit kendiliğinden açılır ve çıktı alınır.
5. Müşteri kendi ekranından sipariş durumunun (**Ödeme bekliyor → Ödendi → Yazdırılıyor → Çıktı alındı**) canlı değişimini anlık takip eder.

---

## Nasıl Deneyebilirim? (2 Farklı Yöntem)

Projeyi denemek için iki seçeneğin var:
- **Yöntem 1 — Tarayıcıdan Hızlı Test (Kurulumsuz):** Bilgisayarına hiçbir şey kurmadan, doğrudan internet tarayıcında 1 dakikada tüm akışı dene.
- **Yöntem 2 — Bilgisayara Kurulum (Tam Sistem):** Masaüstü uygulamasını bilgisayarına kurup gerçek telefonundan QR kod okutarak dene.

---

## Yöntem 1: Tarayıcıdan Hızlı Test (Kurulumsuz Web Demosu)

Hiçbir program indirmeden doğrudan şu adresten deneyebilirsin:

👉 **<https://ahmetyusufoguz.github.io/GTU_Kirtasiye_Demo/>**

Bu sürüm sunucu veya masaüstü uygulaması olmadan tamamen tarayıcında çalışır. Ekranın **sol alt köşesindeki `Demo: Müşteri | Kasa | Yazıcı` çubuğundan** üç ekranı ayrı sekmelerde açıp yan yana görebilirsin.

### Adım Adım Test Senaryosu (Tarayıcıda)

1. **Sipariş Ver (Müşteri Sekmesi):**
   - Açılan sayfada kendi PDF dosyanı seç veya hazır dosya aramamak için **"📄 Örnek PDF ile doldur (3 sayfa)"** butonuna tıkla.
   - Siyah-beyaz veya Renkli seçip **"Siparişi gönder"** butonuna bas.
   - Ekranda **6 haneli sipariş kodun** ve **"Ödeme bekliyor"** durumu belirecek.
2. **Kilidi Gör (Yazıcı Sekmesi):**
   - Sol alttaki bar'dan **Yazıcı**'ya tıklayarak yeni sekmede yazıcı ekranını aç.
   - Müşteri kodunu girip **"Aç"** butonuna bas.
   - Sipariş bilgilerini ve **`🔒 Yazdırma kilitli`** butonunu göreceksin.
3. **Ödemeyi Onayla (Kasa Sekmesi):**
   - Sol alttaki bar'dan **Kasa**'ya tıklayarak kasa panelini aç ve **"Giriş yap"** de.
   - Listede siparişi gör ve **"Ödendi"** butonuna bas.
4. **Canlı Kilit Açılışını ve Çıktıyı Gör:**
   - **Müşteri** sekmesine baktığında durumun otomatik olarak **"Ödendi, yazdırılabilir"** olduğunu göreceksin.
   - **Yazıcı** sekmesine baktığında ise kilidin kendiliğinden açılıp butonun **`🔓 Yazdır`** olduğunu göreceksin.
   - **"🔓 Yazdır"** butonuna basarak yazdırma penceresini aç; ardından **"✓ Çıktı alındı olarak işaretle"** butonuyla siparişi tamamla.

> **Önemli Not:** Web demosunda veriler yalnızca açtığın tarayıcının hafızasında (`localStorage` + `IndexedDB`) tutulur; başka cihazlarla paylaşılmaz. Bu nedenle üç ekranı da **aynı tarayıcıdaki sekmelerde** açarak denemelisin.

---

## Yöntem 2: Bilgisayara Kurulum (Gerçek Telefon + Masaüstü Uygulaması)

Sistemi gerçek bir kırtasiye ortamındaki gibi (bilgisayarda masaüstü uygulaması + telefondan QR kodla bağlanma) çalıştırmak için aşağıdaki adımları bir kez yapman yeterlidir. Teknik bilgi gerekmez.

### Neye ihtiyacın var?

- Windows 10 veya 11 yüklü bir bilgisayar
- İnternet bağlantısı (yalnızca ilk kurulumda dosyaları indirmek için gerekir, sonrasında internet gerekmez)
- Telefon ve bilgisayarın aynı ağa bağlı olması (örneğin telefonun kişisel erişim noktasını / hotspot'unu açıp bilgisayarı ona bağlamak)

### Adım 1: Node.js'i kur (bilgisayarda yoksa)

Node.js, sistemin çalışması için gereken yardımcı programdır.

1. <https://nodejs.org> adresine gir.
2. Yeşil **"LTS"** yazan büyük butona tıkla ve inen kurulum dosyasını aç.
3. Açılan pencerelerde sırasıyla **"Next"** (İleri), **"Install"** (Kur) ve **"Finish"** (Bitir) butonlarına bas. Hiçbir ayarı değiştirmen gerekmez.

*(Bilgisayarında zaten kurulu olup olmadığını bilmiyorsan bu adımı atlayabilirsin; 2. adımda kurulum dosyası seni uyarır.)*

### Adım 2: Kurulum dosyasını çalıştır

1. Bu projeyi bilgisayarına indir (veya ZIP olarak indirip klasöre çıkar).
2. Klasörün içindeki **`kurulum.bat`** dosyasına çift tıkla.
3. Windows *"Bu uygulamanın cihazınızda değişiklik yapmasına izin vermek istiyor musunuz?"* diye sorarsa **"Evet"**'e bas (telefonun bilgisayara bağlanabilmesi için güvenlik duvarı izni eklenir).
4. Siyah bir pencere açılır ve kurulum başlar. **Birkaç dakika sürebilir, pencereyi kapatma.**
5. **"KURULUM TAMAMLANDI"** yazısını gördüğünde bir tuşa basarak pencereyi kapat.

Masaüstünde **"Kirtasiye Yazici"** adlı bir simge oluşur. Kurulum tamamlandı!

---

## Kurulu Sistemi Çalıştırma ve Kullanma

### 1. Yazıcı Bilgisayarı Uygulamasını Açma

1. Masaüstündeki **"Kirtasiye Yazici"** simgesine çift tıkla.
2. Yazıcı bilgisayarı uygulaması açılır. Arka plandaki sunucuyu **uygulama kendisi otomatik başlatır**; ekstra bir pencere veya komut açman gerekmez.
3. Uygulamayı kapattığında sistem tamamen kapanır.

### 2. Telefondan Müşteri Sayfasına Girme

1. Yazıcı uygulamasının sol tarafında bir **QR kod** ve adres (ör. `http://192.168.1.20:3000`) görünür.
2. Telefonunun kamerasıyla bu QR kodu okut; müşteri sayfası doğrudan açılır.
3. Ağ değiştiğinde IP adresi değişse bile QR kod her zaman güncel adresi gösterir.

### 3. Kasa Ekranını Açma

Kasa görevlisi, bilgisayarda herhangi bir internet tarayıcısı (Chrome, Edge vb.) açıp adres çubuğuna şunu yazar:

```text
http://localhost:3000/cashier.html
```

*(Kasa ekranı aynı ağdaki başka bir cihazdan açılacaksa `localhost:3000` yerine yazıcı uygulamasında yazan IP adresi kullanılır: ör. `http://192.168.1.20:3000/cashier.html`)*

### 4. Kasada Geri Alma / İade

Kasada işlem gören her siparişin yanında **"Geri al"** butonu bulunur ve onay alarak siparişi bir adım geri döndürür:

- `Çıktı alındı` veya `Yazdırılıyor` → **`Ödendi`** (çıktıda sorun olduğunda tekrar yazdırmak için kilidi açar)
- `Ödendi` → **`Ödeme bekliyor`** (ödeme iadesi durumunda yazdırmayı tekrar kilitler)

---

## Ekranlar ve Görevleri

| Ekran | Adres | Kim kullanır | Ne yapar |
| --- | --- | --- | --- |
| **Müşteri sayfası** | `/` | Müşteri (Telefon / Web) | PDF yükle (veya örnek PDF seç), s&b/renkli seç, anlık fiyat gör, kod al, canlı durum takip et |
| **Kasa paneli** | `/cashier.html` | Kasa görevlisi | Kodla sipariş aç, "Ödendi" işaretle, canlı sipariş listesini gör, "Geri al" |
| **Yazıcı uygulaması** | Electron / `printer.html` | Yazıcı bilgisayarı | Siparişleri önceden indirir, kodla açar, ödeme onaylanınca kilidi açıp yazdırır |

---

## Sorun Giderme

| Sorun | Çözüm |
| --- | --- |
| **Telefondan sayfa açılmıyor** | Telefon ve bilgisayarın aynı Wi-Fi veya hotspot ağına bağlı olduğundan emin ol. Okul/kampüs Wi-Fi ağları cihazları birbirinden izole edebilir; bu durumda **telefonun hotspot'unu** açıp bilgisayarı ona bağla. Gerekirse `kurulum.bat`'ı tekrar çalıştır. |
| **Uygulamada "Sunucuya ulaşılamıyor" yazıyor** | Uygulamayı kapatıp masaüstündeki simgeden tekrar aç. Düzelmezse `kurulum.bat`'ı tekrar çalıştır. |
| **Yazdırma çıktısı açılırken "sharing violation" hatası** | Sanal PDF yazıcısının kaydetmeye çalıştığı dosya başka bir programda açık kalmıştır. Açık PDF'i kapat veya farklı bir dosya adıyla kaydet. |
| **Masaüstündeki "Kirtasiye Yazici" simgesi silindi** | `kurulum.bat` dosyasına tekrar çift tıkla; kısayol yeniden oluşturulur. |

---

## Teknik Detaylar (Geliştiriciler İçin)

- **Teknoloji:** Node.js, Express, SQLite (`better-sqlite3`), Vanilla HTML/CSS/JS, Electron, `pdf-lib`, `qrcode`.
- **Fiyat ve Kod:** Fiyat sunucuda `sayfa sayısı × birim fiyat` olarak hesaplanır (`server.js` içindeki `PRICES`: S&B 1 TL, Renkli 5 TL). Sipariş kodu 6 karakterdir, karışan karakterler (`0/O`, `1/I`) içermez, büyük/küçük harf duyarsızdır.
- **Sipariş Durumları:** `bekliyor` → `odendi` → `yazdiriliyor` → `cikti_alindi`. Yazdırma kilidi sunucu tarafında da zorlanır.
- **Web Demosu Derlemesi:** `node kirtasiye-demo/pages/build.js` komutu sayfaları `_site/` klasörüne kopyalar ve `mock-api.js` dosyasını bağlar. `main` dalına her push yapıldığında `.github/workflows/pages.yml` ile GitHub Pages'e otomatik yayınlanır.

### Proje Yapısı

```text
GTU_Kirtasiye_Demo/
├── kurulum.bat                Tek tıkla kurulum (bağımlılıklar, kısayol, güvenlik duvarı)
├── .github/workflows/
│   └── pages.yml              GitHub Pages otomatik yayınlama akışı
└── kirtasiye-demo/
    ├── server.js              Backend (Express + SQLite)
    ├── package.json
    ├── public/
    │   ├── index.html         Müşteri sayfası (mobil öncelikli, canlı durum takipli)
    │   └── cashier.html       Kasa paneli
    ├── desktop/               Yazıcı bilgisayarı uygulaması (Electron)
    │   ├── main.js            Otomatik sunucu başlatma, ön indirme, yazdırma
    │   ├── preload.js
    │   ├── index.html         Masaüstü arayüzü
    │   ├── kisayol-olustur.ps1
    │   └── package.json
    └── pages/                 GitHub Pages statik web demosu
        ├── build.js           Statik site derleyicisi
        └── mock-api.js        Tarayıcı içi sahte backend (localStorage + IndexedDB)
```

### Terminalden Çalıştırma (İsteğe Bağlı)

```powershell
cd kirtasiye-demo
npm install
npm start            # Sunucuyu başlatır (http://localhost:3000)

cd desktop
npm install
npm start            # Electron uygulamasını başlatır
```

### API Uç Noktaları

| Yöntem | Adres | Açıklama |
| --- | --- | --- |
| GET | `/api/prices` | Birim fiyatlar (`bw`, `color`) |
| POST | `/api/preview` | PDF alır, sayfa sayısını döner (kayıt yapmaz) |
| POST | `/api/orders` | `file` + `color` ile sipariş oluşturur; `code`, `pages`, `price` döner |
| GET | `/api/orders` | Tüm siparişler (kasa listesi ve masaüstü ön indirme döngüsü) |
| GET | `/api/orders/:code` | Tek sipariş sorgulama |
| POST | `/api/orders/:code/pay` | Durumu `bekliyor` → `odendi` yapar |
| POST | `/api/orders/:code/undo` | Durumu bir adım geri alır (`cikti_alindi`/`yazdiriliyor` → `odendi` → `bekliyor`) |
| GET | `/api/orders/:code/file` | Siparişin PDF dosyasını döner |
| POST | `/api/orders/:code/status` | Yazdırma durumu günceller (`yazdiriliyor`, `cikti_alindi`) |
| GET | `/api/info` | Yerel ağ bağlantı adresi ve QR kodu (SVG) |

### Bilinen Sınırlar (Demo Kapsamı)

- Kimlik doğrulama yoktur; kasa girişi şifresizdir.
- 24 saatlik süre dolumu, otomatik dosya temizleme, çoklu dosya, kağıt boyutu ve tek/çift yön seçenekleri demo kapsamı dışındadır.
- Yalnızca PDF kabul edilir.
