@echo off
chcp 65001 >nul
title Kirtasiye Sistemi - Kurulum
cd /d "%~dp0"

rem --- Yonetici izni gerekli (guvenlik duvari kurali icin). Yoksa kendini yonetici olarak yeniden acar.
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Yonetici izni isteniyor. Acilan pencerede "Evet" secenegine basin...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "%~dp0"

echo.
echo ===== Kirtasiye Sistemi Kurulumu =====
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi.
  echo Once https://nodejs.org adresinden "LTS" surumunu indirip kurun,
  echo sonra bu dosyaya tekrar cift tiklayin.
  echo.
  pause
  exit /b 1
)

echo [1/4] Sunucu dosyalari indiriliyor (internet gerekir, birkac dakika surebilir)...
cd /d "%~dp0kirtasiye-demo"
call npm install
if errorlevel 1 goto hata

echo.
echo [2/4] Yazici bilgisayari uygulamasi indiriliyor (birkac dakika surebilir)...
cd /d "%~dp0kirtasiye-demo\desktop"
call npm install
if errorlevel 1 goto hata

echo.
echo [3/4] Masaustu kisayolu olusturuluyor...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kirtasiye-demo\desktop\kisayol-olustur.ps1"
if errorlevel 1 goto hata

echo.
echo [4/4] Telefonun baglanabilmesi icin guvenlik duvari izni ekleniyor...
netsh advfirewall firewall delete rule name="Kirtasiye Demo" >nul 2>&1
netsh advfirewall firewall add rule name="Kirtasiye Demo" dir=in action=allow protocol=TCP localport=3000 profile=any >nul
if errorlevel 1 goto hata

echo.
echo ===== KURULUM TAMAMLANDI =====
echo Masaustundeki "Kirtasiye Yazici" simgesine cift tiklayarak uygulamayi acabilirsiniz.
echo.
pause
exit /b 0

:hata
echo.
echo [HATA] Kurulum tamamlanamadi. Yukaridaki hata mesajini not alip yardim isteyin.
echo.
pause
exit /b 1
