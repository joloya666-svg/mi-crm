from django.contrib.auth.models import User
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Activity, Deal, Organization, Person, Product, Prospect, Stage
from .serializers import (
    ActivitySerializer,
    DealSerializer,
    OrganizationSerializer,
    PersonSerializer,
    ProductSerializer,
    ProspectSerializer,
    StageSerializer,
    UserSerializer,
)


class OwnedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(queryset, 'visible_to'):
            queryset = queryset.visible_to(self.request.user)
        return queryset

    def perform_create(self, serializer):
        owner = serializer.validated_data.get('owner') if hasattr(serializer, 'validated_data') else None
        if owner:
            serializer.save()
        else:
            serializer.save(owner=self.request.user)


class DealViewSet(OwnedModelViewSet):
    queryset = Deal.objects.select_related('stage', 'owner', 'organization', 'person').prefetch_related('deal_products__product')
    serializer_class = DealSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        stage = self.request.query_params.get('stage')
        owner = self.request.query_params.get('owner')
        tags = self.request.query_params.get('tags')
        source = self.request.query_params.get('source')
        if stage:
            queryset = queryset.filter(stage_id=stage)
        if owner:
            queryset = queryset.filter(owner_id=owner)
        if tags:
            queryset = queryset.filter(tags__icontains=tags)
        if source:
            queryset = queryset.filter(contact_source__icontains=source)
        return queryset

    @action(detail=True, methods=['patch'])
    def change_stage(self, request, pk=None):
        deal = self.get_object()
        new_stage_id = request.data.get('stage_id')

        if not new_stage_id:
            return Response({'error': 'stage_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_stage = Stage.objects.get(id=new_stage_id)
        except (Stage.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Stage not found'}, status=status.HTTP_400_BAD_REQUEST)

        deal.stage = new_stage
        deal.save(update_fields=['stage', 'updated_at'])
        return Response(DealSerializer(deal, context={'request': request}).data)


class StageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Stage.objects.order_by('order', 'id')
    serializer_class = StageSerializer


class ProspectViewSet(OwnedModelViewSet):
    queryset = Prospect.objects.select_related('owner', 'created_by')
    serializer_class = ProspectSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        city = self.request.query_params.get('city')
        tags = self.request.query_params.get('tags')
        owner = self.request.query_params.get('owner')
        source = self.request.query_params.get('source')
        if city:
            queryset = queryset.filter(city__icontains=city)
        if tags:
            queryset = queryset.filter(tags__icontains=tags)
        if owner:
            queryset = queryset.filter(owner_id=owner)
        if source:
            queryset = queryset.filter(source__icontains=source)
        return queryset


class OrganizationViewSet(OwnedModelViewSet):
    queryset = Organization.objects.select_related('owner')
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        closed_filter = Q(deals__stage__is_won=True)
        open_filter = Q(deals__stage__is_won=False, deals__stage__is_lost=False)
        return super().get_queryset().annotate(
            closed_deals=Count('deals', filter=closed_filter),
            open_deals=Count('deals', filter=open_filter),
        )


class PersonViewSet(OwnedModelViewSet):
    queryset = Person.objects.select_related('owner', 'organization')
    serializer_class = PersonSerializer

    def get_queryset(self):
        closed_filter = Q(deals__stage__is_won=True)
        open_filter = Q(deals__stage__is_won=False, deals__stage__is_lost=False)
        return super().get_queryset().annotate(
            closed_deals=Count('deals', filter=closed_filter),
            open_deals=Count('deals', filter=open_filter),
        )


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ActivityViewSet(OwnedModelViewSet):
    queryset = Activity.objects.select_related('owner', 'person', 'deal', 'prospect')
    serializer_class = ActivitySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_value = self.request.query_params.get('status')
        owner = self.request.query_params.get('owner')
        activity_type = self.request.query_params.get('type')
        if status_value:
            queryset = queryset.filter(status=status_value)
        if owner:
            queryset = queryset.filter(owner_id=owner)
        if activity_type:
            queryset = queryset.filter(type=activity_type)
        return queryset


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.filter(is_active=True).order_by('username')
    serializer_class = UserSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard(request):
    user = request.user
    deals = Deal.objects.visible_to(user).select_related('stage', 'owner')
    activities = Activity.objects.visible_to(user)
    period = request.query_params.get('period', 'all')
    owner = request.query_params.get('owner')

    if owner:
        deals = deals.filter(owner_id=owner)
        activities = activities.filter(owner_id=owner)

    if period == 'month':
        start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        deals = deals.filter(created_at__gte=start)
        activities = activities.filter(due_date__gte=start)

    deals_by_owner = [
        {
            'owner': row['owner__username'] or 'Sin propietario',
            'total': row['total'],
            'value': row['value'] or 0,
        }
        for row in deals.values('owner__username').annotate(total=Count('id'), value=Sum('value')).order_by('owner__username')
    ]

    pipeline_health = {
        'abiertos': deals.filter(stage__is_won=False, stage__is_lost=False).count(),
        'ganados': deals.filter(stage__is_won=True).count(),
        'perdidos': deals.filter(stage__is_lost=True).count(),
    }

    activities_month = [
        {'month': row['month'].strftime('%Y-%m'), 'total': row['total']}
        for row in activities.annotate(month=TruncMonth('due_date')).values('month').annotate(total=Count('id')).order_by('month')
        if row['month']
    ]

    revenue = [
        {'month': row['month'].strftime('%Y-%m'), 'value': row['value'] or 0}
        for row in deals.filter(stage__is_won=True).annotate(month=TruncMonth('updated_at')).values('month').annotate(value=Sum('value')).order_by('month')
        if row['month']
    ]

    return Response({
        'deals_by_owner': deals_by_owner,
        'pipeline_health': pipeline_health,
        'activities_month': activities_month,
        'revenue': revenue,
    })
