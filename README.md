# Kırtasiye Çıktı Sistemi

Kırtasiyede çıktı alma sürecindeki iki darboğazı (yazıcı bilgisayarı başında dosya bulma ve kasada sayfa sayma) ortadan kaldıran sistemin **tek bilgisayarda çalışan demosu**. GTÜ yapay zekâ kulübü "Claude's Plan" yarışması için hazırlandı.

## Ne işe yarar?

**Eski süreç:** Müşteri dosyayı kırtasiyenin mailine atar, yazıcıya bağlı bilgisayarda mail bulunup dosya indirilir, çıktı ayarları yapılır, yazdırılır. Sonra kasada sayfalar elle sayılıp ücret hesaplanır.

**Bu sistemle:**

1. Müşteri telefondan siteye **PDF yükler**, siyah-beyaz/renkli seçer, **fiyatı anlık görür** ve bir **sipariş kodu** alır.
2. Yazıcı bilgisayarındaki masaüstü uygulaması dosyayı sipariş anında **önceden indirir**.
3. Müşteri kasaya kodu gösterir, görevli ödemeyi alıp siparişi **"Ödendi"** yapar.
4. Müşteri kodu yazıcı bilgisayarına girer, **yazdırma ödeme onayına kadar kilitlidir**. Ödeme onaylanınca kilit kendiliğinden açılır ve çıktı alınır.

Üç ayrı ekran vardır: müşteri sayfası (telefon), kasa paneli (tarayıcı) ve yazıcı bilgisayarı uygulaması (Electron).

## Kurulum (yalnızca bir kez)

Kurulumu **yazıcıya bağlı bilgisayarda** yap. Teknik bilgi gerekmez, her adımda ne yapacağın yazıyor.

**Neye ihtiyacın var?**

- Windows 10 veya 11 yüklü bir bilgisayar
- İnternet bağlantısı (kurulum sırasında gerekli dosyalar indirilir, sonrasında internet gerekmez)
- Telefon ve bilgisayarın aynı ağa bağlı olması (örneğin telefonun hotspotunu açıp bilgisayarı ona bağlamak)

**Adım 1: Node.js'i kur (bilgisayarda yoksa)**

Node.js, sistemin çalışması için gereken bir yardımcı programdır.

1. <https://nodejs.org> adresine gir.
2. Yeşil **"LTS"** yazan büyük butona tıkla, inen dosyayı aç.
3. Açılan pencerelerde sürekli **"Next"** (İleri), en sonda **"Install"** (Kur) ve **"Finish"** (Bitir) de. Hiçbir ayarı değiştirmen gerekmez.

Kurulu olup olmadığını bilmiyorsan bu adımı atla. 2. adımda bilgisayar sana söyler.

**Adım 2: Kurulum dosyasını çalıştır**

1. Proje klasörünü aç, içindeki **`kurulum.bat`** dosyasına çift tıkla.
2. "Bu uygulamanın cihazınızda değişiklik yapmasına izin vermek istiyor musunuz?" sorusu gelirse **"Evet"**'e bas. (Telefonun bilgisayara bağlanabilmesi için güvenlik duvarına izin eklemek gerekiyor.)
3. Siyah bir pencere açılır ve yazılar akar. Bu normaldir, **birkaç dakika sürebilir. Pencereyi kapatma.**
4. En sonda **"KURULUM TAMAMLANDI"** yazısını görünce bir tuşa basıp pencereyi kapat.

Masaüstünde **"Kirtasiye Yazici"** adlı bir simge oluşur. Kurulum bu kadar.

> **Hata çıkarsa:** Pencerede **"Node.js bulunamadi"** yazıyorsa Adım 1'i yap, sonra `kurulum.bat`'a tekrar çift tıkla. Başka bir hata yazıyorsa pencerenin ekran görüntüsünü alıp yardım iste.

## Çalıştırma

1. Masaüstündeki **"Kirtasiye Yazici"** simgesine çift tıkla.
2. Yazıcı bilgisayarı uygulaması açılır. Sistemin geri kalanını (sunucuyu) **uygulama kendisi başlatır**, ayrıca bir şey açman gerekmez.
3. Uygulamayı kapattığında sistem de tamamen kapanır.

Telefondan siteye girmek ve kasa ekranını açmak için aşağıdaki bölümlere bak.

### Telefondan siteye giriş

1. Yazıcı uygulamasının sol tarafında bir **QR kod** ve bir adres (örneğin `http://192.168.1.20:3000`) görünür.
2. Telefonun kamerasıyla QR kodu okut. Müşteri sayfası açılır.
3. Bilgisayarın IP adresi ağ değişince değişir. QR kod her zaman güncel adresi gösterir, adresi ezberlemene gerek yok.

**Telefonda sayfa açılmazsa:**

- Telefon ve bilgisayar **aynı Wi-Fi veya hotspot'a** bağlı mı kontrol et.
- Okul gibi bazı Wi-Fi ağları cihazların birbirini görmesini engeller. Telefonun kendi **hotspot**'unu açıp bilgisayarı ona bağlamak çoğu zaman çözer.
- Kurulumda "Evet"e bastığından emin ol (telefonun bağlanabilmesi için gereken güvenlik duvarı izni orada eklenir). Emin değilsen `kurulum.bat`'a tekrar çift tıkla.

### Kasa ekranını açma

Kasa görevlisi bilgisayarda bir internet tarayıcısı (Chrome, Edge vb.) açıp adres çubuğuna şunu yazar:

```
http://localhost:3000/cashier.html
```

Başka bir cihazdan açacaksa `localhost` yerine yazıcı uygulamasında görünen adresi kullan (örneğin `http://192.168.1.20:3000/cashier.html`).

### Gelişmiş: terminalden çalıştırma (geliştiriciler için)

```powershell
cd kirtasiye-demo
npm install          # ilk seferde
npm start            # sunucu

cd desktop
npm install          # ilk seferde
npm start            # masaüstü uygulaması (ayrı terminalde)
```

Sunucu başka bir bilgisayardaysa: `$env:SERVER_URL="http://IP:3000"; npm start` (desktop klasöründe). Kısayolu elle yeniden oluşturmak için `desktop` klasöründe `powershell -ExecutionPolicy Bypass -File .\kisayol-olustur.ps1`.

## Kullanım

| Ekran | Adres | Kim kullanır | Ne yapar |
| --- | --- | --- | --- |
| Müşteri sayfası | `/` | Müşteri (telefon) | PDF yükle, s&b/renkli seç, anlık fiyat, kod al, kodla sipariş sorgula |
| Kasa paneli | `/cashier.html` | Kasa görevlisi | Kodla sipariş aç, "Ödendi" işaretle, canlı sipariş listesi, "Geri al" |
| Yazıcı uygulaması | Electron | Yazıcı bilgisayarı | Siparişleri önceden indirir, kodla açar, ödeme onaylıysa yazdırır |

Müşteri sayfasının altında "Kasa girişi", kasa giriş ekranında "Müşteri sayfasına dön" bağlantısı vardır.

### Örnek akış

1. Telefondan müşteri sayfasını aç, PDF seç, baskı türünü seç, **"Siparişi gönder"** de ve kodu al.
2. Yazıcı uygulamasına kodu gir: sipariş görünür, **"Yazdırma kilitli"** yazar.
3. Kasa panelinde giriş yap, kodu aç, **"Ödemeyi aldım"** (veya listeden "Ödendi") de.
4. Yazıcı uygulamasında kilit kendiliğinden açılır. **"Yazdır"**'a bas, yazıcıyı seç (fiziksel yazıcı yoksa "Microsoft Print to PDF").
5. Yazdırma onaylanınca sipariş **"Çıktı alındı"** olur. Müşteri sayfasındaki sorgulamada da görünür.

Kasa ve yazıcı uygulaması pencereleri yan yana tutulursa "Ödendi" basıldığında kilidin kendiliğinden açılması net görünür.

### Geri alma (kasa)

Kasada her siparişte "Geri al" butonu vardır. Bir adım geri götürür, onay ister:

- `cikti_alindi` veya `yazdiriliyor` → `odendi` (sipariş yeniden yazdırılabilir, çıktıda sorun olduğunda kullanılır)
- `odendi` → `bekliyor` (ödeme iadesi, yazdırma tekrar kilitlenir)

## Fiyat ve kod

- Fiyat sunucuda hesaplanır: `sayfa sayısı × birim fiyat`. Birim fiyatlar [server.js](kirtasiye-demo/server.js) içinde `PRICES` değişkenindedir (şu an siyah-beyaz 1 TL, renkli 5 TL, yer tutucudur, istediğin gibi değiştir).
- Müşteri sayfasındaki anlık fiyat ön izlemedir, sayfa sayısı `/api/preview` ile sunucudan alınır.
- Kod 6 karakterdir, harf ve rakam karışıktır, karışan karakterler (0/O, 1/I) yoktur, büyük/küçük harf duyarsızdır.

## Sipariş durumları

`bekliyor` → `odendi` → `yazdiriliyor` → `cikti_alindi`

Yazdırma kilidi sunucuda zorlanır: ödenmemiş siparişte `yazdiriliyor` durumuna geçmek hata verir.

## Teknoloji

Node.js, Express, SQLite (`better-sqlite3`), düz HTML/JS sayfalar, Electron. PDF sayfa sayısı `pdf-lib` ile, QR kod `qrcode` ile üretilir.

## Proje yapısı

```
kirtasiye-demo/
├── server.js              Backend (Express + SQLite), müşteri ve kasa sayfalarını da servis eder
├── package.json
├── public/
│   ├── index.html         Müşteri sayfası (mobil öncelikli)
│   └── cashier.html       Kasa paneli (ayrı giriş ekranı, şifresiz)
├── desktop/               Yazıcı bilgisayarı uygulaması (Electron)
│   ├── main.js            Sunucu başlatma, eşitleme, indirme, yazdırma
│   ├── preload.js
│   ├── index.html         Uygulama arayüzü
│   ├── kisayol-olustur.ps1  Masaüstü kısayolunu oluşturur
│   └── package.json
├── demo.db                (çalışırken oluşur) SQLite veritabanı
└── uploads/               (çalışırken oluşur) yüklenen PDF'ler
```

## API

| Yöntem | Adres | Açıklama |
| --- | --- | --- |
| GET | `/api/prices` | Birim fiyatlar |
| POST | `/api/preview` | PDF alır, sayfa sayısını döner (kayıt yapmaz) |
| POST | `/api/orders` | `file` + `color` (`bw`/`color`) ile sipariş oluşturur, `code`, `pages`, `price` döner |
| GET | `/api/orders` | Tüm siparişler (kasa listesi, masaüstü eşitleme) |
| GET | `/api/orders/:code` | Tek sipariş |
| POST | `/api/orders/:code/pay` | `bekliyor` → `odendi` |
| POST | `/api/orders/:code/undo` | Bir adım geri al (yukarıdaki "Geri alma" kuralları) |
| GET | `/api/orders/:code/file` | PDF dosyası |
| POST | `/api/orders/:code/status` | `{status}`: `yazdiriliyor` (sadece `odendi`'den), `cikti_alindi` (sadece `yazdiriliyor`'dan) |
| GET | `/api/info` | Telefon bağlantı adresi ve QR (SVG) |

## Masaüstü uygulaması (Electron)

- Açılışta sunucu yoksa `node server.js` başlatır ve kapanırken durdurur.
- 2 saniyede bir sunucuyu yoklar, durumu `cikti_alindi` olmayan siparişlerin PDF'ini önceden indirir (uygulama veri klasöründe `orders/`).
- Kod girilince sipariş durumu 1,5 saniyede bir yenilenir, "Ödendi" olunca buton açılır.
- Yazdırma: PDF yeni pencerede açılır, `webContents.print()` ile sistem yazdırma penceresi tetiklenir. Onaylanırsa durum otomatik `cikti_alindi` olur.
- Yazdırma penceresi sorun çıkarırsa yedekler: **"Çıktı alındı olarak işaretle"** ve **"PDF'i sistem uygulamasında aç"** butonları.

## Sorun giderme

| Sorun | Çözüm |
| --- | --- |
| Telefondan sayfa açılmıyor | Telefon ve bilgisayarın aynı Wi-Fi/hotspot'a bağlı olduğunu kontrol et. Okul gibi ağlar cihazları ayırabilir, telefonun hotspotunu kullan. Gerekirse `kurulum.bat`'ı tekrar çalıştır (güvenlik duvarı izni eklenir) |
| Uygulamada "Sunucuya ulaşılamıyor" yazıyor | Uygulamayı kapatıp masaüstü simgesinden tekrar aç. Düzelmezse `kurulum.bat`'ı tekrar çalıştır. Node.js kurulu değilse önce kur (Kurulum, Adım 1) |
| Yazdırma çıktısı açılırken "sharing violation" hatası | Çıktıyı yazan PDF yazıcısının hedef dosyası başka bir program tarafından açık tutuluyordur. Dosyayı kapat veya farklı bir ada kaydet |
| Masaüstündeki "Kirtasiye Yazici" simgesi kayboldu | `kurulum.bat`'a tekrar çift tıkla, simge yeniden oluşur |

## Bilinen sınırlar (demo için bilerek)

- Kimlik doğrulama yok. Kasa girişi şifresizdir, `/api/orders/:code/pay` herkese açıktır.
- 24 saatlik süre dolumu, dosya silme, "süresi geçti" ve "iptal/hata" durumları yok.
- Log, ücret düzenleme, fiyat tablosu düzenleme, günlük özet yok. İade/yeniden basma sadece "Geri al" ile yapılır.
- Çoklu dosya, tek/çift taraflı seçeneği, kağıt boyutu/türü yok. Sadece PDF.
- IP başına sınır, captcha, yükleme boyutu dışında kötüye kullanım koruması yok.
- Yüklenen PDF'ler `uploads/` içinde birikir, temizlenmez.
- `multer` 1.x kullanılıyor (npm uyarı veriyor), demo için sorun değil.
- Sadece Windows'ta denendi. Electron'daki yazdırma akışı farklı bilgisayar ve yazıcılarda tam doğrulanmadı (özellikle PDF'in boş basılması riski).
