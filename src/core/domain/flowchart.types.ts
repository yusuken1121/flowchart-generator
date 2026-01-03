export type FlowchartData = {
  title: string;
  summary: string;
  mermaidCode: string; // The graph definition
  annotations: { term: string; definition: string }[];
  category?: string;
};

export type FlowchartListItem = {
  id: string;
  title: string;
  summary: string;
  sourceUrl?: string;
  category?: string;
  createdAt: string;
};

export type FlowchartDetail = FlowchartListItem & {
  mermaidCode: string;
  annotations: { term: string; definition: string }[];
};

export type FlowchartFilterOptions = {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  cursor?: string;
  limit?: number;
};

export type FlowchartListResponse = {
  items: FlowchartListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};
