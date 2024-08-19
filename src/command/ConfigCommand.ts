import Config from "../config/Config";
import Command from "./Command";

const DEFAULT_CONFIG_KEY_MAP = {
    '-xxtea': 'xxtea',
    '-keystore': 'keystore',
    '-storepass': 'storepass',
    '-alias': 'alias',
    '-keypass': 'keypass',
    '-compress': 'compress',
    '-zip': 'compress',
}


export default class ConfigCommand extends Command {

    public async execute(command: string): Promise<void> {
        const commandType = process.argv[3];
        switch (commandType) {
            case 'set':
                this.set();
                break;
            case 'get':
                this.get();
                break;
            case 'del':
                this.del();
                break;
        }
    }

    private set(): void {
        const xxtea = this.getStringArg('-xxtea');
        const keystore = this.getStringArg('-keystore');
        const storepass = this.getStringArg('-storepass');
        const alias = this.getStringArg('-alias');
        const keypass = this.getStringArg('-keypass');
        const compress = this.getBooleanArg('-compress');
        (xxtea !== undefined) && Config.getInstance().set('xxtea', xxtea);
        (keystore !== undefined) && Config.getInstance().set('keystore', keystore);
        (storepass !== undefined) && Config.getInstance().set('storepass', storepass);
        (alias !== undefined) && Config.getInstance().set('alias', alias);
        (keypass !== undefined) && Config.getInstance().set('keypass', keypass);
        (compress !== undefined) && Config.getInstance().set('compress', compress);
    }

    private get(): void {
        const argName = process.argv[4];
        if (!argName) {
            const keys = Object.keys(DEFAULT_CONFIG_KEY_MAP);
            const log = keys.map(key => `${key} : ${Config.getInstance().get(DEFAULT_CONFIG_KEY_MAP[key])}`);
            console.log(log);
        } else {
            const configKey = DEFAULT_CONFIG_KEY_MAP[argName];
            if (configKey) console.log(`${argName} : ${Config.getInstance().get(configKey)}`);
            else if (argName) console.error(`错误配置项: ${argName}`);
        }
    }

    private del(): void {
        const argName = process.argv[4];
        if (!argName) console.log(`error arg name`);
        else {
            const configKey = DEFAULT_CONFIG_KEY_MAP[argName];
            if (!configKey) console.error(`错误配置项: ${argName}`);
            const value = Config.getInstance().get(configKey);
            if (value === undefined) {
                console.log(`配置项不存在: ${configKey}`);
            } else {
                Config.getInstance().del(configKey);
                console.log(`删除配置项: ${configKey}`);
            }
        }
    }

}