---
layout: post
title: Did you say git branching strategy?
color: rgb(220, 76, 70)
tags: [git]
---

You've definitely heard about version management, but how much do you know about it?
Multiple tools exist but the one that has become predominant as of today is certainly `git`. 
So we’re going to focus on git flows for software's [version control][2].

## Version Management

[Version control][1] can be also referred to as Version management or [source code management][3].

### What is version control?

We’re talking about code, but version control can be applied to any kind of documents we want to “version”, 
like a presentation, a text document, an image and so on.

Version control is the practice of tracking changes, each change is basically a version of the original work.
In software development, it encompasses the practice as well as the tool that manages changes of the code over time.

For software, all changes are stored in a special kind of database (ex: In the `.git` folder with `git`) so that it's
easy to navigate and modify through the revision to revert to a previous version or apply modifications.

### Don’t use version management

Print out your code like in the 60's or better yet, send it over by mail like in the 80's. 
But the one true best option is to just use one computer so everyone should be either mob programming or keeping track of 
the latest news on the next trending social media buzz.

Not using version control is an option technically... but let's be real, until we invent the next best thing that’ll
make it obsolete, you have to have it.

### Ok, use version control

Let's not be provocative, and use version control for its obvious benefits. By the nature of the incremental work of
software management, versioning is a must.
Having one source of truth in the main repository is key to allow multiple team players to work on the same project.

We'll be talking about [git][4] which is an open source, source code management system originated by [Linus Torvalds][5]
(Linux) in 2005.
It's not the only open source option, but it has a broad adoption from the community.

Now let’s assume that your tool is in place, on your coding device locally and set up with a remote server for collaboration.
You now have multiple options to get you development process started. You can either go:

- Trunk based (no branches everybody pushes to main)
- Feature based (all new code is added via pull request that are reviewed and merge into main)
- Stage based (a composite, often where you have a dev branch that gets merged into master at each release)
- A mix of the above.

Let’s review those "git flows" in details, they all have their benefits, so we’ll see in which development environment 
they could thrive more.

## Git branching strategy

☝️ That's how it called, "git branching strategy" which describes how you are using `git` with your tool and your
development process.

It's a very common topic that does not only touch developers, as you'll find on both [Microsoft][6] and 
[Google][7] DevOps documentation. The main guideline is to keep it simple. I have differentiated three main strategies,
but it's not uncommon to see hybrid ones.

There’s no better practices than the one everybody is comfortable and have agreed to follow,
...even if it’s a bad one 🙆‍♀️
Fail fast, learn fast, gotta apply that agile methodology 👌

### Trunk based

The trunk based strategy is also the simplest, the golden rule is simple, everyone should commit to master at least once
a day. It's not a 0 branch strategy as you can have some as well, but it's usually without since the goal is to always
push to the main branch.

<div class="mermaid">
%%{init: { 'theme': 'base' } }%%
    gitGraph
      commit id: "initial commit"
      commit
      commit
      commit
      commit id: "Deploy" tag: "v0.0.1"
      commit
</div>

While this is great to kickstart a project, you can iterate quickly. However, this model is not compatible with open
source project where you may want more control on who and what gets into the code. 
Also having a main branch means that each commit needs to match a higher level of quality, and be tested or protected
behind a feature flag. This may be tough step to jump for junior developer when each commit can potentially break prod,
writing code becomes a bit more daunting.

For the trunk based strategy to work, you need some pair programming for synchronous code review and mentoring.

### Feature based

Also referred as [_GitHub flow_][8] because it has been popularized via open source projects on GitHub, it's a model that
performs well with controlled collaboration.
It is also considered as a simplified version of the common _git flow_ or stage based.

<div class="mermaid">
%%{init: { 'theme': 'base' } }%%
    gitGraph
      commit id: "initial commit"
      branch feature-1
      branch feature-3
      checkout feature-1
      commit
      checkout main
      checkout feature-3
      commit
      commit
      checkout main
      checkout feature-1
      commit
      checkout main
      merge feature-1
      commit tag:"v0.1.0"
      branch feature-2
      checkout feature-2
      commit
      commit
      checkout main
      merge feature-2
      commit tag:"v0.2.0"
      checkout feature-3
      commit
      checkout main
      merge feature-3
      commit tag:"v0.2.1"
</div>

In this context, you have a main branch and every change is done via feature branches. This process impose a code review
when merging a PR (pull request from a feature branch) which can bring good discussion and ensure some code and quality
standards. It also performs well when with release cycle as each tagged version correspond to a feature, so you know 
exactly what's being deployed.

On the downside, making and reviewing PRs may add some overhead on your development process.

### Stage based

This one is also called [_Git Flow_][9], but I prefer stage based, since we have multiple branches representing each
stage, like develop for the currently worked on branch, main which is the latest version, sometimes there's even a
release branch for the latest stable version.

Considering trunk based is mostly on one branch, and feature based on multiple ones, you could use both of the previous
approach in a stage based strategy, here is how it would look:

- Stage with dev trunk (still pretty uncommon):

<div class="mermaid">
      gitGraph
        commit
        branch develop
        checkout develop
        commit
        commit
        checkout main
        merge develop
        commit tag: "v0.1.0"
        checkout develop
        merge main
        commit
        commit
        checkout main
        branch hotfix
        checkout hotfix
        commit
        checkout main
        merge hotfix
        commit tag: "v0.1.1"
        checkout develop
        merge main
        commit
        checkout main
        merge develop
        commit tag: "v0.2.0"
        checkout develop
        merge main
        commit
</div>

- Staged with dev features, with a release branch, this is the traditional _git flow_, also the most complex:

<div class="mermaid">
%%{init: { 'theme': 'base' } }%%
      gitGraph
        commit
        branch develop
        checkout develop
        branch feature-1
        branch feature-2
        checkout feature-2
        commit
        checkout feature-1
        commit
        checkout develop
        merge feature-2
        commit tag: "v1.1.0"
        checkout feature-1
        merge develop
        commit
        checkout develop
        merge feature-1
        commit tag: "v1.2.0"
        checkout main
        merge develop
        commit tag: "v2.0.0"
        checkout develop
        merge main
        branch feature-3
        commit
        commit
        checkout develop
        merge feature-3
        commit tag: "v2.1.0"
</div>

As you can see, this strategy can be a bit more complex than the other ones. It's best made for established software
where you might need to support multiple version in production. You want the highest stage branch (main in our case) to 
be as stable as possible.

The downside is the added complexity that can slow down the development process.

## Conclusion

I have tried all of them, and I have to say that the trunk based while having some potential _great_ inconvenient, can
truly do wonders with developers. Taking accountability on your code, striving for [quality][12] and thinking about the customer
will make you evolve as a software developer 💪. It's something that really depends on the work culture and atmosphere, 
you need to be able to make errors and learn from them to make it work.

Having [branches][11] is a must to entice collaboration, no wonder the feature based is so popular.
And as project grows and mature stage based strategy while cumbersome might ease out some complexity of the release cycle,
when maintaining released products for a long time (like OS version, or computing language).

There's advantage in all of them, it all depends on your project complexity, team size and preference. Regardless of 
your branch strategy, your development process be backed with a good [CI/CD pipeline][10] and automated tests to ensure the 
best quality.
Do you have a strong opinion about your development flow, or have been using a custom one that I haven't mentioned, 
then please share it with me in the comment! 💛


[1]: https://www.atlassian.com/git/tutorials/what-is-version-control
[2]: https://about.gitlab.com/topics/version-control/
[3]: https://en.wikipedia.org/wiki/Version_control
[4]: https://git-scm.com/
[5]: https://fr.wikipedia.org/wiki/Git
[6]: https://docs.microsoft.com/en-us/azure/devops/repos/git/git-branching-guidance?view=azure-devops
[7]: https://cloud.google.com/architecture/devops/devops-tech-trunk-based-development
[8]: https://docs.github.com/en/get-started/quickstart/github-flow
[9]: https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow
[10]: {% post_url 2022/2022-04-01-Jenkins-delivery-butler %}
[11]: {% post_url 2021/2021-04-05-Use-git-with-upstream-repository %}
[12]: {% post_url 2022/2022-02-17-Tips-and-tricks-for-code-reviews %}
