export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: "Falta configurar la variable OPENAI_API_KEY en Vercel." 
    });
  }

  try {
    // Recogemos cualquier campo que el usuario envíe desde el formulario
    const { documento, placa, consulta } = req.body || {};

    // Si el usuario no envió nada, devolvemos el error controlado
    if (!documento && !placa && !consulta) {
      return res.status(400).json({
        error: "Por favor ingresa un número de documento, una placa o una consulta."
      });
    }

    const textoConsulta = consulta || `Analiza las multas y opciones de apelación para el documento o placa: ${documento || placa}`;

    const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres Vindicat, un asistente de tránsito en Colombia experto en fotomultas, prescripciones y defensas jurídicas."
          },
          {
            role: "user",
            content: textoConsulta
          }
        ]
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(respuesta.status).json({ 
        error: data.error?.message || "Error al comunicarse con OpenAI" 
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor: " + error.message
    });
  }
}
