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
