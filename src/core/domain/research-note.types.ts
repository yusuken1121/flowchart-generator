export interface ResearchNote {
  id?: string;
  title: string;
  category: string;
  sourceUrl?: string;
  content: string;
  timestamp?: Date;
}

export interface CategoryOption {
  id: string;
  name: string;
  color?: string;
}
