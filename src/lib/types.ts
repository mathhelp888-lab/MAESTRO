export type Mitigation = {
  recommendation: string;
  reasoning: string;
  caveats: string;
};

export type LayerStatus = "pending" | "analyzing" | "complete" | "error";

export type LayerData = {
  id: string;
  name: string;
  threat: string | null;
  mitigation: Mitigation | null;
  status: LayerStatus;
};

export type UseCase = {
  value: string;
  label: string;
  description: string;
};
