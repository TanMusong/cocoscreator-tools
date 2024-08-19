import child_process from 'child_process';
import compressing from 'compressing';
import fs from "fs";
import path from "path";
import FileUtil from '../common/FileUtil';
import Config from "../config/Config";
import Command from "./Command";

export default class ApkCommand extends Command {
    public async execute(command: string): Promise<void> {
        switch (command) {
            case 'p':
            case 'pack':
                {
                    const apkAssetsPath = process.argv[3];
                    if (!fs.existsSync(apkAssetsPath)) {
                        console.error(`资源目录: '${apkAssetsPath}' 不存在`);
                        this.errorExit();
                    }

                    const output = this.getStringArg('-output');
                    if (!output) {
                        console.error(`参数错误: -output`);
                        this.errorExit();
                    }

                    let keystore: string, storepass: string, alias: string, keypass: string;
                    keystore = this.getStringArg('-keystore') || (Config.getInstance().get('keystore') as string);
                    if (keystore) {
                        storepass = this.getStringArg('-storepass') || (Config.getInstance().get('storepass') as string);
                        if (!storepass) {
                            console.error(`参数错误: -storepass`);
                            this.errorExit();
                        }
                        alias = this.getStringArg('-alias') || (Config.getInstance().get('alias') as string);
                        if (!alias) {
                            console.error(`参数错误: -alias`);
                            this.errorExit();
                        }
                        keypass = this.getStringArg('-keypass') || (Config.getInstance().get('keypass') as string);
                        if (!keypass) {
                            console.error(`参数错误: -keypass`);
                            this.errorExit();
                        }
                    } else {
                        //keytool -genkey -keyalg RSA -keysize 1024 -validity 3650 -keystore debug.keystore -storepass 123456 -alias tms -keypass 123456 -dname CN=TanMusong,OU=TanMusong,O=TanMusong,L=Beijing,S=Beijing,C=CN
                        keystore = path.join(__dirname, '..', 'keystore', 'debug.keystore');
                        storepass = '123456';
                        alias = 'debug_keystore';
                        keypass = '123456'
                    }
                    await this.pack(apkAssetsPath, output, keystore, storepass, alias, keypass)
                }
                break;
            case 'up':
            case 'unpack':
                {
                    const apkPath = process.argv[3];
                    if (!fs.existsSync(apkPath)) {
                        console.error(`APK文件: '${apkPath}' 不存在`);
                        this.errorExit();
                    }

                    const output = this.getStringArg('-output');
                    if (output === undefined) {
                        console.error(`参数错误: -output`);
                        process.exit(2);
                    }
                    await this.unpack(apkPath, output);
                }
                break;
        }
    }

    private async pack(apkAssetsPath: string, outputPath: string, keystore: string, storepass: string, alias: string, keypass: string): Promise<void> {
        console.log('删除META-INF');
        FileUtil.rm(path.join(apkAssetsPath, 'META-INF'));

        console.log('打包资源');
        FileUtil.rm(outputPath);
        await compressing.zip.compressDir(apkAssetsPath, outputPath, { ignoreBase: true });

        console.log('重新签名');
        const apksigner = path.join(__dirname, '..', '..', 'tools', 'apksigner.jar');
        const signCmd = `${apksigner} sign --ks ${keystore} --ks-pass pass:${storepass} --ks-key-alias ${alias} --key-pass pass:${keypass} ${outputPath} `;
        child_process.execSync(signCmd);

        console.log(`打包完成`)
    }

    private async unpack(apkPath: string, outputPath: string): Promise<void> {
        console.log('创建目录');
        fs.existsSync(outputPath) && FileUtil.rm(outputPath);
        fs.mkdirSync(outputPath);
        console.log('解包资源');
        await compressing.zip.uncompress(apkPath, outputPath);
        console.log(`解包完成`);
    }

}