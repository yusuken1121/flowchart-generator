export type FlowchartData = {
  title: string;
  summary: string;
  mermaidCode: string; // The graph definition
  annotations: { term: string; definition: string }[];
};

export type FlowchartListItem = {
  id: string;
  title: string;
  summary: string;
  sourceUrl?: string;
  createdAt: string;
};
