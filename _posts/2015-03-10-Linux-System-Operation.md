---
layout: post
title: Linux System Operation
color: rgb(255, 111, 97)
tags: [Linux]
---

# System Configuration commands

Intended for Centos or Redhat.

## Network configuration commands

Show the network information

	ifconfig    # Being deprecated for Linux
	ip a

to return just the IP of the wifi 

	ifconfig wlan0 | grep "inet" | grep -v "inet6" | tr -s " " ":" | cut -f4 -d ":"

- `grep "inet`"  that includes *inet* 
- `grep -v "inet6"` that excludes the IPv6 address
- `tr -s " " ":"` is added with `tr` that means translate and `-s` squeeze to replace any `" "` (space) into `":"` finally we have 
- `cut -f4 -d ":"` that cuts the first for field with `-d `(delimiter) is `":"`


## Controlling services and daemon

With RHEL 7, you use systemctl to `mask` daemon so that they won't be start, even at reboot. It can be useful if for example you want to make some test while a service is stopped.

```
systemctl mask daemon.service
systemctl unmask daemon.service
```

## Log
 
In `/etc/rsyslog.conf` you can specify what is stored and how.
When using `*.info` is all the info log and higher. Using `mail.none` is used to specify not to store them (because it is handled in another folder). Make a space and define where you went the logs to be saved.
 
```bash
# Log anything (except mail) of level info or higher.
# Don't log private authentication messages!
*.info;mail.none;authpriv.none;cron.none       /var/log/messages
# The authpriv file has restricted access.
authpriv.*                                     /var/log/secure
# Log all the mail messages in one place.
mail.*                                        -/var/log/maillog
# Log cron stuff
cron.*                                         /var/log/cron
``` 
