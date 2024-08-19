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
const sharp_1 = __importDefault(require("sharp"));
const FileUtil_1 = __importDefault(require("../common/FileUtil"));
const Command_1 = __importDefault(require("./Command"));
class WebCommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectPath = process.argv[3];
            if (!fs_1.default.existsSync(projectPath))
                process.exit(1);
            if (this.haveArg('-resize-image')) {
                const scale = this.getNumberArg('-resize-image');
                if (scale === undefined)
                    this.errorExit();
                else if (scale === 1)
                    this.normalExit();
                else {
                    const imageSize = yield this.resizeImages(path_1.default.join(projectPath, 'res'), scale);
                    const libName = `ImageResizer_${Date.now()}.js`;
                    const indexPath = path_1.default.join(projectPath, 'index.html');
                    let htmlContent = fs_1.default.readFileSync(indexPath).toString();
                    const bodyEndIndex = htmlContent.indexOf('</body>');
                    htmlContent = `${htmlContent.substring(0, bodyEndIndex)}<script type="text/javascript">
                    (function(){window._CCSettings.jsList?window._CCSettings.jsList.push("${libName}"):(window._CCSettings.jsList = ["${libName}"]);})();
                    </script>${htmlContent.substring(bodyEndIndex)}`;
                    fs_1.default.writeFileSync(indexPath, htmlContent);
                    let libContent = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', '..', 'data', 'web', 'ImageResizer.js')).toString();
                    libContent = libContent.replace('const RESIZED_IMAGE_DATA_MAP = {};', `const RESIZED_IMAGE_DATA_MAP = ${JSON.stringify(imageSize)};`);
                    fs_1.default.writeFileSync(path_1.default.join(projectPath, 'src', libName), libContent);
                }
            }
        });
    }
    resize(imagePath, scale, resizeMap) {
        return __awaiter(this, void 0, void 0, function* () {
            const sharpImage = (0, sharp_1.default)(imagePath);
            const metadata = yield sharpImage.metadata();
            const oldWidth = metadata.width;
            const oldHeight = metadata.height;
            const newWidth = Math.ceil(oldWidth * scale);
            const newHeight = Math.ceil(oldHeight * scale);
            if (oldWidth === newWidth && oldHeight === newHeight) {
                console.log(`缩放${imagePath}: ${metadata.width}*${metadata.height} -> 跳过`);
                return;
            }
            console.log(`缩放${imagePath}: ${metadata.width}*${metadata.height} -> ${newWidth}*${newHeight}`);
            const imageExt = path_1.default.extname(imagePath);
            const imageName = path_1.default.basename(imagePath).replace(imageExt, '');
            const scaleImageName = `${imageName}_@x{scale}`;
            const outPath = imagePath.replace(imageName, scaleImageName);
            yield sharpImage.resize(newWidth, newHeight, { fastShrinkOnLoad: false, kernel: 'nearest' }).toFile(outPath);
            resizeMap[imageName] = { w: oldWidth, h: oldHeight, name: scaleImageName };
            FileUtil_1.default.rm(imagePath);
        });
    }
    resizeImages(dir, scale, resizeMap) {
        return __awaiter(this, void 0, void 0, function* () {
            resizeMap = resizeMap || {};
            const files = fs_1.default.readdirSync(dir);
            for (let i = 0; i < files.length; i++) {
                const subFileName = files[i];
                const subFilePath = path_1.default.join(dir, subFileName);
                const stat = fs_1.default.statSync(subFilePath);
                if (stat.isDirectory()) {
                    yield this.resizeImages(subFilePath, scale, resizeMap);
                }
                else {
                    const extname = path_1.default.extname(subFileName);
                    switch (extname) {
                        case '.png':
                        case '.jpg':
                        case '.bmp':
                        case '.jpeg':
                        case '.gif':
                        case '.ico':
                        case '.tiff':
                        case '.webp':
                        case '.image':
                            yield this.resize(subFilePath, scale, resizeMap);
                            break;
                    }
                }
            }
            return resizeMap;
        });
    }
}
exports.default = WebCommand;
