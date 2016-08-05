'use strict';

import * as assert from 'assert';

import { Use } from './use';

describe('Dependencies', () => {

  it('Should work with default settings.', () => {
    const $ = new Use({ gulp: null }).use('mocha');

    assert.ok($.mocha);
  });

  it('Should work with all the dependencies.', () => {
    const $ = new Use({ gulp: null, dependencies: true }).use('tslint');

    assert.ok($.tslint);
  });

  it('Should work with multiple dependencies.', () => {
    const $ = new Use({ gulp: null, dependencies: true }).use('mocha', 'tslint');

    assert.ok($.mocha && $.tslint);
  });

  it('Should remove the prefix name of the plugin.', () => {
    const $ = new Use({ gulp: null }).use('gulp-tap');

    assert.ok($.tap);
  });

  it('Should rename the dependency, as the user wants.', () => {
    const $ = new Use({ gulp: null }).use('gulp-tap as custom-Tap');

    assert.ok($['custom-Tap']);
  });

  it('Should work with a custom reporter.', () => {
    const loader = new Use({
      gulp: null,
      reporter: (toInstall) => {
        assert.equal(toInstall.length, 2);
        assert.ok(toInstall.indexOf('pikachu') !== -1);
      }
    });

    loader.use('yellfy', 'pikachu as error');
  });

});

describe('Helpers', () => {

  it('Should fail if directory of the helpers does not exist.', () => {
    try {
      new Use({ gulp: null, helperDir: './notExists' }).use('gulp-tap');
    } catch (err) {
      assert.ok(err.message.indexOf('Helpers are not loaded.') !== -1);
    }
  });

  it('Should successfully load helpers.', () => {
    const $ = new Use({ gulp: null, helperDir: './test/success' }).use('gulp-tap');

    assert.ok($.helpers.logger);
  });

  it('Should fail when loading the helper that contains the error.', () => {
    try {
      new Use({ gulp: null, helperDir: './test/fail' }).use('gulp-tap');
    } catch (err) {
      assert.ok(err.message.indexOf('An error occurred while loading the package') !== -1);
    }
  });

});
