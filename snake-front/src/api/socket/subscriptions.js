import { socketConnection } from '../../pages/WaitingRoom/WaitingRoom'
import { message } from 'antd'

export const subscribeTo = {

  getSnakeHead: cb => {
    socketConnection.on('snake-head', message => {
      cb(null, message);
    });
  },

  getSnakeBody: cb => {
    socketConnection.on('snake-body', message => {
      cb(null, message);
    });
  },

  updateSnakeBody: cb => {
    socketConnection.on('update-body', message => {
      cb(null, message);
    });
  },

  getWeaponMoves: cb => {
    socketConnection.on('weapon-moves', message => {
      cb(null, message);
    });
  },

  playerDie: cb => {
    socketConnection.on('player-die', username => {
      cb(null, username);
    });
  },

  endGame: cb => {
    socketConnection.on('end-game', ranking => {
      cb(null, ranking);
    });
  },

  showExplosion: cb => {
    socketConnection.on('show-explosion', explosion => {
      cb(null, explosion);
    });
  },

  showShoot: cb => {
    socketConnection.on('show-shoot', shoot => {
      cb(null, shoot);
    });
  },

  setItems: cb => {
    socketConnection.on('set-items', items => {
      cb(null, items);
    });
  },

  getWeapon: cb => {
    socketConnection.on('get-weapon', item => {
      console.log(item);
      cb(null, item);
    });
  },

  getPassive: cb => {
    socketConnection.on('get-passive', item => {
      console.log(item);
      cb(null, item);
    });
  },

  updateAmmo: cb => {
    socketConnection.on('update-ammo', item => {
      console.log(item);
      cb(null, item);
    });
  },

  updateUses: cb => {
    socketConnection.on('update-uses', item => {
      console.log(item);
      cb(null, item);
    });
  },

  showPlayers: cb => {
    socketConnection.on('show-players', item => {
      console.log(item);
      cb(null, item);
    });
  },

  setRoomId: cb => {
    socketConnection.on('set-roomId', item => {
      console.log(item);
      cb(null, item);
    });
  },

  gameReady: cb => {
    socketConnection.on('game-ready', startTime => {
      cb(null, startTime);
    });
  },

  goToGame: cb => {
    socketConnection.on('go-game', start => {
      cb(null, start);
    });
  },

  oops: cb => {
    socketConnection.on('oops', oops => {
      message.error(oops)
      cb(null, oops);
    });
  },

};