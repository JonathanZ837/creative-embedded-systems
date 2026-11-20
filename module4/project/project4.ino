#include <ESP32Servo.h>
#include <AccelStepper.h>

const int numSensors = 4; 
const int lightSensorPins[numSensors] = {4, 6, 7, 8};
int lightThresholdOn[numSensors];
int lightThresholdOff[numSensors];
bool shadowed[numSensors] = {false, false, false, false};

const unsigned long calibrationTime = 3000;
const int onOffset = 100; // the deviation from average brightness during calibration to trigger a tick
const int offOffset = 50; // the deviation from average brightness during calibration to untrigger a tick

Servo myServo;
int servoPin = 5;

int IN1Pin = 15;
int IN2Pin = 16;
int IN3Pin = 17;
int IN4Pin = 18;

// initialize stepper
#define motorInterfaceType 4
AccelStepper myStepper(motorInterfaceType, IN1Pin, IN3Pin, IN2Pin, IN4Pin);

const int stepsPerRevolution = 2048;
const int leftServoDegree = 35; // the degree that the servo will snap to in a tick when it is to the right
const int rightServoDegree = 75; // the degree that the servo will snap to in a tick when it is to the left

float BPM = 80.0; // the estimate BPM of the metronome, can't go much higher than 80 :(

bool servoAtLeft = false; // bool to determine location of servo quickly

// Called at setup, will calibrate for calibrationTime milliseconds by taking the average brightness reading for each sensor and setting appropriate off and on thresholds.
void calibrateSensors() {
  Serial.println("Calibrating...");

  long sum[numSensors] = {0, 0, 0, 0};
  long count = 0;
  unsigned long start = millis();

  while (millis() - start < calibrationTime) {
    for (int i = 0; i < numSensors; i++) {
      sum[i] += analogRead(lightSensorPins[i]);
    }
    count++;
    delay(5);
  }

  for (int i = 0; i < numSensors; i++) {
    int average = sum[i] / count;
    lightThresholdOn[i] = average - onOffset;
    lightThresholdOff[i] = average - offOffset;
  }

  Serial.println("Calibration done");
}

// tick the servo by turning angle to servoAtLeft when it's at servoAtRight, and vice versa.
void tickServo() {
  if (servoAtLeft) {
    myServo.write(rightServoDegree);
    servoAtLeft = !servoAtLeft;
  } else {
    myServo.write(leftServoDegree);
    servoAtLeft = !servoAtLeft;
  }
}

void setup() {
  Serial.begin(115200);

  myStepper.setMaxSpeed(1000);
    myStepper.setSpeed(BPM / 60.0 / numSensors * stepsPerRevolution); // set the constant speed of the stepper

  myServo.attach(servoPin);

  calibrateSensors();
}


void loop() {
  myStepper.runSpeed();


  // for each sensor, detect if the shadowed bool needs to be turned off or on. If turned on, then tick the servo.
  int brightness[numSensors];
  for (int i = 0; i < numSensors; i++) {
      brightness[i] = analogRead(lightSensorPins[i]);
      if (!shadowed[i] && brightness[i] <= lightThresholdOn[i]) {
        shadowed[i] = true;
        Serial.println("ticked");
        Serial.println(i);
        tickServo();
      } else if (shadowed[i] && brightness[i] > lightThresholdOff[i]) {
        shadowed[i] = false;
      }
  }
}