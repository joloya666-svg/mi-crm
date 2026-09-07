from rest_framework import serializers
from .models import Deal, Stage, Prospect

class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = '__all__'

class DealSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True)

    class Meta:
        model = Deal
        fields = ['id', 'title', 'value', 'stage', 'stage_name', 'person_name', 'owner', 'created_at']

class ProspectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prospect
        fields = '__all__'