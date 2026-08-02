export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { hecho, emocion, cuerpo } = req.body || {};
  if (!hecho || !emocion || !cuerpo) return res.status(400).json({ error: 'Faltan campos' });

  const escenario = "Estás en una reunión de seguimiento con tu jefe presente. Un colega de otro equipo dice, sin que se lo pidas: \"Creo que deberíamos haber consultado esto con nosotros antes de avanzar.\"";

  const prompt = `Eres el asistente de práctica del programa "Liderarme para poder liderar", fase "Me veo" (autoconciencia emocional).
Un participante acaba de aplicar la tríada detonante-emoción-cuerpo a esta situación:

Situación: "${escenario}"

Su respuesta:
- Hecho: ${hecho}
- Emoción: ${emocion}
- Sensación en el cuerpo: ${cuerpo}

Da retroalimentación breve (4-6 frases), en español, con un tono cálido, cercano y ejecutivo — nunca condescendiente, nunca como examen ni calificación.
Evalúa con honestidad pero constructivamente:
1) Si "el hecho" describe algo verificable o si ya incluye una interpretación disfrazada de hecho.
2) Si la emoción está nombrada con precisión (no vaga como "mal" o "raro").
3) Reconoce la sensación corporal que describió, sin inventar detalles que no dijo.
Cierra con una frase breve que conecte con la idea central del programa: el paso invisible entre lo que pasa y cómo respondemos. Responde en prosa, sin viñetas.`;

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
