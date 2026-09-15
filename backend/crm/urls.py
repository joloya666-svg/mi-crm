# crm/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ActivityViewSet,
    DealViewSet,
    OrganizationViewSet,
    PersonViewSet,
    ProductViewSet,
    ProspectViewSet,
    StageViewSet,
    UserViewSet,
    dashboard,
)

router = DefaultRouter()
router.register(r'deals', DealViewSet)
router.register(r'stages', StageViewSet)
router.register(r'prospects', ProspectViewSet)
router.register(r'organizations', OrganizationViewSet)
router.register(r'people', PersonViewSet)
router.register(r'products', ProductViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('dashboard/', dashboard, name='dashboard'),
    path('', include(router.urls)),
]
