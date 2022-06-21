---
layout: post
title: Introduction to Google Analytics
color: rgb(242,183,5)
tags: [misc]
---

[**Google Analytics**][11] is a free service meant to track users and collect their online behaviour data when using a
website, app or any kind of web product. And like mosquitoes you will find it almost everywhere you go to relax.
So let's have a look at it. 👀

As a disclaimer, I _do_ use Google Analytics on this website so that I can see if there are some visitors and to learn
a bit more how the Google Analytics works, from the collecting of the data to the understanding of the gathered data. 
(I say that now to save face, but it might be paved with unscrupulous ads years from now ...🙆‍♀️).

With the sunset of the old analytics `UA` in _July 2023_, replaced by the newer `GA4` tracking id, it's a perfect 
opportunity to start scratching the surface of this new version of [**Google Analytics**][1].

### Set up your Google Analytics

If you have no experience with it, or just want to start, create an [**analytics account**][2] first.
It will be linked with the gmail address you are using, and by default should use the latest tracking id.
You can have one account and multiple website, filter by ip and do other cool stuff to customize data collection for
your sites.

If you already had an account, go to your [**analytics portal**][3], to [**set up**][4] the new GA4 tracker (or property as it
is officially called), go to **⚙ Admin > GA4 Setup Assistant > Get Started**.

<div class="row">
    <div style="flex: 20.0%">
        <img src="{{ 'ga-admin.png' | prepend: 'assets/img/' | relative_url }}" alt="ga-admin.png">
    </div>
    <div style="flex: 80.0%">
        <img src="{{ 'ga-setup.png' | prepend: 'assets/img/' | relative_url }}">
    </div>
</div>

This will add a new property ID on your website so that you can have the data gathered be 
reflected from your old Universal Analytics property and from the new Google Analytics 4 one.

Switch via at the top under _All accounts > website name_ to see the data gathered by one or the other.

### Add Google Analytics to your website

#### With Firebase

[**Firebase**][12] is an open source product by Google labelled as an app development platform. A bunch of SDKs to make
an App (Games, website, ...), available in multiple language such as Javascript for a web app.
It uses a [**SDK**][13] (Software Development Kit) to get you started with a bunch of tools such as the Google Analytics one
to gather data on your user.

```js
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = getAnalytics();
logEvent(analytics, 'notification_received');
```

It's embedded directly within your app, the `GA4` here is called `measurementId` in your firebase config. 
For static site generator like Jekyll, you usually won;t have to deal with that, instead you'll use code snippets to
load the necessary analytics code to gather the data.

#### With Analytics.js

In the past, you may have used Analytics.js to collect data using this code snippet:

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script>
    window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments) };
    ga.l += new Date;
    ga('create', analyticsName, 'auto');
    ga('send', 'pageview');
</script>    
<script async src='//www.google-analytics.com/analytics.js'></script>
```

It works with Universal Analytics (UA), but won't work properly with the new Google Analytics 4 (GA4).
The new recommended way is to use the Google Tag manager, [**migrating**][8] from one to the other will depend on the 
complexity of the event's configuration you've been using.

For `pageviews` only, you can pretty much replace the old snippet with the new one.

#### With GTags

[**Google Tag Manager**][10] once installed on the website via a snippet is a system that will collect data happening on
the website.
It has more flexibility than Analytics and you can set customized trigger and variables to enhance the collected data.
To install it on your website, you can use this snippet:

```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXX');
</script>
```

As per Google, the property ID may represent measurement for different Google products (Universal Analytics "_UA-XXXXXXXX_", 
Google Analytics 4 property "_G-XXXXXXXX_", Google Ads "_AW-XXXXXXXX_" and more).
To collect for [**both**][9] GA4 and UA properties, can be done via adding a config tag `gtag('config', 'XXXXXXXX');` 
per property.

The `gtag` that you may have been adding for your UA property should work with the GA4 as they use the same principle.

### Data Collection

#### UA vs GA4

GA4? Well it means that before there 3 more; first Urchin (1), then Google Analytics (2), followed by 
Universal Analytics (3). And now we are at Google Analytics 4 (4), which is the first numerated one. They were a mean to
assert that a website was successful, knowing that it's visited and people are interacting with it.

Introduced in 2012, Universal analytics categorized user events and with labels and actions providing more detail on the
user's behaviour.
Google Analytics is also following that event base model but was more widely used for Apps.
Now that Universal Analytics is retiring, the new Google Analytics 4 is the next standard. It's a bit blurry, for
neophytes, but GA4 provides some more [**flexibility**][14] in data collection based on the same events, with some 
[**exception**][15].

The big news about GA4 is to add more privacy (due to the privacy lawsuits that Google took in the past years) and also
to prepare the field for IoT connected devices. So your coffee machine provider ☕️ can know and enhance how your coffee
experience and make the conversion rate for caffeine intake. 

#### Vocabulary

There is a specific vocabulary used with each property to better describe how it works, it evolved with each new version
of Google Analytics. Let's have a brief description of the most common ones now in place with Google Analytics 4.

- **Event**: Any action performed by a user (login, downloading, clicking, playing a video) that is either collected
  automatically or via custom logging. It was previously called a _hit_ in UA as an interaction with your site.
- **Page Views**: How many pages were looked at by users, it's more generic now and correspond to the total amount. A user 
  may load the same page multiple time or go to different ones. So it is not the same as the number of users.
- **Session**: This is one a user is "actively" using your app either it being open in the foreground in a browser. 
- **Conversion**: A success metric to refer to an action that a user do which is valued by you (as an organization), 
  such as buying, sharing, subscribing... The conversion rate, is how many percent of the total of users that are lead
  to perform profitable actions.
- **Dimension**: A trackable characteristic of a user, like the device, browser used. But it can be as deep as the
  age, gender and other personal information.

There's some real science between those behavioural analytics, it's to no surprise that we are using AI 
(artificial intelligence) to make sense of all the data gathered and digest them.
On another note, if you are using ads to increase your conversion rate over a certain population of user, 
then ads broker to determine which ads was successful will use an _attribution_ model to say which click(s) first or 
last was the one that lead to the conversion.

#### Customization

The new way to go is using the gtag to collect data, but it's been used before.
You may have had the [**anonymization**][5] set on with the old UA, which was setting to `.0` for the last ipv4 subnet. 
(Same kind of logic is applied for ipv6) via this option:

```js
gtag('config', '<GA_MEASUREMENT_ID>', { 'anonymize_ip': true })
```

Now via GA4, it's automatically masked by default.

There are other [**options**][6], like to have the data collected based on 'user_id', or with `send_page_view` to block the
collection of data from a page you don't need info on.
Here is another one to set the expiration date of the cookie:

```js
gtag('config', 'GA_MEASUREMENT_ID', {
  'cookie_prefix': 'MyCookie',
  'cookie_domain': 'blog.example.com',
  'cookie_expires': 28 * 24 * 60 * 60 // 28 days, in seconds
});
```

Find a list of events you can configure your gtag with on the Google [**documentation**][7]. It's a bit lengthy and should
have all the information you may need.

### Take Out

#### Analytics Dashboard

Using UA over quite some time now, I managed to gather some interesting data over the use of this website.
Since I have just made the switch over to the GA4 property I don't have as much information to compare.
Still I wanted to share here, the view that I have over this content.

{% include aligner.html images="ga-what-users.png,ga-when-users.png,ga-where-users.png" column=3 %}

I have not dug into complex reporting so here were just some out of the box reporting. 
Those are the top one in the dashboard, and you can check the amount of page viewed, the "bounce rate" when a user comes
back to a page, or how long they stay on it.

Since the blog is about technical stuff, it's mostly viewed during the week on desktop from people at work. Despite the 
fact that it's written in english, we can see people from all over the world are coming to visit. 👋 Hi everyone!

#### My experience

[**Google Analytics**][2] is far more complicated and scary than I thought, the degree of information gathered out of the box is 
pretty staggering! Events like "scrolling", "clicking" or time passed on the page is sent for analysis and can be then
manipulated and interpreted through dashboards, reports and more. There are so much information that it's easy to get 
lost, hopefully I left enough [**links**][11] to get you started if you're interested in experimenting it.

The most fascinating is the amount of customization that can be done on the website/app side, I would have assumed that 
with all the information that the `pageview` event is giving, it should be enough, but apparently I was wrong!
For example [**Firebase**][12] gives you the possibility to be even more granular as to when and what to log directly from 
within your application. And the Google Tag Manager provides way more customization than I dared to talk about with a 
wide variety of events.

Thankfully, if you are mindful of your online presence, you can find tools that will block, trackers, cookie and other
means to follow you online.

[1]: https://support.google.com/analytics/answer/10089681
[2]: https://marketingplatform.google.com/about/analytics/
[3]: https://analytics.google.com/analytics/web/?authuser=0#/report-home/
[4]: https://support.google.com/analytics/answer/10312255
[5]: https://support.google.com/analytics/answer/2763052
[6]: https://support.google.com/analytics/answer/9310895#gtagjs-enable-basic
[7]: https://support.google.com/analytics/answer/11091025
[8]: https://developers.google.com/analytics/devguides/migration/ua/analyticsjs-to-gtagjs
[9]: https://support.google.com/analytics/answer/11091026
[10]: https://support.google.com/tagmanager/answer/6102821
[11]: https://developers.google.com/analytics/devguides/collection/ga4
[12]: https://firebase.google.com/
[13]: https://firebase.google.com/docs/analytics/get-started?platform=web
[14]: https://www.thedrum.com/opinion/2021/02/04/ga4-the-future-google-analytics
[15]: https://support.google.com/analytics/answer/9964640
