---
layout: post
title: Chess rules ♜
color: rgb(63,105,170)
tags: [java]
---

## Chess Rules

### Generic Chess Rules

Some of the generic rules that you can find on [wikipedia](https://en.wikipedia.org/wiki/Chess):

- White always starts first.
- King ♚ can't move to a "check" case.
- If King ♚ can only move to checked cases then it's "checkmate"
- If the player has to move, but all of his moves are checked cases, then it's "stalemate"


### Pawn Specification

- Castling: This is when King ♚ goes to the available case of its color before an untouched Rook. 
When castling, the Rook jumping over the King next to it.
- Pawn promotion: A pawn ♟ becomes Queen ♛ if they reach the other hand of the board.
- "En passant": Pawn can advance two cases when first move.
  - *En passant* is a way to capture a pawn right after it mades its two cases move, going diagonal behind it with another pawn.

{% include aligner.html images="en_passant.gif" %}

## Notation
### Algebraic Notation
It's the [method](https://en.wikipedia.org/wiki/Algebraic_notation_(chess)) for recording and describing the moves in a game of chess.
I will put here the main characteristics:

- **Movements**
	- Be5 : move Bishop to e5
	- c5 : move pawn to c5
- **Captures**
	- Bxe5 or B:e5 or Be5: : Bishop capture the piece on e5
	- exd6e.p. : pawn in e capturing another pawn *en passant* resulting in it going to d6.
- **Disambiguating moves**
	- Ngf3 : Indicate the letter (referred as *file*) of the source case (knight in g to f3).
	- N5f3 : If not enough, use the number (referred as *rank*) of the source case (knight in 5 to f3)
	- Qd5f3 : If the above is not enough (when with multiple pawn promotion for example: Queen in d5 to f3)
	- The capture indication should be placed in between the coordinates
- **Pawn Promotion**
	- e8Q or e8=Q : Pawn moved to e8 and got promoted to Queen 
- **Draw offer** *Not part of the Notation*
	- (=) : Submitting a draw offer to the opponent 
- **Castling**
	- 0-0 : Means castling toward the king side
	- 0-0-0 : Means castling toward the Queen side
- **Check**
	- † or + : to indicate the opponent's king is in check
- **Checkmate**
	- ‡ or # or ≠ : to indicate checkmate
- **End of game**
	- 1-0 : the white side won
	- 0-1 : the black side won
	- ½–½ : it's a draw

### Board

The board is a 8x8 checker wuth coordinates:

```
      a  b  c  d  e  f  g  h

  8   a8 b8 c8 d8 e8 f8 g8 h8 
  7   a7 b7 c7 d7 e7 f7 g7 h7 
  6   a6 b6 c6 d6 e6 f6 g6 h6 
  5   a5 b5 c5 d5 e5 f5 g5 h5 
  4   a4 b4 c4 d4 e4 f4 g4 h4 
  3   a3 b3 c3 d3 e3 f3 g3 h3 
  2   a2 b2 c2 d2 e2 f2 g2 h2 
  1   a1 b1 c1 d1 e1 f1 g1 h1 
```

And you place the pawns like followed:

{% include aligner.html images="chess.png" %}

## Implementation

### Process

To implement such a game, you could start simple and follow TDD (Test Driven Development).
For that you would start by writing a test for a simple feature, then expand and add more feature.

At each step, you first write a failing test, then make it pass, to finally refactor.
The refactor part lift of the "over thinking" that may happen in the _"make it pass"_ phase.
Because first you want it to work, then you can think about any pattern, or how to make the code more readable / thinner / coherent.

That way you can come move fast and write only necessary code. You can check _Refactoring_ by [Martin Fowler](https://martinfowler.com/books/refactoring.html).
It's a well known book about what is refactoring and how to apply it.

### Example: Have a pawn on the board

You could start with a basic test, you don't need it to be perfect.
As you write your test, the classes, and objects does not exist yet, 
so you can go as you want. 

```java
 @Test
  public void boardCanHavepawnTest() {
    ChessBoard board = new ChessBoard();
    pawn pawn = new pawn();
    board.add(pawn, "d7");
    assertEquals(pawn, board.get("d7"));
   }
``` 

Then you can start implementing. I won't go into details there, as you go the code may evolve, 
and you may also refactor the tests as you may not want to have the `ChessBoard` instantiation done in a `before()` method.

You may want to cover the _"unhappy"_ path too, for example trying to add a pawn in `a9` which is not a valid position.

### Example: To go further

Then once you can have pawns on a board, you can think about what could be the next steps:
  
  - Have a pawn move on the board
  - Have a pawn take another pawn
  - Add specialization (knights, tower, bishop, ...) which moves
  - Add the White / Black type of pawn 
  - Add the possibility to take another pawn
  - Add the custom moves possibility

And then you can be me more fancy and add some display feature, or save feature, etc ...
Each time following the same principle of writing a failing test, make it fail and refactor. 

