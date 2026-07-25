import { useState } from 'react';

export default function UploadChapterForm({ mangaId, token }) {
  // 1. États pour le texte
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');

  // 2. États pour les fichiers
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 3. Initialisation du FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('number', number);
    formData.append('isFree', isFree);
    if (!isFree) formData.append('price', price);

    // 4. Ajout des fichiers uniques
    if (pdf) formData.append('pdf', pdf);
    if (cover) formData.append('cover', cover);

    // 5. Ajout des fichiers multiples (images)
    Array.from(images).forEach((image) => {
      formData.append('images', image);
    });

    try {
      // 6. Envoi à ton API Vercel
      const response = await fetch(`https://TON_URL_VERCEL/mangas/${mangaId}/chapters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Nécessaire pour req.user.id côté backend
          // ⚠️ Surtout pas de 'Content-Type': 'multipart/form-data', le navigateur le génère automatiquement avec le bon "boundary"
        },
        body: formData,
      });

      if (response.ok) {
        alert('Chapitre créé avec succès !');
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input type="text" placeholder="Titre" onChange={(e) => setTitle(e.target.value)} required />
      <input type="number" placeholder="Numéro du chapitre" onChange={(e) => setNumber(e.target.value)} required />
      
      <label>
        Gratuit ?
        <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
      </label>
      
      {!isFree && (
        <input type="number" placeholder="Prix" onChange={(e) => setPrice(e.target.value)} required />
      )}

      <div>
        <label>PDF du chapitre :</label>
        <input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />
      </div>

      <div>
        <label>Images (Pages) :</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setImages(e.target.files)} />
      </div>

      <div>
        <label>Couverture du chapitre :</label>
        <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} />
      </div>

      <button type="submit">Publier le chapitre</button>
    </form>
  );
}
