'use client';

interface CertifiedBadgeProps {
  color?: string | null;
  size?: number;
  className?: string;
}

export default function CertifiedBadge({
  color = '#2563EB', // Couleur par défaut (Bleu)
  size = 18,
  className = '',
}: CertifiedBadgeProps) {
  const badgeColor = color || '#2563EB';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block align-middle select-none ${className}`}
      style={{ filter: `drop-shadow(0px 0px 4px ${badgeColor}66)` }}
    >
      {/* Fond du badge (étoile / sceau de certification) */}
      <path
        d="M12 2L14.7 3.8L17.9 3.5L19.4 6.3L22.2 7.8L21.9 11L23.7 13.7L21.9 16.4L22.2 19.6L19.4 21.1L17.9 23.9L14.7 23.6L12 25.4L9.3 23.6L6.1 23.9L4.6 21.1L1.8 19.6L2.1 16.4L0.3 13.7L2.1 11L1.8 7.8L4.6 6.3L6.1 3.5L9.3 3.8L12 2Z"
        fill={badgeColor}
      />
      {/* V de vérification au centre */}
      <path
        d="M9 12.5L11 14.5L15.5 10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
