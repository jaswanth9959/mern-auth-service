import app from "./app.ts";
import { Config } from "./config/index.ts";

const startServer = () => {
    const port = Config.PORT;

    try {
        app.listen(port, () => {
            console.log(`Listing on port ${port}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
