---
layout: post
title: Linux Shell editors
color: rgb(242,85,44)
tags: linux
---

# Shell Editors

Intended for Centos or Redhat.

## Shell text editor nano
nano is the basic text editor that should already be installed in your distribution, it is the most simple editor.

Launch the editor

	nano 

- <kbd>ctrl</kbd> + <kbd>x</kbd> to exit (it will ask to save before quiting)
- <kbd>ctrl</kbd> + <kbd>r</kbd> to open a file, write down the path 
- <kbd>ctrl</kbd> + <kbd>w</kbd> will search for a word 
- <kbd>ctrl</kbd> + <kbd>k</kbd> will copy the line
- <kbd>ctrl</kbd> + <kbd>u</kbd> will paste the line
- <kbd>alt</kbd> + <kbd>/</kbd> to go at the end of the file
- <kbd>alt</kbd> + <kbd>\</kbd> to go at the beginning of the file
- <kbd>ctrl</kbd> + <kbd>o</kbd> to write or save in a new or old file 



## VIM
VIM is a shell editor similar to Emacs that can be used in command line. It has multiple features and can be very powerfull for text editing. There are more [here](http://www.radford.edu/~mhtay/CPSC120/VIM_Editor_Commands.htm) for the commands.

To launch the command line editing tool

	vim 

To open filename in this depository
	
	vim /home/usr/filename


#### insert mode

- <kbd>Insert</kbd> press insert key on the key board to start editing the file
- <kbd>Esc.</kbd> pres the esc. key to quit the insert mode
- `:help` for Help
- `:%s/word/test/i` to replace `word` by `test`, `i` means that it is not case sensitive
- `:w /home/usr/filename` to write with `w` the newly created `filename` in `/home/usr`
- `:wq` to write (save) the file and then quit
- `:q` to exit
- `:q!` to force quit without saving

#### command mode

- <kbd>d</kbd> <kbd>d</kbd> delete the selected line
- <kbd>y</kbd> <kbd>y</kbd> Copy the selected line
- <kbd>p</kbd> past the line where the cursor is or at the end by default


## Emacs
Emacs is a shell editor similar to VIM that can be used in command line. It has multiple features and can be very powerfull for text editing.

Install emacs text file editor, because it's not by default on all distribution

	sudo apt-get install emacs 

- <kbd>ctrl</kbd> + <kbd>x</kbd> then <kbd>1</kbd> enlarges the editing window
- <kbd>ctrl</kbd> + <kbd>x</kbd> then <kbd>ctrl</kbd> + <kbd>w</kbd> allows to write the content in a different file
- <kbd>ctrl</kbd> + <kbd>k</kbd> then <kbd>y</kbd> allows to cut and past the line

 
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
