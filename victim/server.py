"""Visit a poisoned debug page in a separate browser process."""

import http.server
import subprocess
import threading
import urllib.parse
import uuid


def browse(username: str) -> None:
    query = urllib.parse.urlencode({'username': username})
    target = 'http://127.0.0.1/victim/bootstrap/?' + query
    subprocess.run(
        [
            'chromium-browser', '--headless', '--no-sandbox',
            '--disable-dev-shm-usage', '--disable-gpu',
            '--disable-background-networking', '--no-first-run',
            '--virtual-time-budget=10000',
            '--user-data-dir=/tmp/chrome-' + uuid.uuid4().hex,
            '--dump-dom', target,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=35,
        check=False,
    )


class VisitHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path != '/visit' or self.client_address[0] not in ('127.0.0.1', '::1'):
            self.send_error(404)
            return
        username = urllib.parse.parse_qs(parsed.query).get('username', [''])[0]
        if not username:
            self.send_error(400)
            return
        threading.Thread(target=browse, args=(username,), daemon=True).start()
        self.send_response(202)
        self.end_headers()


def main() -> None:
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 9222), VisitHandler)
    server.serve_forever()


if __name__ == '__main__':
    main()
