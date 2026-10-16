import express from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
app.disable('x-powered-by');
app.use(express.json({ limit: '12kb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Se alcanzó el límite temporal de lecturas. Espera unos minutos e inténtalo de nuevo.' } }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/tarot', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'La IA todavía no está configurada en el servidor.' });
    const { question, cards } = req.body || {};
    if (typeof question !== 'string' || !question.trim() || question.length > 500) {
      return res.status(400).json({ error: 'Escribe una sola pregunta de hasta 500 caracteres.' });
    }
    if (!Array.isArray(cards) || cards.length !== 3 || cards.some(c => !c || typeof c.name !== 'string' || typeof c.position !== 'string')) {
      return res.status(400).json({ error: 'La lectura necesita exactamente tres cartas válidas.' });
    }
    const safeQuestion = question.trim();
    const cardInfo = cards.map((c, i) => `${i + 1}. Posición: ${String(c.position).slice(0, 80)}. Significado de posición: ${String(c.positionMeaning || '').slice(0, 300)}. Carta: ${String(c.name).slice(0, 100)}. Tema simbólico: ${String(c.theme || '').slice(0, 300)}.`).join('\n');
    const prompt = `Eres la voz cálida, respetuosa y reflexiva de Oráculo Lunar. Interpreta simbólicamente una tirada de tarot de tres cartas en español natural, con lenguaje claro, empático y no demasiado cursi. No afirmes que puedes conocer el futuro ni leer pensamientos; no des certezas sobre lo que otra persona hará. No hagas diagnósticos ni sustituyas consejo médico, legal o financiero. Si la pregunta trata sobre salud, seguridad o decisiones de alto impacto, recuerda brevemente que el tarot no sustituye ayuda profesional.\n\nPregunta única de la persona: ${safeQuestion}\n\nCartas elegidas por la persona (respeta exactamente estas cartas y posiciones):\n${cardInfo}\n\nRedacta: 1) una interpretación breve y concreta de cada carta en su posición; 2) cómo se conectan las tres en conjunto respecto a la pregunta; 3) una orientación práctica y una pregunta de reflexión final. Entre 250 y 450 palabras. No inventes cartas adicionales. Deja claro con naturalidad que es una lectura simbólica, no una predicción garantizada.`;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash', contents: prompt });
    const interpretation = String(result.text || '').trim();
    if (!interpretation) return res.status(502).json({ error: 'La IA no devolvió texto. Inténtalo de nuevo.' });
    return res.json({ interpretation });
  } catch (err) {
    console.error('Error en /api/tarot:', err?.message || 'error desconocido');
    return res.status(502).json({ error: 'No se pudo generar la lectura. Revisa que la clave y la cuota de IA estén configuradas.' });
  }
});

app.get(/.*/, (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Oráculo Lunar disponible en el puerto ${PORT}`));
