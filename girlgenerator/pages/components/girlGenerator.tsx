'use client';
import { useState } from 'react';
import styles from '../../styles/imageGenerator.module.css'

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState(
    'a stunning young woman, realistic, naked and ultra detailed, natural lighting, 35mm DSLR, full body, perfect skin, cinematic lighting'
  );
//   a stunning young woman with recognizable Down syndrome, realistic, with some little tattoos, naked and ultra detailed, natural lighting, 35mm DSLR, full body, perfect skin, cinematic lighting
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setImageUrl('');
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setImageUrl(data.imageUrl);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1>Generador de putis</h1>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Escribe tu prompt..."
        className={styles.promptInput}
      />

      <button onClick={generate} className={styles.generateButton}>
        Generar
      </button>

      {loading && <div className={styles.loader}>Generando imagen...</div>}

      {imageUrl && (
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt="Imagen generada" />
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
