
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido"
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "La inteligencia artificial aún no está configurada."
    });
  }

  try {
    const { consulta, tipo, ciudad } = req.body || {};

    if (!consulta || typeof consulta !== "string") {
      return res.status(400).json({
        error: "Escribe tu consulta para continuar."
      });
    }

    const respuesta = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "Eres Vindicat, un asistente de orientación jurídica para Colombia. " +
            "Orienta con claridad sobre normas colombianas, especialmente tránsito, " +
            "comparendos, fotodetecciones, prescripción, embargos y derechos de petición. " +
            "No inventes leyes, fechas, sentencias ni plazos. Distingue orientación general " +
            "de asesoría profesional. Solicita los datos faltantes cuando sean necesarios. " +
            "No garantices resultados. Recomienda verificar el expediente y las fuentes oficiales. " +
            "Protege los datos personales y no solicites contraseñas.",
          input:
            "Tipo de caso: " + String(tipo || "Consulta general") +
            "\nCiudad o municipio: " + String(ciudad || "No indicado") +
            "\nConsulta del usuario: " + consulta
        })
      }
    );

    const data = await respuesta.json();

    if (!respuesta.ok) {
      console.error("Error del proveedor de IA:", data.error?.message);
      return res.status(502).json({
        error: "No fue posible generar la orientación. Intenta nuevamente."
      });
    }

    const texto = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({ respuesta: texto });
  } catch (error) {
    console.error("Error en asesoría:", error.message);
    return res.status(500).json({
      error: "Ocurrió un error. Intenta nuevamente."
    });
  }
}
