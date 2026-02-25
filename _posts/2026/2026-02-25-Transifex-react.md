---
layout: post
title: React localization made easy with Transifex
color: rgb(23, 16, 76)
tags: [react]
---

[Transifex][1] is a cloud-based localization platform that helps developers manage translations for their applications.
It is like a centralized hub where you can manage all your app's text strings,
collaborate with translators, and sync translations back to your application.
The aim is to make it easy to render in multiple languages.

## What is Transifex?

While there is a paid feature (that comes with a free tier for less than 1000 words),
which allow you to get or fix new translation without redeploying your app, there's also a completely offline support.
Which is supported by their open source [javascript][3] or [react][4] libraries.

So you can get up to speed with the library and choose to continue running offline handling JSON files like you may have done in the past.
And when you are ready or if eventually the pain accumulates choose to upgrade to one of the [tier][2].
With a paid tier, you have a token and your app can fetch translation directly from Transifex which allow for
easier management of the localization.

## Setup

Let's start by installing the necessary [packages][5].

```bash
npm install @transifex/native @transifex/react
```

- **@transifex/native**: Core functionality for translation management
- **@transifex/react**: React-specific components and hooks

With these installed, we're ready to start localizing 🌍

## Translation

### Using `<T>` react component

Now that we have Transifex installed, let's dive into actually translating text. 
The most fundamental building block is the `<T>` component, which stands for "Translation". 
Think of it as a wrapper that tells Transifex "this text needs to be translated."

Here's the simplest possible example:

```tsx
import { T } from '@transifex/react';

function Greeting() {
  return (
    <div>
      <T _str="Hello, World!" />
    </div>
  );
}
```

Notice the `_str` prop? This is where you provide the text to be translated. 
When your app loads, Transifex will look for a translation of "Hello, World!" in the current language. 
If it finds one, it displays the translation. If not, it shows the original English text as a fallback.

> **Why the underscore?** Props starting with `_` are Transifex-specific metadata and won't be passed down to the rendered element. 
This keeps your HTML clean.

### String Props with `useT()`

Here's a problem you'll encounter quickly: 
- What if you need translated text in a place where you can't use a React component?

Consider an input field:

```tsx
// ❌ This doesn't work - placeholder needs a string, not a component
<input placeholder={<T _str="Search..." />} />
```

The `<T>` component returns a `ReactNode` (a React element), but many HTML attributes like `placeholder`, 
`title`, and `aria-label` expect a plain string. 

This is where the `useT()` hook becomes essential, because it returns the plain string. 

```tsx
import { useT } from '@transifex/react';

function Example() {
  return (<input placeholder={useT('Search...')} />)

}
```

## Managing your localization

### Centralize

If you worked with localization before, you know that using raw strings is not ideal, and transifex handles it too.
By default, the localization is mapped through the fallback translation (the one available in the code using `_str`).
But if you change the fallback, it could also snowball into all translation failing to be mapped.

```tsx
const TRANSLATION = {
  HELLO_WORLD: {
    key: 'hello.world',
    str: 'Hello, World!',
  }
};

function Greeting() {
  return (
    <div>
      <T _str={TRANSLATION.HELLO_WORLD.str} _key={TRANSLATION.HELLO_WORLD.key} />
    </div>
  );
}
```

With this approach, translators work with stable keys that never change. 
If you want to update the English text, you only change the translation string while keeping the same key.

The way it works is that it will use the `_key` to find the matching translation, 
if not found it will use `_str` as a fallback, and if not there it will display the `_key` directly.
For the best user experience, use both `_str` (with a readable source string) and `_key` (with your translation key identifier).

### Variable Interpolation

Variable interpolation allows you to inject dynamic values into your translated strings.
Here is the do and don't when working with it:

```tsx
// ❌ Don't do this - breaks translations
<T _str="Hello, " />{username}<T _str="!" />
// ✅ Do this - pass username
<T _str="Hello, {username}!" username={username} />
```

Tansifex looks at the string `Hello, {username}!` and finds the placeholder `username` wrapped in curly braces.
When translating, it changes the string but keep the placeholder where it makes sense.

> For example in Japanese, the username would be at the beginning
>   - English: `"Welcome back, {username}!"`
>   - Japanese: `"{username}さん、おかえりなさい！"`


### Pluralization

Different languages have different plural rules. English has two forms (1 item vs 2 items),
but other languages can have zero, one, few, many, and other forms (like in Polish or Arabic).
Transifex Native uses the industry-standard ICU MessageFormat to handle this complexity automatically.

Here's how to display "1 notification" vs "5 notifications" correctly:

```tsx
    <T
      _str="{count, plural, one {# notification} other {# notifications}}"
      count={count}
    />
```

Transifex looks at the string and sees the plural pattern `{count, plural, one {# notification} other {# notifications}}`.
It checks the count value you passed:
- **1**: Since the count is 1, it selects the "one" pattern which is `# notification`.
  Then it replaces the `#` symbol with the actual count value, so what appears on the page is *"1 notification"*.
- **5**: It sees count is 5, which doesn't match "one", so it falls back to the "other" pattern: `# notifications`.
  It replaces `#` with 5, and the page displays *"5 notifications"*.

Transifex automatically picks the correct form based on the language's grammar rules.
You just provide the count, and Transifex handles the rest.


## Language Switching

So far, we've learned how to mark text for translation and inject dynamic values. 
But how do users actually switch between languages? This section covers setting up language switching.
We are using [nextjs][6] for our app example.

### Setting Up the Provider

First, create a provider component that initializes Transifex and loads translations. 
This component wraps your entire application:

```tsx
import { tx } from '@transifex/native';
import { TXProvider } from '@transifex/react';
import { useEffect, useState } from 'react';
import translations from './translations';

function TransifexProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    tx.init({
      token: '',
      currentLocale: 'en',
    });

    Object.entries(translations).forEach(([locale, strings]) => {
      Object.entries(strings).forEach(([key, value]) => {
        tx.cache.update(locale, { [key]: value });
      });
    });

    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <TXProvider tx={tx}>{children}</TXProvider>;
}
```

In there we initialize the provider and load translations into cache, the `token` is empty since we are in local development.
We also have the translations hard coded into the code and imported instead of a JSON for the example.

> When you call `tx.cache.update(locale, translations)`, you're storing translations in memory for instant access.

This cache is the secret to why language switching is so fast, no network requests, no file reads, just a simple lookup in memory.
We could rely on the Transifex server to fetch latest live translation as well.

Wrap your entire app at the root level:

```tsx
import { TransifexProvider } from './TransifexProvider';

function App() {
  return (
    <TransifexProvider>
      <YourApp />
    </TransifexProvider>
  );
}
```

**Important:** Every component that uses `<T>` or `useT()` must be inside this provider. 
If you try to use them outside, you'll get an error.

### Creating a Language Switcher

Now that translations are loaded, let's build a UI component that lets users switch languages.

```tsx
import { useLocale } from '@transifex/react';
import { tx } from '@transifex/native';

function LanguageSwitcher() {
  const locale = useLocale();
  const currentLocale = String(locale);

  const handleLanguageChange = (langCode) => {
    tx.setCurrentLocale(langCode);
  };

  return (
    <div>
      <p>Current Language: {currentLocale}</p>
      <button onClick={() => handleLanguageChange('en')}>English</button>
      <button onClick={() => handleLanguageChange('es')}>Español</button>
      <button onClick={() => handleLanguageChange('fr')}>Français</button>
    </div>
  );
}
```

Let's break down what's happening:

- **`useLocale()` Hook**: Returns the current language code (e.g., "en", "es", "fr")
- **`tx.setCurrentLocale(langCode)`**: Changes the current language, this triggers a re-render of all `<T>` components (no page reload)
  - Don't try to call `locale.setCurrentLocale` make sure to use the `tx` one.




[1]: https://www.transifex.com/
[2]: https://www.transifex.com/pricing/
[3]: https://github.com/transifex/transifex-javascript
[4]: https://github.com/transifex/transifex-javascript/tree/master/packages/react
[5]: https://developers.transifex.com/docs/native
[6]: https://nextjs.org/docs