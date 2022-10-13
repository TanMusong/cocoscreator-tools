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
var Web;
(function (Web) {
    class ImageResizer {
        constructor() {
        }
        resize(imagePath, scale) {
            return __awaiter(this, void 0, void 0, function* () {
                const sharpImage = (0, sharp_1.default)(imagePath);
                const metadata = yield sharpImage.metadata();
                const oldWidth = metadata.width;
                const oldHeight = metadata.height;
                const newWidth = Math.ceil(oldWidth * scale);
                const newHeight = Math.ceil(oldHeight * scale);
                if (oldWidth === newWidth && oldHeight === newHeight) {
                    console.log(`Resize Image ${imagePath}: ${metadata.width}*${metadata.height} -> skip`);
                    return;
                }
                console.log(`Resize Image ${imagePath}: ${metadata.width}*${metadata.height} -> ${newWidth}*${newHeight}`);
                const imageExt = path_1.default.extname(imagePath);
                const imageName = path_1.default.basename(imagePath).replace(imageExt, '');
                const scaleImageName = `${imageName}_@x{scale}`;
                const outPath = imagePath.replace(imageName, scaleImageName);
                yield sharpImage.resize(newWidth, newHeight, { fastShrinkOnLoad: false, kernel: 'nearest' }).toFile(outPath);
                this.imageSize[imageName] = { w: oldWidth, h: oldHeight, name: scaleImageName };
                FileUtil_1.default.rm(imagePath);
            });
        }
        resizeImages(dir, scale) {
            return __awaiter(this, void 0, void 0, function* () {
                const files = fs_1.default.readdirSync(dir);
                for (let i = 0; i < files.length; i++) {
                    const subFileName = files[i];
                    const subFilePath = path_1.default.join(dir, subFileName);
                    const stat = fs_1.default.statSync(subFilePath);
                    if (stat.isDirectory()) {
                        yield this.resizeImages(subFilePath, scale);
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
                                yield this.resize(subFilePath, scale);
                                break;
                        }
                    }
                }
            });
        }
        run(buildDir, scale) {
            return __awaiter(this, void 0, void 0, function* () {
                if (scale === 1)
                    return;
                this.imageSize = {};
                yield this.resizeImages(path_1.default.join(buildDir, 'res'), scale);
                const libName = `ImageResizer_${Date.now()}.js`;
                const indexPath = path_1.default.join(buildDir, 'index.html');
                let htmlContent = fs_1.default.readFileSync(indexPath).toString();
                const bodyEndIndex = htmlContent.indexOf('</body>');
                htmlContent = `${htmlContent.substring(0, bodyEndIndex)}<script type="text/javascript">
            (function(){window._CCSettings.jsList?window._CCSettings.jsList.push("${libName}"):(window._CCSettings.jsList = ["${libName}"]);})();
            </script>${htmlContent.substring(bodyEndIndex)}`;
                fs_1.default.writeFileSync(indexPath, htmlContent);
                let libContent = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', '..', 'libs', 'web', 'ImageResizer.js')).toString();
                libContent = libContent.replace('const RESIZED_IMAGE_DATA_MAP = {};', `const RESIZED_IMAGE_DATA_MAP = ${JSON.stringify(this.imageSize)};`);
                fs_1.default.writeFileSync(path_1.default.join(buildDir, 'src', libName), libContent);
            });
        }
    }
    Web.ScaleImages = (projectPath, scale) => __awaiter(this, void 0, void 0, function* () {
        const resizer = new ImageResizer();
        resizer.run(projectPath, scale);
    });
})(Web || (Web = {}));
exports.default = Web;
