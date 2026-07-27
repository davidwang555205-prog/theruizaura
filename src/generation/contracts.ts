export type GenerationJobStatus = "idle" | "queued" | "generating" | "completed" | "failed" | "cancelled";

export type GenerationRequestDraft = {
  prompt: string;
  referenceImageIds: string[];
  imageCount: number;
  aspectRatio: string;
  model: string;
  seed?: number;
};

export type GenerationCostEstimate = { credits: number; currency?: string };

export type GenerationError = { code: string; message: string; retryable: boolean };

export type GenerationAsset = { id: string; url: string; alt: string; createdAt: string };

export type GenerationJob = {
  id: string;
  status: GenerationJobStatus;
  request: GenerationRequestDraft;
  progress: number;
  assets: GenerationAsset[];
  error?: GenerationError;
  estimate?: GenerationCostEstimate;
};

export interface GenerationService {
  estimate(request: GenerationRequestDraft): Promise<GenerationCostEstimate>;
  create(request: GenerationRequestDraft): Promise<GenerationJob>;
  cancel(jobId: string): Promise<void>;
  retry(jobId: string): Promise<GenerationJob>;
}

