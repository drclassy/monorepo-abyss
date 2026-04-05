"""
Screenshot capture script for Claudesy CTE V2 visual analysis.
Architected and built by Claudesy.
"""

from playwright.sync_api import sync_playwright
import sys

def capture(url, output_path, viewport_width=1920, viewport_height=1080):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': viewport_width, 'height': viewport_height})
        try:
            page.goto(url, wait_until='networkidle', timeout=30000)
        except Exception:
            # Fallback if networkidle times out
            page.goto(url, wait_until='domcontentloaded', timeout=30000)
        page.wait_for_timeout(1500)
        page.screenshot(path=output_path, full_page=False)
        browser.close()
        print(f"Saved: {output_path}")

if __name__ == "__main__":
    targets = [
        ("http://localhost:3003",           "d:/Devops/abyss-monorepo/app/ctev2/screenshots/home_desktop.png",    1920, 1080),
        ("http://localhost:3003/login",     "d:/Devops/abyss-monorepo/app/ctev2/screenshots/login_desktop.png",   1920, 1080),
        ("http://localhost:3003/optimizer", "d:/Devops/abyss-monorepo/app/ctev2/screenshots/optimizer_desktop.png", 1920, 1080),
        ("http://localhost:3003",           "d:/Devops/abyss-monorepo/app/ctev2/screenshots/home_mobile.png",     375,  812),
        ("http://localhost:3003/login",     "d:/Devops/abyss-monorepo/app/ctev2/screenshots/login_mobile.png",    375,  812),
        ("http://localhost:3003/optimizer", "d:/Devops/abyss-monorepo/app/ctev2/screenshots/optimizer_mobile.png", 375, 812),
    ]

    for url, path, w, h in targets:
        try:
            capture(url, path, w, h)
        except Exception as e:
            print(f"ERROR capturing {url} -> {path}: {e}", file=sys.stderr)
