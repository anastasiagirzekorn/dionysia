const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 1800;
const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

// ── Protection against bots flooding the chat ──
// Limits per visitor (by IP address). Counted in the server's memory, so it is a
// "best effort" guard: it stops floods and scripts, normal visitors never notice it.
const LIMIT_PER_MINUTE = 8;
const LIMIT_PER_HOUR = 60;
const hits = new Map(); // ip -> array of timestamps (ms)

// Only the Dionysia website may use this chat (plus Vercel previews and local testing).
const ALLOWED_HOSTS = ['dionysia.wine', 'www.dionysia.wine', 'localhost', '127.0.0.1'];
const isAllowedOrigin = (req) => {
  const src = req.headers.origin || req.headers.referer || '';
  if (!src) return false;
  try {
    const host = new URL(src).hostname;
    return ALLOWED_HOSTS.includes(host) || host.endsWith('.vercel.app');
  } catch (e) { return false; }
};

const clientIp = (req) =>
  String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0].trim();

// Returns true if this visitor is over the limit; otherwise records the request.
const tooMany = (ip) => {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 3600_000);
  const lastMinute = list.filter(t => now - t < 60_000).length;
  if (lastMinute >= LIMIT_PER_MINUTE || list.length >= LIMIT_PER_HOUR) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) { // keep memory small
    for (const [k, v] of hits) { if (!v.length || now - v[v.length - 1] > 3600_000) hits.delete(k); }
  }
  return false;
};

const BUSY = {
  en: "You're asking faster than I can pour 🍷 Please wait a minute and try again.",
  ua: 'Ви питаєте швидше, ніж я встигаю наливати 🍷 Зачекайте хвилинку і спробуйте ще раз.',
};

const buildPrompt = (lang) => `You are Dionysia, an elegant wine travel assistant. Help travelers discover wine regions, routes, wineries, and tasting experiences worldwide. Be warm, sophisticated, specific. Stay on the topic of wine, food, travel and related culture; politely decline unrelated requests.

LANGUAGE RULES (very important):
- Reply in the same language the user writes in (English, Ukrainian, Czech, Croatian, French, Italian, Portuguese, Spanish, German, Polish, etc.).
- NEVER reply in Russian, under any circumstances. If the user writes in Russian, reply in Ukrainian.
- If the user's language is unclear, or the text is in Cyrillic script, reply in Ukrainian.
- ${lang === 'ua'
  ? 'The website interface is set to Ukrainian, so default to Ukrainian unless the user clearly writes in another language (other than Russian).'
  : 'The website interface is set to English, so default to English unless the user clearly writes in another language.'}

STYLE:
- Keep answers concise: under about 250 words. Exception: when asked to plan a trip or route, give a day-by-day itinerary (up to about 450 words) with a short heading line per day in **bold**, specific wineries and places, what to eat, and practical tips (booking ahead, transport).
- You may use short paragraphs, **bold** for key names, and short "- " bullet lists. Do not use tables or headings.
- Do not address the user by any name, and never invent facts about them.
- Be honest about uncertainty (opening hours, prices, availability change — suggest checking with the winery).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = req.body || {};
    const lang = body.lang === 'ua' ? 'ua' : 'en';

    if (tooMany(clientIp(req))) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Too many requests', content: [{ type: 'text', text: BUSY[lang] }] });
    }

    let messages = Array.isArray(body.messages) ? body.messages : [];
    messages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_MESSAGES)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    // API requires the conversation to start with a user message
    while (messages.length && messages[0].role !== 'user') messages.shift();
    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Invalid messages' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildPrompt(lang),
        messages,
      }),
    });

    const data = await response.json();

    // Extract only text blocks (skip thinking blocks)
    if (data.content && Array.isArray(data.content)) {
      const textBlock = data.content.find(block => block.type === 'text');
      if (textBlock) {
        data.content = [{ type: 'text', text: textBlock.text }];
      }
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
