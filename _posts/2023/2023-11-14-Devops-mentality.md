---
layout: post
title: DevOps Mentality, pushing it to 100% uptime
color: rgb(115,36,65)
tags: [agile]
---

This article is about DevOps Mentality and what it means in a software development context where you provide a 
software-based service to a customer.

When you start hearing about [SLA][3] (Service Level Agreement) for a customer or achieve the [SLO][3] (Service Level Objective)
of the team. With indicators and KPI (Key Performance Indicators) closer to the customer's satisfaction of the provided service,
that's when as a developer the devOps mentality kicks in.

So let's dig into that, what it means to be a developer and _operator_ of the shipped features to provide the paying 
customer the good quality service they deserve.

## What is DevOps?

Let's look at both sides of the contraction, developer and operations (hence the _operator_ 🙃). What they mean and how
it is evolving.

### Developer

In a company, the developer is the one working on any application or developing new code features for the customer.
As if code itself is enough to provide the service that the customer's willing to pay for.

We talk about developer's best practices and how to write clean code, give good code reviews, how they can work 
efficiently with an agile methodology/framework/process.

Without being DevOps, developers are more and more expected to expand their knowledge outside their secure locale
environment setup to take accountability in the service provided to the customer. Which is the _operations_ side.

### Operations

Originally, the IT operation side is tasked with the infrastructure and making sure that the system runs smoothly.
Applying security patches or use their magical sysadmin skills to make a thousand actions with a single highly esoteric 
command line. They're pro-integrators making systems communicate and interact with each other, and finally, they often
take care of problems that could occur in production.

I have heard stories where the developer's code is shipped from its laptop to the production server, and then it would be 
up to the operation side to "_make it work_". It goes without saying that throwing the hot potato over the fence creates
friction and slows down the process.

Now when the system is not a black box sold by an external vendor, but developed internally, it makes more sense that
the developers in charge should be held accountable for any problem in production.
That's how merging the two skill-sets growing closer became obvious.

### The shift

The DevOps mentality is a cultural shift for a company that aims to improve collaboration between both development and
operation side to draw the [best practices][1] from each.
Most software companies that hold software development as their core business will have developers as close as DevOps as
they can get.

Meaning that the person will be in charge of both the feature development and the support of the service. This duality
is what DevOps is about. I talk about duality, but the quality side that could belong to a Quality Engineer is part of the
mix. When you support your own code, quality suddenly matters a lot more for some. 
(After being paged at 4AM to fix a bug in production 🙃)

## The DevOps Mindset

### Pushing the customer first

With the DevOps mentality, it's not just about the cool Kubernetes cluster on one side and those awesome microservices
on the other side.
It is looking at the system from the customer's perspective. Those microservices on that cluster are there, so the 
customer is able to receive a service.

It could be playing a game, accessing an online store and purchasing some goods, watching videos, and so on. The 
customer does not care about that team's microservice taking getting killed because there's not enough memory. But they
do care when the service gets degraded or down.

With a DevOps mindset, you don't stop at your own domain or microservice, you expand a little to make sure that the service
which usually relies on multiple team's work is up. In an ideal world, every team you work with should have that mindset
and catch the error in their domain before you, but when the ball is dropped, your proactivity will be key.

### How do you measure the service's quality?

Now that we've established that the customer's interested in the service, and you should too, let's see what metrics 
we have at hand, so we can measure and improve ourselves.

Let's talk about [SLA, SLO, SLI][3] which are the:
- Service Level Agreement: What has been agreed with the customer in the contract
- Service Level Objective: For key area, the goal you set to aim (usually higher than the SLA)
- Service Level Indicator: What happened in reality

On their own, they are just generic terms for metrics used in the business. Usually they represent [uptime][2] or
availability if the server was up and responding.

For the uptime, if you set your SLA to 99.99%, that means you can only have around 1h of downtime yearly!
But that's not even impressive. Giant companies like Google, Netflix have up to [99.999% uptime][4] which is 5min
of downtime per year 🤯

For responsiveness and availability, we use the xth percentile (usually 95th as P95) to measure the time it took for the
request to be processed under a heavy load. For example, a P95 of second 2 could mean that 95% of the requests gets 
answered within 2 seconds. If that P95 increases, that means the platform is taking more and more time to answer making
it less available.

It's less critical than the uptime but if your service is up, and it takes 10
minutes instead of 2 seconds then it's considered degraded from a customer standpoint.

## Handling a service Outage

### Proactive actions

That's the checklist of actions you've gathered from your own experience or previous services you've worked on that can
be applied to this new service you're about to put in production.
This checklist is the common type of non-functional requirements (that don't directly deliver value to the customer)
to avoid most production outages that occur when deploying the service. 

For example, on my checklist, some basic must have:
- Have a CI/CD pipeline that test and deploy the software automatically
  - To make sure that the system still works
  - To deploy without manual intervention (and possible mistakes that could come with it)
- Have at least two environments (DEV and PROD)
  - To be able to test your changes against the system before prod 
  - (A third one for integration which is a duplicate of prod is appreciated)
- Have traces and transaction logs
  - To have enough log (don't over log) and a traceId to follow the transaction across the system
- Have observability/monitoring and alerting
  - To be able to see what is happening in the system and get alerted in case of an issue

Depending on the infrastructure and some specificity of your team, you may have more extra steps, documentation or
actions to perform. Questioning yourself is the first step, how can the system fail and how can I prevent/know about it?

### Troubleshooting

Unfortunately, an outage may happen, and when it does, your job will be to investigate, identify the root cause and
fix it. That's easier said than done, so let's map out some tips and rules for this period:

- Make sure you communicate
  - People will want to know the impact, what's going on, what you're looking at to coordinate
  - No need to argue via messages or over-communicate, keep it to the facts.
  - Having traces will make it easier to identify any process failures
- Collect data
  - Review the graphs that show the health of the system to find where the problem might be from
  - Check the latest change in the system, there's a high chance one of them could be the culprit
  - Read the logs and stack traces (in the heat of the moment you may see but not read the error)
- Make hypotheses and rule them out
  - Ask yourself why and how it can display an error there, how to validate the configurations, and so on ...
  - While investigating, you may think of multiple reasons, write them out if you can divide the work to test them

This is similar to how you'd fix a bug, with the added pressure of people running around while the house is on file
🏠🐶🔥 _"This is fine"_.
Keep your head cool and pace yourself, in this case fast can be the enemy of good.

### Postmortem

The postmortem happens once the outage is fixed. It's a session where the team re-trace precisely the timeline that led
to the problem and its resolution.
It needs to be precise and supported by traces, notes or messages, so it is meaningful. With this information, you will
be able to measure the outage time, the downtime and the customer impact.
This is an important aspect for both the team's operational metrics and for the customer (cf: SLO, SLI and SLA).

Once the timeline is created, the team should go through it and ask questions, for example:
- Why did it take 10 minutes before anybody noticed?
- Why did the broken code work fine during the maintenance at 3 AM but broke at 10AM?
- Why was there no alarm raised at this moment when this system was down?
- Why has the bug passed through the CI/CD pipeline?
- Why did the outage only happen in those environments?

Some answers should be available and some might need some further investigation. Those questions will help for the next 
part, which we'll talk about next.

### Retro-action

Like in an agile based process, we strive to make everything better. To do so, we should have a feedback loop mechanism 
to learn from previous outage and propose improvements. 
Those improvements should follow the S.T.A.R. (Steps To Avoid Recurrence) methodology. 

Find concrete actions that can be implemented within the next 5 business days that would have if present prevented the
previous outage.
There should always be at least one action that can be performed, for example, it can be in the range of:
- A software or configuration fix.
- Adding a missing test
- Updating an alarm threshold or creating a new alarm
- Update the support documentation
- Add visibility (graphs, traces, logs) in the system

Those actions should be highly prioritized, and the team is kept accountable for accomplishing them.

## Conclusion

The DevOps mentality is about bringing teams closer, centering on the customer and providing value. Creating bridges,
becoming accountable as a team.
It is the path to delivering high-quality software quickly and reliably and getting that uptime as close to 100% as possible.

Nobody is immune to mistakes, but with the DevOps mentality, working jointly on all aspects of the service,
with the adequate processes in place will make sure that those typos are caught early one before they impact the customer. 
Because once again, it's about putting the customer first ❤️



[1]: https://www.atlassian.com/devops/what-is-devops/devops-best-practices
[2]: https://uptime.is/
[3]: https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli
[4]: https://www.nytimes.com/2011/01/09/business/09digi.html
