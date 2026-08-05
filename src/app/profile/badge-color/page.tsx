'use client';

import { useState } from 'react';
import CertifiedBadge from '@/components/CertifiedBadge';

const BADGE_COLORS = [
  { name: 'Or Impérial', hex: '#FFD700' },
  { name: 'Bleu Électrique', hex: '#2563EB' },
  { name: 'Rouge Néon', hex: '#FF3366' },
  { name: 'Vert Émeraude', hex: '#00F5A0' },
  { name: 'Violet Cyber', hex: '#8B5CF6' },
  { name: 'Cyan Néon', hex: '#00F2FE' },
  { name: 'Rose Sakouras', hex: '#FF70A6' },
  { name: 'Orange Flamme', hex: '#FF5722' },
  { name: 'Argent Métal', hex: '#C0C0C0' },
  { name: 'Noir Sombre', hex: '#111827' },
];

export default function BadgeColorPage() {
  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // À remplacer par les données de ton utilisateur / AuthContext si nécessaire
  const username = "Altesse";

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    // 1. Récupération du token JWT
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setMessage('Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    // 2. Normalisation de l'URL Backend (127.0.0.1 par défaut pour éviter les conflits IPv6)
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    const baseUrl = rawUrl.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/users/badge-color`;

    try {
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ badgeColor: selectedColor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      setMessage('Couleur du badge enregistrée avec succès !');
    } catch (err: any) {
      console.error(`[BadgeColor] Échec de la requête vers : ${targetUrl}`, err);
      setMessage(err.message || 'Impossible de contacter le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Personnaliser ton Badge Certifié</h1>
        <p className="text-gray-400 text-sm mt-1">
          Choisis la couleur qui s'affichera à côté de ton pseudo dans l'application.
        </p>
      </div>

      {/* PRÉVISUALISATION EN DIRECT */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-center space-y-3">
        <span className="text-xs text-gray-500 uppercase tracking-widest block">Aperçu en direct</span>
        <div className="flex items-center justify-center gap-2 text-xl font-bold text-white">
          <span>{username}</span>
          <CertifiedBadge color={selectedColor} size={22} />
        </div>
      </div>

      {/* SÉLECTEUR DE COULEURS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {BADGE_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            onClick={() => setSelectedColor(c.hex)}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
              selectedColor === c.hex
                ? 'border-white bg-gray-800 scale-105'
                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
            }`}
          >
            <span
              className="w-8 h-8 rounded-full shadow-inner"
              style={{ backgroundColor: c.hex }}
            />
            <span className="text-xs font-medium text-gray-300">{c.name}</span>
          </button>
        ))}
      </div>

      {/* BOUTON D'ENREGISTREMENT */}
      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Enregistrement...' : 'Valider cette couleur'}
      </button>

      {message && (
        <p className={`text-center text-sm ${message.includes('succès') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
