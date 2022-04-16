import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { useUserContext } from './context/UserContext'
import WaitingRoom from './pages/WaitingRoom/WaitingRoom'
import SnakeBoard from './pages/SnakeBoard/SnakeBoard'
import { apiCall } from './utils/helpers'
import { constants } from './utils/constants'
import PageNotFound from './components/PageNotFound'

interface IError {
  message: string
}

interface IErrorValues {
  error: IError
}

function FullPageErrorFallback({ error }: IErrorValues) {
  return (
    <div
      role="alert"
      style={{
        color: 'red',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>Uh oh... There's a problem. Try refreshing the app.</p>
      <pre>{error.message}</pre>
    </div>
  )
}


const AuthenticatedApp = () => {
  const { dataUser, setDataUser } = useUserContext()

  React.useEffect(() => {
    if (!dataUser) {
      apiCall(constants.endpoints.users).then(
        res => setDataUser(res.user)
      )
    }
  }, [])

  return (
    <ErrorBoundary FallbackComponent={FullPageErrorFallback}>
      <AppRoutes />
    </ErrorBoundary>
  )
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<WaitingRoom />} />
      <Route path='/game' element={<SnakeBoard />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  )
}

export default AuthenticatedApp
