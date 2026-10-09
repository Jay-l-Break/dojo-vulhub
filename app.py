import os
import sys


os.environ.setdefault("DJANGO_SETTINGS_MODULE", __name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEBUG = True
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.urandom(32).hex()
ALLOWED_HOSTS = ['*']
MIDDLEWARE = [
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'vuln.urls'
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'WARNING'),
        },
    },
}
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'CVE_2022_34265',
        'USER': 'postgres',
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': '5432',
    }
}
if not os.environ.get('DB_PASSWORD'):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/tmp/django-local.sqlite3',
    }
INSTALLED_APPS = [
    'vuln'
]


if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
