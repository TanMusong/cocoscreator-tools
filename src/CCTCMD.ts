import cct from "./CCT";

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
        default:
            console.error(`Error Command: ${command}`);
            process.exit(1);
    }
}

runner();