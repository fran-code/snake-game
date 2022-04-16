import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import logger from '../middlewares/logger';
import { SALT_ROUNDS } from '../env';
import Users from './../models/usersModel';
import { saveError } from './../models/errorsModel';

const widthBoard = 1200
const heightBoard = 640

const weaponTypes = [
    { type: 1, r: 4, rExp: 30, speed: 10, image: '/image/standardBomb.svg', ammo: 5 },
    { type: 2, r: 8, rExp: 150, speed: 8, image: '/image/nuke.svg', ammo: 1 },
    { type: 3, r: 2, rExp: 0, speed: 0, image: '/image/jetpack.svg', ammo: 100 },
    { type: 4, r: 3, rExp: 10, speed: 12, image: '/image/grenade.svg', ammo: 10 },
    { type: 5, r: 100, rExp: 40, speed: 0, image: '/image/gun.svg', ammo: 10 },
    { type: 6, r: 200, rExp: 30, speed: 0, image: '/image/shotgun.svg', ammo: 5 },
    { type: 7, r: 400, rExp: 20, speed: 0, image: '/image/goldShotgun.svg', ammo: 3 },
    { type: 8, r: 3000, rExp: 2, speed: 0, image: '/image/rayGun.svg', ammo: 4 },
    { type: 9, r: 3000, rExp: 4, speed: 0, image: '/image/rayTurbo.svg', ammo: 2 },
    { type: 10, r: 4, rExp: 25, speed: 8, image: '/image/guidedMissile.svg', ammo: 1 },
    { type: 10, r: 4, rExp: 25, speed: 8, image: '/image/guidedMissile.svg', ammo: 1 },
]

const weaponByType = (type) => weaponTypes.find(e => e.type === type)

const weaponTypeDrop = (randomNumber) => {
    if (randomNumber < 0.10) return weaponByType(1)
    if (randomNumber < 0.15) return weaponByType(2)
    if (randomNumber < 0.30) return weaponByType(3)
    if (randomNumber < 0.45) return weaponByType(4)
    if (randomNumber < 0.60) return weaponByType(5)
    if (randomNumber < 0.70) return weaponByType(6)
    if (randomNumber < 0.75) return weaponByType(7)
    if (randomNumber < 0.90) return weaponByType(8)
    if (randomNumber < 0.95) return weaponByType(9)
    if (randomNumber < 0.1) return weaponByType(10)
    return weaponByType(3)
}

const passiveTypes = [
    { type: -1, image: '/image/bodyArmor.svg', uses: 1 },
    { type: -2, image: '/image/jump.svg', uses: 4 },
    { type: -3, image: '/image/loop.svg' },
    { type: -4, image: '/image/bulletProofArmor.svg', uses: 1 },
]

const passiveByType = (type) => passiveTypes.find(e => e.type === type)

const passiveTypeDrop = (randomNumber) => {
    if (randomNumber < 0.1) return passiveByType(-1)
    if (randomNumber < 0.2) return passiveByType(-2)
    if (randomNumber < 0.21) return passiveByType(-3)
    if (randomNumber < 1) return passiveByType(-4)
    return passiveByType(3)
}


const generateRoomId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const posClient = (playerNumber) => {
    switch (playerNumber) {
        case 0:
            return { pos: [{ x: 100, y: 60, j: true, id: uuidv4() }], direction: 90 }
        case 1:
            return { pos: [{ x: 1100, y: 60, j: true, id: uuidv4() }], direction: -90 }
        case 2:
            return { pos: [{ x: 100, y: 580, j: true, id: uuidv4() }], direction: 90 }
        case 3:
            return { pos: [{ x: 1100, y: 580, j: true, id: uuidv4() }], direction: -90 }
    }
}

const dataClient = (playerNumber, snakeId, username, options) => {
    return {
        id: snakeId,
        username,
        isReady: false,
        left: false,
        right: false,
        speed: 4,
        turboOn: false,
        weaponClient: {},
        passive: {},
        playerNumber,
        ...posClient(playerNumber),
        ...options
    }
}

export default class Room {
    constructor(options) {
        this.io = options.io; // Shortname for -> io.of('/your_namespace_here')
        this.snake = options.socket;
        this.username = options.username;
        this.roomId = options.roomId;
        this.password = options.password; // Optional
        this.action = options.action; // [join, create]
        this.options = JSON.parse(options.options); // {maxTimerLimit, maxPlayerLimit}
        this.store = options.io.adapter; // Later expanded to io.adapter.rooms[roomId]
    }

    /**
     * Initialises steps on first connection.
     *
     * Checks if room available:
     *   If yes, then joins the room
     *   If no, then creates new room.
     *
     * @access    public
     * @return   {bool}    Returns true if initialization is successfull, false otherwise
     */
    async init(username) {
        try {
            if (this.action === 'join') {
                const rooms = Object.entries(this.io.adapter.rooms).filter(room => room[0][0] !== "/")
                if (this.password === "") {
                    let roomId;
                    let numClients;
                    for (let room of rooms) {
                        numClients = room[1].length
                        if (room[1].password === undefined && room[1].gameReady < 2 && numClients < 4) {
                            roomId = room[0];
                            break;
                        }
                    }
                    if (roomId === undefined) {
                        roomId = generateRoomId(9);
                        await this.snake.join(roomId);
                        this.store = this.store.rooms[roomId];
                        this.store.gameReady = 0;
                        this.store.clients = [dataClient(0, this.snake.id, username, this.options)];
                        this.store.weapons = [];
                        this.store.items = [];
                        this.io.to(this.snake.id).emit('set-roomId', { roomId, setPlayerNumber: 0 });
                    } else {
                        await this.snake.join(roomId);
                        this.store = this.store.rooms[roomId];
                        let setPlayerNumber;
                        const currenPlayerNumber = this.store.clients.map(e => e.playerNumber).sort((a, b) => a - b)
                        currenPlayerNumber.forEach((playerN, index) => {
                            if (playerN !== index) setPlayerNumber = index
                        })
                        if (setPlayerNumber === undefined) setPlayerNumber = numClients;
                        this.store.clients.push(dataClient(setPlayerNumber, this.snake.id, username, this.options));
                        this.io.to(this.snake.id).emit('set-roomId', { roomId, setPlayerNumber });
                    }
                    this.snake.username = username;
                    this.roomId = roomId
                    this.showPlayers();

                    this.snake.emit('[SUCCESS] Successfully initialised');
                    logger.info(`[JOIN] Client joined room ${this.roomId}`);
                    return true
                } else {
                    const roomFinded = rooms.find(room => room[0] === this.roomId)
                    if (roomFinded !== undefined) {
                        if (roomFinded[1].password && (await bcrypt.compare(this.password, roomFinded[1].password))) {
                            const numClients = roomFinded[1].length
                            await this.snake.join(this.roomId);
                            this.store = this.store.rooms[this.roomId];
                            let setPlayerNumber;
                            const currenPlayerNumber = this.store.clients.map(e => e.playerNumber).sort((a, b) => a - b)
                            currenPlayerNumber.forEach((playerN, index) => {
                                if (playerN !== index) setPlayerNumber = index
                            })
                            if (setPlayerNumber === undefined) setPlayerNumber = numClients;
                            this.store.clients.push(dataClient(setPlayerNumber, this.snake.id, username, this.options));
                            this.io.to(this.snake.id).emit('set-roomId', { roomId: this.roomId, setPlayerNumber });
                            this.snake.username = username;
                            this.showPlayers();
                            return true
                        } else {
                            this.io.to(this.snake.id).emit("oops", "Wrong password");
                            return false
                        }
                    } else {
                        this.io.to(this.snake.id).emit("oops", "Room doesn't exists");
                        return false
                    }
                }
            }
        } catch (error) {
            saveError(error, "socket/init/join")
        }

        try {
            if (this.action === 'create') {
                const roomId = generateRoomId(9);
                await this.snake.join(roomId);
                this.store = this.store.rooms[roomId];
                this.store.gameReady = 0;
                this.store.password = await bcrypt.hash(this.password, Number(SALT_ROUNDS));
                this.store.clients = [dataClient(0, this.snake.id, username, this.options)];
                this.store.weapons = [];
                this.store.items = [];
                this.snake.username = username;
                this.roomId = roomId
                this.io.to(this.snake.id).emit('set-roomId', { roomId, setPlayerNumber: 0 });
                this.showPlayers();
            }
        } catch (error) {
            saveError(error, "socket/init/create")
        }
    }

    /**
     * Move the snakes
     *
     * @access    public
     */
    moveSnakes() {
        try {
            let responseHead = []
            this.store.clients.forEach(player => {
                let snakeMove = "M"
                const { left, right, speed, turboOn, pos, playerNumber, id, passive } = player;
                let newDirection = player.direction;
                if (left ^ right) {
                    if (left) newDirection -= passive?.type === -3 ? 30 : 15;
                    if (right) newDirection += passive?.type === -3 ? 30 : 15;
                    if (player.direction !== newDirection) {
                        player.direction = newDirection
                    }
                }
                const posLength = pos.length
                const previousPos = pos[posLength - 1];
                if (turboOn) {
                    if (player.weaponClient.type === 3) {
                        let ammo = player.weaponClient.ammo - 1
                        player.weaponClient.ammo = ammo
                        if (ammo === 0) player.turboOn = false
                        this.io.to(player.id).emit('update-ammo', ammo)
                    } else {
                        player.turboOn = false
                    }
                }
                if (id === "bot") {
                    let distanceNearest = 2000;
                    let posNearest;
                    this.store.clients.filter(e => e.id !== "bot").forEach(playerNoBot => {
                        const latestPosPlayer = playerNoBot.pos[playerNoBot.pos.length - 1];
                        const distance = minDistance(previousPos, latestPosPlayer);
                        if (distance < distanceNearest) {
                            distanceNearest = distance;
                            posNearest = latestPosPlayer
                        }
                    })
                    newDirection = angleTwoPoints(posNearest, previousPos)
                    if (distanceNearest < 40) this.fireGun({ direction: newDirection, firstPoint: previousPos, weaponClient: { rExp: 40, r: 100, type: 5 } })
                }
                const { x, y, j } = cloneMovedBySnake(newDirection, turboOn ? speed * 3 : speed, previousPos || { x: 0, y: 0 });
                if (id !== "bot") this.checkCollidesClient(x, y, player, 2);
                if (id !== "bot") this.checkCollidesItem(x, y, player, 2);
                const newId = uuidv4();
                player.pos.push({ x, y, j, id: newId });
                responseHead.push({ x, y, id: newId });
                snakeMove = (j || posLength === 1) ? `M ${x},${y}` : ` ${x},${y}`;
                this.io.to(this.roomId).emit('snake-body', { player: playerNumber, snakeMove });
            });
            this.io.to(this.roomId).emit('snake-head', responseHead);
        } catch (error) {
            saveError(error, "socket/moveSnakes")
        }
    }

    /**
     * Change direction left
     *
     * @access    public
     */
    moveLeft() {
        try {
            this.snake.on('move-left', (state) => {
                this.store.clients.forEach(player => {
                    if (player.id === this.snake.id) {
                        player.left = state;
                    }
                });
            });
        } catch (error) {
            saveError(error, "socket/moveLeft")
        }
    }

    /**
     * Change direction right
     *
     * @access    public
     */
    moveRight() {
        try {
            this.snake.on('move-right', (state) => {
                this.store.clients.forEach(player => {
                    if (player.id === this.snake.id) {
                        player.right = state;
                    }
                });
            });
        } catch (error) {
            saveError(error, "socket/moveRight")
        }
    }

    /**
     * Fire Weapon
     *
     * @access    public
     */
    fire() {
        try {
            this.snake.on('fire', (state) => {
                this.store.clients.forEach(player => {
                    if (player.id === this.snake.id) {
                        const weaponClass = player.weaponClient.type
                        let ammo = player.weaponClient.ammo
                        if (weaponClass === 3 && ammo > 0) {
                            player.turboOn = state
                        } else {
                            if (state) {
                                if (ammo > 0) {
                                    ammo -= 1;
                                    player.weaponClient.ammo = ammo;
                                    if ([1, 2, 4].includes(weaponClass)) {
                                        const previousPos = player.pos[player.pos.length - 1]
                                        this.store.weapons.push({
                                            id: uuidv4(),
                                            pos: cloneMovedBy(player.direction, 4, previousPos),
                                            direction: player.direction,
                                            ...weaponByType(weaponClass)
                                        });
                                    }
                                    if ([5, 6, 7, 8, 9].includes(weaponClass)) {
                                        this.fireGun(player)
                                    }
                                    if ([10].includes(weaponClass)) {
                                        const previousPos = player.pos[player.pos.length - 1]
                                        this.store.weapons.push({
                                            id: uuidv4(),
                                            pos: cloneMovedBy(player.direction, 4, previousPos),
                                            direction: player.direction,
                                            ...weaponByType(weaponClass)
                                        });
                                    }
                                    this.io.to(player.id).emit('update-ammo', ammo)
                                }
                            }
                        }
                    }
                });
            });
        } catch (error) {
            saveError(error, "socket/fire")
        }
    }

    /**
     * Move the weapons
     *
     * @access    public
     */
    moveWeapon() {
        try {
            let responseValues = []
            this.store.weapons.forEach(weapon => {
                const { id, direction, speed, pos, r, rExp, type } = weapon;
                if (type === 10) {
                    let distanceNearest = 2000;
                    let posNearest;
                    this.store.clients.filter(e => e.id !== this.snake.id).forEach(playerNoMe => {
                        const latestPosPlayer = playerNoMe.pos[playerNoMe.pos.length - 1];
                        const distance = minDistance(pos, latestPosPlayer);
                        if (distance < distanceNearest) {
                            distanceNearest = distance;
                            posNearest = latestPosPlayer
                        }
                    })
                    const newDirection = angleTwoPoints(posNearest, pos)
                    const { x, y } = cloneMovedBy(newDirection, speed, pos);
                    weapon.pos = { x, y };
                    this.checkCollidesWeapon(x, y, id, r, rExp)
                    responseValues.push({ id, x, y, r })
                } else {
                    const { x, y } = cloneMovedBy(direction, speed, pos);
                    weapon.pos = { x, y };
                    this.checkCollidesWeapon(x, y, id, r, rExp)
                    responseValues.push({ id, x, y, r })
                }
            });
            this.io.to(this.roomId).emit('weapon-moves', responseValues);
        } catch (error) {
            saveError(error, "socket/moveWeapon")
        }
    }

    /**
    * Fire the gun
    *
    * @access    public
    */
    fireGun(player) {
        try {
            const firstPoint = player.firstPoint || player.pos[player.pos.length - 1]
            const secondPoint = cloneMovedWeapon(player.direction + player.weaponClient.rExp, player.weaponClient.r / 2, firstPoint)
            const thirdPoint = cloneMovedWeapon(player.direction - player.weaponClient.rExp, player.weaponClient.r / 2, firstPoint)
            this.io.to(this.roomId).emit('show-shoot', { id: uuidv4(), weaponClass: player.weaponClient.type, firstPoint, secondPoint, thirdPoint })
            this.checkPlayerShooted(firstPoint, secondPoint, thirdPoint)
        } catch (error) {
            saveError(error, "socket/fireGun")
        }
    }

    /**
     * Check if collides
     *
     * @access    public
     */
    checkCollidesClient(x, y, inputPlayer, radius) {
        try {
            loop1:
            for (let player of this.store.clients) {
                for (let p of player.pos.slice(0, player.pos.length - 1)) {
                    const distSq = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                    const radSumSq = radius + 2; // 2 = radius snake
                    if (radSumSq > distSq) {
                        if (inputPlayer.passive?.type === -2) {
                            const uses = inputPlayer.passive.uses - 1
                            inputPlayer.passive.uses = uses
                            this.io.to(inputPlayer.id).emit('update-uses', uses)
                        } else {
                            this.io.to(this.roomId).emit('player-die', inputPlayer.username);
                            this.getRankingEnd(inputPlayer.id, this.store.clients.length, inputPlayer.idUser)
                            this.removePlayer(inputPlayer)
                        }
                        break loop1;
                    }
                }
            }
        } catch (error) {
            saveError(error, "socket/checkCollidesClient")
        }
    }

    /**
     * Check if collides
     *
     * @access    public
     */
    checkCollidesWeapon(x, y, id, radius, radiusExp) {
        try {
            loop1:
            for (let player of this.store.clients) {
                for (let p of player.pos.slice(0, player.pos.length - 1)) {
                    const distSq = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                    const radSumSq = radius + 2;
                    if (radSumSq > distSq) {
                        this.store.weapons = this.store.weapons.filter(weapon => weapon.id !== id)
                        this.itemsExploded(x, y, radiusExp)
                        this.io.to(this.roomId).emit('show-explosion', { id: uuidv4(), x, y, r: radiusExp })
                        break loop1;
                    }
                }
            }
        } catch (error) {
            saveError(error, "socket/checkCollidesWeapon")
        }
    }

    /**
     * Check if player get an item
     *
     * @access    public
     */
    checkCollidesItem(x, y, player, radiusSnake) {
        try {
            for (let p of this.store.items) {
                const distSq = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
                const radSumSq = radiusSnake + 15;
                if (radSumSq > distSq) {
                    this.store.items = this.store.items.filter(item => item.id !== p.id)
                    const playerCollide = this.store.clients.find(e => e.playerNumber === player.playerNumber)
                    if (p.type > 0) {
                        playerCollide.weaponClient = p
                        this.io.to(player.id).emit('get-weapon', { player: player.playerNumber, item: p })
                    } else {
                        playerCollide.passive = p
                        this.io.to(player.id).emit('get-passive', { player: player.playerNumber, item: p })
                    }
                    this.io.to(this.roomId).emit('set-items', this.store.items)
                    break;
                }
            }
        } catch (error) {
            saveError(error, "socket/checkCollidesItem")
        }
    }

    /**
     * Get items exploded
     *
     * @access    public
     */
    itemsExploded(x, y, radius) {
        try {
            let items = []
            this.store.clients.forEach(player => {
                const lengtPos = player.pos.length;
                player.pos.forEach((p, index) => {
                    const distSq = Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2);
                    const radSumSq = Math.pow(radius, 2);
                    if (radSumSq > distSq) {
                        items.push(p.id)
                        if (index === lengtPos - 1) {
                            if (player.passive?.type === -1) {
                                const uses = player.passive.uses - 1
                                player.passive.uses = uses
                                this.io.to(player.id).emit('update-uses', uses)
                            } else {
                                this.io.to(this.roomId).emit('player-die', player.username);
                                this.getRankingEnd(player.id, this.store.clients.length, player.idUser)
                                this.removePlayer(player)
                            }
                        }
                    }
                })
            })
            this.removeItemsClient(items)
        } catch (error) {
            saveError(error, "socket/itemsExploded")
        }
    }

    /**
     * Check if a user has been shooted
     *
     * @access    public
     */
    checkPlayerShooted(firstPoint, secondPoint, thirdPoint) {
        try {
            this.store.clients.forEach(player => {
                const lastPos = player.pos[player.pos.length - 1]
                const checkDie = triangleContains(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y, thirdPoint.x, thirdPoint.y, lastPos.x, lastPos.y);
                if (checkDie) {
                    if (player.passive?.type === -4 && player.passive?.uses > 0) {
                        const uses = player.passive.uses - 1
                        player.passive.uses = uses
                        this.io.to(player.id).emit('update-uses', uses)
                    } else {
                        this.io.to(this.roomId).emit('player-die', player.username);
                        this.getRankingEnd(player.id, this.store.clients.length, player.idUser)
                        this.removePlayer(player)
                    }
                }
            })
        } catch (error) {
            saveError(error, "socket/checkPlayerShooted")
        }
    }

    /**
     * Get items exploded
     *
     * @access    public
     */
    removeItemsClient(items) {
        try {
            this.store.clients.forEach(player => {
                let jump = true
                let snakeUpdate = ""
                let newPosition = [];
                player.pos.forEach(p => {
                    if (items.find(item => item === p.id) === undefined) {
                        newPosition.push({ ...p, j: p.j || jump })
                        snakeUpdate = snakeUpdate + ((p.j || jump) ? `M ${p.x},${p.y}` : ` ${p.x},${p.y}`)
                        jump = false
                    } else {
                        jump = true
                    }
                })
                player.pos = newPosition;
                this.io.to(this.roomId).emit('update-body', { player: player.playerNumber, snakeUpdate });
            })
        } catch (error) {
            saveError(error, "socket/removeItemsClient")
        }
    }

    /**
     * Drop Item
     *
     * @access    public
     */
    dropItem(dropType) {
        try {
            const random = Math.random();
            const newItem = {
                id: uuidv4(),
                x: random * widthBoard,
                y: Math.random() * heightBoard,
                ...dropType(Math.random())
            }
            this.store.items.push(newItem)
            this.io.to(this.roomId).emit('set-items', this.store.items);
        } catch (error) {
            saveError(error, "socket/dropItem")
        }
    }

    /**
     * Broadcast info about all players and their ready status joined to given room. Deafult status as 'Not ready'.
     *
     * @access    public
     */
    showPlayers() {
        try {
            const { clients } = this.store;
            this.io.to(this.roomId).emit('show-players', clients.map(client => { return { username: client.username, isReady: client.isReady, playerNumber: client.playerNumber } }));
        } catch (error) {
            saveError(error, "socket/showPlayers")
        }
    }

    /**
     * Mark player as ready  ---> to start the draft in the given room. If all players ready then initiate the draft
     *
     * @access public
     */
    isReady() {
        try {
            this.snake.on('is-ready', () => {
                this.store.clients.forEach(player => {
                    if (player.id === this.snake.id) {
                        player.isReady = true;
                    }
                });
                this.showPlayers();

                if (this.store.gameReady === 0) {
                    this.store.gameReady = 1;
                    const timeoutStart = 3000;
                    var x = timeoutStart / 1000;
                    var intervalID = setInterval(() => {
                        this.io.to(this.roomId).emit('game-ready', x);
                        if (--x === 0) {
                            clearInterval(intervalID);
                        }
                    }, 1000);
                    setTimeout(() => {
                        this.store.gameReady = 2;
                        const numClients = this.store.clients.length;
                        for (let i = numClients; i < 4; i++) {
                            let setPlayerNumber;
                            const currenPlayerNumber = this.store.clients.map(e => e.playerNumber).sort((a, b) => a - b)
                            currenPlayerNumber.forEach((playerN, index) => {
                                if (playerN !== index) setPlayerNumber = index
                            })
                            if (setPlayerNumber === undefined) setPlayerNumber = i;
                            this.store.clients.push(dataClient(setPlayerNumber, "bot", "bot"));
                        }
                        this.io.to(this.roomId).emit('go-game', "");
                        let count = 0
                        const theInterval = setInterval(() => {
                            if (this.store.clients.length === 1) {
                                clearInterval(theInterval);
                                const winner = this.store.clients[0]
                                this.getRankingEnd(winner.id, 1, winner.idUser)
                                this.removePlayer(winner);
                            } else if (this.store.clients.filter(e => e.id !== "bot").length > 0) {
                                count += 1
                                this.moveWeapon() // 20 ms
                                if (count % 5 === 0) this.moveSnakes() // 100 ms
                                if (count % 250 === 0) this.dropItem(weaponTypeDrop) // 10000 ms
                                if (count % 500 === 0) this.dropItem(passiveTypeDrop) // 20000 ms
                            } else {
                                clearInterval(theInterval);
                            }
                        }, 20);
                    }, timeoutStart + 2000)
                }
            });
        } catch (error) {
            saveError(error, "socket/isReady")
        }
    }

    /**
     * Remove a user from the room when he dies
     *
     * @access    public
     */
    removePlayer(playerToDelete) {
        try {
            this.io.to(this.roomId).emit('update-body', { player: playerToDelete.playerNumber, snakeUpdate: "" });
            this.store.clients = this.store.clients.filter(player => player.playerNumber !== playerToDelete.playerNumber);
            this.io.to(playerToDelete.id).emit('set-roomId', { roomId: "", setPlayerNumber: 0 });
            if (this.store.clients.filter(e => e.id !== "bot").length === 0) {
                this.store.clients = []
            } else {
                this.showPlayers();
            }
        } catch (error) {
            saveError(error, "socket/removePlayer")
        }
    }

    /**
     * Send ranking to client and add experience if the user is registred
     *
     * @access    public
     */
    async getRankingEnd(playerId, position, userBDid) {
        try {
            this.io.to(playerId).emit('end-game', position);
            if (userBDid) {
                let incExperience = 0
                switch (position) {
                    case 1:
                        incExperience = 40;
                        break;
                    case 2:
                    case 3:
                        incExperience = 20;
                        break;
                    case 4:
                        incExperience = 10;
                        break;
                    default:
                        incExperience = 10;
                        break;
                }
                await Users.updateOne({ _id: userBDid }, { $inc: { experience: incExperience } })
            }
        } catch (error) {
            saveError(error, "socket/getRankingEnd")
        }
    }

    /**
     * Gracefully disconnect the user from the game and end the draft
     * Preserving the gameState
     *
     * @access    public
     */
    onDisconnect() {
        try {
            this.snake.on('disconnect', () => {
                try {
                    const currentPlayer = this.store.clients.find(e => e.id === this.snake.id)
                    if (currentPlayer !== undefined) this.removePlayer(currentPlayer)
                } catch (e) {
                    logger.info('[FORCE DISCONNECT] Server closed forcefully');
                }
                logger.info('Client Disconnected!');
            });
        } catch (error) {
            saveError(error, "socket/onDisconnect")
        }
    }
}



const vectorAdd = ([ax, ay], [bx, by]) => [ax + bx, ay + by];

const vectorMultiply = ([dx, dy], mul) => [dx * mul, dy * mul];

const vectorFromDegrees = (inputDirection) => {
    const rad = inputDirection * Math.PI / 180;
    return [Math.sin(rad), -Math.cos(rad)];
}

const cloneMovedBy = (inputDirection, inputDistance, lastSnake) => {
    const [x, y] = vectorAdd(
        [lastSnake.x, lastSnake.y],
        vectorMultiply(vectorFromDegrees(inputDirection), inputDistance),
    );
    return {
        x: ((x % widthBoard) + widthBoard) % widthBoard,
        y: ((y % heightBoard) + heightBoard) % heightBoard
    }
}

const cloneMovedBySnake = (inputDirection, inputDistance, lastSnake) => {
    const [x, y] = vectorAdd(
        [lastSnake.x, lastSnake.y],
        vectorMultiply(vectorFromDegrees(inputDirection), inputDistance),
    );
    return {
        x: ((x % widthBoard) + widthBoard) % widthBoard,
        y: ((y % heightBoard) + heightBoard) % heightBoard,
        j: x > widthBoard || x < 0 || y > heightBoard || y < 0
    }
}

const cloneMovedWeapon = (inputDirection, inputDistance, lastSnake) => {
    const [x, y] = vectorAdd(
        [lastSnake.x, lastSnake.y],
        vectorMultiply(vectorFromDegrees(inputDirection), inputDistance),
    );
    return { x, y }
}


const minDistance = (previousPos, previousPosPlayer) => {
    return Math.sqrt(Math.pow(previousPos.x - previousPosPlayer.x, 2) + Math.pow(previousPos.y - previousPosPlayer.y, 2))
}

const angleTwoPoints = (pointOne = { x: 0, y: 0 }, pointTwo = { x: 0, y: 0 }) => {
    var dy = pointOne.y - pointTwo.y;
    var dx = pointOne.x - pointTwo.x;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    const degrees = (theta * 180) / Math.PI + 90;
    return degrees;
}

const triangleContains = (ax, ay, bx, by, cx, cy, x, y) => {
    let det = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
    return det * ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) > 0 &&
        det * ((cx - bx) * (y - by) - (cy - by) * (x - bx)) > 0 &&
        det * ((ax - cx) * (y - cy) - (ay - cy) * (x - cx)) > 0
}