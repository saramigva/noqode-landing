const { kv } = require('@vercel/kv');

const ESTADOS_VALIDOS = ['recibido', 'diseno', 'desarrollo', 'entregado'];

module.exports = async function handler(req, res) {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ref, estado } = req.body || {};
  if (!ref || !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const key = `proyecto:${String(ref).toUpperCase()}`;
  const proyecto = await kv.get(key);
  if (!proyecto) return res.status(404).json({ error: 'No encontrado' });

  proyecto.estado = estado;
  proyecto.actualizado = new Date().toISOString();
  await kv.set(key, proyecto);

  return res.status(200).json(proyecto);
};
