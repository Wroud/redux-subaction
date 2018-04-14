"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoggingLevel;
(function (LoggingLevel) {
    LoggingLevel[LoggingLevel["none"] = 0] = "none";
    LoggingLevel[LoggingLevel["warn"] = 1] = "warn";
    LoggingLevel[LoggingLevel["info"] = 2] = "info";
    LoggingLevel[LoggingLevel["addition"] = 3] = "addition";
})(LoggingLevel = exports.LoggingLevel || (exports.LoggingLevel = {}));
var LoggingClass = (function () {
    function LoggingClass() {
        var _this = this;
        this.level = LoggingLevel.info;
        this.setLevel = function (level) {
            _this.level = level;
        };
    }
    return LoggingClass;
}());
exports.LoggingClass = LoggingClass;
exports.Logging = new LoggingClass();
//# sourceMappingURL=config.js.map