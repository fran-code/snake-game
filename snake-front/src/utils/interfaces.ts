export interface IResponse {
  status: number;
  data: any;
}

export interface IDefaultProps {
  backgroundColor: string,
  newFruitDelay: number,
  newFruitProbability: number,
  newFruitSize: number,
  fruitExpirationDelay: number,
  snakeSpeed: number,
  growthDelay: number,
  radius: number,
  itemSize: number
}

export interface ISnakeHead {
  id: string,
  x: number,
  y: number,
}

export interface IWeaponMove {
  id: string,
  x: number,
  y: number,
  r: number,
}

export interface IExplosion {
  id: string,
  x: number,
  y: number,
  r: number,
}

export interface IShoot {
  id: string,
  weaponClass: number,
  firstPoint: IPoint,
  secondPoint: IPoint,
  thirdPoint: IPoint,
}

export interface IItems {
  id: string,
  x: number,
  y: number,
  type: number,
  image: string,
  ammo: number
}

export interface IItemPlayer {
  type: number,
  image: string,
  ammo: number
}

export interface IItemPlayerPassive {
  type: number,
  image: string,
  uses: number
}

export interface IPoint {
  x: number,
  y: number
}

export interface ITokenAuthData {
  exp: number,
  iat: number,
  _id: string
}

export interface ValuesCreateFormProps {
  title: string;
  description: string;
  modifier: string;
}

export interface CollectionCreateFormProps {
  visible: boolean;
  onCreate: (values: ValuesCreateFormProps) => void;
  onCancel: () => void;
}

export interface IPlayers {
  username: string,
  isReady: boolean,
  playerNumber: number

}

export interface IDataUser {
  _id: string,
  email: string,
  username: string,
  experience: number
}

export interface IFindRoom {
  setShowModal: Function
}

export interface IRoomDisplay {
  players: IPlayers[]
  setShowModal: Function
}
