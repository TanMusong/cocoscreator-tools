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
const XXTeaUtil_1 = __importDefault(require("../common/XXTeaUtil"));
var Apk;
(function (Apk) {
    class UnpackedAPK {
        constructor(projectPath) {
            this.projectPath = projectPath;
        }
        openCCLog(xxtea, compress) {
            const scriptPath = FileUtil_1.default.find(path_1.default.join(this.projectPath, 'assets', 'src'), /cocos2d-jsb\.([a-zA-Z0-9\.]+\.)?js/);
            const encrypt = path_1.default.extname(scriptPath) === '.jsc';
            const scriptBuffer = fs_1.default.readFileSync(scriptPath);
            let script;
            if (encrypt) {
                console.log('decrypt javascript');
                script = XXTeaUtil_1.default.decryptJSC(scriptBuffer, xxtea, compress);
            }
            else
                script = scriptBuffer.toString();
            console.log('modify cocos log function');
            script = script.replace(/_resetDebugSetting\s*:/, `_resetDebugSetting:function(mode){_resetDebugSettingReal(1);};\n_resetDebugSettingReal:`);
            if (encrypt) {
                console.log('encrypt javascript');
                fs_1.default.writeFileSync(scriptPath, XXTeaUtil_1.default.encryptJS(script, xxtea, compress));
            }
            else
                fs_1.default.writeFileSync(scriptPath, script);
        }
        pack(apkPath, keystore, storepass, alias, keypass) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('delete sign');
                FileUtil_1.default.rm(path_1.default.join(this.projectPath, 'META-INF'));
                console.log('repack apk');
                FileUtil_1.default.rm(apkPath);
                yield compressing_1.default.zip.compressDir(this.projectPath, apkPath, { ignoreBase: true });
                console.log('resign apk');
                const apksigner = path_1.default.join(__dirname, '..', '..', 'tools', 'apksigner.bat');
                const signCmd = `${apksigner} sign --ks ${keystore} --ks-pass pass:${storepass} --ks-key-alias ${alias} --key-pass pass:${keypass} ${apkPath} `;
                child_process_1.default.execSync(signCmd);
            });
        }
        clean() {
            console.log('delete temp files');
            FileUtil_1.default.rm(this.projectPath);
        }
    }
    Apk.UnpackedAPK = UnpackedAPK;
    Apk.Unpack = (apkPath) => __awaiter(this, void 0, void 0, function* () {
        const dirPath = path_1.default.dirname(apkPath);
        const outputPath = path_1.default.join(dirPath, `.___apk_${Date.now()}`);
        console.log('create output dir');
        fs_1.default.existsSync(outputPath) && FileUtil_1.default.rm(outputPath);
        fs_1.default.mkdirSync(outputPath);
        console.log('unpack apk');
        yield compressing_1.default.zip.uncompress(apkPath, outputPath);
        return new UnpackedAPK(outputPath);
    });
})(Apk || (Apk = {}));
exports.default = Apk;
