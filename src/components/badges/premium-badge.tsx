import Link from "next/link"; // À remplacer par <a> si tu n'utilises pas un framework comme Next.js

interface PremiumBadgeProps {
  isPremium: boolean;
}

export function PremiumBadge({ isPremium }: PremiumBadgeProps) {
  if (isPremium) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold shrink-0">
        PRO
      </span>
    );
  }

  // État non-premium : subtil, animé de façon sûre, et cliquable
  return (
    <Link className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-semibold shadow-sm transition-opacity motion-safe:animate-pulse hover:opacity-80 shrink-0" href="/premium">
      Passer Premium
    </Link>
  );
}
