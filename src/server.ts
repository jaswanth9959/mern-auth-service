import app from "./app.ts";
import { Config } from "./config/index.ts";
import logger from "./config/logger.ts";

const startServer = () => {
    const port = Config.PORT;

    try {
        app.listen(port, () => {
            logger.info("Listining on port:", { port: port });
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
