import path from "path";
import fs from "fs";

const DEFAULT_CONFIG_FILE = 'cct_default_config.json';


export default class Config {
    private static instance: Config = null;

    private defaultConfigPath: string;
    private defaultConfig: Record<string, string | number | boolean>;

    public static getInstance(): Config {
        if (!this.instance) this.instance = new Config();
        return this.instance;
    }

    private constructor() {
        this.defaultConfigPath = path.join(__dirname, '..', '..', DEFAULT_CONFIG_FILE);
        this.defaultConfig = fs.existsSync(this.defaultConfigPath) ? JSON.parse(fs.readFileSync(this.defaultConfigPath, { encoding: 'utf-8' })) : {};
    }

    public have(key: string): boolean {
        return this.defaultConfig.hasOwnProperty(key);
    }

    public get(key: string): string | number | boolean {
        return this.defaultConfig[key];
    }

    public set(key: string, value: string | number | boolean): void {
        this.defaultConfig[key] = value;
        fs.writeFileSync(this.defaultConfigPath, JSON.stringify(this.defaultConfig));
    }

    public del(key: string): void {
        delete this.defaultConfig[key];
        fs.writeFileSync(this.defaultConfigPath, JSON.stringify(this.defaultConfig));
    }
}