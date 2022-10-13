import fs from "fs";
import path from "path";
import sharp from 'sharp';
import FileUtil from "../common/FileUtil";

namespace Web {
    class ImageResizer {

        private imageSize: Record<string, { w: number, h: number, name: string }>;

        constructor() {

        }

        private async resize(imagePath: string, scale: number): Promise<void> {
            const sharpImage = sharp(imagePath);
            const metadata: sharp.Metadata = await sharpImage.metadata();
            const oldWidth = metadata.width;
            const oldHeight = metadata.height;
            const newWidth = Math.ceil(oldWidth * scale);
            const newHeight = Math.ceil(oldHeight * scale);
            if (oldWidth === newWidth && oldHeight === newHeight) {
                console.log(`Resize Image ${imagePath}: ${metadata.width}*${metadata.height} -> skip`);
                return;
            }
            console.log(`Resize Image ${imagePath}: ${metadata.width}*${metadata.height} -> ${newWidth}*${newHeight}`);
            const imageExt = path.extname(imagePath);
            const imageName = path.basename(imagePath).replace(imageExt, '');
            const scaleImageName = `${imageName}_@x{scale}`
            const outPath = imagePath.replace(imageName, scaleImageName);
            await sharpImage.resize(newWidth, newHeight, { fastShrinkOnLoad: false, kernel: 'nearest' }).toFile(outPath);
            this.imageSize[imageName] = { w: oldWidth, h: oldHeight, name: scaleImageName };
            FileUtil.rm(imagePath);
        }


        private async resizeImages(dir: string, scale: number): Promise<void> {
            const files = fs.readdirSync(dir);
            for (let i = 0; i < files.length; i++) {
                const subFileName = files[i];
                const subFilePath = path.join(dir, subFileName)
                const stat = fs.statSync(subFilePath);
                if (stat.isDirectory()) {
                    await this.resizeImages(subFilePath, scale);
                } else {
                    const extname = path.extname(subFileName);
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
                            await this.resize(subFilePath, scale);
                            break;
                    }
                }
            }
        }

        public async run(buildDir: string, scale: number): Promise<void> {
            if (scale === 1) return;
            this.imageSize = {};

            await this.resizeImages(path.join(buildDir, 'res'), scale);

            const libName = `ImageResizer_${Date.now()}.js`

            const indexPath = path.join(buildDir, 'index.html');
            let htmlContent = fs.readFileSync(indexPath).toString();
            const bodyEndIndex = htmlContent.indexOf('</body>');
            htmlContent = `${htmlContent.substring(0, bodyEndIndex)}<script type="text/javascript">
            (function(){window._CCSettings.jsList?window._CCSettings.jsList.push("${libName}"):(window._CCSettings.jsList = ["${libName}"]);})();
            </script>${htmlContent.substring(bodyEndIndex)}`
            fs.writeFileSync(indexPath, htmlContent);

            let libContent = fs.readFileSync(path.join(__dirname, '..', '..', 'libs', 'web', 'ImageResizer.js')).toString();
            libContent = libContent.replace('const RESIZED_IMAGE_DATA_MAP = {};', `const RESIZED_IMAGE_DATA_MAP = ${JSON.stringify(this.imageSize)};`)
            fs.writeFileSync(path.join(buildDir, 'src', libName), libContent);
        }

    }

    export const ScaleImages = async (projectPath: string, scale: number): Promise<void> => {
        const resizer = new ImageResizer();
        resizer.run(projectPath, scale);
    }
}

export default Web;