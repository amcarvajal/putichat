export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = JSON.parse(req.body);

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "2c8e954decbf70b7607a4414e5785ef9e4de4b8c51d50fb8b8b349160e0ef6bb", // Verifica que es correcta
      input: {
        prompt,
        width: 412,
        height: 568,
        guidance_scale: 7,
        num_inference_steps: 30,
        scheduler: "MultistepDPM-Solver", // o "MultistepDPM-Solver" o EulerA
      },
    }),
  });

  const prediction = await response.json();

  console.log('prediction::', prediction);

  if (prediction?.detail === "Authentication credentials were not provided.") {
    return res.status(401).json({ error: "Token inválido o ausente" });
  }

  if (!prediction.id) {
    return res.status(500).json({ error: "Error creando predicción" });
  }

  let finalResult = prediction;
  let attempts = 0;

  while (
    finalResult.status !== "succeeded" &&
    finalResult.status !== "failed" &&
    attempts < 20
  ) {
    await new Promise((r) => setTimeout(r, 2000)); // espera 2 segundos
    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${finalResult.id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    finalResult = await pollRes.json();
    attempts++;
  }

  if (finalResult.status === "succeeded") {
    const imageUrl = Array.isArray(finalResult.output)
      ? finalResult.output[0]
      : finalResult.output;

    return res.status(200).json({ imageUrl });
  } else {
    return res.status(500).json({ error: "Generación fallida o timeout" });
  }
}
