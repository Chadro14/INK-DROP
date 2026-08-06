import { useState } from 'react';

export default function UploadChapterForm({ mangaId, token }) {
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');

  const [pdf, setPdf] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://TON_URL_VERCEL'; // ⚠️ Remplace par ton URL Vercel réelle

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Préparer la liste des noms de fichiers
      const filesArray = Array.from(images);
      const filenames = filesArray.map((file) => file.name);

      if (pdf) {
        filenames.push(pdf.name);
      }

      if (filenames.length === 0) {
        alert('Veuillez sélectionner au moins une image ou un fichier PDF.');
        setLoading(false);
        return;
      }

      // 2. Demander les URLs d'upload signées au Backend
      const urlsResponse = await fetch(`${API_BASE_URL}/mangas/${mangaId}/chapters/upload-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ filenames }),
      });

      if (!urlsResponse.ok) {
        throw new Error('Erreur lors de la récupération des URLs de téléversement.');
      }

      const uploadData = await urlsResponse.json(); // Ex: [{ filename, uploadUrl, key }, ...]

      // 3. Téléverser chaque fichier directement sur Supabase Storage
      const uploadedKeys = [];

      for (const file of filesArray) {
        const target = uploadData.find((item) => item.filename === file.name);
        if (target) {
          await fetch(target.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          uploadedKeys.push(target.key);
        }
      }

      let pdfKey = null;
      if (pdf) {
        const targetPdf = uploadData.find((item) => item.filename === pdf.name);
        if (targetPdf) {
          await fetch(targetPdf.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': pdf.type },
            body: pdf,
          });
          pdfKey = targetPdf.key;
        }
      }

      // 4. Finaliser la création du chapitre en JSON
      const payload = {
        number: Number(number),
        title: title.trim() || undefined,
        isFree: Boolean(isFree),
        price: isFree ? 0 : Number(price),
        imagesUrls: uploadedKeys.length > 0 ? uploadedKeys : undefined,
        pdfUrl: pdfKey || undefined,
      };

      const finalizeResponse = await fetch(`${API_BASE_URL}/mangas/${mangaId}/chapters/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (finalizeResponse.ok) {
        alert('Chapitre créé et publié avec succès !');
      } else {
        const errData = await finalizeResponse.json();
        alert(`Erreur : ${errData.message || 'Création échouée'}`);
      }
    } catch (error) {
      console.error('Erreur téléversement:', error);
      alert('Une erreur s’est produite lors du téléversement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        type="text"
        placeholder="Titre du chapitre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Numéro du chapitre"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        required
      />

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
        />
        Chapitre gratuit ?
      </label>

      {!isFree && (
        <input
          type="number"
          placeholder="Prix"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      )}

      <div>
        <label>PDF du chapitre (optionnel) :</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files[0] || null)}
        />
      </div>

      <div>
        <label>Images des pages (optionnel) :</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Téléversement en cours...' : 'Publier le chapitre'}
      </button>
    </form>
  );
}
