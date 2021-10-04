---
layout: post
title: May the bash be with you
color: rgb(187, 10, 30)
tags: [linux]
---

Here are some nice tips you can use while on the command line.
This is not an exhaustive list.

### Bash commands

- `sudo !!` to redo the command above as sudo. (which is a special case of a wider [rule](https://stackoverflow.com/questions/211378/hidden-features-of-bash/211913#211913))
- Use `-x` while running a script to have debug information.

#### Useful magic commands

Search and replace in ".md" files strings. This one has been tested on Mac (the `-i '' -e` is necessary for mac)

```bash
find . -type f -name "*.md" -exec sed -i '' -e 's/search/replace/g' {} +
```

You can also use awk in your grep to select specific things like:

```bash
awk -F"[:(]" '{print $2}'
# this:test(is super cool) -> returns test
```

### Bash shortcuts

- <kbd>ctrl</kbd> + <kbd>R</kbd> (reverse-i-search): allows you to search a command in your historic by typing it
- <kbd>ctrl</kbd> + <kbd>A</kbd>: to go to the beginning of the line
- <kbd>ctrl</kbd> + <kbd>E</kbd>: to go to the end of the line
- <kbd>ctrl</kbd> + <kbd>U</kbd>: to remove from there to the _beginning_ of the line
- <kbd>ctrl</kbd> + <kbd>K</kbd>: to remove from there to the _end_ of the line
- <kbd>ctrl</kbd> + <kbd>W</kbd>: to remove word per word the line


### Use bash files

Don't forget to add some of your favourite alias in your `~/.bash_profile` or `~/.bashrc`.
Basically they configure the bash for you, the difference is that:
  - _bash_profile_ is executed once you log into the system (via ssh or else)
  - _bashrc_ is executed at each new interactive terminal window 
  
If you made a change to _bash_profile_ and want to see the result, 
you can always refresh it using:

```bash
source ~/.bash_profile
```  
 
#### Alias
 
You can check the one already existing using `alias`.
For example here is how it would look:

```bash
alias ll='ls -la'
```

#### Proxy

If you use proxy, or need to set/unset some env variable from time to time, 
you can set a script to do it for you:

```bash
export PROXY="http://annoying.proxy:1234"

function setproxy() {
    export {http,https}_proxy="$PROXY"
    export {HTTP,HTTPS}_PROXY="$PROXY"
    env | grep -i proxy
}

function noproxy() {
    unset {http,https}_proxy
    unset {HTTP,HTTPS}_PROXY
    echo no proxy
}
```
