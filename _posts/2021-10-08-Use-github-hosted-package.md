---
layout: post 
title: Use a GitHub hosted Maven package 📦 
color: rgb(125, 60, 152)
tags: [kotlin]
---

Deploying a package on the GitHub Package Repository (GPR) have already been 
[covered]({% post_url 2019/2019-10-15-Github-actions-registry-gradle %}). 
Now let's have a deeper look at how to use that published package in your project.

This time I'll use the Kotlin package [randomK](https://github.com/sylhare/RandomK) which is a package that takes a
class and instantiate a random object from it.

## Create a GitHub Personal Access Token

To have access to the GPR packages, you need to use your GitHub account with a [personal access token](https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps#personal-access-tokens).
It's easy enough to deploy your package but the usage is a bit inconvenient compared to public [maven repositories](https://mvnrepository.com/repos).

Go to _Settings > Developer settings > Personal access tokens_ and select this option:

{% include aligner.html images="github-pat.png" column=1 %}

It only needs _read_ access to the GPR. Personal access tokens, may also be referred as PAT in the literature.
The token will only be shown once, so make sure you save it in a secret or somewhere safe before exiting the page.

## Add the dependency

Add the GPR as a repository inside your [build.gradle.kts](Example/build.gradle.kts):

```kotlin
maven {
    url = uri("https://maven.pkg.github.com/sylhare/RandomK")
    credentials {
        username = project.findProperty("gpr.user") as String? ?: System.getenv("USERNAME")
        password = project.findProperty("gpr.key") as String? ?: System.getenv("TOKEN")
    }
}
```

Basically this defines the GitHub Package Registry as a maven repository in your gradle file (within the _repositories { .. }_ declaration).
When building, it will use it to reconcile the dependant package.
It uses a username and password stored in some environment variables. 

You can set those variables using:

```bash
export USERNAME="my-github-username"
export TOKEN="my-github-personal-access-token"
```

Then add the randomK dependency:

```kotlin
dependencies {
    implementation("com.github.sylhare:randomk:$randomKVersion")
}
```

Now you can enjoy this package in your code. 
To get the latest version available check out the [_package_](https://github.com/sylhare/RandomK/packages/978387) section in the repository page.

## Start using it in your code

That's it your all set, you can now use your new package.
You can create a random instance with `randomK` in your kotlin file like:

```kotlin
val example: Example = randomK()
val otherExample = randomK<OtherExample>()
```
😉
It will create a random instance.

## In your CI/CD pipeline

For your CI/CD pipeline, let's use GitHub action, 
you will need to pass the `USERNAME` and `TOKEN` in order to build your package and run the tests.
It's better to use environment variables for that. 

Add access to your secret in your _action.yaml_ via:

{% raw %}
```yaml
env:
  USERNAME: ${{ secrets.USERNAME }}
  TOKEN: ${{ secrets.TOKEN }}
```
{% endraw %}

This will map the secret `TOKEN` to the `TOKEN` environment variable in the pipeline, same for the `USERNAME`.
With GitHub action, you can also use already available values directly without setting a secret:

{% raw %}
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 11
        uses: actions/setup-java@v2
        with:
          java-version: '11'
          distribution: 'adopt'
          cache: gradle
      - name: Build and test with Gradle
        run: gradle clean build test
        working-directory: Example
        env:
          USERNAME: ${{ github.actor }}
          TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
{% endraw %}

With this, you are all set to start using any GPR hosted maven package 📦

