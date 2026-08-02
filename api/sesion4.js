const scenarios = {
  individual: {
    text: "Un colaborador hizo un comentario sarcástico sobre el trabajo de otro compañero, delante de todo el equipo.",
  },
  equipo: {
    text: "Tu equipo se va a fusionar con otro que tiene una forma de trabajar muy distinta, y ya hay tensión anticipada entre ambos grupos.",
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { mode, campo1, campo2, campo3 } = req.body || {};
  if (!mode || !scenarios[mode] || !campo1 || !campo2 || !campo3) {
    return res.status(400).json({ error: 'Faltan datos o el modo no es válido' });
  }

  const modeLabel = mode === 'individual'
    ? 'una conversación individual usando Situación-Conducta-Impacto'
    : 'una decisión de equipo usando Brújula de equipo';

  const evalInstruction = mode === 'individual'
    ? 'Evalúa si separó bien el hecho verificable de la conducta observable (sin etiquetas de carácter como "es irrespetuoso"), y si el impacto describe un efecto real, no un juicio.'
    : 'Evalúa si la pregunta propuesta realmente abre espacio al equipo (en vez de sonar a instrucción disfrazada de pregunta), y si la respuesta de Brújula de equipo considera la confianza colectiva, no solo la velocidad de resolver.';

  const prompt = `Eres el asistente de práctica del programa "Liderarme para poder liderar", fase "Los movilizo" (habilidad social). El participante está practicando ${modeLabel}.

Situación: "${scenarios[mode].text}"

Respuesta del participante:
- Campo 1: ${campo1}
- Campo 2: ${campo2}
- Campo 3: ${campo3}

Da retroalimentación breve (4-6 frases), en español, cálida y ejecutiva — nunca como examen.
${evalInstruction}
Cierra con una frase breve conectando con la idea de que una decisión bien tomada, mal comunicada, se convierte en un problema nuevo. Responde en prosa, sin viñetas.`;

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
