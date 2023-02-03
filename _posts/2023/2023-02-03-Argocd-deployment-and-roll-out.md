---
layout: post
title: ArgoCD deployment and roll out
color: rgb(0, 148, 133)
tags: [open source]
---

[ArgoCD][1] describes itself as a declarative tool for Kubernetes, the CD refers to the continuous delivery. It falls
inside our devops toolbelt. 🛠

By [declarative][2], it means that ArgoCD will show you the expected state of your deployment without telling you what it
did to make it happen. However, it's not black magic 🧙‍♂️ it will just be applying deployments, creating pods, 
updating deployment, and so on to achieve the desired state.

You may be familiar with its [dashboard][1]:

{% include aligner.html images="argocd-ui.gif" column=1 %}

It displays your deployment with the services and pods. The UI gives you the ability to check the current
configuration, and you can even look into the logs of each pod.
Let's look as some ArgoCD configuration and how it integrates to your Kubernetes deployment.

## Configuration

### Custom resource definitions

Those are kubernetes [custom resources][5] that are defined by Argo to provide a tailored deployment.
A custom resource is an extension of the K8s API of a certain `kind`, they are not part of the default Kubernetes
installation that's why the API version is `apiVersion: argoproj.io/v1alpha1`.

#### Rollout

A `Rollout` is argo cd's version of the [Deployment resource][6]. It provides Blue Green and Canary update strategies.
If you are not familiar with the terms:

- **Canary Deployment**: Update one pod at a time, usually you direct a small percentage of the traffic to the pod with
  the new version and make sure the system is still health before proceeding.
  - Less cost impacting, less infrastructure to monitor and maintain, may cause downtime.
- **Blue/Green Deployment**: Have a full replicat of the deployment and switch the traffic to the new one once fully tested. 
  - Easy rollback, use as disaster recovery, more costly since you need both infra to run at the same time and can increase complexity
  to manage both.

Here is a Blue/Green _Rollout_ deployment in argo for a fictitious guestbook service:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: guestbook
spec:
  # ...other k8s configs
  strategy:
    blueGreen:
      activeService: guestbook
      previewService: guestbook-preview
      prePromotionAnalysis:
        templates:
        - templateName: guestbook-smoke-tests
```

Here it's using a `prePromotionAnalysis` analysis that will check that the service is healthy before switching the traffic
to it. If the service is degraded or do not meet the analysis run, the rollout is aborted.

The [preview service][7] references the service that the analysis will be run against. The preview is at the latest version 
of the service. The preview allows to have an endpoint to test the newest version of an application. 

#### AnalysisTemplate and AnalysisRun

An `AnlysisTemplate` is a custom argo cd resource that define how to perform the system's health analysis before a 
deployment. An `AnalysisRun` is an instantiation of the template, they are like a job that is run complete with a
status "Successful", "Failed" or "Inconclusive".

You can use analysis template for both deployment types, here is an example configuration:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: guestbook-smoke-tests
spec:
  args:
  - name: guestbook
  metrics:
  - name: guestbook-smoke-tests
    provider:
      job:
       spec:
         backoffLimit: 0
         template:
           spec:
             restartPolicy: Never
             containers:
               - name: smoketests
                 image: docker.io/guestbook-smoke-tests:latest
                 imagePullPolicy: Always
```

In this example we have a custom smoke test docker image which will do the analysis for our guestbook app.
You can also pass [args][6] in the metrics part that will be resolved when the analysis run. 
Use `{{ args.name }}` for your args placeholder.

### Sync hook

The sync is when ArgoDC looks at the state of the cluster and the desired manifest and applies it to any out of sync
resource in a pre-determined [sequence][3]. You can influence which resource is going to be synced first by updating the
wave annotation.

```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "5"
```

Lower values of wave are run first. But if we're talking about hook, you can set up a `PreSync` or `PostSync` hook which 
will be run first or last. For example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: regression-tests
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation
spec:
  template:
    spec:
      containers:
        - name: regression-tests
          image: docker.io/regression-tests:latest
```

There are more [hook types][4] that you can explore from in the doc. You would usually use hooks to run a kubernetes
job as you can see in the above example for a regression test that will run once all resources are synced, up and healthy.
So your regression tests won't run if the newest version of the application was not successfully deployed.

The `hook-delete-policy` is to set the strategy to delete the previous job. In this case we are using `BeforeHookCreation`
which will delete the previous job with the name before creating a new one. This is the default deletion policy.

[1]: https://argo-cd.readthedocs.io/en/stable/
[2]: https://en.wikipedia.org/wiki/Declarative_programming
[3]: https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/
[4]: https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/
[5]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
[6]: https://argoproj.github.io/argo-rollouts/features/analysis/
[7]: https://argoproj.github.io/argo-rollouts/features/bluegreen/#previewservice
