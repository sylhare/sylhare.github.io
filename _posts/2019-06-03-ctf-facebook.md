---
layout: post
title: How was the first Facebook CTF
color: rgb(63,105,170)
tags: [ctf]
---

## Introduction
The facebook [CTF](https://fbctf.com/) kick started on the 1st of June to the 3rd of July. It was apparently using [ctfd.io](https://ctfd.io/)
which is a plateform to host ctfs.

![vision]({{"assets/img/fb-challenges.png" | relative_url }})

The challenges were separated into 5 categories:
 - reversing: Usually a `.tar` to download and exploit
 - pwnable: Some server your could `nc` or `ssh` in, with sometime provided the source code of the application
 - crypto: Different type of crypto challenges
 - misc: Very broad that did not fit elsewhere
 - web: Challenges with a link to a web page where the flag was to be be uncovered.
 
## Points and scoreboard
 
Something interesting here, the points for a challenge were decreasing each time somebody would solve it. 
Starting at `1000` when the challenge is release, it slowly goes down to `100` once 100 persons solve it (at first it was 300).
Once at `100` the points of the flag was not going lower. Hence the faster you find the solution of a flag the more points you score.

![vision]({{"assets/img/fb-scoreboard.png" | relative_url }})
 
The winner was `Visit g.co/ctf ` a bit of troll, because that team is Google CTF and the sole member was `g+` aka Google +.
Promoting there ctf for the 22th of June.

## Challenges

The challenges were diverse, you had to click on them and a window would pop with some context and a box to submit the flag.
Each challenge have only one flag that can be submitted.

![vision]({{"assets/img/fb-challenge.png" | relative_url }})

The easter egg flag was hidden in the career page (you had to look for letters in white within the text to find it).
A simple search for `{` in each page would have been necessary to get the flag. Here is a command to get it:

```bash
curl --silent 'https://fbctf.com/careers' | egrep -o "<span style=\"color:white\">.{1}" | sed "s/<span style=\"color:white\">//g" | tr '\n' ' '

f b { w e ' r e _ h i r i n g }
```

However the first flag was an easy one to get to know how they'd look like I guess `fb{move_fast_and_hack_things}`. 
It was in the IRC:

![vision]({{"assets/img/fb-flag.png" | relative_url }}) 

All in all it was fun to try some challenges, and when seeing how fast some advancing in the challenges, 
it makes me feel that there are still a lot of things to learn.


## Write ups

And here some write ups made by the community as a reference:

- [AidanFray/CTF_Writeups](https://github.com/AidanFray/CTF_Writeups)
- [niklasb/0_frank.sage](https://gist.github.com/sylhare/c77c5620e6934b03fd67405b9c774fb8)
- [ctftime.org](https://ctftime.org/event/781/tasks/)
