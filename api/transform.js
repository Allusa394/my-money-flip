/* ═══════════════════════════════════════════════════════════
   THE MONEY FLIP — api/transform.js
   Vercel Serverless Function → OpenRouter API
   ═══════════════════════════════════════════════════════════ */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-exp:free';

function buildMessages(systemPrompt, belief, context, intensity) {
  return [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Убеждение: «${belief}». Контекст: ${context}. Интенсивность: ${intensity}/10`,
    },
  ];
}

async function askAI(messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://my-money-flip.vercel.app',
      'X-Title': 'The Money Flip',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.85,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

/* ── Системные промпты трёх блоков ──────────────────────── */

const PROMPT_MASTER = `Ты — Мастер трансформации в Лаборатории The Money Flip.
Пользователь называет финансовое убеждение, которое ему мешает.
Применяй два фокуса языка:
1. ПЕРЕОПРЕДЕЛЕНИЕ — покажи другой смысл тех же слов. Убеждение звучит иначе, если посмотреть под другим углом.
2. НАМЕРЕНИЕ — найди позитивное намерение за убеждением. За каждым ограничением есть желание себя защитить.
Тон: тёплый, поддерживающий, без НЛП-жаргона. Говори на «ты».
Ответ: 3–5 предложений на русском языке. Только текст, без заголовков и списков.`;

const PROMPT_BATTLE = `Ты — провокатор в Лаборатории The Money Flip.
Пользователь называет финансовое убеждение, которое ему мешает.
Применяй два фокуса языка:
1. ПРИМЕНЕНИЕ К СЕБЕ — разверни логику убеждения против него самого. Если убеждение правда, оно должно работать везде — покажи, где оно рушится.
2. ПРОТИВОПОЛОЖНЫЙ ПРИМЕР — приведи один конкретный реальный факт или человека, который опровергает убеждение одним своим существованием.
Тон: прямой, дерзкий, без лишних сантиментов. При intensity 7–10 — жёстче и провокационнее. Говори на «ты».
Ответ: 3–5 предложений на русском языке. Только текст, без заголовков и списков.`;

const PROMPT_CODE = `Ты — архитектор новой реальности в Лаборатории The Money Flip.
Пользователь называет финансовое убеждение, которое ему мешает.
Применяй два фокуса языка:
1. ИЕРАРХИЯ КРИТЕРИЕВ — что важнее для пользователя, чем это убеждение? Свобода, время, семья, развитие? Поставь это выше страха.
2. ИЗМЕНЕНИЕ РАЗМЕРА ФРЕЙМА — покажи последствия через 5–10 лет: с этим убеждением и без него. Два разных будущего.
Заверши одной короткой формулой нового убеждения в формате: Новый код: «...»
Затем одним конкретным действием на сегодня, начинающимся со слова «Действие:».
Тон: точный, вдохновляющий. Говори на «ты».
Ответ: 4–6 предложений на русском языке. Только текст, без заголовков и списков.`;

/* ── Обработчик запроса ─────────────────────────────────── */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { belief, context, intensity } = req.body;

  if (!belief || !context) {
    return res.status(400).json({ error: 'belief and context are required' });
  }

  try {
    // 3 параллельных запроса к AI
    const [master, battle, code] = await Promise.all([
      askAI(buildMessages(PROMPT_MASTER, belief, context, intensity)),
      askAI(buildMessages(PROMPT_BATTLE, belief, context, intensity)),
      askAI(buildMessages(PROMPT_CODE,   belief, context, intensity)),
    ]);

    return res.status(200).json({ master, battle, code });

  } catch (err) {
    console.error('Transform error:', err.message);
    return res.status(500).json({ error: 'AI недоступен. Попробуй ещё раз.' });
  }
}
