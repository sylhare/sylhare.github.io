---
layout: post
title: Contributing to a Linux 🐧 Foundation project
color: rgb(38, 78, 54)
tags: ['open source']
---

# Linux Foundation

The [Linux Foundation](http://www.linuxfoundation.org/) is a large open source non-profit organisation that promotes and foster collaborative development.

## Open Source

Readings from [Daniel Shiffman - Open Source Course](https://github.com/shiffman/Open-Source-Course-ITP):

* [What Does “Open Source” Even Mean?](https://medium.com/@kenjagan/what-does-open-source-even-mean-6bd47befe696) by Jen Kagan
* [Inessential Weirdness's in Open Source Software ](https://www.harihareswara.net/sumana/2016/05/21/0) by Sumana Harihareswara
* [Processing and FLOSS](https://medium.com/processing-foundation/processing-and-floss-d35aa4607f4c) by Casey Reas
* [A Time for Action — Innovating for Diversity & Inclusion in Open Source Communities](https://medium.com/mozilla-open-innovation/a-time-for-action-innovating-for-diversity-inclusion-in-open-source-communities-6922fef4675e) by Emma Irwin
* [How We’re Making Code of Conduct Enforcement Real — and Scaling it](https://medium.com/mozilla-open-innovation/how-were-making-code-of-conduct-enforcement-real-and-scaling-it-3e382cf94415) by Emma Irwin
* [EthicalCS: bring ethics, identity, and impact to Computer Science education](https://medium.com/@ed_saber/ethicalcs-bring-ethics-identity-and-impact-to-computer-science-education-eae5a9d4682) by Saber Khan

## ONAP

[ONAP](https://www.onap.org/) (Open Network Automation Platform) is an open source software platform that delivers capabilities for the design, creation, orchestration, monitoring, and life cycle management of
 
- Virtual Network Functions (VNFs)
- The carrier-scale Software Defined Networks (SDNs) that contain them
- Higher-level services that combine the above

### Contributing to ONAP

#### Getting access to the source code

ONAP is composed of a big [list of projects](https://gerrit.onap.org/r/#/admin/projects/) on which you can contribute to.

To have a preview of the projects you can check the mirrored repositories on [Github/onap](https://github.com/onap). As mirror you can't really contribute to them that way.

To contribute using you need to:

- Go on the ONAP's Gerrit: [gerrit.onap.org](https://gerrit.onap.org/r/#/admin/projects/)
- Create a linux foundation account (in `Account signup / management`)
- Then you need to sign in (it's a tiny `sign in` link under the `search button`).
- Create a ssh public key (like you would do on [Github]({% post_url 2017-04-19-Get-started-with-Github %})):

```bash
ssh-keygen -t rsa
```

- Add your public key in `settings/SSH Public Keys`
- test your ssh tunnel with :

```bash
ssh -p 29418 <sshusername>@gerrit.<project>.org
```

- On your project page, you should be able to clone the project using ssh.

#### Commit to the project

Each project has a JIRA project associated to it at [jira.onap.org](https://jira.onap.org). It is a good way to find things to do on a project.

To contribute and actually commit code you would need:

- Acquire the commit hook:

```bash
curl -Lo ./.git/hooks/commit-msg https://gerrit.onap.org/r/tools/hooks/commit-msg
chmod +x ./.git/hooks/commit-msg
```

- Add the files to your commit message

```bash
git add .
```

- Sign off the commit and add the issue ID to the footer (it's case-sensitive)

```bash
Fix important stuff

Change-Id: I706ec04d541925be8f04c44254379523f2085eca
Issue-ID: POLICY-389
Signed-off-by: Bob <bob@mail.com>
```

- Push your code to refs for master:

```bash
git push origin HEAD:refs/for/master
```

- It will go through a process of being reviewed, accepted. To make any change to your commit, use:

```bash
git commit --amend
```

## Sources

- [Gerrit's Guide](http://lf-releng-docs.readthedocs.io/en/latest/gerrit.html) 
- [Configuring Gerrit](https://wiki.onap.org/display/DW/Configuring+Gerrit) 
- [Commit message example](https://gerrit.onap.org/r/#/c/31483/1//COMMIT_MSG)
