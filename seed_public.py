import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

import django

django.setup()

from django.db import connection
from vuln.models import WebLog


WebLog.objects.get_or_create(
    id=1,
    defaults={
        'method': 'GET',
        'url': 'https://example.invalid/public-seed',
        'user_agent': 'seed',
    },
)

if connection.vendor == 'postgresql':
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT setval(pg_get_serial_sequence('vuln_weblog', 'id'), "
            "(SELECT MAX(id) FROM vuln_weblog))"
        )
