"""Wait for Oracle, migrate, and load the original public geometry rows."""

import os
import time

import cx_Oracle


def wait_for_database() -> None:
    dsn = cx_Oracle.makedsn(os.getenv('DB_HOST', 'db'), 1521, service_name='orcl')
    for attempt in range(240):
        try:
            connection = cx_Oracle.connect(
                os.environ['DB_USER'], os.environ['DB_PASSWORD'], dsn,
            )
            connection.close()
            return
        except cx_Oracle.DatabaseError:
            time.sleep(2)
    raise RuntimeError('Oracle did not become ready')


def seed_database() -> None:
    wait_for_database()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app')
    import django
    django.setup()
    from django.core.management import call_command
    call_command('migrate', interactive=False, verbosity=1)
    call_command('loaddata', 'collection.json', verbosity=1)
    with open('/tmp/django004-ready', 'w', encoding='utf-8') as ready_file:
        ready_file.write('ready')


if __name__ == '__main__':
    seed_database()
