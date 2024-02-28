---
layout: post
title: Get started with GitHub
color: rgb(107,91,149)
tags: [git]
---

# Get started with GitHub

The GitHub site is really nice for easy commits, there are multiple tools provided to manage that on multiple platform.
([GitHub Desktop][10], [Kraken][11], [Forks][12]).
However, I wanted to document and explore the command line way of committing.

## Source

My main source will be from gitlab plus some precision over certain steps that I've encountered while doing them at a beginner level. But there's also a very good documentation made byGitHub.

- [GitHub help][1]
- [Full documentation links][2]
- [Start with basics][3]
- [Workshop step by step][4] (my favourite)
- [Online tutorial][5]

## Configure your environment

Depending on your operating system follow the instructions:

- Windows Os: Install [Git for Windows][7] which is an emulated terminal with git.
- MacOS: Type `git` in the Terminal application. If it's not installed, it will prompt you to install it.
- Linux:
  - Debian: `sudo apt-get install git-all`
  - Red Hat: `sudo yum install git-all`

## Configure Git

One-time configuration of the Git client. Replace what's in `" "` by your information.

```bash
git config --global user.name "Your Name"
git config --global user.email you@example.com
```

This information will be store in the git config file:

```bash
cat ~/.gitconfig

# This is Git's per-user configuration file.
[user]
	name = "Your Name"
	email = you@example.com
```

If you need to set up Git for multiple organizations with different users, 
check out this [article][20]:

- Find it at [Git with multiple repositories 🗂 and SSH keys 🔑][20]

## Configure SSH Key

Type on the command prompt ('bash' in Linux/MacOS or the `cmd.exe` on Windows).

```bash
ssh-keygen -t rsa -b 4096 -C "you@company"
```

This will start the generation of the ssh keys (public and private) that will be used to connect to the remote repository.

You will be prompted for the following information. 
Press enter to accept the defaults. 
Defaults appear in parentheses.

```bash
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/you/.ssh/id_rsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /Users/you/.ssh/id_rsa.
Your public key has been saved in /Users/you/.ssh/id_rsa.pub.
The key fingerprint is:
39:fc:ce:94:f4:09:13:95:64:9a:65:c1:de:05:4d:01 you@computer-name
```    

Then find your rsa key in the repository:

```bash
cat ~/.ssh/id_rsa.pub
```

Copy the public key ending with `.pub` in the right place on [GitHub][5] or [Gitlab][6].
It should look like that (with maybe more characters).

```bash
ssh-rsa AAAAB3NzaC1yc2EAAAADAQEL17Ufacg8cDhlQMS5NhV8z3GHZdhCrZbl4gz you@company
```

Name your SSH key properly so that you know which key correspond to what, in case of doubt revoke it and recreate a new one.
You don't want people stealing your private key and committing in your name.

> Now [GitHub supports ed25519][9] and the rsa one is now considered legacy:
> - `ssh-keygen -t ed25519 -C "your_email@example.com"`
>
> It will use the `~/.ssh/id_ed25519.pub`

You could also set up a GPG key for additional protection with a provider like [keybase][8], 
but that's for a bit more advanced when you need extra security. 

## Clone a project

Now that you have your ssh key you can clone a project using SSH, find the url near the clonde button on GitHub.
You know it's an SSH git clone because of the `git@` in the repository url:

```bash
git clone git@github.com:User/Repo.git
```

If you have set the public ssh key in your GitHub account, and it's the first time,
then it will first prompt you to add the GitHub server as a known host upon cloning.

Enter `yes` and the cloning process should start.

> By default, the git command will look for standard key name to authenticate
> So if you gave a custom name to your ssh key it won't work without additional configuration

If you have some issues cloning or with the ssh key, you can refer to the [troubleshooting SSH][13]
issues on [GitHub][13].


[1]: https://help.github.com/
[2]: https://docs.gitlab.com/ce/README.html
[3]: https://docs.gitlab.com/ce/gitlab-basics/README.html
[4]: https://docs.gitlab.com/ce/university/training/user_training.html#committing
[5]: https://github.com/settings/keys
[6]: https://gitlab.com/profile/keys
[7]: https://git-for-windows.github.io
[8]: https://keybase.io/encrypt
[9]: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
[10]: https://desktop.github.com/
[11]: https://support.gitkraken.com/how-to-install
[12]: https://git-fork.com/
[13]: https://docs.github.com/en/authentication/troubleshooting-ssh
[20]: {% post_url 2021/2021-05-01-Multiple-repository-and-ssh-key %}