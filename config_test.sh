#!/bin/bash
# Compiling the java files and running them


export DISPLAY=:99.0
#export DISPLAY=:1.0

#Start xvfb
echo "starting screen"
#Xvfb :99 -screen 0 800x600x16 +extension RANDR || echo "fail"
#test=$?
#xdpyinfo -display :1 >/dev/null 2>&1 && echo "In use" || echo "Free"
#Check if display 99 of xfvb is used (should be the one in use)
xdpyinfo -display :99 >/dev/null 2>&1 && echo "In use" || echo "Free"

echo "starting movie"
timeout 99 firefox "https://www.youtube.com/watch?v=wdxlc2UdAmg"
movie=$? 

echo "Movie Status: $movie"

sleep 10 #To put the system on hold for 90 seconds

exit 0