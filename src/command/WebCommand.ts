import fs from "fs";
import path from "path";
import sharp from 'sharp';
import FileUtil from "../common/FileUtil";
import Command from "./Command";

type ResizeMap = Record<string, { w: number, h: number, name: string }>;

export default class WebCommand extends Command {



    public async execute(command: string): Promise<void> {
        const projectPath = process.argv[3];
        if (!fs.existsSync(projectPath)) process.exit(1);
        if (this.haveArg('-resize-image')) {
            const scale = this.getNumberArg('-resize-image');
            if (scale === undefined) this.errorExit();
            else if (scale === 1) this.normalExit();
            else {
                const imageSize = await this.resizeImages(path.join(projectPath, 'res'), scale);
                const libName = `ImageResizer_${Date.now()}.js`
                const indexPath = path.join(projectPath, 'index.html');
                let htmlContent = fs.readFileSync(indexPath).toString();
                const bodyEndIndex = htmlContent.indexOf('</body>');
                htmlContent = `${htmlContent.substring(0, bodyEndIndex)}<script type="text/javascript">
                    (function(){window._CCSettings.jsList?window._CCSettings.jsList.push("${libName}"):(window._CCSettings.jsList = ["${libName}"]);})();
                    </script>${htmlContent.substring(bodyEndIndex)}`
                fs.writeFileSync(indexPath, htmlContent);

                let libContent = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'web', 'ImageResizer.js')).toString();
                libContent = libContent.replace('const RESIZED_IMAGE_DATA_MAP = {};', `const RESIZED_IMAGE_DATA_MAP = ${JSON.stringify(imageSize)};`)
                fs.writeFileSync(path.join(projectPath, 'src', libName), libContent);
            }
        }
    }

    private async resize(imagePath: string, scale: number, resizeMap: ResizeMap): Promise<void> {
        const sharpImage = sharp(imagePath);
        const metadata: sharp.Metadata = await sharpImage.metadata();
        const oldWidth = metadata.width;
        const oldHeight = metadata.height;
        const newWidth = Math.ceil(oldWidth * scale);
        const newHeight = Math.ceil(oldHeight * scale);
        if (oldWidth === newWidth && oldHeight === newHeight) {
            console.log(`缩放${imagePath}: ${metadata.width}*${metadata.height} -> 跳过`);
            return;
        }
        console.log(`缩放${imagePath}: ${metadata.width}*${metadata.height} -> ${newWidth}*${newHeight}`);
        const imageExt = path.extname(imagePath);
        const imageName = path.basename(imagePath).replace(imageExt, '');
        const scaleImageName = `${imageName}_@x{scale}`
        const outPath = imagePath.replace(imageName, scaleImageName);
        await sharpImage.resize(newWidth, newHeight, { fastShrinkOnLoad: false, kernel: 'nearest' }).toFile(outPath);
        resizeMap[imageName] = { w: oldWidth, h: oldHeight, name: scaleImageName };
        FileUtil.rm(imagePath);
    }


    private async resizeImages(dir: string, scale: number, resizeMap?: ResizeMap): Promise<ResizeMap> {
        resizeMap = resizeMap || {};
        const files = fs.readdirSync(dir);
        for (let i = 0; i < files.length; i++) {
            const subFileName = files[i];
            const subFilePath = path.join(dir, subFileName)
            const stat = fs.statSync(subFilePath);
            if (stat.isDirectory()) {
                await this.resizeImages(subFilePath, scale, resizeMap);
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
                        await this.resize(subFilePath, scale, resizeMap);
                        break;
                }
            }
        }

        return resizeMap;
    }


}