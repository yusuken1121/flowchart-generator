export const ARTICLE_CATEGORIES = [
  "政治",
  "経済",
  "国際",
  "社会",
  "科学・IT",
  "スポーツ",
  "芸能",
  "その他",
] as const;

export type ArticleCategory = typeof ARTICLE_CATEGORIES[number];
