---
layout: post
title: Binary analysis with Angr and Radare2
color: rgb(42,41,62)
tags: [ctf]
---


## Introduction

We'll work on a binary file called 'serial'. And since binary analysis is not so super fun for everybody 🤖.
I decided to add some challenge and selected this special binary from a ctf (capture the flag) challenge.

So Serial is a reverse engineering ctf challenge from SHARIF UNIVERSITY CTF 2016 worth 150 pts.
The goal of this challenge is to find the right serial number which will be the flag.

Like:

```bash
./serial s0m3th!ng
>> Yeah you found the flag!
```

And in this example, _s0m3th!ng_ would be the flag. 
You don't know it in advance, so you'll have to find it.

### Write-up Sources

I chose this one because it had a lot of write-ups, including one with angr,
So it would be a good choice to practice with radare2 and angr with a chance of succeeding
while being a total beginner.

- [xil.se](https://github.com/xil-se/xil.se/blob/cbeb4ecc509b0590a7c246096a45e132fe8ce32e/content/post/sharifctf-2016-re6-serial.md)
- [grazfather](https://grazfather.github.io/posts/2016-02-06-sharif-ctf-re150-serial-writeup/)
- [0x90r00t](https://0x90r00t.com/2016/02/07/sharif-university-ctf-2016-reverse-150-serial-write-up/)
- [Michael Bann](https://bannsecurity.com/index.php/home/10-ctf-writeups/29-sharif-university-ctf-2016-serial)
- [Aldeid](https://www.aldeid.com/wiki/SharifCTF-2016/serial)


## Reverse engineering

I will be using file, strings, binwalk, radare2 and angr for the binary analysis and reverse engineering.

### References

Whenever you see something `0x45` it's a hexadecimal representation of a byte.
Here are the common registers in memory:

| 8-byte register | Bytes 0-3 | Bytes 0-1 | Byte 0 |
|-----------------|-----------|-----------|--------|
| rax             | eax       | ax        | al     |

> When there's a `r` it is a register so 8 bytes, when it is a `e` it is bytes 0 to 3.

Commands in assembly:

- `lea <destination> <source>` : load source adress into destination
- `mov <destination> <source>` : Move source address into destination

```bash
    mov     bx, 0C3EEh  ; Sign bit of bl is now 1: BH == 1100 0011, BL == 1110 1110
    movsx   ebx, bx     ; Load signed 16-bit value into 32-bit register and sign-extend
                        ; EBX is now equal FFFFC3EEh
    movzx   dx, bl      ; Load unsigned 8-bit value into 16-bit register and zero-extend
                        ; DX is now equal 00EEh
```

- `cmp <value1> <value2>` : Compare source value1 with value2
- `je <address>` : Jump to the specified address if the above comparison is equal
- `add <destination> <value>` : Add the value at the destination address value.

Common assembly registers:

- rax - register a extended (for data)
- rdi - register destination index (destination for data copies)

Ascii tables with hexadecimal and char values:

- [ASCII Table](http://lwp.interglacial.com/appf_01.htm)

### Pre Analysis

First, we are going to explore a bit into this binary with our simple tools in case the flag is easy to get:

```bash
file serial
>> serial: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.26, BuildID[sha1]=77e92e8b1bd4f26641bab4dbf563037a7b9538d2, not stripped
```

So we can see the type of file, and that it's actually an executable, then we can check for strings in it.
We don't see any _flag_ or _{s0m3th!ng}_ that would be the flag only

```bash
strings -o serial | grep 'valid'
   3500 Please Enter the valid key!
   3529 Serial number is valid :)
   3556 Serial number is not valid!
```

Use binwalks to scan the file for a specific sequence of bytes:

```bash 
binwalk -R serial
```

Unfortunately, the _flag_ can't be found that easily.
We will need to do some analysis ...


### Analysis with radare2

First we need to analyse with `aaa` with radare2.

#### Overview of the binary

That's the time when we look at the disassembled main to understand what is happening.
Radare2 is excellent at deciphering through the assembly instructions, 
We can view the disassembled view with `pdf @ main` 

We can deduce that the variable s `rbp-0x200` is the entered input here. 
Shortly after that we can see that its length is checked `strlen`, the serial number should be 16 `0x10`.


```groovy
|           0x00400a19      488d8500feff.  lea rax, [s]                ; load rax with the value of s
|           0x00400a20      4889c7         mov rdi, rax                ; const char *s
|           0x00400a23      e828feffff     call sym.imp.strlen         ; size_t strlen(const char *s)
|           0x00400a28      4883f810       cmp rax, 0x10               ; compare with 16
|       ,=< 0x00400a2c      740e           je 0x400a3c                 ; jump when equal to 0x400a3c 
```

#### Finding some constraints


Then we can see that the first byte `al` of the input is compared with `E` (1 ASCII character is 8bits -> 1 byte).

```groovy
|       `-> 0x00400a3c      0fb68500feff.  movzx eax, byte [s]         ; Move the 4 bytes in memory in [s] into EAX
|           0x00400a43      3c45           cmp al, 0x45                ; compare the first byte with 'E' ; 69
|       ,=< 0x00400a45      740e           je 0x400a55                 ; jump when equal to 0x400a55
```

Then a hard coded value `var_1f1h` at `rbp-0x1f1` is added, and the result is compared with the three first bytes of the input. 
So we can skip and try to find all of the easy constraints we can find. 
There are `16` hard coded values, so I guess each one is used to validate each character of the serial number.
Since the addition of the bytes for `E` and `var_1f1h` equals `155`, in ASCII that would mean `var_1f1h` equals `V` because `86 =155 - 69`

```groovy
|       `-> 0x00400a55      0fb68500feff.  movzx eax, byte [s]         ; Same as before
|           0x00400a5c      0fbed0         movsx edx, al               ; Move al to edx 
|           0x00400a5f      0fb6850ffeff.  movzx eax, byte [var_1f1h]  ; Move variable [var_1f1h] to eax
|           0x00400a66      0fbec0         movsx eax, al               ; Move al to eax
|           0x00400a69      01d0           add eax, edx                ; Add edx to eax
|           0x00400a6b      3d9b000000     cmp eax, 0x9b               ; compare eax with 155
|           0x00400a70      740e           je 0x400a80
```

Then we can see that the xth byte (hard coded value `[var_1ffh]`) should be a `Z`

```groovy
|           0x00400a7b      e9fb010000     jmp 0x400c7b
|           0x00400a80      0fb68501feff.  movzx eax, byte [var_1ffh]
|           0x00400a87      3c5a           cmp al, 0x5a                ; 'Z' ; 90
|       ,=< 0x00400a89      740e           je 0x400a99
```

Then there is another comparison with a hard coded value `[var_1f2h]`. So we have 90 + `?` = 155, so `A` at `0x65`.

```groovy
|       `-> 0x00400a99      0fb68501feff.  movzx eax, byte [var_1ffh]  ; Still contains Z
|           0x00400aa0      0fbed0         movsx edx, al               ; 'Z' ; 90
|           0x00400aa3      0fb6850efeff.  movzx eax, byte [var_1f2h]  ; Unknown hard coded value
|           0x00400aaa      0fbec0         movsx eax, al               ; first byte of that value
|           0x00400aad      01d0           add eax, edx                ; 90 + Unknown
|           0x00400aaf      3d9b000000     cmp eax, 0x9b               ; 155
```

Then it checks that the xth byte (hard coded value `[var_1feh]`) is a `9`

```groovy
|           0x00400ac4      0fb68502feff.  movzx eax, byte [var_1feh]
|           0x00400acb      3c39           cmp al, 0x39                ; '9' ; 57
|       ,=< 0x00400acd      740e           je 0x400add
```

#### Manually finding the serial number

So we can go on till the end we would find:
- A comparison between `155` and the addition of some hardcoded variable and the previous letter.
- A direct comparison between the next byte and a letter.

To sum up we should have these constraints:
- The length of the input must be 16
- str[0] = E
- str[15] = V
- str[1] = Z
- str[14] = A
- str[2] = 9
- ... 
- str[7] = c
- str[8] = 8

Which leads to the end at `EZ9dmq4c8g9G7bAV`.
However it takes a lot of time and efforts.
In fact, angr does not always need a very advance investigation of the binary. 

### Angr

#### Install angr

For that it's better to use a virtual environment:

```bash
python3 -m venv env
source env/bin/activate
python3 -m pip install angr
```

Then you can get started, if you have any issue you can follow the [documentation](https://docs.angr.io/introductory-errata/install). 

#### What you need to know

With angr, what we want to achieve is arriving in the state where the serial number input is valid.
So in radare2 we can do `iz` which will give us the strings and their data location,
this is more precise than `strings` or `binwalk`:

```groovy
[0x00400890]> iz
[Strings]
Num Paddr      Vaddr      Len Size Section  Type  String
000 0x00000dac 0x00400dac  28  29 (.rodata) ascii Please Enter the valid key!\n
001 0x00000dc9 0x00400dc9  26  27 (.rodata) ascii Serial number is valid :)\n
002 0x00000de4 0x00400de4  28  29 (.rodata) ascii Serial number is not valid!\n
```

Then we can find where we use this data in the binary.
Here we want to explore the binary until we arrive at `Serial number is valid :)\n` which is at the instruction line `0x00400c5c` (different from the data address).

```groovy
|      `--> 0x00400c5c      bec90d4000     mov esi, str.Serial_number_is_valid_: ; 0x400dc9 ; "Serial number is valid :)\n"
|           0x00400c61      bfe0136000     mov edi, obj.std::cout      ; 0x6013e0
```

We've seen earlier that it starts checking the password constraints at `0x00400a3c` so that's from where we're going to 
ask angr to look for the password that should be stored in `rbp-0x200` and have a size of 16.

#### Get started with Angr

With Angr you need to specify some information for it to work:
 
 - Load the binary and create a project
 - Start from somewhere in the memory that will be your entry state
 - Create a angr simulation (that will analyse the paths)
 - Tell it which memory space you want to end up with (the one with the success)

So that the easy part, because then you can add a tones of stuff depending on how hard is your binary (memory jumps, unconstrained, dynamic).
And angr provides tools for that.
In ours, it's pretty basic, we know that the solution is in the register `rbp-0x200` so:

  - We take the solution state at `0x400C5C` found by angr
  - Take the pointer to `rbp-0x200` (the syntax is weird, but works) 
  - Then we load 16bits of that particular registry from the solution state a bit vector
  - Finally we evaluate using the solution state the bit vector into bytes to give us the flag.
  
#### Write the script

Which leads to this python script:

```python
import angr

project = angr.Project("./serial")
state = project.factory.blank_state(addr=0x400A3C)

simulation = project.factory.simgr(state)
simulation.explore(find=0x400C5C)

solution_state = simulation.found[0]
pointer = solution_state.regs.rbp-0x200
state_bit_vector = solution_state.memory.load(pointer, 16)

print(solution_state.solver.eval(state_bit_vector, cast_to=bytes))
```

This will print the value of the bit vector of size 16 at the registry _rbp-0x200_ 
when we are at the valid serial number state:

```python
b'EZ9dmq4c8g9G7bAV'
```

Since it can be random the way angr deals with the constraints, 
you may need to rerun it in order to get it all (you might see some `\x00`). 
 

