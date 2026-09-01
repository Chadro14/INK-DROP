"use client";

import { BadgeRarity } from "@prisma/client";

type Badge = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  gradient: string | null;
  glowColor: string | null;
  rarity: BadgeRarity;
  category: string;
};

type UserBadge = {
  id: string;
  badge: Badge;
  earnedAt: string;
  isDisplayed: boolean;
};

const RARITY_LABELS: Record<BadgeRarity, { label: string; color: string }> = {
  COMMON: { label: "Commun", color: "text-zinc-400" },
  UNCOMMON: { label: "Peu commun", color: "text-blue-400" },
  RARE: { label: "Rare", color: "text-purple-400" },
  EPIC: { label: "Épique", color: "text-violet-400" },
  LEGENDARY: { label: "Légendaire", color: "text-amber-400" },
  ULTIMATE: { label: "Ultime", color: "text-red-400" },
};

const RARITY_GLOW: Record<BadgeRarity, string> = {
  COMMON: "shadow-none",
  UNCOMMON: "shadow-blue-500/20",
  RARE: "shadow-purple-500/30",
  EPIC: "shadow-violet-500/40",
  LEGENDARY: "shadow-amber-500/50",
  ULTIMATE: "shadow-red-500/60",
};

const ICON_MAP: Record<string, string> = {
  crown: "👑",
  trophy: "🏆",
  star: "⭐",
  sparkles: "✨",
  ticket: "🎟️",
  shield: "🛡️",
  sword: "⚔️",
  medal: "🥇",
  flame: "🔥",
  pen: "🖊️",
  brush: "🖌️",
  default: "🏅",
};

export function BadgeDisplay({ userBadge, showRarity = true }: { userBadge: UserBadge; showRarity?: boolean }) {
  const { badge } = userBadge;
  const rarityInfo = RARITY_LABELS[badge.rarity as BadgeRarity] || RARITY_LABELS.COMMON;
  const glowClass = RARITY_GLOW[badge.rarity as BadgeRarity] || RARITY_GLOW.COMMON;
  const icon = ICON_MAP[badge.icon] || ICON_MAP.default;

  const isUltimate = badge.rarity === "ULTIMATE";
  const isLegendary = badge.rarity === "LEGENDARY";

  return (
    <div className={`relative group ${isUltimate ? "animate-pulse" : ""}`}>
      {/* Effet de brillance pour les badges rares */}
      {(isUltimate || isLegendary) && (
        <>
          <div className={`absolute inset-0 rounded-full blur-2xl ${glowClass} animate-pulse`} />
          <div className="absolute inset-0">
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1s' }} />
            <span className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
            <span className="absolute top-0 left-1/2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.6s' }} />
          </div>
        </>
      )}

      <div
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 ${
          badge.gradient 
            ? `bg-gradient-to-r ${badge.gradient}`
            : `bg-zinc-800/60 border-zinc-700/50`
        } ${glowClass} shadow-lg`}
        style={{ borderColor: badge.color }}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-bold text-white">{badge.name}</span>

        {showRarity && (
          <span className={`text-[10px] font-medium ${rarityInfo.color}`}>
            • {rarityInfo.label}
          </span>
        )}

        {/* Icône de vérification pour les badges affichés */}
        {userBadge.isDisplayed && (
          <span className="text-[10px] text-blue-400">📌</span>
        )}
      </div>
    </div>
  );
}

export function BadgeCollection({ userBadges }: { userBadges: UserBadge[] }) {
  if (userBadges.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <p className="text-sm">Aucun badge débloqué</p>
        <p className="text-xs">Participe à des événements pour gagner des badges !</p>
      </div>
    );
  }

  // Grouper par rareté
  const grouped = userBadges.reduce((acc, ub) => {
    const rarity = ub.badge.rarity;
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(ub);
    return acc;
  }, {} as Record<string, UserBadge[]>);

  const rarityOrder = ["ULTIMATE", "LEGENDARY", "EPIC", "RARE", "UNCOMMON", "COMMON"];

  return (
    <div className="space-y-4">
      {rarityOrder.map((rarity) => {
        const badges = grouped[rarity] || [];
        if (badges.length === 0) return null;

        return (
          <div key={rarity}>
            <h3 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              {RARITY_LABELS[rarity as BadgeRarity]?.label || rarity}
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((ub) => (
                <BadgeDisplay key={ub.id} userBadge={ub} showRarity={false} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
