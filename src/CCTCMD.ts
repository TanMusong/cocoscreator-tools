import cct from "./CCT";
import fs from "fs";

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
                console.log(uuid ? cct.uuidToBase64(uuid) : 'Empty UUID');
            }
            break;
        case 'b2u':
            {
                const base64 = process.argv[3];
                console.log(base64 ? cct.base64ToUUID(base64) : 'Empty Base64');
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
                const xxtea = getArg('-xxtea', value => !value.startsWith('-'));
                if (!xxtea) {
                    console.error(`illegal parameter: -xxtea`);
                    process.exit(1);
                }
                const outFilePath = getArg('-out', value => !value.startsWith('-')) || filePath;
                const compress = haveArg('-compress') || haveArg('-zip');
                const cotnent = fs.readFileSync(filePath);
                const script: string | Uint8Array | null = (command === 'd' || command === 'decrypt') ? cct.decryptJSC(cotnent, xxtea, compress) : cct.encryptJS(cotnent.toString(), xxtea, compress);
                if (!script) {
                    console.error(`xxtea error`);
                    process.exit(2);
                }
                fs.writeFileSync(outFilePath, script);
            }
            break;
        default:
            console.error(`Error Command: ${command}`);
            process.exit(1);
    }
}

runner();