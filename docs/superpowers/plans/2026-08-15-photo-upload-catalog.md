# 照片上傳與自動目錄 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓上傳至 `photos/uploads/` 的照片自動合併 `photos/catalog.csv` 分類資料，並由 GitHub Actions 產生照片頁使用的 `photos/photos-data.js`。

**Architecture:** Python 標準函式庫產生器負責掃描、CSV 驗證、預設未分類資料與穩定輸出；照片頁只依賴產生後的 ES module。GitHub Actions 監聽照片與 CSV 變更、執行測試及產生器，並只提交生成檔。

**Tech Stack:** Python 3.12 標準函式庫、`unittest`、CSV、ES module、GitHub Actions、GitHub Pages。

## Global Constraints

- 圖片只能來自 `photos/uploads/` 及其子資料夾，支援 `.jpg`、`.jpeg`、`.png`、`.webp`，副檔名不分大小寫。
- CSV 路徑固定為 `photos/catalog.csv`，UTF-8，欄位固定為 `file,title,date,people,renyiCategories,topics,country,city,description,downloadName,alt`。
- 多值欄位以 `|` 分隔；人物只允許 `仁義大仙`、`老前人`、`前人老`；子分類只允許 `佛堂`、`家人`、`眾道親`、`獨照`；主題第一版只允許 `墨寶`。
- 無 CSV 紀錄的圖片仍輸出為未分類；CSV 指向不存在圖片、重複路徑、非法分類、非法日期或越界路徑時必須失敗。
- 輸出固定為 `photos/photos-data.js`，export 名稱固定為 `PHOTOS`，資料介面與既有篩選計畫一致。
- 輸出依相對路徑穩定排序；相同輸入重跑不得改變內容。
- 不加入第三方 Python 套件；不修改或提交 `fortune/README.md`。
- 本計畫完成後，原照片頁主計畫 Task 2 改為把示範圖片放入 `photos/uploads/demo/`、把資料寫入 `photos/catalog.csv`，再由產生器更新 `photos-data.js`，不再手寫資料模組。

---

### Task 1: 目錄產生器與測試

**Files:**
- Create: `.github/scripts/build_photo_catalog.py`
- Create: `.github/scripts/test_build_photo_catalog.py`
- Create: `photos/catalog.csv`
- Create: `photos/uploads/README.md`
- Generate: `photos/photos-data.js`

**Interfaces:**
- `build_catalog(root: Path) -> list[dict[str, object]]`
- `write_catalog(root: Path, photos: list[dict[str, object]]) -> Path`
- CLI：`python .github/scripts/build_photo_catalog.py`，成功為 0，驗證錯誤為非零並輸出列號／路徑。

- [ ] **Step 1: 建立失敗測試**

使用 `tempfile.TemporaryDirectory` 建立獨立 `photos/uploads/` 與 CSV。測試必須涵蓋：

```python
def test_unlisted_image_gets_uncategorized_defaults(): ...
def test_csv_metadata_and_pipe_values_are_converted(): ...
def test_nested_images_are_sorted_by_relative_path(): ...
def test_missing_image_in_csv_is_rejected(): ...
def test_duplicate_file_rows_are_rejected(): ...
def test_unknown_person_category_and_topic_are_rejected(): ...
def test_invalid_date_is_rejected(): ...
def test_path_outside_uploads_is_rejected(): ...
def test_output_is_deterministic_es_module(): ...
```

測試圖片只需寫入少量 bytes，不解析影像內容；重點是路徑與資料行為。先匯入尚不存在的 `build_photo_catalog`，確認測試因缺少模組失敗。

- [ ] **Step 2: 實作掃描與預設資料**

遞迴掃描支援格式，忽略隱藏檔與非圖片。相對路徑一律使用 POSIX `/`。無 CSV 紀錄時產生：

```python
{
    "id": "photo-" + hashlib.sha256(file_path.encode("utf-8")).hexdigest()[:12],
    "src": file_path,
    "downloadName": Path(file_path).name,
    "title": Path(file_path).stem.replace("-", " ").replace("_", " "),
    "date": "",
    "description": "",
    "alt": Path(file_path).stem.replace("-", " ").replace("_", " "),
    "people": [],
    "renyiCategories": [],
    "topics": [],
    "country": "",
    "city": "",
}
```

- [ ] **Step 3: 實作 CSV 合併與驗證**

- 使用 `csv.DictReader`，先驗證 header 與固定欄位完全一致。
- `file` 使用 `PurePosixPath` 正規化，必須以 `uploads/` 開頭，不允許空值、絕對路徑或 `..`。
- 以 CSV 實際列號（header 為第 1 列）報告重複、非法值與日期錯誤。
- 日期非空時以 `datetime.strptime(value, "%Y-%m-%d")` 驗證。
- 多值欄位以 `|` 切割、trim、移除空項目並保持輸入順序。
- CSV 的 `title`、`downloadName`、`alt` 空白時套用預設值，其餘文字欄位可為空。

- [ ] **Step 4: 實作穩定 ES module 輸出**

```python
payload = json.dumps(photos, ensure_ascii=False, indent=2)
output = f"export const PHOTOS = {payload};\n"
```

只在內容改變時覆寫 `photos/photos-data.js`，避免無意義 timestamp／commit 變更。

- [ ] **Step 5: 執行完整測試**

Run: `python -m unittest .github/scripts/test_build_photo_catalog.py -v`

Expected: 9 個測試全部通過。

- [ ] **Step 6: 建立初始 CSV 與上傳說明**

`photos/catalog.csv` 只含固定 header。`photos/uploads/README.md` 以繁體中文說明 GitHub 上傳、每張照片一列、`|` 多值、未填仍顯示為未分類，並提供完整範例列。

- [ ] **Step 7: 產生初始空資料模組並提交**

Run: `python .github/scripts/build_photo_catalog.py`

Expected: `photos/photos-data.js` 為 `export const PHOTOS = [];`。

Run: `git diff --check`

```powershell
git add .github/scripts/build_photo_catalog.py .github/scripts/test_build_photo_catalog.py photos/catalog.csv photos/uploads/README.md photos/photos-data.js
git commit -m "feat: generate photo catalogue from uploads"
```

### Task 2: GitHub 自動更新 Workflow

**Files:**
- Create: `.github/workflows/update-photo-catalog.yml`

**Interfaces:**
- Consumes: Task 1 CLI 與測試檔。
- Produces: 在 `main` 照片／CSV／產生器變更後自動提交 `photos/photos-data.js`。

- [ ] **Step 1: 建立 workflow 靜態測試並確認失敗**

在 Task 1 測試中加入讀取 workflow 的測試，斷言：監聽 `photos/uploads/**`、`photos/catalog.csv`、產生器、測試檔；具 `workflow_dispatch`；permissions 為 `contents: write`；依序 checkout、setup-python 3.12、unittest、產生器、只 `git add photos/photos-data.js`。因 workflow 尚不存在先確認失敗。

- [ ] **Step 2: 建立 workflow**

```yaml
name: Update photo catalogue

on:
  push:
    branches: [main]
    paths:
      - "photos/uploads/**"
      - "photos/catalog.csv"
      - ".github/scripts/build_photo_catalog.py"
      - ".github/scripts/test_build_photo_catalog.py"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  catalogue:
    if: github.actor != 'github-actions[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: python -m unittest .github/scripts/test_build_photo_catalog.py -v
      - run: python .github/scripts/build_photo_catalog.py
      - name: Commit updated photo catalogue
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add photos/photos-data.js
          git diff --cached --quiet || git commit -m "Update photo catalogue"
          git push
```

- [ ] **Step 3: 執行完整測試與產生器**

Run: `python -m unittest .github/scripts/test_build_photo_catalog.py -v`

Run: `python .github/scripts/build_photo_catalog.py`

Expected: 全部通過，產生器第二次執行不改變 `photos/photos-data.js`。

- [ ] **Step 4: 檢查並提交 workflow**

Run: `git diff --check`

```powershell
git add .github/workflows/update-photo-catalog.yml .github/scripts/test_build_photo_catalog.py
git commit -m "ci: update photo catalogue after uploads"
```

### Task 3: 整合回歸與主計畫接續點

**Files:**
- Modify only if a verified defect exists: `.github/scripts/build_photo_catalog.py`, `.github/scripts/test_build_photo_catalog.py`, `.github/workflows/update-photo-catalog.yml`, `photos/catalog.csv`, `photos/photos-data.js`

**Interfaces:**
- Produces: 後續照片示範資料可直接走真實上傳流程。

- [ ] **Step 1: 以暫存資料驗證完整流程**

在測試暫存目錄加入一張未分類圖片與一張含多重標籤圖片，確認輸出模組包含兩筆、未分類預設正確、多重值為陣列、路徑可由 `photos/index.html` 相對載入。

- [ ] **Step 2: 驗證重跑穩定性**

記錄 `photos/photos-data.js` SHA-256，連續執行產生器兩次，再次計算；三次 hash 必須相同。

- [ ] **Step 3: 驗證 Git 範圍**

Run: `git diff --check`

Run: `git status --short`

Expected: 功能檔案均已提交；`fortune/README.md` 保留為使用者原有未提交變更。

- [ ] **Step 4: 停在照片示範資料前**

下一項實作改為：生成示範圖片至 `photos/uploads/demo/`、把七筆資料加入 `photos/catalog.csv`、執行產生器、驗證既有 8 個篩選測試與資料契約，再獨立提交。不得手動編輯生成的單筆 `PHOTOS` 資料。
