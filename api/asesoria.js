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
            content: "Eres Vindicat, un asistente de orientación sobre normas de tránsito en Colombia. Orientada con claridad sobre normas colombianas, comparendos, fotodetecciones, prescripciones y defensas jurídicas."
          },
          {
            role: "user",
            content: consulta
          }
        ]
      })
    });

    const data = await respuesta.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Error interno del servidor"
    });
  }
}
