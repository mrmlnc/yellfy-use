'use strict';

import * as path from 'path';
import * as fs from 'fs';
import * as camelcase from 'camelcase';

export interface IOptions {
	gulp: any;
	dependencies?: boolean;
	devDependencies?: boolean;
	helperDir?: string;
	configDir?: string;
	reporter?: (toInstall: string[]) => void;
	packageFile?: string;
}

export class Use {

	private projectDependencies: any;
	private projectHelpers: any;
	private projectConfigs: any;

	constructor(public options: IOptions) {
		this.options = Object.assign(<IOptions>{
			gulp: null,
			reporter: this.reporter,
			dependencies: false,
			devDependencies: true,
			packageFile: './package.json'
		}, options);

		this.projectDependencies = this.getProjectDependencies();
		this.projectHelpers = this.getProjectDirectories('helper');
		this.projectConfigs = this.getProjectDirectories('config');

		this.use = this.use.bind(this);
	}

	public use(...modules: string[]): any {
		const toInstall: string[] = [];

		for (let index = 0; index < modules.length; index++) {
			const dependency = modules[index].replace(/\sas\s.*/, '');
			if (this.projectDependencies.indexOf(dependency) === -1) {
				toInstall.push(dependency);
			}
		}

		if (toInstall.length) {
			this.options.reporter(toInstall);
		}

		const dependencies: any = {
			gulp: this.options.gulp,
			helpers: this.projectHelpers,
			configs: this.projectConfigs
		};

		modules.forEach((dependency) => {
			const name = this.renameModuleName(dependency);
			const toRequire = dependency.replace(/\sas\s.*/, '');
			try {
				dependencies[name] = require(toRequire);
			} catch (err) {
				// silence
			}
		});

		return dependencies;
	}

	private getProjectDependencies(): string[] {
		let fileData: string;
		try {
			fileData = fs.readFileSync(this.options.packageFile, 'utf8');
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
		const newName = /\sas\s(.*)/.exec(name);
		if (newName) {
			return newName[1];
		}

		return camelcase(name.replace(/^gulp(-|\.)/, ''));
	}

	private getProjectDirectories(type: string): any {
		const dirPath = this.options[type + 'Dir'];
		if (!dirPath) {
			return {};
		}

		let files: string[];
		try {
			files = fs.readdirSync(dirPath);
		} catch (err) {
			throw new Error(`The "${type}s" are not loaded. Error: ${err.message}`);
		}

		const symbols: any = {};
		for (let index = 0; index < files.length; index++) {
			const isFile = path.extname(files[index]) === '.js';
			if (!isFile) {
				continue;
			}

			const basename = path.basename(files[index], '.js');
			const name = this.renameModuleName(basename);
			const filepath = path.join(process.cwd(), dirPath, basename);

			try {
				symbols[name] = require(filepath);
			} catch (err) {
				throw new Error(`An error occurred while loading the "${type}s": ${err.message}`);
			}
		}

		return symbols;
	}

}

export function setup(options: IOptions): void {
	(<any>global).use = new Use(options).use;
}
