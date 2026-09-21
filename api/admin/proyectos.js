const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const refs = await kv.zrange('proyectos:index', 0, -1, { rev: true });
  const proyectos = [];
  for (const ref of refs) {
    const p = await kv.get(`proyecto:${ref}`);
    if (p) proyectos.push(p);
  }
  return res.status(200).json({ proyectos });
};
