from rest_framework import serializers
from .models import *

class textSerializer(serializers.ModelSerializer):
    content = serializers.CharField(required=False)  # Set required to False

    class Meta:
        model = text
        fields = '__all__'


class TextAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = TextAnalysis
        fields = '__all__'