---
layout: post
title: Using Nx to build a multilang monorepo
color: rgb(223 71 210)
tags: [misc]
---

We have talked previously about creating a [multi-package typesript project][10] using only node's workspace feature.
This could be considered as a monorepo where you'd have an application with some libraries.
However, if you want to scale up, this simple setup may not be enough.

That's why today I am looking into [Nx][1], which is a tool that helps you build and manage your monorepo!
It's js based (written in typescript), but it can also take care of multiple languages like Kotlin, Go, and Python.

I have come across the _Nx_ [monorepo tools][2] website which explains the reasoning behind using monorepo and,
enumerates the different tools available for monorepo management.
So check it out, for more information! (though since it's from Nx, you might be biased into using it).

## Setup

Install Nx with the following command:

```shell
npm install -g nx
```

It needs to be installed globally or the CLI might get stuck.
You may need other plugins for different languages, but they don't need to be installed globally
and can be added once the monorepo is created.

## Creating the Monorepo

Create a new workspace with the following command (using yarn for the monorepo installation).
You can use `--preset=empty` if you don't want any plugins installed.

```shell
npx create-nx-workspace@latest --pm yarn
```

In my case, this monorepo will need a frontend, so I don't mind starting by setting the out-of-the-box
typescript project.

By default, Nx creates the monorepo in a subfolder, this will be the name of the workspace.
Then you can set the app's name you want like _frontend_ if we are creative 🙃.

Finally, you must set `Integrated Monorepo` when asked the project kind:

```properties
$ Integrated monorepo, or standalone project? … 
Integrated_Monorepo:  Nx creates a monorepo that contains multiple projects.
Standalone:           Nx creates a single project and makes it fast.
```

This will set up your project as a monorepo, otherwise it will just be a Nx standalone project.

## Adding a new project

If you are having an issue, check out the common problem section of the article to help you out!

### Adding the backend

Now that you have the monorepo setup, we can add a new project to it.
Since my backend will not be in typescript but go, I will add the `nx-go` dependency to the project.
Though we could use `yarn` to add the dependency, the `nx` command is preferred as it also configures the `nx.json`
which has the project configuration.

```shell
nx add @nx-go/nx-go --save-dev
```

This happens at the root of the monorepo and thus is not mixed with my frontend project.
Then you can create a new project with the following command:

```shell
nx g @nx-go/nx-go:application backend --directory apps/backend
```

Now we should have out monorepo setup with the frontend and backend projects.

```coffee
.
├── README.md
├── apps
|   ├── backend
|   └── frontend
├── node_modules
├── nx.json
├── package.json
└── yarn.lock
```

Depending on the framework you use, you might have more or less files at the base, but the structure should be similar.
There are no libraries at the moment, but they could be added in a `libs` folder using `nx g lib`.

### Adding the e2e 

If you used the `create-nx-workspace` command, 
you might already have been prompted with creating an e2e project for the frontend.
But let's review how to do it manually, because it is not as [straightforward][4]!

To add the e2e project, find the framework you want to use, for example _playwright_ and _cypress_ have
both plugins for Nx.
Since I am familiar with [cypress][2] I will add it to the monorepo, starting by its plugin.

```shell
nx add @nx/cypress --dev
```

Now this plugin has two generators that could be interesting:
- *configuration* : Add a Cypress E2E Configuration to an existing project.
  - Will configure a project to be an e2e project.
- *component-configuration* : Set up Cypress Component Test for a project
  - Will add a cypress folder within a project.

So if I want to create a new `e2e` project for the frontend, I would do the following:

1. Create a new project folder in `apps` called `e2e`
2. Add a `project.json` file in the `e2e` folder with the following content:
    ```json
    {
      "root": "apps/e2e",
      "sourceRoot": "apps/e2e/src",
      "projectType": "application",
      "implicitDependencies": ["frontend"]
    }
    ```
3. Run the following command to add the e2e project:
    ```shell
    nx generate @nx/cypress:configuration --project e2e --devServerTarget=frontend:dev --baseUrl=http://localhost:3000
    ```
    - The project `e2e` is the one you created
    - The devServerTarget is the command to serve the frontend.
    - The baseUrl is the url where the frontend is served.

It will ask you for a bundler, I chose the same as the frontend for consistency.
In the `cypress.config.ts` created, 
you can add more `webServerCommands` to run the e2e tests as well as CI specific commands.

## Command your Nx monorepo

Now that it is all setup, you might want to try and test things out to see if indeed the configuration is correct.
So let's review the command that will be useful for your development process.
They are all meant to be run from the root, using `nx` as the command.

Those commands are mapped (thanks to the plugins) and defined in the `nx.json` file at the root of the monorepo.

### Run an application

Here is how you would run the frontend:

```shell
# start the frontend in dev mode
nx dev frontend

# start the frontend in production mode
nx build frontend
nx start frontend
```

### Run the tests

For the unit tests, you can run the following command:

```shell
nx test frontend
```

And for the e2e cypress tests we added you can use:

```shell
nx e2e e2e
```

In our case the project's name is `e2e` so it looks a bit funny. 
Although it's called by default `frontend-e2e` when using the create workspace command,
I wanted to e2e test my backend within the same project. 
But there might be a better option or better names!

## Common problems

Here are some problems you might face and how to solve them.
Most of the time I referred to the [nx-recipe][5] which provides working example of different nx configuration.
So you can always compare what you are trying to do and how it was set up there for help.

### Nx unresolved error

> **[ NX ]**  Unable to resolve @nx/plugin:generator

This could be that the plugin is not installed, so make sure you run:

```shell
yarn add @nx/plugin --dev
```

Or that the generator (or whichever) does not exist, so either you have made a typo or it's called differently.
But with AI-generated answers, it could be that the command you are trying is totally wrong.
So use this command to list the action you can do:

```shell
nx list @nx/plugin
```

Then you will see the generators, executors and so on of that builder with a small description.
For example here, it could be that you had to use `generate-project` and not `generator`.

```properties
[ NX ]  Capabilities in @nx/plugin:

GENERATORS

generate-project : Create a [Plugin] based project
```

### Nx read property error

> **[ NX ]**  Cannot read properties of null (reading 'length')

I encountered this error because I was trying to use the configuration generator from the cypress plugin,
before creating the project.
Some plugins create the project for you some don't, and the documentation makes it ambiguous for a newcomer.

This usually means that there's a missing configuration in the `project.json` of the target project.

### Nx failed to process project graph

> **[ NX ]**  Failed to process project graph. Run "nx reset" to fix this. Please report the issue if you keep seeing it. See errors below.

This could be for multiple reasons:
- You have made a typo in the project configuration.
- You passed the wrong attributes to a plugin, and it failed to process the project.
- There is a typo in the `nx.json` file which defines the monorepo at the root.
- You have a circular dependency in your project (both projects depend on each other).

[1]: https://nx.dev/
[2]: https://monorepo.tools/
[3]: https://nx.dev/nx-api/cypress/documents/overview#setting-up-nxcypress
[4]: https://emilyxiong.medium.com/add-cypress-playwright-and-storybook-to-nx-expo-apps-1d3e409ce834
[5]: https://github.com/nrwl/nx-recipes/tree/main
[10]: {% post_url 2023/2023-06-22-Typescript-monorepo %}