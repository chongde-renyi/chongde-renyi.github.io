"""Build the library video catalogue from the public YouTube channel."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import urlopen


DEFAULT_CHANNEL = "https://www.youtube.com/c/崇德仁義講堂-fycd-仁義大仙/videos"
DEFAULT_OUTPUT = Path(__file__).resolve().parents[2] / "library" / "videos.json"
CHANNEL_ID = "UCk3WZELX3OmxU3D1csHdC3Q"
PINNED_VIDEO_IDS = [
    "bLJPjtX5g3E",  # 天佑宮動土典禮-仁義大仙慈語
    "7giz1CKFoKM",  # 仁義大仙成道十周年回顧
    "keSYSS_PWvs",  # 仁義大仙5周年追思
    "muD0dzuGewI",  # 仁義大仙結緣訓
    "srjiuWE6rig",  # 善歌【仁義大道揚】
]


def build_video_record(entry: dict) -> dict | None:
    video_id = str(entry.get("id") or "").strip()
    title = str(entry.get("title") or "").strip()
    if not video_id or not title:
        return None
    return {
        "id": video_id,
        "title": title,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
    }


def fetch_entries(channel_url: str) -> list[dict]:
    command = [
        sys.executable,
        "-B",
        "-m",
        "yt_dlp",
        "--flat-playlist",
        "--dump-single-json",
        channel_url,
    ]
    result = subprocess.run(command, check=True, capture_output=True, text=True, encoding="utf-8")
    payload = json.loads(result.stdout)
    return payload.get("entries") or []


def fetch_recent_dates(channel_id: str = CHANNEL_ID) -> dict[str, str]:
    feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    with urlopen(feed_url, timeout=30) as response:
        root = ET.fromstring(response.read())
    namespaces = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
    }
    dates = {}
    for entry in root.findall("atom:entry", namespaces):
        video_id = entry.findtext("yt:videoId", default="", namespaces=namespaces)
        published = entry.findtext("atom:published", default="", namespaces=namespaces)
        if video_id and published:
            dates[video_id] = published
    return dates


def order_videos(videos: list[dict], now: datetime | None = None) -> list[dict]:
    now = now or datetime.now(timezone.utc)
    recent_threshold = now - timedelta(days=183)
    pinned_order = {video_id: index for index, video_id in enumerate(PINNED_VIDEO_IDS)}
    original_order = {video["id"]: index for index, video in enumerate(videos)}

    def published_time(video: dict) -> datetime | None:
        value = video.get("publishedAt")
        if not value:
            return None
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None

    def sort_key(video: dict) -> tuple:
        published = published_time(video)
        if published and published >= recent_threshold:
            return (0, -published.timestamp())
        if video["id"] in pinned_order:
            return (1, pinned_order[video["id"]])
        return (2, original_order[video["id"]])

    return sorted(
        videos,
        key=sort_key,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--channel", default=DEFAULT_CHANNEL)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    existing_dates = {}
    if args.output.exists():
        existing_dates = {
            video["id"]: video.get("publishedAt")
            for video in json.loads(args.output.read_text(encoding="utf-8"))
            if video.get("publishedAt")
        }
    recent_dates = fetch_recent_dates()
    videos = [record for entry in fetch_entries(args.channel) if (record := build_video_record(entry))]
    for video in videos:
        video["publishedAt"] = recent_dates.get(video["id"]) or existing_dates.get(video["id"])
    videos = order_videos(videos)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(videos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(videos)} videos to {args.output}")


if __name__ == "__main__":
    main()
