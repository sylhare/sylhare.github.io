## Git commands

### See remote links

	git remote -v

### Update local from remote (on an already initiated repo)

	git pull origin

### Stash changes

This can be used when you are updating your local repository with the remote one and there are conflicts. You can stash, pull and then commit or drop your changes.

	git stash #to save your local changes
	git drop #to drop your local changes

### Add a remote repository link
	git remote add <remote nickname> https://github.com/user/repository


### Remove a folder:

    git rm -r one-of-the-directories
    git commit -m "Remove duplicated directory"
    git push origin <your-git-branch> #(typically 'master', but not always)

### Remove a folder from git but not local

	git rm -r --cached myFolder

### Create a branch

step by step:

	git branch iss53
	git checkout iss53

Or in a one liner:

	git checkout -b iss53

### Close a branch (for feature development)

A branch is for work. A tag marks a place in time. By tagging each branch merge we can resurrect a branch if that is needed.

	git checkout <feature-branch>
	git pull origin
	git checkout <release-branch>
	git pull origin
	git merge --no-ff <feature-branch>
	git push origin master
	git tag -a branch-<feature-branch> -m "Merge <feature-branch> into <release-branch>"
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

