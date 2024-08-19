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
const UUID_1 = require("../common/UUID");
const Command_1 = __importDefault(require("./Command"));
class UUIDCommand extends Command_1.default {
    execute(command) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command) {
                case 'u2b':
                    {
                        const uuid = process.argv[3];
                        console.log(uuid ? (0, UUID_1.UUIDToBase64)(uuid) : '参数错误');
                    }
                    break;
                case 'b2u':
                    {
                        const base64 = process.argv[3];
                        console.log(base64 ? (0, UUID_1.Base64ToUUID)(base64) : '参数错误');
                    }
                    break;
            }
        });
    }
}
exports.default = UUIDCommand;
