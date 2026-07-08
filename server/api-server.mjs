import http from "node:http";

const PORT = Number(process.env.PORT || 8787);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com").replace(/\/$/, "");
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const MAX_BODY_BYTES = 1_000_000;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": process.env.CORS_ORIGIN || "*",
    "access-control-allow-methods": "POST, OPTIONS, GET",
    "access-control-allow-headers": "content-type, authorization"
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    req.on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOpenAIImage(payload) {
  if (!OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured on the server.");
    error.statusCode = 500;
    throw error;
  }

  const retryDelays = [0, 2_000, 5_000, 10_000];
  let lastError;

  for (let attempt = 0; attempt < retryDelays.length; attempt += 1) {
    if (retryDelays[attempt] > 0) await sleep(retryDelays[attempt]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch(`${OPENAI_BASE_URL}/v1/images/generations`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${OPENAI_API_KEY}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      const requestId = response.headers.get("x-request-id") || data?.request_id || null;

      if (response.ok) {
        return { data, requestId, attempts: attempt + 1 };
      }

      const retriable = response.status === 429 || response.status >= 500;
      const message = data?.error?.message || data?.message || `OpenAI request failed with status ${response.status}`;
      lastError = Object.assign(new Error(message), {
        statusCode: response.status,
        requestId,
        responseBody: data,
        retriable
      });

      if (!retriable || attempt === retryDelays.length - 1) throw lastError;
    } catch (error) {
      lastError = error;
      const isAbort = error?.name === "AbortError";
      if (!isAbort && attempt === retryDelays.length - 1) throw error;
      if (!isAbort && attempt < retryDelays.length - 1) continue;
      if (isAbort && attempt === retryDelays.length - 1) {
        const timeoutError = new Error("Image generation timed out.");
        timeoutError.statusCode = 504;
        throw timeoutError;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("Image generation failed.");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return sendJson(res, 204, {});

  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "theruiz-aura-image-api-poc",
      model: OPENAI_IMAGE_MODEL,
      hasApiKey: Boolean(OPENAI_API_KEY)
    });
  }

  if (req.method !== "POST" || req.url !== "/api/generate-image") {
    return sendJson(res, 404, { error: "Not found" });
  }

  try {
    const body = await readJsonBody(req);
    const prompt = String(body.prompt || "").trim();

    if (!prompt) {
      return sendJson(res, 400, { error: "prompt is required" });
    }

    const size = body.size || "1024x1024";
    const quality = body.quality || "medium";
    const output_format = body.output_format || "png";

    const { data, requestId, attempts } = await requestOpenAIImage({
      model: body.model || OPENAI_IMAGE_MODEL,
      prompt,
      size,
      quality,
      output_format
    });

    const image = data?.data?.[0];
    const b64 = image?.b64_json;

    if (!b64) {
      return sendJson(res, 502, {
        error: "Image API returned no b64_json result.",
        requestId,
        raw: data
      });
    }

    return sendJson(res, 200, {
      ok: true,
      requestId,
      attempts,
      model: body.model || OPENAI_IMAGE_MODEL,
      size,
      quality,
      output_format,
      imageBase64: b64,
      imageDataUrl: `data:image/${output_format};base64,${b64}`,
      usage: data?.usage || null
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      ok: false,
      error: error.message || "Image generation failed.",
      requestId: error.requestId || null,
      details: error.responseBody || null
    });
  }
});

server.listen(PORT, () => {
  console.log(`THERUIZ AURA image API POC listening on http://localhost:${PORT}`);
});
