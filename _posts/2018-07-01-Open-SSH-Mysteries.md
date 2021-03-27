---
layout: post
title: Open SSH Mysteries
color: rgb(255, 111, 97)
tags: [misc]
---

# Configuring and controlling Open SSH Service

## Creating a SSH key

You can check out [Github documentation](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) for that.
Creating a new ssh key with `ssh-keygen` you need to enter a passphrase if you went your ssh key to be encrypted:

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

A pair of ssh keys will be created in `~/.ssh/`:

  - Public one: `id_rsa.pub` that you can share with others
  - Private one: `id_rsa` that you need to keep private
  
If you get an error like that:

```
Permissions 0777 for '/Users/username/.ssh/id_rsa' are too open.
It is recommended that your private key files are NOT accessible by others.
This private key will be ignored.
```

You should change the key permission using:

```bash
chmod 600 ~/.ssh/id_rsa
```

## SSH connection

### Basics 
To connect via SSH to a server:

```bash
ssh <user>@<remotehost> -p <port>
```
 
When you connect for the first time to a host, it will print its finger print and you can add it to your `~/.ssh/known_hosts`
To check what happen for ssh connection, you can see at `/etc/ssh`
 
When ssh into a server the command executed is the bash shell so while it is running you stay connected. You can quit by using `ctrl + d` or by typing `exit`.

### With passphrase

If you had created your ssh key with a passphrase, you might not want to enter your passphrase each time.
For that you can save it in your ssh key to your ssh agent using:

```bash
# Start the ssh agent
eval $(ssh-agent)
# To add and save permanently
ssh-add -k ~/.ssh/id_rsa
```

You may need to reboot for the config to be loaded.

## Add a SSH key to a remote host

### Using authorized_keys

You can go to the remote server and add the public key `my_key.pub` inside the `/home/user/.ssh/authorized_keys` folder.
So that the next time you connect to that server you won't be prompt for the password for that `user`. Using:

```bash
ssh -i my_key.pem user@server
```

The `my _key.pem` and `my_key.pub` are a matching public and private key pair.
 
### With ssh-copy-id

Or there is a daemon called [ssh-copy-id](https://www.ssh.com/ssh/copy-id) which is part of the [OpenSSH](https://www.openssh.com/) tool,
that will do all the necessary steps automatically to add yourself to a host as an authorized remote user.

To do so use the command as follows:

```bash
ssh-copy-id -i ~/.ssh/id_rsa user@server
```

Like before, next time you try to ssh into that server with that ssh key, no password will be asked.

## SSH spoofing 

You can get this message if for example someone is messing with the DNS or the IP of the site you want to access has changed.

```
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

However, if you've seen that message above, you should think twice before doing that.
