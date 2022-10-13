"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pako_1 = __importDefault(require("pako"));
const xxtea_node_1 = __importDefault(require("xxtea-node"));
var XXTeaUtil;
(function (XXTeaUtil) {
    XXTeaUtil.decryptJSC = (data, key, compress = true) => {
        const byteKey = xxtea_node_1.default.toBytes(key);
        let decryptData = xxtea_node_1.default.decrypt(data, byteKey);
        if (!decryptData)
            return null;
        if (compress)
            decryptData = pako_1.default.ungzip(decryptData);
        return xxtea_node_1.default.toString(decryptData);
    };
    XXTeaUtil.encryptJS = (data, key, compress = true) => {
        const byteKey = xxtea_node_1.default.toBytes(key);
        let byteData = xxtea_node_1.default.toBytes(data);
        if (compress)
            byteData = pako_1.default.gzip(byteData, { level: 6 });
        return xxtea_node_1.default.encrypt(byteData, byteKey);
    };
})(XXTeaUtil || (XXTeaUtil = {}));
exports.default = XXTeaUtil;
