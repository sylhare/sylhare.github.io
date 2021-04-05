---
layout: post
title: Use git with an upstream 🚰 repository
color: rgb(224, 181, 137)
tags: [git]
---

In some occasion you can't work with only the master branch. 
For example when working with open source, the upstream repository is not owned by you.
So in order to add your contribution you'd likely need to fork it and make a pull request.

## Practice environment

In order to practice all that without making pointless pull request to actual project.
You can either do it on one your own repository, or use this demo **[Upstream Organization](https://github.com/UpstreamOrg)** on github.

For the example, you can fork this **[Upstream Repository](https://github.com/UpstreamOrg/UpstreamRepo)** for this example.
You should now have `<your username>/UpstreamRepo` in your github repositories.
Then clone your fork locally:

```bash
git clone git@github.com:<your username>/UpstreamRepo.git
```

Let's review the git _workflow_ and try to make some contributions.

## Workflow setup

### Set up your fork

Let's configure the upstream, and add some rule, so you don't try to push to upstream by mistake:

```bash
git remote add upstream "git@github.com:UpstreamOrg/UpstreamRepo.git"
git remote set-url --push upstream nope
git remote -v
```
Not that you can set any url as upstream, here by putting `nope` it will just not work.
You should see something like that with your username instead of mine:

```bash
origin     git@github.com:sylhare/UpstreamRepo.git (fetch)
origin     git@github.com:sylhare/UpstreamRepo.git (push)
upstream   git@github.com:UpstreamOrg/UpstreamRepo.git (fetch)
upstream   nope (push)
```

You should have `origin` as the forked repository and `upstream` as the upstream repository.
If you have cloned the wrong one you can always update the remote branches using:

```bash
git remote set-url origin git@github.com:<your username>/UpstreamRepo.git
```

### Sync your fork with upstream/master

When you fork, you copy the upstream at a point in time.
So since you create feature branch out of your fork, you need to keep your fork in sync.
To do that, you should make no commits should be directly made in origin/master.

To your sync fork (origin/master) with upstream/master use:

```bash
git checkout master
git fetch upstream
git merge upstream/master # Or git rebase upstream/master
git push origin
```

If you've deleted the branch locally, you can use:

```bash
git checkout --track origin/master
```

That will track locally the remote origin/master branch.

### Create a new feature branch

Once your fork is up to date, you can create a feature branch using:

```bash
git checkout -b feature-branch # Create and go on branch
git push -u origin feature-branch # To push branch remotely
```

#### Work on someone else's fork

Same as working with upstream you can add a remote to your `Colleague` branch:

```bash
git remote add colleague "git@github.com:Colleague/UpstreamRepo.git"
```

Then you can `pull` and `checkout` on the branch that you want to work on.
When pushing, it will update the branch your colleague's fork `Colleague/UpstreamRepo.git` using:

```bash
git push colleague
```

### Rebase your feature branch from upstream/master

That's usually before merging your feature branch, you need to add all the changes from upstream/master.
To do that go on your feature branch and do:

```bash
git fetch upstream
git rebase upstream/master
git push -f origin 
```

You will see this error if you don't force push to rewrite the history of your fork with the changes that were merged into master.

```bash
error: failed to push some refs to 'git@github.com:user/repo.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

Branches is asynchronous change by default so that's why you can have change made *behind* of your own commits.

### Suppress your feature-branch

When you're done with a `feature-branch` or when you've messed up, you can always delete it with:
```bash
git branch -D feature-branch # -D for force delete, otherwise -d 
```

## Automation 🤖

### Git Aliases

So now that we have seen the workflow, let's add some alias in your `~/.gitconfig` to ease it up:

```bash
[alias]
        sync = !git stash && git checkout master && git fetch upstream && git rebase upstream/master && git push origin
        new = !git checkout -b $1 && git push -u origin $1 && :
        fur = !git fetch upstream && git rebase upstream/master
        pull = pull --rebase
```

You got it, it should make your life easier.

### Bash script

This one is mainly to automate the creation of an upstream repository's fork from Github.
Basically it needs two inputs: 
    - Your fork repository's SSH address
    - The Upstream organisation name

Here is the `clone` script that should be in your `~/.zshenv`:

```bash
clone() {
  upstream=$1
  repo=$(echo "$2" | awk -F"[/.]" '{print $3}')
  
  echo "1. Cloning repo $repo at $(pwd)/$repo"
  git clone "$repo" && cd "$repo" || return 1
  echo "2. Setting up upstream $upstream and disallow push"
  git remote add upstream "git@github.com:$upstream/$repo.git"
  git remote set-url --push upstream nope
  git remote -v
  echo "3. Checkout to another branch"
  git checkout -b dev
}
```

Using it while replacing with `<your username>` should be:

```bash
clone UpstreamOrg git@github.com:<your username>/UpstreamRepo.git
```

The auto checkout to another branch in the end is to avoid any mistaken commit to master,
as previously stated we want to keep it clean to sync up with upstream.
