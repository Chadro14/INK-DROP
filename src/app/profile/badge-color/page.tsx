'use client';

import React, { useState, useEffect } from 'react';

interface ColorOption {
  name: string;
  value: string; // Hex ou linear-gradient
}

export default function BadgeColorPage() {
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('gold');
  const [currentColor, setCurrentColor] = useState<string>('gold');
  const [isCertified, setIsCertified] = useState<boolean | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');

      // 1. Récupérer la liste des couleurs autorisées par NestJS
      const resColors = await fetch(`${baseUrl}/certification/colors`);
      if (resColors.ok) {
        const colorsData: ColorOption[] = await resColors.json();
        setColors(colorsData);
      }

      // 2. Récupérer le statut de l'utilisateur
      if (token) {
        const resStatus = await fetch(`${baseUrl}/certification/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resStatus.ok) {
          const statusData = await resStatus.json();
          setIsCertified(statusData.isCertified);
          if (statusData.badgeColor) {
            setSelectedColor(statusData.badgeColor);
            setCurrentColor(statusData.badgeColor);
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement :', err);
      setMessage({ type: 'error', text: 'Impossible de charger les données du serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté.');
      }

      // Envoi de la clé de la couleur (ex: "bleu", "sunset") au backend
      const response = await fetch(`${baseUrl}/certification/badge-color`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          badgeColor: selectedColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la mise à jour.');
      }

      setCurrentColor(selectedColor);
      setMessage({ type: 'success', text: 'Couleur du badge mise à jour avec succès !' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Une erreur est survenue.' });
    } finally {
      setSaving(false);
    }
  };

  // Trouver la valeur de style (CSS background) pour l'aperçu
  const getCssValue = (colorKey: string) => {
    const found = colors.find((c) => c.name === colorKey);
    return found ? found.value : '#FFD700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12 flex justify-center items-center">
      <div className="max-w-xl w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
        
        {/* Titre & Description */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Couleur de Badge</h1>
          <p className="text-gray-400 text-sm mt-2">
            Personnalisez l’apparence de votre badge de certification sur votre profil.
          </p>
        </div>

        {/* Message d'erreur / succès */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium mb-6 transition-all ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Avertissement si l'utilisateur n'est pas certifié */}
        {isCertified === false && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-sm mb-6">
            ⚠️ Vous n'êtes pas encore certifié. Vous devez remplir les conditions pour débloquer la personnalisation du badge.
          </div>
        )}

        {/* Aperçu du Badge */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-950/60 rounded-xl border border-gray-800/80 mb-8">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
            Aperçu en direct
          </span>

          <div className="flex items-center gap-3 bg-gray-900 px-4 py-2.5 rounded-full border border-gray-800 shadow-md">
            <span className="font-semibold text-sm">Votre Nom</span>
            {/* L'icône du badge avec la couleur sélectionnée */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-black font-bold shadow-sm transition-all duration-300"
              style={{ background: getCssValue(selectedColor) }}
            >
              ✓
            </div>
          </div>
        </div>

        {/* Grille des couleurs */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Choisissez une couleur :
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {colors.map((color) => {
              const isSelected = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  disabled={!isCertified}
                  onClick={() => setSelectedColor(color.name)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                      : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/60 hover:border-gray-700'
                  } ${!isCertified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className="w-6 h-6 rounded-full shrink-0 border border-white/10 shadow-sm"
                    style={{ background: color.value }}
                  />
                  <span className="text-xs font-medium capitalize truncate text-gray-200">
                    {color.name.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton d'enregistrement */}
        <button
          type="button"
          disabled={!isCertified || saving || selectedColor === currentColor}
          onClick={handleSave}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            !isCertified || selectedColor === currentColor
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-[0.98]'
          }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
              <span>Enregistrement...</span>
            </>
          ) : (
            <span>Enregistrer la couleur</span>
          )}
        </button>

      </div>
    </div>
  );
}
