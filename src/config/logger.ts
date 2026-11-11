import winston from "winston";
import { Config } from "./index.ts";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "Auth-service",
    },
    transports: [
        new winston.transports.File({
            level: "info",
            dirname: "logs",
            filename: "app.log",
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
            ),
            silent: Config.NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
            ),
            silent: Config.NODE_ENV !== "test",
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
            ),
        }),
    ],
});

export default logger;
