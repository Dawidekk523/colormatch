#!/usr/bin/env python3
"""IndexNow ping for getcolormatch.com, run from a Mac (Bing answers 429 to Workers).

Bing feeds ChatGPT search and Copilot; Google ignores IndexNow. Reads the live
sitemap index and submits every URL in it. Usage: python3 scripts/indexnow.py
"""
import json
import re
import urllib.request

KEY = "6d5407e970d1ebb1e3910581702b6d7d"
HOST = "getcolormatch.com"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "colormatch-indexnow"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode()


def locs(url):
    return re.findall(r"<loc>([^<]+)</loc>", fetch(url))


urls = [u for top in locs(f"https://{HOST}/sitemap.xml") for u in (locs(top) if top.endswith(".xml") else [top])]
body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
with urllib.request.urlopen(req, timeout=30) as r:
    print(r.status, len(urls), "URLs")
