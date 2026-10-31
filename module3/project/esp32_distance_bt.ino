#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "a7c2e1f0-3b4d-4e8a-9c1f-2d5e6f708192"
#define CHARACTERISTIC_UUID "a7c2e1f1-3b4d-4e8a-9c1f-2d5e6f708192"

const int TRIG_PIN = 5;
const int ECHO_PIN = 6;

BLECharacteristic *distanceChar = nullptr;
bool clientConnected = false;

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    clientConnected = true;
    Serial.println("Pi connected.");
  }
  void onDisconnect(BLEServer *server) override {
    clientConnected = false;
    Serial.println("Pi disconnected.");
    BLEDevice::startAdvertising();
  }
};

float readDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1.0;
  return duration * 0.0343 / 2.0;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  BLEDevice::init("ESP32_Sensor");
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());

  BLEService *service = server->createService(SERVICE_UUID);
  distanceChar = service->createCharacteristic(
      CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  distanceChar->addDescriptor(new BLE2902());
  service->start();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BLE advertising as 'ESP32_Sensor'.");
}

void loop() {
  float distance = readDistance();

  char buf[16];
  int len = snprintf(buf, sizeof(buf), "%.1f", distance);
  distanceChar->setValue((uint8_t *)buf, len);
  if (clientConnected) {
    distanceChar->notify();
  }

  Serial.println(buf);
  delay(100);
}
