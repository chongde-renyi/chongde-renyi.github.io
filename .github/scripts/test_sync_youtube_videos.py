import unittest
from datetime import datetime, timezone

from sync_youtube_videos import build_video_record, order_videos


class BuildVideoRecordTests(unittest.TestCase):
    def test_builds_stable_youtube_urls(self):
        record = build_video_record({"id": "abc123", "title": "測試影片"})

        self.assertEqual(record["id"], "abc123")
        self.assertEqual(record["title"], "測試影片")
        self.assertEqual(record["url"], "https://www.youtube.com/watch?v=abc123")
        self.assertEqual(record["thumbnail"], "https://i.ytimg.com/vi/abc123/hqdefault.jpg")

    def test_rejects_missing_id_or_title(self):
        self.assertIsNone(build_video_record({"id": "", "title": "有標題"}))
        self.assertIsNone(build_video_record({"id": "abc123", "title": ""}))

    def test_recent_videos_come_before_pinned_then_older_videos(self):
        videos = [
            {"id": "regular-1", "publishedAt": "2025-01-01T00:00:00+00:00"},
            {"id": "muD0dzuGewI"},
            {"id": "bLJPjtX5g3E"},
            {"id": "recent-1", "publishedAt": "2026-08-01T00:00:00+00:00"},
            {"id": "regular-2", "publishedAt": None},
            {"id": "srjiuWE6rig"},
        ]

        ordered = order_videos(videos, now=datetime(2026, 8, 16, tzinfo=timezone.utc))

        self.assertEqual(
            [video["id"] for video in ordered],
            ["recent-1", "bLJPjtX5g3E", "muD0dzuGewI", "srjiuWE6rig", "regular-1", "regular-2"],
        )


if __name__ == "__main__":
    unittest.main()
