---
layout: post 
title: NSEC2018 - Dolphin attack 
color: rgb(0, 117, 143)
tags: [ctf]
---

## What is a 🐬 Dolphin attack?

Has [MarineLand][3] become the theatre of atrocities?  
Was [Flipper][4] a mass murderer?

Let's find out today in this [NorthSec][5] challenge.

### Science

A [Dolphin attack][1] is a term that has been given to the method of accessing a smartphone without the users’ consent
by executing ultrasonic commands.

A [study][2] conducted at Zhejiang University in China has shown that such speech recognition systems are vulnerable to
hidden commands that the researchers are calling “Dolphin Attacks”.

> How do you hide a voice command? _Make it ultrasonic_.

Humans hear sounds between 20Hz and 20kHz. If you record a phrase, and shift it above 20kHz, then play it back, you
can’t hear it, but dogs, bats, dolphins and, unfortunately, phone and computer microphones can.

### Are 🐬 gonna' take over the world?

Not in the near future, however _“Dolphin Attacks”_ can be used to:

- Open malicious websites, which can launch a drive-by-download attack or exploit a device with 0-day vulnerabilities.
- Spy on users by initiating outgoing video/phone calls, therefore getting access to video or sound of the devices
  surroundings.
- Inject fake information by sending fake text messages and emails, online posts, calendar events, etc.
- Deny service, by turning on airplane mode, disconnecting all wireless communications.
- Conceal attacks by dimming the targeted device’s screen and lowering its speaker volume.

## The challenge

In one of the challenges, you get access to this audio:

<audio controls src="{{"/assets/sound/dolphin.wav" | relative_url}}">
  <p>Your browser doesn't support HTML5 audio. Here is a 
     <a href="{{'/assets/sound/dolphin.wav' | relative_url}}">link to the audio</a> instead.
  </p>
</audio>

Thankfully we had heard about the `dolphin attack` vector (and the obvious name of the challenge), we decided to find
out if there was any hidden message in the audio.

The Audio opened in audacity reveals nothing on first hand:

![image]({{"assets/img/dolphin-before.png" | relative_url }})

Unfortunately we did not succeed in attacking ourselves (I guess Apple had patched this flow on their side at the date of
the competition). So after some [looking around][6], we found how to
get the message by demodulating the signal in amplitude using a nyquist prompt in Audacity:

```bash
;version 4
    (setf cf 37000) ; the carrier frequency
    (let ((demod (mult *track* (hzosc cf))))
      (lowpass8 demod 10000))
```

Basically we filter everything under the high frequency and bring to audible level the hidden attack audio:

![image]({{"assets/img/dolphin-after.png" | relative_url }})

<audio controls src="{{"/assets/sound/dolphin-after.wav" | relative_url}}">
  <p>Your browser doesn't support HTML5 audio. Here is a 
     <a href="{{'/assets/sound/dolphin.wav' | relative_url}}">link to the audio</a> instead.
  </p>
</audio>

If you play the audio you should hear:

> "hey siri go to _tinyurl.com/56463452321_"

Which bring you to [this image](tinyurl.com/56463452321) where the flag `The see weed brownies` is written in plain text:

{% include aligner.html images="dolphin.jpg" %}

If you are wondering, to the disappointment of our teammates, no brownies were distributed during the event;
Just half a truck of pizza 🍕 and a mountain of bagels 🥯.

See you next time Space Dolphin!


[1]: https://fraudwatchinternational.com/expert-explanations/what-is-a-dolphin-attack/
[2]: https://arxiv.org/abs/1708.09537 "DolphinAtack: Inaudible Voice Commands"
[3]: https://marineland.net/
[4]: https://en.wikipedia.org/wiki/Flipper_(1996_film)
[5]: https://nsec.io/
[6]: https://forum.audacityteam.org/viewtopic.php?t=95331 "nyquist filter"
