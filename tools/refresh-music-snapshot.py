#!/usr/bin/env python3
"""Rewrite the SNAPSHOT constant in music-script.js from live stats.fm data.

The #music section fetches from stats.fm on every page load; this snapshot is
only the fallback for when that fetch fails. Re-run occasionally so the fallback
doesn't drift too far from reality:

    tools/refresh-music-snapshot.py

Reads the username and timezone straight out of music-script.js so there's only
one place to change them.
"""

import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from datetime import date

SCRIPT = str(Path(__file__).resolve().parent.parent / "assets" / "js" / "music-script.js")
BASE = "https://api.stats.fm/api/v1"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def read_config(src):
    def field(name):
        m = re.search(rf"^\s*{name}:\s*'([^']*)'", src, re.M)
        if not m:
            sys.exit(f"could not find `{name}` in music-script.js")
        return m.group(1)

    return field("user"), field("timeZone")


def get(user, path):
    url = f"{BASE}/users/{urllib.parse.quote(user)}{path}"
    # Cloudflare in front of stats.fm 403s the default Python-urllib agent, so
    # send something it recognises. The browser never hits this path.
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)["items"]
    except urllib.error.HTTPError as e:
        sys.exit(f"stats.fm returned {e.code} for {path}\n  {url}")
    except urllib.error.URLError as e:
        sys.exit(f"could not reach stats.fm: {e.reason}")


def main():
    src = open(SCRIPT).read()
    user, tz = read_config(src)

    if user == "REPLACE_ME":
        sys.exit(f"set `user` in music-script.js to your stats.fm username first")

    stats = get(user, "/streams/stats?range=lifetime")
    dates = get(user, f"/streams/stats/dates?timeZone={urllib.parse.quote(tz)}")

    cardinality = stats.get("cardinality", {})
    snapshot = {
        "streams": stats["count"],
        "durationMs": stats["durationMs"],
        "tracks": cardinality.get("tracks", 0),
        "artists": cardinality.get("artists", 0),
        "albums": cardinality.get("albums", 0),
        "hours": [dates.get("hours", {}).get(str(h), {}).get("count", 0) for h in range(24)],
        "capturedAt": date.today().isoformat(),
    }

    body = json.dumps(snapshot, indent=2, ensure_ascii=False)
    # Match the existing declaration whether it's `null` or a previous object.
    pattern = re.compile(r"^const SNAPSHOT = (?:null|\{.*?\n\});$", re.M | re.S)
    if not pattern.search(src):
        sys.exit(f"could not find the SNAPSHOT declaration in music-script.js")
    src = pattern.sub(lambda _: f"const SNAPSHOT = {body};", src, count=1)
    open(SCRIPT, "w").write(src)

    hours = snapshot["hours"]
    peak = hours.index(max(hours))
    print(f"snapshot updated for {user} ({snapshot['capturedAt']})")
    print(f"  {snapshot['streams']:,} streams · {snapshot['durationMs'] / 3_600_000:,.0f} hours")
    print(f"  peak hour {peak:02d}:00 with {max(hours):,} streams")
    print("\nRun `npm run format` before committing.")


if __name__ == "__main__":
    main()
