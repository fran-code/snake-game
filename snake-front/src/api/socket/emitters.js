import { socketConnection } from '../../pages/WaitingRoom/WaitingRoom'

export const emit = {

    startSnakeGame: () => {
        socketConnection.emit('start-game');
    },

    stopSnakeGame: () => {
        socketConnection.emit('stop-game');
    },

    moveLeft: state => {
        socketConnection.emit('move-left', state);
    },

    moveRight: state => {
        socketConnection.emit('move-right', state);
    },

    fire: state => {
        socketConnection.emit('fire', state);
    },

    closeConnection: () => {
        socketConnection.close();
    },

    isReady: () => {
        socketConnection.emit('is-ready');
    },


};