import fs from "fs";
import XXTeaUtil from "../common/XXTeaUtil";
import Config from "../config/Config";
import Command from "./Command";

export default class XXTEACommand extends Command {
    public async execute(command: string): Promise<void> {
        switch (command) {
            case 'd':
            case 'decrypt':
            case 'e':
            case 'encrypt':
                {
                    const filePath = process.argv[3];
                    if (!fs.existsSync(filePath)) {
                        console.error(`文件: '${filePath}' 不存在`);
                        this.errorExit();
                    }
                    const xxtea = this.getStringArg('-xxtea') || (Config.getInstance().get('xxtea') as string);
                    if (!xxtea) {
                        console.error(`参数错误: -xxtea`);
                        this.errorExit();
                    }
                    const outFilePath = this.getStringArg('-out') || filePath;
                    const compress = this.haveArg('-compress') || this.haveArg('-zip') || (Config.getInstance().get('compress') as boolean);
                    const cotnent = fs.readFileSync(filePath);
                    const script: string | Uint8Array | null = (command === 'd' || command === 'decrypt') ?
                        XXTeaUtil.decryptJSC(cotnent, xxtea, compress) :
                        XXTeaUtil.encryptJS(cotnent.toString(), xxtea, compress);
                    if (!script) {
                        console.error(`XXTEA解密失败`);
                        this.errorExit();
                    }
                    fs.writeFileSync(outFilePath, script);
                }
                break;
        }
    }
}