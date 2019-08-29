---
layout: post
title: Bulk convert .mov to .mp4 with ffmpeg
color: rgb(254 ,132, 14)
tags: [windows]
---

## FFmpeg

[FFmpeg](https://github.com/FFmpeg/FFmpeg) is a collection of libraries and tools to process multimedia content such as audio, video, subtitles and related metadata.

It is a cross platform tool that we will use to make the conversion.

## Convert .mov to .mp4

To do it on windows easily, here are the small steps you need to follow:

1. Download a ffmpeg windows build from [here](http://ffmpeg.zeranoe.com/builds/).
2. Unzip it and place it in `Program Files` for example.
3. Add the ffmpeg to your `PATH` environment variable with the `cmd.exe` tool (windows CLI).

```bash
setx /M PATH "D:\Program Files\ffmpeg\bin;%PATH%"
```

4. Check that it is now working (you might need to source the env variables or re open `cmd.exe`) 

```bash
ffmpeg -version
```

5. Go to the directory with all the `.mov` files using the `CD` command, use `DIR` to display what's in the directory.
6. Use a loop to convert all the `.mov` files from that directory to `.mp4` using ffmpeg.

```bash
FOR /r %i IN (*.MOV) DO ffmpeg -i "%i" -vcodec h264 -acodec mp2 "%~ni.mp4"
```

And that's it you're done. Now you should have in that folder all of your files `.mov` and the `.mp4` with the same name.