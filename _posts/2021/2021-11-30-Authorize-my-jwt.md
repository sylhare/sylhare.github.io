---
layout: post
title: OAuth 2.0 to authorize my token
color: rgb(97, 170, 34)
tags: [misc]
---

## OAuth

### The protocol

[OAuth][5] stands for _Open Authorization_, it's a protocol that uses token instead of password to securely exchange information
on the internet.
When you log in to a website using your Google, Facebook, Microsoft or Apple account, you are not sharing your password,
yet you can connect to the website and share some of your profile information. It's all thanks to [OpenID] for the
authentication part and [OAuth][6] protocol for the authorization.

_Authentication_ is to check who you say you are and _Authorization_ is to check what you have access to. Usually 
unauthenticated users have limited access to resources and APIs. That's why both concepts are pretty mixed within OAuth.

There was a bit of [controversy][5] between OAuth 1.0 and [OAuth 2.0][4] (more complex than OAuth 1.0 for simple use case),
but now that the newest version is the enterprise standard, that's the one we'll be focusing on.

### The token(s)

So OAuth is the protocol that defines how [tokens][6] should be transferred for the authorization.
Obviously they need to be kept secret, encrypted and sent over HTTPS.
The tricky part is to make sure you can verify that token, so that you maintain interaction with your API and resources
secured. So you'll need special [tokens][1] for that.

There are multiple types of token that can be used, the most generic one is [access token][7]. The access token is usually
used to gain access to an API and perform specific actions defined in the _scope_
You can create your own access token, but it needs to follow [RFC 6750][8] to work with the OAuth flow. 

Then you have the [ID token][1], which is application specific which pass along some more information from the user to
allow the API to perform certain action on the user's behalf. It's confusing.
Those are usually [JSON Web Token][10] (JWT) standard defined in [RFC 7519][9].

### ID Token: JWT

A [JWT][2] also pronounced <code class='unknown'>"jot"</code>, is composed of three parts divided by dots.
It holds all the information necessary for its verification, a _header_, a _payload_ and it's self-signed signature:

```shell
eyJhbnktaGVhZGVyLWtleSI6ImFueS12YWx1ZS1oZWFk
ZXIiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJuYW1lIjoiSm9obiBEb2UiLCJwZXJtaXNzaW9ucyI6
WyJST0xFX0RFVkVMT1BFUiJdLCJhbnktcGF5bG9hZC1r
ZXkiOiJhbnktcGF5bG9hZC12YWx1ZSIsImlhdCI6MTYz
NjEyNzA4MiwiZXhwIjoxNjM2MTI3MzgyfQ
.
CrYVOxLsqnpKeSMXxuewqlSecqPOBm4_IYH6SITioO0
```

#### JWT Header

The header can be decrypted as JSON object:

```json
{
  "any-header-key": "any-value-header",
  "alg": "HS256",
  "typ": "JWT"
}
```

You can add any number of custom fields, but it's recommended to keep your token light since they'll be sent over HTTPS
on each request.
The two defined types are:

- `alg` which is the signing algorithm used. 
- `type` which is the token type, here it's JWT.

#### JWT Payload

The payload is also referred to as the [_claims_][11] of the token, what it claims to be. It's also a JSON object that can
be defined such as:

```json
{
  "name": "John Doe",
  "permissions": [
    "ROLE_DEVELOPER"
   ],
  "any-payload-key": "any-payload-value",
  "aud": "audience - recipient",
  "sub": "subject - the user",
  "iss": "issuer",
  "iat": 1636127082,
  "exp": 1636127382
}
```

In this case too, you can define your own values, for example here I have defined:

- `name` to be the name of the user sending the token
- `permissions` to hold the permissions of my user, they should match its scope (from the access token)
- `any-payload-key` because I can really put anything 🙃

The rest are some reserved field (each is a _claim_), and since this standard seems to like cryptic 3 letters key,
I added the signification as value for the example.

The `iat` is issue at time, and `exp` is expiration time in epoch milliseconds.
You can also have a `jti` which is a unique id. When set, it should enforce the single use of the token. 
(Duplicate IDs will be rejected)

### JWT Signature

The signature follow a simple [recipe][10] using the set signing algorithm:

```js
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

Here with the HMAC SHA256 algorithm, the creator of the token also makes the secret. The secret should be more 
complicated than `your-256-bit-secret` to keep unwanted folks away.
On verification, you check that the signature and the content are matching.

### Call flow

After all the theory, let's have a look in the call flow. This is an [example][7] where you first get an access token, 
then you get a JWT ID token to access the API function subsequently.
In this example the access token is obtained via client credentials (different from the authentication credential), this
is mainly used for machine-to-machine communication.

Since JWT is mostly an application token; the client and App could be both API's, one calling the other.

<div class="mermaid">
sequenceDiagram
  participant C as Client
  participant A as App
  participant S as Authorization <br> Service

  C ->> S: Use Client credentials `/oauth2/token`
  Note right of S: Validates Client ID and Secret
  S ->> C: Send access token valid 24hrs
  loop Refresh JWT
    C ->> S: Request JWT using<br> access token in header `/authorize`
    S ->> C: Send JWT valid 5min
    activate S
    A ->> C: Returns JWT 
  end 
  C -->> A: Access API using JWT via `/api/v1/endpoint`
  A -->> S: Check JWT (validity, permissions)
  S -->> A: JWT is valid
  Note right of S: After expiration the JWT <br> needs to be refreshed
  A -->> C: Returns API results
  deactivate S
</div>

So the JWT obtained here is used for both authentication following [OpenID]'s protocol, as you don't need to log
in again to interact with the App.
But also [OAuth][4] which is tied to the authentication process, because the JWT also holds some authorization 
information from the access token.

### Explanation

Let's add some implementation example now, to better explain what exactly is happening in the arrows.
Those are simplified examples for this context.

#### Access token call flow

To get the _access_token_, you would need to request it to the authorization server at `POST /oauth2/token`, which is
a standard looking [OAuth][4] compliant endpoint:

```json
{
  "body": {
    "client_id": "my-client-id",
    "client_secret": "my-client-secret",
    "grant_type": "client_credentials",
    "scope": "application.resources.read"
  }
}
```

Let's look at the body, we directly see [grant_type][12] which correspond to the way you'll get the access token 
(there are multiple grant types).
Here it's set to `client_credentials`, meaning you'll use your client id and secret to get it. This is the `client_id`
and `client_secret` specified there.
We can also use another flow and pass the client credentials encoded in Base64 in the Header (Also called via
BasicAuth aka [basic access authentication][14]).

The [client id and secret][15] belongs to the client / application, they were probably generated on account creation, or
through a setting to create an OAuth client in the App. They are used to authenticating into the App and get the 
authorization JWT token.

There's also the [scope][13], which we talked about previously which define the permission you're requesting with this
access token.

Once processed, you should retrieve an [access token][7] response such as:

```json
{
  "token_type": "Bearer",
  "access_token": "MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3"
}
```

There could be more field, depending on the type of access token, or how it has been implemented.

#### JWT call flow

Now that you have your access token, you want to get an ID token such as a JWT to get access to your API.

### Request

To get a [JWT][10] you would make a request to a standard looking [OAuth][4] compliant `/authorize` endpoint with 
your access token that you have just received.
The authorization server will compare that access token with the one on memory and if it matches send you back your JWT.
In this system, the "_authorize_" endpoint would act as both to give and [refresh][15] the JWT using the same access token.

{% raw %}
```json
{
  "header": {
    "Authorization": "Bearer {{access_token}}"
  }
}
```
{% endraw %}

Once processed you should receive a JWT, the same way you received the previous _access token_. But this time you can 
use your JWT to directly call the App!
Let's send a request `GET /api/v1/endpoint` of the APP to get some resources:

{% raw %}
```json
{
  "header": {
    "Authorization": "Bearer {{jwt_token}}"
  },
  "body":{
    "input": "API input"
  } 
}
```
{% endraw %}

As before the JWT is a `Bearer` token as defined in [OAuth RFC 6750][8], the request got authorized successfully.
We are now able to interact securely with the App. This is because our JWT is both authenticating and authorizing us
to access the API and its resources in this context.


[1]: https://auth0.com/docs/security/tokens
[2]: https://jwt.io/#debugger-io?token=eyJhbnktaGVhZGVyLWtleSI6ImFueS12YWx1ZS1oZWFkZXIiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJwZXJtaXNzaW9ucyI6WyJST0xFX0RFVkVMT1BFUiJdLCJhbnktcGF5bG9hZC1rZXkiOiJhbnktcGF5bG9hZC12YWx1ZSIsImlhdCI6MTYzNjEyNzA4MiwiZXhwIjoxNjM2MTI3MzgyfQ.CrYVOxLsqnpKeSMXxuewqlSecqPOBm4_IYH6SITioO0 "example"
[3]: https://docs.kaleido.io/kaleido-services/baf/oauth/ "JWT with OAuth flow"
[4]: https://auth0.com/docs/authorization/protocols/protocol-oauth2 "OAuth 2.0"
[5]: https://fr.wikipedia.org/wiki/OAuth
[6]: https://www.oauth.com/oauth2-servers/access-tokens/
[7]: https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
[8]: https://datatracker.ietf.org/doc/html/rfc6750
[9]: https://datatracker.ietf.org/doc/html/rfc7519
[10]: https://auth0.com/learn/json-web-tokens/
[11]: https://auth0.com/docs/security/tokens/json-web-tokens/json-web-token-claims
[12]: https://auth0.com/docs/configure/applications/application-grant-types
[13]: https://auth0.com/docs/configure/apis/scopes
[14]: https://en.wikipedia.org/wiki/Basic_access_authentication
[15]: https://auth0.com/docs/security/tokens/refresh-tokens/use-refresh-tokens
[16]: https://auth0.com/docs/authenticate/protocols/oauth
[17]: https://auth0.com/docs/secure/tokens/json-web-tokens/validate-json-web-tokens
[OpenID]: https://openid.net/connect/
