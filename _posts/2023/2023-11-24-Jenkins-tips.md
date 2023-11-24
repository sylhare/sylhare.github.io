---
layout: post
title: Jenkins random tips
color: rgb(103,166,86)
tags: [tips]
---

We talked about Jenkins once [before][10] in this blog, with some neat groovy snippets to get to know the functionalities
to build your own pipeline.

But in this article, I want to go about some features that might not be recommended for best practices but could be
useful while patching up old services or pipelines. 
You shouldn't need them, but when you do, you're glad they exist. 😅

## Disable concurrent builds

If you push multiple times one after another, you may trigger the pipeline multiple times; in such a case, it may be
better to run it only once. Or as it specified in the [documentation][], if you need to access shared resources, having
two pipelines in parallel might cause interferences.

```groovy
pipeline {
    options {
        options { disableConcurrentBuilds(abortPrevious: true) }
    }
}
```

By default, it aborts the new ones, but you can change that with `abortPrevious` to start a new one instead of aborting.

## Whole Pipeline timeout and retry

We talked about timeout and retry at the [step level][10], but you can also apply them at the pipeline level!

Let's say you're running in an unstable environment or your pipeline is known to get stuck for whichever reason,
you may want to use this timeout to abort when it takes more time than expected.

```groovy
pipeline {
    options {
        retry(3)
        timeout(time: 30, unit: 'MINUTES')
    }
}
```

Be sure to set it to a reasonable value, too high would be pointless and too low may create involuntary abortion.

## Error sill success

When you want to run a task that may be flaky or that does not matter and have the pipeline successful even-thought this
one step failed:

```groovy
pipeline {
    stages {
        stage('Flaky stage') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    // script
                }
            }
        }
    }
}
```

That might not fix the root problem, as this should not be necessary. But as a temporary patch, feel free to apply it.

## Abort with success

Now, if you need that, it might be a symptom that your jenkins builds are not properly configured and triggered for the
wrong reasons.
It can be useful as a temporary fix, but it would be better to check your webhook configuration.

```groovy
if (env.JOB_BASE_NAME.substring(0, 4) != "prod") {
  currentBuild.result = 'SUCCESS'
  return
}

pipeline {
    //.. stages
}
```

This will stop the pipeline based on the name before it even starts and mark it as succeeded. (You could `ABORTED` or
`FAILED` for the result too).

### After CI tasks

After Jenkins executes all the stages, there's a `post` [section][1] that you can use for notification purpose, clean up or
any of your liking.
To do that, define it as such:

```groovy
pipeline {
    post {
        always {
            echo 'This will always run'
        }
        success {
            echo 'This will run only if successful'
        }
        failure {
            echo 'This will run only if failed'
        }
        unstable {
            echo 'This will run only if the run was marked as unstable'
        }
        changed {
            echo 'This will run only if the state of the Pipeline has changed'
            echo 'For example, if the Pipeline was previously failing but is now successful'
        }
    }
}
```

### Using Docker container

Jenkins has [built-in support][2] for docker in version 2.5 and higher. You can use it with the `docker` method such
as:

```groovy
pipeline {
    agent {
        docker { image 'node:21-alpine3.17' }
    }
    stages {
        stage('Node Version') {
            steps {
                sh 'node --version'
            }
        }
    }
}
```

Or using a closure for some steps in your pipeline with this custom definition for a _node_ docker image:

```groovy
def withDockerNode(Closure body) {
    docker.image('node:21-alpine3.17')
}

pipeline {
    stages {
        stage('Node Version') {
            steps {
                withDockerNode {
                    sh 'node --version'
                }
            }
        }
    }
}
```

This way you don't have to run all stages from the node container, and in this case both "_Node Version_" stages should
return the same value.

### Pipeline trigger

When you need to run or [trigger][3] the pipeline for a certain reason, you can use the `trigger` clojure. For example,
following a cron value:

```groovy
pipeline {
    agent any
    triggers {
        cron('TZ=EST\nH/15 * * * *')
    }
}
```

For the [cron syntax][4], you can follow the documentation on the [jenkins][5] website. Here it should be triggered 
every 15 minutes, the `H` in the front can be used with a range `(0-60)` for any minutes and could be considered as
a random value (not necessarily triggered at _:15_, _:30_, _:45_, but could be triggered at _:07_, _:22_, _:37_).

## Conclusion

Please don't throw rocks at me! 🙏

But in all seriousness, if you have another less than ideal jenkins patch that would fit in here, let me know or feel
free to share in the comment, I'd love to see it ...for a friend.

[1]: https://www.jenkins.io/doc/pipeline/tour/running-multiple-steps/
[2]: https://www.jenkins.io/doc/book/pipeline/docker/
[3]: https://www.jenkins.io/doc/pipeline/steps/params/pipelinetriggers/
[4]: https://www.jenkins.io/doc/book/pipeline/syntax/
[5]: https://www.jenkins.io/doc/book/pipeline/syntax/
[10]: {% post_url 2022/2022-04-01-Jenkins-delivery-butler %}
