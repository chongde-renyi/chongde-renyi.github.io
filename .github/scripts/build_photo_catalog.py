from __future__ import annotations

import csv
import hashlib
import json
import sys
from datetime import datetime
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse


CSV_FIELDS = [
    "file", "title", "date", "people", "renyiCategories", "topics",
    "country", "city", "description", "downloadName", "alt", "link",
]
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
INK_CATEGORY_RULES = [
    ("朱玖塋贈送之墨寶", ("朱玖塋墨寶",)),
    ("開台尊王借發書", ("勸化鸞音",)),
    ("對聯", ("對聯",)),
    ("文章", ("文章",)),
    ("佛", ("佛字", "/佛/")),
    ("博愛", ("博愛",)),
    ("四海一家", ("四海一家",)),
    ("慈悲喜捨", ("慈悲喜捨",)),
    ("浩然正氣", ("浩然正氣",)),
    ("龍馬精神", ("龍馬精神",)),
    ("仁者無敵", ("仁者無敵",)),
]
ALLOWED_VALUES = {
    "people": {"仁義大仙", "老前人", "前人老"},
    "renyiCategories": {"佛堂", "家人", "眾道親", "獨照"},
    "topics": {"墨寶"},
}


class CatalogError(ValueError):
    pass


def split_values(value: str) -> list[str]:
    return [part.strip() for part in value.split("|") if part.strip()]


def default_photo(file_path: str) -> dict[str, object]:
    path = PurePosixPath(file_path)
    title = path.stem.replace("-", " ").replace("_", " ")
    return {
        "id": "photo-" + hashlib.sha256(file_path.encode("utf-8")).hexdigest()[:12],
        "src": file_path,
        "downloadName": path.name,
        "title": title,
        "date": "",
        "description": "",
        "alt": title,
        "people": [],
        "renyiCategories": [],
        "topics": [],
        "inkCategories": [],
        "country": "",
        "city": "",
        "link": "",
    }


def infer_ink_categories(file_path: str, title: str, topics: list[str]) -> list[str]:
    if "墨寶" not in topics:
        return []
    searchable = f"{file_path}/{title}"
    for category, markers in INK_CATEGORY_RULES:
        if any(marker in searchable for marker in markers):
            return [category]
    return ["其他"]


def scan_images(root: Path) -> list[str]:
    photos_dir = root / "photos"
    uploads_dir = photos_dir / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    paths = []
    for path in uploads_dir.rglob("*"):
        relative_parts = path.relative_to(uploads_dir).parts
        if not path.is_file() or any(part.startswith(".") for part in relative_parts):
            continue
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        paths.append(path.relative_to(photos_dir).as_posix())
    return sorted(paths)


def validate_file_path(value: str, line_number: int, photos_dir: Path) -> str:
    normalized = value.strip().replace("\\", "/")
    path = PurePosixPath(normalized)
    if (
        not normalized
        or path.is_absolute()
        or not path.parts
        or path.parts[0] != "uploads"
        or ".." in path.parts
    ):
        raise CatalogError(f"第 {line_number} 列 file 必須位於 uploads/ 內")
    resolved = (photos_dir / Path(*path.parts)).resolve()
    uploads_resolved = (photos_dir / "uploads").resolve()
    if not resolved.is_relative_to(uploads_resolved):
        raise CatalogError(f"第 {line_number} 列 file 必須位於 uploads/ 內")
    return path.as_posix()


def read_metadata(root: Path, image_paths: set[str]) -> dict[str, dict[str, object]]:
    photos_dir = root / "photos"
    catalog_path = photos_dir / "catalog.csv"
    if not catalog_path.exists():
        return {}

    metadata = {}
    with catalog_path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != CSV_FIELDS:
            raise CatalogError(
                "catalog.csv 欄位必須完全等於：" + ",".join(CSV_FIELDS)
            )
        for line_number, row in enumerate(reader, start=2):
            file_path = validate_file_path(row["file"], line_number, photos_dir)
            if file_path in metadata:
                raise CatalogError(f"第 {line_number} 列 file 重複：{file_path}")
            if file_path not in image_paths:
                raise CatalogError(f"第 {line_number} 列圖片不存在：{file_path}")

            date = row["date"].strip()
            if date:
                try:
                    datetime.strptime(date, "%Y-%m-%d")
                except ValueError as error:
                    raise CatalogError(
                        f"第 {line_number} 列 date 必須使用 YYYY-MM-DD：{date}"
                    ) from error

            parsed_lists = {}
            for field, allowed in ALLOWED_VALUES.items():
                values = split_values(row[field])
                invalid = [value for value in values if value not in allowed]
                if invalid:
                    raise CatalogError(
                        f"第 {line_number} 列 {field} 含有不支援的值：{'|'.join(invalid)}"
                    )
                parsed_lists[field] = values

            link = (row.get("link") or "").strip()
            if link:
                parsed = urlparse(link)
                is_web_link = parsed.scheme in {"http", "https"} and bool(parsed.netloc)
                is_site_link = link.startswith("/") and not link.startswith("//")
                if not (is_web_link or is_site_link):
                    raise CatalogError(
                        f"第 {line_number} 列 link 必須是 https://、http:// 或站內 / 路徑"
                    )

            metadata[file_path] = {
                "title": row["title"].strip(),
                "date": date,
                "people": parsed_lists["people"],
                "renyiCategories": parsed_lists["renyiCategories"],
                "topics": parsed_lists["topics"],
                "country": row["country"].strip(),
                "city": row["city"].strip(),
                "description": row["description"].strip(),
                "downloadName": row["downloadName"].strip(),
                "alt": row["alt"].strip(),
                "link": link,
            }
    return metadata


def build_catalog(root: Path) -> list[dict[str, object]]:
    image_paths = scan_images(root)
    metadata = read_metadata(root, set(image_paths))
    photos = []
    for file_path in image_paths:
        photo = default_photo(file_path)
        details = metadata.get(file_path)
        if details:
            for field in ("date", "people", "renyiCategories", "topics", "country", "city", "description", "link"):
                photo[field] = details[field]
            for field in ("title", "downloadName", "alt"):
                if details[field]:
                    photo[field] = details[field]
        photo["inkCategories"] = infer_ink_categories(
            file_path, str(photo["title"]), list(photo["topics"]),
        )
        photos.append(photo)
    return photos


def write_catalog(root: Path, photos: list[dict[str, object]]) -> Path:
    output_path = root / "photos" / "photos-data.js"
    output = "export const PHOTOS = " + json.dumps(
        photos, ensure_ascii=False, indent=2,
    ) + ";\n"
    current = output_path.read_text(encoding="utf-8") if output_path.exists() else None
    if current != output:
        output_path.write_text(output, encoding="utf-8", newline="\n")
    return output_path


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    try:
        photos = build_catalog(root)
        output_path = write_catalog(root, photos)
    except CatalogError as error:
        print(f"照片目錄產生失敗：{error}", file=sys.stderr)
        return 1
    print(f"照片目錄已更新：{output_path.relative_to(root)}（{len(photos)} 張）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
