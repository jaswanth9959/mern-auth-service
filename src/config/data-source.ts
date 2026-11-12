import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User.ts";
import { Config } from "./index.ts";

function getEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}

export const AppDataSource = new DataSource({
    type: Config.DB_TYPE as "postgres",
    host: getEnv("DB_HOST"),
    port: Number(getEnv("DB_PORT")),
    username: getEnv("DB_USERNAME"),
    password: getEnv("DB_PASSWORD"),
    database: getEnv("DB_NAME"),

    synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",

    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
