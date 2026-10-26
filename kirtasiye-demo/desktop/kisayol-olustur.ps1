# Masaüstüne "Kirtasiye Yazici" kısayolu oluşturur.
# Kullanım (desktop klasöründe, önce `npm install` yapılmış olmalı):
#   powershell -ExecutionPolicy Bypass -File .\kisayol-olustur.ps1
$dir = $PSScriptRoot
$exe = Join-Path $dir 'node_modules\electron\dist\electron.exe'
if (-not (Test-Path $exe)) {
  Write-Error "electron.exe bulunamadı. Önce desktop klasöründe 'npm install' çalıştır."
  exit 1
}
$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Kirtasiye Yazici.lnk'
$s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$s.TargetPath = $exe
$s.Arguments = '"' + $dir + '"'
$s.WorkingDirectory = $dir
$s.IconLocation = "$exe,0"
$s.Description = 'Kirtasiye Yazici Bilgisayari'
$s.Save()
Write-Output "Kısayol oluşturuldu: $lnk"
