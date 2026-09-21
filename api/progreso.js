const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ref = String(req.query.ref || '').toUpperCase().trim();
  if (!ref) return res.status(400).json({ error: 'Falta la referencia' });

  const proyecto = await kv.get(`proyecto:${ref}`);
  if (!proyecto) return res.status(404).json({ error: 'No encontrado' });

  return res.status(200).json(proyecto);
};
