const { kv } = require('@vercel/kv');

const ESTADOS = ['recibido', 'diseno', 'desarrollo', 'entregado'];
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos (0/O, 1/I)

function generarReferencia() {
  let code = '';
  for (let i = 0; i < 6; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)];
  return 'NQ-' + code;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { nombre, empresa, plan } = req.body || {};
    if (!nombre || !plan) return res.status(400).json({ error: 'Faltan datos' });

    let ref = null;
    for (let i = 0; i < 5; i++) {
      const candidato = generarReferencia();
      const existe = await kv.get(`proyecto:${candidato}`);
      if (!existe) { ref = candidato; break; }
    }
    if (!ref) return res.status(500).json({ error: 'No se pudo generar una referencia' });

    const ahora = new Date().toISOString();
    const proyecto = {
      ref,
      nombre,
      empresa: empresa || '',
      plan,
      estado: ESTADOS[0],
      creado: ahora,
      actualizado: ahora
    };

    await kv.set(`proyecto:${ref}`, proyecto);
    await kv.zadd('proyectos:index', { score: Date.now(), member: ref });

    return res.status(200).json({ ref });
  } catch (e) {
    return res.status(500).json({ error: 'Error interno' });
  }
};
