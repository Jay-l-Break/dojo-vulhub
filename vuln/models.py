"""Collection from Vulhub and an inaccessible row for the read oracle."""

from django.db import models


class Collection(models.Model):
    name = models.CharField(max_length=128)


class Secret(models.Model):
    value = models.CharField(max_length=128)
