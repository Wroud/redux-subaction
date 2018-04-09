"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
function deepExtend(destination, source) {
    if (Array.isArray(destination)) {
        destination.length = 0;
        destination.push.apply(destination, source);
        return;
    }
    for (var property in source) {
        if (typeof source[property] === "object"
            && source[property] !== null
            && !Array.isArray(source[property])) {
            destination[property] = __assign({}, destination[property]) || {};
            this.deepExtend(destination[property], source[property]);
        }
        else if (source[property] !== "__delete__") {
            destination[property] = source[property];
        }
        else {
            delete destination[property];
        }
    }
}
exports.deepExtend = deepExtend;
//# sourceMappingURL=tools.js.map