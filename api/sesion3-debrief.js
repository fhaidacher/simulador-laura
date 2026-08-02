export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { contextDescription, conversation } = req.body || {};
  if (!contextDescription || !Array.isArray(conversation) || conversation.length === 0) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const transcript = conversation.map(m => (m.role === 'user' ? 'Participante: ' : 'Contraparte: ') + m.content).join("\n");

  const prompt = `Eres el asistente de práctica del programa "Liderarme para poder liderar", fase "Los leo" (empatía cognitiva). Un participante acaba de practicar una conversación aplicando el sistema Lo veo → Lo pregunto → Lo confirmo con una contraparte simulada (descrita como: "${contextDescription}").

Transcripción de la práctica:
${transcript}

Da retroalimentación breve (4-6 frases), en español, cálida y constructiva, nunca como examen. Evalúa: ¿describió conductas observables sin juzgar (Lo veo)? ¿hizo preguntas abiertas en vez de asumir (Lo pregunto)? ¿confirmó lo que escuchó antes de asumir que ya entendía todo (Lo confirmo)? Cierra con una frase breve conectando con la idea de que leer bien a otro empieza por notar antes de interpretar. Responde en prosa, sin viñetas.`;

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
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Error al llamar a la API", detail: errText });
    }

    const data = await response.json();
    const feedback = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n\n");
    return res.status(200).json({ feedback });
  } catch (err) {
    return res.status(500).json({ error: "Error interno", detail: String(err) });
  }
}
