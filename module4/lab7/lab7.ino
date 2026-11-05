#include <Stepper.h>
#include <ESP32Servo.h>

int servoPin = 5;
int servoPos;
int numSteps;
Stepper myStepper(2048, 15, 16, 17, 18);

Servo myServo;
void setup(){

  // setup and attach the pins
  numSteps = 0;
  servoPos = 0;
  myStepper.setSpeed(10);
  myServo.attach(servoPin);
}

void loop() {

  // every loop, we step the stepper 128, and then every 2048 steps (one revolution), we move the servo by 10 degrees. If servo becomes 180 degrees, move back to 0. 
  myStepper.step(128);
  numSteps += 128;
  if (numSteps % 2048 == 0)
  {
    if (servoPos != 180)
      servoPos += 10;
    else 
      servoPos = 0;

    myServo.write(servoPos);
  }
  delay(100);
}