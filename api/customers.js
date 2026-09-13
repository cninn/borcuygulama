import { connectDB, Customer } from '../lib/mongodb.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  try {
    await connectDB();

    if (req.method === 'GET') {
      const customers = await Customer.find().sort({ createdAt: -1 });
      return res.json(customers);
    }

    if (req.method === 'POST') {
      const customer = await Customer.create(req.body);
      return res.status(201).json(customer);
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
