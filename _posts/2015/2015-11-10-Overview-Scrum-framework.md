---
layout: post
title: Overview of the Scrum framework
color: rgb(42,140,152)
tags: [agile]
---

## SCRUM framework

Started in 1995, book released in 2001. The Latest version was released in 2011.
Authored by Ken Schawner and Jeff Sutherland. 
Read it online on [scrum.org][1].  

So this is a quick overview that I wanted as close as possible from the scrum guide and the training they
provide at either [scrum.org][1] or [scrumalliance.org][2] for a scrum master certificate at the time.

### Roles

There are three roles in the scrum team.
- **P**roduct **O**wner: 
  - defines the priorities the value, represent all stakeholders of the project.
  - decides on the "what" to do and the "when" to prioritize.

- **S**crum **M**aster 
  - person who knows the scrum process inside out, explains and coaches it. Helps keep things running and the team focused.
  - owns the process

- Team:
  - cross-functional, self organizing group, have the necessary skills to deliver the product
  - decides on the "how" to implement and the "how much" they can deliver.

Aside from those key roles, you may find other roles that may interact with the scrum team:	
- _Stakeholders_: People impacted or who impacts the project
- _Scrum Mentor_: Coach to help you correct what is wrong in your process

### Artifacts

The Scrum's artifacts are the visible elements that are created during the process:

- Product Backlog 
  - prioritized task that adds the most priority)
  - Owned by the Product Owner
- Sprint Backlog
  - Time box to do items from the backlog
  - Owned by the TEAM
- Increment
  - What is delivered in a sprint
  - Owned by the TEAM

### Events ~~Ceremonies~~

#### The Sprint

The sprint itself is now considered a Scrum event, but it's not a meeting.
The sprint is a recurring time box where the team delivers a product increment.

- **Time:** 1-4 weeks
  - 2-week sprint is the most common
- **Players:** PO, SM, TEAM
  - The PM and PO can be spread across multiple teams, depending on the maturity of the project and the team.

All the other events happen during the **sprint**.

#### Sprint Planning

- **Time:** 2–8Hrs 
  - 2hrs a week up to 8hrs for a month
- Team owns it
  - Team can decide to add more or remove work during the sprint.

The team planning meeting is divided into two parts:
- Part 1:
  - **Time:** 1-4Hrs
  - **Players:** PO, SM, TEAM 
  - Product owner to present the context, what and why the work is needed and the top priorities 
- Part 2
  - **Time:** 1-4Hrs
  - **Players:** SM, TEAM
  - Add the tasks from the backlog they commit they will do during the sprint length, according to their capacity and
    definition of done. 

For the meeting to be efficient, the tasks targeted for the sprint be ready to be worked on, meaning they were refined 
and understood by the team.

#### Daily Scrum 

- **Time:** 15min
- **Players:** SM, TEAM
- **Questions:**
	- *What did you do yesterday?*
	- *What will you do today?*
	- *Is there something blocking you? Need help?*

The goal is for the team to sync and address issues and be self-aware of the sprint health.

The sprint tasks should move on the sprint backlog like a wave:
  - From the left (todo) for the lesser priority tasks to the right (done) for top priority tasks.

If a task in the sprint takes more time than estimated, 
you have to decide if you keep it or if you move it to the next sprint depending if you are on target or not. 

You make commitment to the team, problem-solving and talks are done after the daily scrum.

#### Sprint Review

- **Time:** 1-4Hrs
- **Players:** PO, SM, TEAM
- **Product focused**, occurs at the end of the sprint demonstrates sprint increment, 
  get feedback and create new tasks, change prioritization, have new ideas, 
  improvements for the product to please the product owner and stakeholders.  
- **Key elements**:
	- Celebrate the work that was done
	- Share the knowledge with the team / stakeholders
	- Get Feedback on the product.
    - PO validates if the stories are accepted or not.
	
Team success or a team failure according to the "GOAL" of the sprint, requirements with acceptance criteria.

#### Sprint Retrospective

- **Time:** 45min - 3hrs
- **Players:** SM, TEAM
- **Process focused** see what went well or bad and look for best practices, impact the way we work 
- Adapt: improvement list (priority improve process over deliver, need to ponder)
- Inspect: Get a good understanding, or the lesson learned
	- Impediment current issues
	- Improvement things we want to be better in the future (more effort)

An example agenda for a retrospective:
- Debrief the metrics 
- Last Retro action-plan - 5 min
- Brainstorm (creation of the post-it) - 5min
- Discussion and sharing of the post-it - 30 min
- Prioritisation - 5 min
- Action plan to address the 3 most important items - 10 to 15min

During the retrospective, the team should answer the following questions:
- *What went well during the sprint cycle?*
- *What went wrong during the sprint cycle?*
- *What could we do differently to improve?*

The goal is to take action on the problems and implement the improvements as soon as possible.

#### Product Backlog ~~Grooming~~ Refinement
> *Not an official "Scrum Event"*

- **Time:** max 10% of the sprint
- The goal is to make sure that the backlog has enough tasks for the subsequent sprints, 
  and that the tasks are well understood by the team.

The product owner is responsible for the backlog, but the team can add tasks to it. 
During this time, the product owner can explain the new chunk of work, the team can ask questions and refine the tasks
up until it is ready to be worked on. See [Definition of Ready][10] (DOR).

#### Sprint Cancellation

Product Owner can stop a sprint that goes really wrong.
This can also happen when there's a hard shift of priority and the work at hand is not relevant anymore at this time.

But it can also happen when most of the team is not available during the sprint's duration,
like during the end-of-year holidays.

### Metrics

Metrics in whatever agile methodology you choose to use are not meant for higher management,
but rather as a tool for the team to auto evaluate and improve recursively. 

> "Information helps you make decisions."

It is recommended to implement early on metrics (chosen by the team) in order to get feedback on your process. 
It can be a good indicator of:

- Your Sprint health: 
  - changes in the sprint backlog (scope creep)
- Process issues:
	- The number of blocked items
	- The waiting time of an issue (time is stays in a particular column)
- Team load: 
  - The WIP (work in progress), the number of tasks currently in progress
- Backlog health
  - The elapsed time of an issue (time between the creation and the completion)
  - The number of stalled epics, stories (not touched for months or years, or unknown)

This information will help take decisions during the daily scrum on how the team is doing. 
It is also a key component during the retrospective where you can comment and take action:

- Find the root cause of a sudden drop in a metric
- Add a new metric to monitor a new aspect
- Remove old metrics that are not relevant anymore 

#### Burnt-down

The sprint Burnt-down chart is used to evaluate the work that has been done (based on the story points) 
compared with the remaining amount of time during the sprint.

It is the most used metric for the SCRUM framework.


[1]: https://www.scrum.org/resources/scrum-guide
[2]: https://www.scrumalliance.org/
[10]: {% post_url 2015/2015-12-13-What-is-a-user-story %}