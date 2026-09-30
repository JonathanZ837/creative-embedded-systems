from gpiozero import Button
button = Button(17)
switch = Button(27)
joyx = Button(22)
while True:
	switchPressed = switch.is_pressed
	buttonPressed = button.is_pressed
	joyxPressed = joyx.is_pressed
	
	output = ""
	if switchPressed:
		output += "switch pressed "
	if buttonPressed:
		output += "button pressed "
	if joyxPressed:
		output += "joystick tilted "
	if not output:
		output = "nothing pressed"
	print(output)
