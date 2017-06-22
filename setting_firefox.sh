#!/bin/bash
#http://www.markhneedham.com/blog/2011/12/15/webdriver-getting-it-to-play-nicely-with-xvfb/
 
rm -f ~/.mozilla/firefox/*/.parentlock
rm -rf /var/go/.mozilla
 
XVFB=`which xVfb`
if [ "$?" -eq 1 ];
then
    echo "Xvfb not found."
    exit 1
fi
 
$XVFB :99 -ac &
 
 
BROWSER=`which firefox`
if [ "$?" -eq 1 ];
then
    echo "Firefox not found."
    exit 1
fi
 
export DISPLAY=:99
$BROWSER &

exit 0