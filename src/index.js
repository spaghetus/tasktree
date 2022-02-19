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

class DependencyTree {
	// Yes this is kinda spaghet but afaik this is the only way to have a set in js
	nodes = {};
	dependencies = {};

	incompleteNode(self, name) {
		self.nodes[name] = false;
	}

	completeNode(self, name) {
		self.nodes[name] = true;
	}

	addDependency(self, name, on) {
		if (!self.nodes[name]) {
			self.incompleteNode(self, name);
		}

		if (!self.dependencies[name]) {
			self.dependencies[name] = {};
		}

		if (!self.nodes[on]) {
			self.incompleteNode(self, on);
		}

		self.dependencies[name][on] = true;
	}
}
