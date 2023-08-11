---
layout: post
title: Improving your <i>coding</i> process?
color: rgb(254, 21, 118)
tags: [agile]
---

Improving the coding process is not only what you code, which patterns you use, but also how you code. But before
considering improvement, you may want to use some metrics to measure your progression or assess the situation.

**Managers beware**, those metrics should be used for self-improvement and not a goal on its own. Becoming a coding monkey
🙈 while it looks good on a stat dashboard is not the _next evolution step_ for a developer.

I am exaggerating 🙃 _learned_ managers are also welcome. 
So in this article, let's talk about those metrics and the key indication they provide that may tip your coding process
to the next level. You may have your own opinion and different views on the subject as it's not a perfect science,
please share your insights in the comments for my pleasure to read it. 👀

> If you are working in a _Big Tech company_, this kind of metrics should be known to you. Let's look at them, what they 
mean and how it can be interpreted, so you get the best out of it.

## 1. Churn / Rework 🧮

Churn in business or with code is not associated with performance, quite the opposite. In Business, it's the rate of
attrition, meaning customers you are losing. In code, **it's the amount of time the same line of code is being changed**.

There's a time aspect in the churn metrics for code, the older the code is lesser of churn it becomes when modifying it.
It's usually set to calculate the amount of rework that is being done on the codebase. That's why [pluralsight][1] renamed
its metrics from _churn_ to _rework_, using business word to explain a technical concept was not talking to developers
in the end I guess 🤷‍♂️

### How can it be explained?

Churn can mean multiple things, for some of them it's reasonable or understandable for others it's a sign of a problem.
For example:

- **Prototyping**: High churn can be expected, because you don't know what you are doing yet.
- **Feature development**: Low churn can be expected, because on new properly design features you only need to write the code once
- **Dealing with legacy code**: Both high and low churn can be expected, 
  - High because it might be complex, and you can't fix it all in one go => Tech Debt!
  - Low because nobody has touched the code in a long time.

With that in mind, it will be easier to understand what may cause it and how to improve it.

### Where does it come from?

As you can see in the example, churn might not be avoidable, it could be due to the state of the codebase, in that context,
knowing about it is a good first step to start engineering a solution to bring it down. Either by tackling some
tech debt, identifying some unstable piece of the design, or re-evaluating it and its adequacy to solve the problem at end.

Now if there's a high churn, and it's independent of the context, then you may want to do a bit of introspection and 
review your coding process. It may not mean that you are doing a bad job, your process is very personal, and it could 
do well by you. Regardless, you may want to make sure you're not missing on something, here are some cues to look for:

- **Are you formatting your code properly?** 
  - Not consistent formatting may cause unnecessary changes, which makes the code hard to review and annoying to update.
  - Usually you'd want the whole team to have the same formatting rules that are automatically enforced.
- **Are you lacking information?**
  - Having a lot of changes to do due to code reviews may be a sign that you are lacking information on the feature to implement.
  - On this case, you may want to improve the grooming of the tasks make sure all questions are answered before starting it
    and not hesitate to raise a hand for help when there are still some unclear parts as you go through the implementation.
- **Are you changing the implementation midway?**
  - Changing your mind on how things should be implemented may be a sign that you haven't spent enough time thinking it through.
  - There's a motto _think before you code_, which van be accomplished by designing the solution beforehand, or follow the
  existing logic to see how the code is articulated before starting to implement the solution.

### Where does it fail?

For [TDD][11] (Test Driven Development), the premise is to write a failing test, then solve it, then refactor. So in this
case that churn statistic may be completely busted, let's say you commit on the failing test, then another commit on the
passing test and finally a commit on the refactor. Then your last commit is expected to have a higher churn since you 
are working on the lines.

Now then, you may hold your commit and only have one after the refactor is done, better we may advocate for one commit 
for the whole process since if you are on [master][10], then pushed commits should keep the pipeline green. 
It is possible but it has some drawbacks:

- On complex project, it's not that easy to perform the refactor part, not saving the passing state is like working 
without a net, and possibly do the work twice (it won't be shown on the churn stats, but it will be visible via another)
- It may create very big commits, which is not the preferred way.

The only to have it work, is when you are able to code in an environment where small iteration are possible, refactoring
can be kept small and that you know the codebase. In light of that, some may argue that in fact the stat doesn't fail,
however if it's low due to the environment you are working in rather than your coding process, then it is 
relatively less interesting for one's self-improvement.

## 2. Coding days 👩‍💻

If you have at least one commit a day.

### How is it counted?

Usually it's grouped by weekly blocks, meaning that if you push a commit on every business day of the week, 
then you have a coding days metrics of 5. 
Company would want to have at least x days of the week with commits, now if you have a 4-day week and they expect 5, 
then you may want to have a chat with your manager. 🙊

### What does it mean?

Now if you are in a situation where you can't commit, it might be due to one of those reasons:

- 1 **You are blocked**

You've been on a bug or feature for a while, and you are not making any progress. Consider pair programming, to get a 
fresh new set of eyes, or raise your issue during the daily or specific issue to get some help.
If you are blocked by another by an external dependency, then you could set check with the dependency when they will unblock
you, so you can park the task at hand to free your work stream and take on some ready work. (The goal is to make it clear
that the task won't be looked at until a set date, when it should be unblocked, so it doesn't cripple your work time)


- 2 **You are over-engineering things or down the rabbit hole** 🐇

For investigations or spike, you may want to time-box it (allow yourself a specific limited amount of time to do it) so
it doesn't become a time sink.
Remember the 80 / 20 rule:

> **80 / 20 Rule**:
> "_It usually takes 20% of the total time to achieve 80% of the forethought result_".
 
Meaning, the remaining 20% that will take 80% of your time may not be worth it in some situation. So it shouldn't need
to be perfect, enough to solve the problem at hand is sufficient.

- 3 **You are not committing often enough**

Let's go into the extreme committing everything all the time which would cause some churn, but you should be able to have
some small subset of the code that can be committed daily. If you are still in the process of implementing a feature,
then you may want to look for the parts of that feature that should not change anymore and commit it.
If that's not possible, then there's maybe some very small tasks (configuration change, typo, format, small refactor) 
which could be around. Be mindful that those may side track you and while your stats may keep up, the end goal of the
sprint/quarter/year may not be met.

- 4 **You are missing commit opportunities**

Some engineering work which do not seem to be granting you commit, may in fact be a good opportunity to update your
process. Documentation for once can be done via the code, diagram can also be written as code, and so on.
Investigation or support may also be a good opportunity to add missing tests, logs or refactor. They can also spawn 
support documentation to share with the team or the customer.
So keep on open eye for those! There should be some lee-way in your company to adopt some of those.

### Why isn't it perfect?

On a personal level, this one is hard to consider because it may depend on the context. Having access to the team or
company level average may help understand if it's a personal issue, a team issue or a company one.
When you can't find any focus time to get coding, then it might be because you are in an endless stream of meetings,
outages and other kind of interruptions.

There might be some action you can undertake to limit those, review your schedule to clear or delegate any important meetings,
push for work that will improve the system's stability to reduce the outages, and so on. BHowever, most of the time, you
will need help from the team, management or the business side.

When you are in a more senior level position and is expected to coach, be in meeting and code around 40% of your time,
you may end up with 40% of coding days as well. Being evaluated on a criteria that doesn't match your job description is
a bit unfair. In those roles where you are not expected to be coding all the time, but provide help so that everybody 
else can.

## 3. Commits per days 💾

This one represents the amount of commits you make in a day. 
But by amount of commit, it's rather the amount of time you push that commit to the remote repository. You can see how
this one can be conflicting with the churn metrics, getting your amount of commits high while keeping the rework low.

While you may commit multiple time locally, that may not enter into account in the calculation
depending on the measuring tool.

Which can make sense when at a company level, as an analogy it would be like writing mails but not sending them, sure 
they are written but until they are sent, can it be really counted as mail? 🤔 Not really I believe, it's the fact to 
send them, or push it that makes it count.

### How to deal with it?

You don't want to over commit (each modified as a commit 😩 please don't) neither do you want to commit too little
(like 500 lines a commit) for your day-to-day work. At home, for a release or on specific occasion, it may be fine but
we're more looking at a sustainable professional setting.

Use a standard coding format, for example:

```shell
TASK-123 Verb and sentence describing the commit
# Example: 
# USR-1502 Add new REST endpoint to retrieve user
```

Most developers do not have a major in literature, so it's fine if the commit message is not a masterpiece. The commit
message can be standardized within your team. I like the idea to put the ticket id at the beginning as it may help
with the traceability of the code. 

Now why it helps with the amount of commits, well that's easy! Since you need to describe what your code is doing and
you have a limited amount of character, you can't put too much code in one commit if you want the message to make sense.
As well as if the change is too small, or you have multiple small changes with the same commit message you could bundle
them in one. (Don't go for endless `Fix typo`, `Fix test`, `Fix import`, ... 🙏)

At the end of the day, it's also a habit maintain by your personal rigor, there are no wrong or right amount of commits
per day. It may vary depending on your job and company, but a known average according to [pluralsight][3] 
is around 3-5 commits per day.

But if you need or feel like you have to start doctoring your commit for your performance review,
then it's not a good sign for the company and an open discussion with management should really happen.


[0]: https://help.pluralsight.com/help/metrics
[1]: https://help.pluralsight.com/help/what-is-rework
[2]: https://help.pluralsight.com/help/commits-per-day
[10]: {% post_url 2022/2022-05-18-Version-control-git %}
[11]: {% post_url 2022/2022-02-17-Tips-and-tricks-for-code-reviews %}
