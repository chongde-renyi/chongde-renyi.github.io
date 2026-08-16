# 照片上傳區

## 上傳照片

1. 在 GitHub 開啟 `photos/uploads/`。
2. 可先建立年份資料夾，例如 `photos/uploads/1995/`。
3. 按 `Add file` → `Upload files`，選擇 JPG、JPEG、PNG 或 WebP 圖片。
4. 完成 GitHub commit 後，系統會自動更新照片目錄。

只上傳照片、尚未填寫資料時，照片仍會顯示在網站的全部照片中，並視為未分類。

## 填寫照片資料

在 `photos/catalog.csv` 中，每張照片使用一列，欄位順序不可更改：

```csv
file,title,date,people,renyiCategories,topics,country,city,description,downloadName,alt,link
```

- `file` 必須從 `uploads/` 開始，例如 `uploads/1995/group-001.jpg`。
- 日期使用 `YYYY-MM-DD`；不知道日期可以留空。
- 多個人物或分類使用 `|` 分隔。
- 人物可填：`仁義大仙`、`老前人`、`前人老`。
- 仁義大仙分類可填：`佛堂`、`家人`、`眾道親`、`獨照`。
- 主題目前可填：`墨寶`。
- `title`、`downloadName`、`alt` 留空時，系統會使用圖片檔名。
- `link` 可留空；填入 `https://...`、`http://...` 或站內 `/...` 路徑後，照片標題會成為另開頁面的連結。

完整範例：

```csv
uploads/1995/group-001.jpg,道親大合照,1995-08-10,仁義大仙|前人老,眾道親,墨寶,臺灣,彰化,紀念活動大合照,崇德仁義-道親大合照.jpg,仁義大仙與道親活動合照,https://example.org/book
```

同一張照片只需上傳一次。完成分類後，使用者選擇仁義大仙、前人老、眾道親、墨寶或臺灣時，都可以看到這張照片。
