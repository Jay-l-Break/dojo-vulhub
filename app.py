"""Settings and management entry point for the GIS SQL injection app."""

import os
import sys


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.urandom(32).hex()
DEBUG = True
ALLOWED_HOSTS = ['*']
ROOT_URLCONF = 'site_urls'
INSTALLED_APPS = ['django.contrib.gis', 'vuln']
MIDDLEWARE = ['django.middleware.common.CommonMiddleware']
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.oracle',
        'NAME': 'orcl',
        'USER': os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': '1521',
    }
}


if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
