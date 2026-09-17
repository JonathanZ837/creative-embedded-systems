#!/bin/bash
cp //boot/firmware/config.txt //home/stu3340/creative-embedded-systems/raspberrypi/.config
cp //etc/profile //home/stu3340/creative-embedded-systems/raspberrypi/.config 
cp //etc/passwd //home/stu3340/creative-embedded-systems/raspberrypi/.config 
cp //etc/ssh/sshd_config //home/stu3340/creative-embedded-systems/raspberrypi/.config 
cp //etc/ssh/ssh_config //home/stu3340/creative-embedded-systems/raspberrypi/.config 
cp //boot/autobackup.sh //home/stu3340/creative-embedded-systems/raspberrypi/scripts/autobackup.sh

hostname -I > //home/stu3340/creative-embedded-systems/raspberrypi/.config/ip.md
git -C //home/stu3340/creative-embedded-systems/raspberrypi/.config commit -am "auto backup config and IP address"
git -C //home/stu3340/creative-embedded-systems/raspberrypi/.config push origin main
