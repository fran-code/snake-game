import dotenv from 'dotenv';
dotenv.config();

export const {
    DB_NAME,
    API_PORT,
    API_KEY,
    SALT_ROUNDS
} = process.env;

export const DB_URL = `mongodb://localhost/snake`;

export let hosts = [];
if (process.env.NODE_ENV === 'production') {
    hosts = ['http://localhost:3000'];
} else {
    hosts = ['http://localhost:3000'];
}
