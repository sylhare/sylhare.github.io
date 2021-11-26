---
layout: post 
title: NSEC2018 - Life on Mars 
color: rgb(107, 88, 118)
tags: [ctf]
---

## Introduction

The challenge was part of the [NorthSec][6] 2018 edition.
This write-up has also been shared on the [ctf repository][3], which seems to be slowly replaced by [ctftime.org][5]

- **Category:** forensic
- **Points:** 3
- **Description:** Can you decrypt the message on that picture?

![challenge]({{ "/assets/img/message.png" | relative_url }})

## Write-up

For this challenge, you had to download the [font][4] displayed in the image and decrypt the message. Here is a table for the
translation

![decrypt]({{"assets/img/decrypt.png" | relative_url }})

After a lot of pain, and three eye surgeries...
We resolve with some cryptic message that is spaced a bit like a normal language.

```groovy
tivvgrmt hglk gsv urihh szou lu
gsv uozt rh gsv mfnyvi gdl
nfmwivw zmw hvevm ulooldvw yb
gsv gdvougs ovggvi lu gsv
zokszyvg. hglk mvcg rh gsv
mfnyvi 3 zmw gsvm gsv hrcgs
ovggvi lu gsv zlkszyvg ulooldvw
yb gsv mrmvgvvmgs ovggvi hglk
zoo oldvixzhv
```

You can see some pattern in the language, maybe some kind of permutation like in [rot13][2]. But it yielded gibberish for
any kind of permutation.

You can decode it using an `atbash` [decipher][1] to get the
message that lets you create the flag:

```groovy
greeting stop the firss half of
the flag is the number two
mundred and seven followed by
the twelfth letter of the
alphabet. stop next is the
number 3 and then the sixth
letter of the aophabet followed
by the nineteenth letter stop
all lowercase
```

I think they obviously left some errors in the text, this font being very difficult to read.
That didn't make me doubt and after following the instructions, it gave the flag `207l3fs`.

The [Atbash Cipher][2] simply reverses the plaintext alphabet to create the ciphertext alphabet. It was a substitution 
cypher used apparently to encrypt hebrew alphabet.


[1]: http://crypto.interactive-maths.com/atbash-cipher.html
[2]: https://en.wikipedia.org/wiki/Atbash
[3]: https://github.com/ctfs/write-ups-2018
[4]: http://www.1001fonts.com/bit-blocks-ttf-brk-font.html
[5]: https://ctftime.org/writeups
[6]: https://nsec.io/
