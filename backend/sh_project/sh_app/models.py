from django.db import models

class DeviceControl(models.Model):
    bulb_1 = models.BooleanField(default=False)
    bulb_2 = models.BooleanField(default=False)
    bulb_3 = models.BooleanField(default=False)
    bulb_4 = models.BooleanField(default=False)
    bulb_5 = models.BooleanField(default=False)
    bulb_6 = models.BooleanField(default=False)

    door_1 = models.IntegerField(default=0)
    door_2 = models.IntegerField(default=0)
    door_3 = models.IntegerField(default=0)
    door_4 = models.IntegerField(default=0)
    door_5 = models.IntegerField(default=0)

    fan = models.BooleanField(default=False)
    water_pump = models.BooleanField(default=False)

    def __str__(self):
        status = "ON" if any([
            self.bulb_1, self.bulb_2, self.bulb_3, 
            self.bulb_4, self.bulb_5, self.bulb_6,
            self.fan, self.water_pump
        ]) else "OFF"
        return f"System Status: {status}"

class SensorData(models.Model):
    temperature = models.FloatField()
    humidity = models.FloatField()
    gas_level = models.IntegerField()
    fire_detected = models.BooleanField(default=False)
    moisture_level = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        fire_status = "ALARM" if self.fire_detected else "OK"
        return f"T:{self.temperature} H:{self.humidity} G:{self.gas_level} F:{fire_status} M:{self.moisture_level}"