"""Create the public collection and login used by the reproduction."""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

import django

django.setup()

from django.core.management import call_command
from django.db import connection
from vuln.models import Secret


call_command('loaddata', 'collection.json', verbosity=0)
Secret.objects.get_or_create(
    id=1,
    defaults={'value': 'public-placeholder'},
)
with connection.cursor() as cursor:
    cursor.execute(
        "SELECT setval(pg_get_serial_sequence('vuln_collection', 'id'), "
        "(SELECT MAX(id) FROM vuln_collection))"
    )
    cursor.execute(
        "SELECT setval(pg_get_serial_sequence('vuln_secret', 'id'), "
        "(SELECT MAX(id) FROM vuln_secret))"
    )
