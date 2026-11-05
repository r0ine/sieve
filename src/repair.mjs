// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Hata geri beslemeli onarım: açık testte ya da ek girdilerde düşen adayın kısa hata özeti modele
// geri verilir, model düzeltilmiş bir aday yazar. Geri besleme yalnızca public_test.py ve imza
// çıktısından kurulur; gizli test bu modüle hiç gelmez, metin yine de yol ve dosya adından arındırılır.

export const DEFAULT_REPAIR_ROUNDS = 1;
export const FEEDBACK_LIMIT = 500;
const LINE_LIMIT = 200;
const PROBE_LINES = 2;

const clip = (text, limit) => (text.length > limit ? `${text.slice(0, limit - 3)}...` : text);

export function scrub(text) {
  return String(text ?? '')
    .replace(/[A-Za-z]:[\\/][^\s'",)]*/g, '<yol>')
    .replace(/(?<![\w.<])\/(?:[\w.~-]+\/)+[\w.~-]*/g, '<yol>')
    .replace(/\btest\.py\b/g, '<gizli>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function answeredColumns(candidates) {
  const answered = new Set();
  for (const candidate of candidates) {
    candidate.signature?.forEach((cell, col) => {
      if (!cell.startsWith('!')) answered.add(col);
    });
  }
  return answered;
}

export function failureFeedback(candidate, { probes = [], answered = new Set(), entry = 'solve' } = {}) {
  const lines = [];
  if (candidate.publicPass === false) {
    const at = candidate.publicAt ? ` at \`${candidate.publicAt}\`` : '';
    lines.push(`public test failed${at}: ${candidate.publicWhy || 'no message'}`);
  }
  if (candidate.probeWhy) lines.push(`running the function failed: ${candidate.probeWhy}`);
  let probeLines = 0;
  candidate.signature?.forEach((cell, col) => {
    if (probeLines >= PROBE_LINES || !answered.has(col)) return;
    if (cell.startsWith('!raise')) lines.push(`${entry}(${probes[col]}) raised ${cell.slice('!raise '.length)}`);
    else if (cell === '!timeout') lines.push(`${entry}(${probes[col]}) did not finish in time`);
    else return;
    probeLines += 1;
  });
  const text = lines.map((line) => `- ${clip(scrub(line), LINE_LIMIT)}`).join('\n');
  return clip(text, FEEDBACK_LIMIT);
}

export function repairPrompt(promptText, code, feedback) {
  return `${promptText}\n\n---\nYour previous solution:\n\`\`\`python\n${code}\`\`\`\n`
    + `It failed these checks:\n${feedback}\n\n`
    + 'Fix the function so it solves the task above. Reply with the complete corrected function in one '
    + '```python block.';
}

export async function runRepairs({ candidates, probes, rounds, firstId, promptText, ask, check }) {
  const repairs = [];
  const context = { probes: probes ?? [], answered: answeredColumns(candidates) };
  let frontier = candidates.filter((c) => c.code);
  let nextId = firstId;

  for (let round = 1; round <= rounds; round += 1) {
    const jobs = frontier
      .map((parent) => ({ parent, feedback: failureFeedback(parent, context) }))
      .filter((job) => job.feedback);
    if (!jobs.length) break;

    const made = await Promise.all(jobs.map(async ({ parent, feedback }) => {
      const id = nextId++;
      const child = await ask(repairPrompt(promptText, parent.code, feedback), id);
      Object.assign(child, { repairOf: parent.id, round, feedback });
      return child.error ? child : check(child);
    }));
    repairs.push(...made);
    frontier = made.filter((c) => !c.error);
  }
  return repairs;
}
