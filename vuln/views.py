"""Expose the Vulhub GIS tolerance paths and gated flag reflection."""

import os

from django.contrib.gis.db.models import Union
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.db import DatabaseError, connection
from django.http import HttpRequest, HttpResponse

from .models import Collection, Collection2


FLAG_PATH = '/app/private/oracle_flag'


def index(request: HttpRequest) -> HttpResponse:
    return HttpResponse('Django GIS tolerance reproduction')


def health(request: HttpRequest) -> HttpResponse:
    if os.path.exists('/tmp/django004-ready'):
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1 FROM DUAL')
                cursor.fetchone()
            return HttpResponse('ready')
        except DatabaseError:
            pass
    return HttpResponse('initializing', status=503)


def vuln(request: HttpRequest) -> HttpResponse:
    tolerance = request.GET.get('q', '0.05')
    rows = list(Collection.objects.annotate(
        d=Distance('path', Point(0.01, 0.01, srid=4326), tolerance=tolerance),
    ).filter(d=1.0).values('name'))
    if rows:
        with open(FLAG_PATH, encoding='utf-8') as flag_file:
            return HttpResponse(flag_file.read().strip())
    return HttpResponse('No matching rows')


def vuln2(request: HttpRequest) -> HttpResponse:
    tolerance = request.GET.get('q', '0.05')
    result = Collection2.objects.aggregate(Union('point', tolerance=tolerance))
    return HttpResponse(str(result))
