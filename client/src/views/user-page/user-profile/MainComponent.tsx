import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserById, UserData } from '@/services/User_Page/user_api'
import UserProfile from './UserProfile'

const MainComponent = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || 'null')
    const loggedUser = auth?.user

    if (!loggedUser?._id) {
      navigate('/login')
      return
    }

    getUserById(loggedUser._id)
      .then(res => setUser(res.user))
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-8 max-w-5xl min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">User Profile</h1>

      <UserProfile user={user} />
    </div>
  )
}

export default MainComponent
