#!/bin/bash
DISPLAY=:0 firefox --kiosk DynamicBreathingExercises/index.html &
python3 speedSensor.py