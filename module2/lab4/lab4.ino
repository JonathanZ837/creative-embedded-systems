const int buttonPin = 4;
const int switchPin = 5;
const int joyXPin = 6;
const int joyYPin = 7;

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP);  // pin reads HIGH until the button pulls it to GND
  pinMode(switchPin, INPUT_PULLUP);
  analogReadResolution(12);
}

void loop() {
  bool buttonPressed = digitalRead(buttonPin) == LOW;
  bool switchOn      = digitalRead(switchPin) == LOW;
  int joyXValue = analogRead(joyXPin);
  int joyYValue = analogRead(joyYPin);

  Serial.println(buttonPressed ? "Button Pressed!" : "Button not Pressed!");
  Serial.println(switchOn ? "Switch On!" : "Switch Off!");
  Serial.printf("JoyX: %d\n", joyXValue);
  Serial.printf("JoyY: %d\n", joyYValue);

  delay(500);
}
