"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = __importDefault(require("../config/Config"));
const Command_1 = __importDefault(require("./Command"));
const DEFAULT_CONFIG_KEY_MAP = {
    '-xxtea': 'xxtea',
    '-keystore': 'keystore',
    '-storepass': 'storepass',
    '-alias': 'alias',
    '-keypass': 'keypass',
    '-compress': 'compress',
    '-zip': 'compress',
};
class ConfigCommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    set() {
        const xxtea = this.getStringArg('-xxtea');
        const keystore = this.getStringArg('-keystore');
        const storepass = this.getStringArg('-storepass');
        const alias = this.getStringArg('-alias');
        const keypass = this.getStringArg('-keypass');
        const compress = this.getBooleanArg('-compress');
        (xxtea !== undefined) && Config_1.default.getInstance().set('xxtea', xxtea);
        (keystore !== undefined) && Config_1.default.getInstance().set('keystore', keystore);
        (storepass !== undefined) && Config_1.default.getInstance().set('storepass', storepass);
        (alias !== undefined) && Config_1.default.getInstance().set('alias', alias);
        (keypass !== undefined) && Config_1.default.getInstance().set('keypass', keypass);
        (compress !== undefined) && Config_1.default.getInstance().set('compress', compress);
    }
    get() {
        const argName = process.argv[4];
        if (!argName) {
            const keys = Object.keys(DEFAULT_CONFIG_KEY_MAP);
            const log = keys.map(key => `${key} : ${Config_1.default.getInstance().get(DEFAULT_CONFIG_KEY_MAP[key])}`);
            console.log(log);
        }
        else {
            const configKey = DEFAULT_CONFIG_KEY_MAP[argName];
            if (configKey)
                console.log(`${argName} : ${Config_1.default.getInstance().get(configKey)}`);
            else if (argName)
                console.error(`错误配置项: ${argName}`);
        }
    }
    del() {
        const argName = process.argv[4];
        if (!argName)
            console.log(`error arg name`);
        else {
            const configKey = DEFAULT_CONFIG_KEY_MAP[argName];
            if (!configKey)
                console.error(`错误配置项: ${argName}`);
            const value = Config_1.default.getInstance().get(configKey);
            if (value === undefined) {
                console.log(`配置项不存在: ${configKey}`);
            }
            else {
                Config_1.default.getInstance().del(configKey);
                console.log(`删除配置项: ${configKey}`);
            }
        }
    }
}
exports.default = ConfigCommand;
