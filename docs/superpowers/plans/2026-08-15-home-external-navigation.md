# 首頁外部導覽精簡 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將首頁頂部選單精簡為四個獨立頁面入口，並使用指定的繁體中文名稱。

**Architecture:** 只修改首頁 `#site-nav` 的靜態 HTML，不更動主視覺按鈕、首頁內容或既有手機選單 JavaScript。以 PowerShell 原始碼斷言執行 RED／GREEN 測試，再做響應式原始碼與 Git 範圍檢查。

**Tech Stack:** HTML5、現有 CSS／JavaScript、PowerShell 靜態斷言、Git。

## Global Constraints

- 頂部選單只保留並依序顯示 `藏經閣`、`照片`、`求籤`、`仙佛詞語`。
- 連結依序為現有藏經閣網址、`/photos/`、`/fortune/`、`/blessing/`。
- 移除 `首頁`、`仁義大仙`、`訓文`、`修辦歷程`、`紀念文` 等首頁內部錨點。
- 主視覺四個按鈕及首頁所有內容不變；`script.js`、`styles.css` 不修改。
- `fortune/README.md` 不得修改、stage 或 commit。
- 完成本項後停止，讓使用者選擇繼續、同步 GitHub或暫停。

---

### Task 1: 精簡首頁頂部導覽

**Files:**
- Modify: `index.html`（只修改 `<nav id="site-nav">` 內容）
- Test: `.superpowers/sdd/2026-08-15-home-external-navigation/assert-navigation.ps1`（Git 忽略的暫存測試）

**Interfaces:**
- Consumes: 現有 `script.js` 對 `#site-nav`、`.menu-toggle`、`.open` 的操作。
- Produces: 四個依指定順序排列的外部頁面導覽連結。

- [ ] **Step 1: 寫入失敗的靜態斷言**

測試擷取 `<nav id="site-nav">...</nav>`，斷言其中連結陣列必須完全等於：

```powershell
@(
  @{ Text = '藏經閣'; Href = 'https://fycd-renyi.github.io/library/' },
  @{ Text = '照片'; Href = '/photos/' },
  @{ Text = '求籤'; Href = '/fortune/' },
  @{ Text = '仙佛詞語'; Href = '/blessing/' }
)
```

另斷言 nav 內不存在 `href="#`，並確認 `.hero-actions` 仍含 `認識仁義大仙`、`進入藏經閣`、`領受仙佛慈語`、`抽取六十甲子籤`。

- [ ] **Step 2: 執行測試並確認 RED**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File .\.superpowers\sdd\2026-08-15-home-external-navigation\assert-navigation.ps1`

Expected: FAIL，指出目前仍存在 `首頁` 或 `Fortune`，導覽陣列與預期不符。

- [ ] **Step 3: 最小修改 `index.html`**

將 `#site-nav` 完整改為：

```html
<nav id="site-nav" aria-label="主要導覽">
  <a href="https://fycd-renyi.github.io/library/">藏經閣</a>
  <a href="/photos/">照片</a>
  <a href="/fortune/">求籤</a>
  <a href="/blessing/">仙佛詞語</a>
</nav>
```

- [ ] **Step 4: 重新執行測試並確認 GREEN**

Expected: PASS，四個文字、href、順序、零首頁錨點與四個主視覺按鈕全部通過。

- [ ] **Step 5: 驗證修改範圍**

Run: `git diff --check`

Run: `git diff --name-only HEAD`

Expected: 只有 `index.html`；`fortune/README.md` 是既存未提交檔案，不得 stage。

- [ ] **Step 6: 獨立提交**

```powershell
git add -- index.html
git commit -m "refactor: simplify homepage navigation"
```

- [ ] **Step 7: 提交後驗證**

重新執行靜態斷言與 `git diff --check`，確認 `git show --name-only --format= HEAD` 只有 `index.html`，並停止等待使用者選擇。
