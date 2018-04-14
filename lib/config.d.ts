export declare enum LoggingLevel {
    none = 0,
    warn = 1,
    info = 2,
    addition = 3,
}
export declare class LoggingClass {
    level: LoggingLevel;
    setLevel: (level: LoggingLevel) => void;
}
export declare const Logging: LoggingClass;
