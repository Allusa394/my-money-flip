/* ═══════════════════════════════════════════════════════════
   THE MONEY FLIP — script.js
   ═══════════════════════════════════════════════════════════ */

/* ── Mobile menu ────────────────────────────────────────── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn  = document.getElementById('hamburger');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Header scroll ──────────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.querySelector('.site-header')
    .classList.toggle('scrolled', window.scrollY > 40);

  document.getElementById('back-to-top')
    .classList.toggle('visible', window.scrollY > 300);
});

/* ── Back to top ────────────────────────────────────────── */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Belief tag click ───────────────────────────────────── */
function fillBelief(tagBtn) {
  document.getElementById('belief').value = tagBtn.textContent;
  document.getElementById('belief').focus();
}

/* ── Slider ─────────────────────────────────────────────── */
const slider    = document.getElementById('intensity');
const sliderVal = document.getElementById('slider-val');

const sliderZones = [
  { min: 1,  max: 3,  label: 'Мягкий рефрейм — бережный взгляд под другим углом' },
  { min: 4,  max: 6,  label: 'Мостовой рефрейм — шаг от старого к новому' },
  { min: 7,  max: 10, label: 'Глубокая работа — переписываем программу с нуля' },
];

function updateSlider() {
  const val = parseInt(slider.value);
  const pct = ((val - 1) / 9) * 100;
  slider.style.setProperty('--pct', pct + '%');
  sliderVal.textContent = val;

  const zone = sliderZones.find(z => val >= z.min && val <= z.max);
  const zoneEl = document.getElementById('slider-zone');
  if (zoneEl) zoneEl.textContent = zone ? zone.label : '';
}
slider.addEventListener('input', updateSlider);
updateSlider();

/* ── Counters ───────────────────────────────────────────── */
function animateCounter(el, target, duration = 1600) {
  const start  = performance.now();
  const suffix = el.dataset.suffix || '';
  const isLarge = target > 100;

  (function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const value    = Math.round(ease * target);
    el.textContent = isLarge
      ? value.toLocaleString('ru-RU') + '+'
      : value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  })(start);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      // Only animate large numbers; set small ones instantly
      if (target > 100) {
        animateCounter(el, target);
      } else {
        const suffix = el.dataset.suffix || '';
        el.textContent = target + suffix;
      }
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ── Typewriter ─────────────────────────────────────────── */
function typewrite(el, text, speed = 16) {
  return new Promise(resolve => {
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed + Math.random() * 9);
      } else {
        el.classList.remove('typing');
        resolve();
      }
    };
    tick();
  });
}

/* ── Show result card ───────────────────────────────────── */
async function showCard(id, text, delay = 0) {
  if (delay) await new Promise(r => setTimeout(r, delay));
  const card = document.getElementById(id);
  const body = document.getElementById(id + '-body');
  card.style.display = '';
  await new Promise(r => setTimeout(r, 40));
  card.classList.add('visible');
  typewrite(body, text); // runs independently
}

/* ── Loading animation ──────────────────────────────────── */
const loadingMessages = [
  'Считываем убеждение...',
  'Подбираем стратегию...',
  'Готовим три ракурса...',
];
let loadingInterval = null;

function startLoadingAnimation(btn) {
  let i = 0;
  const textEl = btn.querySelector('.loader-text');
  textEl.textContent = loadingMessages[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % loadingMessages.length;
    textEl.textContent = loadingMessages[i];
  }, 600);
}

function stopLoadingAnimation() {
  if (loadingInterval) { clearInterval(loadingInterval); loadingInterval = null; }
}

/* ── Mock responses ─────────────────────────────────────── */
// Блок 1: Ракурс Мастера — Переопределение + Намерение
const mockMaster = {
  work: [
    "Это убеждение когда-то защищало тебя от разочарования. Оно говорит: я честный человек, не хочу обещать лишнего. Хорошая новость — за этой мыслью живёт уважение к труду. А что если труд и большой доход — не противоречие, а просто два разных маршрута к одному месту? Ты уже умеешь работать. Теперь можно научиться работать иначе. Я создаю ценность — и получаю вознаграждение, соответствующее этой ценности.",
    "За этим убеждением — желание быть справедливым. Ты не хочешь брать больше, чем заслужил. Но посмотри с другой стороны: «только» — это ограничитель, который ты поставил на входе сам. Реальность шире: деньги приходят туда, где есть усилие, умение и разрешение себе получать. Ты уже умеешь первые два. Третье — вопрос решения.",
  ],
  business: [
    "Это убеждение охраняло тебя от провала. Осторожность — ценный инстинкт. Теперь посмотри чуть дальше: что если риск — это просто плата за вход на другой уровень? Каждый бизнес, который ты видишь вокруг, когда-то сделал этот шаг. Риск — не угроза. Это инвестиция. Я вижу возможности там, где раньше видел только угрозы.",
    "За этим убеждением — желание защитить то, что уже есть. Это мудрость. Но «стабильность» и «рост» — не противоположности. Посмотри иначе: каждый день без движения — тоже выбор, и у него тоже есть цена. Я строю устойчивый рост — по одному шагу, без лишнего риска.",
  ],
  family: [
    "Это убеждение пыталось сохранить близость. Оно боялось, что деньги изменят отношения. За ним — глубокая любовь. А что если посмотреть иначе: когда ты процветаешь — ты можешь дать больше. Больше времени, больше выбора, больше спокойствия. Мой успех — это ресурс для тех, кого я люблю.",
    "За этой мыслью — страх потерять тепло, которое есть сейчас. Это понятно. Но ограничение в деньгах не делает отношения теплее — оно создаёт напряжение. Посмотри шире: финансовое спокойствие освобождает место для настоящей близости. Я забочусь о близких — и это включает финансовую заботу о нас.",
    "Это убеждение возникло, чтобы объяснить, почему денег нет. Теперь оно удерживает от того, чтобы они появились. Намерение было хорошим — защитить семью от жадности. Но результат обратный. Посмотри: достаток в семье — это не угроза. Это почва для роста каждого. Деньги в нашей семье — инструмент заботы, а не источник конфликта.",
  ],
  personal: [
    "Это убеждение когда-то оберегало тебя от боли потери. Оно говорило: лучше не пробовать, чем ошибиться. Посмотри на это как на заботу о себе — в то время это работало. Теперь контекст изменился. Ты уже принимаешь финансовые решения каждый день. Вопрос только в масштабе. Я позволяю себе получать столько, сколько создаю.",
    "За этим убеждением — желание быть скромным, не выделяться. Это культурный след, не приговор. Посмотри шире: деньги — это просто инструмент. Ты уже используешь инструменты каждый день. Я управляю деньгами осознанно — каждое решение работает на мою свободу.",
  ],
};

// Блок 2: Тест на прочность — Применение к себе + Противоположный пример
const mockBattle = {
  work: [
    "Подожди. Убеждение говорит: большие деньги = тяжёлый труд. Значит, самые богатые — самые измотанные? Посмотри на Forbes. Там нет людей, которые просто «больше устали». Там — люди, которые выстроили системы. Убеждение не выдерживает проверки на себе. Так что ты на самом деле защищаешь этой мыслью?",
    "Вот противоположный пример: художник пишет одну картину — и продаёт её дороже, чем рабочий зарабатывает за год. Один консультант проводит час разговора — и получает больше, чем за неделю «тяжёлой» работы. Твоё убеждение — это модель, а не закон природы. Какую модель ты выберешь теперь?",
  ],
  business: [
    "Интересно. Применим убеждение к нему самому: если «риск всегда плохо» — как тогда появился тот бизнес, которым ты восхищаешься? Как появился продукт, которым ты пользуешься каждый день? Убеждение уничтожает само себя. Риск — это не враг. Это цена за то, чтобы играть в другую игру.",
    "Противоположный пример: каждое «нет» риску — это тоже риск. Риск остаться там же через 5 лет. Риск упустить момент. Нерешённость стоит дороже провала — просто этот счёт приходит позже. Что конкретно ты уже потерял, не рискнув вовремя?",
  ],
  family: [
    "Применим это убеждение к себе: если деньги разрушают близость — почему финансовые трудности входят в тройку главных причин разводов? Убеждение работает против того, что пытается защитить. Бедность не сохраняет любовь. Она создаёт напряжение. Что ты на самом деле хочешь защитить — и как финансовое спокойствие может в этом помочь?",
    "Противоположный пример: найди семью, где деньги есть, а любви нет. И найди семью, где денег нет, а напряжение не накапливается. Первых много, вторых почти нет. Убеждение — это иллюзия. Деньги не портят отношения. Их отсутствие — портит. Какую версию семьи ты выбираешь строить?",
    "Проверь это на себе: ты сейчас избегаешь зарабатывать больше — ради каких отношений? Стали ли они лучше от этого ограничения? Скорее всего, нет. Убеждение не выполняет своё обещание. Оно лишь создаёт видимость безопасности. Что изменится, если ты разрешишь себе процветать?",
  ],
  personal: [
    "Проверим убеждение фактом: ты уже управляешь деньгами — каждый день. Оплачиваешь счета, делаешь покупки, принимаешь решения. Ты уже управляешь финансами. Вопрос не «умею или нет» — а «на каком уровне играю». Что изменится, если поднять уровень на один шаг?",
    "Противоположный пример: назови одного честного человека, у которого есть деньги. Одного. Нашёл? Всё. Убеждение разрушено одним примером. Честность и достаток — не антонимы. Это вообще разные оси. Что ты будешь делать с этим знанием прямо сейчас?",
  ],
};

// Блок 3: Код Новой Реальности — Иерархия критериев + Изменение размера фрейма
const mockCode = {
  work: [
    "Что важнее для тебя, чем это убеждение? Свобода. Время с семьёй. Выбор. Через 5 лет с этой программой — те же рамки, то же место. Через 5 лет без неё — другая игра. Твой новый код: «Мои навыки создают ценность, которая вознаграждается справедливо — я называю свою цену уверенно». Первый шаг сегодня: найди рыночную ставку для своей роли. Просто цифры. Знать — уже действие.",
    "Выше этого убеждения — твоя энергия и твои возможности. Сохрани его — и через 5 лет ты будешь объяснять другим, почему «так не бывает». Замени сейчас — и через 5 лет у тебя будет другой разговор. Новый код: «Я работаю умно: каждый час моего времени стоит больше, чем вчера». Действие: запиши одно умение, за которое можно просить на 20% больше прямо сейчас.",
  ],
  business: [
    "Что важнее страха? Влияние. Рост. То, что ты хочешь создать. Через 5 лет с этим убеждением — те же ограничения, та же точка. Через 5 лет без него — другая игра. Твой новый код: «Я вижу возможности там, где другие видят угрозы — это моё конкурентное преимущество». Действие прямо сейчас: запиши одно решение, которое откладывал. Назначь конкретную дату — не «когда-нибудь».",
    "Выше риска — то, что ты хочешь построить. Иерархия простая: рост важнее комфорта сегодня. Посмотри через 10 лет: ты будешь сожалеть о том, что не попробовал, или о том, что попробовал и ошибся? Статистика говорит: о первом. Новый код: «Каждый шаг вперёд — это данные, не приговор». Действие: назначь один разговор с потенциальным клиентом или партнёром на этой неделе.",
  ],
  family: [
    "Что важнее этого убеждения? Безопасность близких. Их возможности. Твоё спокойствие. Через 5 лет с этой программой — те же ограничения, та же тревога о деньгах. Без неё — другой разговор за столом. Твой новый код: «Моё процветание — это подарок семье, а не угроза ей». Действие сегодня вечером: скажи одному близкому об одной финансовой цели, которая важна для вас обоих.",
    "Выше этого убеждения — спокойствие в семье и возможности для детей. Посмотри через 10 лет: какую модель отношений с деньгами ты хочешь передать? Ту, где денег избегают? Или ту, где ими управляют уверенно? Новый код: «Я строю финансовую культуру семьи — осознанно и с любовью». Действие: поговори о деньгах с близким без тревоги — просто как о ресурсе.",
    "Что важнее страха? Уверенность, которую ты хочешь дать семье. Убеждение уже не защищает — оно ограничивает. Посмотри: финансовая свобода не разрушает семью. Она убирает один из главных источников напряжения. Твой новый код: «Деньги в нашей семье — инструмент заботы. Чем их больше — тем больше я могу дать». Действие: определи одну финансовую цель ради семьи. Запиши её сегодня.",
  ],
  personal: [
    "Что важнее этого убеждения? Уверенность. Выбор. Время. Через 5 лет с этой программой — та же тревога, те же рамки. Без неё — другой уровень. Твой новый код: «Я управляю деньгами осознанно — каждое решение приближает меня к свободе». Первый шаг прямо сейчас: открой заметки, напиши одну финансовую цель на 90 дней. С конкретной суммой. Одну.",
    "Выше этого убеждения — твоя свобода и спокойствие. Через 5 лет с ним — те же паттерны. Через 5 лет без него — другие возможности. Твой новый код: «Я достоин инвестировать в себя — каждый рубль, вложенный в развитие, возвращается многократно». Действие: определи одну инвестицию в себя, которую откладывал. Сделай первый шаг — хотя бы запись в календаре.",
  ],
};

function pick(source, ctx) {
  const arr = source[ctx] || source.personal;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ── Reset form ─────────────────────────────────────────── */
function resetForm() {
  ['card1','card2','card3'].forEach(id => {
    const c = document.getElementById(id);
    c.classList.remove('visible');
    setTimeout(() => {
      c.style.display = 'none';
      document.getElementById(id + '-body').textContent = '';
    }, 450);
  });
  document.getElementById('results-header').classList.remove('visible');
  document.getElementById('belief-echo').style.display = 'none';
  document.getElementById('empty-state').style.display = '';
  document.getElementById('post-ctas').style.display = 'none';
  document.getElementById('belief').value = '';
  document.getElementById('context').value = '';
  slider.value = 5; updateSlider();
  window.scrollTo({ top: document.getElementById('tool').offsetTop - 80, behavior: 'smooth' });
}

/* ── Copy best (Card 3 — Код Новой Реальности) ──────────── */
function copyBest(btn) {
  const codeBody = document.getElementById('card3-body').textContent;
  if (!codeBody) return;
  navigator.clipboard.writeText(codeBody).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Скопировано!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => {});
}

/* ── Copy individual card ───────────────────────────────── */
function copyCard(bodyId, btn) {
  const text = document.getElementById(bodyId).textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => {});
}

/* ── Main transform ─────────────────────────────────────── */
async function runTransform() {
  const beliefEl  = document.getElementById('belief');
  const contextEl = document.getElementById('context');
  const belief    = beliefEl.value.trim();
  const context   = contextEl.value;
  const btn       = document.getElementById('transform-btn');

  // Validation
  if (!belief) {
    beliefEl.classList.add('error');
    beliefEl.focus();
    beliefEl.placeholder = '← Опиши убеждение, чтобы начать трансформацию';
    setTimeout(() => {
      beliefEl.classList.remove('error');
      beliefEl.placeholder = 'Например: «Деньги достаются только тяжёлым трудом»\nили «Я не заслуживаю большого дохода»';
    }, 2000);
    return;
  }
  if (!context) {
    contextEl.classList.add('error');
    setTimeout(() => contextEl.classList.remove('error'), 2000);
    return;
  }

  // Loading
  btn.classList.add('loading');
  startLoadingAnimation(btn);
  document.getElementById('post-ctas').style.display = 'none';

  // Hide previous
  ['card1','card2','card3'].forEach(id => {
    const c = document.getElementById(id);
    c.classList.remove('visible');
    c.style.display = 'none';
    document.getElementById(id + '-body').textContent = '';
  });
  document.getElementById('belief-echo').style.display = 'none';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('results-header').classList.add('visible');

  // Real API call
  let masterText, battleText, codeText;
  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ belief, context, intensity: slider.value }),
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    masterText = data.master;
    battleText = data.battle;
    codeText   = data.code;

  } catch (err) {
    // Fallback to mock if API unavailable
    console.warn('API недоступен, используем mock:', err.message);
    masterText = pick(mockMaster, context);
    battleText = pick(mockBattle, context);
    codeText   = pick(mockCode,   context);
  }

  stopLoadingAnimation();
  btn.classList.remove('loading');

  // Show belief echo
  const echoEl = document.getElementById('belief-echo');
  document.getElementById('belief-echo-text').textContent = '«' + belief + '»';
  echoEl.style.display = '';

  // Show 3 cards with stagger
  showCard('card1', masterText, 0);
  showCard('card2', battleText, 200);
  showCard('card3', codeText,   400);

  // Show post CTAs after cards appear
  setTimeout(() => {
    const ctas = document.getElementById('post-ctas');
    ctas.style.display = 'flex';
    ctas.style.opacity = '0';
    ctas.style.transition = 'opacity 0.4s';
    setTimeout(() => { ctas.style.opacity = '1'; }, 50);
  }, 1200);

  // Scroll to results
  setTimeout(() => {
    document.getElementById('card1').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 300);
}

/* ── Contact form ───────────────────────────────────────── */
function submitContact(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const msg  = document.getElementById('success-msg');
  form.style.display = 'none';
  msg.classList.add('show');
}

/* ── Keyboard shortcut ──────────────────────────────────── */
document.getElementById('belief').addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runTransform();
});

/* ── Section fade-in on scroll ──────────────────────────── */
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.how-card, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  sectionObserver.observe(el);
});
