import dotenv from 'dotenv';
dotenv.config();

export const {
    DB_NAME,
    MONGO_PASSWORD,
    API_PORT,
    API_KEY,
    SALT_ROUNDS
} = process.env;

export const DB_URL = `mongodb://localhost/snake`;
export const MAX_TIMER_DEFAULT = 120 * 1000;
export const MAX_PLAYERS_DEFAULT = 14;

export let hosts = [];
if (process.env.NODE_ENV === 'production') {
    hosts = ['https://fifa.sauravmh.com', 'https://sauravmh.vercel.app'];
} else {
    hosts = ['http://localhost:3000'];
}

export const ROOM_ID_RX = /^([A-Z0-9]){6}$/;

export const ATTRIBUTES_TO_RETRIEVE = ['name', 'positions', 'Overall Rating', 'Skill Moves', 'objectID', 'photo_url'];
