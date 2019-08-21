---
layout: post
title: Linux Commands 101
color: rgb(187, 10, 30)
tags: [Linux]
---

Intended for Centos or Redhat.

## General
Run commands as root

    sudo -i
    
`root` is a super user, to use root use `su` (which can also be used to switch account, you need to know the password to the account you wish to use).
Another option is to use `sudo` using your own password where you have been pre-approved to use root privilege.

## Files
### Listing filename
List the file in the directory `-l` Give the file with information on rights, creator, size and creation date, and `-R` and to list all the subdirectories

    ls -l -R

List the file in the directory that contain the word"

    ls *word*

list files that contains word1 or word2,

    ls [word1,word2]*

can work for just a character

    ls *word[12]*

look for file containing 2013, 2014, 2015

    ls *{2013..2015}

Look for a file beginning with a letter between H to C, the second letter can be between A to Z, the third letter would be a number from 0 to 9, the last three character can be anything

    ls [HC][A-Z][0-9]???

### File Manipulation
Allow to print on the command the content of a file

    cat file.txt

Create a file

	touch file.txt

#### Using pipes in the command
Show and sort the file alphabetically the left column

	cat file | sort

The same as before however grep is used to find words and the "v" in grep suppress the line that contains "Word" or "last"

	cat file | sort | grep -v "Word" | grep -v "last"

### Input - output
store in a file the results of the command

    ls -R > file.txt

add the result of the command to file.txt without erasing it
    
    ls >> file.txt

grep look for the "word" of the input file.txt

    grep -1 "word" < file.txt

Sort the element of the left side (default) from the input file.txt

    sort < file.txt

save the results with file.txt as an input in filesorted.txt as an output

    sort < file.txt > filesorted.txt 

### Finding files
#### Using locate
Get file statistic on the system

	locate -S

Tell you where the file exist, it is stored in the `mlocate.db` that is updated automatically

	locate file

Search non case sensitive file name location, i for the non sensitive case, c to count the number of results

	locate -ic file

#### Using Which
Get the location of binary executable, details about linux content

	which ifconfig

#### Using find
Print working directory

	pwd 

will look for every directory that begin with "word" (the * does that)
	
	find -name "word*"

Count the number of files in the current directory. The `.` is for the current directory, `-type f` is for a file, `-print` to print there name, `wc -l` will count the number of lines (1 line = 1 file).

	find . -type f -print | wc -l 

Will show the files created in the directory in the last 3 minutes
 
	find -cmin -3

Perform actions on files that are found
Find files from a specific user `-user username` with a specific title `-name` that are bigger than 500 characters `-size 500c` then `-exec` will run `Move` to the result of the search to the /home folder with `{}` as the result, and `\;` to mark the end. 

	find -user username -name "file[0-9][0-9].txt" -size 500c -exec Move {} /home \;

Move files with -size bigger than 500 characters

	find -type f  -exec mv {} /home/large \; 

## Terminal
### Bash Shell
clear the command screen

    clear 

Change user to root, the password will be asked
	
	su root

Open a new subshell environment
	
	bash

Show all variables and value of the environment

	env

to quit the root session, or quit the terminal

	exit

Create a variable in the environment and export it to all subshell
	
	VARIABLE = "test"
	export VARIABLE

The variable SHELL will tell you which shell you are currently using

	echo $SHELL 
    
## Directories

Delete a directory

    rm dir path/to/directory


## C Shell
Change the shell from bash to the C Shell

	csh 

Show all variables and value of an environment

	setenv

Set a value and show it
	
	setenv VARIABLE "test"
	echo $VARIABLE

## TTY - teletype writer
show who is connected on the computer and on which session

    who

Give which user you are
	
	whoami

Console per default, with graphical environment

    tty1

Use **`ctrl + alt + f2`** to go to tty2 session. 
Use **`ctrl + alt + f3`** to go to tty3 session, and so on.



