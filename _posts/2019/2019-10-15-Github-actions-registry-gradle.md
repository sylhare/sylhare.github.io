---
layout: post 
title: Deploy your package on GitHub 
color: rgb(221,65,36)
tags: [kotlin]
---

## Introduction

We are going to host a kotlin based project as a maven package using all the dev tools that GitHub provides.

### GitHub Actions

GitHub actions, is an integrated solution that allows you to create automated workflow. Mainly CI / CD for continuous
development and integration. But it can also operate on issues, on the code and repository thanks to the GitHub API. The
yaml interface is still a bit clunky but once you get the hang of it, it's clearly a plus when you don't know the
syntax.

And the main thing of all, it works as intended! Either I got better with time, or it's well made, but I had no major
issues with it. And most of my interrogations were already answered
on [GitHub Community](https://github.community/t5/GitHub-Actions/bd-p/actions).

### GitHub package registry

[GitHub package registry](https://github.com/features/package-registry) is still in Beta, it aims to replace basically
everything else that currently store packages. With the GitHub Actions as CI / CD. You would have the whole development
ecosystem with one platform.

Where we are going to put our maven package [sylhare/codokar](https://github.com/sylhare/codokar) in there and test the
whole thing.

## Uploading the Maven package

### Set up your gradle

Because who would use maven for a maven package? Add the plugin in the gradle file
as [explained here](https://help.github.com/en/articles/configuring-gradle-for-use-with-github-package-registry#authenticating-to-github-package-registry)
, I used the Kotlin DSL:

```kotlin
plugins {
    `maven-publish`
}
```

I had to say that intelliJ took a bit of time to recognize the `publishing`.

```kotlin
publishing {
    repositories {
        maven {
            name = "GitHubPackages"
            url = uri("https://maven.pkg.github.com/OWNER/REPOSITORY")
            credentials {
                username = project.findProperty("gpr.user") as String? ?: System.getenv("GPR_USER")
                password = project.findProperty("gpr.key") as String? ?: System.getenv("GPR_API_KEY")
            }
        }
    }
    publications {
        create<MavenPublication>("REPOSITORY") {
            from(components["java"])
            artifact(tasks["fatJar"])
        }
    }
}
```

### Publish your package

Everything is well documented on GitHub Help:

- Create a [token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line):
- Settings > Developer Settings > Personal Access Token
- Add the package rights:
    - write:packages
    - read:packages
- Locally you can set up your token as `GPR_API_KEY`, and your username as `GPR_USER`
- Then you can publish it by running

```bash
./gradlew publish
```

## Set up the Automated workflow

Now that you have published it once to GitHub registry, you don't want to do it again. This is the time to use the
automated workflow provided by GitHub Actions.

## Use your secrets

Remember that token? Well now you need a little bit of work to use it within your workflow.

## Build, Test, Publish

Add in .github > workflows a new file like `cicd.yml` with:

```yml
name: CICD

on: [ push ]

jobs:
  test_build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8

      - name: Unit Test
        run: ./gradlew test
      - name: Build with Gradle
        run: ./gradlew build
      - name: Deploy to GitHub Registry
        run: ./gradlew publish
```

With that you can build and test your project at each push. When you want to deploy, let's say anytime you create a new
tag with the version, you can add another workflow `publish.yml`:

{% raw %}

```yml
name: Publish to GitHub Registry on Tag

on:
  push:
    tags:
      - '*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      - name: Publish to GitHub registry
        env:
          GPR_USER: ${{ secrets.GPR_USER }}
          GPR_API_KEY: ${{ secrets.GPR_API_KEY }}
        run: ./gradlew publish
```

{% endraw %}

Also GitHub generates automatically a token `GITHUB_TOKEN` that can be use in the workflow, which means you could have
done that to use the defined one instead of creating a secret:

{% raw %}

```yml
GPR_API_KEY: ${{ secrets.GITHUB_TOKEN }} 
```

{% endraw %}
