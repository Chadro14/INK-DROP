import { BadgeCheck } from "lucide-react";

interface CertificationBadgeProps {
  isCertified: boolean;
  color: string;
}

export function CertificationBadge({ isCertified, color }: CertificationBadgeProps) {
  if (!isCertified) return null;

  return (
    <BadgeCheck
      className="w-5 h-5 flex-shrink-0"
      fill={color}
      color="white"
      strokeWidth={1.5}
    />
  );
}
