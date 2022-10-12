"use strict";
//Cocos引擎中拷贝的UUID逻辑
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base64ToUUID = exports.UUIDToBase64 = void 0;
const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const HEXCHAR = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const BASE64_VALUES = new Array(123);
for (let i = 0; i < 123; ++i)
    BASE64_VALUES[i] = 64;
for (let i = 0; i < 64; ++i)
    BASE64_VALUES[BASE64_KEYS.charCodeAt(i)] = i;
const _t = ['', '', '', ''];
const uuidTemplate = _t.concat(_t, '-', _t, '-', _t, '-', _t, '-', _t, _t, _t);
const indices = uuidTemplate.map(function (value, index) { return value === '-' ? NaN : index; }).filter(isFinite);
const UUIDToBase64 = (uuid) => {
    let j = 2;
    let base64 = uuid.substring(0, j);
    for (let i = 2; i < 22; i += 2) {
        let hex1 = HEXCHAR.indexOf(uuid.charAt(indices[j++]));
        let hex2 = HEXCHAR.indexOf(uuid.charAt(indices[j++]));
        let hex3 = HEXCHAR.indexOf(uuid.charAt(indices[j++]));
        let lhs = (hex1 << 2) | (hex2 >> 2);
        let rhs = ((hex2 & 3) << 4) | hex3;
        base64 += BASE64_KEYS.charAt(lhs);
        base64 += BASE64_KEYS.charAt(rhs);
    }
    return base64;
};
exports.UUIDToBase64 = UUIDToBase64;
const Base64ToUUID = (base64) => {
    const baselen = base64.length;
    if (baselen < 22)
        return base64;
    uuidTemplate[0] = base64[0];
    uuidTemplate[1] = base64[1];
    for (let i = 2, j = 2; i < 22; i += 2) {
        let lhs = BASE64_VALUES[base64.charCodeAt(i)];
        let rhs = BASE64_VALUES[base64.charCodeAt(i + 1)];
        uuidTemplate[indices[j++]] = HEXCHAR[lhs >> 2];
        uuidTemplate[indices[j++]] = HEXCHAR[((lhs & 3) << 2) | rhs >> 4];
        uuidTemplate[indices[j++]] = HEXCHAR[rhs & 0xF];
    }
    return uuidTemplate.join('');
};
exports.Base64ToUUID = Base64ToUUID;
