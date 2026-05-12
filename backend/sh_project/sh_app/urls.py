from django.urls import path
from .views import device_api, sensor_api, sensor_history_api

urlpatterns = [
    path('device/', device_api, name='device_api'),
    path('sensor/', sensor_api, name='sensor_api'),
    path('sensor/history/', sensor_history_api, name='sensor_history_api'),
]