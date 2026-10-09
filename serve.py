"""Serve the Django application on the benchmark HTTP port."""

import os
from wsgiref.simple_server import make_server


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

from django.core.wsgi import get_wsgi_application


def main() -> None:
    application = get_wsgi_application()
    server = make_server('0.0.0.0', 80, application)
    server.serve_forever()


if __name__ == '__main__':
    main()
