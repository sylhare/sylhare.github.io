---
layout: post
title: Docker deploy to another registry.
color: rgb(13,183,237)
tags: [docker]
---

## Creating the docker

I will first create a simple dockerfile with python `3.6` and `pytest` in order to have a ready docker to run some tests.

```dockerfile
FROM python:3.6.6

RUN pip install pytest pytest-cov
```

Building my docker using:

```bash
docker build -t python3-pytest
```

I can make sure it works as intended using:

```bash
docker run -t python3-pytest python -m pytest
```

## Uploading to the registry

First let's prepare the docker image using this command from [how to push docker image to private repository](https://stackoverflow.com/questions/28349392/how-to-push-a-docker-image-to-a-private-repository).
I want to upload it in my private artifactory registry at [artifactory.private.registry.ca:5000](artifactory.private.registry.ca:5000)

```bash
# docker tag [OPTIONS] IMAGE[:TAG] [REGISTRYHOST/][USERNAME/]NAME[:TAG]
docker tag python3-pytest artifactory.private.registry.ca:5000/python/python3-pytest:1
```

Before the upload I need to login using:

```bash
docker login artifactory.private.registry.ca:5000
```
Then I just need to push it and it's done:

```bash
docker push artifactory.private.registry.ca:5000/python/python3-pytest:1
```

## Using a docker from that registry

Now that you have upload your image, let's pull it to use it:

```bash
docker pull artifactory.private.registry.ca:5000/python/python3-pytest:1

# Run the docker with the -t to allocate a pseudo-TTY
docker run -t artifactory.private.registry.ca:5000/python/python3-pytest:1
```

And that's it!