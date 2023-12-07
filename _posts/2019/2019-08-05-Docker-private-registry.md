---
layout: post
title: Docker 🐳 deploy to another registry
color: rgb(13,183,237)
tags: [kubernetes]
---

## Creating the docker

If you are new to docker, I would recommend this [article][10] for some basics docker commands and how to create your
Dockerfile, docker images and running container.
I will first create a simple dockerfile with python `3.6` and `pytest` in order to have a ready docker to run some tests.

```dockerfile
FROM python:3.6.6

RUN pip install pytest pytest-cov
```

Building my docker image using:

```bash
docker build . -t python3-pytest
```

I tagged the built image to `python3-pytest`, so it doesn't have a random name.
Then I can make sure it works as intended using:

```bash
docker run -t python3-pytest python -m pytest
```

## Uploading to the registry

The default docker push would upload the image on [hub.docker.com][4], but it's a private image, so I want to upload it 
in my private artifactory registry at [artifactory.private.registry.ca:5000][2].

[Artifactory][3] made by JFrog is a solution for hosting, managing, and distributing binaries and artifacts. Including
docker images. But this procedure could work with any other registry type as the docker commands are agnostics.

### Step by step

Let's prepare the docker image using this [command][1] to push docker image to the private registry.
First we tag the image using the registry host (see the docker command parameters in comment).

```bash
# docker tag [OPTIONS] IMAGE[:TAG] [REGISTRYHOST/][USERNAME/]NAME[:TAG]
docker tag python3-pytest artifactory.private.registry.ca:5000/python/python3-pytest:1
```

Before the upload, I need to log in using:

```bash
docker login artifactory.private.registry.ca:5000
```

Then I just need to push it and it's done:

```bash
docker push artifactory.private.registry.ca:5000/python/python3-pytest:1
```

## Using a docker from that registry

Now that you have uploaded your image, you can delete the local one to try and pull it from artifactory with the correct
tag using the following command:

```bash
docker pull artifactory.private.registry.ca:5000/python/python3-pytest:1

# Run the docker with the -t to allocate a pseudo-TTY
docker run -t artifactory.private.registry.ca:5000/python/python3-pytest:1
```

And that's it! You may find the uploaded image on artifactory via the UI using the image name in the URL path like:
[artifactory.private.registry.ca:5000/ui/repos/tree/General/docker-local/python/python3-pytest][5]. It could change
depending on your version and installation of artifactory.

[1]: https://stackoverflow.com/questions/28349392/how-to-push-a-docker-image-to-a-private-repository
[2]: artifactory.private.registry.ca:5000
[3]: https://jfrog.com/artifactory/
[4]: https://hub.docker.com
[5]: artifactory.private.registry.ca:5000/ui/repos/tree/General/docker-local/python/python3-pytest
[10]: {% post_url 2020/2020-04-01-Riding-docker-like-a-cowboy %}
