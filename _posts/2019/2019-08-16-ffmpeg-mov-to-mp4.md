---
layout: post
title: Bulk convert .mov to .mp4 with ffmpeg 🎥
color: rgb(254 ,132, 14)
tags: [tips]
---

## FFmpeg

[FFmpeg](https://github.com/FFmpeg/FFmpeg) is a collection of libraries and tools to process multimedia content such as audio, video, subtitles and related metadata.

It is a cross platform tool that we will use to make the conversion.

## Convert .mov to .mp4

To do it on windows easily, here are the small steps you need to follow:

1. Download a ffmpeg windows build from [ffmpeg.com](http://ffmpeg.zeranoe.com/builds/).
2. Unzip it and place it in `Program Files` for example.
3. Add the ffmpeg to your `PATH` environment variable with the `cmd.exe` tool (windows CLI).
```batch
setx /M PATH "D:\Program Files\ffmpeg\bin;%PATH%"
```
4. Check that it is now working (you might need to source the env variables or re open `cmd.exe`) 
```batch
ffmpeg -version
```
5. Go to the directory with all the `.mov` files using the `CD` command, use `DIR` to display what's in the directory.
      - You can find the path to your folder in the explorer (click on the top bar).
      - If the folder is situated in another disk like D, type `D:` to switch to it then use the `CD` command.   
6. Run this loop command to convert all the `.mov` files from that directory to `.mp4` using ffmpeg.
```batch
FOR /r %i IN (*.MOV) DO ffmpeg -i "%i" -vcodec h264 -acodec mp2 "%~ni.mp4"
```

That's it you're done. Now you should have in that folder all of your files `.mov` and the `.mp4` with the same name.

## Convert .ogg to .mp3

If you have music you want to convert from one format to another (.ogg or else). You could do the same step,
and just change the ffmpeg command with:

```batch
ffmpeg -i music.ogg music.mp3
```

The `-i` is the input *music.ogg*, the output name will be *music.mp3*.

