---
layout: post
title: Decrypting developer's acronyms
color: rgb(147, 103, 26)
tags: [tips]
---

Let's have a look at some acronyms used in the IT vocabulary that does not refer to an actual technology
(like SQL). Let's look at the one that may be more abstract, referring to a code pattern or principles to apply
while approaching software development.

It's not exhaustive, feel free to point out any obvious missing ones, so that it can be added to this cheat sheet 🤓 

## Code Pattern

Those acronyms are usually used to describe how the code is written.
It is meant to be ordered so the most common are first.

### OOP

OOP: _Object-oriented programming_

This is a [vision of programming][1] where the code is structured around objects which can contain both logic and data.
Usually it's done via the usage of classes which are blueprints to create objects.

There are other paradigms for programming which are not using objects, for example _Functional programming_ which is based
on the usage of functions.

### SOLID

$$S.O.L.I.D$$ or [SOLID][4] is an acronym for the first [five object-oriented design][3] (OOD) principles by [Robert C. Martin][2] 
aka "Uncle Bob".
They were coined via multiple articles at the time for C++, which are worth reading to get deeper in what all of them implies.

1. **S**: _Single-responsibility principle._ 
  - A class should have only one job, one responsibility, one motive for change. 
  - This is to keep the code simple and modular.
2. **O**: _Open-closed principle._ 
  - This is to use interface and abstract class to avoid cascades of changes that may render the code un-reusable and fragile. 
  - Open for extension: Add new behaviour by extending or implementing the interfaces or abstract classes.
  - Closed to modification: You should not and would not need to modify previous implementation.
3. **L**: _Liskov substitution principle._
  - An objects of a superclass (type T) should be replaceable with objects of its subclasses (subtype S) without breaking the application. 
  - So that a method ($$\phi$$) using an object (t) of the superclass will still be the same when using an object (s) of the subclass.
  - As a [Theorem][5], let $$\phi (t)$$ be a property provable about objects of $$t$$ of type $$T$$. Then $$\phi (s)$$ should be provable for objects $$s$$ of type $$S$$ where $$S$$ is a subtype of $$T$$.
4. **I**: _Interface segregation principle._ 
  - This is to create smaller, more specific interface for each usage so that you don't have one class doing everything inherited everywhere.
  - You should not have a class implementing an interface with function it does not use. 
5. **D**: _Dependency Inversion Principle._ 
  - Used for bigger projects where the links between packages is done via interfaces or abstract classes rather than concrete classes.
  - Both higher and lower level modules are independent as they both rely on abstraction, making them more interchangeable.

This acronym is actually 5 in one, pretty packed with content. Some of those patterns have been created at a time when
you would write code in vim and didn't have powerful IDE like nowadays. 🤔 To be critical about the abstraction-based 
principle, those sometime hinder visibility on smaller projects or microservices where you don't intend to build a
monolithic software structure upon it.

### ACID

ACID: _Atomic, Consistency, Isolation, Durability_

Another acronym that is just a list of words arranged to make a cool name: [ACID][7]. 
This one aims to describe database transaction
that guarantees the data integrity despite any problem that could occur (power failures, errors, ...)

1. **A**: _Atomicity_
  - It ensures all-or-none rule for database modifications. 
  - Treating each transaction as one unit which either succeeds or fails and leaves the database unchanged. 
2. **C**: _consistency_
  - Data values are consistent across the database.
  - Meaning that you can only change the data according to the rules of the database (A non-null field can't be updated as null).
3. **I**: _isolation_
  - Two transactions are said to be independent of one another.
  - This is for concurrency so that any transaction can be executed independently.
4. **D**: _durability_
  - Data is not lost even at the time of server failure.
  - Once a transaction is committed, its effect is stored in a [non-volatile memory][8] which retains information even after a power failure.

While ACID properties seem like a must-have and are seen everywhere, it doesn't mean that none-ACID can't exist. By 
opposition, we have [BASE][9] (Basically available, Soft-Sate, Eventually consistent) which is named more for the 
chemistry reference than its actual property names.

### CAP

CAP: _Consistency, Availability, Partition_

The CAP Theorem for a distributed computing system was published by [Eric Brewer][10]. 
This [theorem][11] is used as deciding tool for most modern distributed computing systems with high volume of traffic
over the world. 

The theorem states that an asynchronous distributed computer system with a database can only guarantee two of those 
simultaneously:

- Consistency: Ever request will receive the most up-to-date response or an error.
- Availability: Every request receives a "non-error" response even when it failed (the response might not be the most up-to-date).
- Partition tolerance: The distributed system continues to work beside arbitrary packet lost and partial system failures.

You can't have all three, so choose wisely for your system the ones that will be the most predominant in order
to orient your architecture in the right direction.

In most cases you don't have [network partition][12] so your system can be both consistent and available. Partition 
tolerance, this is only relevant if you have a truly distributed system over multiple subnets talking to each other. So
the choice is usually easy: Consistency and Availability out of the three.

## Principles

Those acronyms are linked to writing code, but they are more focused on the process of
writing it. Those principles could be applied to more domains than IT. 

_"Simplicity is the ultimate sophistication."_

### KISS

KISS: _"Keep it simple stupid"_

A "backronym" for "keep it simple", meaning the acronym was created after the phrase was coined.
For `KISS` to actually work, they suffixed _stupid_ to make it "_keep it simple, stupid!_".

> It is a design principle noted by the U.S. Navy in 1960. <br>
> The KISS principle states that most systems work best if they are kept simple rather than made complicated; <br>
> therefore simplicity should be a key goal in design, and that unnecessary complexity should be avoided.
>
> from [wikipedia][6].

This obviously also applies in software development where you want to keep your system simple, so it's easier to 
maintain and requires less cognitive energy to follow.

### DRY

DRY: _Don't repeat yourself_

This one is also referred as Duplication is Evil (DIE) is another software development principle. It goes in the sense
of refactoring, keeping your code clean by avoiding duplication.

The principle as [formulated][14] is actually "Every piece of knowledge must have a single, unambiguous, 
authoritative representation within a system" and as stated, a single representation leaves no room for duplication.

From this principle, some patterns and libraries have emerged, like those code generators which by an annotation will 
automatically create code for you. Beware that while useful in some cases, it might create more code than you need, which 
is an excellent transition for the next acronym!

### YAGNI

YAGNI: _You aren't gonna need it._

This one has been coined by [Martin Fowler][13] and is used in [Extreme Programming][15] (XP) which is an agile software
development framework using pair programming at its core.

This one is a corollary to _KISS_, to keep it simple, don't add what you are not going to need it. Now that it's written
that way, how complex must we be for both principles to imply not to do too much. 🌞

This one balances out parts of the _SOLID_ principle which can be useful but might not be required in some cases.


[1]: https://en.wikipedia.org/wiki/Object-oriented_programming
[2]: https://en.wikipedia.org/wiki/Robert_C._Martin
[3]: https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design
[4]: https://en.wikipedia.org/wiki/SOLID
[5]: https://en.wikipedia.org/wiki/Liskov_substitution_principle
[6]: https://en.wikipedia.org/wiki/KISS_principle
[7]: https://en.wikipedia.org/wiki/ACID
[8]: https://en.wikipedia.org/wiki/Non-volatile_memory
[9]: https://en.wikipedia.org/wiki/Eventual_consistency
[10]: https://en.wikipedia.org/wiki/Eric_Brewer_(scientist)
[11]: https://en.wikipedia.org/wiki/CAP_theorem
[12]: https://en.wikipedia.org/wiki/Network_partition
[13]: https://martinfowler.com/bliki/Yagni.html
[14]: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
[15]: {% post_url 2015/2015-01-23-Working-with-agile %}
