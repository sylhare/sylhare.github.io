---
layout: post
title: Open SSH Mysteries
color: rgb(255, 111, 97)
tags: [ssh]
---

# Configuring and controlling Open SSH Service

## Creating a SSH key

You can check out [Github documentation](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) for that.
Creating a new ssh key with `ssh-keygen` you need to enter a passphrase if you went your ssh key to be encrypted:

```
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

A pair of ssh keys will be created in `~/.ssh/`:
  - Public one: `id_rsa.pub` that you can share with others
  - Private one: `id_rsa` that you need to keep private
  
If you get an error like that:

```bash
Permissions 0777 for '/Users/username/.ssh/id_rsa' are too open.
It is recommended that your private key files are NOT accessible by others.
This private key will be ignored.
```

You should change the key permission using:

```bash
chmod 600 ~/.ssh/id_rsa
```

## Make a SSH connection

To make a ssh connection:

```bash
ssh <user>@<remotehost> -p <port>
```
 
When you connect for the first time to a host, it will print its finger print and you can add it to your `~/.ssh/known_hosts`
To check what happen for ssh connection, you can see at `/etc/ssh`
 
When ssh into a server the command executed is the bash shell so while it is running you stay connected. You can quit by using `ctrl + d` or by typing `exit`.

## Add a SSH key to a remote host
 
### With ssh-copy-id

To add yourself to a host as an authorized remote user `ssh-copy-id root@desktopY`
There is a daemon called `ssh-agent` that makes a copy of the private key to facilitate the ssh connexion. 

### Using authorized_keys

You can also go to the remote server and add the public key `my_key.pub` inside the `/home/user/.ssh/authorized_keys` folder.
So that the next time you connect to that server you won't be prompt for the password for that `user`. Using:

```bash
ssh -i my_key.pem user@server
```

The `my _key.pem` and `my_key.pub` are a matching public and private key pair.

## SSH spoofing 

You can get this message if for example someone is messing with the DNS or the IP of the site you want to access has changed.

```bash
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@       WARNING: POSSIBLE DNS SPOOFING DETECTED!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
The RSA host key for github.com has changed,
and the key for the corresponding IP address 145.185.15.15
is unknown. This could either mean that
DNS SPOOFING is happening or the IP address for the host
and its host key have changed at the same time.
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
SHA256:0p4WBUiBh1+oS2y0OkLBvNd3fyYw30N31iDRxOlGHPg.
Please contact your system administrator.
Add correct host key in /Users/user/.ssh/known_hosts to get rid of this message.
Offending RSA key in /Users/user/.ssh/known_hosts:10
RSA host key for <remote host> has changed and you have requested strict checking.
Host key verification failed.
```

You can remove the host from your `known_hosts` and try connecting. You will be prompted with `unkwon_host` and you'll need to add the new `fingerprint` to your `known_hosts`. 

However if you've seen that message above, you should think twice before doing that.
