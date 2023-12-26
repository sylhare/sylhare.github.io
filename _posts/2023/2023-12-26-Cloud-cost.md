---
layout: post
title: How to reduce your cloud cost as a developer
color: rgb(242,176,53)
tags: [kubernetes]
---

## Keep an eye on costs! 💰

If you are leveraging one of the major cloud providers: [Microsoft's Azure][8], [Google Cloud][9] or [Amazon Web Service][7] (AWS).

There are several tools available within those providers that can help you manage your cloud costs.
(AWS Cost Explorer, Google Cloud's Cost Management, and Azure Cost Management) 🛠️
These tools provide visibility into your cloud costs and can help you identify areas where you can save money.

Now that will help you to manage your cloud configuration. However, if it comes down to the nitty-gritty, you may also have to
look into your system, its databases and what are the services doing with the resources you are paying for.
With those tips, you will be able to teach the developer who created those services how to save on costs. 

## Cloud tailored? ☁️

Your infrastructure on prem was expensive and a burden for your team, so you decided to move it all to the cloud.
But now... your cloud infrastructure bill is skyrocketing? 
It might be time to review your system architecture for potential improvement, starting from the most obvious:

- Use cloud technologies (like [containers][10], [kubernetes][11])
- Review the different provider and experiment to find the one that matches your needs, they are all compatible with the 
same cloud technologies
- Consider cloud provider specific features 
(ex: AWS Functions, made to run sporadically short tasks on demand, which might be cheaper than an instance running waiting to be called)

Available solutions from the cloud provider may be less costly in terms of infrastructure management rather than maintaining
it all on your side.

However, you may have heard about [Twitter][1] which saved a billion of infra-structure cost by re-designing their cloud 
architecture.
Saving images on the cloud or saving them on your own server on the scale of twitter, a couple of cents of difference per
image can add up to a lot of savings!

## K8s Cloud cost reduction tips

I do not have some magic recipe, but some insight to help identify and reduce the cost of your infrastructure.
They mostly apply to a Kubernetes (K8s) environment.

### Delete unused resources

This one is a simple tip. But in most instances, I have seen are loaded with either unused job or test services running
aimlessly or with entire forgotten namespace. While harmless, the simple fact of being there can have a negative impact
on the over all cost of the infrastructure.

The same goes for replicas, when the service is almost sleeping because you have 10 replicas, when 2 should be enough.
It's all about right sizing your system.

Now in order to take action, it is hard to see where to cut the fat in your system. So first you need to utilize tools
to detect which services and namespaces are costing you money. They fall in the observability category, and the business
for those is booming! 
Those tools are like accountants, you have to pay a small fee, but if leveraged correctly, they can more than 10 times
the return on investment.

### Adjust CPU and Memory requirements

Assigning [CPU][4] and [Memory][5] resources to the containers and pods of your services.

#### Requests vs Limits

In your [Kubernetes deployment][10], you can set for your service, the resources requests and limits for the memory 
(usually in mebibytes - Mi) and the cpu (usually in millicores - m):

```yaml
spec:
  containers:
      resources:
        requests:
          cpu: 100m
          memory: 256Mi
        limits:
          cpu: 500m
          memory: 512Mi
```

- No requests: Means that no resource will be guaranteed for the service to run.
- No limits 
  - on Memory: Means that the service may consume as much as available if there's a Memory leak and crash all other apps.
  - on CPU: Means that when the system runs out of CPU, the service will be throttled (slower).
- Requests and limits: The service will have what's requested to start but will not be able to go through the set limit.
  (In case of a bigger load, if more resources are needed, the service will crash.)
- Requests but no limits on CPU: The most [resilient][6] configuration for the service. It will have enough to run and won't be hindered by
  a limit when a resource spike occurs.

Now the tricky part with _requests_ is that you don't want to set it too high because then it's locked on that service and
if not used, it's lost. You paid for it, but it was not needed.
But you also need enough so that there's enough during usage, so you don't have to reach for more resource all the time.
(Because it could not be available at one point)
Right sizing will make your system perform better.

CPU can be throttled when there's not enough for all resources to avoid the application to crash.
Hence, on a resource spike, a limit on CPU would kill your app instead of throttling it to get passed it while staying up.
(Remember the [100% uptime goal][12])
Unlike memory, which is finite and can't be "diluted" once all the available resource is consumed, there's no more left,
until some apps crash or are forcefully killed.

### Update service probes

You have the [readiness][3] and [liveness][3] probes of your resource that could be activated/called too many times. 
By default, the probes are called every second, which for some applications might be a bit of an overkill.

The readiness probe may be less important for cost saving, because that's the one used to know if the service is started and
ready to process the load. The one we're interested in is the _liveness_ probe that will be called by kubernetes to know
if the service is still up and running:

```yaml
spec:
  containers:
    - name: example-service
      livenessProbe:
        initialDelaySeconds: 30
        periodSeconds: 20
        failureThreshold: 3
```

Here is an example, where the health probe is called every 20 seconds, but it will wait 30 seconds before the first call.
If the check takes more than 3 seconds, it will be considered as a failure.

### Log mindfully

Logging can become _very_ expensive if left uncontrolled. Looking at companies like [datadog][2] for log management,
the amount of log can quickly translate into a million-dollar bill at the end of the year. While logging is important, not all logs are!

So here is my quick advice on logging:
- You should not save anything under INFO logs with the log manager. You should not really need any DEBUG, FINE, TRACE level logs, 
but having the possibility to see them on a live tail is appreciable if your log-managing tool allows it.
- Reduce the amount of info log to around one or less per transaction 
  - If it's a big step, instead of removing the unnecessary ones, downgrade them as DEBUG.
- Warning logs should only be for unexpected scenario that does not break the system
- Error logs should be for breaking behaviours with the stack trace.

Make sure that the logs are properly formatted (JSON format usually) for the log manager, so it's faster and easier
to process and parse.
You should find the logs within the log manager that are not necessary but triggered thousands of times and remove those.

## Conclusion 💸

And that's a wrap, hopefully you found the insights you were looking for. Let me know in the comments if you have other
cost saving strategies or divergent opinion. (The request vs limits can be quite polarizing among the community).

If you don't have any visibility, it will be complicated to measure improvements or how much your infrastructure costs
to run today. If you are in that position, or the tools at your disposition are not sufficient, I encourage you to 
scout what is available as there are plenty of solutions for every need.
Leave in the comment your own story about how you reduce the costs at your company, or which tool you like/recommend!

In the end, it's usually some small action that can be done at the developer level, which at a company size can make a 
huge difference in terms of budget. So be mindful of the code impact when deploying your application.

[1]: https://www.reuters.com/technology/musk-orders-twitter-cut-infrastructure-costs-by-1-bln-sources-2022-11-03/
[2]: https://www.datadoghq.com/pricing/
[3]: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
[4]: https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/
[5]: https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/
[6]: https://www.youtube.com/watch?v=x9_9iaVszpM
[7]: https://aws.amazon.com/
[8]: https://azure.microsoft.com/
[9]: https://cloud.google.com/
[10]: {% post_url 2020/2020-04-01-Riding-docker-like-a-cowboy %}
[11]: {% post_url 2019/2019-08-21-Kubernetes-hands-on %}
[12]: {% post_url 2023/2023-11-14-Devops-mentality %}
