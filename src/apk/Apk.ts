import child_process from 'child_process';
import compressing from 'compressing';
import fs from 'fs';
import path from 'path';
import FileUtil from '../common/FileUtil';

namespace Apk {



    export const Pack = async (apkAssetsPath: string, outputPath: string, keystore: string, storepass: string, alias: string, keypass: string): Promise<void> => {

        console.log('delete sign');
        FileUtil.rm(path.join(apkAssetsPath, 'META-INF'));

        console.log('repack apk');
        FileUtil.rm(outputPath);
        await compressing.zip.compressDir(apkAssetsPath, outputPath, { ignoreBase: true });


        console.log('resign apk');
        const apksigner = path.join(__dirname, '..', '..', 'tools', 'apksigner.jar');
        const signCmd = `${apksigner} sign --ks ${keystore} --ks-pass pass:${storepass} --ks-key-alias ${alias} --key-pass pass:${keypass} ${outputPath} `;
        child_process.execSync(signCmd);
    }




    export const Unpack = async (apkPath: string, outputPath: string): Promise<void> => {
        console.log('create output dir');
        fs.existsSync(outputPath) && FileUtil.rm(outputPath);
        fs.mkdirSync(outputPath);
        console.log('unpack apk');
        await compressing.zip.uncompress(apkPath, outputPath);
    }
}

export default Apk;


