from django.urls import path
from .views import device_api, sensor_api

urlpatterns = [
    path('api/device/', device_api, name='device_api'),
    path('api/sensor/', sensor_api, name='sensor_api'),
]