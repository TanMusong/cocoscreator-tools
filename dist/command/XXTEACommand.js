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
const XXTeaUtil_1 = __importDefault(require("../common/XXTeaUtil"));
const Config_1 = __importDefault(require("../config/Config"));
const Command_1 = __importDefault(require("./Command"));
class XXTEACommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command) {
                case 'd':
                case 'decrypt':
                case 'e':
                case 'encrypt':
                    {
                        const filePath = process.argv[3];
                        if (!fs_1.default.existsSync(filePath)) {
                            console.error(`文件: '${filePath}' 不存在`);
                            this.errorExit();
                        }
                        const xxtea = this.getStringArg('-xxtea') || Config_1.default.getInstance().get('xxtea');
                        if (!xxtea) {
                            console.error(`参数错误: -xxtea`);
                            this.errorExit();
                        }
                        const outFilePath = this.getStringArg('-out') || filePath;
                        const compress = this.haveArg('-compress') || this.haveArg('-zip') || Config_1.default.getInstance().get('compress');
                        const cotnent = fs_1.default.readFileSync(filePath);
                        const script = (command === 'd' || command === 'decrypt') ?
                            XXTeaUtil_1.default.decryptJSC(cotnent, xxtea, compress) :
                            XXTeaUtil_1.default.encryptJS(cotnent.toString(), xxtea, compress);
                        if (!script) {
                            console.error(`XXTEA解密失败`);
                            this.errorExit();
                        }
                        fs_1.default.writeFileSync(outFilePath, script);
                    }
                    break;
            }
        });
    }
}
exports.default = XXTEACommand;
