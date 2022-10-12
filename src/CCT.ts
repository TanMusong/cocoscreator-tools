import pako from "pako";
import xxtea from 'xxtea-node';
import { Base64ToUUID, UUIDToBase64 } from "./uuid/UUID";

namespace cct {
    export const uuidToBase64 = (uuid: string): string => {
        return UUIDToBase64(uuid);
    }

    export const base64ToUUID = (base64: string): string => {
        return Base64ToUUID(base64);
    }


    export const decryptJSC = (data: Buffer, key: string, compress: boolean = true): string | null => {
        const byteKey = xxtea.toBytes(key);
        let decryptData: Uint8Array = xxtea.decrypt(data, byteKey);
        if (!decryptData) return null;
        if (compress) decryptData = pako.ungzip(decryptData)
        return xxtea.toString(decryptData);
    }

    export const encryptJS = (data: string, key: string, compress: boolean = true): Uint8Array => {
        const byteKey = xxtea.toBytes(key);
        let byteData = xxtea.toBytes(data);
        if (compress) byteData = pako.gzip(byteData, { level: 6 })
        return xxtea.encrypt(byteData, byteKey);
    }
}

export default cct;