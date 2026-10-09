"""Settings and management entry point for the vulnerable Django application."""

import os
import sys

import pymysql


pymysql.install_as_MySQLdb()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.urandom(32).hex()
DEBUG = True
ALLOWED_HOSTS = ['*']
ROOT_URLCONF = 'vuln.urls'
MIDDLEWARE = ['django.middleware.common.CommonMiddleware']
INSTALLED_APPS = ['vuln']
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'cve',
        'USER': 'root',
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': '3306',
    }
}
if not os.environ.get('DB_PASSWORD'):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/tmp/django-local.sqlite3',
    }


if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
