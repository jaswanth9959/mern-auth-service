import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
    quiet: true,
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const {
    PORT,
    NODE_ENV,
    DB_TYPE = "postgres",
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_TYPE,
};
