'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as camelcase from 'camelcase';

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

  private projectDependencies: any;
  private projectHelpers: any;

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

    this.projectDependencies = this.getProjectDependencies();
    this.projectHelpers = this.getProjectHelpers();

    this.use = this.use.bind(this);
  }

  public use(...modules: string[]): any {
    const toInstall = modules.filter((dep) => {
      return this.projectDependencies.indexOf(dep) === -1;
    });

    if (toInstall.length) {
      this.options.reporter(toInstall);
    }

    const deps: any = {
      gulp: this.options.gulp,
      helpers: this.projectHelpers
    };

    modules.forEach((dep) => {
      const name = this.renameModuleName(dep);

      try {
        deps[name] = require(dep);
      } catch (err) {
        // silence
      }
    });

    return deps;
  }

  private getProjectDependencies(): string[] {
    let fileData: string;
    try {
      fileData = fs.readFileSync('./package.json', 'utf8');
    } catch (err) {
      throw new Error(`Unable to read 'package.json' file. Error: ${err.message}`);
    }

    let packageJsonData: any = {};
    try {
      packageJsonData = JSON.parse(fileData);
    } catch (err) {
      throw new Error(`JSON Parsing Error: ${err.message}`);
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
    console.error(`Something is not enough. Use 'npm i -D %s'`, toInstall.join(' '));
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
      throw new Error(`Helpers are not loaded. Error: ${err.message}`);
    }

    const projectHelpers: any = {};
    for (let index = 0; index < files.length; index++) {
      const isFile = path.extname(files[index]) === '.js';
      if (!isFile) {
        continue;
      }

      const basename = path.basename(files[index], '.js');
      const helperName = this.renameModuleName(basename);
      const helperPath = path.join(process.cwd(), this.options.helperDir, basename);

      try {
        projectHelpers[helperName] = require(helperPath);
      } catch (err) {
        throw new Error(`An error occurred while loading the package: ${err.message}`);
      }
    }

    return projectHelpers;
  }

}
