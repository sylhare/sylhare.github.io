---
layout: post
title: Testing web applications with Cypress
color: rgb(239, 192, 80)
tags: [js]
---

## Introduction

[Cypress](https://www.cypress.io/) is a testing tool using [Mocha](https://mochajs.org/) test framework under the hood.
It runs as a browser application enabling cross browser testing. It works on MAC, Linux, Windows.
But it also it means it is hard to test what is happening from the outside world.

For example css events are not yet all "testable". Cypress check the DOM and js modifications in the page.
It still allows to perform end to end tests and in a certain limit unit tests.

My only issue is that cypress is takes much longer to test. 
And I would not suggest to write unit tests with it.


## Configuration

Here, let's talk about the configuration. 
Even though, it's all preconfigured and should work right out of the box.
I have added few lines for features that was not necessary in my case (for a small app).

Let's talk about how cypress is structured:

```groovy
.
├── fixtures                # Data for tests
│   └── example.json
├── integration             # Where you put your tests
│   ├── website.spec.js
│   └── feature.spec.js
├── plugins                 # For special commands, plugins configuration for frameworks
│   └── index.js
├── support
│   ├── commands.js         # Commands to reuse in tests
│   └── index.js            # For other configurations
└── cypress.json            # Optional for other configurations
```  

To disable screenshots on failure you can add in `support/index.js` this:

```js
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: false,
});
```

To disable the video, because cypress can record your tests being run in the browser.
Add a `cypress.json` file with this in it:

```json
{
  "video": false
}
```

## Basic test

You will see that the test syntax is pretty similar to any other js test framework.
The Cypress syntax is very simple.
Basically you get a url, get something in the page and check value, style, and more.

```js
describe('My First Test', () => {
  it('Gets, types and asserts', () => {
    cy.visit('https://example.cypress.io')

    cy.contains('type').click()

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/commands/actions')

    // Get an input, type into it and verify that the value has been updated
    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com')
  })
})
```

Cypress is full of nice feature to test the layout of your website. 
And each of them are nicely [documented](https://docs.cypress.io/api/api/table-of-contents.html)

## Tips and tricks

Here is how you should add your cypress commands in your `package.json`.

```json
  "scripts": {
     "cy:run": "cypress run",
     "cy:open": "cypress open"
  }
```

The `cypress run` allows you to run "headless" all cypress tests in the `integration` folder.
So it is fully compatible with a CI/CD pipeline.
The `cypress open` is a great feature when debugging, because it starts an interactive window where you can
select the tests suite you want to run, and display the live test output in a browser.
You can see where it failed, how and what it looked liked.
