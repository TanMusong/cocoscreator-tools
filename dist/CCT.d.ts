/// <reference types="node" />
declare namespace cct {
    const uuidToBase64: (uuid: string) => string;
    const base64ToUUID: (base64: string) => string;
    const decryptJSC: (data: Buffer, key: string, compress?: boolean) => string | null;
    const encryptJS: (data: string, key: string, compress?: boolean) => Uint8Array;
}
export default cct;
