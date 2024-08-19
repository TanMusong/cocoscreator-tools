import { Base64ToUUID, UUIDToBase64 } from "../common/UUID";
import Command from "./Command";

export default class UUIDCommand extends Command {

    public async execute(command: string): Promise<void> {
        switch (command) {
            case 'u2b':
                {
                    const uuid = process.argv[3];
                    console.log(uuid ? UUIDToBase64(uuid) : '参数错误');
                }
                break;
            case 'b2u':
                {
                    const base64 = process.argv[3];
                    console.log(base64 ? Base64ToUUID(base64) : '参数错误');
                }
                break;
        }
    }
}