from django.conf import settings
from django.db import models


class OwnedQuerySet(models.QuerySet):
    def visible_to(self, user):
        if not user or not user.is_authenticated or user.is_staff or user.is_superuser:
            return self
        field_names = {field.name for field in self.model._meta.fields}
        filters = models.Q()
        if 'owner' in field_names:
            filters |= models.Q(owner=user)
        if 'visibility' in field_names:
            filters |= models.Q(visibility='shared')
        if 'created_by' in field_names:
            filters |= models.Q(created_by=user)
        return self.filter(filters).distinct()


class Stage(models.Model):
    name = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    is_won = models.BooleanField(default=False)
    is_lost = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class Organization(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=100, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OwnedQuerySet.as_manager()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Person(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='people')
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OwnedQuerySet.as_manager()

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=80, blank=True)
    price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Deal(models.Model):
    VISIBILITY_CHOICES = [
        ('private', 'Privado'),
        ('shared', 'Compartido'),
    ]

    title = models.CharField(max_length=255)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    person_name = models.CharField(max_length=255, blank=True)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    pipeline = models.CharField(max_length=100, default='Ventas')
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.CharField(max_length=255, blank=True)
    expected_close_date = models.DateField(null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_deals')
    source_channel_id = models.CharField(max_length=120, blank=True)
    contact_source = models.CharField(max_length=120, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='shared')
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    vertical = models.CharField(max_length=120, blank=True)
    customer_classification = models.CharField(max_length=120, blank=True)
    specialty = models.CharField(max_length=120, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_deals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OwnedQuerySet.as_manager()

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


class DealProduct(models.Model):
    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='deal_products')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    @property
    def total(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return self.name or (self.product.name if self.product else 'Producto')


class Prospect(models.Model):
    VISIBILITY_CHOICES = Deal.VISIBILITY_CHOICES

    name = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255, blank=True)
    value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    city = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=100, blank=True)
    tags = models.CharField(max_length=255, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_prospects')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='shared')
    expected_close_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    vertical = models.CharField(max_length=120, blank=True)
    customer_classification = models.CharField(max_length=120, blank=True)
    specialty = models.CharField(max_length=120, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_prospects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OwnedQuerySet.as_manager()

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title or self.name


class Activity(models.Model):
    TYPE_CHOICES = [
        ('call', 'Llamada'),
        ('meeting', 'Reunion'),
        ('email', 'Correo'),
        ('task', 'Tarea'),
    ]
    STATUS_CHOICES = [
        ('planned', 'Planificada'),
        ('done', 'Completada'),
        ('cancelled', 'Cancelada'),
    ]

    subject = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='task')
    due_date = models.DateTimeField()
    duration = models.PositiveIntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    note = models.TextField(blank=True)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True)
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True)
    prospect = models.ForeignKey(Prospect, on_delete=models.SET_NULL, null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OwnedQuerySet.as_manager()

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return self.subject
