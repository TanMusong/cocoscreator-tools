"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    normalExit() {
        process.exit(0);
    }
    errorExit() {
        process.exit(1);
    }
    getArg(key, check) {
        const index = process.argv.indexOf(key);
        if (index < 0)
            return null;
        const value = process.argv[index + 1];
        return check ? (check(value) ? value : null) : value;
    }
    haveArg(key) {
        const index = process.argv.indexOf(key);
        return index >= 0;
    }
    getStringArg(key, defaultValue) {
        const arg = this.getArg(key, value => value && !value.startsWith('-'));
        return arg || defaultValue;
    }
    getNumberArg(key, defaultValue) {
        const arg = this.getStringArg(key);
        let numberArg = defaultValue;
        try {
            numberArg = Number(arg);
        }
        catch (e) {
            numberArg = defaultValue;
        }
        return numberArg;
    }
    getBooleanArg(key, defaultValue) {
        const arg = this.getStringArg(key);
        let booleanArg = defaultValue;
        if (arg === 'true')
            booleanArg = true;
        else if (arg === 'false')
            booleanArg = false;
        return booleanArg;
    }
}
exports.default = Command;
