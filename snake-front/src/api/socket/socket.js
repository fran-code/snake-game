import openSocket from 'socket.io-client';
import { snakeSocketUlr } from '../../env';
import { constants } from '../../utils/constants';

export let socketConnection

export const SockerInit = (username, roomId, password, action, options) => {
    const token = window.localStorage.getItem(constants.authToken);
    const socket = openSocket(`${snakeSocketUlr}`, {
        path: '/classic-mode',
        query: { username, roomId, password, action, token, options: JSON.stringify(options) }
    });
    return socket;
}