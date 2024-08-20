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
const Command_1 = __importDefault(require("./Command"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const javascript_obfuscator_1 = __importDefault(require("javascript-obfuscator"));
const uglify_js_1 = __importDefault(require("uglify-js"));
const OBFUSCATE_LIMIT = 0; //MB
class ScriptCommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectPath = process.argv[3];
            if (!fs_1.default.existsSync(projectPath))
                process.exit(1);
            const compress = this.haveArg('-compress');
            const configPath = this.getStringArg('-obfuscate-config');
            const obfuscate = this.haveArg('-obfuscate');
            if (!obfuscate && !compress) {
                console.log("没有需要执行的操作");
                this.errorExit();
            }
            let obfuscateCfg = undefined;
            if (obfuscate && configPath) {
                try {
                    switch (true) {
                        case configPath === 'low':
                        case configPath === 'medium':
                        case configPath === 'high':
                        case configPath === 'default':
                            {
                                const url = path_1.default.join(__dirname, '..', '..', 'data', 'script', `obfuscator_config_${configPath}.json`);
                                const configFileContent = fs_1.default.readFileSync(url, { encoding: 'utf-8' });
                                obfuscateCfg = JSON.parse(configFileContent);
                            }
                            break;
                        case fs_1.default.existsSync(configPath):
                            {
                                const configFileContent = fs_1.default.readFileSync(configPath, { encoding: 'utf-8' });
                                obfuscateCfg = JSON.parse(configFileContent);
                            }
                            break;
                    }
                }
                catch (e) { }
                if (!obfuscateCfg)
                    console.log(`混淆配置文件${configPath}不存在或格式错误，使用默认配置`);
            }
            console.log(`开始执行${[obfuscate ? "JS混淆" : "", compress ? "JS压缩" : ""].filter(v => v).join(", ")}`);
            const sizeChanged = this.dealJS(projectPath, obfuscate, compress, obfuscateCfg);
            console.log(`脚本修改完成, 脚本大小${sizeChanged >= 0 ? '增加' : '减少'}${Math.abs(sizeChanged / 1024).toFixed(3)}kb`);
        });
    }
    dealJS(fileUrl, obfuscate, compress, obfuscateCfg) {
        if (!fs_1.default.existsSync(fileUrl))
            return 0;
        const stat = fs_1.default.statSync(fileUrl);
        if (stat.isDirectory()) {
            let sizeChanged = 0;
            const files = fs_1.default.readdirSync(fileUrl);
            files.forEach(file => {
                sizeChanged += this.dealJS(path_1.default.join(fileUrl, file), obfuscate, compress, obfuscateCfg);
            });
            return sizeChanged;
        }
        else {
            if (path_1.default.extname(fileUrl) !== ".js")
                return 0;
            const oldSize = stat.size;
            let calculateSize = oldSize;
            let log = `${fileUrl}修改完成: `;
            if (obfuscate) {
                if (OBFUSCATE_LIMIT > 0 && calculateSize > OBFUSCATE_LIMIT * 1024 * 1024) {
                    log += `文件超过${OBFUSCATE_LIMIT}MB, 跳过混淆; `;
                }
                else {
                    try {
                        let date = Date.now();
                        this.obfuscateScript(fileUrl, obfuscateCfg);
                        const newSize = fs_1.default.statSync(fileUrl).size;
                        const sizeChanged = newSize - calculateSize;
                        calculateSize = newSize;
                        date = Date.now() - date;
                        log += `混淆耗时${date / 1000}秒, 混淆后文件${sizeChanged >= 0 ? '增加' : '减少'}${Math.abs(sizeChanged / 1024).toFixed(3)}kb; `;
                    }
                    catch (error) {
                        log += `混淆失败; `;
                    }
                }
            }
            if (compress) {
                try {
                    let date = Date.now();
                    const compressSize = this.compressScript(fileUrl);
                    const sizeChanged = compressSize - calculateSize;
                    calculateSize = compressSize;
                    date = Date.now() - date;
                    log += `压缩耗时${date / 1000}秒, 压缩后文件${sizeChanged > 0 ? '增加' : '减少'}${Math.abs(sizeChanged / 1024).toFixed(3)}kb`;
                    log += (sizeChanged >= 0 ? ', 忽略压缩文件; ' : '; ');
                }
                catch (error) {
                    log += `压缩失败; `;
                }
            }
            const sizeChanged = calculateSize - oldSize;
            log += `最终文件${sizeChanged >= 0 ? '增加' : '减少'}${(Math.abs(sizeChanged) / 1024).toFixed(3)}kb`;
            console.log(log);
            return sizeChanged;
        }
    }
    obfuscateScript(fileUrl, options) {
        const content = fs_1.default.readFileSync(fileUrl, { encoding: "utf-8" });
        const obfuscationResult = javascript_obfuscator_1.default.obfuscate(content, options);
        const obfuscatedCode = obfuscationResult.getObfuscatedCode();
        fs_1.default.writeFileSync(fileUrl, obfuscatedCode, { encoding: "utf-8" });
    }
    compressScript(fileUrl) {
        const oldSize = fs_1.default.statSync(fileUrl).size;
        const cacheUrl = `${fileUrl}.cache`;
        const content = fs_1.default.readFileSync(fileUrl, { encoding: "utf-8" });
        const result = uglify_js_1.default.minify(content, {});
        if (result.error)
            throw result.error;
        fs_1.default.writeFileSync(cacheUrl, result.code);
        const newSize = fs_1.default.statSync(cacheUrl).size;
        if (newSize >= oldSize) {
            fs_1.default.rmSync(cacheUrl);
            return oldSize;
        }
        else {
            fs_1.default.rmSync(fileUrl);
            fs_1.default.renameSync(cacheUrl, fileUrl);
            return newSize;
        }
    }
}
exports.default = ScriptCommand;
