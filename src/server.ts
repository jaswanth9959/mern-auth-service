import app from "./app.ts";
import { AppDataSource } from "./config/data-source.ts";
import { Config } from "./config/index.ts";
import logger from "./config/logger.ts";

const startServer = async () => {
    const port = Config.PORT;

    try {
        await AppDataSource.initialize();
        logger.info("Database is connected");
        app.listen(port, () => {
            logger.info("Listining on port:", { port: port });
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

void startServer();
