import React, { useState, useEffect, useCallback } from 'react';
import SnakeBody from '../../components/svg/SnakeBody';
import PaintCircle from '../../components/svg/PaintCircle';
import Explosion from '../../components/svg/Explosion';
import Shoot from '../../components/svg/Shoot';
import { emit } from '../../api/socket/emitters';
import { subscribeTo } from '../../api/socket/subscriptions';
import { message, Modal } from 'antd';
import SnakePoly from '../../components/svg/SnakePoly';
import { useNavigate } from 'react-router-dom';
import { TrophyOutlined } from '@ant-design/icons';
import ButtonMoveMobile from '../../components/ButtonMoveMobile';
import { IDefaultProps, IExplosion, IShoot, IItemPlayer, IItems, IItemPlayerPassive, ISnakeHead, IWeaponMove } from '../../utils/interfaces';
import { socketConnection } from '../WaitingRoom/WaitingRoom'
import FullPageSpinner from '../../components/FullPageSpinner'
import { useUserContext } from '../../context/UserContext'

const defaultPropsGame: IDefaultProps = {
  backgroundColor: 'white',
  newFruitDelay: 200,
  newFruitProbability: 0.35,
  newFruitSize: 40,
  fruitExpirationDelay: 10 * 1000,
  snakeSpeed: 3,
  growthDelay: 150,
  radius: 3,
  itemSize: 20
};

let snakeBodyOne: string = ""
let snakeBodyTwo: string = ""
let snakeBodyThree: string = ""
let snakeBodyFour: string = ""
let explosions: IExplosion[] = []
let shoots: IShoot[] = []
let audio = new Audio("/audio/Explosion1.mp3")
let items: IItems[] = []
let itemPlayer: IItemPlayer
let itemPlayerPassive: IItemPlayerPassive

const handleUserKeyPress = (event: any) => {
  const { keyCode, type, repeat } = event;
  if (keyCode === 38 && itemPlayer?.ammo > 0 && !repeat) emit.fire(type === "keydown");
  if (keyCode === 37) emit.moveLeft(type === "keydown");
  if (keyCode === 39) emit.moveRight(type === "keydown");
};

const calculateExperience = (rankingPos: number) => {
  switch (rankingPos) {
    case 1:
      return 40
    case 2:
    case 3:
      return 20
    case 4:
      return 10
    default:
      return 10
  }
}


const getSnakeBody = () => {
  subscribeTo.getSnakeBody((err: any, input: { player: number, snakeMove: string }) => {
    switch (input.player) {
      case (0):
        snakeBodyOne += input.snakeMove
        break;
      case (1):
        snakeBodyTwo += input.snakeMove
        break;
      case (2):
        snakeBodyThree += input.snakeMove
        break;
      case (3):
        snakeBodyFour += input.snakeMove
        break;
    }
  })
}

const updateSnakeBody = () => {
  subscribeTo.updateSnakeBody((err: any, input: { player: number, snakeUpdate: string }) => {
    switch (input.player) {
      case (0):
        snakeBodyOne = input.snakeUpdate
        break;
      case (1):
        snakeBodyTwo = input.snakeUpdate
        break;
      case (2):
        snakeBodyThree = input.snakeUpdate
        break;
      case (3):
        snakeBodyFour = input.snakeUpdate
        break;
    }
  })
}

const showExplosion = () => {
  subscribeTo.showExplosion((err: any, explosion: IExplosion) => {
    audio.play()
    explosions = [...explosions, explosion]
    setTimeout(() => explosions = [], 300)
  })
}

const showShoot = () => {
  subscribeTo.showShoot((err: any, shoot: IShoot) => {
    audio.play()
    shoots = [...shoots, shoot]
    setTimeout(() => shoots = [], 100)
  })
}

const setItems = () => {
  subscribeTo.setItems((err: any, newItems: IItems[]) => {
    items = newItems
  })
}

const getWeapon = () => {
  subscribeTo.getWeapon((err: any, input: { player: number, item: IItemPlayer }) => {
    itemPlayer = input.item
  })
}

const getPassive = () => {
  subscribeTo.getPassive((err: any, input: { player: number, item: IItemPlayerPassive }) => {
    itemPlayerPassive = input.item
  })
}

const updateAmmo = () => {
  subscribeTo.updateAmmo((err: any, ammo: number) => {
    itemPlayer.ammo = ammo
  })
}

const updateUses = () => {
  subscribeTo.updateUses((err: any, uses: number) => {
    itemPlayerPassive.uses = uses
  })
}

const playerDie = () => {
  subscribeTo.playerDie((err: any, username: string) => {
    message.error(`RIP ${username}`)
  })
}

const clickMobile = (e: any, type: string) => {
  if (type === "F" && itemPlayer?.ammo > 0) emit.fire(e.type === "touchstart");
  if (type === "L") emit.moveLeft(e.type === "touchstart");
  if (type === "R") emit.moveRight(e.type === "touchstart");
};

const useListenWeapons = () => {
  const [weapons, setWeapons] = useState<IWeaponMove[]>([])

  const listenWeapons = () => {
    subscribeTo.getWeaponMoves((err: any, weaponMove: IWeaponMove[]) => {
      setWeapons(weaponMove)
    })
  }

  return [weapons, listenWeapons] as const
}

const useListenSnakeHeads = () => {
  const [snakeHead, setSnakeHead] = useState<ISnakeHead[]>([])

  const listenSnakeHead = () => {
    subscribeTo.getSnakeHead((err: any, snakeHeads: ISnakeHead[]) => {
      setSnakeHead(snakeHeads)
    })
  }

  return [snakeHead, listenSnakeHead] as const
}

const useEndGame = () => {
  const [modalEndGame, setModalEndGame] = useState<boolean>(false)
  const [ranking, setRanking] = useState<number>(0)
  const navigate = useNavigate()
  const { dataUser, setDataUser } = useUserContext();

  const listenEndGame = () => {
    subscribeTo.endGame((err: any, inputRanking: number) => {
      setRanking(inputRanking)
      setModalEndGame(true)
    })
  }

  const goToWaitingRoom = () => {
    setDataUser({ ...dataUser!, experience: dataUser!.experience + calculateExperience(ranking) })
    navigate('/')
  }

  const EndGameModal = useCallback(() =>
    <Modal
      title={<span className="large bold">{ranking === 1 ? "You won!" : "Game over"}</span>}
      visible={modalEndGame}
      onOk={goToWaitingRoom}
      okText="Play again"
      onCancel={() => setModalEndGame(false)}
      cancelButtonProps={{ style: { display: "none" } }}
    >
      <div className="textCenter">
        <TrophyOutlined style={{ fontSize: 30, marginRight: 20, color: ranking === 1 ? "gold" : (ranking === 2 ? "silver" : "sandybrown") }} /> You have finished in the position: <b>{ranking}</b>
        <div className="mt_15px">You have won {calculateExperience(ranking)} experience points</div>
      </div>
    </Modal>
    , [ranking, modalEndGame])

  return [EndGameModal, listenEndGame] as const
}

const useListenSnakeMoves = () => {

  const startListenMoves = () => {
    window.addEventListener('keydown', handleUserKeyPress);
    window.addEventListener('keyup', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
      window.removeEventListener('keyup', handleUserKeyPress);
    };
  }

  return [startListenMoves] as const
}

const MobileButtons = () => {

  if (window.innerWidth > 768) return null

  return (
    <>
      <ButtonMoveMobile type="L" handleClick={clickMobile} />
      <ButtonMoveMobile type="R" handleClick={clickMobile} />
      <ButtonMoveMobile type="F" handleClick={clickMobile} />
    </>
  )
}

const ItemPlayers = () => {

  return (
    <>
      {((itemPlayer !== undefined && itemPlayer.ammo > 0) || (itemPlayerPassive !== undefined && itemPlayerPassive.uses > 0)) && <polygon points="510,0 510,35 690,35 690,0" fill="gray" opacity="0.3" />}
      {itemPlayer !== undefined && itemPlayer.ammo > 0 && <text fontWeight="bold" fontSize="20" x="530" y="25">{itemPlayer.ammo}</text>}
      {itemPlayer !== undefined && itemPlayer.image !== "" && <image height="20" width="20" x="560" y="8" xlinkHref={itemPlayer.image} />}
      {itemPlayerPassive !== undefined && itemPlayerPassive.uses > 0 && <text fontWeight="bold" fontSize="20" x="620" y="25">{itemPlayerPassive.uses}</text>}
      {itemPlayerPassive !== undefined && itemPlayerPassive.image !== "" && <image height="20" width="20" x="640" y="8" xlinkHref={itemPlayerPassive.image} />}
    </>
  )
}

const SnakeBodies = () => {

  return (
    <>
      {snakeBodyOne !== "" && <SnakePoly snakeBody={snakeBodyOne} color="navy" />}
      {snakeBodyTwo !== "" && <SnakePoly snakeBody={snakeBodyTwo} color="red" />}
      {snakeBodyThree !== "" && <SnakePoly snakeBody={snakeBodyThree} color="green" />}
      {snakeBodyFour !== "" && <SnakePoly snakeBody={snakeBodyFour} color="orange" />}
    </>
  )
}

const SnakeBoard: React.FC = () => {
  const { backgroundColor, radius, itemSize } = defaultPropsGame
  const [snakeHead, listenSnakeHead] = useListenSnakeHeads()
  const [EndGameModal, listenEndGame] = useEndGame()
  const [weapons, listenWeapons] = useListenWeapons()
  const [startListenMoves] = useListenSnakeMoves()

  useEffect(() => {
    if (!socketConnection) {
      window.location.href = '/'
    } else {
      snakeBodyOne = ""
      snakeBodyTwo = ""
      snakeBodyThree = ""
      snakeBodyFour = ""
      explosions = []
      items = []
      itemPlayer = { type: 0, image: "", ammo: 0 }
      itemPlayerPassive = { type: 0, image: "", uses: 0 }

      startListenMoves()
      listenSnakeHead()
      getSnakeBody()
      updateSnakeBody()
      playerDie()
      listenEndGame()
      listenWeapons()
      showExplosion()
      showShoot()
      setItems()
      getWeapon()
      getPassive()
      updateAmmo()
      updateUses()
    }
    return () => {
      emit.closeConnection();
    }
  }, []);

  if (!socketConnection) return <FullPageSpinner />
console.log("snakeHead:: ", snakeHead)
  return (
    <>
      <svg viewBox="0 0 1200 640" preserveAspectRatio="none" style={{ width: '100%', height: '100%', backgroundColor }}>
        <ItemPlayers />
        {snakeHead.map(snk =>
          <SnakeBody key={snk.id} snake={snk} radius={radius} color="black" />
        )}
        <SnakeBodies />
        {weapons.map(weapon =>
          <PaintCircle key={weapon.id} position={weapon} radius={weapon.r} color="red" />
        )}
        {explosions.map((explosion) =>
          <Explosion key={explosion.id} position={explosion} radius={explosion.r} color="orange" />
        )}
        {shoots.map((shoot) =>
          <Shoot key={shoot.id} firstPoint={shoot.firstPoint} secondPoint={shoot.secondPoint} thirdPoint={shoot.thirdPoint} weaponClass={shoot.weaponClass} />
        )}
        {items.map(item =>
          <image
            key={item.id}
            x={item.x - 10}
            y={item.y - 10}
            height={itemSize}
            width={itemSize}
            xlinkHref={item.image}
          />
        )}
      </svg>
      <EndGameModal />
      <MobileButtons />
    </>
  )
}

export default SnakeBoard;