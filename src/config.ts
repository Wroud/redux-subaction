export enum LoggingLevel {
    none = 0,
    warn = 1,
    info = 2,
    addition = 2,
}

export class LoggingClass {
    level: LoggingLevel = LoggingLevel.info;
    setLevel = (level: LoggingLevel) => {
        this.level = level;
    }
}

export const Logging = new LoggingClass();
