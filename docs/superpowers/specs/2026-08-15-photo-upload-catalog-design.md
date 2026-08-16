# 照片上傳與自動目錄設計

## 目標

讓使用者可以像上傳藏經閣電子書一樣，直接透過 GitHub 上傳照片，再以簡單 CSV 資料表補充分類；GitHub 自動產生照片頁使用的資料清單。即使尚未填寫 CSV，照片仍會出現在未分類區，不會因缺少資料而從網站消失。

## 使用流程

1. 使用者將 JPG、JPEG、PNG 或 WebP 照片上傳至 `photos/uploads/`，可按年份建立子資料夾。
2. 使用者在 `photos/catalog.csv` 為照片增加或修改一列資料。
3. GitHub Actions 在照片或 CSV 變更後執行目錄產生程式。
4. 程式掃描所有上傳照片、合併 CSV 資料，產生網站載入的 `photos/photos-data.js`。
5. GitHub Pages 更新後，照片依人物、仁義大仙子分類、主題與地區顯示。

## CSV 欄位

`photos/catalog.csv` 使用 UTF-8 編碼，第一列欄位固定為：

```csv
file,title,date,people,renyiCategories,topics,country,city,description,downloadName,alt
```

- `file`：相對於 `photos/` 的圖片路徑，例如 `uploads/2026/japan-001.jpg`；必填且唯一。
- `title`：照片標題；未填時使用檔名。
- `date`：建議使用 `YYYY-MM-DD`；未知可留空，頁面顯示 `日期未詳`。
- `people`：支援 `仁義大仙`、`老前人`、`前人老`；多個值用 `|` 分隔。
- `renyiCategories`：支援 `佛堂`、`家人`、`眾道親`、`獨照`；多個值用 `|` 分隔。
- `topics`：第一版支援 `墨寶`；多個值用 `|` 分隔。
- `country`：國家或地區，例如 `臺灣`、`日本`、`印尼`。
- `city`：城市，可留空。
- `description`：照片說明，可留空。
- `downloadName`：下載檔名；未填時使用原始檔名。
- `alt`：圖片替代文字；未填時使用標題。

範例：

```csv
file,title,date,people,renyiCategories,topics,country,city,description,downloadName,alt
uploads/1995/group-001.jpg,道親大合照,1995-08-10,仁義大仙|前人老,眾道親,墨寶,臺灣,彰化,紀念活動大合照,崇德仁義-道親大合照.jpg,仁義大仙與道親活動合照
```

## 自動目錄規則

- 遞迴掃描 `photos/uploads/` 內所有支援格式的圖片。
- 忽略隱藏檔、非圖片檔與目錄外路徑。
- 以相對路徑 `file` 對應 CSV；不得只使用檔名，以免不同年份出現同名檔案時衝突。
- CSV 有資料時，將 `|` 分隔欄位轉為 JavaScript 字串陣列。
- CSV 沒有該圖片資料時，仍建立未分類紀錄：標題、下載檔名與 alt 使用檔名，日期與說明為空，所有分類陣列為空，國家及城市為空。
- CSV 指向不存在圖片時，自動化必須失敗並列出錯誤路徑，避免網站產生破圖。
- CSV 有重複 `file`、不支援人物或分類值、格式錯誤日期，或路徑離開 `photos/uploads/` 時，自動化必須失敗並說明欄位與列號。
- 輸出依照片相對路徑穩定排序，避免每次執行產生無意義的順序變動。
- 自動產生的每筆資料維持既定介面：`id`、`src`、`downloadName`、`title`、`date`、`description`、`alt`、`people`、`renyiCategories`、`topics`、`country`、`city`。

## GitHub Actions

- Workflow 監聽 `photos/uploads/**`、`photos/catalog.csv` 與目錄產生程式。
- 使用 Python 標準函式庫處理 CSV 與 JSON／JavaScript 輸出，不新增第三方套件。
- Workflow 只提交自動產生的 `photos/photos-data.js`。
- Workflow 由 `github-actions[bot]` 產生的 commit 不再次觸發自身，避免循環。
- 提供 `workflow_dispatch`，讓使用者可在 GitHub Actions 頁面手動重建。

## 與照片頁的關係

- 照片頁只匯入 `PHOTOS`，不直接解析 CSV，也不呼叫 GitHub API。
- 有分類的照片依既定 OR 規則出現在多個篩選結果，不需複製圖片。
- 未分類照片在「全部照片」中顯示；因沒有任何分類，不會出現在人物、墨寶或地區篩選結果。
- 第一版不新增「未分類」篩選按鈕，避免改變已確認的篩選層級；管理者可在 CSV 中找到缺少資料的照片。

## 未來管理後台

未來上傳表單會寫入相同欄位並取代人工 CSV 編輯。公開照片頁的 `PHOTOS` 介面保持不變，因此不需要重寫篩選或顯示元件。角色驗證、上傳權限與刪除權限仍屬後端階段，不放在 GitHub Pages 前端。

## 驗證標準

- 上傳一張沒有 CSV 紀錄的圖片後，輸出資料包含一筆未分類照片。
- 補上 CSV 後，同一張照片得到正確人物、子分類、主題、國家與城市資料。
- `|` 分隔的多重人物與分類正確轉成陣列。
- 刪除圖片後，重新產生的資料不再包含該照片。
- 不存在圖片、重複路徑、非法分類、非法日期與越界路徑均使產生程式以非零狀態結束。
- 相同輸入連續執行兩次，輸出內容完全相同。
