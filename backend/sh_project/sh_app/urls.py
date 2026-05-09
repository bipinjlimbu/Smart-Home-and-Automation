from django.urls import path
from .views import device_api, sensor_api

urlpatterns = [
    path('device/', device_api, name='device_api'),
    path('sensor/', sensor_api, name='sensor_api'),
]