import { UUIDToBase64, Base64ToUUID } from "./uuid/UUID";

namespace cct {
    export const uuidToBase64 = (uuid: string): string => {
        return UUIDToBase64(uuid);
    }

    export const base64ToUUID = (base64: string): string => {
        return Base64ToUUID(base64);
    }
}

export default cct;