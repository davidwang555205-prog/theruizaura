import type { GenerationJob, GenerationRequestDraft, GenerationService } from "./contracts";

/** Local-only adapter. It deliberately never contacts a provider or stores credentials. */
export class LocalGenerationService implements GenerationService {
  async estimate(request: GenerationRequestDraft) {
    return { credits: Math.max(1, request.imageCount) };
  }

  async create(request: GenerationRequestDraft): Promise<GenerationJob> {
    return {
      id: `local-${Date.now()}`,
      status: "idle",
      request,
      progress: 0,
      assets: [],
      estimate: await this.estimate(request),
    };
  }

  async cancel(_jobId: string) { return undefined; }
  async retry(jobId: string) { return this.create({ prompt: `Retry ${jobId}`, referenceImageIds: [], imageCount: 1, aspectRatio: "3:4", model: "local" }); }
}

