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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Apk_1 = __importDefault(require("./apk/Apk"));
const XXTeaUtil_1 = __importDefault(require("./common/XXTeaUtil"));
const UUID_1 = require("./uuid/UUID");
const Web_1 = __importDefault(require("./web/Web"));
const DEFAULT_CONFIG_FILE = 'cct_default_config.json';
const DEFAULT_CONFIG_KEY_MAP = {
    '-xxtea': 'xxtea',
    '-keystore': 'keystore',
    '-storepass': 'storepass',
    '-alias': 'alias',
    '-keypass': 'keypass',
    '-compress': 'compress',
    '-zip': 'compress',
};
const getArg = (key, check) => {
    const index = process.argv.indexOf(key);
    if (index < 0)
        return null;
    const value = process.argv[index + 1];
    return check ? (check(value) ? value : null) : value;
};
const haveArg = (key) => {
    const index = process.argv.indexOf(key);
    return index >= 0;
};
const runner = () => __awaiter(void 0, void 0, void 0, function* () {
    const defaultConfigPath = path_1.default.join(__dirname, '..', '..', DEFAULT_CONFIG_FILE);
    const defaultConfig = fs_1.default.existsSync(defaultConfigPath) ? JSON.parse(fs_1.default.readFileSync(defaultConfigPath).toString()) : {};
    const command = process.argv[2];
    switch (command) {
        case 'u2b':
            {
                const uuid = process.argv[3];
                console.log(uuid ? (0, UUID_1.UUIDToBase64)(uuid) : 'Empty UUID');
            }
            break;
        case 'b2u':
            {
                const base64 = process.argv[3];
                console.log(base64 ? (0, UUID_1.Base64ToUUID)(base64) : 'Empty Base64');
            }
            break;
        case 'd':
        case 'decrypt':
        case 'e':
        case 'encrypt':
            {
                const filePath = process.argv[3];
                if (!fs_1.default.existsSync(filePath)) {
                    console.error(`${filePath} not exists`);
                    process.exit(1);
                }
                const xxtea = getArg('-xxtea', value => value && !value.startsWith('-')) || defaultConfig.xxtea;
                if (!xxtea) {
                    console.error(`illegal parameter: -xxtea`);
                    process.exit(1);
                }
                const outFilePath = getArg('-out', value => value && !value.startsWith('-')) || filePath;
                const compress = haveArg('-compress') || haveArg('-zip') || defaultConfig.compress;
                const cotnent = fs_1.default.readFileSync(filePath);
                const script = (command === 'd' || command === 'decrypt') ?
                    XXTeaUtil_1.default.decryptJSC(cotnent, xxtea, compress) :
                    XXTeaUtil_1.default.encryptJS(cotnent.toString(), xxtea, compress);
                if (!script) {
                    console.error(`xxtea error`);
                    process.exit(2);
                }
                fs_1.default.writeFileSync(outFilePath, script);
            }
            break;
        case 'p':
        case 'pack':
            {
                const apkAssetsPath = process.argv[3];
                if (!fs_1.default.existsSync(apkAssetsPath)) {
                    console.error(`Apk assets: '${apkAssetsPath}' not exists`);
                    process.exit(2);
                }
                const output = getArg('-output', value => !value.startsWith('-'));
                if (!output) {
                    console.error(`illegal parameter: -output`);
                    process.exit(2);
                }
                let keystore, storepass, alias, keypass;
                keystore = getArg('-keystore', value => !value.startsWith('-')) || defaultConfig.keystore;
                if (keystore) {
                    storepass = getArg('-storepass', value => !value.startsWith('-')) || defaultConfig.storepass;
                    if (!storepass) {
                        console.error(`illegal parameter: -storepass`);
                        process.exit(2);
                    }
                    alias = getArg('-alias', value => !value.startsWith('-')) || defaultConfig.alias;
                    if (!alias) {
                        console.error(`illegal parameter: -alias`);
                        process.exit(2);
                    }
                    keypass = getArg('-keypass', value => !value.startsWith('-')) || defaultConfig.keypass;
                    if (!keypass) {
                        console.error(`illegal parameter: -keypass`);
                        process.exit(2);
                    }
                }
                else {
                    //keytool -genkey -keyalg RSA -keysize 1024 -validity 3650 -keystore debug.keystore -storepass 123456 -alias tms -keypass 123456 -dname CN=TanMusong,OU=TanMusong,O=TanMusong,L=Beijing,S=Beijing,C=CN
                    keystore = path_1.default.join(__dirname, '..', 'keystore', 'debug.keystore');
                    storepass = '123456';
                    alias = 'tms';
                    keypass = '123456';
                }
                yield Apk_1.default.Pack(apkAssetsPath, output, keystore, storepass, alias, keypass);
            }
            break;
        case 'up':
        case 'unpack':
            {
                const apkPath = process.argv[3];
                if (!fs_1.default.existsSync(apkPath)) {
                    console.error(`Apk: '${apkPath}' not exists`);
                    process.exit(2);
                }
                const output = getArg('-output', value => !value.startsWith('-'));
                if (!output) {
                    console.error(`illegal parameter: -output`);
                    process.exit(2);
                }
                yield Apk_1.default.Unpack(apkPath, output);
            }
            break;
        case 'web':
            {
                const projectPath = process.argv[3];
                if (!fs_1.default.existsSync(projectPath))
                    process.exit(1);
                if (haveArg('-resize-image')) {
                    const scale = getArg('-resize-image', value => { try {
                        parseFloat(value);
                        return true;
                    }
                    catch (e) {
                        return false;
                    } });
                    if (!scale) {
                        process.exit(1);
                    }
                    Web_1.default.ScaleImages(projectPath, parseFloat(scale));
                }
            }
            break;
        case 'config':
            {
                const commandType = process.argv[3];
                switch (commandType) {
                    case 'set':
                        defaultConfig.xxtea = getArg('-xxtea', value => value && !value.startsWith('-')) || defaultConfig.xxtea;
                        defaultConfig.keystore = getArg('-keystore', value => value && !value.startsWith('-')) || defaultConfig.keystore;
                        defaultConfig.storepass = getArg('-storepass', value => value && !value.startsWith('-')) || defaultConfig.storepass;
                        defaultConfig.alias = getArg('-alias', value => value && !value.startsWith('-')) || defaultConfig.alias;
                        defaultConfig.keypass = getArg('-keypass', value => value && !value.startsWith('-')) || defaultConfig.keypass;
                        const compressArg = getArg('-compress', value => value && (value === 'true' || value === 'false')) || getArg('-zip', value => value && (value === 'true' || value === 'false'));
                        defaultConfig.compress = compressArg ? (compressArg === 'true') : defaultConfig.compress;
                        break;
                    case 'get':
                        const argName = process.argv[4];
                        const configKey = DEFAULT_CONFIG_KEY_MAP[argName];
                        if (configKey)
                            console.log(defaultConfig[configKey]);
                        else if (argName)
                            console.log(`error arg name: ${argName}`);
                        else
                            console.log(JSON.stringify(defaultConfig));
                        break;
                    case 'del':
                        for (const key in DEFAULT_CONFIG_KEY_MAP) {
                            haveArg(key) && delete defaultConfig[DEFAULT_CONFIG_KEY_MAP[key]];
                        }
                        break;
                }
                fs_1.default.writeFileSync(defaultConfigPath, JSON.stringify(defaultConfig));
            }
            break;
        default:
            console.error(`Error Command: ${command}`);
            process.exit(1);
    }
});
runner();
