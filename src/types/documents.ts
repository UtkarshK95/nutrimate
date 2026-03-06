export interface ResearchDocument {
  id: string;
  title: string;
  fileName: string;
  summary: string;
  chunkCount: number;
  uploadedAt: string;
}

export type BiomarkerStatus = "normal" | "high" | "low" | "unknown";

export interface Biomarker {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: BiomarkerStatus;
}

export interface LabReport {
  id: string;
  fileName: string;
  reportDate: string; // extracted from PDF if available, else uploadedAt
  uploadedAt: string;
  biomarkers: Biomarker[];
}
