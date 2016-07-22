'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as camelcase from 'camelcase';
import * as chalk from 'chalk';

export interface IUseOptions {
  gulp: any;
  dependencies?: boolean;
  devDependencies?: boolean;
  helperDir?: string;
  reporter?: (toInstall: string[]) => void;
}

export interface IUse {
  options?: IUseOptions;
}

export class Use implements IUse {

  constructor(public options: IUseOptions) {
    if (!this.options.reporter) {
      this.options.reporter = this.reporter;
    }
    if (!this.options.dependencies) {
      this.options.dependencies = false;
    }
    if (!this.options.devDependencies) {
      this.options.devDependencies = true;
    }
  }

  public use(...modules: string[]): any {
    const projectDependencies = this.getProjectDependencies();

    const toInstall = modules.filter((dep) => {
      return projectDependencies.indexOf(dep) === -1;
    });

    if (toInstall.length) {
      return this.options.reporter(toInstall);
    }

    const projectHelpers = this.getProjectHelpers();

    const deps: any = {
      gulp: this.options.gulp,
      _: projectHelpers
    };

    modules.forEach((dep) => {
      const name = this.renameModuleName(dep);

      try {
        deps[name] = require(dep);
      } catch (err) {
        return this.options.reporter([dep]);
      }
    });

    return deps;
  }

  private getProjectDependencies(): string[] {
    let fileData: string;
    try {
      fileData = fs.readFileSync('./package.json', 'utf8');
    } catch (err) {
      throw new Error(`Unable to read 'package.json' file. Error: ${err}`);
    }

    let packageJsonData: any = {};
    try {
      packageJsonData = JSON.parse(fileData);
    } catch (err) {
      throw new Error(`JSON Parsing Error: ${err}`);
    }

    let packageDependencies: string[] = [];
    if (this.options.dependencies) {
      packageDependencies = packageDependencies.concat(Object.keys(packageJsonData.dependencies));
    }

    if (this.options.devDependencies) {
      packageDependencies = packageDependencies.concat(Object.keys(packageJsonData.devDependencies));
    }

    return packageDependencies;
  }

  private reporter(toInstall: string[]): void {
    console.log(`${chalk.red('>>')} Use 'npm i -D %s'`, toInstall.join(' '));
  }

  private renameModuleName(name: string): string {
    return camelcase(name.replace(/^gulp(-|\.)/, ''));
  }

  private getProjectHelpers(): any {
    if (!this.options.helperDir) {
      return {};
    }

    let files: string[];
    try {
      files = fs.readdirSync(this.options.helperDir);
    } catch (err) {
      throw new Error(`Helpers are not loaded. Error: ${err}`);
    }

    const projectHelpers: any = {};
    files.forEach((file) => {
      const basename = path.basename(file, '.js');
      const helperName = this.renameModuleName(basename);
      const helperPath = path.join(process.cwd(), this.options.helperDir, file);

      try {
        projectHelpers[helperName] = require(helperPath);
      } catch (err) {
        throw new Error(`An error occurred while loading the package: ${err}`);
      }
    });

    return projectHelpers;
  }

};
