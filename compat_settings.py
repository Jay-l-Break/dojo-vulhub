import os

SECRET_KEY = os.urandom(32).encode('hex')
DATABASE_ENGINE = 'sqlite3'
DATABASE_NAME = '/tmp/celery030.db'
INSTALLED_APPS = ()
CARROT_BACKEND = 'ghettoq.taproot.Redis'
BROKER_HOST = '127.0.0.1'
BROKER_PORT = 6379
BROKER_VHOST = '0'
BROKER_PASSWORD = ''
