from __future__ import annotations

import sys
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from import_photo_archive import infer_country, infer_people, infer_title, make_row


class ImportPhotoArchiveTests(unittest.TestCase):
    def test_removes_record_number_from_title(self):
        self.assertEqual(infer_title("傳題/方老點傳師傳題_11.jpg"), "方老點傳師傳題")

    def test_uses_country_for_overseas_teaching(self):
        self.assertEqual(infer_title("1日本/方老點傳師傳題_11日本.jpg"), "日本傳題")

    def test_classifies_singapore_from_path(self):
        path = "3印尼  新加坡/新加坡傳題2.jpg"
        self.assertEqual(infer_country(path), "新加坡")
        self.assertEqual(infer_title(path), "新加坡傳題")

    def test_leaves_mixed_overseas_folder_unclassified(self):
        path = "3印尼  新加坡/方老點傳師傳題_16.jpg"
        self.assertEqual(infer_country(path), "")
        self.assertEqual(infer_title(path), "方老點傳師傳題")

    def test_names_buddha_calligraphy(self):
        self.assertEqual(infer_title("墨寶/方老點傳師/佛/佛10.jpg"), "佛字墨寶")

    def test_uses_folder_for_generic_camera_filename(self):
        self.assertEqual(infer_title("家人/P1030229.JPG"), "家人照片")
        self.assertEqual(infer_title("家人/19684545-C317-4FF7.JPG"), "家人照片")
        self.assertEqual(infer_title("墨寶/朱玖塋墨寶/IMG_4197.jpg"), "朱玖塋墨寶")

    def test_removes_record_number_before_long_note(self):
        path = "與前人輩/老前人/眾道親/眾道親15（1993年）3月18日，海外普照.jpg"
        self.assertEqual(infer_title(path), "眾道親")

    def test_classifies_photo_by_top_folder(self):
        row = make_row("家人/全家福12.jpg")
        self.assertEqual(row["renyiCategories"], "家人")
        self.assertEqual(row["country"], "臺灣")
        self.assertEqual(row["people"], "仁義大仙")

    def test_adds_senior_people_from_folder(self):
        people = infer_people("與前人輩/老前人,前人老（單獨）/合照1.jpg")
        self.assertEqual(people, "仁義大仙|老前人|前人老")

    def test_excludes_renyi_from_zhu_jiuying_calligraphy(self):
        self.assertEqual(infer_people("墨寶/朱玖塋墨寶/道範長存1.JPG"), "")


if __name__ == "__main__":
    unittest.main()
