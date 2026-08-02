export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { abierto, ciego, oculto, desconocido } = req.body || {};
  if (!abierto || !ciego || !oculto) return res.status(400).json({ error: 'Faltan campos' });

  const prompt = `Eres el asistente de práctica del programa "Liderarme para poder liderar", fase "Me veo". Un participante completó su Ventana de Johari sobre un momento de tensión reciente:

- Abierto (lo visible para todos): ${abierto}
- Ciego (lo que otros podrían notar que él/ella no nota): ${ciego}
- Oculto (lo que sintió y decidió no mostrar): ${oculto}
- Desconocido (lo que escribió, puede estar vacío): ${desconocido || "(no escribió nada aquí)"}

Da una reflexión breve (4-6 frases), en español, cálida, curiosa y nunca directiva ni clínica. NO diagnostiques ni afirmes con certeza qué le pasa a la persona.
Tu tarea principal: ofrece, con humildad y como una posibilidad a considerar (no una afirmación), una conexión o patrón que podría conectar lo "oculto" y lo "ciego" y que apunte hacia el cuadrante desconocido — algo que la persona podría no haber visto todavía, formulado como pregunta abierta o hipótesis suave, nunca como una etiqueta fija.
Si el campo "desconocido" ya tiene contenido, reconócelo y añade una pregunta que lo profundice, en vez de repetirlo.
Cierra con una frase que invite a seguir observando este patrón en los próximos días, sin presión. Responde en prosa, sin viñetas.`;

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
