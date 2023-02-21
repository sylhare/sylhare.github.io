---
layout: post
title: Kubernetes deployment ⎈ with Helm charts
color: rgb(52, 102, 201)
tags: [kubernetes]
---

For this article you must have some knowledge of Kubernetes, as [Helm][1] self describes as a "package" manager for it. 
To help you along the way find more about Kubernetes in this [article with the basics][10] or via those [hands-on examples][11].

## Package Manager

By package manager, it's not exactly like `npm` (node package manager), here the packages are called "_charts_".
And a [chart][2] is a [collection of files][2] that describe a related set of Kubernetes resources.

There's an amalgam with _chart_ which means the collection of file, but also the main file which describes the Kubernetes
resources and use the configuration.
The _configuration_ of the chart are stored in a values file and used to create the actual objects described.
Those are the main part of a _released_ chart package, but it can include some other files as well.

Usually if the charts describes a service, the code won't be packaged as is but used as a docker image which is more
convenient.
This packaging allows versioning which makes Infrastructure as a code much easier to apply.

## Using Helm

At this point, you can refer to the [getting started][3] part of Helm's documentation, as I will use their example for my
ends. The difference is that I may focus on some aspect that may be more relevant for an application developer to know
compared to a DevOps specialist.

### Installation

For the installation, you may follow the [quick start guide][4], you can't get started if you don't have quick start. 🙃

On MacOs use:

```bash
brew install helm
```

You can add a repository like [bitnami][6], so you can download open source charts:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

You also need a Kubernetes cluster running, locally you can use [Docker Desktop][5] which provides one out of the box.
So that you can apply your charts somewhere.

### Creating a template

Let's create a "chart" package with:

```bash
helm create hello
```

Then let's add our first template which will be situated in `hello/templates`. Don't mind the files already there, you 
can delete them, since we are doing it from scratch.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: hello-configmap
data:
  hello: "Hello World"
```

For the extension, prefer `.yaml` for yaml file, you can also have `tpl` for helper files. I have also seen `tmpl` for
yaml files using variables. The whole concept is similar to the liquid tags and include system within Jekyll.

If you are not sure about the syntax or the structure of your chart, there's a list of convention that you can apply so
that you follow the [best practices][9].

### Deploy your manifest

For this part you need to have a kubernetes instance running. Then use helm to deploy your chart:

```bash
helm install hello-released ./hello
```

You can set the released name of your chart, here it's `hello-released` and specify the path to it.
You can then check the actual manifest via its released name with:

```bash
helm get manifest hello-released
# Via kubernetes
kubectl describe configmaps hello-configmap
```

The helm command will return the actual file that was loaded, while the kubernetes command will return the actual 
resource that was created.

To uninstall, use the release name of your chart:

```bash
helm uninstall hello-released
```

The template from the chart will be uninstalled and the configmap defined in it will also be removed from Kubernetes.
This is powerful, you can spawn or remove a full deployment in one command.

### Using template variables

If you've tried, you can see that you can't deploy our deployment twice with different release name. That's because
we have hard coded the name which should be unique in Kubernetes.

To avoid that you can use [variables][8] via the templating engine which will be populated at the time of the installation. 
Example the name can be:

{% raw %}
```yaml
metadata:
  name: {{ .Release.Name }}-configmap
```
{% endraw %}

It's the same format as liquid using the double curly brackets `{% raw %}{{ template }}{% endraw %}`. The `Release` object is defined by
default with Helm and contain the `Name` which is the released name (last time it was _hello_released_).
You can find other [built-in objects][7] like _Files_, _Chart_ or _Capabilities_ which will hold different set of 
information.

If you want to test your templated value use:

```bash
helm install --debug --dry-run hello-templated-release ./hello
```

It will do a dry run building the resource and populating the template so that you can check that the outcome is what
you are expecting. 

### Using a value file

The templating function becomes even more powerful when you can set in advance SOME [values][8] that will be passed to 
your chart at the time of installation using the [built-in][7] object `Values`.
For that you will need a value file, usually there's one by default within your chart called `values.yaml` 
which you don't need to pass, but you can also have an external one and pass it such as:

```bash
helm install -f external-values.yaml ./hello
# Or to upgrade an existing installed chart
helm upgrade -f external-values.yaml hello ./hello
```

Then independently of where the value is stored `./hello/values.yaml` or `./external-values.yaml` you can access both
using:

{% raw %}
```yaml
data:
  drink: {{ .Values.favoriteDrink }}
```
{% endraw %}

If you have set `favoriteDrink: coffee` ☕️ in the values file and `favoriteDrink: tea` 🍵 in the external-values file that
was passed, then the tea will win as it will override the default value.

To access a value within your yaml, you just need to use `.` dots up to it, for example:

```yaml
favorite:
  drink: tea
```

To access it, use `{% raw %}{{ .Value.favorite.drink }}{% endraw %}`, you can test it as well via a dry run by passing in the command the
argument `--set favorite.drink=tea` that will override the value and use this one instead.

And that's it folks! You should now have the basics to [get started][3] with [helm][1] in your [kubernetes][10] cluster.
Try and deploy a simple service via helm chart.

[1]: https://helm.sh/
[2]: https://helm.sh/docs/topics/charts/
[3]: https://helm.sh/docs/chart_template_guide/getting_started/
[4]: https://helm.sh/docs/intro/quickstart/
[5]: https://docs.docker.com/desktop/kubernetes/
[6]: https://bitnami.com/
[7]: https://helm.sh/docs/chart_template_guide/builtin_objects/
[8]: https://helm.sh/docs/chart_template_guide/variables/
[9]: https://helm.sh/docs/chart_best_practices/conventions/
[10]: {% post_url 2019/2019-08-15-Kubernetes-basic-components %}
[11]: {% post_url 2019/2019-08-21-Kubernetes-hands-on %}
