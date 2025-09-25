export type CollectionRarity = "UR" | "SSR" | "SR" | "R" | "N";

export type CollectionCard = {
  id: string;
  title: string;
  rarity: CollectionRarity;
  accent: "amethyst" | "azure" | "sunrise" | "emerald" | "crimson" | "void";
  subtitle?: string;
  coverUrl?: string;
  attribute?: string;
  series?: string;
  tags?: string[];
  description?: string;
  obtainedAt?: string;
  stats?: Array<{ label: string; value: string }>;
};
