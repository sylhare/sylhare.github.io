---
layout: post
title: Overview of Agile at work
color: rgb(242,85,44)
tags: [agile]
---


## Agile Project Management

Agile remove the bullying from the process, scope is the only thing that gets discussed in an Agile methodology.
Agile is:
	
- Iterative
- Incremental
- Flexible
- Interactive

### Agile Manifesto values:

- Individuals and interactions over processes and tools
- Working software (solution) over comprehensive documentation
- Customer collaboration over contract negotiation
- Responding to change over following a plan
 
### The 12 Agile principles :

1.  Our highest priority is to satisfy the customer through early and continuous delivery of valuable software.
2.  Welcome changing requirements, even late in development. Agile processes harness change for the customer's competitive advantage.'
3.  Deliver working software frequently, from a couple of weeks to a couple of months, with a preference to the shorter timescale.
4.  Business people and developers must work together daily throughout the project.
5.  Build projects around motivated individuals. Give them the environment and support they need, and trust them to get the job done.
6.  The most efficient and effective method of conveying information to and within a development team is face-to-face conversation.
7.  Value (Working software) is the primary measure of progress.
8.  Agile processes promote sustainable development. The sponsors, developers, and users should be able to maintain a constant pace indefinitely.
9.  Continuous attention to technical excellence and good design enhances agility.
10. Simplicity — the art of maximizing the amount of work not done — is essential.
11. The best architectures, requirements, and designs emerge from self-organizing teams.
12. At regular intervals, the team reflects on how to become more effective, then tunes and adjusts its behavior accordingly.


### Agile and WBS

| **Agile** | **WBS** |
| --------- | ------- |
| for more changing or unknown environment |  Predictable environment same technology, few changes)) |
| Always changing, change is natural, adaptation|  doing the same thing expecting a same response |

WBS is referred as [Work Breakdown Structure](https://en.wikipedia.org/wiki/Work_breakdown_structure) 
used in Waterfall project management.


## Agile frameworks

### Scrum

See the [Overview of the Scrum Framework]({{ relative_url }}{% link _posts/2015-11-10-Overview-Scrum-framework.md %}) article.

**tldr**: 
A framework where your plan work iteratively that is committed to be done during a specified time called sprint.
At the end of each sprint value is delivered, feedback is received and delivery process gets improved.

### Kanban

Kanban is a way to show work and if it is well done
For example you can set a limit of things that can be in progress (WIP) inside the Kanban

Value stream is a flow of activities and work units that introduce value for the customer
Work unit is a specific measurable amount of work that can be customized and treated as a whole

WIP: Work in progress
work in progress should be short, and you should control cycle time (time to do WIP)
    
work queue is the backlog for example
lead time is how much work is in progress divided by average completion rate

### XP Xtrem programming

XP Xtrem programming invented by .Kent.Beck mid 1990's is a Lightweight, Efficient, Low-Risk, Flexible, "predictable", Scientific and Fun discipline of software development. It leverages pair programming, pair negotiation. 

With self organizing, team are empowered and motivated by trust to their own decisions and commitment.
It's consensus driven with constant constructive disagreement driving the team development and success.

>Give faster results, right results, astonishing results

#### 5 core Values:

- Simplicity 
- Feedback 
- Communication 
- Courage 
- Respect 

#### Roles
We can map some of them with SCRUM roles:

- **Customer** is like the Product Owner
- **Programmer** is like the team but share ownership, does not test but deliver something fully functional (unit testing)
- **Tester** is understanding the behaviour of a the solution 
- **Coach** is part of Scrum Master also called *"batman"* referenced to british officer domestic at the front. The role diminish as the team mature
- **Tracker** is part of Scrum Master that tracks time

#### Individual practices

- Refactoring clean solution and keep functionality
- Simple Design
- Test-Driven Development create an automated test case that defines a desired new or improved functionality 
- Pair Programming real time pair review. live analysis, negotiation, collaboration, one is on the computer, and the other one give you directions

#### Team practices:

- Collective Ownership add value, no one is blamed, they care
- Coding Standard Make sure everyone uses the same language
- Sustainable Pace 40 hours week
- Metaphor a guiding vision to build innovation and create vocabulary of something that doesn't exist'
- Continuous integration All the developer are building and test coded software many times a day.

#### Organizational practices:

- Small Releases equivalent of the increment
- Customer close collaboration between everyone with Customer answering questions
- Planning Game


### Agile Lean

Lean says that activities that adds anything else but value for your "GOAL" are wasteful and thus need to be eliminated to keep only the value adding activities.
- Improve process velocity
- Shorten cycle times

ADHOC - is a unique solution that can not be generalized. It leads to risks

#### 7 Lean principles

- Eliminate waste
- Amplify learning
- Decide as late as possible
- Deliver as fast as possible
- Empower the team
- Build integrity in
- See the whole

#### 8 Waste types
The waste types are referred as D.O.W.N.T.I.M.E.

- **D**efects
- **O**ver production
- **W**aiting
- **N**on-under utilized talent
- **T**ransportation
- **I**nventory
- **M**otion
- **E**xcess processing


## Other frameworks

These frameworks can easily be integrated with other.

### TDD. Test driven development

In Test Driven Development you create the test first for that will be passed, or the features that you want.

First you write the test cases, the boundaries of your system.
Then you write the tests that verify the expected results of the test cases. 

It's mostly a development "framework" or rather a state of mind.
Where you start simple by creating a failing test, then implement the easiest / fastest way you can.
And finally you refactor, so your code stays clean and maintainable.

### FDD. Feature driven development

It is the art to have feature that add values (like pbi in the backlog)

- Domains
    - Subject areas
        - Feature lists
            - Features 'like user story in SCRUM'


**MVP** (minimum viable product) is what the product owner is given and that meets his need
**MMF** (minimal marketable features) is what answers the product owner needs and that can be sold
            
### DSDM. Dynamic Systems Development Method

It's the dynamic systems development method, and it comes from RAD (rapid application development)


## Other Agile Principles

### KISS principle

The KISS principle stands for:

- **K**eep **I**t **S**imple & **S**traightforward

Instead of looking for an overcomplicated solution, you should look for the easiest most direct way. 
Thus avoiding unnecessary complexity if possible. 
Have a simple version first, optimising it when every piece is working.

### Kaizen 

Kaizen (改善) means "change good".
It is a principle to continuously improve, and set up practices allowing that improvement to happen.

All the process generated from Kaizen be sum up into these steps:

- Define 
- Measure
- Analyze
- Improve
- Control

Out of the kaizen you can find those famous frameworks:

- Toyota kata which is a subset of PDCA (Plan, Do, Check, Act)
- Kaizen 5S (Sort, Straighten / Set in order, Shine, Standardize, Sustain)
       
### AM. Agile Modeling
Also called Xtreme Modeling, it was made by. Scott. Ambler

- Active Stakeholder to get feedback
- Architecture Envisioning clear vision for the future
- Iteration Modeling 
- JBGE (just barely good enough) simple, small documentation (mock up, picture)
- Parkinson Law (Work more than 50% on something, over analysing makes it lose value)
- Model Storming spike methodology
        
### AUP. Agile Unified Process 
This process is the lightweight version of the Rational Unified Process developed by Scott Ambler. 
The AUP applies agile techniques including test-driven development (TDD), agile modeling (AM), agile change management, and database refactoring to improve productivity.

- Step 1 inception 1 iteration
- Step 2 elaboration iteration 1 to N goal to have architecture
- Step 3 construction iteration 1 to N until you have enough value
- Step 4 transition validate that everything is working, deploy and make transition toward solution
