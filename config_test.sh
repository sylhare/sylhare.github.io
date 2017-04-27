#!/bin/bash
# Compiling the java files and running them

#Start xvfb
Xvfb :1 -screen 0 800x600x16
xdpyinfo -display :1 >/dev/null 2>&1 && echo "In use" || echo "Free"
#Check if display 99 of xfvb is used
xdpyinfo -display :99 >/dev/null 2>&1 && echo "In use" || echo "Free"

export DISPLAY=:1.0

timeout 100 firefox "https://www.youtube.com/watch?v=wdxlc2UdAmg"
movie=$? 

echo "Movie Status: $movie"

sleep 90 #To put the system on hold for 90 seconds

exit 0