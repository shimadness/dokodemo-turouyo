#!/usr/bin/env python3
"""開発用サーバー。ESモジュールのキャッシュを確実に無効化する。

背景: このプロジェクトを開くブラウザは Cache-Control: no-cache を無視し、
URL単位で永続キャッシュする。/src/render.js を編集しても古いコードが動き続け、
?v=... のようにURLが変わった時だけ取り直す。

対策: 配信時に import 文と <script src> へ ?v=<対象ファイルのmtime> を注入する。
ファイルを編集すると mtime が変わり、URLが変わり、必ず取り直される。
(vite などがやっていることの最小版)
"""
import functools
import http.server
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

# from './x.js' / import './x.js' / from "/src/x.js"
IMPORT_RE = re.compile(r"""(\bfrom\s+|\bimport\s*\(?\s*)(['"])([^'"]+\.js)(['"])""")
# <script type="module" src="src/main.js">
SCRIPT_RE = re.compile(r"""(<script[^>]*\bsrc=)(['"])([^'"]+\.js)(['"])""")


def mtime_of(url_path: str, base_dir: str) -> str:
    """URLパスを実ファイルに解決して mtime を返す。解決できなければ空。"""
    clean = url_path.split("?")[0]
    target = os.path.join(ROOT, clean.lstrip("/")) if clean.startswith("/") \
        else os.path.normpath(os.path.join(base_dir, clean))
    try:
        return str(int(os.path.getmtime(target)))
    except OSError:
        return ""


def stamp(text: str, pattern: re.Pattern, base_dir: str) -> str:
    def repl(m):
        prefix, q1, path, q2 = m.groups()
        if "?" in path or path.startswith(("http://", "https://", "//")):
            return m.group(0)
        v = mtime_of(path, base_dir)
        return m.group(0) if not v else f"{prefix}{q1}{path}?v={v}{q2}"
    return pattern.sub(repl, text)


class DevHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if not os.path.isfile(path):
            return super().send_head()

        ext = os.path.splitext(path)[1]
        if ext not in (".js", ".html"):
            return super().send_head()

        with open(path, "r", encoding="utf-8") as f:
            body = f.read()
        base_dir = os.path.dirname(path)
        body = stamp(body, IMPORT_RE, base_dir)
        if ext == ".html":
            body = stamp(body, SCRIPT_RE, base_dir)

        encoded = body.encode("utf-8")
        ctype = "text/javascript" if ext == ".js" else "text/html"
        self.send_response(200)
        self.send_header("Content-Type", f"{ctype}; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        import io
        return io.BytesIO(encoded)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):  # 404 だけ出す
        if len(args) > 1 and str(args[1]).startswith("4"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
    handler = functools.partial(DevHandler, directory=ROOT)
    print(f"serving {ROOT} on http://localhost:{port} (mtime-stamped modules)")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
