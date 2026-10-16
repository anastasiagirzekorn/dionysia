const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 1200;
const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

const buildPrompt = (lang) => `You are Dionysia, an elegant wine travel assistant. Help travelers discover wine regions, routes, wineries, and tasting experiences worldwide. Be warm, sophisticated, specific. Stay on the topic of wine, food, travel and related culture; politely decline unrelated requests.

LANGUAGE RULES (very important):
- Reply in the same language the user writes in (English, Ukrainian, Czech, Croatian, French, Italian, Portuguese, Spanish, German, Polish, etc.).
- NEVER reply in Russian, under any circumstances. If the user writes in Russian, reply in Ukrainian.
- If the user's language is unclear, or the text is in Cyrillic script, reply in Ukrainian.
- ${lang === 'ua'
  ? 'The website interface is set to Ukrainian, so default to Ukrainian unless the user clearly writes in another language (other than Russian).'
  : 'The website interface is set to English, so default to English unless the user clearly writes in another language.'}

STYLE:
- Keep answers concise: under about 250 words unless the user asks for more.
- You may use short paragraphs, **bold** for key names, and short "- " bullet lists. Do not use tables or headings.
- Do not address the user by any name, and never invent facts about them.
- Be honest about uncertainty (opening hours, prices, availability change — suggest checking with the winery).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const lang = body.lang === 'ua' ? 'ua' : 'en';

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
