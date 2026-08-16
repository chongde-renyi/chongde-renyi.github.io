import {
  buildPreviewSet,
  isFamilyPhoto,
  isInkPhoto,
  replacementForSlot,
} from './home-gallery-logic.mjs';

const photo = (id, { family = false, ink = false } = {}) => ({
  id,
  renyiCategories: family ? ['家人'] : [],
  topics: ink ? ['墨寶'] : [],
});

const photos = [
  photo('regular-1'), photo('regular-2'), photo('regular-3'),
  photo('regular-4'), photo('regular-5'),
  photo('ink-1', { ink: true }), photo('ink-2', { ink: true }),
  photo('family-1', { family: true }), photo('family-ink', { family: true, ink: true }),
];

const tests = [];
const test = (name, callback) => tests.push({ name, callback });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

test('四張預覽最多一張墨寶且不含家人', () => {
  const preview = buildPreviewSet(photos, 4, () => 0.25);
  assert(preview.length === 4, `預期 4 張，實際 ${preview.length}`);
  assert(preview.filter(isInkPhoto).length === 1, '墨寶數量不是 1 張');
  assert(preview.every((item) => !isFamilyPhoto(item)), '預覽包含家人照片');
  assert(new Set(preview.map((item) => item.id)).size === 4, '預覽照片重複');
});

test('一般照片欄位只替換為一般照片', () => {
  const current = buildPreviewSet(photos, 4, () => 0.1);
  const index = current.findIndex((item) => !isInkPhoto(item));
  const replacement = replacementForSlot(photos, current, index, () => 0);
  assert(!isInkPhoto(replacement), '一般照片被替換成墨寶');
  assert(!isFamilyPhoto(replacement), '一般照片被替換成家人照片');
});

test('墨寶欄位只替換為墨寶', () => {
  const current = buildPreviewSet(photos, 4, () => 0.1);
  const index = current.findIndex(isInkPhoto);
  const replacement = replacementForSlot(photos, current, index, () => 0);
  assert(isInkPhoto(replacement), '墨寶欄位沒有替換成墨寶');
  assert(!isFamilyPhoto(replacement), '墨寶欄位被替換成家人照片');
});

const status = document.querySelector('#test-status');
const output = document.querySelector('#test-output');
try {
  const messages = [];
  for (const { name, callback } of tests) {
    callback();
    messages.push(`PASS ${name}`);
  }
  status.dataset.testStatus = 'passed';
  status.textContent = `${tests.length} 個測試全部通過`;
  output.textContent = messages.join('\n');
} catch (error) {
  status.dataset.testStatus = 'failed';
  status.textContent = '測試失敗';
  output.textContent = error.stack;
  throw error;
}
