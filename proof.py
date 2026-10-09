"""Release the oracle flag after CommonMiddleware redirects externally."""

import re

from django.core import signing
from django.http import HttpResponse, HttpResponseForbidden


PROOF_SALT = 'django-002-redirect-proof'
REDIRECT_PATH = re.compile(r'//([0-9a-f]{32})\.redirect-proof\.invalid')
NONCE = re.compile(r'[0-9a-f]{32}')
FLAG_PATH = '/app/private/oracle_flag'


class RedirectProofMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        match = REDIRECT_PATH.fullmatch(request.path_info)
        if (match is not None and response.status_code == 301
                and response.get('Location') == request.path_info + '/'):
            token = signing.dumps(match.group(1), salt=PROOF_SALT)
            response.set_cookie('redirect_proof', token, max_age=120, httponly=True)
        return response


def claim(request):
    nonce = request.GET.get('nonce', '')
    token = request.COOKIES.get('redirect_proof', '')
    if NONCE.fullmatch(nonce) is None:
        return HttpResponseForbidden('Invalid redirect proof')
    try:
        signed_nonce = signing.loads(token, salt=PROOF_SALT, max_age=120)
    except signing.BadSignature:
        return HttpResponseForbidden('Invalid redirect proof')
    if signed_nonce != nonce:
        return HttpResponseForbidden('Invalid redirect proof')
    with open(FLAG_PATH, encoding='utf-8') as flag_file:
        flag = flag_file.read().strip()
    return HttpResponse(flag, content_type='text/plain')


def catchall(request):
    return HttpResponse('Django redirect reproduction', content_type='text/plain')
