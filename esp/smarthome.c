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
#define BUZZER_PIN 5 // 🔥 NEW BUZZER PIN

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

    // Sensors
    dht.begin();
    pinMode(FLAME_PIN, INPUT);

    // Outputs
    for (int i = 0; i < 6; i++)
        pinMode(bulbPins[i], OUTPUT);

    pinMode(FAN_PIN, OUTPUT);
    pinMode(PUMP_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT); // 🔥 INIT BUZZER

    // Servos
    for (int i = 0; i < 5; i++)
    {
        gates[i].setPeriodHertz(50);
        gates[i].attach(gatePins[i], 500, 2400);
    }

    // WiFi
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
        syncDevices();
    }
    delay(2000);
}

void updateSensors()
{
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    int gas = analogRead(MQ2_PIN);
    int soil = analogRead(SOIL_PIN);

    // Mapping
    int gasPercent = map(gas, 0, 4095, 0, 100);
    gasPercent = constrain(gasPercent, 0, 100);

    int soilPercent = map(soil, 4095, 3000, 0, 100);
    soilPercent = constrain(soilPercent, 0, 100);

    bool fire = digitalRead(FLAME_PIN) == LOW;

    // 🔥 BUZZER LOGIC
    if (gasPercent > 40 || fire)
    {
        digitalWrite(BUZZER_PIN, HIGH); // ON
        Serial.println("⚠️ ALERT: Gas/Fire Detected - Buzzer ON");
    }
    else
    {
        digitalWrite(BUZZER_PIN, LOW); // OFF
        Serial.println("✅ Normal: No Gas/Fire Detected - Buzzer OFF");
    }

    Serial.print("Gas Data: ");
    Serial.println(gas);
    Serial.print("Gas %: ");
    Serial.println(gasPercent);

    Serial.print("Soil Data: ");
    Serial.println(soil);
    Serial.print("Soil %: ");
    Serial.println(soilPercent);

    Serial.print("Fire Detected: ");
    Serial.println(fire ? "YES" : "NO");

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

        String json;
        serializeJson(doc, json);

        int httpResponseCode = http.POST(json);

        Serial.print("Sensor Push Code: ");
        Serial.println(httpResponseCode);

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
            // Bulbs
            for (int i = 0; i < 6; i++)
            {
                String key = "bulb_" + String(i + 1);
                digitalWrite(bulbPins[i], doc[key] ? LOW : HIGH);
            }

            // Gates
            for (int i = 0; i < 5; i++)
            {
                String key = "door_" + String(i + 1);
                int angle = doc[key];

                if (i == 0 || i == 2)
                {
                    angle = 90 - angle;
                }

                gates[i].write(angle);
            }

            // Fan & Pump
            digitalWrite(FAN_PIN, doc["fan"] ? HIGH : LOW);
            digitalWrite(PUMP_PIN, doc["water_pump"] ? HIGH : LOW);

            Serial.println("Hardware Synced with Dashboard");
        }
    }

    http.end();
}