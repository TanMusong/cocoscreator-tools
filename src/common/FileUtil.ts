import fs from 'fs';
import path from 'path';

namespace FileUtil {

    export function copy(srcFileOrDir: string, destFileOrDir: string): void {
        if (!fs.existsSync(srcFileOrDir)) return;
        const stat = fs.statSync(srcFileOrDir);
        if (stat.isDirectory()) {
            mkdir(destFileOrDir);
            const files = fs.readdirSync(srcFileOrDir);
            files.forEach(item => copy(path.join(srcFileOrDir, item), path.join(destFileOrDir, item)));
        } else {
            mkdir(path.dirname(destFileOrDir));
            fs.copyFileSync(srcFileOrDir, destFileOrDir);
        }
    }

    export function mkdir(dir: string): void {
        if (fs.existsSync(dir)) return;
        let parentDir = path.dirname(dir);
        mkdir(parentDir);
        fs.mkdirSync(dir);

    }

    export function rm(fileOrDir: string): void {
        if (!fs.existsSync(fileOrDir)) return;
        const stat = fs.statSync(fileOrDir);
        if (stat.isDirectory()) {
            const files = fs.readdirSync(fileOrDir);
            files.forEach(item => rm(path.join(fileOrDir, item)));
            fs.rmdirSync(fileOrDir);
        } else {
            fs.unlinkSync(fileOrDir);
        }

    }

    export function find(dir: string, nameOrRegExp: string | RegExp, deepFind: boolean = false): string | null {
        if (!fs.existsSync(dir)) return null;
        const files = fs.readdirSync(dir);
        const check = typeof nameOrRegExp === 'string' ? (value: string) => value === nameOrRegExp : (value: string) => nameOrRegExp.test(value);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (!stat.isDirectory()) {
                if (check(file)) return fullPath;
            } else if (deepFind) {
                const result = find(fullPath, nameOrRegExp);
                if (result) return result;
            }
        }
        return null;
    }

    export function fileCount(dir: string, includeFolder: boolean = false): number {
        if (!fs.existsSync(dir)) return 0;
        const stat = fs.statSync(dir);
        if (!stat.isDirectory()) {
            return 1;
        }
        let count = includeFolder ? 1 : 0;
        const files = fs.readdirSync(dir);
        files.forEach(item => count += fileCount(path.join(dir, item)))
        return count;
    }


}

export default FileUtil;