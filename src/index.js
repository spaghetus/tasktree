// Dependencies

import os from 'node:os';
import {env} from 'node:process';
import fs from 'node:fs';
import YAML from 'yaml';

export const configPath = (() => {
	const home = os.homedir();
	switch (os.platform()) {
		case 'win32':
			return `${home}\\AppData\\Roaming\\tasktree.yml`;
		case 'darwin':
			return `${home}/Library/Application Support/tasktree.yml`;
		case 'linux' || 'freebsd':
			return `${env.XDG_CONFIG_HOME || env.HOME + '/.config'}/.tasktree.yml`;
		default:
			return `${home}/.tasktree.yml`;
	}
})();
export const defaultConfig = {
	pomodoroLength: 20 * 60,
	shortBreakLength: 5 * 60,
	longBreakLength: 15 * 60,
	longBreakInterval: 4,
};
export const config = (() => {
	let config = {};
	try {
		config = YAML.parse(fs.readFileSync(configPath, 'utf8'));
	} catch (error) {
		console.error(error);
	}

	return Object.assign({}, defaultConfig, config);
})();

export class DependencyTree {
	// Yes this is kinda spaghet but afaik this is the only way to have a set in js
	nodes = {};
	dependencies = {};

	constructor() {
		this.nodes = {};
		this.dependencies = {};
	}

	incompleteNode(name) {
		this.nodes[name] = false;

		if (!this.dependencies[name]) {
			this.dependencies[name] = {};
		}
	}

	completeNode(name) {
		this.nodes[name] = true;

		if (!this.dependencies[name]) {
			this.dependencies[name] = {};
		}
	}

	addDependency(name, on) {
		if (!this.nodes[name]) {
			this.incompleteNode(name);
		}

		if (!this.dependencies[name]) {
			this.dependencies[name] = {};
		}

		if (!this.nodes[on]) {
			this.incompleteNode(on);
		}

		this.dependencies[name][on] = true;
	}

	dependencySort() {
		const sorted = [];
		// Add all nodes which are not satisfied
		for (const key in this.nodes) {
			if (this.nodes[key] === false) {
				sorted.push(key);
			}
		}

		let hadToSwap = false;
		let iterations = 0;
		// Very naive solver
		do {
			hadToSwap = false;
			for (let i = 0; i < sorted.length; i++) {
				// Find the latest dependency of this node
				let latestDep = false;
				const deps = this.dependencies[sorted[i]];
				for (let o = i; o < sorted.length; o++) {
					if (deps[sorted[o]]) {
						latestDep = o;
					}
				}

				// Swap with the latest dependency
				if (latestDep !== false) {
					hadToSwap = true;
					const temporary = sorted[i];
					sorted[i] = sorted[latestDep];
					sorted[latestDep] = temporary;
				}
			}

			iterations++;
			if (iterations > sorted.length * 4) {
				throw new Error('Circular dependency?');
			}
		} while (hadToSwap);

		return sorted;
	}
}
