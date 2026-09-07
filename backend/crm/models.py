from django.db import models
from django.contrib.auth.models import User

class Stage(models.Model):
    name = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    is_won = models.BooleanField(default=False)
    is_lost = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Deal(models.Model):
    title = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, blank=True)
    person_name = models.CharField(max_length=255, blank=True)  # simplificado
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Prospect(models.Model):
    name = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255, blank=True)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    city = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=100, blank=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name