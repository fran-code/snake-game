import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Input, Radio, message, Switch } from 'antd'
import { SockerInit } from '../../api/socket/socket'
import { emit } from '../../api/socket/emitters'
import { subscribeTo } from '../../api/socket/subscriptions'
import { useNavigate } from 'react-router-dom'
import { CollectionCreateFormProps, ValuesCreateFormProps, IPlayers, IDataUser, IFindRoom, IRoomDisplay } from '../../utils/interfaces'
import LoginBar from '../../components/LoginBar'
import { useUserContext } from '../../context/UserContext'

export let socketConnection: any
let gameReady: boolean = false
let mePlayer: number = -1
let roomId: string = ""

const FindRoomModal: React.FC<CollectionCreateFormProps> = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm()
  const [optionSelected, setOptionSelected] = useState<string>("")

  const callOnCancel = () => {
    setOptionSelected("")
    onCancel()
  }

  return (
    <Modal
      visible={visible}
      title="Select the type of game"
      okText="OK"
      cancelText="Cancel"
      cancelButtonProps={{ style: { display: "none" } }}
      onCancel={callOnCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values: ValuesCreateFormProps) => {
            setOptionSelected("")
            form.resetFields();
            onCreate(values);
          })
          .catch(error => {
            console.log('Validate Failed:', error);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="formFindRoom"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item name="modifier" className="collection-create-form_last-form-item">
          <Radio.Group onChange={(e) => setOptionSelected(e.target.value)}>
            <Radio value="public">Public</Radio>
            <Radio value="privateCreate">Create private room</Radio>
            <Radio value="privateJoin">Join private room</Radio>
          </Radio.Group>
        </Form.Item>
        {optionSelected === "privateJoin" && <Form.Item
          name="roomId"
          label="Room id"
        >
          <Input />
        </Form.Item>}
        {optionSelected === "privateCreate" && <Form.Item
          name="passCreate"
          label="Room password"
        >
          <Input />
        </Form.Item>}
        {optionSelected === "privateJoin" && <Form.Item
          name="passJoin"
          label="Password"
        >
          <Input />
        </Form.Item>}
      </Form>
    </Modal>
  );
};

const createRoom = (user: IDataUser, password: string) => {
  socketConnection = SockerInit(user.username, "", password, "create", { idUser: user._id })
}

const joinRoom = (user: IDataUser, roomId: string, password: string) => {
  socketConnection = SockerInit(user.username, roomId, password, "join", { idUser: user._id })
}

const changeReady = (e: boolean) => {
  if (e) emit.isReady()
}

const getColor = (playerNumber: number) => {
  switch (playerNumber) {
    case 0:
      return "navy"
    case 1:
      return "green"
    case 2:
      return "red"
    case 3:
      return "orange"
    default:
      return "navy"
  }
}

const listenStartGame = () => {
  subscribeTo.gameReady((err: any, startTime: number) => {
    message.info(`The game starts in ${startTime} seconds`)
  })
}

const FindRoom: React.FC<IFindRoom> = ({ setShowModal }) => {
  return (
    <div className="textCenter mt_30px">
      <Button type="primary" onClick={() => setShowModal(true)}>Find Room</Button>
    </div>
  )
}

const RoomDisplay: React.FC<IRoomDisplay> = ({ players, setShowModal }) => {

  const findAgain = () => {
    if (socketConnection !== undefined) emit.closeConnection()
    setShowModal(true)
  }

  return (
    <div className="square">
      <div className="squareTitle">Room: <b>{roomId}</b></div>
      <div className="squareBody">
        <div className="standardTitle">Players</div>
        {players.map((player) =>
          <div key={player.username} className="mb_10px">
            <span className="bold m_20px" style={{ color: getColor(player.playerNumber) }}>{player.username}{player.username !== "Player" ? "" : `_${player.playerNumber}`}</span>
            {player.playerNumber === mePlayer && <Switch checked={player.isReady} onChange={changeReady} />}
            {player.isReady && <span style={{ color: "limegreen", marginLeft: 10, fontWeight: "bold" }}> READY!</span>}
          </div>
        )}
        <div className="standardTitle mt_30px">Bots</div>
        {Array.from({ length: 4 - players.length }, (_, i) => i + 1).map(e => <div key={e} className="bold m_0x20x10">Bot_{e}</div>)}
      </div>
      <Button type="primary" onClick={findAgain} disabled={players.find(ply => ply.playerNumber === mePlayer)?.isReady}>Find Again</Button>
    </div>
  )
}

const useListenPlayers = () => {
  const [players, setPlayers] = useState<IPlayers[]>([]);

  const connectSocketPlayers = () => {
    subscribeTo.showPlayers((err: any, playersInput: IPlayers[]) => {
      setPlayers(playersInput)
    })
  }

  return [players, connectSocketPlayers] as const
}

const connectError = () => {
  subscribeTo.oops((err: any, oops: string) => {})
}

const connectSocketRoom = () => {
  subscribeTo.setRoomId((err: any, input: { roomId: string, setPlayerNumber: number }) => {
    mePlayer = input.setPlayerNumber
    roomId = input.roomId
    socketConnection.query.roomId = input.roomId
  })
}

const useGoToGame = () => {
  const navigate = useNavigate();

  const connectSocketGoToGame = (player: number) => {
    subscribeTo.goToGame((err: any, startTime: number) => {
      gameReady = true
      navigate('/Game')
    })
  }

  return [connectSocketGoToGame] as const
}

const WaitingRoom: React.FC<any> = () => {
  const [showModal, setShowModal] = useState<boolean>(true)
  const { dataUser } = useUserContext()
  const [players, connectSocketPlayers] = useListenPlayers()
  const [connectSocketGoToGame] = useGoToGame()

  useEffect(() => {
    gameReady = false

    return () => {
      if (socketConnection !== undefined && !gameReady) emit.closeConnection()
    }
  }, []);

  const onCreate = (values: { modifier: string, roomId?: string, passJoin?: string, passCreate?: string }) => {
    if (!dataUser) throw new Error("User not found")

    switch (values.modifier) {
      case 'public':
        joinRoom(dataUser, "", "")
        break;
      case 'privateCreate':
        createRoom(dataUser, values.passCreate!)
        break;
      case 'privateJoin':
        joinRoom(dataUser, values.roomId!, values.passJoin!)
        break;
      default:
        throw new Error("Room type not found")
    }

    connectSocketRoom()
    connectSocketPlayers()
    listenStartGame()
    connectSocketGoToGame(mePlayer)
    setShowModal(false)
    connectError()
  };

  return (
    <div className="basicContainerColor">
      <LoginBar />
      {
        (socketConnection === undefined || players.length === 0) ?
          <FindRoom setShowModal={setShowModal} />
          :
          <RoomDisplay players={players} setShowModal={setShowModal} />
      }
      <FindRoomModal
        visible={showModal}
        onCreate={onCreate}
        onCancel={() => setShowModal(false)}
      />
    </div>
  )
}

export default WaitingRoom;