---
layout: post
title: Automate your process with GitHub
color: rgb(220, 76, 70)
tags: [agile]
---

## Introduction 

GitHub provides some interesting tools such as the **Project** tab which allow creating cards based on PR or issues.
It provides some automation out of the box, but as of now, it's a bit below what you can have with Gitlab.

The project can be customized as a kanban board to track the work, like PRs in progress, in review, ready to merge...
Since it's tedious to create card manually, here's how you can create you own GitHub action to do that automatically
for you.

### Process

In the context of multiple people/teams contributing to the same code base, we want to enhance the review process

Having members and owners the PR must first be reviewed and approved before being merged. The board will allow the PR to
be visually separated between the ones that are:
- parked (draft, stale, ...)
- in progress (actively being committed, solving review comments)
- ready for review
- approved and ready for merge

In a context where there's a lot of teams, or a lot of PR visually separating the PR by states will facilitate the code
review and merging process.

### Tools

Let's get set up with what GitHub offers out of the box.

- A repository that you own
    - _my-username/repo_
    - _my-org/repo_
- A [project][7] created in that repository
    - you can use the _kanban review_ template

## Basics

Let's go back to the basics so that we understand what we're doing.

### Create a _personal access token_

Let's generate a token, with `admin:org` rights for your personal token.
If it's for your own usage only, the default `secrets.GITHUB_TOKEN` accessible in the workflow might be just enough.
To automate the new [beta project feature][12] you might need more rights.

Go to _Settings > Developer settings > Personal access tokens_ and select this option:

{% include aligner.html images="github-admin-pat.png" column=1 %}

### GitHub API

The [GitHub rest API][1] allows you to interact gain access to its resources.
Those are the bare-bones commands that are usually wrapped in a library for ease of use in your language.

Here you need a token with at least read access to read the pull request in the repo.
```bash
curl \
-H "Accept: application/vnd.github.v3+json" \
-u user:token \
https://api.github.com/repos/UpstreamOrg/UpstreamRepo/pulls
```

This returns a lot of information! With GraphQL, we could just query for what we want.
What we want is the `id` (_797190601_) of the pull request number 6 in that repo (_pull/6_), 
because $$ id \ne number $$.

So once we have the id,
we can move to the next step which is to create the corresponding card on our project board. The [api reference][2] is
in my opinion a bit lacking, so here is a working example:

```bash
curl -X POST \
-H "Accept: application/vnd.github.v3+json" \
-u user:token \
-d '{"content_id": 797190601, "content_type": "PullRequest", "column_id": 17134543 }' \
https://api.github.com/projects/columns/17134543/cards
```

The `column_id` correspond to my _in progress_ [column][10] and can be obtained on the URI when clicking on copy link on 
the top right three dots button.

> Note: You need to specify the column id twice... for fun 🤡
> - once in the payload
> - once in the URI.

With that the card is created for this PR. 
If you try it again, it will fail as there can only be one card per PR per board.

## Automatically create the card

We'll create a GitHub action that will do the card creation in the project for us.
We'll use the [github-script][8] action which uses  [Octokit][6] to interact with GitHub's API.

### Action's creation

There are two things we need for this action:

- The event that will trigger the action
- The pull request's id

We'll manage those thanks to the GitHub actions various features.

#### Use `pull_request_target`

We want to [trigger][4] the action on new Pull request, when they are _opened_.
The default `pull_request` event reduces for [security][5] reasons the rights given when running the action,
to prevent malicious code to be [injected][9] or run and deploy via the CI/CD pipeline.

In order to bypass that for our use case, we're going to use the `pull_request_target` event which does not downgrade
the rights, meaning we'll be able to access the repository secrets to make the call to the API to create the card based on the PR.

#### Use the context

The context from the [github-script][8] is an object containing the `github` [context][3] which holds a lot of 
_contextual_ information. It's wrapped up nicely, so it gets easier to use you can display it all by creating a 
small action such as:

{% raw %} 
```yaml
jobs:
  view-context:
    runs-on: ubuntu-latest
    steps:
      - name: View context attributes
        continue-on-error: true
        uses: actions/github-script@v5
        with:
          script: |
            console.log('${{ github.actor }}');
            console.log(context) 
```
{% endraw %}

You see the context being used raw `github.actor` and the context being called from the `context` object.

In our case the pull request id on a *pull_request* event, we'll be in `context.payload.pull_request.id`,
where the payload is the event's one.

### Actual action

Now that everything is set, let's dive in the actual action `add-pr-card.yml` which will automate part of our process:

{% raw %}
```yml
name: '[Project] Create card'
on:
  pull_request_target:
    types: [ opened ]

jobs:
  create-card:
    runs-on: ubuntu-latest
    steps:
      - name: Add PR to project board
        uses: actions/github-script@v5
        with:
          github-token: ${{secrets.PROJECT_TOKEN}}
          script: |
            github.rest.projects.createCard({
              column_id: 17101633,
              content_id: context.payload.pull_request.id,
              content_type: 'PullRequest'
            });
```
{% endraw %}

Some caveat and notes in the use of the script:

- Make sure the notation match the version you are using (here it's v5)
- The github-token is by default the `secrets.GITHUB_TOKEN` with the latest version  
- The `script` part is actual javascript and will fail if you put a yml comment in it (even though it would look valid at first glance)

That's it, now you can add the action and enjoy it!

{% include aligner.html images="github-project.png" column=1 %}

> 👉 The script is now ready to use, find a live example usage on [UpstreamOrg/UpstreamRepo][10]. 🍔

## Troubleshoot common errors

Some errors are a bit obnoxious, so here is are some troubleshooting help.
Those are the one I experienced using both the API and the github-script.

### Token privilege issue

When using the API you may encounter:

```json
{
  "message": "You need at least public_repo scope to view public repository projects via OAuth"
}
```

This one is pretty clear, it's a right issue related to your token. 
Apparently the basic right you need in you personal access token for any API call is *repo > public_repo*.

### Data issue

For any types of data issue, using the API you will receive some message such as:

```json
{
  "message": "Validation Failed",
  "errors": [
    {
      "resource": "ProjectCard",
      "code": "unprocessable",
      "field": "data",
      "message": "Could not resolve to a node with the global id of 'MDExOlB1bGxSZXF1ZXN0OA=='."
    }
  ],
  "documentation_url": "https://docs.github.com/v3/projects/cards/#create-a-project-card"
}
```

This can happen on missing or incorrect payload for example.
Or when using a PR number instead of the PR id.

### Token privilege downgraded issue

When using the [github-script][8] action you may see this error:

```
Unhandled error: HttpError: Resource not accessible by integration
```

In that case I checked my personal access token, and it was never used meaning it didn't even try to get the resource
using my token.
That's when I discovered that this issue is often related to the downgrade of rights on none `pull_request_target` event
which would make the secrets inaccessible, hence empty.

So this is also a privilege issue, make sure you're using the right trigger if you need more than the `GITHUB_TOKEN`.


### Script error

When using the [github-script][8] action, I encountered this error:

```
Unhandled error: SyntaxError: Invalid or unexpected token
```

The wording through me off because the token I was using did work with API before. In the end this meant that the script
that I was using within the action was wrong.

In my case I had used a comment in yaml which starts with `#` in the script part.
Javascript comments are usually `//`, so parsing the `#` made it error out.


[1]: https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api "Get start rest API" 
[2]: https://docs.github.com/en/rest/reference/projects "API reference"
[3]: https://docs.github.com/en/actions/learn-github-actions/contexts#github-context "action context"
[4]: https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull_request "workflow event triggers"
[5]: https://securitylab.github.com/research/github-actions-preventing-pwn-requests/ "security"
[6]: https://octokit.github.io/rest.js/v18#projects-create-card "Octokit"
[7]: https://docs.github.com/en/issues/organizing-your-work-with-project-boards/managing-project-boards/about-project-boards "projects"
[8]: https://github.com/actions/github-script "github script"
[9]: https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injections
[10]: https://github.com/UpstreamOrg/UpstreamRepo/projects/1
[11]: https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#pull_request_target
[12]: https://docs.github.com/en/issues/trying-out-the-new-projects-experience/automating-projects#example-workflow
