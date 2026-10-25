# Lab 1


## Description

In this lab, we set up our Raspberry Pi 5 to automatically back up important config files and the ip address on startup to our remote github repository. We accomplished this by 1. Writing a shell script to update and save these files in our local project and also push the changes to our remote github repository (found as [autobackup.sh](/raspberrypi/scripts/autobackup.sh)) 2. Making a systemd service to run this script after the pi was connected to a network (found in [autobackup.service](/raspberrypi/services/autobackup.service)). We moved these files to their correct locations and set some execution permissions explicility before it worked (detailed in the [log](log.txt))


## Video and pictures

(None for this lab, because we only made software changes)

