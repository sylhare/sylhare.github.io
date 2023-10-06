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
Then you can process it to extract the tags such as:

```js
const tags = (data) => Object.entries(data.posts.reduce((result, item) => ({
    ...result,
    [item.tags]: [...(result[item.tags] || []), item]
}), {})).map(tag => ({ tag: tag[0], posts: tag[1] }));
```

The result is a list of tag with their associated list of posts.
This makes it much easier to use when wanting to create some charts around it.

### Pop the charts

To make it visually clear, the data is also represented using [chart.js].
Basically it fetches the json created by liquid with all the data then it transforms it to match the data format library.

I am not going to expand too much on how to create charts with [chart.js], I used some methods to abstract the 
transformation into the library dataset format:

```js
function printRadar(out) {
    new Chart(
        document.getElementById('radar-js').getContext('2d'),
        radarConfig(radarData(postsPerTag(tags(out))))
    );
}
```

This method is called when loading the page via a script, we also have the library imported in the page using:

```html
{% raw %}
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>
<script src="{{ 'assets/js/stats.js' | relative_url }}"></script>
{% endraw %}
```

As you can see the script called "stats.js" is located in my jekyll assets folder, so I can access it and pass it 
in the source attribute to be loaded. 

To display the charts within my own articles I use Jekyll, I use a HTML snippet with the same class name as the one I 
defined in the chart function: 

```html
<canvas id='radar-js' class='chart'></canvas>
```

And voilà! The charts are now alive and visible in the page. There's also a bit of handling in the script in case the 
library doesn't work in the browser or something fail to display an error message on the page with javascript.

## Final result

At first there was no dedicated page, but then since it's so fun to look at I create one on the menu bar for easy access,
you can find here some information on the graph and how they were creating still.

Find them all as well in the [**stats**]({{ "/stats" | relative_url }}) page.

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

This graph is composed of two datasets one for a bar graph for the amount of article per year and the other one is a
line graph for the cumulative amount of articles throughout the years.
Mixed graph is easy and does provide some insight like in here for the trend of new articles.

### Content growth 

Another view of the activity of the blog, this time accounting the amount of words.

<canvas id='bubble-js' class='chart'></canvas>

For this one here is the dataset:

```js
const dataset = years(out).map((item) => ({
    x: item.year,
    y: item.posts.length,
    r: Math.floor(item.posts.map(p => parseInt(p.words) / 50).reduce((a, b) => a + b) / item.posts.length)
}));
```

Dividing the amount of words per 50 so that it doesn't become too ginormous in the page. The average is close to 1k for 
all article as of now which is relatively big in terms of the bubble's pixel radius.

### Hot topics of the years

To check the evolution of the topics happening over the years:

<canvas id='stacked-bar-js' class='chart'></canvas>

I put in the `other` category all tags with less than 2 articles in it and any article that were tagged with `misc` 
(which is for miscellaneous, for a collection of different kind of article) so that the graph doesn't get too cluttered.
On this stacked bar, I used one colour per tag using an array so that I can personally choose which colour to assign to each
tag.

### Months' articles distribution

Let's see which month of the year I am the most productive over the years:

<canvas id='stacked-bar-date-js' class='chart'></canvas>

I used a stacked bar diagram with a colour grade for each year, as the years pass the colour loop will restart.
Each stack is the added value of number of article in that month per year.

I used some colour schemes from [nagix/chartjs-plugin-colorschemes](https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html), 
check the css [here](https://github.com/nagix/chartjs-plugin-colorschemes/blob/master/src/colorschemes/colorschemes.tableau.js).
As to why those graphs instead of other, well just for fun and to try out the [chart.js] possibilities. 🙃

<script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.min.js" integrity="sha256-uVEHWRIr846/vAdLJeybWxjPNStREzOlqLMXjW/Saeo=" crossorigin="anonymous"></script>
<script src="{{ 'assets/js/stats.js' | relative_url }}"></script>

[chart.js]: https://www.chartjs.org/
