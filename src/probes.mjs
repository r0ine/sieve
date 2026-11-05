// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Seçici için ek test girdileri: prompt örneklerinden ve modelden. Beklenen çıktı istenmez,
// yalnızca adayların aynı girdide aynı şeyi üretip üretmediğine bakılır.

const PROBE_SYSTEM = 'You design test inputs for a Python function. You never solve the task and never '
  + 'write expected outputs. Reply with one ```json code block and nothing else.';

function closingParen(text, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(' || ch === '[' || ch === '{') {
      depth += 1;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function exampleInputs(promptText, entry = 'solve') {
  const found = [];
  const marker = new RegExp(`\\b${entry}\\(`, 'g');
  for (const line of promptText.split('\n')) {
    if (!line.includes('==')) continue;
    for (const match of line.matchAll(marker)) {
      const open = match.index + entry.length;
      const close = closingParen(line, open);
      if (close > open) found.push(line.slice(open + 1, close).trim());
    }
  }
  return [...new Set(found)];
}

export function parseProbeReply(text, limit) {
  const block = /```(?:json)?\s*\n([\s\S]*?)```/.exec(text)?.[1] ?? /\[[\s\S]*\]/.exec(text)?.[0];
  if (!block) return [];
  let parsed;
  try {
    parsed = JSON.parse(block);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const inputs = parsed.filter((item) => typeof item === 'string' && item.trim() && item.length < 2000);
  return [...new Set(inputs.map((item) => item.trim()))].slice(0, limit);
}

export async function requestProbeInputs({ complete, model, promptText, count = 8, entry = 'solve' }) {
  const prompt = `${promptText}\n\n---\nWrite ${count} diverse, valid inputs for \`${entry}\` that would `
    + 'separate correct implementations from subtly wrong ones: edge cases, empty or single-element '
    + 'inputs, negatives, duplicates, ties, boundaries. Keep each input small. Reply with a JSON array '
    + `of strings; each string is exactly the argument list you would write inside ${entry}(...), `
    + 'as Python literals, for example "[4, 1, 3]" or "2, [(\'get\', 1)]". No outputs, no comments.';
  const answer = await complete({ model, system: PROBE_SYSTEM, prompt, temperature: 0.3, maxTokens: 2048 });
  return { inputs: parseProbeReply(answer.text, count), usage: answer.usage };
}

export function mergeProbes(...groups) {
  return [...new Set(groups.flat())];
}
