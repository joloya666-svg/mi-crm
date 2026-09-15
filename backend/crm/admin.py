from django.contrib import admin

from .models import Activity, Deal, DealProduct, Organization, Person, Product, Prospect, Stage


class DealProductInline(admin.TabularInline):
    model = DealProduct
    extra = 1


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'order', 'is_won', 'is_lost')
    ordering = ('order',)


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'value', 'stage', 'person_name', 'owner', 'visibility', 'created_at')
    list_filter = ('stage', 'owner', 'visibility', 'contact_source')
    search_fields = ('title', 'person_name', 'organization__name', 'person__name', 'tags')
    inlines = [DealProductInline]


@admin.register(Prospect)
class ProspectAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'name', 'organization', 'city', 'source', 'owner', 'visibility', 'created_at')
    list_filter = ('city', 'source', 'owner', 'visibility')
    search_fields = ('name', 'title', 'organization', 'tags')


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'city', 'owner')
    search_fields = ('name', 'email', 'phone', 'city')
    list_filter = ('owner', 'city')


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'organization', 'email', 'phone', 'owner')
    search_fields = ('name', 'email', 'phone', 'organization__name')
    list_filter = ('owner',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'price')
    search_fields = ('name', 'code')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'type', 'due_date', 'duration', 'status', 'owner')
    list_filter = ('type', 'status', 'owner')
    search_fields = ('subject', 'note', 'person__name', 'deal__title', 'prospect__title')
