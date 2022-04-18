import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { apiCall } from './utils/helpers'
import { constants } from './utils/constants'

const { TabPane } = Tabs;

const loginUser = (values: { email: string, password: string }) => {
  apiAuthCall(constants.endpoints.login, values)
};

const registerUser = (values: { password: string, username: string, email: string }) => {
  if (values.password.length < 8) {
    message.warning("The password has to be at least 8 characters long");
  } else {
    apiAuthCall(constants.endpoints.register, values)
  }
};

const apiAuthCall = (endpoint: string, values: { email: string, password: string, username?: string }) => {
  apiCall(endpoint, { data: values }).then(
    res => {
      window.localStorage.setItem(constants.authToken, res.token)
      window.location.assign(window.location.href)
    }
  )
}

const Header = () => {

  return (
    <div className="imageHead">
      <h1 className="titleHome">Snake Game</h1>
    </div>
  )
}

const LoginForm = () => {
  const [currentKey, setCurrentKey] = useState<string>("login")

  return (
    <div className="basicContainerColorHome">
      <div className="square" style={{ marginTop: "-115px" }}>
        <div className="squareTitle">Snake Game</div>
        <div className="squareBody">
          <Tabs activeKey={currentKey} onChange={(e) => setCurrentKey(e)}>
            <TabPane tab="Login" key="login">
              <Form
                name="normalLogin"
                className="loginForm"
                initialValues={{ remember: true }}
                onFinish={loginUser}
              >
                <Form.Item
                  name="email"
                  rules={[{ required: true, type: "email", message: 'Please input your Email!' }]}
                >
                  <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Password"
                  />
                </Form.Item>
                <div className="mb_10px textCenter">
                  Or <a onClick={() => setCurrentKey("register")}>register now!</a>
                </div>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="loginFormButton">
                    Log in
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Register" key="register">
              <Form
                name="normalRegister"
                className="loginForm"
                initialValues={{ remember: true }}
                onFinish={registerUser}
              >
                <Form.Item
                  name="email"
                  rules={[{ required: true, type: "email", message: 'Please input your Email!' }]}
                >
                  <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your Username!' }]}
                >
                  <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="Password"
                  />
                </Form.Item>
                <Form.Item
                  name="politics"
                  valuePropName="checked"
                  rules={[{ required: true, message: 'You must accept the privacy policy' }]}
                  style={{ marginBottom: "15px" }}
                >
                  <Checkbox>I agree to the Privacy Policy</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="loginFormButton">
                    Register
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

const UnauthenticatedApp: React.FC = () => {

  return (
    <>
      <Header />
      <LoginForm />
    </>
  )
}

export default UnauthenticatedApp;