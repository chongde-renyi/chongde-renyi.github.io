# Blessing Card Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Blessing's copy action with a result-matched card that automatically downloads as PDF on computers and high-resolution PNG on phones and tablets.

**Architecture:** Keep the existing static site and Claude's in-progress card markup, styling, and export flow. Move device/format and PDF sizing decisions into a small dependency-free ES module so they can be covered by Node tests, while `blessing.js` remains responsible for current-result state, DOM rendering, and browser downloads.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner, html2canvas 1.4.1, jsPDF 2.5.2.

## Global Constraints

- Desktop browsers automatically download one-page PDF files.
- Android, iPhone, iPad, iPod, Mobile user agents, and touch-capable viewports at or below 900px automatically download PNG files.
- The card must contain the selected deity name and portrait, Chinese blessing, Chinese guidance, English guidance, and the existing disclaimer.
- The downloaded content must always represent the latest draw and must not change the draw logic.
- Keep the site static; do not add a framework, backend, format chooser, second download button, social sharing, QR code, watermark settings, or custom themes.

---

## File Structure

- Create `blessing/download-utils.mjs`: pure format detection, filename creation, and proportional PDF page-size helpers.
- Create `blessing/download-utils.test.mjs`: Node tests for desktop/mobile/tablet classification, safe filenames, and proportional sizing.
- Modify `blessing/blessing.js`: import tested helpers, preserve current result state, render the card, export PNG/PDF, and manage button feedback.
- Modify `blessing/index.html`: load `blessing.js` as a module, load export libraries, replace the copy button, and provide the off-screen card host.
- Modify `blessing/blessing.css`: style the fixed-width, auto-height export card and keep it renderable off screen.

### Task 1: Tested download decisions

**Files:**
- Create: `blessing/download-utils.mjs`
- Create: `blessing/download-utils.test.mjs`

**Interfaces:**
- Produces: `chooseDownloadFormat({ userAgent, maxTouchPoints, innerWidth }): "png" | "pdf"`
- Produces: `buildDownloadFilename(name, format): string`
- Produces: `calculatePdfPageSize(canvasWidth, canvasHeight, pageWidth = 640): { width: number, height: number, orientation: "portrait" | "landscape" }`

- [ ] **Step 1: Write failing tests for format selection**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chooseDownloadFormat,
  buildDownloadFilename,
  calculatePdfPageSize,
} from './download-utils.mjs';

test('desktop uses PDF', () => {
  assert.equal(chooseDownloadFormat({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    maxTouchPoints: 0,
    innerWidth: 1440,
  }), 'pdf');
});

test('phones and tablets use PNG', () => {
  assert.equal(chooseDownloadFormat({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', maxTouchPoints: 5, innerWidth: 390 }), 'png');
  assert.equal(chooseDownloadFormat({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel)', maxTouchPoints: 5, innerWidth: 412 }), 'png');
  assert.equal(chooseDownloadFormat({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', maxTouchPoints: 5, innerWidth: 820 }), 'png');
});

test('wide touch computer still uses PDF', () => {
  assert.equal(chooseDownloadFormat({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)', maxTouchPoints: 10, innerWidth: 1280 }), 'pdf');
});
```

- [ ] **Step 2: Run the tests and confirm they fail because the module does not exist**

Run: `node --test blessing/download-utils.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `download-utils.mjs`.

- [ ] **Step 3: Add filename and page-size tests**

```js
test('filename contains the deity and correct extension without reserved characters', () => {
  assert.equal(buildDownloadFilename('彌勒/祖師', 'png'), '慈語-彌勒-祖師.png');
  assert.equal(buildDownloadFilename('仁義大仙', 'pdf'), '慈語-仁義大仙.pdf');
});

test('PDF page keeps the canvas aspect ratio', () => {
  assert.deepEqual(calculatePdfPageSize(1280, 1600), {
    width: 640,
    height: 800,
    orientation: 'portrait',
  });
  assert.deepEqual(calculatePdfPageSize(1600, 800), {
    width: 640,
    height: 320,
    orientation: 'landscape',
  });
});
```

- [ ] **Step 4: Implement the pure utilities**

```js
export function chooseDownloadFormat({ userAgent = '', maxTouchPoints = 0, innerWidth = 0 }) {
  const explicitMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const touchNarrow = maxTouchPoints > 0 && innerWidth <= 900;
  return explicitMobile || touchNarrow ? 'png' : 'pdf';
}

export function buildDownloadFilename(name, format) {
  const safeName = String(name).replace(/[\\/:*?"<>|]+/g, '-').trim();
  return `慈語-${safeName}.${format}`;
}

export function calculatePdfPageSize(canvasWidth, canvasHeight, pageWidth = 640) {
  const height = Math.round(pageWidth * canvasHeight / canvasWidth);
  return {
    width: pageWidth,
    height,
    orientation: height >= pageWidth ? 'portrait' : 'landscape',
  };
}
```

- [ ] **Step 5: Run the unit tests**

Run: `node --test blessing/download-utils.test.mjs`

Expected: five tests PASS with zero failures.

- [ ] **Step 6: Commit the tested utility boundary**

```powershell
git add -- blessing/download-utils.mjs blessing/download-utils.test.mjs
git commit -m "test: cover blessing download format decisions"
```

### Task 2: Result-matched card export

**Files:**
- Modify: `blessing/index.html:7-9,47,53-55`
- Modify: `blessing/blessing.css:10-19`
- Modify: `blessing/blessing.js:115-249`

**Interfaces:**
- Consumes: `chooseDownloadFormat`, `buildDownloadFilename`, and `calculatePdfPageSize` from `./download-utils.mjs`
- Produces: `renderDownloadCard(): void`
- Produces: `downloadBlessingCard(): Promise<void>`
- Produces: click behavior for `#download-btn`

- [ ] **Step 1: Convert the application script to a browser module and load export libraries**

In `blessing/index.html`, retain the pinned CDN versions and use module loading for the application:

```html
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js"></script>
<script type="module" src="blessing.js?v=card-download-20260815-1"></script>
```

At the start of `blessing/blessing.js`, import the pure helpers:

```js
import {
  chooseDownloadFormat,
  buildDownloadFilename,
  calculatePdfPageSize,
} from './download-utils.mjs';
```

- [ ] **Step 2: Keep the result action and off-screen card semantics explicit**

Use the following result action and card host in `blessing/index.html`:

```html
<div class="actions">
  <button id="again">再次領受</button>
  <button class="secondary" id="download-btn">下載慈語卡片</button>
</div>

<div class="download-card-host" aria-hidden="true">
  <article class="download-card" id="download-card"></article>
</div>
```

- [ ] **Step 3: Reuse one portrait resolver for the result and export card**

Retain `portraitBg(name, portraitClass)` and ensure both `#seal` and `.dc-portrait` consume its returned `image`, `position`, and `size`. Store each completed draw in these variables before showing the result:

```js
let currentName = null;
let currentItem = null;
let currentPortraitClass = null;

currentName = name;
currentItem = item;
currentPortraitClass = portraitClass;
```

- [ ] **Step 4: Render only the current draw into the export card**

Keep `renderDownloadCard()` guarded by `if (!currentItem) return;` and render the exact current values:

```js
document.querySelector('#download-card').innerHTML = `
  <div class="dc-top">
    <div>
      <p class="dc-kicker">崇德仁義 · 今日慈語</p>
      <h2 class="dc-title">${currentName} 慈悲指引</h2>
    </div>
    <span class="dc-portrait"></span>
  </div>
  <section class="dc-section dc-quote"><p>「${currentItem.q}」</p></section>
  <section class="dc-section">
    <p class="dc-text">${currentItem.g}</p>
    <p class="dc-text-en">${currentItem.ge}</p>
  </section>
  <div class="dc-foot">此頁旨在靜心自省與善念提醒，慈語不作占卜或重大決策依據。</div>`;
```

- [ ] **Step 5: Export PNG on mobile and PDF on desktop**

Call the tested utilities with browser values and use the returned filename/page size:

```js
const format = chooseDownloadFormat({
  userAgent: navigator.userAgent,
  maxTouchPoints: navigator.maxTouchPoints || 0,
  innerWidth: window.innerWidth,
});
const filename = buildDownloadFilename(currentName, format);

if (format === 'png') {
  const blob = await canvasToBlob(canvas, 'image/png', 1);
  downloadBlob(blob, filename);
} else {
  const { width, height, orientation } = calculatePdfPageSize(canvas.width, canvas.height);
  const pdf = new window.jspdf.jsPDF({
    orientation,
    unit: 'px',
    format: [width, height],
    hotfixes: ['px_scaling'],
  });
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', 0, 0, width, height, undefined, 'FAST');
  pdf.save(filename);
}
```

- [ ] **Step 6: Preserve clear and retryable button states**

Before export, disable the button and show `正在製作卡片…`. On success show `已產生下載`, then restore `下載慈語卡片` and enable it after 1400ms. On any caught error, log it, immediately enable the button, show `下載失敗，請再試一次`, then restore the original label after 1800ms.

- [ ] **Step 7: Keep the card renderable off screen with auto height**

Ensure `.download-card-host` remains at `left:-10000px`, has `width:640px`, `height:auto`, `opacity:1`, and is not `display:none` or `visibility:hidden`. Ensure `.download-card` has `width:640px`, `box-sizing:border-box`, auto content height, and the existing `.dc-*` typography and spacing rules.

- [ ] **Step 8: Run automated checks**

Run: `node --check blessing/blessing.js`

Expected: no syntax error.

Run: `node --test blessing/download-utils.test.mjs fortune/logic.test.mjs`

Expected: all Blessing utility tests and all existing Fortune tests PASS.

- [ ] **Step 9: Commit the completed browser flow**

```powershell
git add -- blessing/index.html blessing/blessing.css blessing/blessing.js
git commit -m "feat: download blessing cards by device"
```

### Task 3: Cross-device visual and download verification

**Files:**
- Modify if defects are found: `blessing/index.html`
- Modify if defects are found: `blessing/blessing.css`
- Modify if defects are found: `blessing/blessing.js`
- Test: `blessing/download-utils.test.mjs`

**Interfaces:**
- Consumes: the complete Blessing page and its `?debugIdx=<index>` deterministic result hook.
- Produces: verified desktop PDF behavior and mobile PNG behavior across short and long card content.

- [ ] **Step 1: Start a local static server**

Run: `python -m http.server 8000`

Expected: the repository is served at `http://localhost:8000/` without startup errors.

- [ ] **Step 2: Verify a desktop result card**

Open `http://localhost:8000/blessing/?debugIdx=0` at a desktop viewport near 1440×900. Confirm the result page shows one portrait, deity name, Chinese blessing, Chinese guidance, English guidance, and the download button. Click download and confirm the generated filename ends in `.pdf`, the PDF opens as one page, and no card text or portrait is clipped.

- [ ] **Step 3: Verify a long-content desktop card**

Find the longest item index with a read-only console expression over `teachings`, open that `?debugIdx=<index>`, download the PDF, and confirm the page grows proportionally rather than clipping or creating an empty second page.

- [ ] **Step 4: Verify phone and tablet PNG behavior**

Repeat at a phone viewport near 390×844 and a tablet viewport near 820×1180 with touch/mobile emulation. Confirm each download ends in `.png`, opens as a sharp image, contains the latest visible draw, and has no horizontal overflow or clipped text.

- [ ] **Step 5: Verify portrait variants and repeated draws**

Exercise an eight-immortals sprite portrait, 仁義大仙, and one `n1`–`n4` portrait. Confirm their export crops match the result page. Draw again, select a different deity, download, and confirm the second file contains only the new deity and blessing.

- [ ] **Step 6: Verify failure recovery**

Temporarily block one export CDN in browser developer tools, click download, and confirm the button shows `下載失敗，請再試一次`, becomes enabled again, and returns to `下載慈語卡片`. Remove the block and confirm retry succeeds. Do not commit any local browser override.

- [ ] **Step 7: Re-run the complete verification set**

Run: `node --check blessing/blessing.js`

Run: `node --test blessing/download-utils.test.mjs fortune/logic.test.mjs`

Expected: syntax check succeeds and every test passes with zero failures.

- [ ] **Step 8: Commit only if verification required fixes**

```powershell
git add -- blessing/index.html blessing/blessing.css blessing/blessing.js blessing/download-utils.test.mjs
git commit -m "fix: polish blessing card downloads"
```

If verification required no changes, skip this commit.
