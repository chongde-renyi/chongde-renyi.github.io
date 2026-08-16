import {
  chooseDownloadFormat,
  buildDownloadFilename,
  calculatePdfPageSize,
  getCardExportOptions,
  waitForImageReady,
} from './download-utils.mjs';

const output = document.querySelector('#test-output');
const results = [];
const pendingTests = [];

function test(name, fn) {
  pendingTests.push(Promise.resolve()
    .then(fn)
    .then(() => results.push(`PASS: ${name}`))
    .catch(error => results.push(`FAIL: ${name}\n  ${error.message}`)));
}

function equal(actual, expected) {
  if (actual !== expected) {
    throw new Error(`expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function deepEqual(actual, expected) {
  equal(JSON.stringify(actual), JSON.stringify(expected));
}

test('desktop uses PDF', () => {
  equal(chooseDownloadFormat({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    maxTouchPoints: 0,
    innerWidth: 1440,
  }), 'pdf');
});

test('iPhone uses PNG', () => {
  equal(chooseDownloadFormat({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)',
    maxTouchPoints: 5,
    innerWidth: 390,
  }), 'png');
});

test('Android uses PNG', () => {
  equal(chooseDownloadFormat({
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel)',
    maxTouchPoints: 5,
    innerWidth: 412,
  }), 'png');
});

test('narrow touch tablet uses PNG', () => {
  equal(chooseDownloadFormat({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    maxTouchPoints: 5,
    innerWidth: 820,
  }), 'png');
});

test('wide touch computer uses PDF', () => {
  equal(chooseDownloadFormat({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    maxTouchPoints: 10,
    innerWidth: 1280,
  }), 'pdf');
});

test('filename is safe and keeps the requested extension', () => {
  equal(buildDownloadFilename('彌勒/祖師', 'png'), '慈語-彌勒-祖師.png');
  equal(buildDownloadFilename('仁義大仙', 'pdf'), '慈語-仁義大仙.pdf');
});

test('PDF page preserves portrait and landscape aspect ratios', () => {
  deepEqual(calculatePdfPageSize(1280, 1600), {
    width: 640,
    height: 800,
    orientation: 'portrait',
  });
  deepEqual(calculatePdfPageSize(1600, 800), {
    width: 640,
    height: 320,
    orientation: 'landscape',
  });
});

test('card export keeps portraits sharp without JPEG recompression', () => {
  deepEqual(getCardExportOptions('png'), {
    scale: 3,
    canvasMimeType: 'image/png',
    pdfImageFormat: null,
  });
  deepEqual(getCardExportOptions('pdf'), {
    scale: 3,
    canvasMimeType: 'image/png',
    pdfImageFormat: 'PNG',
  });
});

test('portrait image is loaded and decoded before export', async () => {
  const image = new Image();
  image.src = 'images/baishui-shengdi-v1.jpg';
  await waitForImageReady(image);
  equal(image.complete, true);
  equal(image.naturalWidth, 300);
});

await Promise.all(pendingTests);
const failures = results.filter(line => line.startsWith('FAIL'));
output.textContent = `${results.join('\n')}\n\n${failures.length ? `${failures.length} failed` : `${results.length} passed`}`;
document.documentElement.dataset.testStatus = failures.length ? 'failed' : 'passed';
