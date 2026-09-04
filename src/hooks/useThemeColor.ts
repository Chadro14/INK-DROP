"use client";

import { useEffect } from "react";

/**
 * Hook pour appliquer la couleur primaire choisie par l'utilisateur
 * @param color - La couleur en format hex (#f97316)
 */
export function useThemeColor(color: string) {
  useEffect(() => {
    if (color && color.startsWith("#")) {
      // Appliquer la couleur à la variable CSS --primary
      document.documentElement.style.setProperty("--primary", color);
      
      // Appliquer également aux variables Tailwind personnalisées
      document.documentElement.style.setProperty("--tw-ring-color", color);
      
      // Pour les dégradés et les ombres
      document.documentElement.style.setProperty("--primary-rgb", hexToRgb(color));
      
      console.log(`✅ Couleur appliquée : ${color}`);
    }
  }, [color]);
}

/**
 * Convertir une couleur hex en RGB pour les variables CSS
 * @param hex - Couleur en format hex (#f97316)
 * @returns Couleur en format RGB (249, 115, 22)
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
