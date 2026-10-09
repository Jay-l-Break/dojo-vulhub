"""Serve the Django application for local source builds."""

import os
from wsgiref.simple_server import make_server

from django.core.wsgi import get_wsgi_application


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')


def main() -> None:
    application = get_wsgi_application()
    with make_server('0.0.0.0', 80, application) as server:
        server.serve_forever()


if __name__ == '__main__':
    main()
