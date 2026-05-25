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

export function dedupePromptLines(text: string) {
  const seen = new Set<string>();
  const output: string[] = [];
  let previousWasBlank = false;

  text.split(/\n/).forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      if (!previousWasBlank && output.length) {
        output.push("");
      }
      previousWasBlank = true;
      return;
    }

    const chunks =
      trimmed.length > 220 && !trimmed.startsWith("-")
        ? splitSentenceLikeText(trimmed)
        : [trimmed];

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

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function getPromptStats(text: string) {
  const trimmed = text.trim();
  const englishWordMatches = trimmed.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g);

  return {
    charCount: trimmed.length,
    wordCount: englishWordMatches?.length ?? 0
  };
}
