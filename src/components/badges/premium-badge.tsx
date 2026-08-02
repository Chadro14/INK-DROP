import Link from "next/link";
import { Sparkles } from "lucide-react";

interface PremiumBadgeProps {
  isPremium: boolean;
}

export function PremiumBadge({ isPremium }: PremiumBadgeProps) {
  if (isPremium) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
        PRO
      </span>
    );
  }

  return (
    <Link
      href="/premium"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[11px] font-black tracking-wider uppercase shadow-sm hover:shadow-md hover:scale-105 transition-all motion-safe:animate-pulse"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>PRO VIP</span>
    </Link>
  );
}
