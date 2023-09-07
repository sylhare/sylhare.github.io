---
layout: post
title: Build your CI/CD pipeline with GitHub actions
color: rgb(115, 2, 2)
tags: [open source]
---

GitHub action it is the GitHub CI/CD solution available out of the box to run custom integration
and deployment pipelines called _workflows_. It is configurable directly from the repository.

> **CI / CD** stands for **C**ontinuous **I**ntegration and **C**ontinuous **D**eployment, it's a set of practices
> usually automated to get the code tested, functional and available in a production environment.

You can create a workflow from an existing template from the _Actions_ tab in your repository. 
Or manually by creating a new yaml file in the `.github/workflows` folder.

Now the [documentation][8] is very well furnished, but I have compiled some most used syntax and how-to in 
this article to have a quick reference.

## Run a _workflow ..._

There are multiple [events][1] that can cause a workflow to run, here is how to use some of them in your action.

### On a regular basis

By regular basis, it's like a [cron][2] job, and it works the same way:

```yaml
on:
  schedule:
    - cron: '0 1 * * 5'
```

You can find the [cron syntax][2] below straight from wikipedia, or use cron expression generator to set it up.

```shell
# ┌───────────── minute (0 - 59)
# │ ┌───────────── hour (0 - 23)
# │ │ ┌───────────── day of the month (1 - 31)
# │ │ │ ┌───────────── month (1 - 12)
# │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday;
# │ │ │ │ │                                   7 is also Sunday on some systems)
# │ │ │ │ │
# │ │ │ │ │
# * * * * * <command to execute>
```

In our example the workflow would only run at 01:00 AM, only on Friday.

### On a push

To trigger the pipeline each time you push to the repository:

```yaml
on:
  push:
    branches: [master]
    tags:
      - 'v*'
```

Not mandatory, you can also trigger it the workflow only for certain branches (here master) or even for certain tags
(here a regex to match any tag starting with `v`).

### On a pull request

You can also have repository events as triggers such as the pull request:

```yaml
on:
  pull_request:
```

There's also a trigger for the issues. You can also fine tune it, check the [documentation][1] for reference.

### Manually

This one is to be able to go in the [action tab][3] and run the workflow manually.

```yaml
on:
  workflow_dispatch:
```

You will see a [new button][3] _Run workflow_ showing up in the action tab that will trigger the `workflow_dispatch` event.
It's not incompatible with other events, so you can have a workflow that runs on push and manually.

### After another workflow

Let's say you have a `CI build` workflow, and you wish to have another workflow to be executed after the end of this one.
You can use the `workflow_run` event to trigger it.

```yaml
name: CI notify

on:
  workflow_run:
    workflows: ["CI build"]
    types:
      - completed

```

This workflow needs to be named differently from the one it's waiting for, and will only run when the previous workflow 
succeeded.

{% raw %}
```yaml
jobs:
  on-success:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
      - run: echo 'The triggering workflow passed'
```
{% endraw %}

You have access to the [workflow's conclusion][5], and can use it in you configuration.

## Run that _workflow in ..._

### In a specific folder

You can run a step in a specific folder by using the `working-directory` option.
It can be configured for all steps using the [`default` settings][4] which is at the root like the
`jobs` keyword. 

```yaml
defaults:
  run:
    working-directory: src
```

Here the build step will use the `src` folder as the root folder.
Or directly in the step if you need to execute action in a different folder:

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm i
        working-directory: src/frontend
```        

The `working-directory` is relative to the root of the repository and will override at the step level the one
configured in the `defaults`.

### In a container image

If you need to run your step [in a container][7], like a docker image 
(you may want to set up the credential if it's a private registry).

```yaml
name: CI

on: [push]

jobs:
  container-job:
    runs-on: ubuntu-latest
    container: node:14.16
      env:
        NODE_ENV: development
      ports:
        - 80
      volumes:
        - my_docker_volume:/volume_mount
    steps:
      - name: Run in docker
        run: echo "Hello from inside the container"
```

If you don't need volumes, ports or environment variables, you can just limit yourself to the image name for
the container's configuration.

### In a user defined matrix

You can also use a [matrix][6] to perform a job with multiple values, here an example with multiple ruby versions:

{% raw %}
```yaml
    runs-on: ubuntu-latest
    strategy:
      matrix:
        ruby-version: ['2.7', '3.0', '3.1' ]

        - name: Set up Ruby
          uses: ruby/setup-ruby@v1
          with:
            ruby-version: ${{ matrix.ruby-version }}
```
{% endraw %}

It is user defined, and you define more than one (it's then called a multi-dimension matrix)

### In spite of a failure

If you want the workflow to continue even if a step fails, you can add this to your step:

```yaml
jobs:
  steps:
    - name: My first action
      run: exit -1
      continue-on-error: true
```

This can be useful when you want to run the following steps that may not be dependent on the failed one.

[1]: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
[2]: https://en.wikipedia.org/wiki/Cron
[3]: https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow
[4]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#defaults
[5]: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#running-a-workflow-based-on-the-conclusion-of-another-workflow
[6]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix
[7]: https://docs.github.com/en/actions/using-jobs/running-jobs-in-a-container
[8]: https://docs.github.com/en/actions/using-workflows/about-workflows
