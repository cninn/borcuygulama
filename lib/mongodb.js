import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış. Vercel dashboard\'dan ekleyin.');
}

// Serverless fonksiyonlar arasında bağlantıyı yeniden kullan
let cached = globalThis._mongooseCache;
if (!cached) {
  cached = globalThis._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const schema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
  name:         String,
  surname:      String,
  phone:        String,
  isPayable:    { type: Boolean, default: false },
  totalDebt:    { type: Number, default: 0 },
  transactions: { type: Array,  default: [] },
  createdAt:    String,
}, { versionKey: false });

// Yanıtlarda MongoDB'nin _id alanını gizle
schema.set('toJSON', {
  transform: (_, ret) => { delete ret._id; return ret; }
});

export const Customer =
  mongoose.models.Customer || mongoose.model('Customer', schema);

// --- Hızlı Not Modeli (customers koleksiyonuna dokunmaz) ---
const noteSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  name:      String,
  surname:   String,
  amount:    { type: Number, default: 0 },
  note:      { type: String, default: '' },
  createdAt: String,
}, { versionKey: false });

noteSchema.set('toJSON', {
  transform: (_, ret) => { delete ret._id; return ret; }
});

export const Note =
  mongoose.models.Note || mongoose.model('Note', noteSchema);
