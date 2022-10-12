"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pako_1 = __importDefault(require("pako"));
const xxtea_node_1 = __importDefault(require("xxtea-node"));
const UUID_1 = require("./uuid/UUID");
var cct;
(function (cct) {
    cct.uuidToBase64 = (uuid) => {
        return (0, UUID_1.UUIDToBase64)(uuid);
    };
    cct.base64ToUUID = (base64) => {
        return (0, UUID_1.Base64ToUUID)(base64);
    };
    cct.decryptJSC = (data, key, compress = true) => {
        const byteKey = xxtea_node_1.default.toBytes(key);
        let decryptData = xxtea_node_1.default.decrypt(data, byteKey);
        if (!decryptData)
            return null;
        if (compress)
            decryptData = pako_1.default.ungzip(decryptData);
        return xxtea_node_1.default.toString(decryptData);
    };
    cct.encryptJS = (data, key, compress = true) => {
        const byteKey = xxtea_node_1.default.toBytes(key);
        let byteData = xxtea_node_1.default.toBytes(data);
        if (compress)
            byteData = pako_1.default.gzip(byteData, { level: 6 });
        return xxtea_node_1.default.encrypt(byteData, byteKey);
    };
})(cct || (cct = {}));
exports.default = cct;
