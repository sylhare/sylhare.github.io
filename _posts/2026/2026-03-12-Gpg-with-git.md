---
layout: post
title: Sign commits with GPG key
color: rgb(242, 183, 5)
tags: [git]
---

A GPG key (GPG as GNU Privacy Guard) is a digital key that represents your identity.
It is usually used to sign data to prove it comes from you.

It works with a private key that is used to sign the data, and a public key to verify that the signature matches you.
(Similar to RSA keys for [SSH communication][12])
This can also be used to encrypt and decrypt messages between sender and receiver.

In this article we'll look at GPG keys in the context of commit signing.
For that we assume you have already [setup git][10] and clone some repository.

## 1. Getting started

On macOS, you can use [gpgtools][3], this includes `gpg`, `gpg-agent`, and the **GPG Keychain** GUI app.
This will make creating the key straightforward.

The `gpg` command line is the modern *OpenPGP encryption and signing tool*, 
for the history PGP (pretty good privacy) was the first program to implement this feature.
It was successful and documented as an open standard OpenPGP which is now followed by the modern CLI. 

## 2. Create a GPG Key

You can follow the gpgtools documentation it will generate the key,
and upload the public key to a server to it is accessible via the email.
Importing it online could be optional if you are using [GitHub][1] or a similar tool to manage your repositories.

You can also use the command line to create the key:

```bash
gpg --full-generate-key
```

## 3. List Your Keys

Once your key is created, you can view it with:

```sh
gpg --list-secret-keys --keyid-format=long
```

This should look like that:

```
/Users/jane/.gnupg/secring.gpg
-------------------------------
sec   rsa4096/C3D4E5F6A7B8C9D0 2026-01-15 [SC]
      3A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B
uid                 [ultimate] Jane Doe <jane.doe@example.com>
ssb   rsa4096/1F2E3D4C5B6A7988 2026-01-15 [E]
```

Your **Key ID** is the part after `rsa4096/` on the `sec` line — in this example: `C3D4E5F6A7B8C9D0`.
The private key is in `/Users/jane/.gnupg/secring.gpg` and should never be shared.

With the key id, you can export your public key:

```sh
gpg --armor --export C3D4E5F6A7B8C9D0
```

This will generate a `-----BEGIN PGP PUBLIC KEY BLOCK-----` block which you can then upload in [GitHub][1]

## 4. Configure Git to Sign Commits

Still with the key ID, you can update your [git config][2]'s signing key and set to always sign your commits: 

```sh
git config --global user.signingkey C3D4E5F6A7B8C9D0
git config --global commit.gpgsign true
```

This will look like:

```ini
[user]
    name = Jane Doe
    email = jane.doe@personal.com
    signingkey = C3D4E5F6A7B8C9D0

[commit]
    gpgsign = true
```

If you are using [multiple git config][11], 
you can also set the `signingkey` and signing key per config that will override the global ones.

## 5. Verify a Signed Commit

Now that you are all setup, you can just commit and push, the commit should be signed.
It will show as *Verified* in GitHub for example.
You can also verify the signature directly in the command line:

```sh
git log --show-signature -1
```

This should out but something like:

```
commit a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
gpg: Signature made Thu Jan 15 12:34:56 2026 EST
gpg:                using RSA key C3D4E5F6A7B8C9D0
gpg: Good signature from "Jane Doe <jane.doe@example.com>" [ultimate]
Author: Jane Doe <jane.doe@example.com>
Date:   Thu Jan 15 12:34:56 2026 +0000

    Add new feature
```

As you can see the `gpg:` section gets shown as well as the other commit log information.
It is valid because it shows *Good signature*, otherwise it would have *BAD signature*.
This doesn't necessarily someone tempered with it, usually it either because it was signed with a wrong key, 
or when the email associated with the key is different from the one associated with the commit.

If you are seeing [partially verified][4] on GitHub, it usually happens on rebase or amend.
While cryptographically valid and signed using the `Commit` field email, when it is different from the `Author`.

##  Miscellaneous

### Avoid Being Asked for Passphrase Every 5 Minutes

By default `gpg-agent` caches your passphrase for a short period.
It can get infuriating to enter your passphrase for every commit throughout the day.

To remediate, extend the cache duration by editing (or creating) `~/.gnupg/gpg-agent.conf`:

```sh
# Time in seconds before the cache expires after last use (default: 600 = 10 min)
default-cache-ttl 28800

# Maximum time in seconds the cache entry is valid regardless of activity (default: 7200 = 2h)
max-cache-ttl 86400
```

The values above cache your passphrase for **8 hours** after last use, up to a maximum of **24 hours**.

Reload the agent to apply changes:

```sh
gpgconf --kill gpg-agent
gpg-agent --daemon
# Or simply
# gpg-connect-agent reloadagent /bye
```

> This can be done via teh macOS keychain as well with `pinentry-mac`.

### Known error

When you see an error like this:

```
error: gpg failed to sign the data:
[GNUPG:] KEY_CONSIDERED 3A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B 2
[GNUPG:] BEGIN_SIGNING H8
[GNUPG:] PINENTRY_LAUNCHED 23503 curses 1.3.2 - xterm-256color - - 502/20 0
gpg: signing failed: Inappropriate ioctl for device
[GNUPG:] FAILURE sign 83918950

fatal: failed to write commit object
```

This happens because `gpg-agent` tries to open a PIN entry dialog but has no terminal to attach to (common in IDEs).
Try exporting `GPG_TTY=$(tty)` in your shell profile (`~/.zshrc`, `~/.bashrc`, or `~/.profile`) and restart the gpgconf daemon.


[1]: https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account
[2]: https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key
[3]: https://gpgtools.org/
[4]: https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits
[10]: {% post_url 2017/2017-04-19-Get-started-with-GitHub %}
[11]: {% post_url 2021/2021-05-01-Multiple-repository-and-ssh-key %}
[12]: {% post_url 2018/2018-07-01-Open-SSH-Mysteries %}