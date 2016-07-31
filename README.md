# yellfy-use

> User-friendly `require` function for Yellfy project.

[![Travis Status](https://travis-ci.org/mrmlnc/yellfy-use.svg?branch=master)](https://travis-ci.org/mrmlnc/yellfy-use)

## Install

```shell
$ npm i -D yellfy-use
```

## Why?

In order to describe dependencies of tasks easier. Without `const` and `require`.

## Usage

```js
const gulp = require('gulp');
const Use = require('yellfy-use');

global.use = new Use(gulp).use;

const $ = use('gulp-less', 'camelcase', 'very-long-name as shortName');

console.log($);
// {
//   gulp: [function],
//   _: {},
//   less: [function],
//   camelcase: [function],
//   shortName: [function]
// }
```

## Supported options

**gulp**

  * Type: `Object`
  * Default: `undefined`

The gulp instance to use.

**dependencies**

  * Type: `Boolean`
  * Default: `false`

Check dependencies in the `dependencies` section.

**devDependencies**

  * Type: `Boolean`
  * Default: `false`

Check dependencies in the `devDependencies` section.

**helperDir**

  * Type: `Boolean`
  * Default: `false`

The directory that helpers are located in.

**reporter**

  * Type: `Function`
  * Default: `>> Use 'npm i -D ...'`
  * Example: `reporter: (toInstall) => console.log(toInstall)`

Custom reporter.

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/yellfy-use/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
