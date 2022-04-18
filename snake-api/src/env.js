import dotenv from 'dotenv';
dotenv.config();

export const {
    DB_NAME,
    API_PORT,
    API_KEY,
    SALT_ROUNDS
} = process.env;

export let DB_URL = 'mongodb://localhost/snake'
if(process.env.NODE_ENV === 'production') {
    DB_URL = 'mongodb://mongo-db:27017/snake'
}

export let hosts = ['http://localhost:3000']
if (process.env.NODE_ENV === 'production') {
    hosts = ['http://localhost:3000']
}
