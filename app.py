"""Settings for the Django debug page XSS reproduction."""

import os
import sys


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.urandom(32).hex()
DEBUG = True
ALLOWED_HOSTS = ['*']
ROOT_URLCONF = 'site_urls'
INSTALLED_APPS = ['xss']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DB_NAME', 'xss'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': '5432',
    },
}


if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
