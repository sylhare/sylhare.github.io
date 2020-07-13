---
layout: post
title: Linux Users and permissions 👮🏾‍♀️
color: rgb(255, 111, 97)
tags: [linux]
---

# User and permissions

Intended for Centos or Redhat.

## Linux Users and groups

A user is a number uid. Information on the user is stored in `/etc/passwd`

```bash
#to add a user
useradd <username>
```

Use `id` to identify the user your are using right now.

A group is a number gid by default the group name is the user's name, the gid will be the next available. 
Information for groups are stored in `/etc/group` 

```bash
#to add a group
groupadd <groupname>
```

`uid` and `gid` are two completely different number that both starts at `1000` (up to `2^16` for backward compatibility) and get incremented for each creation of group and user. 
They may not be in sync. Root's uid is `0`. 
If you need a uid for a system you would create it between `201` to `999`. From `1` to `200` it is assigned by the operating system by default.

## Password

### Introduction

Password files are located in `/etc/shadow` and are only accessible by `root`.
Type `passwd` to change the password.

There are three pieces of information stored in a modern password hash:
`$1$gCjLa2/Z$6Pu0EK0AzfCjxjv2hoLOB/`

 1. `1`: The hashing algorithm. The number `1` indicates an MD5 hash. The number `6` appears when
a SHA-512 hash is used.
 2. `gCjLa2/Z`: The salt used to encrypt the hash. This is originally chosen at random. The
salt and the unencrypted password are combined and encrypted to create the encrypted
password hash. The use of a salt prevents two users with the same password from having
identical entries in the `/etc/shadow` file.
 3. `6Pu0EK0AzfCjxjv2hoLOB/`: The encrypted hash

### Password aging

To see the configuration of the password, account and group you can:
```bash
view /etc/login.defs
```

There you can edit the expiration date of newly created user password or change the `uid` and `gid` range.

To get the date in 90 days you can use:
 ```
 date -d "+90 days"
```

### logging

To see the log of the actions on the system you can go to `/var/log` then you can check `secure` file to see the last `sudo` commands that has been used. If you are root or if you use `su` or `sudo -i` the actions are not logged in.


## Permission

The rights can be seen using `ls -l`:

 ```
 #The rights of a file
 -rwxrw-r-- <user> <group> <file>
 ```
 
Here we have the first:

 - `-` because it is a file (`d` for a directory).
 - The first set `rwx` of rights for the user
 - The second set `rw-` of rights for the group
 - The third set `r--` of rights for all other users.
 
 When there is a `-` in the set of rights, it means there is no rights set.
 
The rights on file are executed such as when requesting an action on it:

- Is the file is owned by the user?
  - Yes -> Check the owner permission
- Else: Is the user part of the group owning the file?
  - Yes -> Check the group permission
- Else: Check the last set of permission (for other users)
        
To delete a file you would need to have `write` access to the directory it is situated in. 
To see the rights on the directory, you can do `ls -ld`.
