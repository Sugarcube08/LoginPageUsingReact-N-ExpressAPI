import { Route, Routes } from 'react-router-dom'
import Theme from '../components/Theme'
import UserLayout from '../layouts/UserLayout'
import { Home, Login, Signup, Dashboard, UserProfile, UserSettings, Notebooks, Notebook } from '../views'
import AuthLayout from '../layouts/AuthLayout'

const WebRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Theme />} >
        <Route path="/" element={<Home />} />

        <Route path='auth' element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Route>

      <Route path="user" element={<UserLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<UserSettings />} />

        <Route path="notebooks">
          <Route path="" element={<Notebooks />} />
          <Route path=":notebookId" element={<Notebook />} />
        </Route>
      </Route>

    </Routes>
  )
}

export default WebRoutes