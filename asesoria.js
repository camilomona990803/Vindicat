const allowedTopics = new Set(["comparendo","fotodeteccion","prescripcion","embargo","derecho_peticion","otro"]);
function reply(res, code, data) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(code).json(data);
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return reply(res, 405, { error: "Método no permitido." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return reply(res, 503, { error: "La IA aún no está configurada. El administrador debe añadir OPENAI_API_KEY en las variables de entorno de Vercel." });
  }
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return reply(res, 400, { error: "Solicitud inválida." }); }
  }
  if (!body || typeof body !== "object") return reply(res, 400, { error: "Solicitud inválida." });
  const data = {
    topic: allowedTopics.has(body.topic) ? body.topic : "otro",
    entity: String(body.entity || "").slice(0, 250),
    date: String(body.date || "").slice(0, 30),
    notice: String(body.notice || "").slice(0, 250),
    facts: String(body.facts || "").trim().slice(0, 8000),
    docs: String(body.docs || "").slice(0, 2500)
  };
  if (data.facts.length < 20) return reply(res, 400, { error: "Describe los hechos con al menos 20 caracteres." });

  const prompt = `Eres un asistente de orientación jurídica informativa para Colombia, enfocado en derecho de tránsito y procedimientos administrativos. No eres abogado del usuario y no sustituyes asesoría profesional.
Reglas obligatorias:
- No inventes normas, artículos, sentencias, plazos, hechos ni resultados.
- Si no estás seguro de una norma o hace falta consultar fuente oficial, dilo expresamente y señala qué debe verificarse.
- Nunca concluyas que un comparendo es nulo, prescrito o debe eliminarse solo por el tiempo transcurrido o una regla automática.
- No prometas eliminar multas, embargos, reportes ni garantizar éxito.
- Distingue hechos confirmados, inferencias y preguntas pendientes.
- No solicites números completos de cédula, claves ni datos bancarios.
- Escribe en español claro, con pasos concretos y prudentes.
- Si procede un derecho de petición, crea un borrador usando solo los hechos aportados. Usa [ENTIDAD], [NOMBRE], [DOCUMENTO], [DIRECCIÓN/EMAIL], [FECHA] y marcadores donde falte información. Nunca inventes identidad, radicados ni pruebas.
- Incluye solicitudes numeradas, fundamentos generales que deban verificarse, anexos sugeridos, canal de respuesta y espacio de firma. No afirmes hechos no comprobados.
Devuelve únicamente JSON válido con "analysis" (texto con encabezados; máximo 1400 palabras) y "petition" (borrador apropiado o cadena vacía si no procede).
Datos:
Tipo: ${data.topic}
Entidad: ${data.entity || "No indicada"}
Fecha del hecho/comparendo: ${data.date || "No indicada"}
Notificación: ${data.notice || "No indicada"}
Hechos: ${data.facts}
Documentos/pruebas: ${data.docs || "No indicados"}`;

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 2400
      })
    });
    if (!r.ok) {
      console.error("OpenAI API status:", r.status);
      if (r.status === 401) return reply(res, 502, { error: "La clave configurada no fue aceptada. Revisa OPENAI_API_KEY en Vercel." });
      if (r.status === 429) return reply(res, 503, { error: "La IA está limitada o no tiene saldo. Revisa uso y facturación de la API." });
      return reply(res, 502, { error: "El proveedor de IA no pudo procesar la consulta. Inténtalo más tarde." });
    }
    const result = await r.json();
    const output = (result.output || []).flatMap(x => x.content || []).filter(x => x.type === "output_text").map(x => x.text).join("\n");
    let parsed;
    try { parsed = JSON.parse(output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }
    catch { return reply(res, 502, { error: "No se pudo interpretar la respuesta. Inténtalo de nuevo." }); }
    return reply(res, 200, {
      analysis: String(parsed.analysis || "").slice(0, 16000),
      petition: String(parsed.petition || "").slice(0, 16000),
      disclaimer: "Orientación informativa; verifica las normas y solicita revisión profesional cuando corresponda."
    });
  } catch (e) {
    console.error("AI request failed:", e?.message || "unknown");
    return reply(res, 500, { error: "Error de conexión al procesar la consulta." });
  }
}
