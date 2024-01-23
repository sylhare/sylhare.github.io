---
layout: post
title: How to fix npm dependency hell
color: rgb(255, 111, 97)
tags: [js]
---

## Some context

NodeJS ecosystem is built on top of countless packages that sometimes feel all dependent on each other. Usually you
start up a project with all up-to-date dependencies, everything works well.

Then you get security alerts, vulnerability issues and all sorts of incentive making you update the packages whenever you
get prompted to do so by some [dependabot][1] 🤖. Until a point where the newer version introduces a breaking change, or
it is incompatible with another package you were using.

Then starts the decay! 💩 Soon most of your dependencies start to get outdated, and npm starts to sprawl endless
warnings at each installation. You are at the back of the wall, and now is time to up your sleeves and start digging, 
because you've end up... in the dependency hell.

## Path to resolution

This _dependency_ situation can happen for any reason, so don't mind me and skip ahead to the section that is most the 
appropriate.
And as always feel free to share any tips that I haven't mentioned along the way.

### 1. The Audit trap

Npm has an audit functionality that can be used to identify which packages are responsible for the vulnerabilities. The
easy fix is to use the `npm audit fix` which will look for updates that can be updated to fix those automatically.
But it only changes dependencies in the `package-lock.json` and you might be better off updating the parent dependency
in the `package.json` instead to keep it consistent.

You don't have to blindly update everything at once just to realize that everything is now broken, take it step-by-step
one vulnerability at a time using:

```shell
npm update {dependency}
```

This way you'll be able to update the dependency to the latest version that is not a breaking change, run the tests, 
build and compile if you are using typescript, to make sure everything is still ok.

But that's to avoid the problems, 😈 so let's see how to identify the problems when things start breaking.

### 2. Check your package.json and package-lock.json

The `package.json` is used to add the direct dependencies of your project. Then the [package-lock.json][2] is used to
mark the dependencies of your dependencies, usually called the _dependency tree_. This tree is used for the dependency
resolution.

Here is a schema to describe it:

<div class="mermaid">
flowchart LR
  subgraph your package
    direction TB
    P[package.json] --> |" A, B, C "| PL[package-lock.json]
  end

  subgraph deps[Dependencies]
      direction TB
      subgraph DA[Dependency A]
        PA[package.json]
      end

      subgraph DB[Dependency B]
        PB[package.json]
      end

      subgraph DC[Dependency C]
        PC[package.json]
      end
  end

  subgraph DS[Sub Dependency S]
    PS[package.json] 
    %% --> PSL[package-lock.json]
  end

  R{npm \n resolves}
  PA --> |v2.5.3| R
  PB --> |v3.2.0| R --> DS 

  DC --> | npm i depC | P
  DS --> |" S (v2.5.3) "| PL
  deps --> | npm i depA depB | P
</div>

You can see that the sub dependency got resolved to a specific version which is then saved in the `package-lock.json`.

### 3. Check what's installed

Sometimes the `package-lock.json` doesn't reflect what's actually installed in the `node_modules/.`. That can happen
when installing some packages, and discarding the changes on the lock files. Or any other reason after some manual
changes.

To see what's directly installed, use the [listing command][3] of npm:

```bash
# List all packages locally installed
npm list
npm list {package} 
# Show latest registry version
npm view {package}
```

This will show you precisely what has been installed. It will also warn you if something is missing or invalid.

### 4. Update a package

Usually between major versions of a package (like from v3.x.x to v4.x.x), they may very likely be some breaking change.
Meaning your project won't build or some tests will fail In those case you should check:

- _Which version of the package has been installed?_
  - Update/Set the wanted version in your package
  - Update dependencies breaking to a version where their dependency matches the installed package's version  
- _What are the breaking changes coming with it?_
  - Implement the recommended update from the package's documentation

When using yarn, the `npm update` equivalent is `yarn upgrade`, different name, same behaviour. But don't mix yarn and
npm when updating your packages, stick with one.

Also, if you have two dependencies using two different major versions, you might be able to resolve on a version, but
your project may not behave like expected.

> For example, some tests may start failing for weird reason, saying that some unknown method "_is not a function_".

Then try to update the version of your dependencies, so they depend on the same sub dependencies' version. You can check
directly in the `node_modules/*` or using `npm list package`.

### 5. Refresh your package-lock.json

After updating your dependencies, installing and removing some modules, you may realize that your package-lock did not
necessarily follow everything. It may still contain unused packages, and you would like to refresh it without bothering
with re-installing the node modules.

For that use the [--package-lock-only][5] arguments when installing:

```shell
npm i --package-lock-only
```

Bear in mind that it is not synced with the already installed node modules. You can also use [dedupe][7] command which 
attempts to simplify the package structure by moving dependencies further up the tree when possible:

```shell
npm dedupe
```

Keep in mind that when you delete and re-install the package-lock, it may change as dependencies are resolved differently 
if it has been some time since you last updated, which leads us to the next section.

### 6. Working for everyone but you

You are cursed!! Don't go into desperation _Why only me!?_, let's try something.
Now that the project have been updated, and it works for everybody but you 🥲. You might just have messed up
everything on your PC, don't worry though, it won't stay like that forever.

Using [git][10], if you have modified the package* files on your local machine, just discard the changes and fetch the 
latest working version:

```
git checkout package-lock.json
git checkout package.json
```

Without git 💀 ...ahem, here copy over the matching `package.json` and `package-lock.json` from a trusted friend 🌞
from whom it is working and run:

```
npm ci
```

This will do a [clean installation][4] of the modules, removing the previous node modules and won't try to update the
dependencies (which can happen with `npm install`).

### 7. Make a plugin? Add its peer

Another thing you can do for the future to avoid dependency problems when you work with your own packages and plugins.
Make sure you start using the `peerDependencies`. You can use the [peer dependency][6] in your `package.json` such as:

```json
{
  "name": "plugin for depC",
  "version": "1.4.7",
  "dependencies": {
    "depA": "^2.5.1",
    "depB": "^0.12.9"
  },
  "peerDependencies": {
    "depC": "1.4.x"
  }
}
```

Peer dependency is used, for example, by plugins, it's a bit like for DLC in games, you can't install the DLC if you don't
have the game. Well you can't install the plugin (_plugin for depC_) if you don't have its peerDependency; the
library (_depC_).

It's a concept different from the `dependencies` because the plugin could work on its own and while being linked to
another package, does not depend on it. The `devDependencies` is also not a good candidate, because it is usually used
for packages that are only used in your tests. So the `peerDependencies` are the only way to display that link between
plugin and its _host_ library.

In our case we use a flexible version (`"1.4.x"`)for the pear dependency to avoid unnecessary conflicts Now by default
with npm v7+ the peer dependencies are installed automatically.

### 8. Handle multiple common dependencies

When multiple of your dependencies relies on different versions of the same package, there could be some interferences.
To force a version on certain package, you can use the `overrides` which will force a specific version.

```json
{
  "overrides": {
    "mongoose": {
      "mongodb": "^5.7.0",
      "bson": "^5.4.0"
    }
  }
}
```

Here I'm forcing the mongoose package to use those versions of `mongodb` and `bson` so it matches other dependencies 
defined in my package.json.
You will need to run `npm i` once again, and if it doesn't work (as it may), delete the _package-lock.json_ and *node_nodules*,
before installing it again.


[1]: https://github.com/dependabot
[2]: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json
[3]: https://docs.npmjs.com/cli/v8/commands/npm-ls
[4]: https://docs.npmjs.com/cli/v8/commands/npm-ci
[5]: https://docs.npmjs.com/cli/v8/commands/npm-install#description
[6]: https://nodejs.org/en/blog/npm/peer-dependencies/
[7]: https://docs.npmjs.com/cli/v8/commands/npm-dedupe
[10]: {% post_url 2022/2022-05-18-Version-control-git %}
