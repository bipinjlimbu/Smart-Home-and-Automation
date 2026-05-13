#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include "DHT.h"

// --- Configuration ---
const char *ssid = "Bipin";
const char *password = "1334666667";
const char *serverBase = "http://192.168.137.1:8000/api";

// --- Pin Definitions ---
#define DHTPIN 4
#define DHTTYPE DHT11
#define MQ2_PIN 34
#define FLAME_PIN 35
#define SOIL_PIN 36
#define BUZZER_PIN 5

const int bulbPins[] = {13, 12, 14, 27, 26, 25};
const int gatePins[] = {33, 32, 15, 2, 16};
#define FAN_PIN 17
#define PUMP_PIN 18

// --- Objects ---
DHT dht(DHTPIN, DHTTYPE);
Servo gates[5];

void setup()
{
    Serial.begin(115200);

    dht.begin();
    pinMode(FLAME_PIN, INPUT);

    for (int i = 0; i < 6; i++)
        pinMode(bulbPins[i], OUTPUT);

    pinMode(FAN_PIN, OUTPUT);
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);

    for (int i = 0; i < 5; i++)
    {
        gates[i].setPeriodHertz(50);
        gates[i].attach(gatePins[i], 500, 2400);
    }

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected!");
}

void loop()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        updateSensors();
        syncDevices(); // bulbs + gates only
    }
    delay(2000);
}

void updateSensors()
{
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    int gas = analogRead(MQ2_PIN);
    int soil = analogRead(SOIL_PIN);

    int gasPercent = map(gas, 1000, 4095, 0, 100);
    gasPercent = constrain(gasPercent, 0, 100);

    int soilPercent = map(soil, 4095, 1400, 0, 100);
    soilPercent = constrain(soilPercent, 0, 100);

    bool fire = digitalRead(FLAME_PIN) == LOW;
    bool fanState = false;
    bool pumpState = false;

    // 🔥 BUZZER
    if (gasPercent > 40 || fire)
    {
        digitalWrite(BUZZER_PIN, HIGH);
        Serial.println("⚠️ ALERT: Gas/Fire - Buzzer ON");
    }
    else
    {
        digitalWrite(BUZZER_PIN, LOW);
        Serial.println("✅ Safe - Buzzer OFF");
    }

    // 💧 AUTO WATER PUMP
    if (soilPercent < 40)
    {
        digitalWrite(PUMP_PIN, HIGH);
        pumpState = true;
        Serial.println("💧 Soil Dry → Pump ON");
    }
    else
    {
        digitalWrite(PUMP_PIN, LOW);
        pumpState = false;
        Serial.println("💧 Soil OK → Pump OFF");
    }

    // 🌡️ AUTO FAN
    if (!isnan(temp) && temp > 27)
    {
        digitalWrite(FAN_PIN, HIGH);
        fanState = true;
        Serial.println("🌡️ Temp High → Fan ON");
    }
    else
    {
        digitalWrite(FAN_PIN, LOW);
        fanState = false;
        Serial.println("🌡️ Temp Normal → Fan OFF");
    }

    // Debug
    Serial.print("Temp: "); Serial.println(temp);
    Serial.print("Humidity: "); Serial.println(hum);
    Serial.print("Gas %: "); Serial.println(gasPercent);
    Serial.print("Soil %: "); Serial.println(soilPercent);
    Serial.print("Fire: "); Serial.println(fire ? "YES" : "NO");

    // Send to server
    if (!isnan(temp) && !isnan(hum))
    {
        HTTPClient http;
        http.begin(String(serverBase) + "/sensor/");
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;
        doc["temperature"] = temp;
        doc["humidity"] = hum;
        doc["gas_level"] = gasPercent;
        doc["moisture_level"] = soilPercent;
        doc["fire_detected"] = fire;

        doc["fan"] = fanState;
        doc["water_pump"] = pumpState;

        String json;
        serializeJson(doc, json);

        int code = http.POST(json);
        Serial.print("Sensor Push Code: ");
        Serial.println(code);

        http.end();
    }
}

void syncDevices()
{
    HTTPClient http;
    http.begin(String(serverBase) + "/device/");
    int httpCode = http.GET();

    if (httpCode > 0)
    {
        String payload = http.getString();

        StaticJsonDocument<1024> doc;
        DeserializationError error = deserializeJson(doc, payload);

        if (!error)
        {
            // 💡 Bulbs
            for (int i = 0; i < 6; i++)
            {
                String key = "bulb_" + String(i + 1);
                digitalWrite(bulbPins[i], doc[key] ? LOW : HIGH);
            }

            // 🚪 Gates
            for (int i = 0; i < 5; i++)
            {
                String key = "door_" + String(i + 1);
                int angle = doc[key];

                if (i == 0 || i == 2)
                    angle = 90 - angle;

                gates[i].write(angle);
            }

            Serial.println("✅ Bulbs & Gates Synced");
        }
    }

    http.end();
}