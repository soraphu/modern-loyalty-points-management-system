export class Logger {
    private context: string;
    private isProduction: boolean;
    private minLogLevel: number;

    // 1. Assign numeric weights to log levels
    private static levels: Record<string, number> = {
        DEBUG: 0,
        INFO: 1,
        SUCCESS: 2,
        WARN: 3,
        ERROR: 4
    };

    private static colors = {
        reset: "\x1b[0m",
        info: "\x1b[36m",
        success: "\x1b[32m",
        warn: "\x1b[33m",
        error: "\x1b[31m",
        gray: "\x1b[90m"
    };

    constructor(context: string, isProd?: boolean) {
        this.context = context;
        this.isProduction = isProd !== undefined
            ? isProd
            : (process.env.NODE_ENV === 'production' || process.env.IS_PROD === 'true');

        // 2. Set the threshold: Production hides low-level info, Dev shows everything
        this.minLogLevel = this.isProduction
            ? Logger.levels.WARN  // 🚀 Prod: Only log WARN and ERROR
            : Logger.levels.INFO; // 💻 Dev: Log INFO, SUCCESS, WARN, and ERROR
    }

    // 3. Helper to check if we should skip logging this line
    private shouldLog(levelName: string): boolean {
        const currentWeight = Logger.levels[levelName];
        return currentWeight >= this.minLogLevel;
    }

    private getTimestamp(): string {
        return new Date().toISOString();
    }

    private formatDevLog(levelColor: string, levelName: string, message: string): string {
        const time = `${Logger.colors.gray}[${this.getTimestamp()}]${Logger.colors.reset}`;
        const ctx = `${Logger.colors.gray}[${this.context}]${Logger.colors.reset}`;
        const level = `${levelColor}${levelName.padEnd(7)}${Logger.colors.reset}`;
        return `${time} ${ctx} ${level} ${message}`;
    }

    private sendProdLog(level: string, message: string, meta?: any) {
        const logPayload = {
            timestamp: this.getTimestamp(),
            context: this.context,
            level: level,
            message: message,
            ...(meta && { meta })
        };

        if (level === 'ERROR' || level === 'WARN') {
            console.error(JSON.stringify(logPayload));
        } else {
            console.log(JSON.stringify(logPayload));
        }
    }

    info(message: string, meta?: any) {
        if (!this.shouldLog('INFO')) return; // 🛑 Blocked if in production

        if (this.isProduction) {
            this.sendProdLog('INFO', message, meta);
        } else {
            console.log(this.formatDevLog(Logger.colors.info, 'INFO', message), meta ?? '');
        }
    }

    success(message: string, meta?: any) {
        if (!this.shouldLog('SUCCESS')) return; // 🛑 Blocked if in production

        if (this.isProduction) {
            this.sendProdLog('SUCCESS', message, meta);
        } else {
            console.log(this.formatDevLog(Logger.colors.success, 'SUCCESS', message), meta ?? '');
        }
    }

    warn(message: string, meta?: any) {
        if (!this.shouldLog('WARN')) return; // ✅ Allowed everywhere

        if (this.isProduction) {
            this.sendProdLog('WARN', message, meta);
        } else {
            console.warn(this.formatDevLog(Logger.colors.warn, 'WARN', message), meta ?? '');
        }
    }

    error(message: string, errorObject?: any) {
        if (!this.shouldLog('ERROR')) return; // ✅ Allowed everywhere

        if (this.isProduction) {
            const errorMeta = errorObject instanceof Error
                ? { name: errorObject.name, message: errorObject.message, stack: errorObject.stack }
                : errorObject;
            this.sendProdLog('ERROR', message, errorMeta);
        } else {
            console.error(this.formatDevLog(Logger.colors.error, 'ERROR', message), errorObject ?? '');
        }
    }
}