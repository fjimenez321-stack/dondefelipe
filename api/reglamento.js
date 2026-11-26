// Asistente del Reglamento Interno (Reglamento_San_Agustin_2026.html).
// La clave de Gemini vive SOLO en Vercel (variable de entorno GEMINI_API_KEY), nunca en el navegador.
// Configuración (una vez): Vercel → proyecto dondefelipe → Settings → Environment Variables →
//   Name: GEMINI_API_KEY · Value: (clave nueva de Google AI Studio) · Production → Save → Redeploy.

// Alias que Google mantiene apuntando al Flash vigente (gemini-2.0-flash se apagó el 1 de junio de 2026).
const MODELO = 'gemini-flash-latest';
const ORIGENES = [
  /^https:\/\/dondefelipe(-[a-z0-9-]+)?\.vercel\.app$/,
  /^https:\/\/fjimenez321-stack\.github\.io$/,
  /^http:\/\/localhost(:\d+)?$/,
];
const MAX_TURNOS = 30;          // historial máximo que se reenvía
const MAX_BYTES = 4000000;      // Vercel acepta hasta ~4,5 MB por petición

function permitido(origen) {
  return ORIGENES.some(re => re.test(origen || ''));
}

module.exports = async (req, res) => {
  const origen = req.headers.origin || '';
  const ok = permitido(origen);
  if (ok) {
    res.setHeader('Access-Control-Allow-Origin', origen);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(ok ? 204 : 403).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Método no permitido.' } });
  if (!ok) return res.status(403).json({ error: { message: 'Origen no permitido.' } });

  const clave = process.env.GEMINI_API_KEY;
  if (!clave) {
    return res.status(501).json({ error: { message: 'El asistente aún no está configurado (falta GEMINI_API_KEY en Vercel).' } });
  }

  let cuerpo = req.body;
  if (typeof cuerpo === 'string') { try { cuerpo = JSON.parse(cuerpo); } catch (e) { cuerpo = null; } }
  const contents = cuerpo && Array.isArray(cuerpo.contents) ? cuerpo.contents : null;
  if (!contents || !contents.length || contents.length > MAX_TURNOS) {
    return res.status(400).json({ error: { message: 'Conversación inválida.' } });
  }
  // Solo se reenvían turnos de usuario/modelo con texto o el PDF del reglamento: nada más.
  const limpio = [];
  for (const t of contents) {
    if (!t || (t.role !== 'user' && t.role !== 'model') || !Array.isArray(t.parts)) {
      return res.status(400).json({ error: { message: 'Conversación inválida.' } });
    }
    const parts = [];
    for (const p of t.parts) {
      if (p && typeof p.text === 'string') parts.push({ text: p.text.slice(0, 4000) });
      else if (p && p.inline_data && p.inline_data.mime_type === 'application/pdf' && typeof p.inline_data.data === 'string') {
        parts.push({ inline_data: { mime_type: 'application/pdf', data: p.inline_data.data } });
      }
    }
    if (parts.length) limpio.push({ role: t.role, parts });
  }
  const sistema = cuerpo.system_instruction && Array.isArray(cuerpo.system_instruction.parts)
    ? { parts: cuerpo.system_instruction.parts.filter(p => p && typeof p.text === 'string').map(p => ({ text: p.text.slice(0, 3000) })) }
    : undefined;
  const salida = JSON.stringify({
    system_instruction: sistema,
    contents: limpio,
    generationConfig: { maxOutputTokens: 4096 },   // sin temperature: los Flash nuevos ya no la aceptan
  });
  if (salida.length > MAX_BYTES) return res.status(413).json({ error: { message: 'Conversación demasiado larga. Recarga la página.' } });

  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODELO + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
      body: salida,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || ('Error ' + r.status);
      return res.status(r.status === 429 ? 429 : 502).json({ error: { message: r.status === 429 ? 'Demasiadas preguntas seguidas. Espera un minuto.' : msg } });
    }
    return res.status(200).json({ candidates: data.candidates || [] });
  } catch (e) {
    return res.status(502).json({ error: { message: 'No se pudo contactar al asistente.' } });
  }
};
