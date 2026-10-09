"""Routes for the two Vulhub GIS tolerance paths."""

from django.conf.urls import url

from vuln import views


urlpatterns = [
    url(r'^$', views.index),
    url(r'^health/$', views.health),
    url(r'^vuln/$', views.vuln),
    url(r'^vuln2/$', views.vuln2),
]
