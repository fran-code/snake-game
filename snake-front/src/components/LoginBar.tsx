import React from "react"
import { Button, Progress, Modal, Tag } from 'antd'
import { logOut } from '../utils/helpers'
import { ExclamationCircleOutlined, StarOutlined } from '@ant-design/icons'
import { useUserContext } from '../context/UserContext'
import FullPageSpinner from './FullPageSpinner'
import './components.css'

interface IUserInfo {
  username: string;
  experience: number;
}

interface ILevelInfo {
  experience: number;
}

const UserInfoBar: React.FC<IUserInfo> = ({ username, experience }) => {

  return (
    <div className="loginBar">
      <div className="pd_10px displayFlex spaceBetween">
        <span className="displayFlex alignItemsCenter">
          <span className="usernameNavbar">{username}</span>
          <span className="levelNavbar">
            <Tag icon={<StarOutlined />} color="#ff4d4f">
              Lv: {Math.floor(experience / 100)}
            </Tag>
          </span>
        </span>
        <Button style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f", color: "white" }} onClick={() => logOutConfirm()}>Logout</Button>
      </div>
    </div>
  )
}

const LevelInfoBar: React.FC<ILevelInfo> = ({ experience }) => {

  return (
    <div className="mt_15px displayFlex">
      <span className="marginAuto bold large">Level {Math.floor(experience / 100)}</span>
      <span className="progressBar"><Progress percent={experience % 100} status="active" /></span>
      <span className="marginAuto bold large">Level {Math.floor(experience / 100) + 1}</span>
    </div>
  )
}

const logOutConfirm = () => {
  Modal.confirm({
    title: 'Do you want to log out?',
    icon: <ExclamationCircleOutlined />,
    okText: 'Yes',
    cancelText: 'No',
    onOk: () => logOut()
  });
};

const LoginBar: React.FC = () => {
  const { dataUser } = useUserContext();

  if (!dataUser) return <FullPageSpinner />

  return (
    <>
      <UserInfoBar username={dataUser.username} experience={dataUser.experience} />
      <LevelInfoBar experience={dataUser.experience} />
    </>
  )
}

export default LoginBar;