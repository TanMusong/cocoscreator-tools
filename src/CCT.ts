import ApkCommand from "./command/ApkCommand";
import Command from "./command/Command";
import ConfigCommand from "./command/ConfigCommand";
import ImageCommand from "./command/ImageCommand";
import ScriptCommand from "./command/ScriptCommand";
import UUIDCommand from "./command/UUIDCommand";
import WebCommand from "./command/WebCommand";
import XXTEACommand from "./command/XXTEACommand";


class Main {

    private commandMap: Map<string, Command> = new Map();
    constructor() {
        this.commandMap = new Map();
        this.registerCommand(new ApkCommand(), 'p', 'pack', 'up', 'unpack');
        this.registerCommand(new ConfigCommand(), 'config', 'cfg');
        this.registerCommand(new ImageCommand(), 'compress', 'compress-image');
        this.registerCommand(new ScriptCommand(), 'script', 'js');
        this.registerCommand(new UUIDCommand(), 'u2b', 'b2u');
        this.registerCommand(new WebCommand(), 'web');
        this.registerCommand(new XXTEACommand(), 'd', 'decrypt', 'e', 'encrypt');
    }

    private registerCommand(commandRunner: Command, ...command: string[]): void {
        command.forEach(c => this.commandMap.set(c, commandRunner));
    }

    public async execute(): Promise<void> {
        const command = process.argv[2];
        const commandRunner = this.commandMap.get(command);
        commandRunner && await commandRunner.execute(command);
    }

}

const main = new Main();
main.execute();
