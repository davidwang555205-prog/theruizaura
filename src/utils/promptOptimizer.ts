function normalizeLine(line: string) {
  return line
    .toLowerCase()
    .replace(/[`"'“”‘’.,;:!?()[\]{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentenceLikeText(text: string) {
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts : [text.trim()];
}

const structuredSectionTitlePattern = /^(时间|地点|人物|穿着|场景|氛围|动作|负面词|产品):$/;

function isStructuredPrompt(text: string) {
  return /(^|\n)(时间|地点|人物|穿着|场景|氛围|动作|负面词|产品):\s*(\n|$)/.test(text);
}

function dedupeNegativePhraseLine(line: string) {
  if (!/^avoid\s/i.test(line)) return line;

  const phrases = line
    .replace(/^avoid\s+/i, "")
    .replace(/\.$/, "")
    .split(/,\s*|\s+and\s+/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);

  if (phrases.length < 2) return line;

  const seen = new Set<string>();
  const kept = phrases.filter((phrase) => {
    const key = normalizeLine(phrase)
      .replace(/\b(the|a|an|any)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return `Avoid ${kept.join(", ")}.`;
}

export function dedupePromptLines(text: string) {
  const marker = "Additional user requirement:";
  const markerIndex = text.lastIndexOf(marker);
  const bodyText = markerIndex >= 0 ? text.slice(0, markerIndex) : text;
  const userRequirement = markerIndex >= 0 ? text.slice(markerIndex).trim() : "";
  const structured = isStructuredPrompt(bodyText);
  const seen = new Set<string>();
  const output: string[] = [];
  let previousWasBlank = false;

  bodyText.split(/\n/).forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      if (!previousWasBlank && output.length) {
        output.push("");
      }
      previousWasBlank = true;
      return;
    }

    if (structuredSectionTitlePattern.test(trimmed)) {
      output.push(trimmed);
      previousWasBlank = false;
      return;
    }

    const normalizedNegativeLine = dedupeNegativePhraseLine(trimmed);
    const chunks =
      normalizedNegativeLine.length > 220 && !normalizedNegativeLine.startsWith("-")
        ? splitSentenceLikeText(normalizedNegativeLine)
        : [normalizedNegativeLine];

    const keptChunks = chunks.filter((chunk) => {
      const key = normalizeLine(chunk);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (!keptChunks.length) return;

    output.push(keptChunks.join(" "));
    previousWasBlank = false;
  });

  const dedupedBody = reduceRepeatedConcepts(output.join("\n").replace(/\n{3,}/g, "\n\n").trim());
  return [dedupedBody, userRequirement].filter(Boolean).join(structured ? "\n\n" : " ").trim();
}

export function getPromptStats(text: string) {
  const trimmed = text.trim();
  const englishWordMatches = trimmed.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g);

  return {
    charCount: trimmed.length,
    wordCount: englishWordMatches?.length ?? 0
  };
}

function removeRepeatedLightPhrases(text: string) {
  const phrases = ["soft daylight", "warm light", "natural light", "gentle shadows", "calm mood"];
  let output = text;

  phrases.forEach((phrase) => {
    let seen = false;
    const pattern = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "gi");
    output = output.replace(pattern, (match) => {
      if (!seen) {
        seen = true;
        return match;
      }

      return "";
    });
  });

  return output.replace(/[ \t]+,/g, ",").replace(/[ \t]{2,}/g, " ").trim();
}

function reduceRepeatedConcepts(text: string) {
  return text
    .replace(/\b(clean\s+){2,}sleeveless top\b/gi, "clean sleeveless top")
    .replace(/\bblack clean clean sleeveless top\b/gi, "black clean sleeveless top")
    .replace(/\brealistic realistic\b/gi, "realistic")
    .replace(/\bbelievable believable\b/gi, "believable")
    .replace(/\brefined refined\b/gi, "refined")
    .replace(/\bpremium premium\b/gi, "premium")
    .replace(/\bsoft,\s+and\b/gi, "soft light and")
    .replace(/,\s*,+/g, ",")
    .replace(/([:;])\s*,/g, "$1")
    .replace(/[ \t]+,/g, ",")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function cleanFinalPrompt(text: string) {
  const marker = "Additional user requirement:";
  const markerIndex = text.lastIndexOf(marker);
  const userRequirement =
    markerIndex >= 0 ? text.slice(markerIndex).trim().replace(/\s+$/, "") : "";
  const body = markerIndex >= 0 ? text.slice(0, markerIndex) : text;
  const structured = isStructuredPrompt(body);

  if (structured) {
    const cleanedBody = body
        .split(/\n/)
        .map((line) => line.trim())
        .filter((line) => !/^#{1,6}\s/.test(line))
        .filter(
          (line) =>
            structuredSectionTitlePattern.test(line) ||
            !/^(Prompt Output|Final Prompt|Compact Prompt|Standard Prompt|Full Debug|Module|Section|最终完整提示词|提示词输出|调试|模块)[:：]?$/i.test(
              line
            )
        )
        .map((line) =>
          structuredSectionTitlePattern.test(line)
            ? line
            : line
                .replace(/^\d+[.)、]\s*/, "")
                .replace(/^[-*]\s+/, "")
                .replace(/[ \t]+/g, " ")
                .replace(/\s+([,.!?;:])/g, "$1")
                .trim()
        )
        .join("\n")
        .replace(/,\s*,+/g, ",")
        .replace(/([:;])\s*,/g, "$1")
        .replace(/\s+([,.!?;:])/g, "$1")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return [cleanedBody, userRequirement].filter(Boolean).join("\n\n").trim();
  }

  const cleanedBody = removeRepeatedLightPhrases(body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^#{1,6}\s/.test(line))
    .filter(
      (line) =>
        !/^(Prompt Output|Final Prompt|Compact Prompt|Standard Prompt|Full Debug|Module|Section|最终完整提示词|提示词输出|调试|模块)[:：]?$/i.test(
          line
        )
    )
    .map((line) =>
      line
        .replace(/^\d+[.)、]\s*/, "")
        .replace(/^[-*]\s+/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim());

  return [cleanedBody, userRequirement].filter(Boolean).join(" ").trim();
}
