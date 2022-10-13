import fs from "fs";
import path from "path";
import Apk from "./apk/Apk";
import XXTeaUtil from "./common/XXTeaUtil";
import { Base64ToUUID, UUIDToBase64 } from "./uuid/UUID";
import Web from "./web/Web";

const getArg = (key: string, check?: (value: string) => boolean): string | null => {
    const index = process.argv.indexOf(key);
    if (index < 0) return null;
    const value = process.argv[index + 1];
    return check ? (check(value) ? value : null) : value;
}

const haveArg = (key: string): boolean => {
    const index = process.argv.indexOf(key);
    return index >= 0;
}

const runner = async (): Promise<void> => {

    const command = process.argv[2];
    switch (command) {
        case 'u2b':
            {
                const uuid = process.argv[3];
                console.log(uuid ? UUIDToBase64(uuid) : 'Empty UUID');
            }
            break;
        case 'b2u':
            {
                const base64 = process.argv[3];
                console.log(base64 ? Base64ToUUID(base64) : 'Empty Base64');
            }
            break;
        case 'd':
        case 'decrypt':
        case 'e':
        case 'encrypt':
            {
                const filePath = process.argv[3];
                if (!fs.existsSync(filePath)) {
                    console.error(`${filePath} not exists`);
                    process.exit(1);
                }
                const xxtea = getArg('-xxtea', value => value && !value.startsWith('-'));
                if (!xxtea) {
                    console.error(`illegal parameter: -xxtea`);
                    process.exit(1);
                }
                const outFilePath = getArg('-out', value => value && !value.startsWith('-')) || filePath;
                const compress = haveArg('-compress') || haveArg('-zip');
                const cotnent = fs.readFileSync(filePath);
                const script: string | Uint8Array | null = (command === 'd' || command === 'decrypt') ?
                    XXTeaUtil.decryptJSC(cotnent, xxtea, compress) :
                    XXTeaUtil.encryptJS(cotnent.toString(), xxtea, compress);
                if (!script) {
                    console.error(`xxtea error`);
                    process.exit(2);
                }
                fs.writeFileSync(outFilePath, script);
            }
            break;
        case 'apk':
            {
                const apkPath = process.argv[3];
                if (!fs.existsSync(apkPath)) process.exit(1);

                const output = getArg('-output', value => !value.startsWith('-'));
                if (!output) process.exit(1);



                let keystore: string, storepass: string, alias: string, keypass: string;
                keystore = getArg('-keystore', value => !value.startsWith('-'));
                if (keystore) {
                    storepass = getArg('-storepass', value => !value.startsWith('-'));
                    if (!storepass) process.exit(1);
                    alias = getArg('-alias', value => !value.startsWith('-'));
                    if (!alias) process.exit(1);
                    keypass = getArg('-keypass', value => !value.startsWith('-'));
                    if (!keypass) process.exit(1);
                } else {
                    //keytool -genkey -keyalg RSA -keysize 1024 -validity 3650 -keystore debug.keystore -storepass 123456 -alias tms -keypass 123456 -dname CN=TanMusong,OU=TanMusong,O=TanMusong,L=Beijing,S=Beijing,C=CN
                    keystore = path.join(__dirname, '..', '..', 'keystore', 'debug.keystore');
                    storepass = '123456';
                    alias = 'tms';
                    keypass = '123456'
                }
                const unpackedAPK: Apk.UnpackedAPK = await Apk.Unpack(apkPath);

                if (haveArg('-log')) {
                    const xxtea = getArg('-xxtea', value => !value.startsWith('-'));
                    const compress = haveArg('-compress') || haveArg('-zip');
                    unpackedAPK.openCCLog(xxtea, compress);
                }

                await unpackedAPK.pack(output, keystore, storepass, alias, keypass)
                unpackedAPK.clean();
            }
            break;
        case 'web':
            const projectPath = process.argv[3];
            if (!fs.existsSync(projectPath)) process.exit(1);
            if (haveArg('-resize-image')) {
                const scale = getArg('-resize-image', value => { try { parseFloat(value); return true } catch (e) { return false } });
                if (!scale) {
                    process.exit(1);
                }
                Web.ScaleImages(projectPath, parseFloat(scale));
            }
            break;
        default:
            console.error(`Error Command: ${command}`);
            process.exit(1);
    }
}

runner();