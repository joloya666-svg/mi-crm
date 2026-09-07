from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Deal, Stage, Prospect
from .serializers import DealSerializer, StageSerializer, ProspectSerializer

class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all()
    serializer_class = DealSerializer

    @action(detail=True, methods=['patch'])
    def change_stage(self, request, pk=None):
        deal = self.get_object()
        new_stage_id = request.data.get('stage_id')
        try:
            new_stage = Stage.objects.get(id=new_stage_id)
            deal.stage = new_stage
            deal.save()
            return Response({'status': 'stage updated'})
        except Stage.DoesNotExist:
            return Response({'error': 'Stage not found'}, status=400)

class StageViewSet(viewsets.ModelViewSet):
    queryset = Stage.objects.all()
    serializer_class = StageSerializer

class ProspectViewSet(viewsets.ModelViewSet):
    queryset = Prospect.objects.all()
    serializer_class = ProspectSerializer