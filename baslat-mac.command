#!/bin/bash
# Veresiye Defteri - macOS Başlatıcı

cd "$(dirname "$0")"

# Node.js kurulu mu kontrol et
if ! command -v node &> /dev/null; then
  osascript -e 'display alert "Node.js bulunamadı" message "Lütfen nodejs.org adresinden Node.js kurun." as critical'
  exit 1
fi

# Bağımlılıkları yükle (ilk çalıştırmada)
if [ ! -d "node_modules" ]; then
  osascript -e 'display notification "Bağımlılıklar yükleniyor, lütfen bekleyin..." with title "Veresiye Defteri"'
  npm install
fi

# Portu temizle
lsof -ti:5173,3001 | xargs kill -9 2>/dev/null

# Sunucu ve UI başlat
npm run dev &
DEV_PID=$!

# Tarayıcıyı 3 saniye sonra aç
sleep 3
open "http://localhost:5173"

echo "Veresiye Defteri çalışıyor."
echo "Durdurmak için bu pencereyi kapatın."
wait $DEV_PID
