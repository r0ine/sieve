// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
// Sağlayıcı hata gövdeleri istemciye ya da loga gitmeden önce buradan geçer.

const MASK = '<redacted>';

const KEY_SHAPES = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi,
  /\bnvapi-[A-Za-z0-9_-]{16,}/g,
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}/g,
  /\bAIza[A-Za-z0-9_-]{30,}/g,
  /\bgh[opusr]_[A-Za-z0-9]{20,}/g,
];

const ASSIGNMENT = /((?:api[_-]?key|access[_-]?token|token|secret|password|authorization)["']?\s*[=:]\s*["']?)([^\s,;"'&]+)/gi;

export function redactSecrets(text, secrets = []) {
  let clean = String(text);
  const known = [...secrets].filter((s) => typeof s === 'string' && s.length >= 8).sort((a, b) => b.length - a.length);
  for (const secret of known) clean = clean.replaceAll(secret, MASK);
  for (const shape of KEY_SHAPES) {
    clean = clean.replace(shape, (hit) => (/^bearer/i.test(hit) ? `Bearer ${MASK}` : MASK));
  }
  return clean.replace(ASSIGNMENT, (whole, head, value) => (value === MASK || /^bearer$/i.test(value) ? whole : `${head}${MASK}`));
}
