---
layout: post
title: LDAP Mysteries
color: rgb(145, 145, 233)
tags: [database]
---

## What is LDAP

{% include aligner.html images="ldap.png" column=1 %}

### More about the Concepts

[LDAP](https://ldap.com/) is the Lightweight Directory Access Protocol,also referred as [X.500](https://en.wikipedia.org/wiki/X.500) 
(Which is a series of computer networking standards covering electronic directory services.) 
It is open source and uses standard mechanism for interacting with directory servers.

[Directory servers](https://en.wikipedia.org/wiki/Directory_service) is used to store a wide variety of information 
(network resources, users, groups and even access control).
The most famous one would be [Microsoft's Active Directory](https://en.wikipedia.org/wiki/Active_Directory), 
but you can also find some others like the [Oracle Internet Directory](https://en.wikipedia.org/wiki/Oracle_Internet_Directory),
and even famous open source one's like [Apache Directory](https://en.wikipedia.org/wiki/Apache_Directory) or [OpenLDAP](https://en.wikipedia.org/wiki/OpenLDAP).

A directory service (server by extension) is a general term, for example the [DNS](https://www.ietf.org/rfc/rfc1034.txt) is the first directory service on the internet.
So the directory servers we are interested in are the one that implements the LDAP protocol.

> LDAP usually refers to the directory server implementing the LDAP protocol. 

### Data Structure

LDAP is very hierarchical with a [tree](https://www.pks.mpg.de/~mueller/docs/suse10.1/suselinux-manual_en/manual/sec.ldap.tree.html) like data structure.
It makes it very fast to read and slower to write.

An example of a LDAP directory information tree (DIT) could look like:

```bash
dc=org
└── dc=spring
    └── dc=example
        ├── ou=groups
        │   ├── cn=developers
        │   └── cn=sysadmin
        └── ou=people
            ├── uid=ben
            ├── uid=bob
            └── uid=joe

```

Since it a tree, you can see a main branch `dc=example,dc=spring,dc=org`. 
This could be considered as the base branch of the LDAP structure.

The leaves are the entry, for example _bob_:
  
  - The complete path which unambiguously identifies is called _distinguished name_ or DN and is `uid=bob,ou=people,dc=example,dc=spring,dc=org`.
  - A single node along the path to this entry is called _relative distinguished name_ or RDN (We can have RDN `uid=bob,ou=people` from base `dc=example,dc=spring,dc=org`)
  

### Attributes

The LDAP data structures uses attributes on each leafs that are defined in a schema [rfc4519](https://tools.ietf.org/html/rfc4519).
Depending on the LDAP implementation you can add new attributes on top of the default ones from [rfc2253](https://tools.ietf.org/html/rfc2253):

     String  X.500 AttributeType
    ------------------------------
    CN      commonName
    L       localityName
    ST      stateOrProvinceName
    O       organizationName
    OU      organizationalUnitName
    C       countryName
    STREET  streetAddress
    DC      domainComponent
    UID     userid

An attribute is a map of `key: value` in the entry.

## Example

### Search with ldapsearch

One of the best tools to explore your LDAP, is by using the tool __[ldapsearch](https://docs.ldap.com/ldap-sdk/docs/tool-usages/ldapsearch.html)__.
It is a commandline tool that should already be in most default distribution of Linux based OS.

Here is an example:

```bash
ldapsearch -x \
-H ldap://ldap.example.org \                             # ldap url
-b "ou=groups,dc=example,dc=spring,dc=org" \             # ldap branch
-D "uid=bob,ou=people,dc=example,dc=spring,dc=org" \     # ldap bind user
-w password                                              # ldap bind password
("cn=developers")                                        # The search filter 
```

Find more usage examples on [oracle](https://docs.oracle.com/cd/E19693-01/819-0997/auto45/index.html) documentation.
The result are returned in the LDIF format.

### Example LDIF

LDIF is the LDAP Data Interchange Format from [rfc2849](https://tools.ietf.org/html/rfc2849).
It can be used to export and import ldap entries. The possibility are wides.

Here is an example of our top branch with the dc; Domain Component:

```yaml
dn: dc=example,dc=spring,dc=org
objectClass: top
objectClass: domain
dc: spring
```

Here would be how you define the ou; Organizational Units: 

```yaml
dn: ou=groups,dc=example,dc=spring,dc=org
objectclass: top
objectclass: organizationalUnit
ou: groups
```

Here is an example of a user defined by its userId (we could use the cn; Common Name as well in the dn; distinguished name):

```yaml
dn: uid=bob,ou=people,dc=example,dc=spring,dc=org
objectclass: top
objectclass: person
objectclass: organizationalPerson
objectclass: inetOrgPerson
cn: Bob Hamilton
sn: Hamilton
uid: bob
userPassword: bobspassword
```

Here we can have a group with its members.

```yaml
dn: cn=developers,ou=groups,dc=example,dc=spring,dc=org
objectclass: top
objectclass: groupOfUniqueNames
cn: developers
ou: developer
uniqueMember: uid=ben,ou=people,dc=example,dc=spring,dc=org
uniqueMember: uid=bob,ou=people,dc=example,dc=spring,dc=org
```

Find out more about LDIF on [oracle](https://docs.oracle.com/cd/B14099_19/idmanage.1012/b15883/ldif_appendix002.htm) documentation.


### Actual LDAP Query

You can use a GUI or like SQL enter query to get information you want out of your LDAP directory server.

It is useful when you'd want to understand a `ldapsearch` search filter. 
But the syntax can be quite complicated, here would be an example for Microsoft's AD implementation:

```lisp
(&(objectClass=user)(sAMAccountName=user@example.spring.org)
(memberOf=CN=developers,OU=people,DC=example,DC=spring,DC=org))
```

You can find more about the syntax in [rfc4516](https://tools.ietf.org/html/rfc4516) and hopefully make sense of it all for your own use case.
LDAP is quite a widely used protocol so resources and help should not be too hard to get.

## Misc.

And finally some useful links if you want to implement it or better understand its data structure at the bytes level:

Spring [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)
LDAPv3 [Encodign reference](https://ldap.com/ldapv3-wire-protocol-reference-asn1-ber/)
Basic Encoding Rule [variable length](http://www.csc.villanova.edu/~cassel/netbook/ber/node4.html#SECTION00011200000000000000)
LDAP packet and rfc [references](www.selfadsi.org/ldap.html)





