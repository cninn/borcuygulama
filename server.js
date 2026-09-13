import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'borclar.json');

// Veri klasörü yoksa oluştur
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

const app = express();

// Sadece localhost'tan gelen isteklere izin ver
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  // Önce geçici dosyaya yaz, sonra taşı (veri kaybı önleme)
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

// Tüm müşterileri getir
app.get('/api/customers', (req, res) => {
  try {
    res.json(readData());
  } catch {
    res.status(500).json({ error: 'Veri okunamadı.' });
  }
});

// Yeni müşteri ekle
app.post('/api/customers', (req, res) => {
  try {
    const data = readData();
    const customer = req.body;
    data.unshift(customer);
    writeData(data);
    res.status(201).json(customer);
  } catch {
    res.status(500).json({ error: 'Müşteri eklenemedi.' });
  }
});

// Müşteri güncelle (borç ekleme / ödeme için)
app.put('/api/customers/:id', (req, res) => {
  try {
    const data = readData();
    const idx = data.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Müşteri bulunamadı.' });
    data[idx] = req.body;
    writeData(data);
    res.json(data[idx]);
  } catch {
    res.status(500).json({ error: 'Müşteri güncellenemedi.' });
  }
});

// Müşteri sil
app.delete('/api/customers/:id', (req, res) => {
  try {
    const data = readData().filter(c => c.id !== req.params.id);
    writeData(data);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Müşteri silinemedi.' });
  }
});

// Sadece localhost'a bağla, dışarıya açma
app.listen(3001, '127.0.0.1', () => {
  console.log('✅ API sunucusu: http://127.0.0.1:3001');
  console.log(`📁 Veri dosyası: ${DATA_FILE}`);
});
