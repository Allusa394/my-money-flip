/* ═══════════════════════════════════════════════════════════
   THE MONEY FLIP — api/transform.js
   Vercel Serverless Function → OpenRouter API
   ═══════════════════════════════════════════════════════════ */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'z-ai/glm-4.5-air:free';

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
      'HTTP-Referer': 'https://money-flip.vercel.app',
      'X-Title': 'The Money Flip',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
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

const PROMPT_MASTER = `Ты — Мастер трансформации The Money Flip. Работаешь с конкретным убеждением человека.

Применяй два фокуса языка НЛП:
1. ПЕРЕОПРЕДЕЛЕНИЕ — возьми точные слова из убеждения и покажи им другой смысл. Не обобщай — работай с тем, что написано.
2. НАМЕРЕНИЕ — назови прямо, что это убеждение пытается защитить или сохранить.

Правила: не начинай с "Это убеждение..." — сразу к сути. Говори на «ты». Конкретные образы, не абстракции.
Ответ: 3–4 предложения. Только текст.`;

const PROMPT_BATTLE = `Ты — провокатор The Money Flip. Разрушаешь логику убеждения одним точным ударом.

Применяй два фокуса языка НЛП:
1. ПРИМЕНЕНИЕ К СЕБЕ — если убеждение правда, оно должно работать везде. Найди, где оно уничтожает само себя.
2. ПРОТИВОПОЛОЖНЫЙ ПРИМЕР — один реальный факт или человек, который делает это убеждение невозможным.

Правила: первое предложение — сразу удар, без разгона. Говори на «ты». При intensity 7–10 жёстко и без жалости.
Ответ: 3–4 предложения. Только текст.`;

const PROMPT_CODE = `Ты — архитектор новой реальности The Money Flip. Создаёшь новую программу взамен старой.

Применяй два фокуса языка НЛП:
1. ИЕРАРХИЯ КРИТЕРИЕВ — что конкретно для этого человека важнее страха? Назови исходя из его контекста.
2. ИЗМЕНЕНИЕ ФРЕЙМА — два сценария через 5 лет: С этим убеждением и БЕЗ него. Коротко, но ощутимо.

Обязательно заверши:
— «Новый код: «...»» — точная личная формула, не шаблон
— «Действие:» — одно конкретное действие на сегодня, не "подумай", а сделай

Правила: говори на «ты». Конкретно, без общих фраз.
Ответ: 4–5 предложений. Только текст.`;

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
