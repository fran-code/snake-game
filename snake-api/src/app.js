import './database/db';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import routes from './routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { snake } from './snake';
import { handleError, logger } from './middlewares';
import { API_PORT, hosts } from './env';

const app = express();
const server = new http.Server(app);
snake(server);

app.use(cors({ origin: hosts, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

routes(app);

app.use((err, _req, res, _) => {
    handleError(err, res);
});

app.listen(API_PORT, () => {
    logger.info(`Api listening on port ${Number(API_PORT)}!`);
});

server.listen(Number(API_PORT) + 1, () => {
    logger.info(`Snake listening on port ${Number(API_PORT) + 1}!`);
    logger.info(`Api and snake whitelisted for ${hosts}`);
});
