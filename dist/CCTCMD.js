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
const CCT_1 = __importDefault(require("./CCT"));
const fs_1 = __importDefault(require("fs"));
const getArg = (key, check) => {
    const index = process.argv.indexOf(key);
    if (index < 0)
        return null;
    const value = process.argv[index + 1];
    return check ? (check(value) ? value : null) : value;
};
const haveArg = (key) => {
    const index = process.argv.indexOf(key);
    return index >= 0;
};
const runner = () => __awaiter(void 0, void 0, void 0, function* () {
    const command = process.argv[2];
    switch (command) {
        case 'u2b':
            {
                const uuid = process.argv[3];
                console.log(uuid ? CCT_1.default.uuidToBase64(uuid) : 'Empty UUID');
            }
            break;
        case 'b2u':
            {
                const base64 = process.argv[3];
                console.log(base64 ? CCT_1.default.base64ToUUID(base64) : 'Empty Base64');
            }
            break;
        case 'd':
        case 'decrypt':
        case 'e':
        case 'encrypt':
            {
                const filePath = process.argv[3];
                if (!fs_1.default.existsSync(filePath)) {
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
                const cotnent = fs_1.default.readFileSync(filePath);
                const script = (command === 'd' || command === 'decrypt') ? CCT_1.default.decryptJSC(cotnent, xxtea, compress) : CCT_1.default.encryptJS(cotnent.toString(), xxtea, compress);
                if (!script) {
                    console.error(`xxtea error`);
                    process.exit(2);
                }
                fs_1.default.writeFileSync(outFilePath, script);
            }
            break;
        default:
            console.error(`Error Command: ${command}`);
            process.exit(1);
    }
});
runner();
