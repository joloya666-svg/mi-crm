from django.contrib import admin
from .models import Deal, Stage, Prospect

@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'order')
    ordering = ('order',)

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'value', 'stage', 'person_name', 'owner', 'created_at')
    list_filter = ('stage', 'owner')
    search_fields = ('title', 'person_name')

@admin.register(Prospect)
class ProspectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'organization', 'city', 'source', 'owner', 'created_at')
    list_filter = ('city', 'source', 'owner')
    search_fields = ('name', 'organization')