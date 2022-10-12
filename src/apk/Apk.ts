import fs from 'fs';
import path from 'path';
import compressing from 'compressing';
import child_process from 'child_process';
import cct from '../CCT';
import FileUtil from '../common/FileUtil';

namespace Apk {

    export class UnpackedAPK {
        constructor(private readonly projectPath: string) {

        }

        public openCCLog(xxtea?: string, compress?: boolean): void {
            const scriptPath = FileUtil.find(path.join(this.projectPath, 'assets', 'src'), /cocos2d-jsb\.([a-zA-Z0-9\.]+\.)?js/);
            const encrypt = path.extname(scriptPath) === '.jsc';
            const scriptBuffer = fs.readFileSync(scriptPath);
            let script: string
            if (encrypt) {
                console.log('decrypt javascript');
                script = cct.decryptJSC(scriptBuffer, xxtea, compress);
            }
            else script = scriptBuffer.toString();

            console.log('modify cocos log function');
            script = script.replace(/_resetDebugSetting\s*:/, `_resetDebugSetting:function(mode){_resetDebugSettingReal(1);};\n_resetDebugSettingReal:`);

            if (encrypt) {
                console.log('encrypt javascript');
                fs.writeFileSync(scriptPath, cct.encryptJS(script, xxtea, compress));
            }
            else fs.writeFileSync(scriptPath, script);
        }

        public async pack(apkPath: string, keystore: string, storepass: string, alias: string, keypass: string): Promise<void> {

            console.log('delete sign');
            FileUtil.rm(path.join(this.projectPath, 'META-INF'));

            console.log('repack apk');
            FileUtil.rm(apkPath);
            await compressing.zip.compressDir(this.projectPath, apkPath, { ignoreBase: true });


            console.log('resign apk');
            const apksigner = path.join(__dirname, '..', '..', 'tools', 'apksigner.bat');
            const signCmd = `${apksigner} sign --ks ${keystore} --ks-pass pass:${storepass} --ks-key-alias ${alias} --key-pass pass:${keypass} ${apkPath} `;
            child_process.execSync(signCmd);
        }

        public clean(): void {
            console.log('delete temp files');
            FileUtil.rm(this.projectPath);
        }
    }

    export const Unpack = async (apkPath: string): Promise<UnpackedAPK> => {
        const dirPath = path.dirname(apkPath);
        const outputPath = path.join(dirPath, `.___apk_${Date.now()}`);

        console.log('create output dir');
        fs.existsSync(outputPath) && FileUtil.rm(outputPath);
        fs.mkdirSync(outputPath);

        console.log('unpack apk');
        await compressing.zip.uncompress(apkPath, outputPath);

        return new UnpackedAPK(outputPath);
    }
}
export default Apk;


