@echo off
echo ==============================================
echo Irmak Kayisi - E-Ticaret Sistemi Baslatiliyor
echo ==============================================

:: API klasörüne git ve yeni bir CMD penceresinde dotnet run komutunu çalıştır
echo [1/3] Backend (Sunucu) baslatiliyor...
cd KayisiApi
start "Irmak Kayisi API" cmd /k "echo Sunucu baslatiliyor, lutfen bekleyin... & dotnet run"
cd ..

:: Frontend klasörüne git ve yeni bir CMD penceresinde npm run dev komutunu çalıştır
echo [2/3] Frontend (Site) baslatiliyor...
cd KayisiFrontend
start "Irmak Kayisi Frontend" cmd /k "echo Site baslatiliyor, lutfen bekleyin... & npm run dev"
cd ..

:: Tarayıcıyı açmadan önce sitenin açılması için kısa bir bekleme süresi
echo [3/3] Tarayici aciliyor, lutfen bekleyin...
timeout /t 5 /nobreak > nul

:: Sitenin varsayılan adresi (Vite genellikle 5173 portunu kullanır)
start http://localhost:5173

echo ==============================================
echo Islem tamamlandi! 
echo Acilan siyah siyah komut pencerelerini KAPATMAYINIZ, asagi indirebilirsiniz.
echo ==============================================
pause
