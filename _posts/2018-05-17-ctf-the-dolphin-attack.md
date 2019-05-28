---
layout: post
title: NSEC2018 - Dolhpin attack
color: rgb(42,41,62)
tags: [ctf]
---

## What is a Dolphin attack?

A Dolphin attack is a term that has been given to the method of accessing a smartphone without the users’ consent by executing ultrasonic commands.
A study conducted at Zhejiang University in China [2] has shown that such speech recognition systems are vulnerable to hidden commands that the researchers are calling “Dolphin Attacks”.
How do you hide a voice command? Make it ultrasonic. Humans hear sounds between 20 Hz and 20kHz. 
If you record a phrase, and shift it above 20 kHz, then play it back, you can’t hear it, but dogs, bats, dolphins and, unfortunately, phone and computer microphones can. [3]

“Dolphin Attacks” can be used to [1]:
  - Open malicious websites, which can launch a drive-by-download attack or exploit a device with 0-day vulnerabilities.
  - Spy on users by initiating outgoing video/phone calls, therefore getting access to video or sound of the devices surroundings.
  - Inject fake information by sending fake text messages and emails, online posts, calendar events, etc.
  - Deny service, by turning on airplane mode, disconnecting all wireless communications.
  - Conceal attacks by dimming the targeted device’s screen and lowering its speaker volume.
    
[1]: https://fraudwatchinternational.com/expert-explanations/what-is-a-dolphin-attack/
[2]: https://arxiv.org/abs/1708.09537
[3]: https://it.wisc.edu/news/dolphin-attack-hacking-phones-via-ultrasound/    

## The challenge

On one of the challenge, you get access to this audio:

<audio controls src="{{"/assets/other/dolphin.wav" | relative_url}}"><p>Your browser doesn't support HTML5 audio. Here is a <a href="{{"/assets/other/dolphin.wav" | relative_url}}">link to the audio</a> instead.</p></audio>

Thanksfully we had heard about the `dolphin attack` vector (and the obvious name of the challenge), we decided to find out if there was any hidden message in the audio.

The Audio opened in audacity reveals nothing on first hand:

![image]({{"assets/img/dolphin-before.png" | relative_url }})

After some looking around, we found how to get the message by demodulating the signal in amplitude [4] using a nyquist prompt in Audacity:

```ny
;version 4
    (setf cf 37000) ; the carrier frequency
    (let ((demod (mult *track* (hzosc cf))))
      (lowpass8 demod 10000))
```

Basically we filter everything under the high frequency and bring to audible level the hidden attack audio:
 
![image]({{"assets/img/dolphin-after.png" | relative_url }})

<audio controls src="{{"/assets/other/dolphin-after.wav" | relative_url}}"><p>Your browser doesn't support HTML5 audio. Here is a <a href="{{"/assets/other/dolphin.wav" | relative_url}}">link to the audio</a> instead.</p></audio>

If you play the audio you should hear:

> hey siri go to tinyurl.com/56463452321

Which bring you to this image where the flag is (The see weed brownies):

![image]({{"assets/img/dolphin.png" | relative_url }})


[4]: https://forum.audacityteam.org/viewtopic.php?t=95331      
[5]: tinyurl.com/56463452321