---
layout: post 
title: Tips and tricks for code reviews 
color: rgb(129, 163, 202)
tags: [agile]
---

Code review is time-consuming...

Good code reviews can help a fellow developer improve, find gaps in the system and
increase the overall quality. Fast reviews where you barely read the code is a waste of time.

- So how to make good code reviews _faster_? 

Here are some non-exhaustive advices for code reviews, to tackle them with speed while remaining helpful.
Keep what makes sense in your context, discard the rest or make your point in the comments. 👍

## What to look for

But first let's have a look into [what to look for][4] in a code review. When writing a comment, don't be a bully
🙇‍♀️! 
Remember [_Linus Torvalds_' apology][12] for being one at the head of the Linux coding community.

### ✍️ Typo and naming 

For example, have you ever written "_desing_" instead of "_design_" in a technical document? Maybe not, but that's a fair
error to spot in texts and documentation.

But it's also very important in class names, schemas and such to keep the *naming* consistent with the codebase. 
More on that over the next sessions where guidelines are a useful tool to state what is the standard, so name can be consistant with it.
The same way, you don't want overcomplicated or too long to read variable names.

Or most critically in configuration files 😱 where it can all come crashing down because of a missing space!
So be mindful of the type of "_code_" you are reviewing.

### 📚 Design and Guideline

Make sure your code follow whichever guideline is in place in the codebase, be it an open-source project or within your
company. There should be clear pattern or preferred technology, and it's easier to stick with it than stray away.

> For example in the [Apollo GraphQL 👩‍🚀 mutations][9] article I go over some industry standards for the GraphQL mutations,
> but you could write your own for your [events][10] or the [log level][11] or anything that's relevant to your codebase.
> It can be on a `CONTRIBUTING.md` in open source repositories.

Make sure that the whole implementation make sense, it avoids duplication and that there's no hole into the design, that
would lead to re-engineering the solution.

The coding style is also important, because you don't want your reviews to be interfered with space changes or minor change
like that old the time. The codebase needs consistency, but more to that on the _don't over nitpick section_ below.

### ⚙️ Complexity

A bit different from the design, here is more about a particular solution is implemented. You may for example add some
refactoring advice to simplify some nested ifs or use some pattern.

It's also to make sure that the code can be easily understood at a glance, if you need to focus too much to follow
what's going on it may likely be because it's _too_ complex. Sometime complexity is inherent to the task at hand, so
let's do our best to make it simple. (cf. [cyclomatic complexity][7])

Because as good as you are, you may not remember in 3 months from now what the code was doing, and that will become
harder, as time passes, to maintain it.

### 🏗 Tests

Testing is an important part of programming, and poorly written tests are useless and harmful to the system, as it
provides a false sense of security when implementing new features. To avoid that, make sure to take a bit of time to
review some key elements of the tests:

- _Do they have clear name?_
    - It should be easy to see what they are testing
- _Are they short, simple enough?_
    - Big tests function are hard to read and to maintain, write your test as your write any other code
- _Do you see any missing test case?_ (Check the code coverage percentage)
    - It could be an edge case, or some missing unit, integration and e2e tests (cf the test pyramid)

Then make sure your test are maintainable and that they won't break on each change in your implementation. You want to
test the behaviour of the code and not the code itself. Make sure that there's no dependency between your tests or
external factors that could render it flaky:

```js
// ❌ Flaky assertion, Math.random() gives a number between 0 and 1
expect(Math.round(Math.random())).toBe(1)
// ✅ No flakiness, a number will always be expected
expect(Math.round(Math.random())).toEqual(expect.any(Number));
```

Here would be a simple example for a flaky test, usually it's not that obvious.

## Enforce the process

A code way to code review is to avoid unnecessary code reviews.

For that you need to focus on enforcing some kind of development process, an agreement with your team on how to write
code and which state it should be in before the review.

> *Note*: For [pair programming][8] the review loop is instantaneous,
> so there's no "_formal_" review step. It's a continuous review as part of this programming process.

The usual use-case for code reviews is for feature request, in branches. So let's set that as our context.
⚠️ This is an opinionated article, so do exercise the critical thinking ability you might have bragged about
in your CV and cover letters.

### ❌ Don't review when CI/CD Failed

Make sure to run your tests locally before pushing, the pipeline should always be passing.
When failing, the code is likely to change again for it to pass.

There's no clear solution for this one, as it really depends on your development workflow,
branch vs trunk based strategies. Developers should wait until the pipeline has run before 
submitting their code to review, ideally they should have manually test it as well.

If you want a review for a quick feedback, you should consider some design meeting or [pair
programming][8] instead which would help you get started on new features.

### ❌ Don't review untested code

Nowadays, you can't get very far into programming if you don't know how to test your code properly. The tests shouldn't
be something painful you rush at the end, because they may reveal edge cases or flaws in your algorithms. Those will
most definitely lead to changes in your code.

> For the case of API interfaces (or schema like in GraphQL or Kafka), those may be part of a technical document and should be code reviewed ahead of implementation.

#### How to fix it?

Prefer TDD development process to avoid this case

How to implement (TDD):

- Start slow, make a unit test first for a tiny bit of it
- Add more use case as you add features
- Keep the pipeline green, _it should pass at each push_
- Refactor your code to make it better
- Think about corner cases
- Create an e2e test that will validate your implementation

### ❌ Don't over-review with "_nitpicks_"

Another trap of code reviews, is that people may not code the same way you do. Pushing your perfectionism or personal
feeling about how code/syntax may not bring the most value. Worst it could become toxic and reduce the code reviews
efficiency.

#### Example

If you are still puzzled about _nitpick_ check the [Google code review documentation][1]
Depending on your coding style what you consider mandatory can be nitpicking for someone else. Here is an example:

```js
// 💬 All ifs should have brackets
if (isNewFeatureEnabled) displayNewFeature();
// ✅ LGTM
if (isNewFeatureEnabled) {
  displayNewFeature()
}
```

Without entering an "_anything goes_" mindset where you don't pay attention to the implementation at all, both
implementation seems ok in my opinion and do not necessarily justify a comment.

But on another hand consistency in the code and the syntax is important, and maintaining a certain style within the
project is key to its sustainability. So how do we balance between _nitpicks_ and mandatory style issues?

#### How to prevent it?

Styling issue, and most susceptible _nitpicking_ prone issue should be addressed at the source during development rather
than at the code review:

1. Have a clear style guide for the project you are working one, clear written rules or examples are easier to follow
   and refer to.
2. Adopt other naming, coding standards
3. Automate as much as possible (use tools like [flake8][3] for python or [eslint][2] for NodeJS)
4. Make sure everyone uses the same syntax rules on their IDE (for space and formatting)
4. Fix your codebase with those new rules (can be an iterative process)
3. Be flexible and let go of the unnecessary

To maintain a fast rate of code reviews and merges for PR, it's crucial to focus our time on reviewing and pointing out
the critical while preventing ourselves to get distracted by minor things. All of your PRs don't have to be perfect 🙂

## When should you code review?

Code reviews need to happen, your team velocity might depend on it. So you need to be able to easily find reviews
available, leverage the tools you are using like [GitHub][6], GitLab or with Gerrit, all have visuals for tracking PRs.

Then you can find your own pace, like an hour each day, each couple days, or after each time you put a PR for review.
Anything as long as it works for you.

Remember, asking a question about a functionality or a point in the implementation is as valid as any other review,
because ultimately you gain knowledge and might even inadvertently spot some gap in the design, so keep at it! 💪

What about you, what is your code review style?

[1]: https://google.github.io/eng-practices/review/reviewer/standard.html
[2]: https://eslint.org/
[3]: https://flake8.pycqa.org/en/latest/
[4]: https://google.github.io/eng-practices/review/reviewer/looking-for.html
[5]: https://martinfowler.com/bliki/TestPyramid.html
[6]: {% post_url 2021/2021-12-16-Automate-your-process-with-github-api %}
[7]: https://en.wikipedia.org/wiki/Cyclomatic_complexity
[8]: https://en.wikipedia.org/wiki/Pair_programming
[9]: {% post_url 2021/2021-12-06-Apollo-graphql-mutations %}
[10]: {% post_url 2021/2021-10-25-Event-sourcing-101 %}
[11]: {% post_url 2020/2020-04-24-Java-logging %}
[12]: https://thehackernews.com/2018/09/linus-torvalds-jerk.html
