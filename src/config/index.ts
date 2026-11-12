import dotenv from "dotenv";

dotenv.config({ quiet: true });

// const PORT: string | number = process.env.PORT || 5000;

const { PORT, NODE_ENV } = process.env;

export const Config = {
    PORT,
    NODE_ENV,
};
