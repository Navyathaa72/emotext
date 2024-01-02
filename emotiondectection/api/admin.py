from django.contrib import admin
from .models import *

@admin.register(text)
class textAdmin(admin.ModelAdmin):
    list_display =  ['content']

@admin.register(TextAnalysis)
class TextAnalysisAdmin(admin.ModelAdmin):
    list_display = ['des']


