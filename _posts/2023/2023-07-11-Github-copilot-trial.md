---
layout: post
title: Testing GitHub copilot 🤖
color: rgb(54,45,85)
tags: [misc]
---

GitHub copilot is an AI that sometimes suggests some snippets to you, it tries to determine what could help based
on the context of the file(s) you are working on.

It's not limited to code, It also works with text completion, 
which can be useful when writing some documentation within the repo itself or for architecture documentation.

So for fun is going to be written with the co piloting mode ON 🙃 and when writing _GitHub copilot is..._ at the start 
of this article.
I could see all the marketing pushed to me with _heavy suggestion_ like "is... like pair programming with an AI"
or "is... a tool that helps you write better code" and even "is... like autocomplete but better". Which is a bit too much
of self-promotion right of the bat! 

{% include aligner.html images="copilot-promo.png" column=1 %}

Let's find out the nice quirks and annoying twirls of this AI. And it does suggest me emojis _...autocompletion ~>_ 
`, so that's a plus 😁.`

## How it works

GitHub Copilot works with the context of the file and repository you are working on, 
it will store up to the last 10 files you visited.
Besides, the machine learning model used by GitHub copilot has been trained with "_billions of lines of public code_"
according to the [website][2], from GitHub itself.

I don't have more information about the inner working of GitHub copilot, and it does not seem to be suggesting anything
about it. [Research paper][10] online were more concentrated on it efficiency and its suggestions based on code description
input. But if you do know more, let me know in the comment! 🤓

### Utilisation

It is integrated with your IDE, you download the GitHub copilot plugin, connect it to GitHub, and it will start.
You can disable it for certain language or certain repository. 

On IntelliJ on MacOS, you can use those [shortcuts][3]:
- <kbd>tab</kbd> to apply the suggestion
- <kbd>Option</kbd> + <kbd>]</kbd> to see the next suggestion
- <kbd>Option</kbd> + <kbd>[</kbd> to see the previous suggestion

I didn't find it that easy or reliable to navigate through the suggestions, but it could be that the IntelliJ plugin or
my settings that could be at fault. I haven't tried the VScode plugin, so I don't know if it offers a better experience.
You can still go through the suggestions by clicking on the copilot icon, so if the shortcut doesn't work, you are not
hopeless.

## The advantages

On library suggestion with javascript, to detect and give a good suggestion on what option to pass
in a library's constructor/function. (You may need to go to the plugin to refresh to get a better suggestion).

I tried it with [express and jwt][11], and it managed to give me some valid input for the options. (For example what
was to be passed in the [expressjwt][4] middleware).

It was pretty bad at first for simple autocompletion, but after some tries, it got better. For example, 
with some clear context, it can write the end of a line for you. If you ignore some missing columns, 
brackets or invented variable name, it's still better than what I was expecting.

For writing technical documentation in markdown, the AI is actually great, and provides some interesting suggestions.
If you're having a blank page syndrome, it can suggest you multiple entry points, to get started. 
So for an internal work document, it can be pretty powerful. 

However, for a blogging type of exercise, my worry is the underlying risks of 
plagiarism and the probable lack of originality that may occur. I would take any proposed fact with a grain of salt and 
look in the literature for confirmation. (I couldn't get copilot to give me its source directly 😣)

## The downsides

By default, it utilizes whatever you are typing to train itself, so you may want to manually update the confidentiality
settings in your profile to disable it.
I guess the downside is that it will be slower to learn from you, but it's rather hard to assess. 

I did find that the first few suggestions were either not useful or just plain annoying, so don't expect it to be
at full speed before a couple of weeks.

It can be totally off the marks with a suggestion that looks real but is actually not good at all. The longer the 
amount of line suggested, the more likely you'll have to revisit it. So don't expect it to do your work, (...wait, 
I guess that's a good point? 😅).

You can turn the _co-piloting_ off for some files, project or languages if it doesn't work in that particular situation.

Some suggestions can get in the way when you know what you are doing, and it tries to help for example:
- It will suggest some random copy/paste when the code you are working on has some similarities with another file. And 
since duplicating code is not a good practice, having as a suggestion encouraging it is not a good idea either.
- It seems to try to coerce you into writing some block of code, that may not be relevant or that goes in another 
direction than the one you want to take. I find it harder to focus on what you truly want to do when that happens. 
The copilot can mislead you into thinking that you are on the right track, when you are not.

With multiple people in a team using AI tools, it can be hard to review. The author may not fully understand
what the code is doing, or just dump whatever the tool suggested without further tailoring to it (Extra comments, 
unnecessary guard cases, different coding style, ...).

## Example

Before leaving for the conclusion, here's a small example trying to have the copilot write a fizzbuzz function for me.
Since it's a well known problem, suggestions should be easy to get with not a lot of explanation.

So I typed:
```ts
// write a fizzbuzz program
```

And that was not enough, but it did appear that the copilot understood what was the fizzbuzz problem, prompting me to
add more information.

{% include aligner.html images="copilot-fizzbuzz-input.png" column=1 %}

Which I did, adding each requirement in successive numbered bullet points. I am not a very good AI whisperer (which is
a new skill to make the AI do what you want it to do), but that description of the problem seemed to be very good, so
I was hoping for good suggestion after adding the 4 suggested steps:

```ts
// 1. If the number is divisible by 3, print Fizz instead of the number.
// 2. If the number is divisible by 5, print Buzz instead of the number.
// 3. If the number is divisible by both 3 and 5, print FizzBuzz instead of the number.
// 4. Otherwise, print the number.
```

And fiddlesticks! Still no answers, no code is being shown, could the copilot be pouting because of what I said earlier?
🥸 So I went directly into the suggestion, fiddling with the description to see what kind of result I would get.
The code was still not being prompted within the text file, so it's a two-click process to get the suggestions. And the
results were ... mitigated, it did have some fizzbuzz looking answers, some not working at first glance and some other
suggestion that were out of the mark totally.

{% include aligner.html images="copilot-solution-1.png,copilot-solution-2.png,copilot-solution-3.png" column=3 %}

Maybe it's because I used so many comments to describe the solution, that some suggestions were entirely commented, but
that reduced the _helpfulness_ of it.
Finally, the best result I had was when I started typing `function`, I guess after that copilot knew it was the real deal,
and I wanted to implement it.

{% include aligner.html images="copilot-fizzbuzz-final.png" %}

Now this is looking rather good. And maybe due to my incompetency, it took me way more time than expected, it did manage
to give a suggestion that worked displayed in the IDE "automatically". Don't expect it to be like that all the time, but
when it does work it's a bit satisfying. 🌞

## Conclusion

GitHub copilot has been out since [2021][5], so definitely not an early adopter opinion here, they've just announced a
new version with the latest [Chat GPT-4 model][7] in [March 2023][6].
It's a nice gimmick, and it has potential, I could see some helpful suggestion (it was not all bad), so 
let's see how the newer version fares. 🦾

But to be fair, the development game changer for me was with [IntelliJ IDE][9] which allows you to navigate through the 
code and libraries, have the correct autocomplete for the actual class and variables. 
On my day to day it brings much more value to me. It's not using AI, just the context of the code and style of the language.
If that "_fuller_" context was combined with an AI tool, taking into account the efficiency of the IDE, then the suggestion could become 
incredibly more accurate.

Let's see if [jetBrains][8] (the company behind IntelliJ) will come up with a solution of their own in the future! 👀


[1]: https://docs.github.com/en/copilot/quickstart
[2]: https://github.com/features/copilot
[3]: https://docs.github.com/en/copilot/getting-started-with-github-copilot
[4]: https://www.npmjs.com/package/express-jwt
[5]: https://en.wikipedia.org/wiki/GitHub_Copilot
[6]: https://github.blog/2023-03-22-github-copilot-x-the-ai-powered-developer-experience/
[7]: https://openai.com/gpt-4
[8]: https://www.jetbrains.com/
[9]: https://www.jetbrains.com/idea/
[10]: https://github.blog/2022-09-07-research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/
[11]: {% post_url 2023/2023-06-16-Typescript-and-express-jwt-validation %}
