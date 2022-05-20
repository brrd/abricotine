# dictionary-es-pr

Spanish (or Castilian; Puerto Rico) spelling dictionary.

## What is this?

This is a Spanish (or Castilian; Puerto Rico) dictionary,
generated by [`wooorm/dictionaries`][dictionaries] from
[`sbosio/rla-es`][source],
normalized and packaged so that it can be installed and used like other
dictionaries.

## When should I use this?

You can use this package when integrating with tools that perform spell checking
(such as [`nodehun`][nodehun], [`nspell`][nspell]) or when making such tools.

## Install

In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install dictionary-es-pr
```

## Use

```js
import dictionaryEsPr from 'dictionary-es-pr'

dictionaryEsPr(function (error, esPr) {
  if (error) throw error
  console.log(esPr)
  // To do: use `esPr` somehow
})
```

Yields:

```js
{dic: <Buffer>, aff: <Buffer>}
```

Where `dic` and `aff` are [`Buffer`][buffer]s for `index.dic` and `index.aff`
respectively.

## Examples

See the [monorepo readme][dictionaries] for examples.

## Types

This package is typed with [TypeScript][].

## Contribute

See the [monorepo readme][dictionaries] for how to contribute.

> 👉 **Note**: dictionaries are not maintained here.
> Report spelling problems upstream ([`sbosio/rla-es`][source]).

## License

Dictionary and affix file: [(GPL-3.0 OR LGPL-3.0 OR MPL-1.1)](https://github.com/wooorm/dictionaries/blob/main/dictionaries/es-PR/license).
Rest: [MIT][] © [Titus Wormer][home].

[hunspell]: https://hunspell.github.io

[nodehun]: https://github.com/nathanjsweet/nodehun

[nspell]: https://github.com/wooorm/nspell

[macos]: https://github.com/wooorm/dictionaries#example-use-with-macos

[source]: https://github.com/sbosio/rla-es

[npm]: https://docs.npmjs.com/cli/install

[dictionaries]: https://github.com/wooorm/dictionaries

[mit]: https://github.com/wooorm/dictionaries/blob/main/license

[buffer]: https://nodejs.org/api/buffer.html#buffer_buffer

[home]: https://wooorm.com

[typescript]: https://www.typescriptlang.org