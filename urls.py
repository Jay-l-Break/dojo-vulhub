"""The trailing-slash catchall required by the Vulhub reproduction."""

from django.conf.urls import url

from proof import catchall, claim


urlpatterns = [
    url(r'^claim/$', claim),
    url(r'^.*/$', catchall),
]
