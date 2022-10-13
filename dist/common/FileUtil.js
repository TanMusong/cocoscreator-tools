"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var FileUtil;
(function (FileUtil) {
    function copy(srcFileOrDir, destFileOrDir) {
        if (!fs_1.default.existsSync(srcFileOrDir))
            return;
        const stat = fs_1.default.statSync(srcFileOrDir);
        if (stat.isDirectory()) {
            mkdir(destFileOrDir);
            const files = fs_1.default.readdirSync(srcFileOrDir);
            files.forEach(item => copy(path_1.default.join(srcFileOrDir, item), path_1.default.join(destFileOrDir, item)));
        }
        else {
            mkdir(path_1.default.dirname(destFileOrDir));
            fs_1.default.copyFileSync(srcFileOrDir, destFileOrDir);
        }
    }
    FileUtil.copy = copy;
    function mkdir(dir) {
        if (fs_1.default.existsSync(dir))
            return;
        let parentDir = path_1.default.dirname(dir);
        mkdir(parentDir);
        fs_1.default.mkdirSync(dir);
    }
    FileUtil.mkdir = mkdir;
    function rm(fileOrDir) {
        if (!fs_1.default.existsSync(fileOrDir))
            return;
        const stat = fs_1.default.statSync(fileOrDir);
        if (stat.isDirectory()) {
            const files = fs_1.default.readdirSync(fileOrDir);
            files.forEach(item => rm(path_1.default.join(fileOrDir, item)));
            fs_1.default.rmdirSync(fileOrDir);
        }
        else {
            fs_1.default.unlinkSync(fileOrDir);
        }
    }
    FileUtil.rm = rm;
    function find(dir, nameOrRegExp, deepFind = false) {
        if (!fs_1.default.existsSync(dir))
            return null;
        const files = fs_1.default.readdirSync(dir);
        const check = typeof nameOrRegExp === 'string' ? (value) => value === nameOrRegExp : (value) => nameOrRegExp.test(value);
        for (const file of files) {
            const fullPath = path_1.default.join(dir, file);
            const stat = fs_1.default.statSync(fullPath);
            if (!stat.isDirectory()) {
                if (check(file))
                    return fullPath;
            }
            else if (deepFind) {
                const result = find(fullPath, nameOrRegExp);
                if (result)
                    return result;
            }
        }
        return null;
    }
    FileUtil.find = find;
    function fileCount(dir, includeFolder = false) {
        if (!fs_1.default.existsSync(dir))
            return 0;
        const stat = fs_1.default.statSync(dir);
        if (!stat.isDirectory()) {
            return 1;
        }
        let count = includeFolder ? 1 : 0;
        const files = fs_1.default.readdirSync(dir);
        files.forEach(item => count += fileCount(path_1.default.join(dir, item)));
        return count;
    }
    FileUtil.fileCount = fileCount;
})(FileUtil || (FileUtil = {}));
exports.default = FileUtil;
