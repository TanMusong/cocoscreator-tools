"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DEFAULT_CONFIG_FILE = 'cct_default_config.json';
class Config {
    constructor() {
        this.defaultConfigPath = path_1.default.join(__dirname, '..', '..', DEFAULT_CONFIG_FILE);
        this.defaultConfig = fs_1.default.existsSync(this.defaultConfigPath) ? JSON.parse(fs_1.default.readFileSync(this.defaultConfigPath, { encoding: 'utf-8' })) : {};
    }
    static getInstance() {
        if (!this.instance)
            this.instance = new Config();
        return this.instance;
    }
    have(key) {
        return this.defaultConfig.hasOwnProperty(key);
    }
    get(key) {
        return this.defaultConfig[key];
    }
    set(key, value) {
        this.defaultConfig[key] = value;
        fs_1.default.writeFileSync(this.defaultConfigPath, JSON.stringify(this.defaultConfig));
    }
    del(key) {
        delete this.defaultConfig[key];
        fs_1.default.writeFileSync(this.defaultConfigPath, JSON.stringify(this.defaultConfig));
    }
}
exports.default = Config;
Config.instance = null;
