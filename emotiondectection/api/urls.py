from django.urls import path
from .views import *

urlpatterns = [
    path('text/', textview.as_view(), name='content'),
    path('text/<int:pk>/', textview.as_view(), name='text-detail'),
    path('your-endpoint/', YourViewName.as_view(), name='your-view-name'),
    
]
