"""Wait for PostgreSQL and apply the original user table migration."""

import os
import time

import psycopg2


def wait_for_database() -> None:
    for attempt in range(120):
        try:
            connection = psycopg2.connect(
                dbname=os.environ['DB_NAME'],
                user=os.environ['DB_USER'],
                password=os.environ['DB_PASSWORD'],
                host=os.getenv('DB_HOST', 'db'),
                port=5432,
            )
            connection.close()
            return
        except psycopg2.OperationalError:
            time.sleep(2)
    raise RuntimeError('PostgreSQL did not become ready')


def seed_database() -> None:
    wait_for_database()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')
    import django
    django.setup()
    from django.core.management import call_command
    call_command('migrate', interactive=False, verbosity=1)
    with open('/tmp/django001-ready', 'w') as ready_file:
        ready_file.write('ready')


if __name__ == '__main__':
    seed_database()
