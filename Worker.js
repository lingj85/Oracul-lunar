
export default {
  async fetch(request, env) {
    const origin = "https://lingj85.github.io";
    const headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.headers.get("Origin") !== origin) {
      return Response.json(
        { error: "Origen no permitido." },
        { status: 403, headers }
      );
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Usa el método POST." },
        { status: 405, headers }
      );
    }

    if (!env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Falta configurar el secreto GEMINI_API_KEY." },
        { status: 500, headers }
      );
    }

    try {
      const body = await request.json();
      const question = body.question;
      const cards = body.cards;

      if (
        typeof question !== "string" ||
        !question.trim() ||
        question.length > 1000 ||
        !Array.isArray(cards) ||
        cards.length !== 3
      ) {
        return Response.json(
          { error: "Envía una pregunta y exactamente tres cartas." },
          { status: 400, headers }
        );
      }

      const prompt = `Eres la guía de Tarot de Oráculo Lunar.
Interpreta estas tres cartas en relación con la pregunta.
Explica cada carta, cómo se relacionan y ofrece una conclusión
amable, clara y reflexiva. El Tarot es una herramienta simbólica
de entretenimiento y reflexión, no una predicción segura.
No des consejos médicos o financieros.

Pregunta: ${question.trim()}

Cartas:
${cards.map((c, i) =>
  `${i + 1}. ${String(typeof c === "string" ? c : c.name || "Carta").slice(0, 100)}`
).join("\n")}`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.8
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Response.json(
          { error: "Gemini no pudo responder. Revisa el modelo y la cuota de la API." },
          { status: 502, headers }
        );
      }

      const interpretation = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("\n").trim();

      if (!interpretation) {
        return Response.json(
          { error: "Gemini no devolvió una interpretación." },
          { status: 502, headers }
        );
      }

      return Response.json({ interpretation }, { headers });
    } catch {
      return Response.json(
        { error: "No se pudo procesar la pregunta." },
        { status: 400, headers }
      );
    }
  }
};
