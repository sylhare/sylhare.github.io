---
layout: post
title: XSS Cross site scripting explained
color: rgb(166, 38, 49)
tags: [ctf]
---

[XSS][1] or cross-site scripting is defined by the [OWASP][2] foundation as an attack of the injection category where
malicious scripts are injected into "trusted" websites.

This type of hack is very common with the increase of developers and website, the number of attack vectors, so 
let's have a deeper look at what it is, what it looks like and what you can do about it to protect your website and yourself against it.

### Cross Site Scripting

XSS can be done with any web technology, but we'll have an example in javascript as it's more common. 
The attack vector comes from flaws in the web application that lets the hack input some malicious code that may be 
executed on another end user's browser.

This can happen when a web application displays a user's input without validation or encoding, the output that's generated
will be executing the malicious code without the user or web application's owner's knowledge.
The browser doesn't know that the script is malicious code since it's embedded in the trusted web application's generated
code.

What makes it potentially harmful is that the malicious code once executed can have access to the user's cooke, session 
tokens or other sensitive information stored in the browser.

### XSS examples

For our examples in javascript, you don't need to have `<script>` tags to run malicious code, there are plenty of 
ways to run it, for example, these will run malicious code on click:

```html
<!-- Via the href-->
<a href="javascript:alert(1)">link</a>
<!-- Via the onclick -->
<div onclick="alert(1)">
```

There's often an unsuspected way to run transform some benign HTML into a javascript executable script. 
And it all begin by injection. 
You can test if your website is protected against it by looking at the output of special characters such 
as `'';!--"<XSS>=&{()}`, if they get escaped or encoded then it's safer; else you might find a vulnerability.

For example, you can use quotes `'` or `"` to escape inside HTML tags and inject code such as `'><img src=0 onerror=alert(1)>` or 
to escape a string within a Javascript file and inject code such as `';alert(1)`.

Find some more examples on the community-led HTML [Security Cheat sheet][5] or directly from [OWASP XSS][1] page, they 
even have [cheat sheet for XSS evasion][4] to test your web application against.

### Preventive actions

The OWASP foundation might be best known for its list of critical security concerns for web applications. 
However, since it works to improve security in software as a whole, 
they also have documentation and training to start preventive actions against those threats.

They have made available some cheat sheets: 

- [XSS Prevention][5]: A list of techniques to prevent or limit the impact of XSS, it's not full proof, and you might
  need to use more than one technique.
- [DOM based XSS Prevention][6]: An addition to the above XSS Prevention cheat sheet but specifically for DOM based 
  XSS where the attack is injected into the application during runtime in the client directly.

There are some open source tools as well (which are mentioned in those two links) which can be useful, such as [AntiSamy][7]
which is an OWASP project. It's mainly used for HTML validation and sanitization, making sure that the user's supplied
text does not contain anything malicious.


[1]: https://owasp.org/www-community/attacks/xss/
[2]: https://owasp.org/
[3]: https://html5sec.org/
[4]: https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html
[5]: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
[6]: https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html
[7]: https://owasp.org/www-project-antisamy/
