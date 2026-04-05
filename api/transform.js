/* ═══════════════════════════════════════════════════════════
   THE MONEY FLIP — api/transform.js
   Vercel Serverless Function → OpenRouter API
   ═══════════════════════════════════════════════════════════ */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-haiku-4-5-20251001';

function buildMessages(systemPrompt, belief, context, intensity, origin, obstacle) {
  const ctxLabels = { work: 'Карьера', business: 'Бизнес', family: 'Семья', personal: 'Личные финансы' };
  const userMsg = [
    `Убеждение: «${belief}»`,
    origin   ? `Источник: ${origin}`    : null,
    obstacle ? `Что блокирует: ${obstacle}` : null,
    `Контекст: ${ctxLabels[context] || context}`,
    `Интенсивность: ${intensity}/10`,
  ].filter(Boolean).join('\n');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMsg },
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
      max_tokens: 500,
      temperature: 0.9,
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

/* ── Системные промпты ───────────────────────────────────── */

const PROMPT_MASTER = `Ты — Мастер трансформации The Money Flip. Работаешь с конкретным убеждением человека, его источником и тем, что оно блокирует.

Применяй два фокуса языка НЛП в одном связном тексте:

1. ПЕРЕОПРЕДЕЛЕНИЕ — возьми ключевые слова прямо из убеждения и покажи им абсолютно другой смысл. Конкретный, ощутимый. Например, если убеждение «деньги достаются только тяжёлым трудом» — слово «тяжёлый» может означать «значимый», а не «изнурительный».

2. НАМЕРЕНИЕ — скажи прямо, что это убеждение охраняет. Страх? Самооценку? Привычный мир? Назови это с уважением, без осуждения.

Правила:
— Первое предложение сразу в суть, без вводных слов
— Обращайся лично: ты, тебя, твоё
— Используй детали из источника и блокировки если они есть
— Запрещено: «это убеждение...», «вы можете...», абстракции про «потенциал» и «возможности»
— Длина: 3–4 предложения. Только текст.`;

const PROMPT_BATTLE = `Ты — провокатор The Money Flip. Твоя задача — сломать логику убеждения так, чтобы человеку стало некомфортно его дальше держать.

Применяй два фокуса языка НЛП:

1. ПРИМЕНЕНИЕ К СЕБЕ — если убеждение абсолютно верно, оно должно работать везде без исключений. Найди точку, где оно само себя уничтожает. Будь конкретен и безжалостен.

2. ПРОТИВОПОЛОЖНЫЙ ПРИМЕР — один реальный, известный человек или факт, который делает это убеждение физически невозможным. Не «посмотри на успешных» — конкретное имя или событие.

Правила:
— Первое предложение — удар без разгона. Никаких «давай подумаем»
— При intensity 7–10: жёстко, без смягчений
— При intensity 1–6: острый вопрос, не обвинение
— Если есть источник убеждения — бить в источник, не в симптом
— Запрещено: «многие люди...», «это нормально...», утешение, мягкость
— Длина: 3–4 предложения. Только текст.`;

const PROMPT_CODE = `Ты — архитектор новой реальности The Money Flip. Создаёшь замену старой программе.

Применяй два фокуса языка НЛП:

1. ИЕРАРХИЯ КРИТЕРИЕВ — что для этого конкретного человека важнее страха? Определи исходя из его контекста и того, что убеждение блокирует. Назови прямо.

2. ИЗМЕНЕНИЕ ФРЕЙМА — два сценария через 5 лет:
   С этим убеждением: [одно конкретное, ощутимое последствие]
   Без него: [одна конкретная возможность, не абстрактная]

Обязательно завершить двумя блоками:
Новый код: «...» — точная личная формула взамен старой. Учитывает контекст человека, не шаблонная.
Действие сегодня: [одно физическое действие в течение 24 часов. Не «подумай», а сделай]

Правила:
— Обращайся лично, конкретно
— Формула и действие — самые важные части, не экономь на них
— Длина: 5–6 предложений. Только текст.`;

const PROMPT_PLAN = `Ты — практик трансформации The Money Flip. Составляешь 7-дневный план практики под конкретное убеждение.

Каждый день — одно конкретное микро-действие. Не темы — действия. Нарастают по глубине: дни 1–2 наблюдение, дни 3–5 практика, дни 6–7 закрепление.

Учитывай контекст (карьера/бизнес/семья/финансы) и то, что убеждение блокирует.

Формат строго:
День 1: [действие]
День 2: [действие]
День 3: [действие]
День 4: [действие]
День 5: [действие]
День 6: [действие]
День 7: [действие]

Правила:
— Каждое действие — одно предложение, конкретное и выполнимое за 10–30 минут
— Запрещено: «размышляй», «осознай» без конкретного задания
— Только план, без вводных слов и пояснений`;

/* ── Обработчик запроса ─────────────────────────────────── */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { belief, context, intensity, origin = '', obstacle = '' } = req.body;

  if (!belief || !context) {
    return res.status(400).json({ error: 'belief and context are required' });
  }

  try {
    const [master, battle, code, plan] = await Promise.all([
      askAI(buildMessages(PROMPT_MASTER, belief, context, intensity, origin, obstacle)),
      askAI(buildMessages(PROMPT_BATTLE, belief, context, intensity, origin, obstacle)),
      askAI(buildMessages(PROMPT_CODE,   belief, context, intensity, origin, obstacle)),
      askAI(buildMessages(PROMPT_PLAN,   belief, context, intensity, origin, obstacle)),
    ]);

    return res.status(200).json({ master, battle, code, plan });

  } catch (err) {
    console.error('Transform error:', err.message);
    return res.status(500).json({ error: 'AI недоступен. Попробуй ещё раз.' });
  }
}
