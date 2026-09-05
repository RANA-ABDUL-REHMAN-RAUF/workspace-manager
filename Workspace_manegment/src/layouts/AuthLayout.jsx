import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/hooks'
import { loginDestination } from '../constants/routes'

export default function AuthLayout() {
  const { session } = useAuth()
  const location = useLocation()
  return session ? <Navigate to={loginDestination(location.state?.from)} replace /> : <Outlet />
}
