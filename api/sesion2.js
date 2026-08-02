export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { radar, pausa, brujula } = req.body || {};
  if (!radar || !pausa || !brujula) return res.status(400).json({ error: 'Faltan campos' });

  const escenario = "Un colega responde un correo tuyo cuestionando una decisión que tomaste la semana pasada — y copia a tu jefe.";

  const prompt = `Eres el asistente de práctica del programa "Liderarme para poder liderar", fase "Me regulo" (autorregulación).
Situación: "${escenario}"

Respuesta del participante:
- Radar (qué notaría en su cuerpo): ${radar}
- PAUSA (cómo se frenaría): ${pausa}
- Brújula (qué respondería): ${brujula}

Da retroalimentación breve (4-6 frases), en español, cálida y ejecutiva — nunca como examen ni calificación.
Evalúa con honestidad: 1) si Radar describe una sensación/impulso real o se queda vago; 2) si PAUSA es una acción concreta y realista, no solo "respirar" sin más; 3) si Brújula es firme sin ser hostil, y si piensa en la relación además de en tener razón.
Recuerda: regular no es reprimir — si la respuesta suena a "tragarse todo", señálalo con amabilidad.
Cierra con una frase breve conectando con la idea de que Laura tampoco lo hizo perfecto — solo mejor. Responde en prosa, sin viñetas.`;

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
