import fs from "node:fs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com").replace(/\/$/, "");
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

const prompt = process.argv.slice(2).join(" ").trim() ||
  "A premium THERUIZ AURA German trainer product photo on a warm linen studio backdrop, cream white and soft beige tones, realistic stitching and laces, commercial product launch image.";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY. Set it in the server environment before running this test.");
  process.exit(1);
}

const response = await fetch(`${OPENAI_BASE_URL}/v1/images/generations`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${OPENAI_API_KEY}`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: "1024x1024",
    quality: "low",
    output_format: "png"
  })
});

const text = await response.text();
const data = text ? JSON.parse(text) : {};
const requestId = response.headers.get("x-request-id") || data?.request_id || null;

if (!response.ok) {
  console.error("Image API test failed", {
    status: response.status,
    requestId,
    error: data?.error || data
  });
  process.exit(1);
}

const b64 = data?.data?.[0]?.b64_json;
if (!b64) {
  console.error("Image API returned no b64_json result", { requestId, data });
  process.exit(1);
}

fs.mkdirSync("tmp", { recursive: true });
const outputPath = "tmp/theruiz-aura-api-test.png";
fs.writeFileSync(outputPath, Buffer.from(b64, "base64"));

console.log("Image API test succeeded", {
  requestId,
  model: OPENAI_IMAGE_MODEL,
  outputPath,
  usage: data?.usage || null
});
