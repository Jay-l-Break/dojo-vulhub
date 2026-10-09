import BaseHTTPServer
import socket
import subprocess
import time


worker_process = None
worker_started_at = 0
redis_process = None


def redis_ready():
    try:
        connection = socket.create_connection(('127.0.0.1', 6379), timeout=1)
        try:
            connection.sendall('*1\r\n$4\r\nPING\r\n')
            return connection.recv(64).startswith('+PONG')
        finally:
            connection.close()
    except socket.error:
        return False


def worker_ready():
    return (worker_process is not None and worker_process.poll() is None
            and time.time() - worker_started_at >= 3 and redis_ready())


class HealthHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_GET(self):
        ready = worker_ready()
        self.send_response(200 if ready else 503)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write('ready' if ready else 'starting')

    def log_message(self, format_string, *args):
        pass


def main():
    global worker_process, worker_started_at, redis_process
    local_redis_deadline = time.time() + 30
    deadline = time.time() + 60
    while not redis_ready():
        if redis_process is None and time.time() >= local_redis_deadline:
            redis_process = subprocess.Popen([
                '/usr/local/bin/redis-server', '--bind', '127.0.0.1',
                '--protected-mode', 'no', '--save', '', '--appendonly', 'no',
            ])
        if time.time() >= deadline:
            raise RuntimeError('Redis did not become ready')
        time.sleep(1)
    worker_process = subprocess.Popen(['/usr/local/bin/celeryd', '-l', 'INFO', '-c', '1'])
    worker_started_at = time.time()
    server = BaseHTTPServer.HTTPServer(('0.0.0.0', 80), HealthHandler)
    try:
        server.serve_forever()
    finally:
        server.server_close()
        worker_process.terminate()
        if redis_process is not None:
            redis_process.terminate()


if __name__ == '__main__':
    main()
