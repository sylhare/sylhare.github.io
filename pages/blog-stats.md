---
layout: page
title: Blog stats
subtitle: "Where all the graphs wash ashore"
permalink: /stats/
feature-img: "assets/img/pexels/wave.png"
icon: "fas fa-chart-pie"
excluded: true
---

<div><blockquote id="error-chart" style="display: none"></blockquote></div>

Those graphs were made for test in the article [Generating my own jekyll blog stats]({% post_url 2021/2021-05-26-Generate-jekyll-blog-stats %}).
I decided it would be delightful to have them handy so here they are in their own private page!

### General stats

The main statistic populated automatically from this blog. 

<table class="center">
  <tr>
    <th>Total of posts</th>
    <td id="TotalPosts"></td>
  </tr>
  <tr>
    <th>Total of tags</th>
    <td id="TotalTags"></td>
  </tr>
  <tr>
    <th>Total of words</th>
    <td id="TotalWords"></td>
  </tr>
  <tr>
    <th>Average of words</th>
    <td id="AvgWords"></td>
  </tr>
</table>

Having it on a table is nice, but graphs are way more stylish!

### Months' articles distribution

Let's see which month of the year I'm the most productive over the years:

<canvas id='stacked-bar-date-js' class='chart'></canvas>

It does have a curve from the more to less active! The busiest months aren't necessarily the ones I would have expected.
Can't always be writing, apparently. 😛

### Hot topics of the years

To check the evolution of the topics happening over the years:

<canvas id='stacked-bar-js' class='chart'></canvas>

You can see, that Kotlin greatly started to inspire me in 2019, and that java, python and javascript have been some of 
my most recurring topics.
I put in the `other` category all tags with less than 2 articles in it and the `misc` so that the graph doesn't get too cluttered.

### Blog's tags overview

To see what are the main topics in this blog, in my case I use tags as category 🤷‍♀️ with one tag per article.
Besides, bringing a use case for a radar type of graph, this one also displays the editorial line of the blog.

<canvas id='radar-js' class='chart'></canvas>
<!-- <canvas id='pie-js' class='chart'></canvas> -->

Too many tags could mean that they need to be consolidated.
As I write randomly about things that I come across, the content is a bit diverse.

### Content growth

Another view of the blog's activity, this time accounting for the average number of words (the number of word is
divided, so it would fit in the chart).

<canvas id='bubble-js' class='chart'></canvas>

Some topic may need fewer words than others, as long as you keep writing and make article it's worth it! 📝
Most of the articles are either a memory help for me, or an exercise to better understand the subject.
It's never perfect, I often come back to old articles to fix typos and try to improve them.

### Publishing history

Let's dive with this chart at the number of articles published over the years.
It's a good indicator to see the actual blogging activity on the site.

<canvas id='mixed-js' class='chart'></canvas>

You can see the growth rate of article with the line compared to the year's productivity with the bar.
For now, it is steadily growing, as long as I have topics that fuels my motivation I will keep it up 😃.


<script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>
<script src="{{ 'assets/js/stats.js' | relative_url }}"></script>

