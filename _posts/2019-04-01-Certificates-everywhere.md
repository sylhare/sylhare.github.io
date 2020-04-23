---
layout: post
title: Certificates, certificates everywhere
color: rgb(187, 10, 30)
tags: [linux]
---

Certificates are everywhere ...
Usually you don't see them, everything works fine until it does not. 
The most common place with certificate errors will be on website not using them or with errors. 

![warning]({{ "assets/img/http_warning.png" | relative_url }})
*Like your connexion is not secure, your gonna die and all your data will be hacked*

I might be exaggerating, it's not that complicated and you might not always getting hacked, but you surely gonna die.
Anyway, how does it work?

Here would be a lousy explanation of random typical workflow:

Basically, your browser go ask the server
>  - What's up who are you, what do you offer?

Then the server answer, hey it's me giving you its public certificate (like an id to prove he's legit and all).
But you go:
>  - Don't know you, but it written that Carl's knows you, but who the F**k is Carl? Like I don't have all day, already a millisecond!
  
Yeah because Carl created the server public key with his. He signed the server public key, like:

```
-----BEGIN-----
Hi,

 Server is legit 
 
Carl
-----END-----
```
 
So then Carl gives is public key, saying I'm cool bro, look I know your dad, he signed my key. 
And then your browser check and see that he public is checked by Google (yeah your browser is chrome #plot_twist).
Once you get this certification, you know that server is indeed legit and you can start the encrypted and trusted connexion.

You are "secured"!

All this is called the PKI (Public key infrastructure).
The server to create his public key signed by another authority uses a [CSR](https://www.sslshopper.com/what-is-a-csr-certificate-signing-request.html) (Certificate Signing Request), 

It looks like :

```bash
$ openssl req -new -newkey rsa:2048 -nodes -out servername.csr -keyout servername.key

-----BEGIN CERTIFICATE REQUEST-----
MIIByjCCATMCAQAwgYkxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MRMwEQYDVQQKEwpHb29nbGUgSW5jMR8w
HQYDVQQLExZJbmZvcm1hdGlvbiBUZWNobm9sb2d5MRcwFQYDVQQDEw53d3cuZ29v
Z2xlLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEApZtYJCHJ4VpVXHfV
IlstQTlO4qC03hjX+ZkPyvdYd1Q4+qbAeTwXmCUKYHThVRd5aXSqlPzyIBwieMZr
WFlRQddZ1IzXAlVRDWwAo60KecqeAXnnUK+5fXoTI/UgWshre8tJ+x/TMHaQKR/J
cIWPhqaQhsJuzZbvAdGA80BLxdMCAwEAAaAAMA0GCSqGSIb3DQEBBQUAA4GBAIhl
4PvFq+e7ipARgI5ZM+GZx6mpCz44DTo0JkwfRDf+BtrsaC0q68eTf2XhYOsq4fkH
Q0uA0aVog3f5iJxCa3Hp5gxbJQ6zV6kJ0TEsuaaOhEko9sdpCoPOnRBm2i/XRD2D
6iNh8f8z0ShGsFqjDgFHyF3o+lUyj+UC6H1QW7bn
-----END CERTIFICATE REQUEST-----
```


This one is given to another authority to create the signed public key. 
Usually you can use `entrust certificate` which are common on the web, you don't go up to Google or big company own certificate to validate a simple web request.
 
But that `root` certificate at the end of the chain exists and usually it has a public key known by a lot of people, 
and a private key that is kept secret in a vault that is used to create the chain.
 
