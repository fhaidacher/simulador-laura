export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { contextDescription, conversation } = req.body || {};
  if (!contextDescription || !Array.isArray(conversation) || conversation.length === 0) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const systemInstruction = `Estás actuando como un personaje en un ejercicio de práctica de liderazgo. El personaje es: "${contextDescription}".
Responde SIEMPRE en primera persona, como si fueras esa persona real — nunca rompas el personaje, nunca des consejos de liderazgo, nunca menciones que eres una IA.
Sé realista: al inicio puedes sonar algo reservado, cauteloso o incluso un poco a la defensiva, como pasaría en la vida real. Si la persona que te habla hace preguntas abiertas, genuinas y sin acusar, ábrete gradualmente y comparte más. Si te habla de forma acusatoria o cerrada, mantente reservado.
Responde en 1-3 frases breves, en español, tono natural y conversacional — no un discurso largo.`;

  const transcript = conversation.map(m => (m.role === 'user' ? 'Otra persona: ' : 'Tú (el personaje): ') + m.content).join("\n");
  const prompt = `${systemInstruction}\n\nConversación hasta ahora (la otra persona te habla a ti):\n${transcript}\n\nResponde ahora como el personaje, a lo último que te dijeron.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Error al llamar a la API", detail: errText });
    }

    const data = await response.json();
    const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n\n");
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Error interno", detail: String(err) });
  }
}
