/**
 * API rotaları için auth middleware.
 * APP_SECRET env değişkeni ayarlanmamışsa (local dev) geçer.
 * Ayarlanmışsa Authorization: Bearer <token> kontrolü yapar.
 */
export function requireAuth(req, res) {
  const secret = process.env.APP_SECRET;
  if (!secret) return true; // Local geliştirmede env yoksa geç

  const auth = req.headers['authorization'];
  if (!auth || auth !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Yetkisiz erişim.' });
    return false;
  }
  return true;
}
