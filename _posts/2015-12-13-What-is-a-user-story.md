---
layout: post
title: Estimation in Agile
color: rgb(42,140,152)
tags: [agile]
---

## User story

A bit more information about user stories.

### Definition

User story should be about a customer, what feature they want for the product. It's business oriented. 
The user stories are gathered through multiple workshops:

- Story-writing workshop
- Tres amigos
- User Interviews
- Observation
- Questionnaires

User stories can be built such as:

> **As** ..who..**, I want** ..what.. **so that** ..why..

User story are validated with acceptance test, test cases (+ non fonctional requirements)

> **Given** ..condition.. **When** ..action.. **Then**..expected reaction

### Creating the story

#### The 3C rule
The 3C rule to create User stories.
- Components 3C: 
	- **C**ard
    - **C**onversation
    - **C**onfirmation
- Lifecycles +2C:
    - **C**onstruction
    - **C**onsequences
            
#### INVEST model
The Invest model signification to create user stories.

- **I**ndependant
- **N**egotiable
- **V**aluable
- **E**stimable
- **S**mall
- **T**estable

### Grooming the story

#### DoR - Definition of Ready

The Definition of Ready is an artifact that the team creates 
which contains the set of *minimum* conditions a user story must meet before it will be considered ‘Ready to be worked on’ by the development team. 

It is set to avoid surprises during a sprint, example:

- User story described
- Acceptance criteria defined
- The story have been estimated

After a grooming, the story that is decided ready could be added to the next sprint during the sprint planning.
If a story is not ready then it should not go inside the sprint planning.

#### Tres amigos

The tres amigos (Three amigos) comes from the BDD (Behaviour driven development) where 
a PO, and two other people from the team will gather.

##### Explanation 

- The PO represents the customer's view
- One team member, usually a more senior one represents the development point of view, the technical aspect
- Another team member represents the quality insurance and look at who we can test it.

Out of that meeting 3 things should come out:

- The questions on what we don't know.
- The rules or assumptions made on the feature.
- The acceptance criteria of the story: `Given ... When ... Then ...`

##### Example

Here is a short example so you get the idea.

Story name: `As a customer I want to be able to buy a cookie with the app`

- Rules: The customer can't buy something with a higer price than what's in his account
- Question: How can we check the customer's account?
- Acceptance Criterias: Given the customer click on pay on the app the money goes he can buy the cookie
- Question: How can we assert that the cookie is bought?
    - Doesn't have to be just a `cookie` that is irrelevant and untestable. We can change the name of the story
    - We need to assert the money is out of the account transfer with seller account's number
- Revised Acceptance Criterias: Given the customer click on pay on the app, his money gets transferred to the seller account's number

#### Story points

Story Points is the abstract way to consider the size of a task. 
It is not based on time because some resource can finish the same task at different speed.

So we speak of size of work for a task using the a fibonacci distribution to assess the number of points:
> 0.5, 1, 3, 5, 8, 12, 20+, ?

These numbers can change depending on the team. 
Basically a task that take more than 12 points is too big and need to be breakdown. 
A task at 20+ points need to be send back to the PO for refinement.
A task that is not estimable because there's too many unknown can be used as a spike (timed experimentation during a sprint)

#### MoSCoW

The MoSCoW model is to set priorities on User stories

- **M**ust priority 1
- **S**hould priority 2
- **C**ould nice to have
- **W**on't do low priority will not be implemented

Prioritization is done with other tasks so you have a reference.

### Working on the story

The story can be decompose at any time in task if the need be.
Depending on your workflow, you might want to review or pair program.

But in any case, the story can only be done if it meets the DOD.

#### DoD - Definition of Done 

The definition of done is an artifact that the team derives that contains the *minimum* conditions a story must meet before a piece of work (or user story) can be declared done.

Gives everyone the same definition of a done story, it may include:

- User story is coded and reviewed
- Unit tests were passed successfully
- QA tests were passed
- Meets the acceptance criteria
- Sufficientrly documented
