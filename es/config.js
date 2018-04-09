export var LoggingLevel;
(function (LoggingLevel) {
    LoggingLevel[LoggingLevel["none"] = 0] = "none";
    LoggingLevel[LoggingLevel["warn"] = 1] = "warn";
    LoggingLevel[LoggingLevel["info"] = 2] = "info";
    LoggingLevel[LoggingLevel["addition"] = 2] = "addition";
})(LoggingLevel || (LoggingLevel = {}));
export class LoggingClass {
    constructor() {
        this.level = LoggingLevel.info;
        this.setLevel = (level) => {
            this.level = level;
        };
    }
}
export const Logging = new LoggingClass();
