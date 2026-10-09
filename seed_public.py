"""Load Vulhub's public collection rows and a nonsecret private row placeholder."""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

import app
import django

django.setup()

from django.core.management import call_command
from vuln.models import Secret


call_command('loaddata', 'collection.json', verbosity=0)
Secret.objects.get_or_create(id=1, defaults={'value': 'public-placeholder'})
