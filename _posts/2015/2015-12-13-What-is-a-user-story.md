---
layout: post
title: What's a 📋 User Story?
color: rgb(42,140,152)
tags: [agile]
---

## User story

User Stories in [Agile][10] are a critical way to describe the work at hand, where the technical-focused team and none-technical
stakeholders can agree on what needs to be done.

It is usually written from the user's perspective.

User stories are at the center of many [Agile frameworks][2]. 
Although some considerations might differ slightly depending on the framework, let's look at it in an agnostic way.

### Write a user story

User story should be about a customer, what feature they want for the product, it's business oriented.
User stories can be built such as:

> **As** ..who..**, I want** ..what.. **so that** ..why..

Upon reading the user story, it is clear for anyone what should happen and why it is important.
This format can be cumbersome, but pushes to put the business value forwards. 

For non-functional requirements that do not impact the customer, the same technique can still apply, 
the persona (the "_who_") of the user story can be the team, for monitoring, alerting or other technical requirements.

User stories are validated with acceptance criteria, which can be written as:

> **Given** ..condition.. **When** ..action.. **Then**..expected reaction

This notation comes from the Behaviour-Driven Development (BDD) framework, 
but the acceptance criteria is a way to agree on what is expected from the story.

### DoR - Definition of Ready

The Definition of Ready is an artifact (like a declaration) that the team creates.
It contains the set of *minimum* conditions a user story must meet before being considered ‘Ready to be worked on’ by the development team.

It is set to avoid surprises during a sprint, and make sure the stories are properly refined.
Unclear user stories may result in _re-work_ or _waste_; an outcome that does not bring value.

Here is a small example of a _definition of ready_:
- User story described
  - Title or description contains: As a ... I want ... So that ...
- All unknowns must be cleared
    - All open questions have been answered
- Acceptance criteria defined
  - Expected functionality has been written as: Given ... When ... Then ...
- The story has been sized
  - The story has been estimated in story points

After a refinement meeting, the story decided ready could be added to the next iteration or taken by the team to be worked
on right away.
If a story is not ready, then it should not be picked up by the team and instead be scheduled to refine again.

#### Estimation and Story points

Story Points are the abstract way to consider the size of a task; they are used for [estimation][11].
It is not based on time because, depending on skill and experience, 
certain team members can finish the same task at different speeds.

Usually _the story points_ can be described using the fibonacci distribution to assess the number of points:
> 0.5, 1, 3, 5, 8, 12, 20+, ?

These numbers can change depending on the team, but here is how you can view them:
- 0.5 to 3: are tasks that can be handled in less than a single iteration
- 5 to 8: are tasks that can be handled in a full iteration (so it needs to be started at the beginning of it)
- 12 to 20: are tasks that seem too big and need to be broken down into smaller tasks
- ?: are tasks that are not estimable because there are too many unknowns, questions must be answered or tasks finished first.

It is easy to mix story points with days, but it's actually a team-centered metric that is independent of the time.
Since it's related to one team, you can't compare story points estimation between teams.

Story points are a way to gauge and refine the work. Add them to your refinement process as you see fit.

#### DoD - Definition of Done

The definition of done is an artifact similar to the definition of ready.
It contains the *minimum* conditions a story must meet before it is declared done. It is really important to make sure
that the completed work on a user story means that the functionality it describes is fully functional and tested.

It also ensures consistency, so that everyone has the same definition of what "done" means when finishing a story. 

As an example, it may include:

- User story is implemented and reviewed
- Unit tests were passed successfully
- QA tests were passed
- Meets the acceptance criteria
- Sufficiently documented
- Deployed to production

Depending on the context, you will want to update the definition of done to fit your team's needs.
Like the Definition of Ready (DoR), the Definition of Done (DOD) is a team artifact and can be updated or reviewed by 
the team when deemed necessary.

## Frameworks

The user stories are gathered, refined and prioritized through multiple workshops:

- Story-writing workshop
- Tres amigos
- User Interviews
- Backlog refinement

There are also some 

#### INVEST model

The [Invest][1] model signification to create user stories. 
Those characteristics help write a story that can be understood and implemented by the team.

- **I**ndependant ..._from other stories_
- **N**egotiable ...as _flexible and can be changed_
- **V**aluable ..._to the customer_
- **E**stimable ..._to gage the amount of work_
- **S**mall ..._to fit in an iteration_
- **T**estable ..._with acceptance criteria_
- 
#### The Extreme Programming 3C rule

The 3C rule to create and refine User stories from [Extreme Programming][10] (XP).

- Components 3C:
    - **C**ard: Small description of the story
    - **C**onversation: Discussion or questions to refine the story
    - **C**onfirmation: The criteria to consider the story done

Since it's easy to find words on _C_, you may see other words like _Construction_ or _Consequences_, getting added to
this one.
Also, depending on Lean, or different Agile framework, the 3C rules may refer to other words and could be unrelated to user stories.

#### Tres amigos

The tres amigos (Three amigos) come from the BDD (Behaviour-Driven Development) where
a Product Owner (PO) and two other people from the team will gather.

##### Explanation

- The PO represents the customer's view
- One team member, usually a more senior one, represents the development point of view, the technical aspect
- Another team member represents the quality insurance and looks at whom we can test it.

Out of that meeting, 3 things should come out:

- The questions on what we don't know.
- The rules or assumptions made on the feature.
- The acceptance criteria of the story: `Given ... When ... Then ...`

##### Example

Here is a short example, so you get the idea.

Story name: `As a customer I want to be able to buy a cookie with the app`

- Rules: The customer can't buy something with a higher price than what's in his account
- Question: How can we check the customer's account?
- Acceptance Criteria: Given the customer click on pay on the app the money goes he can buy the cookie
- Question: How can we assert that the cookie is bought?
    - Doesn't have to be just a `cookie` that is irrelevant and untestable. We can change the name of the story
    - We need to assert the money is out of the account transfer with seller account's number
- Revised Acceptance Criteria: Given the customer click on pay on the app, his money gets transferred to the seller account's number

#### MoSCoW

The MoSCoW model is to set priorities on User stories

- **M**ust priority 1
- **S**hould priority 2
- **C**ould nice to have
- **W**on't do low priority will not be implemented

Categorizing each story as either four will help prioritize the work.
Higher priority items usually bring the most values or can be represented as an MVP (Minimum Valuable Product) 
to answer the most pressing customer's needs first.

[1]: https://en.wikipedia.org/wiki/INVEST_(mnemonic)
[2]: https://scaledagileframework.com/story/
[10]: {% post_url 2015/2015-01-23-Working-with-agile %}
[11]: {% post_url 2016/2016-01-05-Estimation-in-Agile %}