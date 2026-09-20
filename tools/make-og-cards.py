#!/usr/bin/env python3
"""Render the Open Graph link-preview cards from og-card-template.html.

One 1200x630 PNG per page, in the site's own colours, so a link pasted into
LinkedIn/Slack/WhatsApp shows what the page actually is instead of a cropped
profile photo. Re-run after changing a page's title:

    tools/make-og-cards.py

Needs Google Chrome (headless) and cwebp on PATH.
"""

import html
import pathlib
import shutil
import subprocess
import sys
import tempfile

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "tools" / "og-card-template.html"
OUT_DIR = ROOT / "assets" / "img"

CARDS = {
    "og-home.png": (
        "cat aboutme.txt", "Ed Christie",
        "Applied Software Engineer\nCardiff University, 2:1 Honours",
        ["TypeScript", "Go", "Docker"],
    ),
    "og-projects.png": (
        "ls ~/projects", "Projects",
        "Secure registries, price data,\nand forecast scoring.",
        ["Go", "SvelteKit", "PostgreSQL"],
    ),
    "og-infrastructure.png": (
        "systemctl status", "Self-Hosted Infrastructure",
        "Mail, reverse proxy, VPN and\nmonitoring, run end to end.",
        ["nginx", "WireGuard", "Docker"],
    ),
    "og-snippets.png": (
        "cat snippets/*", "Code Snippets Library",
        "Reusable patterns worth keeping,\nwith the reasoning attached.",
        ["Python", "TypeScript", "Bash"],
    ),
    "og-travel.png": (
        "ls ~/travel", "Travel Gallery",
        "Kyrgyzstan and other places\nfurther off the map.",
        ["Photography"],
    ),
}


def main():
    if not TEMPLATE.exists():
        sys.exit(f"missing {TEMPLATE}")
    if not pathlib.Path(CHROME).exists():
        sys.exit("Google Chrome not found - needed to rasterise the cards")

    base = TEMPLATE.read_text()
    tmp = pathlib.Path(tempfile.mkdtemp())

    for name, (cmd, title, sub, tags) in CARDS.items():
        page = base.replace(
            "<span id=\"cmd\"></span>", f"<span id=\"cmd\">{html.escape(cmd)}</span>"
        ).replace(
            "<h1 id=\"title\"></h1>", f"<h1 id=\"title\">{html.escape(title)}</h1>"
        ).replace(
            "<p class=\"sub\" id=\"sub\"></p>",
            "<p class=\"sub\" id=\"sub\">" + html.escape(sub).replace("\n", "<br />") + "</p>",
        ).replace(
            "<span class=\"tags\" id=\"tags\"></span>",
            "<span class=\"tags\" id=\"tags\">"
            + "".join(f"<span class='tag'>{html.escape(t)}</span>" for t in tags)
            + "</span>",
        )
        src = tmp / f"{name}.html"
        src.write_text(page)
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
             f"--screenshot={OUT_DIR / name}", "--window-size=1200,630",
             # Give the webfonts a moment; without this the card can rasterise
             # in the fallback face.
             "--virtual-time-budget=4000", src.as_uri()],
            capture_output=True,
        )
        kb = (OUT_DIR / name).stat().st_size / 1024
        print(f"  {name:<26} {kb:6.0f} KB")

    shutil.rmtree(tmp, ignore_errors=True)
    print("\nCards written. Reference them with absolute og:image URLs.")


if __name__ == "__main__":
    main()
