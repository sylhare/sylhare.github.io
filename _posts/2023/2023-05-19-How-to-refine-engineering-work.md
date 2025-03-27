---
layout: post
title: How to refine engineering work
color: rgb(242, 82, 68)
tags: [agile]
---

Refine is the new way of saying "_groom_" to prepare a task for work. Be it from a business standpoint where the
product owner equivalent details the need of the customer to the actual story or task coming from it.

Refining is not easy, because you have to balance between spreading the knowledge to the team while limiting unnecessary
interaction. You want the refinement meeting to be a collaborative place where everybody contributes to the better 
understanding of the work to do.

It's called "engineering" but as a broader term for IT related engineering work, it may work for other type of
engineering work, if you've tried it, let me know in the comments 👍

## The Agile team

We'll be using some mixed "agile" terms here. But some tips could be applied up to a certain extent to 
different situation. You can check this [article][10] for a refresh on some agile notion.
Take what makes sense and adapt it for your workflow.

Let's look at what's necessary for our team:

- Product owner for the one in charge of the business requirements
- Technical Lead(s) for the people that knows more about the technical aspect of the product and could come up with an
  architecture or design to solve the business requirements
- The development team for the rest of the people on the team.

You can also have in your development team some "QA" (Quality Assurance) that can do a range of things from
manual testing 🫣 to automation tests which gives feedback on the work at hands in a more down to earth 
user based view.
In some case you may have a facilitator, either a dedicated person like an agile coach or someone from the team which
will make sure that the meeting doesn't get stuck and move smoothly.

## Refine your engineering work
### Build your roadmap

First, before meeting with your team, your roadmap should be clear. It usually belongs to the product owner
based on the vision of the leadership.
It is typically vague technically and looks like a list of "milestones".
In roadmap, we often talk about value streams (what feature is going to bring value to the company) and
MVP (minimum viable product, to deliver new features fast). 
New features is typically easy to sell in a roadmap, but there are also some critical feature enabling work 
to consider which do not directly produce value to the customer but enables to produce more/reduce costs and so on.

> The whole team doesn't need to participate in building the roadmap, however the technical lead should be
> counselling the business side on how feasible it is, and raise flag if the time estimation is not too tight

The roadmap is important for **priorities**, you want to work on what is going to bring revenue to the company.
And at the team's level it is what they should be focused on first to be successful.

Each milestone of the roadmap can usually be broken down into smaller encapsulated chunks which can be shipped
on their own to the customer in production.
Now that the roadmap is built, that's where we introduce the [concept of epic and user story][12] to help break down the work.

### Build your backlog

The backlog, is where the work of the team is situated.
When a new milestone comes in from the road map, you should have the product owner introducing it to the team.
Everyone can ask business questions and challenge it, so it can become less abstract.
The team needs to have concrete work represented by epics.
A business need may come second to a tech debt or other technical change in order to make it happen.

The work should flow and be split then broken down into smaller pieces, here is a flow chart to make
it visual:

<div class="mermaid">
flowchart TD
    A[vision] --> |becomes| C{Team\nRoadmap}
    C -->|splits into| D[Epic 1] 
    C -->|splits into| E[Epic 2]
    C -->|splits into| F[Epic 3]
    D -->|breaks down| S[Story 1]
    D -->|breaks down| S2[Story 2]
    D -->|breaks down| S3[Story 3]
    D -->|breaks down| S4[...]
</div>

On bigger team, the splits of epics and stories can happen in subgroups, but usually supervised by
a technical lead or a subject-matter expert (SME) to answer questions and tilt the balance for decisions.

Once the epics are clearer, it gets easier to create from it the different user stories which will be key
to the refinement process. Once the epic is broken down, we create the most obvious pieces of the
solution as user stories with a minimum of information as they will be reviewed later during the 
team's internal refinement process.

### Refinement process

#### Pre analysis

As you've seen refinement of the engineering work can be scoped quite wide from the source, 
depending on your level and job in the company you might not be involved in every step.

Here's the flow chart with techniques to use in order to refine the work at 
every step we talked so far:

<div class="mermaid">
flowchart TD
    style DC fill:#d3d3d3, stroke:#cbcbcb
    style DE fill:#d3d3d3, stroke:#cbcbcb
    style DS fill:#d3d3d3, stroke:#cbcbcb
    A[vision] --> |becomes| C{Team\nRoadmap}
    C -.->|refined with| DC(Value Stream,\nCustomer feedback\nMVP)
    C -->|splits into| D[Epics] 
    D -.->|refined with| DE(Tech Designs,\nUser journey,\nSpike,\nTeam feedback)
    D -->|breaks down| S[Stories]
    S -.->|refined with| DS(Description,\nDiagrams,\n Acceptance Criteria)
</div>

We **don't** need to have the full team meeting at every step of the way!

Drawing on the board, or via a tech design what the technical solution is and how it should work to deliver the new
functionalities is a good way to share understanding to the rest of the team.
If you need buy-in to the full team before starting to create the work you can organize a session to present the
solution and make sure that:
- Everyone understands the solution
- Everyone is on board
- There's not a flaw or missing spot in the solution

Pre-analysis on each step of the way makes it easy to create stories, have base information in the ticket which will
help speed up the actual refinement process where the team reunites to decide on the work at hand for the next iteration.
If you are still a bit puzzled, find out more about the [definition of ready][12] (to work on) 
and [definition of done][12] to better prep your stories.

#### Iterative backlog refinement

The part of the refinement process that is recurring where you need the bulk of the development team to review and 
agree on the work to do. With the previous pre analysis they should mostly be well-defined in the backlog.

To make it efficient, because nobody like long boring aimless meetings 🤢 you may want your Product Owner to:
- Make sure the priorities are straight (matching our goal, and expected deliverables)
- Have an agenda with the $$X$$ number of tasks to review (only a few items)

Knowing in advance which tasks/stories are going to be discussed gives no excuse for the team not to be aware of the
tasks, they take on their own time to understand the requirements, and add comments to discuss during the meeting.

Then during the meeting, the team should go through each item making sure that the work is clear, address any point raised
in the comment (which can lead to more stories or add clarification into the ticket).
Usually we want the work to have acceptance criteria, like a bullet point list of things to do in order
to consider the story done. This help to reduce scope creep, and facilitate testing.

## Conclusion

This is a wider look at how work ends up in the team's backlog and how it can be controlled from
the leadership's roadmap to the team output with some technical meetings to design the solution
and a recurring refinement meeting to look over the current tasks to work on.

While refining the work, you may want to involve more people, with regard to efficiency you also don't want to cripple
the development team with too many meetings where their input is either redundant or not necessary. The pairing of a
junior and a senior developer on the pre analysis tasks can be interesting to get a better knowledge penetration and 
have a documentation that can be understood at each level.

You don't want to build up too much inventory in terms of work item as the team may not remember 
it when it comes to it, but you need to find a balance so there's always something to do.

[10]: {% post_url 2015/2015-01-23-Working-with-agile %}
[11]: {% post_url 2015/2015-11-10-Overview-Scrum-framework %}
[12]: {% post_url 2015/2015-12-13-What-is-a-user-story %}
