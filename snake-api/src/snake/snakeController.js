import socketio from 'socket.io';
import { logger } from '../middlewares';
import Room from './roomManager';
import { fixedOrigin } from './corsFixer';
import { hosts } from '../env';
import { verifyTokenSocket } from '../auth/verifyToken'
export default app => {
    let io = socketio.listen(app, {
        path: '/classic-mode',
        origins: fixedOrigin(hosts)
    });

    logger.info('Started listening!');

    const classicMode = io.of('/classic-mode');
    classicMode.use(verifySnake).on('connection', async socket => {

        const { username, roomId, password, action, options } = socket.handshake.query;
        let room = new Room({ io: classicMode, socket, username, roomId, password, action, options });
        const joinedRoom = await room.init(username);

        if (joinedRoom) {
            logger.info(`${username} Connected`);
            room.showPlayers();
            room.isReady();
            room.moveLeft();
            room.moveRight();
            room.fire();
        }



        room.onDisconnect();
    });

    return io;

};

const verifySnake = async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        const isSuccess = await verifyTokenSocket(socket.handshake.query.token);
        if (isSuccess) next()
        else next(new Error('Token socket error'));
    }
};
