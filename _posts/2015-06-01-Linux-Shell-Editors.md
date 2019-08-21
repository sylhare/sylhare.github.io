---
layout: post
title: Linux Shell editors
color: rgb(38, 78, 54)
tags: [linux]
---

# Shell Editors

Intended for Centos or Redhat.

## Shell text editor nano
nano is the basic text editor that should already be installed in your distribution, it is the most simple editor.

Launch the editor

	nano 

- `[ctrl] + [x]` to exit (it will ask to save before quiting)
- `[ctrl] + [r]` to open a file, write down the path 
- `[ctrl] + [w]` will search for a word 
- `[ctrl] + [k]` will copy the line
- `[ctrl] + [u]` will paste the line
- `[alt] + [/]` to go at the end of the file
- `[alt] + [\]` to go at the beginning of the file
- `[ctrl] + [o]` to write or save in a new or old file 



## VIM
VIM is a shell editor similar to Emacs that can be used in command line. It has multiple features and can be very powerfull for text editing. There are more [here](http://www.radford.edu/~mhtay/CPSC120/VIM_Editor_Commands.htm) for the commands.

To launch the command line editing tool

	vim 

To open filename in this depository
	
	vim /home/usr/filename


#### insert mode

- `[Insert]` press insert key on the key board to start editing the file
- `[Esc.]` pres the esc. key to quit the insert mode
- `:help` for Help
- `:%s/word/test/i` to replace `word` by `test`, `i` means that it is not case sensitive
- `:w /home/usr/filename` to write with `w` the newly created `filename` in `/home/usr`
- `:wq` to write (save) the file and then quit
- `:q` to exit
- `:q!` to force quit without saving

#### command mode

- `[d] [d]` delete the selected line
- `[y] [y]` Copy the selected line
- `[p]` past the line where the cursor is or at the end by default


## Emacs
Emacs is a shell editor similar to VIM that can be used in command line. It has multiple features and can be very powerfull for text editing.

Install emacs text file editor, because it's not by default on all distribution

	sudo apt-get install emacs 

- `[ctrl] + [x]` then `[1]` enlarges the editing window
- `[ctrl] + [x]` then `[ctrl] + [w]` allows to write the content in a different file
- `[ctrl] + [k]` then `[y]` allows to cut and past the line

 
## Stream Editor - sed
sed is a stream editor for RedHat and CentOS, it reads a file line by line and displays the output on the screen (does not save by default in the input file). Mainly use for search and replace a term in a file

The `-n` stop lines from being written, `'1~2p'` will print every 2 lines for file

	sed -n '1~2p' file

this ill delete every second line

	sed '1~2d' file

It will with `s` substitute/change `word` by `test`, the `g` is for all occurrences

	sed 's/word/test/g'

Start at the beginning of the line (`^`) then look at any (`.`) characters starting by 0 (`*0`) Then substitute it by nothing (`//`).

	sed 's/^.*0//'
