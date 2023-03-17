---
layout: post
title: Customize 🎨 your terminal with <i>iTerm2</i> and <i>Oh My ZSH</i>
color: rgb(0, 135, 213)
tags: [open source]
---

[iTerm2][2] is a terminal replacement that works for newer version of macOS.
Since *macOS X Catalina* (10.15) the default shell uses [Z shell][3] aka **zsh**.
The Z shell adds some cool functionalities compared to the traditional bash shell.

One of them is the enhanced customization possible with [*Oh My Zsh*][4].
So let's go take a look at it!

## Install Oh My Zsh

The documentation on [ohmyzsh][5] is pretty well written. 
Check it out or just go and run:

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

By default, two themes are available, `robbyrussell` and `agnoster`.
But you can browse through the *oh my zsh* [wiki][6] and install the one you fancy.

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

For more 🖥 Mac tips, check out this [article][1]!

[1]: {% post_url 2019/2019-10-21-Mac-Tips %}
[2]: https://iterm2.com/
[3]: https://en.wikipedia.org/wiki/Z_shell
[4]: https://ohmyz.sh/
[5]: https://github.com/ohmyzsh/ohmyzsh
[6]: https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
