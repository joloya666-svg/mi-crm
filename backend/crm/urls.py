# crm/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DealViewSet, StageViewSet, ProspectViewSet

router = DefaultRouter()
router.register(r'deals', DealViewSet)
router.register(r'stages', StageViewSet)
router.register(r'prospects', ProspectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]