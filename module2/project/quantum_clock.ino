#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <time.h>

const char* WIFI_NAME = "yale wireless";
const char* WIFI_PASSWORD = "";
const char* TIME_ZONE = "EST5EDT,M3.2.0,M11.1.0";

const int screenWidth = 128;
const int screenHeight = 32;



int oledSDAPin = 8;
int oledSCLPin = 9;
int sensorTrigPin = 5;
int sensorEchoPin = 6;

Adafruit_SSD1306 display(screenWidth, screenHeight, &Wire, -1);

void showRealTime(struct tm &t) {
  int hour = t.tm_hour % 12;
  if (hour == 0) hour = 12;
  const char* ampm = (t.tm_hour < 12) ? "AM" : "PM";

  char timeText[6];
  snprintf(timeText, sizeof(timeText), "%d:%02d", hour, t.tm_min);

  int timeWidth = strlen(timeText) * 18;
  int x = (screenWidth - (timeWidth + 4 + 24)) / 2;

  display.clearDisplay();
  display.setTextSize(3);
  display.setCursor(x, 4);
  display.print(timeText);

  display.setTextSize(2);
  display.setCursor(x + timeWidth + 4, 12);
  display.print(ampm);
  display.display();
}

void showFakeTime() {
    long hour = random(1, 25);
    long minute = random(0, 60);
    const char* ampm = (hour < 12) ? "AM" : "PM";

    char timeText[6];
    snprintf(timeText, sizeof(timeText), "%d:%02d", hour % 12, minute);

    int timeWidth = strlen(timeText) * 18;
    int x = (screenWidth - (timeWidth + 4 + 24)) / 2;

    display.clearDisplay();
    display.setTextSize(3);
    display.setCursor(x, 4);
    display.print(timeText);

    display.setTextSize(2);
    display.setCursor(x + timeWidth + 4, 12);
    display.print(ampm);
    display.display();
}

float readDistance() {
    digitalWrite(sensorTrigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(sensorTrigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(sensorTrigPin, LOW);

    float duration = pulseIn(sensorEchoPin, HIGH, 30000);
    float distance = duration * 0.0343 / 2.0;
    return distance;
}

void showDistance(float distance) {
    display.clearDisplay();
    display.setCursor(0,0);
    String distanceStr = String((int)round(distance));

    display.print(distanceStr);
    display.print("cm");
    display.display();
}

void setup() {
    Serial.begin(115200);

    pinMode(sensorTrigPin, OUTPUT);
    pinMode(sensorEchoPin, INPUT);

    Wire.begin(oledSDAPin, oledSCLPin);
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

    WiFi.begin(WIFI_NAME);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    configTzTime(TIME_ZONE, "pool.ntp.org", "time.nist.gov");

    struct tm t;
    if (!getLocalTime(&t, 15000)) {
        Serial.println("Could not get the time from the internet.");
        while (true) delay(1000);
    }

    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(4);
    display.setCursor(0,0);
}

void loop() {
    float distance = readDistance();
    if (distance < 10) {
        struct tm t;
        if (getLocalTime(&t)) {
            showRealTime(t);
        }
    } else {
        showFakeTime();
    }

    delay(100);
}
