from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import DeviceControl, SensorData
from .serializers import DeviceControlSerializer, SensorDataSerializer

@api_view(['GET', 'POST', 'PATCH'])
def device_api(request):
    state, _ = DeviceControl.objects.get_or_create(id=1)

    if request.method in ['POST', 'PATCH']:
        serializer = DeviceControlSerializer(state, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "updated", "data": serializer.data})
        return Response(serializer.errors, status=400)

    serializer = DeviceControlSerializer(state)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
def sensor_api(request):
    if request.method == "POST":
        serializer = SensorDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "saved"})
        return Response(serializer.errors, status=400)

    latest = SensorData.objects.last()
    serializer = SensorDataSerializer(latest)
    return Response(serializer.data)