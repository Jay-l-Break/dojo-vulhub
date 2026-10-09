"""Settings and management entry point for the redirect reproduction."""

import os
import sys


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.urandom(32).hex()
DEBUG = False
ALLOWED_HOSTS = ['*']
ROOT_URLCONF = 'urls'
APPEND_SLASH = True
INSTALLED_APPS = []
MIDDLEWARE = [
    'proof.RedirectProofMiddleware',
    'django.middleware.common.CommonMiddleware',
]


if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
