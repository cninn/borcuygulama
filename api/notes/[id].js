import { connectDB, Note } from '../../lib/mongodb.js';
import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  const { id } = req.query;

  try {
    await connectDB();

    if (req.method === 'PUT') {
      const updated = await Note.findOneAndUpdate({ id }, req.body, { new: true, runValidators: false });
      if (!updated) return res.status(404).json({ error: 'Not bulunamadı.' });
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      await Note.deleteOne({ id });
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
