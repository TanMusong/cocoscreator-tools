"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UUID_1 = require("./uuid/UUID");
var cct;
(function (cct) {
    cct.uuidToBase64 = (uuid) => {
        return (0, UUID_1.UUIDToBase64)(uuid);
    };
    cct.base64ToUUID = (base64) => {
        return (0, UUID_1.Base64ToUUID)(base64);
    };
})(cct || (cct = {}));
exports.default = cct;
