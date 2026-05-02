from __future__ import annotations

import csv
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen


ROOT_DIR = Path(__file__).resolve().parent.parent
JSON_INPUT = ROOT_DIR / "tokyo_ink_collection_points.json"
CSV_INPUT = ROOT_DIR / "docs" / "tokyo_ink_collection.csv"
OUTPUT_CSV = ROOT_DIR / "docs" / "tokyo_ink_with_address.csv"
GEOCODER_URL = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress"


def load_records() -> list[dict[str, str]]:
    if JSON_INPUT.exists():
        with JSON_INPUT.open("r", encoding="utf-8") as f:
            return json.load(f)

    with CSV_INPUT.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def build_address(record: dict[str, str]) -> str:
    params = urlencode({"lat": record["dlat"], "lon": record["dlon"]})
    request_url = f"{GEOCODER_URL}?{params}"

    try:
        with urlopen(request_url, timeout=10) as response:
            result = json.loads(response.read().decode("utf-8"))

        if "results" in result and result["results"].get("lv01Nm"):
            return f"東京都{record['city']}{result['results']['lv01Nm']}"
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
        pass

    return f"東京都{record['city']}"


def main() -> None:
    records = load_records()
    enhanced_data: list[dict[str, str]] = []

    for i, record in enumerate(records, start=1):
        enhanced_data.append(
            {
                "scode": record["scode"],
                "dlat": record["dlat"],
                "dlon": record["dlon"],
                "divi": record["divi"],
                "city": record["city"],
                "sname": record["sname"],
                "address": build_address(record),
            }
        )

        if i % 50 == 0:
            print(f"Processed {i}/{len(records)}")

        time.sleep(0.3)

    with OUTPUT_CSV.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["scode", "dlat", "dlon", "divi", "city", "sname", "address"],
        )
        writer.writeheader()
        writer.writerows(enhanced_data)

    print(f"Done! {len(enhanced_data)} records")
    print(f"Saved to: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
