---
layout: post
title: NSEC2019 - vision chip
color: rgb(42,41,62)
tags: [ctf]
---

- **Category:** coding challenge
- **Points:** 5
- **Description:** Can you pass this vision test, if it's not working it's definitely not your brain implant.
Please calibrate your vision chip.

{% include aligner.html images="vision.png" %}


## Introduction

Your are presented with a website with an image and two choices:
  - Animal
  - Thing

If you submit the correct answer you are greeted with a message `Congrats. You currently have 1 out of 15 000`.
Meaning you'd need to guess right for 15 000 consecutive time before getting the flag.
It would take insane people during an insane amount of time to get it manually, and unfortunately we're limited in time.

Looking at the type of image we'd get it looked like some kind of machine learning challenge,
with images of dog looking like muffin or donuts:

{% include aligner.html images="vision-dog.png,vision-muffin.png" %}

However after trying some, it feels like some images come back very often meaning there must not be more than 20 to 50 images total.
Based on that assumption I build a little script.

## Solution

We will use python to build the script, basically it would follow these 4 steps:

- Get the image from the site at `http://vision.ctf/catchat.php`
- Compare it with the already saved images
- Post the answer to the website and check the result
- In case of failure, save the image and retry

### Get the image

We will use `requests` for that:

```python
import requests

response = requests.get('http://vision.ctf/catchat.php', headers=headers, cookies=cookies)

with open(os.path.join(catchat, "sample.png"), 'wb') as f:
    f.write(response.content)
```

Then we save the image as `sample.png`

### Compare the image

So I stored all of the images in a `things` folder, and I compare the just obtained `sample` to the one stored there.
I created a function that return True if the `sample` image is already in the `things` folder, False otherwise:

```python
def in_things():
    result = False
    for filename in os.listdir(things_path):
        if filename.endswith(".png"):
            pre_result = image_compare(Image.open(os.path.join(catchat, "sample.png")),
                                       Image.open(os.path.join(things_path, filename)))
            if pre_result < 10:
                result = True
    print("in Things? " + str(result))
    return result
```

For the `image_compare` function, I tried multiple online and finally got the one from [Rosetta Code](https://rosettacode.org/wiki/Percentage_difference_between_images#python)
which I managed to use using the `PIL` library.

```python
from PIL import Image

def image_compare(i1, i2):
    pairs = zip(i1.getdata(), i2.getdata())
    if len(i1.getbands()) == 1:
        # for gray-scale jpegs
        dif = sum(abs(p1 - p2) for p1, p2 in pairs)
    else:
        dif = sum(abs(c1 - c2) for p1, p2 in pairs for c1, c2 in zip(p1, p2))

    ncomponents = i1.size[0] * i1.size[1] * 3
    return (dif / 255.0 * 100) / ncomponents
```

### Post the answer back

From observing the request sent manually, the website uses a `cookie` and a specific payload to validate for the results,
so I copy those to add it to my post request:
```python
cookies = {'PHPSESSID': '6d0db2mni2vrv65e98mo5md1gr'}

animal = {'result': 'animal'}
thing = {'result': 'thing'}
```

So the now if the image is not in the `things` folder, then it must mean it is an animal.
So depending on the `in_things()` method, I know what result I need to submit:

```python
if not in_things():
    post = requests.post('http://vision.ctf/index.php', headers=headers, cookies=cookies, data=animal)
    status = re.search("(C.* 15 000<)+", str(post.content))
    if_wrong_save_image(status)

else:
    post = requests.post('http://vision.ctf/index.php', headers=headers, cookies=cookies, data=thing)
    status = re.search("(C.* 15 000<)+", str(post.content))
    if_wrong_save_image(status, image_type="animals")
```

### In case of failure

The trick to know if the `POST` succeeded, and that I have correctly guessed if it is an animal or a thing is to check the returning page.
If I guessed correctly I should see something like `Congrats. You currently have 1 out of 15 000`.
So I used the `re` module (regex) to search for exactly that sentence:
  - ```status = re.search("(C.* 15 000<)+", str(post.content))```

In the case it's wrong `status` will return `None` and so I would copy `sample.png` which is a new image to the correct folder:

```python
def if_wrong_save_image(congrats_regex, image_type="things"):
    if congrats_regex is None:
        print("new {}".format(image_type))
        new_image = "thing" + time.strftime("%Y%m%d-%H%M%S") + ".png"
        copyfile(os.path.join(catchat, "sample.png"),
                 os.path.join(os.path.join(catchat, "/samples/{}".format(image_type)), new_image))
```

Finally, running the whole code inside of a infinite loop, and a couple of retry at first (there was just around 40 images in the end).

it would take around 3 to 4 hours to get the flag:

- FLAG-0af9e4f2996a7169ebf85f91133d73a1

That was an awesome little challenge!
I was worried they'd throw a new random image toward the end, that would make the whole thing retry again for 4 hours.
But they were not so evil.

