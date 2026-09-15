from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Activity, Deal, DealProduct, Organization, Person, Product, Prospect, Stage


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = '__all__'


class OrganizationSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    closed_deals = serializers.IntegerField(read_only=True)
    open_deals = serializers.IntegerField(read_only=True)

    class Meta:
        model = Organization
        fields = '__all__'


class PersonSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    closed_deals = serializers.IntegerField(read_only=True)
    open_deals = serializers.IntegerField(read_only=True)

    class Meta:
        model = Person
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


class DealProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = DealProduct
        fields = ['id', 'product', 'product_name', 'name', 'quantity', 'unit_price', 'total']


class DealSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    person_display_name = serializers.CharField(source='person.name', read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    products = DealProductSerializer(source='deal_products', many=True, required=False)

    class Meta:
        model = Deal
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        products_data = validated_data.pop('deal_products', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data.setdefault('owner', request.user)
            validated_data['created_by'] = request.user
        deal = Deal.objects.create(**validated_data)
        self._save_products(deal, products_data)
        return deal

    def update(self, instance, validated_data):
        products_data = validated_data.pop('deal_products', None)
        instance = super().update(instance, validated_data)
        if products_data is not None:
            instance.deal_products.all().delete()
            self._save_products(instance, products_data)
        return instance

    def _save_products(self, deal, products_data):
        for item in products_data:
            product = item.get('product')
            DealProduct.objects.create(
                deal=deal,
                product=product,
                name=item.get('name') or (product.name if product else ''),
                quantity=item.get('quantity') or 1,
                unit_price=item.get('unit_price') or (product.price if product else 0),
            )


class ProspectSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    creator_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Prospect
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data.setdefault('owner', request.user)
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class ActivitySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    person_name = serializers.CharField(source='person.name', read_only=True)
    deal_title = serializers.CharField(source='deal.title', read_only=True)
    prospect_title = serializers.CharField(source='prospect.title', read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data.setdefault('owner', request.user)
        return super().create(validated_data)
