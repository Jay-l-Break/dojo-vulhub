"""Public and internal routes for the debug page reproduction."""

from django.conf.urls import url

from xss import views


urlpatterns = [
    url(r'^$', views.index),
    url(r'^health/$', views.health),
    url(r'^create_user/$', views.create_user),
    url(r'^victim/visit/$', views.visit),
    url(r'^victim/bootstrap/$', views.bootstrap),
    url(r'^p$', views.payload),
    url(r'^xss-receipt/$', views.receipt),
    url(r'^xss-result/$', views.result),
]
