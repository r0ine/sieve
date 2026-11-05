// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clusterBySignature, selectCandidate } from '../src/select.mjs';
import { exampleInputs, parseProbeReply } from '../src/probes.mjs';

const make = (id, signature, publicPass = null) => ({ id, signature, publicPass });

test('single her zaman ilk adayı seçer ve uzlaşma vermez', () => {
  const picked = selectCandidate('single', [make(2, ['a']), make(0, ['b']), make(1, ['a'])]);
  assert.equal(picked.chosen, 0);
  assert.equal(picked.agreement, null);
});

test('public açık testi geçen ilk adayı seçer', () => {
  const picked = selectCandidate('public', [make(0, null, false), make(1, null, true), make(2, null, true)]);
  assert.equal(picked.chosen, 1);
  assert.equal(picked.agreement, 2 / 3);
});

test('public: kimse geçmezse ilk aday, uzlaşma sıfır', () => {
  const picked = selectCandidate('public', [make(1, null, false), make(0, null, false)]);
  assert.equal(picked.chosen, 0);
  assert.equal(picked.agreement, 0);
  assert.equal(picked.uncertainty, 1);
});

test('codet en büyük uzlaşma kümesinden seçer', () => {
  const candidates = [make(0, ['1', '2']), make(1, ['1', '3']), make(2, ['1', '3']), make(3, ['9', '9'])];
  const picked = selectCandidate('codet', candidates);
  assert.equal(picked.chosen, 1);
  assert.equal(picked.agreement, 0.5);
  assert.deepEqual(picked.clusters[0].members, [1, 2]);
});

test('eşit kümelerde az istisnalı küme kazanır', () => {
  const candidates = [make(0, ['!raise TypeError', '!raise TypeError']), make(1, ['!raise TypeError', '!raise TypeError']),
    make(2, ['4', '5']), make(3, ['4', '5'])];
  assert.equal(selectCandidate('codet', candidates).chosen, 2);
});

test('herkeste geçersiz olan girdi sütunu yok sayılır', () => {
  const clusters = clusterBySignature([make(0, ['!input', '1']), make(1, ['!input', '1'])]);
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].size, 2);
});

test('imzasız (içe aktarılamayan) aday kümeye girmez ama paydada sayılır', () => {
  const picked = selectCandidate('codet', [make(0, null), make(1, ['7']), make(2, ['7'])]);
  assert.equal(picked.chosen, 1);
  assert.equal(picked.agreement, 2 / 3);
});

test('combined açık testi geçenler arasında kümeler', () => {
  const candidates = [make(0, ['x'], false), make(1, ['x'], false), make(2, ['y'], true), make(3, ['z'], true), make(4, ['z'], true)];
  const picked = selectCandidate('combined', candidates);
  assert.equal(picked.chosen, 3);
  assert.equal(picked.agreement, 2 / 5);
});

test('combined: kimse geçmezse tüm adaylarda uzlaşmaya döner', () => {
  const picked = selectCandidate('combined', [make(0, ['a'], false), make(1, ['b'], false), make(2, ['b'], false)]);
  assert.equal(picked.chosen, 1);
  assert.match(picked.reason, /geçen yok/);
});

test('bilinmeyen strateji hata verir', () => {
  assert.throws(() => selectCandidate('oracle', [make(0, ['a'])]), /Bilinmeyen strateji/);
});

test('prompt örneklerinden girdi çıkarılır', () => {
  const prompt = "Examples:\n- `solve([4, 1, 3]) == 6`\n- `solve(1, [('put', 1, 7), ('get', 1)]) == [7]`\n- `solve(\"a)b\") == 1`\nWrite `solve(x)`.";
  assert.deepEqual(exampleInputs(prompt), ['[4, 1, 3]', "1, [('put', 1, 7), ('get', 1)]", '"a)b"']);
});

test('model cevabındaki girdi listesi ayrıştırılır', () => {
  const reply = 'İşte:\n```json\n["[1, 2]", "[]", "[1, 2]", 5]\n```';
  assert.deepEqual(parseProbeReply(reply, 8), ['[1, 2]', '[]']);
  assert.deepEqual(parseProbeReply('json yok', 8), []);
});
