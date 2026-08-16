# 崇德仁義總頁與照片頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首頁加入 Fortune、Blessing 與照片入口，並建立可依人物、仁義大仙子分類、墨寶及地區篩選、完整直向瀏覽與下載原圖的 `/photos/` 靜態照片頁。

**Architecture:** 照片資料、純篩選規則與 DOM 呈現分成三個 ES module，讓第一版使用本地資料，未來可在不改 UI 介面的前提下換成後端 API。純邏輯以瀏覽器測試頁做 TDD；頁面沿用首頁視覺語言，桌機採左側篩選欄，平板與手機將篩選器移到照片流上方。

**Tech Stack:** 靜態 HTML5、CSS3、原生 JavaScript ES modules、瀏覽器測試頁、GitHub Pages；不新增套件或建置流程。

## Global Constraints

- 公開網址固定為 `/photos/`；導覽名稱固定為 `照片`；頁面主標題固定為 `崇德仁義 照片`。
- 首頁主要選單新增 `Fortune`、`Blessing`、`照片`，分別連到 `/fortune/`、`/blessing/`、`/photos/`；主視覺新增 Fortune 按鈕並保留 Blessing 與藏經閣入口。
- 不使用世界地圖、燈箱放大或照片獨立詳情頁；照片依原始比例完整顯示並持續向下排列。
- 第一層篩選為 `仁義大仙`、`老前人`、`前人老`、`墨寶`、`地區`；仁義大仙第二層為 `佛堂`、`家人`、`眾道親`、`獨照`；地區第二層由資料內的國家／地區動態產生。
- 未選條件顯示全部；不同第一層條件採 OR；仁義大仙子分類採 `仁義大仙 AND 任一已選子分類`，再與其他第一層條件 OR；多地區彼此 OR。
- 第一版只使用同源本地示範資料與圖片。管理者登入、角色權限、上傳、刪除、訓文與電子書管理不在本次範圍。
- 原有 Fortune、Blessing、藏經閣及首頁內容不得失效；不得修改或提交使用者現有的 `fortune/README.md` 變更。
- 所有互動使用原生鍵盤可操作控制；下載按鈕具足夠觸控面積；桌機、平板、手機不得水平溢出。

---

## File Map

- Create `photos/filter-logic.mjs`: 純篩選規則與國家清單函式，不存取 DOM。
- Create `photos/filter-logic.browser-test.html`: 可直接在瀏覽器執行的測試入口與結果狀態。
- Create `photos/filter-logic.browser-test.mjs`: 篩選規則的測試資料、斷言與測試案例。
- Create `photos/photos-data.js`: 照片資料陣列；未來可由 API adapter 取代。
- Create `photos/images/sample-*.jpg`: 具明確示範性質的本地圖片資產。
- Create `photos/index.html`: 照片頁語意結構、導覽、篩選器容器、結果區與頁尾。
- Create `photos/photos.css`: 照片頁視覺、桌機雙欄與行動版單欄響應式規則。
- Create `photos/photos.js`: 動態建立篩選器與照片卡、同步狀態、下載與錯誤回饋。
- Modify `index.html`: 新增導覽與主視覺入口，讓照片導覽前往 `/photos/`。
- Modify `styles.css`: 容納新增導覽與主視覺按鈕，維持手機無水平溢出。

### Task 1: 純篩選模型與瀏覽器測試

**Files:**
- Create: `photos/filter-logic.mjs`
- Create: `photos/filter-logic.browser-test.html`
- Create: `photos/filter-logic.browser-test.mjs`

**Interfaces:**
- Consumes: `photo` 物件的 `people: string[]`、`renyiCategories: string[]`、`topics: string[]`、`country: string`。
- Produces: `matchesPhoto(photo, filters): boolean`、`filterPhotos(photos, filters): object[]`、`getAvailableCountries(photos): string[]`。
- `filters` 固定形狀：`{ people: Set<string>, renyiCategories: Set<string>, topics: Set<string>, countries: Set<string> }`。

- [ ] **Step 1: 建立會先失敗的瀏覽器測試入口**

```html
<!doctype html>
<html lang="zh-Hant">
<head><meta charset="utf-8"><title>照片篩選測試</title></head>
<body>
  <p id="test-status" data-test-status="running">測試執行中</p>
  <pre id="test-output"></pre>
  <script type="module" src="filter-logic.browser-test.mjs"></script>
</body>
</html>
```

在 `filter-logic.browser-test.mjs` 匯入尚未存在的三個函式，建立至少六筆最小測試照片，並加入這些具名案例：

```js
test('未選條件時保留全部照片', () => { /* 預期全部 id */ });
test('只選仁義大仙時包含所有仁義大仙照片', () => { /* 不限子分類 */ });
test('仁義大仙多個子分類在組內採 OR', () => { /* 佛堂或獨照 */ });
test('老前人、前人老與墨寶跨組採 OR', () => { /* 任一符合 */ });
test('多個國家在地區組內採 OR', () => { /* 臺灣或日本 */ });
test('仁義大仙佛堂與日本跨組採 OR', () => { /* (仁義大仙 AND 佛堂) OR 日本 */ });
test('沒有符合條件時回傳空陣列', () => { /* 不存在的國家 */ });
test('國家清單去重並依 zh-Hant 排序', () => { /* 不含空字串 */ });
```

測試 runner 成功時設定 `data-test-status="passed"`，失敗時設定 `data-test-status="failed"` 並把錯誤堆疊寫入 `#test-output`。

- [ ] **Step 2: 在瀏覽器確認測試先失敗**

Run: 以本地靜態伺服器開啟 `http://127.0.0.1:8000/photos/filter-logic.browser-test.html`。

Expected: `#test-status[data-test-status="failed"]`，錯誤指出無法載入 `filter-logic.mjs` 或找不到 export。

- [ ] **Step 3: 實作最小純函式**

```js
export function matchesPhoto(photo, filters) {
  const hasTopLevelSelection = filters.people.size > 0
    || filters.renyiCategories.size > 0
    || filters.topics.size > 0
    || filters.countries.size > 0;
  if (!hasTopLevelSelection) return true;

  const renyiSelected = filters.people.has('仁義大仙') || filters.renyiCategories.size > 0;
  const renyiMatch = renyiSelected
    && photo.people.includes('仁義大仙')
    && (filters.renyiCategories.size === 0
      || photo.renyiCategories.some((value) => filters.renyiCategories.has(value)));
  const otherPeopleMatch = photo.people.some(
    (value) => value !== '仁義大仙' && filters.people.has(value),
  );
  const topicMatch = photo.topics.some((value) => filters.topics.has(value));
  const countryMatch = filters.countries.has(photo.country);
  return renyiMatch || otherPeopleMatch || topicMatch || countryMatch;
}

export function filterPhotos(photos, filters) {
  return photos.filter((photo) => matchesPhoto(photo, filters));
}

export function getAvailableCountries(photos) {
  return [...new Set(photos.map((photo) => photo.country).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}
```

- [ ] **Step 4: 重新執行測試確認全部通過**

Expected: `#test-status[data-test-status="passed"]`，輸出列出 8 個通過案例且瀏覽器 console 無錯誤。

- [ ] **Step 5: 檢查並提交純邏輯**

Run: `git diff --check`

```powershell
git add photos/filter-logic.mjs photos/filter-logic.browser-test.html photos/filter-logic.browser-test.mjs
git commit -m "test: define photo filtering behavior"
```

### Task 2: 本地示範圖片與統一資料介面

**Files:**
- Create: `photos/photos-data.js`
- Create: `photos/images/sample-temple.jpg`
- Create: `photos/images/sample-family.jpg`
- Create: `photos/images/sample-community.jpg`
- Create: `photos/images/sample-portrait.jpg`
- Create: `photos/images/sample-elder.jpg`
- Create: `photos/images/sample-predecessor.jpg`
- Create: `photos/images/sample-calligraphy.jpg`

**Interfaces:**
- Consumes: Task 1 定義的欄位形狀。
- Produces: `export const PHOTOS`，每筆都有 `id`、`src`、`downloadName`、`title`、`date`、`description`、`alt`、`people`、`renyiCategories`、`topics`、`country`、`city`。

- [ ] **Step 1: 先擴充資料契約測試並確認失敗**

在 `filter-logic.browser-test.mjs` 加入 `import { PHOTOS } from './photos-data.js'`，逐筆斷言：id 唯一；必要字串非空；陣列欄位皆為陣列；`src` 以 `images/` 開頭；下載檔名以 `.jpg` 結尾；資料集合涵蓋三種人物、四個仁義大仙子分類、墨寶及至少三個國家／地區。

Expected: FAIL，因 `photos-data.js` 尚不存在。

- [ ] **Step 2: 產生七張尊重宗教文化的示範圖片**

使用 imagegen 技能產生不影射真實人物、不宣稱為史料的通用示範影像：佛堂內景、家庭合影、道親團體、人物獨照意象、長者活動、前輩活動、書法墨寶。輸出上述固定檔名，每張長邊至少 1600px，避免圖片內生成可誤認為真實史料的日期或姓名。

- [ ] **Step 3: 建立完整示範資料**

```js
export const PHOTOS = [
  {
    id: 'photo-001',
    src: 'images/sample-temple.jpg',
    downloadName: '崇德仁義-佛堂示範照片.jpg',
    title: '佛堂紀念影像（示範）',
    date: '2026-01-01',
    description: '本圖為版面與分類功能示範，日後可直接替換為正式史料。',
    alt: '佛堂空間的示範影像',
    people: ['仁義大仙'],
    renyiCategories: ['佛堂'],
    topics: [],
    country: '臺灣',
    city: '彰化'
  },
  {
    id: 'photo-002', src: 'images/sample-family.jpg',
    downloadName: '崇德仁義-家人示範照片.jpg', title: '家人相聚（示範）', date: '',
    description: '本圖為版面與分類功能示範，日後可直接替換為正式史料。',
    alt: '家人相聚的示範影像', people: ['仁義大仙'], renyiCategories: ['家人'],
    topics: [], country: '臺灣', city: '臺中'
  },
  {
    id: 'photo-003', src: 'images/sample-community.jpg',
    downloadName: '崇德仁義-眾道親示範照片.jpg', title: '道親相聚（示範）', date: '2026-02-01',
    description: '本圖為版面與分類功能示範，日後可直接替換為正式史料。',
    alt: '團體相聚的示範影像', people: ['仁義大仙'], renyiCategories: ['眾道親'],
    topics: [], country: '印尼', city: '泗水'
  },
  {
    id: 'photo-004', src: 'images/sample-portrait.jpg',
    downloadName: '崇德仁義-獨照示範照片.jpg', title: '人物留影（示範）', date: '',
    description: '本圖為版面與分類功能示範，不代表任何真實人物。',
    alt: '人物獨照構圖的示範影像', people: ['仁義大仙'], renyiCategories: ['獨照'],
    topics: [], country: '日本', city: '東京'
  },
  {
    id: 'photo-005', src: 'images/sample-elder.jpg',
    downloadName: '崇德仁義-老前人示範照片.jpg', title: '前輩活動紀錄（示範）', date: '2026-03-01',
    description: '本圖為版面與分類功能示範，不代表任何真實人物。',
    alt: '長者參與活動的示範影像', people: ['老前人'], renyiCategories: [],
    topics: [], country: '臺灣', city: '彰化'
  },
  {
    id: 'photo-006', src: 'images/sample-predecessor.jpg',
    downloadName: '崇德仁義-前人老示範照片.jpg', title: '修辦足跡（示範）', date: '2026-04-01',
    description: '本圖為版面與分類功能示範，不代表任何真實人物。',
    alt: '前輩參與聚會的示範影像', people: ['前人老'], renyiCategories: [],
    topics: [], country: '日本', city: '大阪'
  },
  {
    id: 'photo-007', src: 'images/sample-calligraphy.jpg',
    downloadName: '崇德仁義-墨寶示範照片.jpg', title: '墨寶典藏（示範）', date: '',
    description: '本圖為版面與分類功能示範，日後可直接替換為正式史料。',
    alt: '書法墨寶的示範影像', people: ['仁義大仙'], renyiCategories: ['佛堂'],
    topics: ['墨寶'], country: '印尼', city: ''
  }
];
```

實際檔案需完整使用上述七筆資料，且每個 `src` 對應真實檔案。

- [ ] **Step 4: 執行資料契約與篩選測試**

Expected: 所有測試 PASS；瀏覽器 Network 無圖片 404；七筆 `downloadName` 皆唯一。

- [ ] **Step 5: 檢查並提交示範資料**

Run: `git diff --check`

```powershell
git add photos/photos-data.js photos/images
git commit -m "feat: add photo gallery demo content"
```

### Task 3: 照片頁、篩選互動與下載

**Files:**
- Create: `photos/index.html`
- Create: `photos/photos.css`
- Create: `photos/photos.js`

**Interfaces:**
- Consumes: `PHOTOS`、`filterPhotos(photos, filters)`、`getAvailableCountries(photos)`。
- Produces: `readFilters(): Filters`、`renderPhotos(photos): void`、`renderCountries(countries): void`、`clearFilters(): void`；DOM 暴露 `#photo-count`、`#photo-feed`、`#empty-state`、`#clear-filters` 供整合測試。

- [ ] **Step 1: 寫靜態結構並先驗證缺少互動**

建立 `photos/index.html`，包含 skip link、與首頁一致的品牌頁首、Fortune／Blessing／照片導覽、`h1`、桌機側欄與行動版 `<details>` 共用的 checkbox 容器、結果數、照片流、空狀態及頁尾。載入：

```html
<link rel="stylesheet" href="photos.css?v=1">
<script type="module" src="photos.js?v=1"></script>
```

開啟頁面後先確認 `#photo-feed` 為空，證明動態呈現尚未實作。

- [ ] **Step 2: 建立篩選控制與單欄照片卡**

`photos.js` 以資料驅動方式：

```js
import { PHOTOS } from './photos-data.js';
import { filterPhotos, getAvailableCountries } from './filter-logic.mjs';

function photoCard(photo) {
  const dateText = photo.date || '日期未詳';
  const location = [photo.country, photo.city].filter(Boolean).join(' · ');
  // 使用 createElement/textContent 建立 article、img、標題、日期、說明、標籤與下載 a。
  // a.href = photo.src; a.download = photo.downloadName; a.textContent = '下載照片'。
}
```

checkbox 的 `value` 必須直接使用資料模型中的固定文字；每次 `change` 呼叫 `readFilters()` 與 `filterPhotos()` 後重繪。`仁義大仙` 子項有任何勾選時，自動讓該分支生效，不要求父 checkbox 也勾選。

- [ ] **Step 3: 加入結果、清除與圖片錯誤狀態**

- `#photo-count` 顯示 `共 N 張照片`。
- 無結果時隱藏照片流、顯示 `找不到符合條件的照片` 與可操作的 `清除篩選`。
- 頁面上方另提供常駐清除按鈕，無選取時 disabled。
- `img` 發生 `error` 時加上 `.image-error`，以文字 `圖片暫時無法載入` 取代破圖區，但保留標題、說明與下載連結。
- 下載連結直接使用同源 `photo.src` 及 `download` 屬性，不以 Canvas 重新編碼。

- [ ] **Step 4: 實作桌機與行動版 CSS**

CSS 固定要求：

```css
.photos-layout { display:grid; grid-template-columns:minmax(230px,280px) minmax(0,1fr); gap:clamp(24px,4vw,56px); }
.filter-panel { position:sticky; top:96px; align-self:start; max-height:calc(100vh - 120px); overflow:auto; }
.photo-card img { display:block; width:100%; height:auto; object-fit:contain; }
.download-button { min-height:44px; display:inline-flex; align-items:center; justify-content:center; }
@media (max-width:900px) {
  .photos-layout { grid-template-columns:1fr; }
  .desktop-filters { display:none; }
  .mobile-filters { display:block; }
}
```

另設 `overflow-wrap:anywhere`、容器 `min-width:0`，並於 `prefers-reduced-motion: reduce` 停用非必要 transition。

- [ ] **Step 5: 在瀏覽器做功能驗證**

依序驗證：初始 7 張；只選仁義大仙；只選佛堂子項；佛堂加日本顯示聯集；臺灣加印尼顯示聯集；墨寶加前人老顯示聯集；選不存在的測試地區可觸發空狀態；清除後恢復 7 張。點擊一個下載連結前，檢查 `href` 為同源圖片且 `download` 等於資料指定檔名。

- [ ] **Step 6: 檢查並提交照片頁**

Run: `git diff --check`

```powershell
git add photos/index.html photos/photos.css photos/photos.js
git commit -m "feat: build filterable photo gallery"
```

### Task 4: 首頁導覽與 Fortune 主視覺入口

**Files:**
- Modify: `index.html`（頁首 `#site-nav`、`.hero-actions`、首頁照片區入口）
- Modify: `styles.css`（桌機導覽間距與新增按鈕的響應式容納）

**Interfaces:**
- Consumes: 現有 `.menu-toggle` 與 `script.js` 的 `nav.open` 機制。
- Produces: 首頁桌機與手機皆可前往 `/fortune/`、`/blessing/`、`/photos/`。

- [ ] **Step 1: 記錄修改前的導覽檢查**

在瀏覽器讀取 `#site-nav a` 與 `.hero-actions a` 的文字及 href。

Expected before change: 導覽沒有 Fortune／Blessing，照片仍為 `#gallery`；主視覺沒有 Fortune。

- [ ] **Step 2: 修改首頁連結**

在 `#site-nav` 保留原有內容順序並加入：

```html
<a href="/fortune/">Fortune</a>
<a href="/blessing/">Blessing</a>
<a href="/photos/">照片</a>
```

移除原本指向 `#gallery` 的重複照片導覽。在 `.hero-actions` 加入：

```html
<a class="button" href="/fortune/">抽取六十甲子籤</a>
```

現有藏經閣與 `領受仙佛慈語` 按鈕均保留。首頁原照片縮圖區可保留，但在區內加入前往 `/photos/` 的文字連結，避免使用者誤以為四張即完整典藏。

- [ ] **Step 3: 調整導覽響應式樣式**

將桌機 `nav` gap 改為可容納新增項目的 `clamp(12px,1.7vw,24px)`，必要時把導覽文字縮至 14px；在首頁按鈕容器確認 `flex-wrap:wrap` 生效。不得改壞 `@media(max-width:760px)` 的展開式選單。

- [ ] **Step 4: 驗證桌機與手機導覽**

在 1440×900 與 390×844 驗證：三個新入口 href 正確；手機按鈕開啟選單後所有項目可見且可鍵盤操作；頁面 `document.documentElement.scrollWidth === document.documentElement.clientWidth`。

- [ ] **Step 5: 檢查並提交首頁整合**

Run: `git diff --check`

```powershell
git add index.html styles.css
git commit -m "feat: link homepage to fortune blessing and photos"
```

### Task 5: 完整回歸、視覺 QA 與發布前檢查

**Files:**
- Modify only if a verified defect is found: `photos/index.html`, `photos/photos.css`, `photos/photos.js`, `index.html`, `styles.css`

**Interfaces:**
- Consumes: Tasks 1–4 的完整成果。
- Produces: 可安全推送到 GitHub Pages 的已驗證版本；本任務不自行 push，除非使用者當時明確要求。

- [ ] **Step 1: 重跑自動瀏覽器測試**

Open: `http://127.0.0.1:8000/photos/filter-logic.browser-test.html`

Expected: `data-test-status="passed"`，全部案例通過且 console 無錯誤。

- [ ] **Step 2: 三種尺寸視覺檢查照片頁**

在 1440×900、820×1180、390×844 各自確認：無水平溢出；桌機左側篩選欄不遮頁尾；平板與手機篩選器位於照片上方且可展開；圖片完整、不裁切；說明與 44px 以上下載按鈕可讀可點。

- [ ] **Step 3: 驗證所有篩選分支與故障回饋**

操作每個第一層、四個仁義大仙子分類、至少兩個地區複選、跨組 OR、清除與空狀態。暫時在瀏覽器內把一張圖片 `src` 改為不存在路徑，確認顯示 `圖片暫時無法載入` 且卡片文字仍在；刷新頁面還原，不能把故障路徑寫回檔案。

- [ ] **Step 4: 回歸首頁與既有功能**

確認首頁桌機／手機選單、主視覺按鈕、藏經閣入口可用；開啟 `/fortune/` 與 `/blessing/` 確認頁面可載入且沒有因首頁 CSS／JS 修改造成 console error。

- [ ] **Step 5: 最終工作樹檢查**

```powershell
git diff --check
git status --short
git log -5 --oneline
```

Expected: `git diff --check` 無輸出；本功能檔案已提交；`fortune/README.md` 仍維持使用者原有未提交狀態且未出現在任何本功能 commit 中。

- [ ] **Step 6: 若 QA 修正過檔案則單獨提交**

```powershell
git add photos/index.html photos/photos.css photos/photos.js index.html styles.css
git commit -m "fix: refine photo gallery responsive behavior"
```

只 stage 實際修正且屬本功能的檔案；若無修正，此步不建立空 commit。
