from django.conf.urls import url
from django.contrib import admin
from vuln.views import search_collections


urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^search/$', search_collections),
]
