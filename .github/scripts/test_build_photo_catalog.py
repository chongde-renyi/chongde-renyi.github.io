import csv
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_photo_catalog import CatalogError, build_catalog, write_catalog


HEADER = [
    "file", "title", "date", "people", "renyiCategories", "topics",
    "country", "city", "description", "downloadName", "alt", "link",
]


class PhotoCatalogTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        (self.root / "photos" / "uploads").mkdir(parents=True)
        self.write_csv([])

    def tearDown(self):
        self.temporary.cleanup()

    def add_image(self, relative_path):
        path = self.root / "photos" / relative_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"sample image bytes")

    def write_csv(self, rows):
        path = self.root / "photos" / "catalog.csv"
        with path.open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=HEADER)
            writer.writeheader()
            writer.writerows(rows)

    def row(self, **overrides):
        values = {field: "" for field in HEADER}
        values.update({"file": "uploads/example.jpg", **overrides})
        return values

    def test_unlisted_image_gets_uncategorized_defaults(self):
        self.add_image("uploads/2026/my_photo.jpg")

        result = build_catalog(self.root)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["src"], "uploads/2026/my_photo.jpg")
        self.assertEqual(result[0]["title"], "my photo")
        self.assertEqual(result[0]["downloadName"], "my_photo.jpg")
        self.assertEqual(result[0]["alt"], "my photo")
        self.assertEqual(result[0]["people"], [])
        self.assertEqual(result[0]["renyiCategories"], [])
        self.assertEqual(result[0]["topics"], [])
        self.assertEqual(result[0]["inkCategories"], [])
        self.assertEqual(result[0]["country"], "")
        self.assertEqual(result[0]["link"], "")

    def test_csv_metadata_and_pipe_values_are_converted(self):
        self.add_image("uploads/example.jpg")
        self.write_csv([self.row(
            title="道親大合照", date="1995-08-10", people="仁義大仙|前人老",
            renyiCategories="眾道親|佛堂", topics="墨寶", country="臺灣",
            city="彰化", description="紀念活動", downloadName="紀念合照.jpg",
            alt="仁義大仙與道親活動合照",
        )])

        photo = build_catalog(self.root)[0]

        self.assertEqual(photo["people"], ["仁義大仙", "前人老"])
        self.assertEqual(photo["renyiCategories"], ["眾道親", "佛堂"])
        self.assertEqual(photo["topics"], ["墨寶"])
        self.assertEqual(photo["country"], "臺灣")
        self.assertEqual(photo["city"], "彰化")
        self.assertEqual(photo["downloadName"], "紀念合照.jpg")

    def test_ink_category_is_inferred_from_path_and_title(self):
        self.add_image("uploads/archive/墨寶/朱玖塋墨寶/對聯1.jpg")
        self.write_csv([self.row(
            file="uploads/archive/墨寶/朱玖塋墨寶/對聯1.jpg",
            title="朱玖塋對聯墨寶", topics="墨寶",
        )])

        photo = build_catalog(self.root)[0]

        self.assertEqual(photo["inkCategories"], ["朱玖塋贈送之墨寶"])

    def test_optional_photo_link_is_exported(self):
        self.add_image("uploads/example.jpg")
        self.write_csv([self.row(link="https://example.org/book")])

        photo = build_catalog(self.root)[0]

        self.assertEqual(photo["link"], "https://example.org/book")

    def test_unsafe_photo_link_is_rejected(self):
        self.add_image("uploads/example.jpg")
        self.write_csv([self.row(link="javascript:alert(1)")])

        with self.assertRaisesRegex(CatalogError, r"第 2 列.*link"):
            build_catalog(self.root)

    def test_nested_images_are_sorted_by_relative_path(self):
        for relative in ["uploads/z.webp", "uploads/1995/a.PNG", "uploads/b.jpeg"]:
            self.add_image(relative)

        result = build_catalog(self.root)

        self.assertEqual([item["src"] for item in result], [
            "uploads/1995/a.PNG", "uploads/b.jpeg", "uploads/z.webp",
        ])

    def test_missing_image_in_csv_is_rejected(self):
        self.write_csv([self.row(file="uploads/missing.jpg")])

        with self.assertRaisesRegex(CatalogError, r"第 2 列.*不存在"):
            build_catalog(self.root)

    def test_duplicate_file_rows_are_rejected(self):
        self.add_image("uploads/example.jpg")
        self.write_csv([self.row(), self.row(title="重複")])

        with self.assertRaisesRegex(CatalogError, r"第 3 列.*重複"):
            build_catalog(self.root)

    def test_unknown_person_category_and_topic_are_rejected(self):
        self.add_image("uploads/example.jpg")
        invalid_values = [
            ("people", "陌生人物"),
            ("renyiCategories", "其他"),
            ("topics", "影音"),
        ]
        for field, value in invalid_values:
            with self.subTest(field=field):
                self.write_csv([self.row(**{field: value})])
                with self.assertRaisesRegex(CatalogError, rf"第 2 列.*{field}"):
                    build_catalog(self.root)

    def test_invalid_date_is_rejected(self):
        self.add_image("uploads/example.jpg")
        self.write_csv([self.row(date="1995/08/10")])

        with self.assertRaisesRegex(CatalogError, r"第 2 列.*date"):
            build_catalog(self.root)

    def test_path_outside_uploads_is_rejected(self):
        self.write_csv([self.row(file="../secret.jpg")])

        with self.assertRaisesRegex(CatalogError, r"第 2 列.*uploads"):
            build_catalog(self.root)

    def test_output_is_deterministic_es_module(self):
        self.add_image("uploads/example.jpg")
        photos = build_catalog(self.root)

        output_path = write_catalog(self.root, photos)
        first = output_path.read_text(encoding="utf-8")
        output_path = write_catalog(self.root, build_catalog(self.root))
        second = output_path.read_text(encoding="utf-8")

        self.assertEqual(first, second)
        self.assertTrue(first.startswith("export const PHOTOS = ["))
        self.assertTrue(first.endswith("];\n"))

    def test_github_workflow_runs_tests_and_updates_only_generated_catalog(self):
        repository_root = Path(__file__).resolve().parents[2]
        workflow_path = repository_root / ".github" / "workflows" / "update-photo-catalog.yml"
        workflow = workflow_path.read_text(encoding="utf-8")

        required_fragments = [
            'branches: [main]',
            '- "photos/uploads/**"',
            '- "photos/catalog.csv"',
            '- ".github/scripts/build_photo_catalog.py"',
            '- ".github/scripts/test_build_photo_catalog.py"',
            'workflow_dispatch:',
            'contents: write',
            "github.actor != 'github-actions[bot]'",
            'uses: actions/checkout@v4',
            'uses: actions/setup-python@v5',
            'python-version: "3.12"',
            'python .github/scripts/test_build_photo_catalog.py -v',
            'python .github/scripts/build_photo_catalog.py',
            'git add photos/photos-data.js',
        ]
        for fragment in required_fragments:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, workflow)

        self.assertLess(
            workflow.index('python .github/scripts/test_build_photo_catalog.py -v'),
            workflow.index('python .github/scripts/build_photo_catalog.py'),
        )
        self.assertNotIn('git add -A', workflow)


if __name__ == "__main__":
    unittest.main()
