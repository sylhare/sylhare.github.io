---
layout: post
title: Generating my own jekyll blog stats
color: RGB(149,82,81)
tags: [jekyll]
---

Since Jekyll has so many possibilities, and I have been blogging with it for years now, 
I wanted to get some stats 📊 out of this blog. 
Inspired by [Raymond Camden](https://www.raymondcamden.com/2018/07/21/building-a-stats-page-for-jekyll-blogs), 
I decided to give it a try and build my own stat page.

Here are the results, _enjoy!_

## General stats

Here are the main statistic populated automatically from this blog.
The stats are generated through some liquid queries in [assets/stats.json]({{ '/assets/data/stats.json' | relative_url }}) 
based on all articles in the blog.
There's then a tiny js script that do the rendering.

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

## Pop the charts

To make it visually clear, the data is also represented using [chart.js](https://www.chartjs.org/).
Basically it fetches the json created by liquid with all the data then it transforms it to match the data format library.

### Article per tags

To see what are the main topics in this blog, in my case I use tags are category 🤷‍♀️ one tag per article.
Besides, bringing a use case for a radar type of graph, this one also display the editorial line of the blog.

<canvas id='radar-js' class="chart"></canvas>
<!-- <canvas id='pie-js' class="chart"></canvas> -->

Too many tags could mean that they need to be consolidated.
As I write randomly about things that I come across, the content is a bit diverse.

### Publishing history

Let's dive with this chart at the amount of article published over the years.
It's a good indicator to see the actual blogging activity on the site.

<canvas id='mixed-js' class="chart"></canvas>

You can see the growth rate of article with the line compared to the year's productivity with the bar.
For now, it is steadily growing, as long as I have topics that fuels my motivation 😁 hopefully I will keep it up.

### Content growth 

Another view of the activity of the blog, this time accounting the amount of words.

<canvas id='bubble-js' class="chart"></canvas>

Some topic may need fewer words than others, as long as you keep writing and make article it's worth it! 📝
Most of the articles are either a memory help for me, or an exercise to better understand the subject.
It's never perfect, I often come back to old articles to fix typos and try to improve them.

### Article per tags per year

To check the evolution of the topics happening over the years:

<canvas id='stacked-bar-js' class="chart"></canvas>

You can see, that Kotlin greatly started to inspire me in 2019, and that java, python and javascript have been some of my most recurring topics.
I put in the `other` category all tags with less than 2 articles in it and the `misc` so that the graph doesn't get too cluttered.

As to why those graphs instead of other, well just for fun and to try out the [chart.js](https://www.chartjs.org/) possibilities. 🙃

<script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>
<script src="{{ 'assets/js/stats.js' | relative_url }}"></script>

