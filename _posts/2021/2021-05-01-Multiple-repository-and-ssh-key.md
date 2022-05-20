---
layout: post
title: Git me multiple repositories 🗂 and SSH keys 🔑
color: rgb(50,50,50)
tags: [git]
---

## Context

Let's say you have two accounts (or more) in a git hosted service:

- A public GitHub account 👨‍💻
- Another private account 🕵️‍️ (could be GitHub, Gitlab, BitBucket, ...)

Also, you want to have a separate SSH key for each of your account. 
Because like with password you prefer not to use one for all of your services.

So here is how you would do it.

## SSH configuration

### Generate the SSH keys

If it's not done already, you can learn how to create and register the SSH key in [→ _Get started with GitHub_][1]. <br>
The process should be similar for any other online service.

Some caveat for it to work:
- Make sure you create the keys with different name
   - the public one 👨‍💻 can be named the default name `id_rsa` 
   - the other one 🕵️‍️ can be named  `id_rsa_private`
- Make sure that each SSH key is registered in the correct account online

### Set up SSH config

To start using different ssh key depending on the repository.
In `~/.ssh/config` you can set it like:

```ssh
#public account
Host github.com
        HostName github.com
        User git
        IdentityFile ~/.ssh/id_rsa

#special account
Host github.com-private
        HostName github.com
        User git
        IdentityFile ~/.ssh/id_rsa_private
```

You have noticed the Host is not exactly the same even though both are GitHub accounts in this case.
We have two Hosts:
  - The normal GitHub host: `Host github.com`
  - With a hyphen after: `Host github.com-private`

It is small drawback, as the ssh key can't be contextually. It will make sense in the usage part.

## Local Git configuration

Since you have two accounts, you also want your user to be correct, it'd be annoying to commit with the wrong user. 
Make sure you have your repositories separated in different folders depending on the account:

```groovy
.
└── repositories
     ├── private
     │    ├── .gitconfig
     │    ├── repo_1
     │    └── repo_2
     └── public
          └── my_repo
```

In your `~/.gitconfig` you will put the default `[user]` information, here the public one:

```bash
[user]
        name = public.me
        email = public.me@mail.com

[includeIf "gitdir:~/repositories/private/"]
        path = ~/repositories/private/.gitconfig
```

Everything under the tag `[includeIf "gitdir:~/repositories/private/"]` will be included when in the specified git directory.
That way we can add some configuration for our other account with its repositories in the private folder.
You would have in `~/repositories/private/.gitconfig` this configuration:

```bash
[user]
    name = private.me
    email = private.me@mail.com
```

That way, the committing user will be by default `private.me` in the private folder instead of `public.me` everywhere else.
You can stack as many _includeIf_ in your home _.gitconfig_ for your many accounts.

## Usage

For our setup to work, we still need to clone the repository locally. 
Note that you need to use the ssh git address.

If you remember the host for the private SSH key being `Host github.com-private` that will be of use now.<br>
To clone a private repository, or any repository with your private account 🕵️  <br>Add `-private` to the _github.com_ host:

```bash
git clone git@github.com-private:account/repository.git
```

In the other hand, if you want to use your default public account to clone a public repository. <br>
You can use the normal url without the `-private` in the end to clone with your public account 👨‍💻

```bash
git clone git@github.com:account/repository.git
```

By modifying the host with the _-private_ you are telling the SSH agent which key to use.
Keep in mind that if you see an error it might be because you are trying to clone a private repository with an account that does not have access to it.

You should be now all set up! If you are working with upstream repositories check this article<br>
[→ _How to use git with an upstream repository_][2]

[1]: {% post_url 2017/2017-04-19-Get-started-with-GitHub %}
[2]: {% post_url 2021/2021-04-05-Use-git-with-upstream-repository %}
