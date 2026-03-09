import app from "./app";
import { env } from "./inc/env";

app.listen({ port: env.PORT }, () => {
    console.log(
        `Server listening on port ${env.PORT}\nView documentation at http://localhost:${env.PORT}/reference`,
    );
});
