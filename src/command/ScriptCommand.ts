import Command from "./Command";
import fs from "fs";
import path from "path";
import JavaScriptObfuscator from 'javascript-obfuscator';
import UglifyJS from "uglify-js";

const OBFUSCATE_LIMIT = 0;//MB


export default class ScriptCommand extends Command {

    public async execute(command: string): Promise<void> {
        const projectPath = process.argv[3];
        if (!fs.existsSync(projectPath)) process.exit(1);
        const compress = this.haveArg('-compress');
        const configPath = this.getStringArg('-obfuscate-config');
        const obfuscate = this.haveArg('-obfuscate');
        if (!obfuscate && !compress) {
            console.log("没有需要执行的操作");
            this.errorExit();
        }
        let obfuscateCfg: JavaScriptObfuscator.ObfuscatorOptions = undefined;
        if (obfuscate && configPath) {
            try {
                switch (true) {
                    case configPath === 'low':
                    case configPath === 'medium':
                    case configPath === 'high':
                    case configPath === 'default':
                        {
                            const url = path.join(__dirname, '..', '..', 'data', 'script', `obfuscator_config_${configPath}.json`)
                            const configFileContent = fs.readFileSync(url, { encoding: 'utf-8' });
                            obfuscateCfg = JSON.parse(configFileContent);
                        }
                        break;
                    case fs.existsSync(configPath):
                        {
                            const configFileContent = fs.readFileSync(configPath, { encoding: 'utf-8' });
                            obfuscateCfg = JSON.parse(configFileContent);
                        }
                        break;
                }
            } catch (e) { }
            if (!obfuscateCfg) console.log(`混淆配置文件${configPath}不存在或格式错误，使用默认配置`);
        }
        console.log(`开始执行${[obfuscate ? "JS混淆" : "", compress ? "JS压缩" : ""].filter(v => v).join(", ")}`);
        const sizeChanged = this.dealJS(projectPath, obfuscate, compress, obfuscateCfg);
        console.log(`脚本修改完成, 脚本大小${sizeChanged >= 0 ? '增加' : '减少'}${Math.abs(sizeChanged / 1024).toFixed(3)}kb`);
    }



    private dealJS(fileUrl: string, obfuscate: boolean, compress: boolean, obfuscateCfg?: JavaScriptObfuscator.ObfuscatorOptions | null): number {
        if (!fs.existsSync(fileUrl)) return 0;
        const stat = fs.statSync(fileUrl);
        if (stat.isDirectory()) {
            let sizeChanged = 0;
            const files: string[] = fs.readdirSync(fileUrl);
            files.forEach(file => {
                sizeChanged += this.dealJS(path.join(fileUrl, file), obfuscate, compress, obfuscateCfg);
            });
            return sizeChanged;
        } else {
            if (path.extname(fileUrl) !== ".js") return 0;
            const oldSize = stat.size;
            let calculateSize = oldSize;
            let log = `${fileUrl}修改完成: `
            if (obfuscate) {
                if (OBFUSCATE_LIMIT > 0 && calculateSize > OBFUSCATE_LIMIT * 1024 * 1024) {
                    log += `文件超过${OBFUSCATE_LIMIT}MB, 跳过混淆; `;
                } else {
                    try {
                        let date = Date.now();
                        this.obfuscateScript(fileUrl, obfuscateCfg);

                        const newSize = fs.statSync(fileUrl).size;
                        const sizeChanged = newSize - calculateSize;
                        calculateSize = newSize;
                        date = Date.now() - date;
                        log += `混淆耗时${date / 1000}秒, 混淆后文件${sizeChanged >= 0 ? '增加' : '减少'}${Math.abs(sizeChanged / 1024).toFixed(3)}kb; `;
                    } catch (error) {
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
                    log += (sizeChanged >= 0 ? ', 忽略压缩文件; ' : '; ')
                } catch (error) {
                    log += `压缩失败; `;
                }
            }
            const sizeChanged = calculateSize - oldSize;
            log += `最终文件${sizeChanged >= 0 ? '增加' : '减少'}${(Math.abs(sizeChanged) / 1024).toFixed(3)}kb`;
            console.log(log);
            return sizeChanged;
        }
    }

    private obfuscateScript(fileUrl: string, options?: JavaScriptObfuscator.ObfuscatorOptions): void {
        const content = fs.readFileSync(fileUrl, { encoding: "utf-8" });
        const obfuscationResult = JavaScriptObfuscator.obfuscate(content, options);
        const obfuscatedCode = obfuscationResult.getObfuscatedCode();
        fs.writeFileSync(fileUrl, obfuscatedCode, { encoding: "utf-8" });
    }


    private compressScript(fileUrl: string): number {
        const oldSize = fs.statSync(fileUrl).size;
        const cacheUrl = `${fileUrl}.cache`

        const content = fs.readFileSync(fileUrl, { encoding: "utf-8" });
        const result = UglifyJS.minify(content, {});
        if (result.error) throw result.error;
        fs.writeFileSync(cacheUrl, result.code);

        const newSize = fs.statSync(cacheUrl).size;
        if (newSize >= oldSize) {
            fs.rmSync(cacheUrl);
            return oldSize;

        } else {
            fs.rmSync(fileUrl);
            fs.renameSync(cacheUrl, fileUrl);
            return newSize;
        }
    }

}