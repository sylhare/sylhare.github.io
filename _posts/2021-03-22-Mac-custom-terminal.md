---
layout: post
title: Customize 🎨 your terminal with <i>iTerm2</i> and <i>Oh My ZSH</i>
color: rgb(63,105,170)
tags: [os]
---

[iTerm2](https://iterm2.com/) is a terminal replacement that works for newer version of macOS.
Since *macOS X Catalina* (10.15) the default shell uses [Z shell](https://en.wikipedia.org/wiki/Z_shell) aka **zsh** as a default.

The zsh shell adds some cool functionalities compared to the traditional bash shell.
One of them is the enhanced customization possible with [*Oh My Zsh*](https://ohmyz.sh/).
So let's go take a look at it!

## Install Oh My Zsh

The documentation on [ohmyzsh](https://github.com/ohmyzsh/ohmyzsh) is pretty well written. 
Check it out or just go and run:

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

By default, two themes are available, `robbyrussell` and `agnoster`.
But you can browse through the *oh my zsh* [wiki](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes) and install the one you fancy.

You can edit your `~/.zsrc` and replace the value of the `ZSH_THEME` with the theme you want.
On my side, I'll go with the `agnoster` one.

{% include aligner.html images="iterm2-agnoster.png" column=1 %}

If it doesn't look like the above picture, it's possible, you may need to do some customization within iTerm2.

## Customize with iTerm2

To make the emojis visible, you need to check the built-in *Powerline glyphs*.
Go to iTerm2 preferences with <kbd>⌘</kbd> + <kbd>,</kbd> then go into profiles > Text.

{% include aligner.html images="iterm2-powerglyphs.png" column=1 %}

Then, if you don't like the default color, and prefer something similar to the above, you can update the color scheme.
There's the *Solarized Dark* theme which is popular, but I went *Tango Dark*.

To update it, go back to preferences > profiles where you were before and go to *Colors* to update on the bottom right
the theme.

## Conclusion

Done! Enjoy your new terminal look, if you don't see it right away you can do:

```bash
source ~/.zshrc
```

This should apply the changes right away.
Or just open a new terminal, which should have the new theme on.
