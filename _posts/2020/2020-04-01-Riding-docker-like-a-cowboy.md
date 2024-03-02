---
layout: post
title: Build, run and ride your docker like a cowboy 🤠
color: rgb(13,183,237)
tags: [kubernetes]
---

There are some information, that I feel are pertinent while messing around with a docker 🐳.
May it be alone or to be deployed in a cluster. Here is my list of tips.

## Make that Docker run

Let's say you have an image named `image` to ease the annotation. 
And let's assume `mycontainer` is a terrific name for a container.

```shell
docker build . -t image
docker run image --name mycontainer
```

We use the `--name` to give a name to our container (so it's not randomly generated).

> To run a docker image you can use the following options:
> - `--rm` to delete the container once it ran
> - `--d` to run the container in the background

Let's explore the mysteries behind running a docker container.

### Difference between ENTRYPOINT and CMD

Let's say you have a dockerfile like that:

```dockerfile
FROM ubuntu:16.04

ENTRYPOINT ["echo", "Hello"]
CMD ["World"]
```

If you run the docker you should get:

```bash
docker --rm run --name mycontainer image
Hello world
docker --rm run GitHub --name mycontainer image 
Hello GitHub
```

Basically, you can use both or just one of them. When you run the docker they will behave like:
  - `ENTRYPOINT` can't be overridden, but can take argument (or not) and will be executed. 
  - `CMD` is a command that will be run by default, that can be overridden with `exec`.

### Some override examples

Here are some tips, I found useful in different occasion to make your docker run.

 - Running detached using `-d`:
 
```bash 
docker run -d --name mycontainer image
``` 
 - Delete the container after running `--rm` to avoid the `docker rm --force mycontainer`
 
 ```bash
 docker run --rm --name mycontainer image
 ```
 - Execute yolo within the container using `exec` which run a process in your docker:
 
 ```bash
 docker run --name mycontainer image
 docker exec -it mycontainer /bin/bash
 docker exec mycontainer /bin/sh -c "echo 'hello';echo 'world';echo '!'"
 ```

## Using run options

## Using ports

You can expose a port in your Dockerfile using:

```dockerfile
FROM nginx:latest

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

To be able to access the container via a port you can use:

```shell
# The host is your machine, the container port is the one specified with the expose (80)
docker run -p host_port:container_port image
```

On the host you can now access the container on [localhost:host_port].
If it doesn't show anything make sure that the container is running on [0.0.0.0:container_port].

### Using environment variables

#### From within the Docker image

The basic to have environment variables in your docker would be to use `ENV` like:

```dockerfile
FROM ubuntu:16.04

ENV FIRST=hello
ENV SECOND=world!

CMD ['echo $FIRST $SECOND']
```

But sometimes you want those variables to be secret and not saved in your dockerfile.
To do so, you may have multiple options

#### From an external input

You can also define environment variables from the command line using `-e` for each variables, 
or use `-env-file` if you have a file with all of your variables.

```bash
docker build -t example .
docker run -e FIRST='hello' -e SECOND='world!' example
docker run --env-file ./env_file.txt example
```

You dockerfile will be like, notice the absence of `ENV`.

```dockerfile
FROM ubuntu:16.04

CMD ['echo $FIRST $SECOND']
```

### Using arguments

You can use arguments, which are defines already in your dockerfile and can be set to have default 
values. Like all commands above, it can be used both in `docker build` or `docker run`.

```bash
docker build -t example .
docker run --build-arg FIRST='hello' --build-arg SECOND='world!' example
```

You dockerfile will be like, notice the usage of `ARG`.

```dockerfile
FROM ubuntu:16.04

ARG FIRST
ARG SECOND

CMD ['echo $FIRST $SECOND']
```

## Use your container with files

To enable the transfer of data files with the container, during creation or while running.

### Adding files
#### Directly in your dockerfile

When creating your docker image, you will need files that are in your project.
So you can just create a work directory with `WORKDIR` so you don't mess your docker internals.
It is best practice to have a dedicated directory rather than putting it all at the root `/` of the system. 
And then just copy your project in that working directory.

```dockerfile
FROM ubuntu:16.04

WORKDIR /app
COPY . /app

ENTRYPOINT ["/bin/bash"]
```

Also, you may want to add a specific non-root user to run the application to avoid security risks,
since root is the default one, once compromise it can do a lot of damage using the running docker container.

```shell
FROM ubuntu:16.04

WORKDIR /app
RUN groupadd -r groupname && useradd -r username -g groupname
COPY --chown=username:groupname . ./
USER username

ENTRYPOINT ["/bin/bash"]
```

With that we have a user `username` as part of a group `groupname` that have access rights on the work directory only created.
By using `USER username`, the entrypoint will use that user to perform any commands, limiting the security risks.

#### Mount files in your container

For bigger volumes, you can directly mount in your docker files using `-v`. 
Note that you need to give the absolute path on the host for it work, you can use `$PWD` which give your current location.

```bash
docker run --net=host -v "$PWD/src":/target --name mycontainer image
```

This way you inject your `/src` directory as `/target` at root level in your docker container. 
You can also use `--network="host"` to map localhost of the machine with localhost of the docker.

### Copy from and to the container
#### Get your container ID

Before copying you need to know which container you want to operate.
Let say you are running a docker, knowing its name, you want to get its id:

```bash
docker run --name mycontainer image 
id=$(docker ps -aqf "name=mycontainer")
echo $id
```

#### Manage files in your container

Then you can use that id to manage files with the container:

```bash
# From your container to the host
docker cp $id:/src/. target
# From the host to your container
docker cp src/. $id:/target
``` 

## Common base Docker images

There are multiple base images that can be used to create a docker file.
And based on those the subsequent commands might differ.

### Centos

This is a centos one, you can use `yum` or `dnf`:

```dockerfile
FROM centos:centos8

RUN dnf update -y && dnf install -y python3-pip
RUN yum install python3-pip
```

### Debian

This one is using debian, which is the base of the Ubuntu's software packaging system.

```dockerfile
FROM python:3.6

RUN apt-get install <package>
```

### Alpine

Those have the `-alpine` on them. They are light distribution of Unix.
You use `apk` to add package like:

```dockerfile
FROM python:3.6-alpine

RUN apk update && apk --no-cache add bash
```

They don't have bash installed, they use `/bin/sh` by default.

## Housekeeping

Creating and running container may have an impact on your system if kept unchecked.
You can stop, then delete a container using:

```shell
# Can be the container name or id
docker stop mycontainer
docker rm mycontainer
```

An image used by a container can't be deleted, so you need to stop the container first (unless forced).
Then you can remove the linked image:

```shell
docker rmi image
```

And finally to clean up the system from all stopped containers, unused networks, dangling images or build cache and any
unused volumes, you can use this command:

```shell
docker system prune --volumes
```

This should free up space, you will also lose the data stored in those volumes, so make sure it is either backed up or 
not important.
