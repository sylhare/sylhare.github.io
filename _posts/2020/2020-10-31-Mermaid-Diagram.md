---
layout: post
title: Use mermaid-js 🧜‍♀️ to draw diagrams
color: rgb(181,223,214)
tags: [open source]
---

[Mermaid.js](https://mermaid-js.github.io/mermaid/) is a js library that transforms text into diagrams
(sequence, Gantt or class diagrams, flow charts, ...).

So far the ones that I am particularly keen on using are the sequence diagrams, you can find all the documentation,
on the mermaid [site](https://mermaid-js.github.io/mermaid/diagrams-and-syntax-and-examples/).

Try the [online editor](https://mermaid-js.github.io/mermaid-live-editor/edit/) for a quick look at the possibilities.

## Sequence Diagram

So let's have a simple example. We will be mapping with some notes and colors the simple call flow of a client talking
to an app. This is pretty basic but covers most of our daily needs.

Writing down in a simple mermaid script a call flow:

```bash
sequenceDiagram
  participant C as client
  participant A as App
  participant B as Database
  rect rgba(216,240,232, .7)
  C -->> A : Init connection
  A -->> C: Acknowledge connection
  end
  C ->> A : Send request
  Note over C,A : Each request have a unique ID
  A ->> B : Query the database
  opt Concurrency
    B -->> B : Other operation occuring in the database
  end
  B ->> A : Retrieve information
  Note left of B: Retrieve time < 10ms
  A ->> C : Send requested information
```

By default, gitlab understand the Markdown formatting `mermaid` so it's pretty straightforward in your markdown file.
But elsewhere like in this blog I am putting the above syntax in a `<div class="mermaid">` so that it will get picked up
and rendered.
(Kramdown which is the highlighting engine for jekyll and GitHub is not yet mermaid compatible).

And here it is the rendered diagram:

<div class="mermaid"> 
sequenceDiagram
  participant C as client
  participant A as App
  participant B as Database
  rect rgba(216,240,232, .7)
  C -->> A: Init connection
  A -->> C: Acknowledge connection
  end
  C ->> A: Send request
  Note over C,A : Each request have a unique ID
  A ->> B: Query the database
  opt Concurrency
    B -->> B: Other operation occurring in the database
  end
  B ->> A: Retrieve information
  Note left of B: Retrieve time < 10ms
  A ->> C: Send requested information
</div>

### Cheat sheet

#### Basics

The Basic, like using tabs and `sequenceDiagram` to create a sequence diagram. You can also `autonumber` to add a number
to each step of the sequence.

> Note that `%%` is used to add comments and won't be rendered.

And here is some cheat-sheet for the things you can do with it.

- Participants with just letters: `participant C as client`
- Specific squared actions with _par_, _loop_ or _opt_ blocks
    ```bash
    [ par | loop | opt ] title
        ... content ...
    end
    ```
- Add block of notes in yellow using. If multiple actors, use the comma to separate them (usually when you want your
  note over multiples actors).
    ```bash
    Note [ right | left | over ] of [ Participant ]
    ``` 

#### Lines

Lines are basically the steps in your sequence diagram:

- You have the syntax looking like that:
   ```bash
  [ Participant ] [ Link ] [ Participant ]: Message.
  ``` 
- If the Participant is the same, the line will just kind of loop on itself (like with database step above).

For the lines it always has `-`:

- Two dash `--` means dotted (like `-->`)
- Two chevrons `>>` means arrow head (like `->>`)
- A cross `x` means cross in the arrow (like `-x`)

You can also have a `+` or `-` that will create a box at the edge of the link to indicate it's _activated_ or _
deactivated_.
