---
layout: post
title: Certificates, certificates everywhere
color: rgb(187, 10, 30)
tags: [misc]
---

Certificates are everywhere ...

Usually you don't see them, everything works fine until it does not. 
The most common place with certificate errors will be on a website not using them or with errors. 

![warning]({{ "assets/img/http_warning.png" | relative_url }})

*Like your connection is not secure, you're going to die and all your data will be hacked*

I might be exaggerating, it's not that complicated, and you might not always getting hacked, but you surely gonna die.
Anyway, how does it work?

## Let's get started 😎

### From a client side

Here would be a lousy explanation of random typical workflow:

Basically, when somebody (let's say _"Carl's app"_) tries to connect to you:
>  - **You:** What's up who are you, what do you offer?

You can test it with this command to get the certificate manually:

```bash
openssl s_client -connect host:port
```

Then _Carl's app_ answer, _"hey it's me"_ giving you its public certificate (like an id to prove he's legit and all).
But you go:
>  - **You**: You say your name is _Carl's app_?, Never heard, but it's written that Carl 👨‍💻 knows you, but who the heck is Carl 👨‍💻 anyway?
>  <br>_I don't have all day long, a millisecond already!_

Carl 👨‍💻 created his app public key with his own key private key. That's call signing the public key. <br>
Here _Carl's app_ public key looks like:

```bash
-----BEGIN-----
Hi,

 Carl`s app is legit 
 
Carl
-----END-----
```
 
So then Carl 👨‍💻 gives his public key that has been sign with Google's private key saying:

```bash
-----BEGIN-----
Hello world,

 Carl is legit too 
 
Google
-----END-----
```

You checked _Carl's app_ key that was approved by Carl 👨‍💻, then checked Carl's key that was approved by Google so final step is to ask Google
(which is one of the root certificate provider used to sign other certificates like Facebook, Amazon, ...).

Once you validated with Google, _did you really sign Carl's certificate?_️, you know it's secure because that's the last step of the verification chain.
You trust Google's words because it's a certificate provider.

You finally know that server is indeed _legit_, and you can start the encrypted and trusted connection.

>  - **You**: Ok everything's clear, we are now _secured_! 🔒

All this is called the PKI (Public key infrastructure).

### From a server side

The server to create his public key signed by another authority uses a [CSR](https://www.sslshopper.com/what-is-a-csr-certificate-signing-request.html) (Certificate Signing Request),
And you can get your csr from the server key using:

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


### With a truststore

You can in your application add your certificates in a truststore.
Usually truststore are used for SSL handshakes. you can do that with `keytool` using this command:

```bash 
keytool -noprompt -keystore client.truststore.jks -alias my-custom-cert-alias -import -file newcert.crt -storepass "changeit" -keypass "changeit"
```

To check the certificate in the truststore use:

```bash
keytool -list -v -keystore client.truststore.jks -storepass "changeit"
```

You are now all set to explore the wonders of certificates! Good luck, you will need it because they expire all the times.
