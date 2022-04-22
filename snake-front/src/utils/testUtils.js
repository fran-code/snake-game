import { render } from '@testing-library/react'
import { UserDataContext } from '../context/UserContext'
import { BrowserRouter as Router } from 'react-router-dom'

const contextRender = (ui, renderOptions) => {
  const contextProps =  {
    dataUser: {
    _id: 12345,
    email: 'kiko@mail.com',
    username: 'Kiko',
    experience: 100
  }
}
  
  return render(
    <Router>
      <UserDataContext.Provider value={contextProps}>{ui}</UserDataContext.Provider>
    </Router>,
    renderOptions,
  )
}


export default contextRender