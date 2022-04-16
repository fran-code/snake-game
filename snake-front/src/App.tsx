import React from 'react'
import 'antd/dist/antd.css'
import { DataUserProvider } from './context/UserContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { constants } from './utils/constants'
import FullPageSpinner from './components/FullPageSpinner'

const AuthenticatedApp = React.lazy(() => import(/* webpackPrefetch: true */ './AuthenticatedApp'))
const UnauthenticatedApp = React.lazy(() => import('./UnauthenticatedApp'))

function App(): JSX.Element {
  const token = window.localStorage.getItem(constants.authToken)

  return (
    <Router>
      <DataUserProvider>
        <React.Suspense fallback={<FullPageSpinner />}>
          {token ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </React.Suspense>
      </DataUserProvider>
    </Router>
  )
}

export default App
