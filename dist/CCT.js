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
const ApkCommand_1 = __importDefault(require("./command/ApkCommand"));
const ConfigCommand_1 = __importDefault(require("./command/ConfigCommand"));
const ImageCommand_1 = __importDefault(require("./command/ImageCommand"));
const ScriptCommand_1 = __importDefault(require("./command/ScriptCommand"));
const UUIDCommand_1 = __importDefault(require("./command/UUIDCommand"));
const WebCommand_1 = __importDefault(require("./command/WebCommand"));
const XXTEACommand_1 = __importDefault(require("./command/XXTEACommand"));
class Main {
    constructor() {
        this.commandMap = new Map();
        this.commandMap = new Map();
        this.registerCommand(new ApkCommand_1.default(), 'p', 'pack', 'up', 'unpack');
        this.registerCommand(new ConfigCommand_1.default(), 'config', 'cfg');
        this.registerCommand(new ImageCommand_1.default(), 'compress', 'compress-image');
        this.registerCommand(new ScriptCommand_1.default(), 'script', 'js');
        this.registerCommand(new UUIDCommand_1.default(), 'u2b', 'b2u');
        this.registerCommand(new WebCommand_1.default(), 'web');
        this.registerCommand(new XXTEACommand_1.default(), 'd', 'decrypt', 'e', 'encrypt');
    }
    registerCommand(commandRunner, ...command) {
        command.forEach(c => this.commandMap.set(c, commandRunner));
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const command = process.argv[2];
            const commandRunner = this.commandMap.get(command);
            commandRunner && (yield commandRunner.execute(command));
        });
    }
}
const main = new Main();
main.execute();
