---
layout: post
title: Git commands
tags: [git]
---

## Git commands

### See remote links

	git remote -v

### Update local from remote (on an already initiated repo)

	git pull origin
    
### See log of the repository

Use:

    git log

To exit `git log` type `q` on the terminal.

### Stash changes

This can be used when you are updating your local repository with the remote one and there are conflicts. You can stash, pull and then commit or drop your changes.

	git stash #to save your local changes
	git drop #to drop your local changes
    git pop #to get back your local changes

### Add a remote repository link
	
    git remote add <remote nickname> https://github.com/user/repository

### Remove a folder:

    git rm -r one-of-the-directories
    git commit -m "Remove duplicated directory"
    git push origin <your-git-branch> #(typically 'master', but not always)

### Remove a folder from git but not local
Useful to solve conflicts

	git rm -r --cached myFolder

### Create a branch

step by step:

	git branch patch-1
	git checkout patch-1

Or in a one liner:

	git checkout -b patch-1

### Get a remote branch

You are on your local repository and you want to fetch a remote branch.

	git checkout --track origin/patch-1

### Close a branch (for feature development)

A branch is for work. A tag marks a place in time. By tagging each branch merge we can resurrect a branch if that is needed.

	git checkout <feature-branch>
	git pull origin 				 # Making sure it's last version of feature branch
	git checkout <release-branch>
	git pull origin
	git merge --no-ff <feature-branch>
	git push origin master
	git tag -a <tag name> -m "Merge <feature-branch> into <release-branch>"
	git push --tags origin
	git branch -d <feature-branch>
	git push origin :<feature-branch> #to push deleted bransh to remote


### Checkout a remote branch

In your workflow you'll often need to checkout and fetch branches from a remote repository to do code review of your colleagues for example.

Usage:

    git checkout -b <local-branch> <remote-branch>
    git fetch

So for example I have a branch called feature/abc remotely

    git checkout -b feature/abc origin/feature/abc

There is also a shortcut for this command:

    git checkout --track -b <remote-branch>
    
Or

    git fetch

    git branch -r

    git checkout <branch_name>


### Revert a commit
Commits are identified by a special number, a commit hash usually looking like `860652a4ab3749a72401b2ceaacf68b27afbc404` it can also be identified with the first 7 numbers like `860652a`


#### Revert a merge-commit
For a merge commit you need to use:

    git revert 860652a -m 1
    
Which will revert the merge commit `860652a` to the previous commit with the `1`.