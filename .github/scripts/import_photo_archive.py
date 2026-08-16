from __future__ import annotations

import argparse
import csv
import hashlib
import re
import shutil
import tempfile
import unicodedata
import zipfile
from pathlib import Path, PurePosixPath

from PIL import Image


CSV_FIELDS = [
    "file", "title", "date", "people", "renyiCategories", "topics",
    "country", "city", "description", "downloadName", "alt",
]
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
COUNTRIES = {
    "1日本": "日本",
    "2泰國": "泰國",
    "6大陸": "中國大陸",
}
CATEGORIES = {
    "佛堂中": "佛堂",
    "家人": "家人",
    "眾道親": "眾道親",
    "獨照": "獨照",
}


def clean_stem(stem: str) -> str:
    value = unicodedata.normalize("NFC", stem).strip()
    value = re.sub(r"[（(]\s*原版\s*[）)]", "", value)
    value = re.sub(r"(?:[_\s-]*原版)$", "", value)
    value = re.sub(r"(?:日本|泰國|印尼|新加坡|中國大陸|大陸)$", "", value).strip()
    value = re.sub(r"(?:[_\s-]*\d+(?:JPG)?)(?:[（(].*)?$", "", value, flags=re.IGNORECASE)
    value = re.sub(r"(?:[_\s-]*\d+|[（(]\s*\d+\s*[）)])+$", "", value)
    value = re.sub(r"[_]+", "", value)
    value = re.sub(r"\s+", " ", value).strip(" -_（）()")
    return value


def fallback_title(path: PurePosixPath) -> str:
    top = path.parts[0]
    if top == "墨寶":
        for parent in reversed(path.parts[1:-1]):
            candidate = clean_stem(parent)
            if candidate and candidate not in {"方老點傳師", "方老點傳師寫書法", "其他"}:
                return candidate if candidate.endswith("墨寶") else f"{candidate}墨寶"
        return "墨寶"
    return {
        "家人": "家人照片",
        "獨照": "仁義大仙獨照",
        "眾道親": "眾道親照片",
        "佛堂中": "佛堂照片",
        "傳題": "傳題照片",
        "追思會": "追思會照片",
    }.get(top, "典藏照片")


def infer_title(relative_path: str) -> str:
    path = PurePosixPath(relative_path)
    top = path.parts[0]
    stem = clean_stem(path.stem)

    if not stem or stem.isdigit() or not re.search(r"[\u3400-\u9fff]", stem):
        stem = fallback_title(path)
    if top == "1日本" and "傳題" in path.stem:
        return "日本傳題"
    if top == "2泰國" and "辦道" in path.stem:
        return "泰國辦道"
    if top == "6大陸" and "辦道" in path.stem:
        return "大陸辦道"
    if top == "墨寶":
        if stem == "佛":
            return "佛字墨寶"
        if not stem.endswith("墨寶"):
            return f"{stem}墨寶"
    return stem


def infer_country(relative_path: str) -> str:
    parts = PurePosixPath(relative_path).parts
    top = parts[0]
    keyword_countries = {
        "日本": "日本",
        "泰國": "泰國",
        "印尼": "印尼",
        "新加坡": "新加坡",
        "中國大陸": "中國大陸",
        "大陸": "中國大陸",
    }
    for component in reversed(parts[1:]):
        matches = {country for keyword, country in keyword_countries.items() if keyword in component}
        if len(matches) == 1:
            return matches.pop()
    if top == "3印尼  新加坡":
        return ""
    return COUNTRIES.get(top, "臺灣")


def infer_people(relative_path: str) -> str:
    parts = PurePosixPath(relative_path).parts
    joined = "/".join(parts)
    people = []
    if "朱玖塋墨寶" not in joined:
        people.append("仁義大仙")
    if "老前人" in joined:
        people.append("老前人")
    if "前人老" in joined:
        people.append("前人老")
    return "|".join(dict.fromkeys(people))


def make_row(relative_path: str) -> dict[str, str]:
    path = PurePosixPath(relative_path)
    top = path.parts[0]
    title = infer_title(relative_path)
    suffix = path.suffix
    digest = hashlib.sha256(relative_path.encode("utf-8")).hexdigest()[:8]
    return {
        "file": f"uploads/archive/{relative_path}",
        "title": title,
        "date": "",
        "people": infer_people(relative_path),
        "renyiCategories": CATEGORIES.get(top, ""),
        "topics": "墨寶" if top == "墨寶" else "",
        "country": infer_country(relative_path),
        "city": "",
        "description": "",
        "downloadName": f"崇德仁義-{title}-{digest}{suffix}",
        "alt": title,
    }


def read_catalog(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != CSV_FIELDS:
            raise ValueError("catalog.csv 欄位不正確")
        return list(reader)


def write_catalog(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=CSV_FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def extract_entry(archive: zipfile.ZipFile, entry: zipfile.ZipInfo, target: Path) -> bool:
    target.parent.mkdir(parents=True, exist_ok=True)
    if entry.file_size <= 95 * 1024 * 1024:
        with archive.open(entry) as source, target.open("wb") as destination:
            shutil.copyfileobj(source, destination)
        return False

    with tempfile.TemporaryDirectory() as temp_dir:
        source_path = Path(temp_dir) / entry.filename.rsplit("/", 1)[-1]
        with archive.open(entry) as source, source_path.open("wb") as destination:
            shutil.copyfileobj(source, destination)
        with Image.open(source_path) as image:
            image.load()
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")
            image.save(target, format="JPEG", quality=95, subsampling=0, optimize=True)
    return True


def import_archive(root: Path, archive_path: Path) -> tuple[int, int]:
    catalog_path = root / "photos" / "catalog.csv"
    archive_root = (root / "photos" / "uploads" / "archive").resolve()
    rows = read_catalog(catalog_path)
    for index, row in enumerate(rows):
        if re.search(r"-[0-9a-f]{8}\.[^.]+$", row["downloadName"], re.IGNORECASE):
            relative = row["file"].removeprefix("uploads/archive/")
            rows[index] = make_row(relative)
    existing = {row["file"] for row in rows}
    imported = 0
    optimized = 0

    with zipfile.ZipFile(archive_path) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            zip_path = PurePosixPath(entry.filename)
            if zip_path.suffix.lower() not in SUPPORTED_EXTENSIONS or len(zip_path.parts) < 2:
                continue
            relative = PurePosixPath(*zip_path.parts[1:]).as_posix()
            file_value = f"uploads/archive/{relative}"
            if file_value in existing:
                continue
            target = (archive_root / Path(*PurePosixPath(relative).parts)).resolve()
            if not target.is_relative_to(archive_root):
                raise ValueError(f"ZIP 路徑超出照片目錄：{relative}")
            optimized += int(extract_entry(archive, entry, target))
            rows.append(make_row(relative))
            existing.add(file_value)
            imported += 1

    write_catalog(catalog_path, rows)
    return imported, optimized


def main() -> int:
    parser = argparse.ArgumentParser(description="匯入仁義大仙照片 ZIP")
    parser.add_argument("archive", type=Path)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    imported, optimized = import_archive(args.root.resolve(), args.archive.resolve())
    print(f"新增 {imported} 張照片；高品質壓縮 {optimized} 張超大照片")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
