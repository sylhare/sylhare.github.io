---
layout: post
title: Azure, deploy a Kubernetes Cluster
color: rgb(13,183,237)
tags: [kubernetes]
---


[Azure](https://azure.microsoft.com/en-us/services/kubernetes-service/#overview) AKS (Azure Kubernetes Cluster) is a serverless Kubernetes offer.
Deploy and manage containerized applications more easily with a fully managed Kubernetes service. 

## Azure Kubernetes Service

When you log into Azure Cloud you get a lot of possibilities and resources to play with.
Almost everything can be done via the [Azure Cloud Portal](https://portal.azure.com) (a GUI), but that would be a very bad idea.
The GUI is great to get a look at metrics, existing deployment or for testing around, 
however it is advised to use the [command line](https://docs.microsoft.com/en-us/azure/aks/azure-ad-integration-cli) as much as possible because more generic and reliable.

Creating a simple Kubernetes cluster with the `az aks` which is the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az_aks_create):

```bash
az aks create --resource-group MyResourceGroup --name MyManagedCluster --node-count 2
```

That will [create](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough) all the necessary infrastructure components you need for your cluster.
They will be referenced as resources in your Azure Dashboard and will be part of the `MyResourceGroup` which is the specify group.
The name of the cluster can't be change later.

{% include aligner.html images="azure-dashboard.png" column=1 %}

Once created (it can take a couple of minutes) you can access your Kubernetes cluster via your PC,
or using the Azure Cloud Terminal (available as Bash or Powershell) with all the tools already installed.
You may need to get credentials so you can access your Kubernetes:

```bash
az aks get-credentials --resource-group MyResourceGroup --name MyManagedCluster
```

And then it should be all traditional Kubernetes/helm commands to update your cluster.
And that's the good thing about it, you don't need to learn new special commands to manage your cluster,
you can still use `kubectl`.

## Get started with your Kubernetes Cluster

### Create new deployment

Apply new deployment using yaml file instead of the GUI using:

```bash
kubectl apply -f deployment.yaml
```

If you are using an Azure registry (to store your artifacts and docker images), you can use the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/ad?view=azure-cli-latest) 
to attach it to your deployment using with `azureRegistry` the name of the registry:

```bash
az aks update --resource-group MyResourceGroup --name MyManagedCluster --attach-acr registryAzure
```

That way you can pull images from your own registry and have your pods created.
Once done, it should also be all be visible in the GUI

### View created resources on the Portal 

Talking about the GUI once you have some pods, services and else, you can click on kubernetes resources and select one.
You then have some visualization options there on the side (Yaml, Events, Changelog)

{% include aligner.html images="azure-k8resources.png,azure-deployment.png"  %}

All these info can be viewed with `kubectl describe` but it's still cool to have it there as well.
In case you lost the file, or want to check the deployment from the GUI.
Also you will see that a lot of Azure stuff will be added to your deployment Yaml files (timestamp, uuid, ...).


### Add metrics for monitoring

Once you have a couple pods, you can create default metrics charts from the Monitoring panel in your dashboard from your kubernetes cluster.
It has basic pods and cpu information.
Still on the monitoring side you have access to a broad range of features like Alerts, Logs, and other diagnostic tools.

{% include aligner.html images="azure-metrics.png" column=1 %}

But that's not all, you can also configure a prometheus instance and plug it to your cluster for added functionality.
For that you can use some [prometheus exporters](https://prometheus.io/docs/instrumenting/exporters/) with a [prometheus container](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-prometheus-integration)
or directly through the Azure Monitor so that you can _scrap_ the metrics and display them.
