"""Expose the Salt request socket on the benchmark's required HTTP port."""

import selectors
import socket
import socketserver


HTTP_RESPONSE = (
    b"HTTP/1.1 200 OK\r\n"
    b"Content-Type: text/plain\r\n"
    b"Content-Length: 11\r\n"
    b"Connection: close\r\n\r\n"
    b"Salt master"
)
HTTP_UNREADY = (
    b"HTTP/1.1 503 Service Unavailable\r\n"
    b"Content-Length: 0\r\n"
    b"Connection: close\r\n\r\n"
)


class GatewayHandler(socketserver.BaseRequestHandler):
    def handle(self) -> None:
        self.request.settimeout(15)
        first = self.request.recv(4096)
        if not first:
            return
        if first.startswith((b"GET ", b"HEAD ")):
            try:
                with socket.create_connection(("127.0.0.1", 4506), timeout=2):
                    self.request.sendall(HTTP_RESPONSE)
            except OSError:
                self.request.sendall(HTTP_UNREADY)
            return
        with socket.create_connection(("127.0.0.1", 4506), timeout=15) as upstream:
            upstream.sendall(first)
            self.relay(upstream)

    def relay(self, upstream: socket.socket) -> None:
        with selectors.DefaultSelector() as selector:
            selector.register(self.request, selectors.EVENT_READ, upstream)
            selector.register(upstream, selectors.EVENT_READ, self.request)
            while True:
                ready = selector.select(timeout=120)
                if not ready:
                    return
                for key, unused in ready:
                    source = key.fileobj
                    destination = key.data
                    chunk = source.recv(65536)
                    if not chunk:
                        return
                    destination.sendall(chunk)


class SaltGateway(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    with SaltGateway(("0.0.0.0", 80), GatewayHandler) as server:
        server.serve_forever()


if __name__ == "__main__":
    main()
