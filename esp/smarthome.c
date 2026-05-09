#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include "DHT.h"

// --- Configuration ---
const char *ssid = "Bipin";
const char *password = "1334666667";
const char *serverBase = "http://192.168.137.1:8000/api"; // Your Django Server IP

// --- Pin Definitions ---
#define DHTPIN 4
#define DHTTYPE DHT11
#define MQ2_PIN 34
#define FLAME_PIN 35 // Pin for Fire Warning (Digital)
#define SOIL_PIN 36  // Pin for Soil Moisture

const int bulbPins[] = {13, 12, 14, 27, 26, 25}; // 6 Bulbs
const int gatePins[] = {33, 32, 15, 2, 16};      // 5 Gates (Servos)
#define FAN_PIN 17                               // Living Room Automatic Fan
#define PUMP_PIN 18                              // Water Pump

// --- Objects ---
DHT dht(DHTPIN, DHTTYPE);
Servo gates[5];

void setup()
{
    Serial.begin(115200);

    // Initialize Sensors
    dht.begin();
    pinMode(FLAME_PIN, INPUT);

    // Initialize Outputs (Active HIGH logic for Bulbs/Fan)
    for (int i = 0; i < 6; i++)
        pinMode(bulbPins[i], OUTPUT);
    pinMode(FAN_PIN, OUTPUT);
    pinMode(PUMP_PIN, OUTPUT);

    // Initialize Servos for Gates
    for (int i = 0; i < 5; i++)
    {
        gates[i].setPeriodHertz(50);
        gates[i].attach(gatePins[i], 500, 2400);
    }

    // Connect WiFi
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
        // 1. Send Sensor Data to Django (POST or PATCH)
        updateSensors();

        // 2. Get Device States from Django (GET)
        syncDevices();
    }
    delay(2000); // 2-second synchronization cycle
}

void updateSensors()
{
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    int gas = analogRead(MQ2_PIN);
    int soil = analogRead(SOIL_PIN);

    // 🔥 Mapping added (ONLY CHANGE)
    int gasPercent = map(gas, 0, 4095, 0, 100);
    gasPercent = constrain(gasPercent, 0, 100);

    int soilPercent = map(soil, 4095, 0, 0, 100);
    soilPercent = constrain(soilPercent, 0, 100);

    bool fire = digitalRead(FLAME_PIN) == LOW; // Assuming active LOW flame sensor

    if (!isnan(temp) && !isnan(hum))
    {
        HTTPClient http;
        http.begin(String(serverBase) + "/sensor/");
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<256> doc;
        doc["temperature"] = temp;
        doc["humidity"] = hum;

        // 🔥 sending mapped values (same keys replaced)
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
            // Update 6 Bulbs
            for (int i = 0; i < 6; i++)
            {
                String key = "bulb_" + String(i + 1);
                digitalWrite(bulbPins[i], doc[key] ? HIGH : LOW);
            }

            // Update 5 Security Gates (Servos)
            for (int i = 0; i < 5; i++)
            {
                String key = "door_" + String(i + 1);
                int angle = doc[key]; // 0 for closed, 90 for open
                gates[i].write(angle);
            }

            // Update Living Room Automatic Fan & Pump
            digitalWrite(FAN_PIN, doc["fan"] ? HIGH : LOW);
            digitalWrite(PUMP_PIN, doc["water_pump"] ? HIGH : LOW);

            Serial.println("Hardware Synced with Dashboard");
        }
    }
    http.end();
}