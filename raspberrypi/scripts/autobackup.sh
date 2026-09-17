#!/bin/bash
cp //boot/firmware/config.txt ~/creative-embedded-systems/raspberrypi/.config 
hostname -I > ~/creative-embedded-systems/raspberrypi/.config/ip.md
git -C //home/stu3340/creative-embedded-systems/raspberrypi/.config commit -am "auto backup config and IP address"
git -C //home/stu3340/creative-embedded-systems/raspberrypi/.config push origin main
