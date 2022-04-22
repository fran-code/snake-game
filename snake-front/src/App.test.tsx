import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom'
import contextRender from './utils/testUtils'
import UnauthenticatedApp from './UnauthenticatedApp'
import WaitingRoom from './pages/WaitingRoom/WaitingRoom'
import './utils/matchMedia'

test('Login form', () => {
  render(<UnauthenticatedApp />);
  const email = screen.queryByPlaceholderText(/email/i)
  const password = screen.queryByPlaceholderText(/password/i)
  const loginButton = screen.getByRole('button', { name: /log in/i })

  expect(email).toBeInTheDocument();
  expect(password).toBeInTheDocument();
  expect(loginButton).toBeInTheDocument();
});

test('Validate mandatory fields', async () => {
  render(<UnauthenticatedApp />);
  const loginButton = screen.getByRole('button', { name: /log in/i })
  const emailErrorNoExists = screen.queryByText(/Please input your Email!/i);
  const passwordErrorNoExists = screen.queryByText(/Please input your Password!/i);
  expect(emailErrorNoExists).toBeNull();
  expect(passwordErrorNoExists).toBeNull();

  act(() => { fireEvent.click(loginButton) })

  const emailErrorExists = await waitFor(() => screen.getByText(/Please input your Email!/i));
  const passwordErrorExists = await waitFor(() => screen.getByText(/Please input your Password!/i));
  expect(emailErrorExists).toBeInTheDocument();
  expect(passwordErrorExists).toBeInTheDocument();
});

test('Register form', async () => {
  render(<UnauthenticatedApp />);
  const registerNowButton = screen.getByText(/register now!/i)
  act(() => { fireEvent.click(registerNowButton) })
  await waitFor(() => screen.queryByPlaceholderText(/username/i))

  const email = screen.queryByPlaceholderText(/Registration Email/i)
  const userName = screen.queryByPlaceholderText(/Registration Username/i)
  const password = screen.queryByPlaceholderText(/Registration password/i)
  const policies = screen.queryByText(/I agree to the Privacy Policy/i)
  const registerButton = screen.getByRole('button', { name: /register/i })

  expect(email).toBeInTheDocument();
  expect(userName).toBeInTheDocument();
  expect(password).toBeInTheDocument();
  expect(policies).toBeInTheDocument();
  expect(registerButton).toBeInTheDocument();
});

test('Validate mandatory fields', async () => {
  render(<UnauthenticatedApp />);
  const registerNowButton = screen.getByText(/register now!/i)
  act(() => { fireEvent.click(registerNowButton) })
  await waitFor(() => screen.queryByPlaceholderText(/username/i))

  const registerButton = screen.getByRole('button', { name: /register/i })
  const emailErrorNoExists = screen.queryByText(/Please input your Email!/i);
  const userNameErrorNoExists = screen.queryByText(/Please input your Username!/i);
  const passwordErrorNoExists = screen.queryByText(/Please input your Password!/i);
  const policiesErrorNoExists = screen.queryByText(/You must accept the privacy policy/i);
  expect(emailErrorNoExists).toBeNull();
  expect(userNameErrorNoExists).toBeNull();
  expect(passwordErrorNoExists).toBeNull();
  expect(policiesErrorNoExists).toBeNull();

  act(() => { fireEvent.click(registerButton) })

  const emailErrorExists = await waitFor(() => screen.getByText(/Please input your Email!/i));
  const userNameErrorExists = await waitFor(() => screen.getByText(/Please input your Username!/i));
  const passwordErrorExists = await waitFor(() => screen.getByText(/Please input your Password!/i));
  const policiesErrorExists = await waitFor(() => screen.getByText(/You must accept the privacy policy/i));
  expect(emailErrorExists).toBeInTheDocument();
  expect(userNameErrorExists).toBeInTheDocument();
  expect(passwordErrorExists).toBeInTheDocument();
  expect(policiesErrorExists).toBeInTheDocument();
});

test('WaitingRoom shows user name logged', () => {
  contextRender(<WaitingRoom />)
  const userName = screen.getByText(/Kiko/i)
  expect(userName).toBeInTheDocument();
})

test('A modal appears with the game options', () => {
  contextRender(<WaitingRoom />)
  const publicGame = screen.getByText(/Public/i)
  const privateGame = screen.getByText(/Create private room/i)
  const joinGame = screen.getByText(/Join private room/i)
  expect(publicGame).toBeInTheDocument();
  expect(privateGame).toBeInTheDocument();
  expect(joinGame).toBeInTheDocument();
});

