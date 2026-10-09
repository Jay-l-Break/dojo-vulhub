"""Serve the application while Oracle initializes in the background."""

import os
from wsgiref.simple_server import make_server

from django.core.wsgi import get_wsgi_application


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')
application = get_wsgi_application()


if __name__ == '__main__':
    with make_server('0.0.0.0', 80, application) as server:
        server.serve_forever()
