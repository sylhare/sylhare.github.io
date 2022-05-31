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

## Implementation

This stat article has been transformed into a stat page, let's add some more information on the stats' generation.
The stats are generated through some liquid queries in [assets/stats.json]({{ '/assets/data/stats.json' | relative_url }}) 
based on all articles in the blog.
There's then a tiny js script that do the rendering.

### Liquid

Jekyll provides a lot of data readily available that I can just use and populate into a json file. However, for some
metrics, I would need to add some logic to generate the data I want.

For example let's find the value for:

- `postsPerCategory` which is the amount of posts per category
- `postsPerTag` which is the amount of posts per tag

One way would be to use some liquid annotations within the json file:

{% raw %}
```liquid
{
 "postsPerCategory": [
   {% for category in site.categories %}
     {% assign cat = category[0] %}
     {% unless forloop.first %},{% endunless %}
       { "name": "{{cat}}", "size":{{site.categories[cat].size}} }
   {% endfor %}
 ],
 "postsPerTag": [
   {% for tag in site.tags %}
     {% assign tagName = tag[0] %}
     {% unless forloop.first %},{% endunless %}
     { "name": "{{tagName}}", "size":{{site.tags[tagName].size}} }
 {% endfor %}
 ]
}
```
{% endraw %}

Now all those liquid calculation do take time, it increases proportionally to the size of the blog. 
In the case of this blog, the category is the not used, we only use tags.
On the plus side, you don't need any javascript to get the data you want meaning less chance for it to break on run time.

### Javascript

Instead, I went with javascript because the building time for local development was pretty annoying, and it didn't feel
like the load was too big on the UI side.
Also using javascript gave an advantage to be more flexible with the data handling.

From the payload you can clean get the data that looks like:

```json
{
  "posts": [
    { "date": "2021-05-26", "tags": "jekyll" },
    ...
  ]
}
```

There are more information like the post's title and amount of words, but they are not used here.
Then you process it to extract the tags such as:

```js
const tags = (data) => Object.entries(data.posts.reduce((result, item) => ({
    ...result,
    [item.tags]: [...(result[item.tags] || []), item]
}), {})).map(tag => ({ tag: tag[0], posts: tag[1] }));
```

The result is a list of tag with their associated list of posts.
Now let's have a look at the stats' graph.

## Pop the charts

To make it visually clear, the data is also represented using [chart.js](https://www.chartjs.org/).
Basically it fetches the json created by liquid with all the data then it transforms it to match the data format library.

<div><blockquote id="error-chart" style="display: none"></blockquote></div>

### Blog's tags overview

To see what are the main topics in this blog, in my case I use tags as category 🤷‍♀️ with one tag per article.
Besides, bringing a use case for a radar type of graph, this one also display the editorial line of the blog.

<canvas id='radar-js' class='chart'></canvas>
<!-- <canvas id='pie-js' class='chart'></canvas> -->

Too many tags could mean that they need to be consolidated.
As I write randomly about things that I come across, the content is a bit diverse.

### Publishing history

Let's dive with this chart at the amount of article published over the years.
It's a good indicator to see the actual blogging activity on the site.

<canvas id='mixed-js' class='chart'></canvas>

You can see the growth rate of article with the line compared to the year's productivity with the bar.
For now, it is steadily growing, as long as I have topics that fuels my motivation 😁 hopefully I will keep it up.

### Content growth 

Another view of the activity of the blog, this time accounting the amount of words.

<canvas id='bubble-js' class='chart'></canvas>

Some topic may need fewer words than others, as long as you keep writing and make article it's worth it! 📝
Most of the articles are either a memory help for me, or an exercise to better understand the subject.
It's never perfect, I often come back to old articles to fix typos and try to improve them.

### Hot topics of the years

To check the evolution of the topics happening over the years:

<canvas id='stacked-bar-js' class='chart'></canvas>

You can see, that Kotlin greatly started to inspire me in 2019, and that java, python and javascript have been some of my most recurring topics.
I put in the `other` category all tags with less than 2 articles in it and the `misc` so that the graph doesn't get too cluttered.

### Months' articles distribution

Let's see which month of the year I am the most productive over the years:

<canvas id='stacked-bar-date-js' class='chart'></canvas>

It does have a curve from the more to less active! The busiest months are not necessarily the ones I would have expected.
Can't always be writing apparently. 😛

I used some color schemes from [nagix/chartjs-plugin-colorschemes](https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html), check the css [here](https://github.com/nagix/chartjs-plugin-colorschemes/blob/master/src/colorschemes/colorschemes.tableau.js).
As to why those graphs instead of other, well just for fun and to try out the [chart.js](https://www.chartjs.org/) possibilities. 🙃

<script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>
<script src="{{ 'assets/js/stats.js' | relative_url }}"></script>

