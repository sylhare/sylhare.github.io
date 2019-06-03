---
layout: post
title: NSEC2019 - Neurosoft Craiglist Trial
color: rgb(42,41,62)
tags: [ctf]
---

During the competition there was at some point a craiglist kind of paper for a synapse experiment
with Neurosoft (The company that implements chips in your brain).

On the coupon was a website [neuro://synapse-trials.ctf](neuro://synapse-trials.ctf) and a phone number `1-647-490-NSEC`.
After checking the website, we could find in the source page of the page this flag:

```
 Flag-CraigsListIsSo2011
```
 
Next was the number, the `NSEC` correspond to `6732` (looking at an old phone keyboard).
After calling the `1-647-490-NSEC` number we get the what seemed to be NeuroSoft hotline.

They greet you and inform you that the waiting time is unusually long, before putting some 
music. After multiple `your call is important to us` and `2'30"` of music we finally get to ear Cameron, 
which soon starts shooting binaries at us:

<audio controls src="{{"/assets/other/neurosoft-last.wav" | relative_url}}">
<p>Your browser doesn't support HTML5 audio. Here is a <a href="{{"/assets/other/dolphin.wav" | relative_url}}">link to the audio</a> instead.</p></audio>

After using software phone, we can record the whole call, then thanks to our own Voice To Text implementation
(we could have used a software available online) we manage to get the message:

```coffeescript
Please verify that you are not fully human:
1000110100110010000011 000111010110110000111100001110 110011011001001101110010110011 011100001111100111000101100101
```

Now it's time to decrypt the binary, it will surely be something in ascii starting like `FLAG-`.
However when converting to 8-bits we get gibberish:

```bash
BIN (8bit)	2u7,>qe
```

However something is intriguing because the first bits almost looks like F (`01000110` very much like `1000110`).
As if it was missing a `0` in front.

We got the answer a bit too late, after using [dcode.fr](https://www.dcode.fr/code-ascii), we manage to get 
the flag which was 7-bits encoded.

```bash
BIN (7bit)	FLAG-CallMeMaybe
```

Here is how 7 bit and 8 bit encoding looks like next to each other. The first `0` is just trimmed.
```coffeescript
# 8 bit
01000110 01001100 01000001 01000111 00101101 01000011 01100001 01101100 01101100 01001101 01100101 01001101 01100001 01111001 01100010 01100101
# 7 bit
 1000110  1001100  1000001  1000111  0101101  1000011  1100001  1101100  1101100  1001101  1100101  1001101  1100001  1111001  1100010  1100101
```