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
var Apk;
(function (Apk) {
    Apk.Pack = (apkAssetsPath, outputPath, keystore, storepass, alias, keypass) => __awaiter(this, void 0, void 0, function* () {
        console.log('delete sign');
        FileUtil_1.default.rm(path_1.default.join(apkAssetsPath, 'META-INF'));
        console.log('repack apk');
        FileUtil_1.default.rm(outputPath);
        yield compressing_1.default.zip.compressDir(apkAssetsPath, outputPath, { ignoreBase: true });
        console.log('resign apk');
        const apksigner = path_1.default.join(__dirname, '..', '..', 'tools', 'apksigner.jar');
        const signCmd = `${apksigner} sign --ks ${keystore} --ks-pass pass:${storepass} --ks-key-alias ${alias} --key-pass pass:${keypass} ${outputPath} `;
        child_process_1.default.execSync(signCmd);
    });
    Apk.Unpack = (apkPath, outputPath) => __awaiter(this, void 0, void 0, function* () {
        console.log('create output dir');
        fs_1.default.existsSync(outputPath) && FileUtil_1.default.rm(outputPath);
        fs_1.default.mkdirSync(outputPath);
        console.log('unpack apk');
        yield compressing_1.default.zip.uncompress(apkPath, outputPath);
    });
})(Apk || (Apk = {}));
exports.default = Apk;
