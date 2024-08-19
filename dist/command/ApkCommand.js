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
const child_process_1 = __importDefault(require("child_process"));
const compressing_1 = __importDefault(require("compressing"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FileUtil_1 = __importDefault(require("../common/FileUtil"));
const Config_1 = __importDefault(require("../config/Config"));
const Command_1 = __importDefault(require("./Command"));
class ApkCommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command) {
                case 'p':
                case 'pack':
                    {
                        const apkAssetsPath = process.argv[3];
                        if (!fs_1.default.existsSync(apkAssetsPath)) {
                            console.error(`资源目录: '${apkAssetsPath}' 不存在`);
                            this.errorExit();
                        }
                        const output = this.getStringArg('-output');
                        if (!output) {
                            console.error(`参数错误: -output`);
                            this.errorExit();
                        }
                        let keystore, storepass, alias, keypass;
                        keystore = this.getStringArg('-keystore') || Config_1.default.getInstance().get('keystore');
                        if (keystore) {
                            storepass = this.getStringArg('-storepass') || Config_1.default.getInstance().get('storepass');
                            if (!storepass) {
                                console.error(`参数错误: -storepass`);
                                this.errorExit();
                            }
                            alias = this.getStringArg('-alias') || Config_1.default.getInstance().get('alias');
                            if (!alias) {
                                console.error(`参数错误: -alias`);
                                this.errorExit();
                            }
                            keypass = this.getStringArg('-keypass') || Config_1.default.getInstance().get('keypass');
                            if (!keypass) {
                                console.error(`参数错误: -keypass`);
                                this.errorExit();
                            }
                        }
                        else {
                            //keytool -genkey -keyalg RSA -keysize 1024 -validity 3650 -keystore debug.keystore -storepass 123456 -alias tms -keypass 123456 -dname CN=TanMusong,OU=TanMusong,O=TanMusong,L=Beijing,S=Beijing,C=CN
                            keystore = path_1.default.join(__dirname, '..', 'keystore', 'debug.keystore');
                            storepass = '123456';
                            alias = 'debug_keystore';
                            keypass = '123456';
                        }
                        yield this.pack(apkAssetsPath, output, keystore, storepass, alias, keypass);
                    }
                    break;
                case 'up':
                case 'unpack':
                    {
                        const apkPath = process.argv[3];
                        if (!fs_1.default.existsSync(apkPath)) {
                            console.error(`APK文件: '${apkPath}' 不存在`);
                            this.errorExit();
                        }
                        const output = this.getStringArg('-output');
                        if (output === undefined) {
                            console.error(`参数错误: -output`);
                            process.exit(2);
                        }
                        yield this.unpack(apkPath, output);
                    }
                    break;
            }
        });
    }
    pack(apkAssetsPath, outputPath, keystore, storepass, alias, keypass) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('删除META-INF');
            FileUtil_1.default.rm(path_1.default.join(apkAssetsPath, 'META-INF'));
            console.log('打包资源');
            FileUtil_1.default.rm(outputPath);
            yield compressing_1.default.zip.compressDir(apkAssetsPath, outputPath, { ignoreBase: true });
            console.log('重新签名');
            const apksigner = path_1.default.join(__dirname, '..', '..', 'tools', 'apksigner.jar');
            const signCmd = `${apksigner} sign --ks ${keystore} --ks-pass pass:${storepass} --ks-key-alias ${alias} --key-pass pass:${keypass} ${outputPath} `;
            child_process_1.default.execSync(signCmd);
            console.log(`打包完成`);
        });
    }
    unpack(apkPath, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('创建目录');
            fs_1.default.existsSync(outputPath) && FileUtil_1.default.rm(outputPath);
            fs_1.default.mkdirSync(outputPath);
            console.log('解包资源');
            yield compressing_1.default.zip.uncompress(apkPath, outputPath);
            console.log(`解包完成`);
        });
    }
}
exports.default = ApkCommand;
