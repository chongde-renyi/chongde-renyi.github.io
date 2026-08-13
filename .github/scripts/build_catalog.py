from pathlib import Path
import json
from pypdf import PdfReader

root = Path(__file__).resolve().parents[2]
catalog_path = root / "library" / "catalog.json"
try:
    old_items = json.loads(catalog_path.read_text(encoding="utf-8"))
except (FileNotFoundError, json.JSONDecodeError):
    old_items = []
old = {item.get("file"): item for item in old_items}

items = []
for folder, category in (("ebooks", "ebook"), ("teachings", "teaching")):
    for pdf in sorted((root / "books" / folder).glob("*.pdf")):
        relative = pdf.relative_to(root).as_posix()
        previous = old.get(relative, {})
        try:
            pages = len(PdfReader(str(pdf)).pages)
        except Exception:
            pages = previous.get("pages", 0)
        title = previous.get("title") or pdf.stem.replace("-", " ")
        items.append({
            "file": relative,
            "title": title,
            "pages": pages,
            "description": previous.get("description") or f"{title}數位典藏。",
            "category": category,
        })

catalog_path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
