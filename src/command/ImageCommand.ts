import crypto from "crypto";
import fs from "fs";
import https from 'https';
import path, { win32 } from "path";
// import tinify from "tinify";
import Command from "./Command";
import { homedir } from "os";
import Config from "../config/Config";

// const TINIFY_KEYS = [""];

const TINYIMG_URL = [
    "tinyjpg.com",
    "tinypng.com",
    "tinify.cn"
]


const WEB_API_CD = 5000;
const RETRY_TIMES = 3;
const CACHE_DIR = 'texture-compressed-cache';

export default class ImageCommand extends Command {

    private hostnameIndex: number;
    private cacheDirUrl: string;
    private tinifyKeyIndex: number;

    public async execute(command: string): Promise<void> {
        const projectPath = process.argv[3];
        if (!fs.existsSync(projectPath)) process.exit(1);

        let cacheDir = this.getStringArg('-cache') || Config.getInstance().get('cache') as string;
        if (!cacheDir) {
            cacheDir = path.join(__dirname, '..', '..', CACHE_DIR);
            fs.mkdirSync(cacheDir, { recursive: true });
            console.log(`未指定缓存目录，使用默认目录${path.normalize(cacheDir)}`);
        }

        this.hostnameIndex = 0;
        this.tinifyKeyIndex = 0;
        this.cacheDirUrl = cacheDir;
        console.log(`开始执行图片压缩`);
        const compressedSize = await this.compressedImage(projectPath)
        console.log(`图片压缩完成，整包大小${compressedSize > 0 ? '增加' : '减少'}${Math.abs(compressedSize / 1024).toFixed(3)}kb`);
    }

    private async compressedImage(url: string): Promise<number> {
        if (!fs.existsSync(url)) {
            return 0;
        }
        const stat = fs.statSync(url);
        const ext = path.extname(url);
        switch (true) {
            case stat.isDirectory():
                let compressedSize = 0;

                const subUrls = fs.readdirSync(url);
                for (let i = 0, length = subUrls.length; i < length; i++) {
                    const subUrl = subUrls[i];
                    compressedSize += await this.compressedImage(path.join(url, subUrl));
                }
                return compressedSize;
            case ext === '.png':
            case ext === '.jpg':
                const oldSize = stat.size;
                const buffer = fs.readFileSync(url);
                const md5 = crypto.createHash('md5').update(buffer).digest('hex');
                const cacheUrl = this.findCache(md5);
                if (cacheUrl) {
                    fs.rmSync(url);
                    fs.copyFileSync(cacheUrl, url);
                    const newSize = fs.statSync(url).size;
                    if (newSize > oldSize) {
                        //缓存文件错误，清楚缓存重新压缩
                        fs.rmSync(cacheUrl);
                        return await this.compressedImage(url);
                    } else {
                        fs.copyFileSync(cacheUrl, url);

                        const sizeChange = newSize - oldSize;
                        console.log(`${url}使用缓存, 文件大小${sizeChange > 0 ? '增加' : '减少'}${Math.abs(sizeChange / 1024).toFixed(3)}kb`);
                        fs.rmSync(url);
                        return sizeChange;
                    }
                } else {
                    const compressSize = /*await this.compressWithTinify(url, oldSize) || */await this.compressWithWebAPI(url, oldSize);
                    if (compressSize) {
                        this.saveCache(md5, url);
                        const sizeChange = compressSize - oldSize;
                        console.log(`${url}压缩成功, 文件大小${sizeChange > 0 ? '增加' : '减少'}${Math.abs(sizeChange / 1024).toFixed(3)}kb`);
                        return sizeChange;
                    } else {
                        console.log(`${url}压缩失败`);
                        return 0;
                    }
                }
            default:
                return 0;
        }
    }

    private async compressWithWebAPI(url: string, sourceSize: number): Promise<number> {
        let result = 0;
        for (let i = 0; i < RETRY_TIMES; i++) {
            try {
                const size = sourceSize || fs.statSync(url).size;
                const cacheUrl = `${url}.cache`;
                const buffer = fs.readFileSync(url);
                const data = await this.upload(buffer);
                const file = await this.download(data.output.url);
                fs.writeFileSync(cacheUrl, file, 'binary');
                const newSize = fs.statSync(cacheUrl).size;
                if (newSize < size) {
                    fs.rmSync(url);
                    fs.renameSync(cacheUrl, url);
                    result = newSize;

                } else {
                    fs.rmSync(cacheUrl);
                    result = size;
                }
                break;
            } catch (error) {
            }
            await new Promise(resolve => setTimeout(resolve, WEB_API_CD));
        }
        return result;
    }

    // private async compressWithTinify(url: string, sourceSize: number): Promise<number> {
    //     if (this.tinifyKeyIndex >= TINIFY_KEYS.length) return 0;
    //     let result = 0;
    //     for (; this.tinifyKeyIndex < TINIFY_KEYS.length;) {
    //         tinify.key = TINIFY_KEYS[this.tinifyKeyIndex];
    //         try {
    //             const size = sourceSize || fs.statSync(url).size;
    //             const cacheUrl = `${url}.cache`;
    //             await tinify.fromFile(url).toFile(cacheUrl);
    //             const newSize = fs.statSync(cacheUrl).size;
    //             if (newSize < size) {
    //                 fs.rmSync(url);
    //                 fs.renameSync(cacheUrl, url);
    //                 result = newSize;

    //             } else {
    //                 fs.rmSync(cacheUrl);
    //                 result = size;
    //             }
    //             break;
    //         } catch (error) {
    //             this.tinifyKeyIndex++;
    //         }
    //     }
    //     return result;
    // }

    private findCache(md5: string): string | null {
        if (!fs.existsSync(this.cacheDirUrl)) return null;
        const cacheFilePath = path.join(this.cacheDirUrl, md5);
        return fs.existsSync(cacheFilePath) ? cacheFilePath : null;
    }

    private saveCache(scoureMD5: string, scoureUrl: string): void {
        const cacheFilePath = path.join(this.cacheDirUrl, scoureMD5);
        fs.copyFileSync(scoureUrl, cacheFilePath);
    }

    private upload(buffer: Buffer): Promise<any> {
        return new Promise((resolve, reject) => {

            const hostname = TINYIMG_URL[this.hostnameIndex];
            this.hostnameIndex = (this.hostnameIndex + 1) % TINYIMG_URL.length;

            const req = https.request({
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
                    } else {
                        resolve(result);
                    }
                });
            });
            req.write(buffer, 'binary');
            req.on('error', reject);
            req.end();
        });

    }

    private download(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const opt = new URL(url);
            let data = '';
            const req = https.request(opt, res => {
                res.setEncoding('binary');
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.end();
        });

    }

}