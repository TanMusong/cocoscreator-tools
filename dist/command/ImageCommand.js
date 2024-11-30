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
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
// import tinify from "tinify";
const Config_1 = __importDefault(require("../config/Config"));
const Command_1 = __importDefault(require("./Command"));
const TINIFY_KEYS = [""];
const TINYIMG_URL = [
    "tinyjpg.com",
    "tinypng.com",
    "tinify.cn"
];
const WEB_API_CD = 5000;
const RETRY_TIMES = 3;
const CACHE_DIR = 'texture-compressed-cache';
class ImageCommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectPath = process.argv[3];
            if (!fs_1.default.existsSync(projectPath))
                process.exit(1);
            let cacheDir = this.getStringArg('-cache') || Config_1.default.getInstance().get('cache');
            if (!cacheDir) {
                cacheDir = path_1.default.join(os_1.default.homedir(), '..', '..', CACHE_DIR);
                fs_1.default.existsSync(cacheDir) || fs_1.default.mkdirSync(cacheDir, { recursive: true });
                console.log(`未指定缓存目录，使用默认目录${path_1.default.normalize(cacheDir)}`);
            }
            this.tempDirUrl = path_1.default.join(cacheDir, 'temp');
            fs_1.default.existsSync(this.tempDirUrl) || fs_1.default.mkdirSync(this.tempDirUrl, { recursive: true });
            this.hostnameIndex = 0;
            this.tinifyKeyIndex = 0;
            this.cacheDirUrl = cacheDir;
            console.log(`开始执行图片压缩`);
            const compressedSize = yield this.compressedImage(projectPath);
            console.log(`图片压缩完成，整包大小${compressedSize > 0 ? '增加' : '减少'}${Math.abs(compressedSize / 1024).toFixed(3)}kb`);
        });
    }
    compressedImage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!fs_1.default.existsSync(url)) {
                return 0;
            }
            const stat = fs_1.default.statSync(url);
            const ext = path_1.default.extname(url);
            switch (true) {
                case stat.isDirectory():
                    let compressedSize = 0;
                    const subUrls = fs_1.default.readdirSync(url);
                    for (let i = 0, length = subUrls.length; i < length; i++) {
                        const subUrl = subUrls[i];
                        compressedSize += yield this.compressedImage(path_1.default.join(url, subUrl));
                    }
                    return compressedSize;
                case ext === '.png':
                case ext === '.jpg':
                    const oldSize = stat.size;
                    const buffer = fs_1.default.readFileSync(url);
                    const md5 = crypto_1.default.createHash('md5').update(buffer).digest('hex');
                    const cacheUrl = this.findCache(md5);
                    if (cacheUrl) {
                        const newSize = fs_1.default.statSync(cacheUrl).size;
                        if (newSize <= oldSize) {
                            fs_1.default.copyFileSync(cacheUrl, url);
                            const sizeChange = newSize - oldSize;
                            console.log(`${url}使用缓存, 文件大小${sizeChange > 0 ? '增加' : '减少'}${Math.abs(sizeChange / 1024).toFixed(3)}kb`);
                            return sizeChange;
                        }
                        else {
                            //缓存文件错误，清楚缓存重新压缩
                            fs_1.default.rmSync(cacheUrl);
                        }
                    }
                    const compressSize = /*await this.compressWithTinify(url, oldSize) || */ yield this.compressWithWebAPI(url, oldSize);
                    if (compressSize) {
                        this.saveCache(md5, url);
                        const sizeChange = compressSize - oldSize;
                        console.log(`${url}压缩成功, 文件大小${sizeChange > 0 ? '增加' : '减少'}${Math.abs(sizeChange / 1024).toFixed(3)}kb`);
                        return sizeChange;
                    }
                    else {
                        console.log(`${url}压缩失败`);
                        return 0;
                    }
                default:
                    return 0;
            }
        });
    }
    compressWithWebAPI(url, sourceSize) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = 0;
            for (let i = 0; i < RETRY_TIMES; i++) {
                try {
                    const size = sourceSize || fs_1.default.statSync(url).size;
                    const tempUrl = path_1.default.join(this.tempDirUrl, path_1.default.basename(url));
                    const buffer = fs_1.default.readFileSync(url);
                    const data = yield this.upload(buffer);
                    const file = yield this.download(data.output.url);
                    fs_1.default.writeFileSync(tempUrl, file, 'binary');
                    const newSize = fs_1.default.statSync(tempUrl).size;
                    if (newSize < size) {
                        fs_1.default.rmSync(url);
                        fs_1.default.renameSync(tempUrl, url);
                        result = newSize;
                    }
                    else {
                        fs_1.default.rmSync(tempUrl);
                        result = size;
                    }
                    break;
                }
                catch (error) {
                }
                yield new Promise(resolve => setTimeout(resolve, WEB_API_CD));
            }
            return result;
        });
    }
    // private async compressWithTinify(url: string, sourceSize: number): Promise<number> {
    //     if (this.tinifyKeyIndex >= TINIFY_KEYS.length) return 0;
    //     let result = 0;
    //     for (; this.tinifyKeyIndex < TINIFY_KEYS.length;) {
    //         tinify.key = TINIFY_KEYS[this.tinifyKeyIndex];
    //         try {
    //             const size = sourceSize || fs.statSync(url).size;
    //             const tempUrl = path.join(this.tempDirUrl, path.basename(url));
    //             await tinify.fromFile(url).toFile(tempUrl);
    //             const newSize = fs.statSync(tempUrl).size;
    //             if (newSize < size) {
    //                 fs.rmSync(url);
    //                 fs.renameSync(tempUrl, url);
    //                 result = newSize;
    //             } else {
    //                 fs.rmSync(tempUrl);
    //                 result = size;
    //             }
    //             break;
    //         } catch (error) {
    //             this.tinifyKeyIndex++;
    //         }
    //     }
    //     return result;
    // }
    findCache(md5) {
        if (!fs_1.default.existsSync(this.cacheDirUrl))
            return null;
        const cacheFilePath = path_1.default.join(this.cacheDirUrl, md5);
        return fs_1.default.existsSync(cacheFilePath) ? cacheFilePath : null;
    }
    saveCache(scoureMD5, scoureUrl) {
        const cacheFilePath = path_1.default.join(this.cacheDirUrl, scoureMD5);
        fs_1.default.copyFileSync(scoureUrl, cacheFilePath);
    }
    upload(buffer) {
        return new Promise((resolve, reject) => {
            const hostname = TINYIMG_URL[this.hostnameIndex];
            this.hostnameIndex = (this.hostnameIndex + 1) % TINYIMG_URL.length;
            const req = https_1.default.request({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                    'Postman-Token': `${Date.now()}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
                    'X-Forwarded-For': Array.from(Array(4)).map(() => Math.floor(Math.random() * 255)).join('.')
                },
                method: 'POST',
                hostname,
                path: '/backend/opt/shrink',
                rejectUnauthorized: false,
            }, res => {
                res.on('data', data => {
                    const result = JSON.parse(data.toString());
                    if (result.error) {
                        reject(new Error(result.message));
                    }
                    else {
                        resolve(result);
                    }
                });
            });
            req.write(buffer, 'binary');
            req.on('error', reject);
            req.end();
        });
    }
    download(url) {
        return new Promise((resolve, reject) => {
            const opt = new URL(url);
            let data = '';
            const req = https_1.default.request(opt, res => {
                res.setEncoding('binary');
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.end();
        });
    }
}
exports.default = ImageCommand;
