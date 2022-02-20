import os from 'node:os';
import fs from 'fs';
import { deflate, inflate } from 'node:zlib';
/**
 * @typedef {{pomodoroLength:Number, shortBreakLength:Number, longBreakLength:Number, longBreakInterval:Number}} settings
 */

/**
 * @constant configPath Where config files are stored
 */
export const configPath = (() => {
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

/**
 * @class Defines a config class that can be easily modified
 */
export class Config {
    /**
     * @constant default the default settings
     * @returns {{pomodoroLength:1200, shortBreakLength: 300, longBreakLength: 600, longBreakInterval:4}}
     */
    get default() {
        return {
            pomodoroLength: 20*60,
            shortBreakLength: 5*60,
            longBreakLength: 15*60,
            longBreakInterval: 4,
        };
    }

    /**
     * @constructor Create a new configuration
     * @param {settings} settings 
     */
    constructor(settings=this.default) {
        this.settings = settings;
    }

    /**
     * @method fromFile load a config file from a given path
     * @param {import('node:fs').PathLike} ConfigFile 
     */
    fromFile(ConfigFile=`${configPath}/default.config`) {
        let configText = inflate(fs.readFileSync(ConfigFile), (e, r) => {if (e) throw (e); else return (r);});
        return new Config(JSON.parse(configText));
    }

    /**
     * @method save Saves the current config to a file
     * @param {import('node:fs').PathLike} ConfigFile 
     */
    save(ConfigFile=`${configPath}/default.config`) {
        fs.writeFileSync(ConfigFile, (deflate(JSON.stringify(this.settings), (e, r) => {if (e) throw (e); else return (r);})));
    }
}

/**
 * @function checkCircDeps tests to see if a task has any circular dependencies and throws an error if it does
 * @param {Task} Task 
 * @returns {true | Error} returns true if there are no circular dependencies 
 */
function checkCircDeps(Task, _depname=null) {
    if (Task.deps.length === 0) return true;
    Task.deps.forEach((dep) => {
        if (dep.title === _depname) {
            return new Error('Circular dependency '+_depname);
        }
        checkCircDeps(dep, (_depname)?_depname:Task.title);
    });
}

export class Task {
    /**
     * @constructor Defines a new task
     * @param {String} title The name of the task
     * @param {String} desc A basic description of what needs to be done
     * @param {String | false} est estimated time to complete (or false if n/a or unknown)
     * @param { Array<Task> | false} deps tasks that need to be completed before this
     * @param {Boolean} done whether the task is complete, should almost always be false
     * @param {Date | false} due when the task is due (or false if n/a or unknown)
     */
    constructor(title="New Task", desc="Description", est=false, deps=[], done=false, due=false) {
        this.title = title;
        this.description = desc;
        if (est) this.timeToFinish = est;
        this.deps = deps;
        this.completed = done;
        this.due = due;
    }

    /**
     * @property All properties in a convenient object
     * @returns {{title:String, description:String, est:Number|null, dependencies:Array<Task>, completed:Boolean, due:Date|false}}
     */
    get all() {
        return {
            title: this.title,
            description: this.description,
            est: (this.timeToFinish)?this.timeToFinish:null,
            dependencies: this.deps,
            completed: this.completed,
            due: this.due
        };
    }

    get hasDeps() {
        return (this.deps.length !== 0);
    }

    complete() {
        this.completed = true;
        this.due = false;
    }
    
    /**
     * @method addDep adds a task as dependent on this
     * @param {Task} dep 
     */
    addDep(dep) {
        this.deps.push(dep);
        try {
            checkCircDeps(this);
        }
        catch(e) {
            this.deps.pop();
            throw e;
        }
    }
}